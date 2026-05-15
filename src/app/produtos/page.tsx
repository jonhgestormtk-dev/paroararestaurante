'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { CartTray } from '@/components/CartTray';
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton';
import { CartProvider } from '@/context/CartContext';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/lib/types';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  Loader2
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

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'popular' | 'az';

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [priceRange, setPriceRange] = useState([0, 250]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const db = useFirestore();

  // Buscar Categorias Reais do Firestore
  const catQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: firestoreCategories } = useCollection<{id: string, name: string}>(catQuery);

  const categories = useMemo(() => {
    const base = ['Todos'];
    if (firestoreCategories) return [...base, ...firestoreCategories.map(c => c.name)];
    return [...base, 'Promoções', 'Regionais', 'Peixes', 'Carnes', 'Grelhados', 'Executivos', 'Massas', 'Bebidas', 'Sobremesas'];
  }, [firestoreCategories]);

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: allProducts, loading } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    return allProducts
      .filter(p => {
        const isActive = p.active !== false;
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

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory('Todos');
    setPriceRange([0, 250]);
    setSortBy('relevance');
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 pt-20 md:pt-24">
          <section className="bg-areia-clara py-12 md:py-20 border-b border-areia-escura/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-rustic-texture opacity-[0.03] pointer-events-none"></div>
            <div className="container mx-auto px-4 relative z-10 text-center space-y-4">
              <Badge variant="outline" className="border-marrom-madeira/30 text-marrom-madeira font-bold tracking-widest uppercase text-[9px] px-3 py-1">
                Sabores da Amazônia
              </Badge>
              <h1 className="text-3xl md:text-6xl font-headline text-marrom-terra tracking-tight">Nosso Cardápio</h1>
              <p className="text-cinza-organico font-subheadline italic text-base md:text-xl max-w-2xl mx-auto opacity-80">
                Explore pratos regionais preparados com autenticidade, ingredientes frescos e tradição marajoara.
              </p>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col lg:flex-row gap-8">
              
              <aside className="hidden lg:block w-72 space-y-10 sticky top-32 h-fit">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-xl text-marrom-terra">Filtros</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-cinza-organico hover:text-marrom-terra uppercase tracking-tighter">
                      Limpar
                    </Button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
                    <Input 
                      placeholder="Buscar pratos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-areia-escura/50 focus:ring-marrom-terra rounded-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira/60">Categorias</p>
                    <div className="flex flex-col gap-1">
                      {categories.map((cat) => (
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

              <div className="lg:hidden flex gap-3 mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2 border-areia-escura text-marrom-terra h-12">
                      <Filter className="w-4 h-4" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] bg-areia-clara p-0 overflow-y-auto rounded-t-3xl">
                    <SheetHeader className="p-6 bg-marrom-escuro text-areia-clara">
                      <SheetTitle className="text-areia-clara font-headline uppercase tracking-widest">Ajustar Busca</SheetTitle>
                    </SheetHeader>
                    <div className="p-6 space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Palavra-chave</label>
                        <Input 
                          placeholder="Ex: Filé Marajoara..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white border-areia-escura h-12"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Categorias</label>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((cat) => (
                            <Button
                              key={cat}
                              variant={activeCategory === cat ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActiveCategory(cat)}
                              className={cn(
                                "justify-center text-[10px] font-bold uppercase tracking-wider h-10 rounded-full",
                                activeCategory === cat ? "bg-marrom-terra" : "border-areia-escura"
                              )}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Preço Máximo (R$ {priceRange[1]})</label>
                        <Slider 
                          value={priceRange} 
                          onValueChange={setPriceRange} 
                          max={250} 
                          step={1}
                        />
                      </div>
                      <Button onClick={clearFilters} variant="ghost" className="w-full text-marrom-terra font-black uppercase tracking-widest text-[10px]">
                        Limpar Todos
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="flex-1 border-areia-escura text-marrom-terra h-12">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4" />
                      <SelectValue placeholder="Ordenar" />
                    </div>
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

              <div className="flex-1 space-y-8">
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
                  {loading ? (
                    Array(8).fill(0).map((_, i) => (
                      <div key={i} className="aspect-[4/5] bg-areia-media/10 animate-pulse rounded-lg border border-areia-escura/20"></div>
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

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-12 pb-24">
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

        <ProductModal 
          product={selectedProduct} 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />

        <CartTray />
        <FloatingWhatsAppButton />
      </div>
    </CartProvider>
  );
}
