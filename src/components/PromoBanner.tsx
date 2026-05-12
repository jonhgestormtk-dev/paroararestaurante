
'use client';

import React from 'react';
import { Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 -mt-8 md:-mt-16 relative z-30">
      <div className="relative overflow-hidden bg-marrom-terra rounded-xl p-6 md:p-10 border border-caramelo-palha/30 shadow-[0_20px_50px_rgba(40,26,20,0.3)] flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-rustic-texture opacity-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 z-10 text-center md:text-left">
          <div className="relative flex-shrink-0">
            <div className="bg-caramelo-palha p-4 md:p-5 rounded-full animate-pulse shadow-[0_0_20px_rgba(168,116,66,0.5)]">
              <Flame className="w-8 h-8 md:w-10 md:h-10 text-marrom-escuro" />
            </div>
            <Star className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 text-caramelo-palha fill-caramelo-palha animate-spin-slow" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <h3 className="text-caramelo-palha font-headline text-lg md:text-2xl tracking-[0.2em] uppercase font-bold">
              Oferta Especial do Dia
            </h3>
            <p className="text-areia-clara font-subheadline text-base md:text-2xl italic opacity-90 leading-tight">
              Filé Marajoara na Brasa + Refresco Regional cortesia
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 md:gap-3 z-10 w-full lg:w-auto">
          <Button 
            className="w-full lg:w-auto bg-caramelo-palha text-marrom-escuro hover:bg-areia-clara px-8 md:px-14 py-6 md:py-8 text-lg md:text-xl font-black rounded-none shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Aproveitar Agora
          </Button>
          <p className="text-areia-media/40 text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-bold">Válido enquanto durar o estoque</p>
        </div>
      </div>
    </section>
  );
}
