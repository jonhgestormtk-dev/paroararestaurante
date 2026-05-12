
'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden bg-marrom-terra rounded-lg p-6 md:p-10 border border-caramelo-palha/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Background texture */}
        <div className="absolute inset-0 bg-rustic-texture opacity-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 z-10 text-center md:text-left">
          <div className="bg-caramelo-palha p-3 rounded-full animate-pulse">
            <Flame className="w-8 h-8 text-marrom-escuro" />
          </div>
          <div>
            <h3 className="text-caramelo-palha font-headline text-xl md:text-2xl tracking-wider">
              🔥 PROMOÇÃO DO DIA
            </h3>
            <p className="text-areia-clara font-subheadline text-lg md:text-xl italic">
              Filé Marajoara + refrigerante grátis
            </p>
          </div>
        </div>

        <Button 
          className="bg-caramelo-palha text-marrom-escuro hover:bg-areia-clara px-8 py-6 text-lg font-bold rounded-md shadow-lg transition-transform hover:scale-105 z-10"
          onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Pedir Agora
        </Button>
      </div>
    </section>
  );
}
