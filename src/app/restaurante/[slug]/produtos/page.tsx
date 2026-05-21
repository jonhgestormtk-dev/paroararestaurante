
'use client';

import React, { useState, useMemo, use } from 'react';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { CartTray } from '@/components/CartTray';
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton';
import { CartProvider } from '@/context/CartContext';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Product, RestaurantSlug } from '@/lib/types';
import { Search, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function RestaurantMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const restaurantId = slug as RestaurantSlug;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [priceRange, setPriceRange] = useState([0, 250]);
  const [sortBy, setSortBy] = useState<string>('az'); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const db = useFirestore();

  // Consultar todas as categorias para mapear ordens
  const catQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: allCategoriesRaw } = useCollection<any>(catQuery);

  const categories = useMemo(() => {
    const base = ['Todos'];
    if (!allCategoriesRaw) return base;
    const filtered = allCategoriesRaw.filter((c: any) => c.restaurantId === restaurantId);
    return [...base, ...filtered.map((c: any) => c.name)];
  }, [allCategoriesRaw, restaurantId]);

  // Consultar produtos do restaurante
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      where('restaurantId', '==', restaurantId)
    );
  }, [db, restaurantId]);

  const { data: allProducts, loading } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    let list = [...allProducts].filter(p => p.active !== false);

    // Filtros de Busca e Categoria
    list = list.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Mapeamento de Ordem das Categorias
    const catMap: Record<string, { order: number; name: string }> = {};
    if (allCategoriesRaw) {
      allCategoriesRaw
        .filter((c: any) => c.restaurantId === restaurantId)
        .forEach((c: any) => {
          const key = c.name.trim().toLowerCase();
          catMap[key] = { order: c.order ?? 999, name: c.name.trim() };
        });
    }
    
    return list.sort((a, b) => {
      // 1. Lógica de Ordenação Especial (Preço ou Popularidade)
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      
      // 2. Lógica de Ordenação Padrão (A-Z respeitando categorias no "Todos")
      if (activeCategory === 'Todos') {
        const keyA = a.category.trim().toLowerCase();
        const keyB = b.category.trim().toLowerCase();
        const catA = catMap[keyA] || { order: 999, name: a.category.trim() };
        const catB = catMap[keyB] || { order: 999, name: b.category.trim() };
        
        if (catA.order !== catB.order) return catA.order - catB.order;
        const catNameCmp = catA.name.localeCompare(catB.name, 'pt-BR', { sensitivity: 'base' });
        if (catNameCmp !== 0) return catNameCmp;
      }

      // 3. Ordenação Alfabética do Nome (A-Z)
      return a.name.trim().localeCompare(b.name.trim(), 'pt-BR', { sensitivity: 'base' });
    });
  }, [allProducts, searchTerm, activeCategory, priceRange, sortBy, allCategoriesRaw, restaurantId]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 pt-20">
          <section className="bg-areia-clara py-12 border-b border-areia-escura/30 relative">
            <div className="container mx-auto px-4 text-center space-y-4">
              <Badge variant="outline" className="border-marrom-madeira/30 text-marrom-madeira font-bold tracking-widest uppercase text-[9px] px-3 py-1">
                {restaurantId.replace('-', ' ')}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-headline text-marrom-terra">Cardápio Completo</h1>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="hidden lg:block w-64 space-y-8 sticky top-24 h-fit">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
                  <Input 
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-marrom-madeira">Categorias</p>
                  <div className="flex flex-col gap-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={cn(
                          "px-3 py-2 text-sm rounded-sm text-left transition-colors",
                          activeCategory === cat ? "bg-marrom-terra text-white" : "hover:bg-areia-media/30"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="flex-1">
                <div className="mb-6 flex justify-between items-center lg:hidden">
                   <p className="text-xs font-bold text-marrom-madeira uppercase tracking-widest">{activeCategory}</p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin opacity-20" /></div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 italic text-cinza-organico">Nenhum prato encontrado.</div>
                )}
              </div>
            </div>
          </div>
        </main>

        <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
        <CartTray />
        <FloatingWhatsAppButton />
      </div>
    </CartProvider>
  );
}
