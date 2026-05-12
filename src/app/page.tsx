
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

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const db = useFirestore();

  // Buscar Categorias Reais do Firestore
  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: firestoreCategories } = useCollection<{id: string, name: string}>(categoriesQuery);

  const dynamicCategories = useMemo(() => {
    const base = ['Todos'];
    if (firestoreCategories) {
      return [...base, ...firestoreCategories.map(c => c.name)];
    }
    return base;
  }, [firestoreCategories]);

  // Buscar Destaques ativos
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

  // Buscar Todos os Produtos ordenados por novidade
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
      <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-white">
        <Header />
        
        <main className="flex-1">
          <Hero />
          <PromoBanner />
          
          {/* Highlights Section */}
          <section className="container mx-auto px-4 py-20">
            <div className="text-center mb-16 space-y-4">
              <div className="flex items-center justify-center gap-3 text-caramelo-palha mb-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <Sparkles className="w-5 h-5 fill-caramelo-palha" />
                <span className="text-xs font-body uppercase tracking-[0.4em] font-bold">Favoritos</span>
                <Sparkles className="w-5 h-5 fill-caramelo-palha" />
              </div>
              <h2 className="text-4xl md:text-5xl font-headline text-marrom-terra">Destaques da Casa</h2>
              <p className="text-cinza-organico font-subheadline italic text-xl max-w-2xl mx-auto">
                Os sabores mais emblemáticos da nossa tradição marajoara.
              </p>
              <div className="w-24 h-1 bg-caramelo-palha mx-auto mt-6 rounded-full opacity-60"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {featuredProducts && featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <ProductCard 
                      product={product} 
                      onClick={() => setSelectedProduct(product)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-cinza-organico italic font-subheadline">
                  {productsLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-marrom-terra opacity-20" /> : "Preparando nossas especialidades..."}
                </div>
              )}
            </div>
          </section>

          <ExperienceSection />
          
          <div id="menu" className="relative scroll-mt-24">
            <div className="container mx-auto px-4 pt-20 text-center">
              <h2 className="text-4xl font-headline text-marrom-terra mb-6">Explore Nosso Cardápio</h2>
              <div className="w-16 h-1 bg-caramelo-palha mx-auto rounded-full mb-12"></div>
            </div>
            
            <CategoryFilter 
              activeCategory={activeCategory as any} 
              categories={dynamicCategories as any}
              onSelect={setActiveCategory as any} 
            />

            <section className="container mx-auto px-4 py-16">
              {productsLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-marrom-terra opacity-20" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
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
                  <p className="text-cinza-organico font-subheadline italic text-lg">Nenhum prato encontrado nesta categoria.</p>
                </div>
              )}
            </section>
          </div>

          <WhatsAppCTA />
        </main>

        <footer id="contato" className="bg-grafite-amadeirado text-areia-clara py-24 pb-36 border-t border-marrom-madeira/20">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="space-y-8 col-span-1 lg:col-span-1">
              <div className="space-y-2">
                <h3 className="font-headline text-4xl text-caramelo-palha tracking-widest">PAROARA</h3>
                <p className="text-[10px] uppercase tracking-[0.5em] text-areia-clara/60 font-bold">O verdadeiro restaurante marajoara</p>
              </div>
              <p className="text-sm font-body text-areia-media/80 leading-relaxed max-w-xs italic">
                Um pedaço da Ilha do Marajó no coração de Belém. 
                Ingredientes selecionados e tradição em cada detalhe.
              </p>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-headline text-xl text-caramelo-palha border-b border-marrom-madeira/30 pb-3 inline-block">Menu</h4>
              <nav className="flex flex-col gap-4 text-sm font-body text-areia-media/70">
                <a href="/" className="hover:text-caramelo-palha transition-colors">Página Inicial</a>
                <a href="#menu" className="hover:text-caramelo-palha transition-colors">Nosso Cardápio</a>
                <a href="/admin/login" className="hover:text-caramelo-palha transition-colors font-bold text-caramelo-palha/80">Área Administrativa</a>
              </nav>
            </div>

            <div className="space-y-8 lg:col-span-2">
              <h4 className="font-headline text-xl text-caramelo-palha border-b border-marrom-madeira/30 pb-3 inline-block">Visite-nos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-sm text-areia-media/70">
                  <p className="font-bold text-areia-clara uppercase tracking-widest text-xs">Horário de Funcionamento</p>
                  <p className="leading-relaxed">
                    Terça a Domingo<br />
                    11h às 15h • Almoço<br />
                    18h às 23h30 • Jantar
                  </p>
                </div>
                <div className="space-y-4 text-sm text-areia-media/70">
                  <p className="font-bold text-areia-clara uppercase tracking-widest text-xs">Onde Estamos</p>
                  <p className="leading-relaxed">
                    Av. Gentil Bittencourt, 2231<br />
                    Belém - Pará, Brasil
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-24 pt-10 border-t border-marrom-madeira/10 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-areia-media/40 font-bold">
              © 2026 Paroara Restaurante • Tradição Amazônica • Todos os direitos reservados
            </p>
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
