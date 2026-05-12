
'use client';

import React from 'react';
import { Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 -mt-12 md:-mt-20 relative z-30">
      <div className="relative overflow-hidden bg-marrom-terra rounded-xl p-8 md:p-14 border border-caramelo-palha/30 shadow-[0_20px_50px_rgba(40,26,20,0.3)] flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-rustic-texture opacity-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 z-10 text-center md:text-left">
          <div className="relative">
            <div className="bg-caramelo-palha p-5 rounded-full animate-pulse shadow-[0_0_20px_rgba(168,116,66,0.5)]">
              <Flame className="w-10 h-10 text-marrom-escuro" />
            </div>
            <Star className="absolute -top-2 -right-2 w-6 h-6 text-caramelo-palha fill-caramelo-palha animate-spin-slow" />
          </div>
          <div className="space-y-2">
            <h3 className="text-caramelo-palha font-headline text-2xl md:text-3xl tracking-[0.2em] uppercase font-bold">
              Oferta Especial do Dia
            </h3>
            <p className="text-areia-clara font-subheadline text-xl md:text-3xl italic opacity-90 leading-tight">
              Filé Marajoara na Brasa + Refresco Regional cortesia
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 z-10">
          <Button 
            className="bg-caramelo-palha text-marrom-escuro hover:bg-areia-clara px-14 py-8 text-xl font-black rounded-none shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Aproveitar Agora
          </Button>
          <p className="text-areia-media/40 text-[9px] uppercase tracking-[0.4em] font-bold">Válido enquanto durar o estoque</p>
        </div>
      </div>
    </section>
  );
}
