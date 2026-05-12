
'use client';

import React from 'react';
import { Star, ShoppingCart, MessageCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="fixed top-0 z-50 w-full bg-marrom-escuro text-areia-clara shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-marrom-madeira/40 transition-all duration-500 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo & Name */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl md:text-4xl font-headline tracking-[0.2em] text-caramelo-palha leading-none uppercase">
              PAROARA
            </h1>
            <p className="text-[9px] md:text-[11px] font-subheadline italic text-areia-media/80 tracking-widest uppercase mt-1">
              O Restaurante Marajoara
            </p>
          </div>
          
          <div className="hidden sm:flex items-center bg-marrom-terra/40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-caramelo-palha/20 ml-2 shadow-inner">
            <Star className="w-3 h-3 fill-caramelo-palha text-caramelo-palha mr-1.5" />
            4.9
          </div>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden lg:flex items-center gap-10 text-[11px] font-body uppercase tracking-[0.3em] font-bold opacity-80">
          <a href="#" className="hover:text-caramelo-palha transition-all duration-300 border-b-2 border-transparent hover:border-caramelo-palha pb-1">Home</a>
          <a href="#menu" className="hover:text-caramelo-palha transition-all duration-300 border-b-2 border-transparent hover:border-caramelo-palha pb-1">Cardápio</a>
          <a href="#promos" className="hover:text-caramelo-palha transition-all duration-300 border-b-2 border-transparent hover:border-caramelo-palha pb-1">Promoções</a>
          <a href="#contato" className="hover:text-caramelo-palha transition-all duration-300 border-b-2 border-transparent hover:border-caramelo-palha pb-1">Contato</a>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="relative cursor-pointer group p-2 hover:bg-white/5 rounded-full transition-colors" onClick={() => document.getElementById('cart-trigger')?.click()}>
            <ShoppingCart className="w-6 h-6 text-areia-clara group-hover:text-caramelo-palha transition-all duration-300" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-caramelo-palha text-marrom-escuro text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-marrom-escuro animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </div>

          <Button 
            className="hidden md:flex bg-caramelo-palha border-none text-marrom-escuro hover:bg-areia-clara hover:scale-105 transition-all duration-500 gap-2 font-black uppercase text-[10px] tracking-[0.1em] px-6 py-5 rounded shadow-xl"
            onClick={() => window.open('https://wa.me/559184541085', '_blank')}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>

          <Button variant="ghost" size="icon" className="lg:hidden text-areia-clara hover:bg-white/10">
            <Menu className="w-7 h-7" />
          </Button>
        </div>
      </div>
    </header>
  );
}
