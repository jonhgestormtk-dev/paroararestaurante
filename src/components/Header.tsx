
'use client';

import React from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-grafite-amadeirado text-areia-clara shadow-md border-b border-marrom-madeira/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-headline tracking-wider text-caramelo-palha">PAROARA</h1>
            <div className="hidden sm:flex items-center bg-marrom-terra/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border border-caramelo-palha/30">
              <Star className="w-3 h-3 fill-caramelo-palha text-caramelo-palha mr-1" />
              4.9
            </div>
          </div>
          <p className="text-[10px] md:text-xs font-subheadline italic opacity-80 tracking-wide">O Restaurante Marajoara</p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-transparent border-caramelo-palha text-caramelo-palha hover:bg-caramelo-palha hover:text-marrom-escuro transition-all duration-300 gap-2"
          onClick={() => window.open('https://wa.me/559184541085', '_blank')}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Falar Conosco</span>
        </Button>
      </div>
    </header>
  );
}
