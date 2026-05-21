
'use client';

import React, { useState, useMemo, use } from 'react';
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
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, where, doc } from 'firebase/firestore';
import { Product, RestaurantSlug } from '@/lib/types';
import { Sparkles, Loader2, Flame, Utensils, AlertCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RestaurantHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const restaurantId = slug as RestaurantSlug;
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const db = useFirestore();

  const isEgua = restaurantId === 'egua-na-panela';

  // Buscar Status de Funcionamento
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: settings, loading: settingsLoading } = useDoc<any>(settingsRef);

  const isActive = useMemo(() => {
    if (settingsLoading) return true;
    if (isEgua) return settings?.eguaActive !== false;
    return settings?.paroaraActive !== false;
  }, [settings, isEgua, settingsLoading]);

  const inactiveMessage = useMemo(() => {
    if (isEgua) return settings?.eguaMessage || 'Desculpe! Não estamos em funcionamento hoje.';
    return settings?.paroaraMessage || 'Desculpe! Não estamos em funcionamento hoje.';
  }, [settings, isEgua]);

  const restaurantDisplayName = useMemo(() => {
    if (isEgua) return 'Égua na Panela';
    if (restaurantId === 'paroara') return 'PAROARA';
    return restaurantId.replace('-', ' ');
  }, [restaurantId, isEgua]);

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: allCategoriesRaw, loading: categoriesLoading } = useCollection<any>(categoriesQuery);

  const dynamicCategories = useMemo(() => {
    const base = ['Todos'];
    if (!allCategoriesRaw) return base;
    const filtered = allCategoriesRaw.filter((c: any) => c.restaurantId === restaurantId);
    if (filtered.length > 0) {
      return [...base, ...filtered.map((c: any) => c.name)];
    }
    return [...base, 'Regionais', 'Peixes', 'Grelhados', 'Bebidas'];
  }, [allCategoriesRaw, restaurantId]);

  const featuredQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      where('restaurantId', '==', restaurantId),
      where('featured', '==', true)
    );
  }, [db, restaurantId]);
  const { data: featuredProductsRaw } = useCollection<Product>(featuredQuery);

  const featuredProducts = useMemo(() => {
    if (!featuredProductsRaw) return [];
    return featuredProductsRaw
      .filter(p => p.active !== false)
      .sort((a, b) => a.name.trim().localeCompare(b.name.trim(), 'pt-BR', { sensitivity: 'base' }));
  }, [featuredProductsRaw]);

  const allProductsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('restaurantId', '==', restaurantId)
    );
  }, [db, restaurantId]);
  const { data: allProductsRaw, loading: productsLoading } = useCollection<Product>(allProductsQuery);

  const filteredProducts = useMemo(() => {
    if (!allProductsRaw) return [];
    
    // 1. Filtrar ativos
    let list = allProductsRaw.filter(p => p.active !== false);
    
    // 2. Filtrar por categoria selecionada
    if (activeCategory !== 'Todos') {
      list = list.filter(p => p.category === activeCategory);
    }
    
    // 3. Mapear ordens e nomes das categorias para ordenação robusta
    const catMap: Record<string, { order: number; name: string }> = {};
    if (allCategoriesRaw) {
      allCategoriesRaw
        .filter((c: any) => c.restaurantId === restaurantId)
        .forEach((c: any) => {
          const key = c.name.trim().toLowerCase();
          catMap[key] = {
            order: c.order ?? 999,
            name: c.name.trim()
          };
        });
    }

    // 4. Ordenação Final
    return [...list].sort((a, b) => {
      // Se estivermos na aba "Todos", a prioridade é o agrupamento de categorias
      if (activeCategory === 'Todos') {
        const keyA = a.category.trim().toLowerCase();
        const keyB = b.category.trim().toLowerCase();
        
        const catA = catMap[keyA] || { order: 999, name: a.category.trim() };
        const catB = catMap[keyB] || { order: 999, name: b.category.trim() };
        
        // Primeiro por ordem numérica da categoria
        if (catA.order !== catB.order) return catA.order - catB.order;
        
        // Segundo por nome da categoria (A-Z) para desempate de grupos
        const catNameCmp = catA.name.localeCompare(catB.name, 'pt-BR', { sensitivity: 'base' });
        if (catNameCmp !== 0) return catNameCmp;
      }
      
      // Ordenação Alfabética do Prato (A-Z) - Sempre o critério final
      return a.name.trim().localeCompare(b.name.trim(), 'pt-BR', { sensitivity: 'base' });
    });
  }, [activeCategory, allProductsRaw, allCategoriesRaw, restaurantId]);

  // Se o restaurante estiver inativo, mostra tela de bloqueio
  if (!settingsLoading && !isActive) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col items-center justify-center p-6 text-center",
        isEgua ? "bg-preto-carvao text-white" : "bg-areia-clara text-marrom-terra"
      )}>
        <div className="absolute inset-0 bg-rustic-texture opacity-[0.03] pointer-events-none"></div>
        <div className="max-w-md space-y-8 animate-in zoom-in duration-500">
          <div className={cn(
            "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6",
            isEgua ? "bg-fogo-vibrante/20" : "bg-marrom-terra/10"
          )}>
            <AlertCircle className={cn("w-10 h-10", isEgua ? "text-fogo-vibrante" : "text-marrom-terra")} />
          </div>
          <h1 className="text-4xl font-headline uppercase tracking-widest">{restaurantDisplayName}</h1>
          <div className={cn("p-8 rounded-3xl border shadow-2xl", isEgua ? "bg-black/40 border-white/10" : "bg-white border-areia-escura/30")}>
            <p className="text-xl font-subheadline italic mb-8">{inactiveMessage}</p>
            <Link href="/">
              <Button className={cn(
                "w-full gap-3 font-black uppercase tracking-widest text-xs h-14 rounded-xl",
                isEgua ? "bg-fogo-vibrante text-white" : "bg-marrom-terra text-white"
              )}>
                <Home className="w-4 h-4" />
                Voltar para o Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className={cn(
        "min-h-screen flex flex-col transition-colors duration-700",
        isEgua ? "bg-preto-carvao text-creme-suave" : "bg-background text-foreground"
      )}>
        <Header />
        
        <main className="flex-1">
          <Hero />
          
          <PromoBanner onProductClick={(p) => setSelectedProduct(p)} />
          
          <section className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-12 md:mb-20 space-y-4">
              <div className="flex items-center justify-center gap-2">
                {isEgua ? (
                  <>
                    <Utensils className="w-5 h-5 text-fogo-vibrante" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-fogo-vibrante">Recomendados</span>
                    <Utensils className="w-5 h-5 text-fogo-vibrante" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-caramelo-palha" />
                    <span className="text-[10px] font-body uppercase tracking-[0.3em] font-bold text-marrom-terra">Favoritos da Casa</span>
                    <Sparkles className="w-4 h-4 text-caramelo-palha" />
                  </>
                )}
              </div>
              <h2 className={cn(
                "text-4xl md:text-6xl tracking-tight",
                isEgua ? "text-white font-subheadline font-bold italic" : "text-marrom-terra font-headline"
              )}>
                Destaques {isEgua ? 'da Cozinha' : 'da Ilha'}
              </h2>
              <div className={cn(
                "w-24 h-1 mx-auto rounded-full",
                isEgua ? "bg-fogo-vibrante shadow-[0_0_15px_rgba(255,165,0,0.5)]" : "bg-marrom-terra opacity-20"
              )}></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product} 
                    onClick={() => setSelectedProduct(product)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-10 opacity-40 italic">
                  {productsLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Nenhum destaque configurado."}
                </div>
              )}
            </div>
          </section>

          <ExperienceSection />
          
          <div id="menu" className="relative scroll-mt-[80px] md:scroll-mt-[100px]">
            <div className="container mx-auto px-4 pt-16 md:pt-24 text-center">
              <h2 className={cn(
                "text-4xl md:text-5xl mb-10 md:mb-16",
                isEgua ? "text-white font-subheadline font-bold italic" : "text-marrom-terra font-headline"
              )}>
                Nosso Cardápio
              </h2>
            </div>
            
            <CategoryFilter 
              activeCategory={activeCategory as any} 
              categories={dynamicCategories}
              onSelect={setActiveCategory as any} 
            />

            <section className="container mx-auto px-4 py-12 md:py-20 min-h-[400px]">
              {productsLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-fogo-vibrante opacity-40" />
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
                <div className={cn(
                  "text-center py-24 rounded-3xl border border-dashed",
                  isEgua ? "bg-preto-panela/50 border-white/10" : "bg-areia-media/10 border-areia-escura/40"
                )}>
                  <p className="text-sm opacity-60 italic">Nenhum prato nesta categoria.</p>
                </div>
              )}
            </section>
          </div>

          <WhatsAppCTA />
        </main>

        <footer id="contato" className={cn(
          "py-20 md:py-32 pb-40 transition-colors duration-500 border-t",
          isEgua 
            ? "bg-black text-creme-suave border-fogo-vibrante/20" 
            : "bg-areia-clara text-marrom-texto border-areia-escura/30 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]"
        )}>
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 text-center md:text-left">
              <h3 className={cn(
                "text-4xl uppercase tracking-tighter",
                isEgua ? "text-fogo-vibrante font-subheadline font-bold italic" : "text-marrom-terra font-headline"
              )}>
                {restaurantDisplayName}
              </h3>
              <p className={cn(
                "text-sm italic max-w-xs mx-auto md:mx-0 leading-relaxed",
                isEgua ? "opacity-60 text-creme-suave" : "text-marrom-madeira font-medium"
              )}>
                {isEgua ? 'Sabor que conquista em cada detalhe. O melhor da culinária regional paraense.' : 'Sabor e tradição marajoara servidos com elegância.'}
              </p>
            </div>
            <nav className="flex flex-col items-center md:items-start gap-4">
              <h4 className={cn(
                "font-headline text-xl mb-2",
                isEgua ? "text-white" : "text-marrom-terra"
              )}>Explorar</h4>
              <button 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
                className={cn(
                  "text-sm transition-colors uppercase tracking-widest font-bold",
                  isEgua ? "text-creme-suave/80 hover:text-fogo-vibrante" : "text-marrom-madeira hover:text-marrom-terra"
                )}
              >
                Início
              </button>
              <button 
                onClick={() => document.getElementById('menu')?.scrollIntoView({behavior: 'smooth'})} 
                className={cn(
                  "text-sm transition-colors uppercase tracking-widest font-bold",
                  isEgua ? "text-creme-suave/80 hover:text-fogo-vibrante" : "text-marrom-madeira hover:text-marrom-terra"
                )}
              >
                Cardápio
              </button>
            </nav>
            <div className={cn(
              "space-y-4 text-sm text-center md:text-left",
              isEgua ? "text-creme-suave/80" : "text-marrom-madeira"
            )}>
              <h4 className={cn(
                "font-headline text-xl mb-2",
                isEgua ? "text-white" : "text-marrom-terra"
              )}>Localização</h4>
              <p className="font-medium">Mercado Municipal - Francisco Bolonha - Complexo do Ver-o-Peso</p>
              <p className="font-medium">Domingo a domingo 9h às 23:30h</p>
            </div>
          </div>
          <div className={cn(
            "container mx-auto px-4 mt-20 pt-8 border-t text-center",
            isEgua ? "border-white/5" : "border-areia-escura/30"
          )}>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.5em]",
              isEgua ? "opacity-20" : "text-marrom-madeira/40"
            )}>
              © 2024 {restaurantDisplayName} • Todos os direitos reservados
            </p>
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
