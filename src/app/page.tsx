
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
import { PRODUCTS } from '@/lib/mock-data';
import { Category, Product } from '@/lib/types';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todos') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const featuredProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.featured);
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <Hero />
          <PromoBanner />
          
          {/* Highlights Section */}
          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-12 space-y-2">
              <div className="flex items-center justify-center gap-2 text-caramelo-palha mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-body uppercase tracking-[0.3em] font-bold">Favoritos</span>
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-4xl font-headline text-marrom-terra">Destaques da Casa</h2>
              <p className="text-cinza-organico font-subheadline italic text-lg">Os sabores mais pedidos do Paroara</p>
              <div className="w-24 h-1 bg-caramelo-palha mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <ProductCard 
                    product={product} 
                    onClick={() => setSelectedProduct(product)}
                  />
                </div>
              ))}
            </div>
          </section>

          <ExperienceSection />
          
          <div id="menu" className="relative scroll-mt-20">
            <div className="container mx-auto px-4 pt-16 text-center">
              <h2 className="text-4xl font-headline text-marrom-terra mb-4">Explore Nosso Cardápio</h2>
              <div className="w-16 h-1 bg-caramelo-palha mx-auto rounded-full mb-8"></div>
            </div>
            
            <CategoryFilter 
              activeCategory={activeCategory} 
              onSelect={setActiveCategory} 
            />

            <section className="container mx-auto px-4 py-12">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-areia-media/20 rounded-lg border border-dashed border-areia-escura">
                  <p className="text-cinza-organico font-subheadline italic">Em breve mais delícias nesta categoria.</p>
                </div>
              )}
            </section>
          </div>

          <WhatsAppCTA />
        </main>

        <footer id="contato" className="bg-grafite-amadeirado text-areia-clara py-20 pb-32">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-headline text-3xl text-caramelo-palha">PAROARA</h3>
                <p className="text-xs uppercase tracking-widest opacity-60">O verdadeiro restaurante marajoara</p>
              </div>
              <p className="text-sm font-body opacity-70 leading-relaxed max-w-xs">
                Um pedaço da Ilha do Marajó no coração de Belém. 
                Ingredientes selecionados e tradição em cada detalhe da nossa culinária.
              </p>
              <div className="pt-4 flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-marrom-terra flex items-center justify-center border border-caramelo-palha/20 hover:bg-caramelo-palha hover:text-marrom-escuro transition-all shadow-lg">
                  <span className="text-xs font-bold">IG</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-marrom-terra flex items-center justify-center border border-caramelo-palha/20 hover:bg-caramelo-palha hover:text-marrom-escuro transition-all shadow-lg">
                  <span className="text-xs font-bold">WA</span>
                </a>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-headline text-xl text-caramelo-palha border-b border-marrom-madeira/50 pb-2 inline-block">Navegação</h4>
              <nav className="flex flex-col gap-3 text-sm font-body opacity-70">
                <a href="#" className="hover:text-caramelo-palha transition-colors">Home</a>
                <a href="#menu" className="hover:text-caramelo-palha transition-colors">Cardápio</a>
                <a href="#" className="hover:text-caramelo-palha transition-colors">Promoções</a>
                <a href="#" className="hover:text-caramelo-palha transition-colors">Admin</a>
              </nav>
            </div>

            <div className="space-y-6">
              <h4 className="font-headline text-xl text-caramelo-palha border-b border-marrom-madeira/50 pb-2 inline-block">Horário & Local</h4>
              <div className="space-y-4 opacity-70 text-sm">
                <p>
                  Terça a Domingo<br />
                  11:00 às 15:00 • 18:00 às 23:30
                </p>
                <p>
                  Av. Gentil Bittencourt, 2231<br />
                  Belém - PA
                </p>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-20 pt-8 border-t border-marrom-madeira/20 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">
              © 2026 Paroara Restaurante • Todos os direitos reservados
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
