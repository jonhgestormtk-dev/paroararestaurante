
'use client';

import React, { useMemo } from 'react';
import { Flame, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Product } from '@/lib/types';

interface PromoBannerProps {
  onProductClick?: (product: Product) => void;
}

export function PromoBanner({ onProductClick }: PromoBannerProps) {
  const db = useFirestore();
  
  // Buscar o ID do produto promocional das configurações
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: settings } = useDoc<any>(settingsRef);
  
  const promoProductId = settings?.promoProductId;

  // Buscar detalhes do produto promocional
  const productRef = useMemo(() => 
    (db && promoProductId && promoProductId !== 'none') ? doc(db, 'products', promoProductId) : null
  , [db, promoProductId]);
  const { data: promoProduct, loading: productLoading } = useDoc<Product>(productRef);

  // Se não houver promoção configurada ou for 'none', não exibe o banner
  if (!promoProductId || promoProductId === 'none') return null;

  return (
    <section className="container mx-auto px-4 -mt-6 md:-mt-12 relative z-30">
      <div className="relative overflow-hidden bg-marrom-terra rounded-xl p-6 md:p-10 border border-caramelo-palha/30 shadow-[0_20px_50px_rgba(40,26,20,0.3)] flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-rustic-texture opacity-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 z-10 text-center md:text-left flex-1">
          <div className="relative flex-shrink-0">
            <div className="bg-caramelo-palha p-4 md:p-5 rounded-full animate-pulse shadow-[0_0_20px_rgba(168,116,66,0.5)]">
              <Flame className="w-6 h-6 md:w-8 md:h-8 text-marrom-escuro" />
            </div>
            <Star className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 text-caramelo-palha fill-caramelo-palha animate-spin-slow" />
          </div>
          
          <div className="space-y-1 md:space-y-2">
            <h3 className="text-caramelo-palha font-headline text-base md:text-xl tracking-[0.2em] uppercase font-bold">
              Oferta Especial do Dia
            </h3>
            {productLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-areia-clara opacity-20" />
            ) : promoProduct ? (
              <p className="text-areia-clara font-subheadline text-lg md:text-3xl italic opacity-90 leading-tight">
                {promoProduct.emoji} {promoProduct.name} <span className="text-caramelo-palha not-italic font-black ml-2">R$ {promoProduct.price.toFixed(2).replace('.', ',')}</span>
              </p>
            ) : (
              <p className="text-areia-clara font-subheadline text-base md:text-xl italic opacity-90 leading-tight">
                Confira nossos destaques regionais!
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 md:gap-3 z-10 w-full lg:w-auto">
          <Button 
            className="w-full lg:w-auto bg-caramelo-palha text-marrom-escuro hover:bg-areia-clara px-8 md:px-14 py-5 md:py-7 text-sm md:text-lg font-black rounded-none shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
            onClick={() => {
              if (promoProduct && onProductClick) {
                onProductClick(promoProduct);
              } else {
                document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Aproveitar Agora
          </Button>
          <p className="text-areia-media/40 text-[7px] md:text-[8px] uppercase tracking-[0.4em] font-bold">Válido enquanto durar o estoque</p>
        </div>
      </div>
    </section>
  );
}
