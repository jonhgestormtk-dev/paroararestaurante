
'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { CartTray } from '@/components/CartTray';
import { CartProvider } from '@/context/CartContext';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Product, Category } from '@/lib/types';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  LayoutGrid, 
  SlidersHorizontal,
  ArrowUpDown,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORIES: Category[] = [
  'Todos', 'Promoções', 'Regionais', 'Peixes', 'Carnes', 
  'Grelhados', 'Executivos', 'Massas', 'Bebidas', 'Sobremesas'
];

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'popular' | 'az';

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const db = useFirestore();
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: allProducts, loading } = useCollection<Product>(productsQuery);

  // Lógica de filtragem REAL do Firestore
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    return allProducts
      .filter(p => {
        const isActive = p.active !== false; // Apenas produtos ativos
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
        const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
        
        return isActive && matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'az') return a.name.localeCompare(b.name);
        if (sortBy === 'popular') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return 0;
      });
  }, [allProducts, searchTerm, activeCategory, priceRange, sortBy]);

  // Lógica de Paginação
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory('Todos');
    setPriceRange([0, 200]);
    setSortBy('relevance');
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 pt-24 md:pt-24">
          {/* Hero Interno */}
          <section className="bg-areia-clara py-16 md:py-24 border-b border-areia-escura/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-rustic-texture opacity-[0.03] pointer-events-none"></div>
            <div className="container mx-auto px-4 relative z-10 text-center space-y-4">
              <Badge variant="outline" className="border-marrom-madeira/30 text-marrom-madeira font-bold tracking-widest uppercase text-[10px] px-4 py-1">
                Sabores da Amazônia
              </Badge>
              <h1 className="text-4xl md:text-6xl font-headline text-marrom-terra tracking-tight">Nosso Cardápio</h1>
              <p className="text-cinza-organico font-subheadline italic text-lg md:text-xl max-w-2xl mx-auto opacity-80">
                Explore pratos regionais preparados com autenticidade, ingredientes frescos e tradição marajoara.
              </p>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-72 space-y-10 sticky top-32 h-fit">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-xl text-marrom-terra">Filtros</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-cinza-organico hover:text-marrom-terra uppercase tracking-tighter">
                      Limpar
                    </Button>
                  </div>

                  {/* Busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
                    <Input 
                      placeholder="Buscar pratos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-areia-escura/50 focus:ring-marrom-terra rounded-sm"
                    />
                  </div>

                  {/* Categorias */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira/60">Categorias</p>
                    <div className="flex flex-col gap-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-sm rounded-sm transition-all text-left",
                            activeCategory === cat 
                              ? "bg-marrom-terra text-white font-bold" 
                              : "text-marrom-texto hover:bg-areia-media/30"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira/60">Preço</p>
                    <Slider 
                      value={priceRange} 
                      onValueChange={setPriceRange} 
                      max={250} 
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs font-bold text-marrom-terra">
                      <span>R$ {priceRange[0]}</span>
                      <span>R$ {priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Mobile Filter Trigger */}
              <div className="lg:hidden flex gap-3 mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2 border-areia-escura text-marrom-terra">
                      <Filter className="w-4 h-4" />
                      Filtrar e Buscar
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="h-[90vh] bg-areia-clara p-0 overflow-y-auto">
                    <SheetHeader className="p-6 bg-marrom-escuro text-areia-clara">
                      <SheetTitle className="text-areia-clara font-headline">Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="p-6 space-y-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-marrom-madeira">Busca</label>
                        <Input 
                          placeholder="Ex: Filé Marajoara..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white border-areia-escura"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-marrom-madeira">Categorias</label>
                        <div className="grid grid-cols-2 gap-2">
                          {CATEGORIES.map((cat) => (
                            <Button
                              key={cat}
                              variant={activeCategory === cat ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActiveCategory(cat)}
                              className={cn(
                                "justify-start text-xs rounded-sm",
                                activeCategory === cat ? "bg-marrom-terra" : "border-areia-escura"
                              )}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-xs font-bold uppercase tracking-widest text-marrom-madeira">Preço (R$ {priceRange[0]} - R$ {priceRange[1]})</label>
                        <Slider 
                          value={priceRange} 
                          onValueChange={setPriceRange} 
                          max={250} 
                          step={1}
                        />
                      </div>
                      <Button className="w-full bg-marrom-terra text-white py-6" onClick={() => document.querySelector('[data-radix-collection-item]')?.click()}>
                        Ver Resultados
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="flex-1 border-areia-escura text-marrom-terra">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4" />
                      <SelectValue placeholder="Ordenar" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-areia-clara border-areia-escura">
                    <SelectItem value="relevance">Relevância</SelectItem>
                    <SelectItem value="price-asc">Menor Preço</SelectItem>
                    <SelectItem value="price-desc">Maior Preço</SelectItem>
                    <SelectItem value="popular">Mais Pedidos</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 space-y-8">
                {/* Desktop Top Bar */}
                <div className="hidden lg:flex items-center justify-between pb-6 border-b border-areia-escura/20">
                  <p className="text-cinza-organico text-sm italic">
                    Mostrando <span className="text-marrom-terra font-bold">{filteredProducts.length}</span> pratos selecionados
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                      <SelectTrigger className="w-[180px] bg-white border-areia-escura/50 text-marrom-terra text-xs font-bold uppercase tracking-widest">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent className="bg-areia-clara border-areia-escura">
                        <SelectItem value="relevance">Relevância</SelectItem>
                        <SelectItem value="price-asc">Menor Preço</SelectItem>
                        <SelectItem value="price-desc">Maior Preço</SelectItem>
                        <SelectItem value="popular">Destaques</SelectItem>
                        <SelectItem value="az">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                  {loading ? (
                    Array(8).fill(0).map((_, i) => (
                      <div key={i} className="aspect-[4/6] bg-areia-media/10 animate-pulse rounded-lg border border-areia-escura/20"></div>
                    ))
                  ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onClick={() => setSelectedProduct(product)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-32 text-center space-y-4 bg-areia-media/5 rounded-2xl border border-dashed border-areia-escura/30">
                      <p className="text-xl font-headline text-marrom-madeira">Nenhum sabor encontrado</p>
                      <p className="text-cinza-organico font-subheadline italic">Tente ajustar seus filtros ou busca.</p>
                      <Button variant="link" onClick={clearFilters} className="text-marrom-terra font-bold uppercase tracking-widest text-xs">
                        Limpar todos os filtros
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-12 pb-20">
                    <Button 
                      variant="outline" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="border-areia-escura text-marrom-terra"
                    >
                      Anterior
                    </Button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(i + 1)}
                          className={cn(
                            "w-10 h-10 p-0",
                            currentPage === i + 1 ? "bg-marrom-terra" : "border-areia-escura"
                          )}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="border-areia-escura text-marrom-terra"
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-grafite-amadeirado text-areia-clara py-20 border-t border-marrom-madeira/20">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h3 className="font-headline text-3xl text-caramelo-palha">PAROARA</h3>
            <p className="text-xs uppercase tracking-[0.4em] opacity-50 font-bold">Tradição Marajoara em Cada Detalhe</p>
            <div className="flex justify-center gap-8 text-sm font-bold uppercase tracking-widest text-areia-media">
              <a href="/" className="hover:text-caramelo-palha">Home</a>
              <a href="#menu" className="hover:text-caramelo-palha">Cardápio</a>
              <a href="#" className="hover:text-caramelo-palha">Contato</a>
            </div>
          </div>
        </footer>

        <ProductModal 
          product={selectedProduct} 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />

        <CartTray />
      </div>
    </CartProvider>
  );
}
