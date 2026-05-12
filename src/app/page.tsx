
'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Banner } from '@/components/Banner';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { CartTray } from '@/components/CartTray';
import { CartProvider } from '@/context/CartContext';
import { PRODUCTS } from '@/lib/mock-data';
import { Category, Product } from '@/lib/types';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todos') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <Banner />
          
          <div id="menu" className="relative">
            <CategoryFilter 
              activeCategory={activeCategory} 
              onSelect={setActiveCategory} 
            />

            <section className="container mx-auto px-4 py-8 md:py-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-headline text-marrom-terra">
                    {activeCategory}
                  </h2>
                  <div className="w-12 h-1 bg-caramelo-palha mt-1 rounded-full"></div>
                </div>
                <p className="text-sm text-cinza-organico font-subheadline italic">
                  {filteredProducts.length} itens encontrados
                </p>
              </div>

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
        </main>

        <footer className="bg-grafite-amadeirado text-areia-clara py-20 pb-32">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="font-headline text-2xl text-caramelo-palha">PAROARA</h3>
              <p className="text-sm font-body opacity-70 leading-relaxed">
                Um pedaço da Ilha do Marajó no coração de Belém. 
                Ingredientes selecionados e tradição em cada detalhe.
              </p>
              <div className="pt-4 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-marrom-terra flex items-center justify-center border border-caramelo-palha/20">
                  <span className="text-xs">IG</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-marrom-terra flex items-center justify-center border border-caramelo-palha/20">
                  <span className="text-xs">FB</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-headline text-lg text-areia-clara border-b border-marrom-madeira pb-2 inline-block">Localização</h4>
              <p className="text-sm font-body opacity-70">
                Av. Gentil Bittencourt, 2231<br />
                São Brás, Belém - PA<br />
                CEP: 66063-090
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline text-lg text-areia-clara border-b border-marrom-madeira pb-2 inline-block">Horário</h4>
              <p className="text-sm font-body opacity-70">
                Terça a Domingo<br />
                11:00 às 15:00 (Almoço)<br />
                18:00 às 23:30 (Jantar)
              </p>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-16 pt-8 border-t border-marrom-madeira/20 text-center">
            <p className="text-[10px] uppercase tracking-widest opacity-40">
              © 2024 Paroara Restaurante • Todos os direitos reservados
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
