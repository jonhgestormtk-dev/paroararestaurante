
'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PromoBanner } from '@/components/PromoBanner';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { ExperienceSection } from '@/components/ExperienceSection';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { CartTray } from '@/components/CartTray';
import { CartProvider } from '@/context/CartContext';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Product, Category } from '@/lib/types';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const db = useFirestore();

  // Buscar Categorias dinâmicas
  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: firestoreCategories } = useCollection<{id: string, name: string}>(categoriesQuery);

  const dynamicCategories = useMemo(() => {
    const base = ['Todos'];
    if (firestoreCategories && firestoreCategories.length > 0) {
      return [...base, ...firestoreCategories.map(c => c.name)];
    }
    return [...base, 'Regionais', 'Peixes', 'Grelhados', 'Executivos', 'Bebidas'];
  }, [firestoreCategories]);

  // Buscar Destaques
  const featuredQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      where('featured', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, [db]);
  const { data: featuredProductsRaw } = useCollection<Product>(featuredQuery);

  const featuredProducts = useMemo(() => {
    if (!featuredProductsRaw) return [];
    return featuredProductsRaw.filter(p => p.active !== false);
  }, [featuredProductsRaw]);

  // Buscar Todos os Produtos
  const allProductsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: allProductsRaw, loading: productsLoading } = useCollection<Product>(allProductsQuery);

  const filteredProducts = useMemo(() => {
    if (!allProductsRaw) return [];
    const activeOnly = allProductsRaw.filter(p => p.active !== false);
    if (activeCategory === 'Todos') return activeOnly;
    return activeOnly.filter(p => p.category === activeCategory);
  }, [activeCategory, allProductsRaw]);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <Hero />
          <PromoBanner />
          
          {/* Highlights Section */}
          <section className="container mx-auto px-4 py-20">
            <div className="text-center mb-16 space-y-4">
              <div className="flex items-center justify-center gap-3 text-caramelo-palha mb-2">
                <Sparkles className="w-5 h-5 fill-caramelo-palha" />
                <span className="text-xs font-body uppercase tracking-[0.4em] font-bold">Favoritos</span>
                <Sparkles className="w-5 h-5 fill-caramelo-palha" />
              </div>
              <h2 className="text-4xl md:text-5xl font-headline text-marrom-terra">Destaques da Casa</h2>
              <div className="w-24 h-1 bg-caramelo-palha mx-auto mt-6 rounded-full opacity-60"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product} 
                    onClick={() => setSelectedProduct(product)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-cinza-organico italic">
                  {productsLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /> : "Preparando destaques..."}
                </div>
              )}
            </div>
          </section>

          <ExperienceSection />
          
          <div id="menu" className="relative scroll-mt-24">
            <div className="container mx-auto px-4 pt-20 text-center">
              <h2 className="text-4xl font-headline text-marrom-terra mb-12">Nosso Cardápio</h2>
            </div>
            
            <CategoryFilter 
              activeCategory={activeCategory as any} 
              categories={dynamicCategories}
              onSelect={setActiveCategory as any} 
            />

            <section className="container mx-auto px-4 py-16">
              {productsLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-marrom-terra opacity-20" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-areia-media/10 rounded-2xl border border-dashed border-areia-escura/40">
                  <p className="text-cinza-organico italic">Nenhum prato nesta categoria.</p>
                </div>
              )}
            </section>
          </div>

          <WhatsAppCTA />
        </main>

        <footer id="contato" className="bg-grafite-amadeirado text-areia-clara py-24 pb-36">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-4">
              <h3 className="font-headline text-4xl text-caramelo-palha">PAROARA</h3>
              <p className="text-sm italic opacity-80">O verdadeiro restaurante marajoara no coração de Belém.</p>
            </div>
            <nav className="flex flex-col gap-4 text-sm">
              <h4 className="font-headline text-xl text-caramelo-palha mb-2">Menu</h4>
              <Link href="/" className="hover:text-caramelo-palha">Home</Link>
              <Link href="#menu" className="hover:text-caramelo-palha">Cardápio</Link>
              <Link href="/admin/login" className="text-caramelo-palha/60">Admin</Link>
            </nav>
            <div className="space-y-4 text-sm">
              <h4 className="font-headline text-xl text-caramelo-palha mb-2">Visite-nos</h4>
              <p>Av. Gentil Bittencourt, 2231 - Belém/PA</p>
              <p>Terça a Domingo: 11h às 15h e 18h às 23h30</p>
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
