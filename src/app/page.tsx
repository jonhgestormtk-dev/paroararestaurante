'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PromoBanner } from '@/components/PromoBanner';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { ExperienceSection } from '@/components/ExperienceSection';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { CartTray } from '@/components/CartTray';
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton';
import { CartProvider } from '@/context/CartContext';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { PRODUCTS, CATEGORIES } from '@/lib/mock-data';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const db = useFirestore();
  const { toast } = useToast();

  // Buscar categorias ordenadas
  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: firestoreCategories, loading: categoriesLoading } = useCollection<{id: string, name: string}>(categoriesQuery);

  const dynamicCategories = useMemo(() => {
    const base = ['Todos'];
    if (firestoreCategories && firestoreCategories.length > 0) {
      return [...base, ...firestoreCategories.map(c => c.name)];
    }
    return [...base, 'Regionais', 'Peixes', 'Grelhados', 'Executivos', 'Bebidas'];
  }, [firestoreCategories]);

  // Buscar produtos em destaque
  const featuredQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      where('featured', '==', true)
    );
  }, [db]);
  const { data: featuredProductsRaw } = useCollection<Product>(featuredQuery);

  const featuredProducts = useMemo(() => {
    if (!featuredProductsRaw) return [];
    return featuredProductsRaw.filter(p => p.active !== false);
  }, [featuredProductsRaw]);

  // Buscar todos os produtos
  const allProductsQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);
  const { data: allProductsRaw, loading: productsLoading } = useCollection<Product>(allProductsQuery);

  // Lógica de Auto-Seed
  useEffect(() => {
    const autoSeed = async () => {
      if (!db || productsLoading || categoriesLoading) return;
      
      if ((!allProductsRaw || allProductsRaw.length === 0) && (!firestoreCategories || firestoreCategories.length === 0)) {
        const batch = writeBatch(db);
        
        const validCategories = CATEGORIES.filter(c => c !== 'Todos' && c !== 'Promoções');
        validCategories.forEach((catName, index) => {
          const catId = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
          const catRef = doc(db, 'categories', catId);
          batch.set(catRef, {
            name: catName,
            active: true,
            order: index * 10,
            createdAt: serverTimestamp()
          });
        });

        PRODUCTS.forEach((product) => {
          const productRef = doc(db, 'products', product.id);
          const { id, ...productData } = product;
          batch.set(productRef, {
            ...productData,
            active: true,
            createdAt: serverTimestamp()
          });
        });

        try {
          await batch.commit();
          toast({ title: "Cardápio Sincronizado", description: "Os pratos tradicionais foram carregados." });
        } catch (e) {
          console.error('Erro ao sincronizar banco:', e);
        }
      }
    };

    autoSeed();
  }, [allProductsRaw, firestoreCategories, productsLoading, categoriesLoading, db, toast]);

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
          
          <PromoBanner onProductClick={(p) => setSelectedProduct(p)} />
          
          <section className="container mx-auto px-4 py-8 md:py-16">
            <div className="text-center mb-10 md:mb-16 space-y-3">
              <div className="flex items-center justify-center gap-2 text-caramelo-palha">
                <Sparkles className="w-4 h-4 fill-caramelo-palha" />
                <span className="text-[10px] font-body uppercase tracking-[0.3em] font-bold">Favoritos</span>
                <Sparkles className="w-4 h-4 fill-caramelo-palha" />
              </div>
              <h2 className="text-3xl md:text-5xl font-headline text-marrom-terra">Destaques da Casa</h2>
              <div className="w-20 h-0.5 bg-caramelo-palha mx-auto rounded-full opacity-40"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
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
                  {productsLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-20" /> : "Preparando destaques..."}
                </div>
              )}
            </div>
          </section>

          <ExperienceSection />
          
          <div id="menu" className="relative scroll-mt-[80px] md:scroll-mt-[100px]">
            <div className="container mx-auto px-4 pt-12 md:pt-20 text-center">
              <h2 className="text-3xl md:text-4xl font-headline text-marrom-terra mb-8 md:mb-12">Nosso Cardápio</h2>
            </div>
            
            <CategoryFilter 
              activeCategory={activeCategory as any} 
              categories={dynamicCategories}
              onSelect={setActiveCategory as any} 
            />

            <section className="container mx-auto px-4 py-8 md:py-16">
              {productsLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-marrom-terra opacity-20" />
                </div>
              ) : filteredProducts.length > 0 ? (
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
                <div className="text-center py-20 bg-areia-media/10 rounded-xl border border-dashed border-areia-escura/40">
                  <p className="text-sm text-cinza-organico italic">Nenhum prato nesta categoria.</p>
                </div>
              )}
            </section>
          </div>

          <WhatsAppCTA />
        </main>

        <footer id="contato" className="bg-grafite-amadeirado text-areia-clara py-16 md:py-24 pb-32">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="font-headline text-3xl md:text-4xl text-caramelo-palha">PAROARA</h3>
              <p className="text-xs md:text-sm italic opacity-80">O verdadeiro restaurante marajoara no coração de Belém.</p>
            </div>
            <nav className="flex flex-col items-center md:items-start gap-3 text-xs md:text-sm">
              <h4 className="font-headline text-lg md:text-xl text-caramelo-palha mb-2">Menu</h4>
              <Link href="/" className="hover:text-caramelo-palha transition-colors">Home</Link>
              <Link href="/produtos" className="hover:text-caramelo-palha transition-colors">Cardápio</Link>
              <Link href="/admin/login" className="text-caramelo-palha/60 hover:text-caramelo-palha transition-colors">Admin</Link>
            </nav>
            <div className="space-y-3 text-xs md:text-sm text-center md:text-left">
              <h4 className="font-headline text-lg md:text-xl text-caramelo-palha mb-2">Visite-nos</h4>
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
        <FloatingWhatsAppButton />
      </div>
    </CartProvider>
  );
}
