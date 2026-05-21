'use client';

import React, { useMemo } from 'react';
import { Flame, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Product, RestaurantSlug } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PromoBannerProps {
  onProductClick?: (product: Product) => void;
}

export function PromoBanner({ onProductClick }: PromoBannerProps) {
  const db = useFirestore();
  const pathname = usePathname();

  const restaurantId = useMemo(() => {
    const parts = pathname.split('/');
    if (parts[1] === 'restaurante' && parts[2]) return parts[2] as RestaurantSlug;
    return 'paroara';
  }, [pathname]);

  const isEgua = restaurantId === 'egua-na-panela';
  
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: settings } = useDoc<any>(settingsRef);
  
  const promoProductId = useMemo(() => {
    if (!settings) return null;
    return isEgua ? settings.eguaPromoId : settings.paroaraPromoId;
  }, [settings, isEgua]);

  const productRef = useMemo(() => 
    (db && promoProductId && promoProductId !== 'none') ? doc(db, 'products', promoProductId) : null
  , [db, promoProductId]);
  const { data: promoProduct, loading: productLoading } = useDoc<Product>(productRef);

  if (!promoProductId || promoProductId === 'none') return null;
  if (promoProduct && promoProduct.restaurantId !== restaurantId) return null;

  return (
    <section className="container mx-auto px-4 mt-4 md:-mt-12 relative z-30">
      <div className={cn(
        "relative overflow-hidden rounded-xl p-6 md:p-10 border shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 transition-all duration-700",
        isEgua 
          ? "bg-preto-panela border-fogo-vibrante/30 shadow-fogo-vibrante/20" 
          : "bg-marrom-terra border-caramelo-palha/30 shadow-marrom-terra/40"
      )}>
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          isEgua ? "bg-carbon-texture opacity-5" : "bg-rustic-texture opacity-10"
        )}></div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 z-10 text-center md:text-left flex-1">
          <div className="relative flex-shrink-0">
            <div className={cn(
              "p-4 md:p-5 rounded-full animate-pulse shadow-2xl",
              isEgua ? "bg-fogo-vibrante text-white" : "bg-caramelo-palha text-marrom-escuro"
            )}>
              <Flame className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          </div>
          
          <div className="space-y-1 md:space-y-2">
            <h3 className={cn(
              "font-subheadline text-base md:text-xl tracking-[0.2em] uppercase font-bold",
              isEgua ? "text-fogo-vibrante" : "text-caramelo-palha"
            )}>
              Oferta Especial do Dia
            </h3>
            {productLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-areia-clara opacity-20" />
              </div>
            ) : promoProduct ? (
              <p className={cn(
                "font-subheadline text-lg md:text-3xl italic opacity-90 leading-tight",
                isEgua ? "text-white" : "text-areia-clara"
              )}>
                {promoProduct.emoji} {promoProduct.name} 
                <span className={cn(
                  "not-italic font-black ml-2",
                  isEgua ? "text-fogo-vibrante" : "text-caramelo-palha"
                )}>
                  R$ {promoProduct.price.toFixed(2).replace('.', ',')}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 md:gap-3 z-10 w-full lg:w-auto">
          <Button 
            className={cn(
              "w-full lg:w-auto px-8 md:px-14 py-5 md:py-7 text-sm md:text-lg font-black rounded-none shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest",
              isEgua 
                ? "bg-fogo-vibrante text-white hover:bg-fogo-escuro shadow-fogo-vibrante/30" 
                : "bg-marrom-terra text-areia-clara hover:bg-marrom-escuro"
            )}
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
