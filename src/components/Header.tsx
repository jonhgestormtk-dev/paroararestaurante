
'use client';

import React from 'react';
import { Star, ShoppingCart, MessageCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="fixed top-0 z-50 w-full bg-marrom-escuro text-areia-clara shadow-lg border-b border-marrom-madeira/50 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Name */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-headline tracking-widest text-caramelo-palha leading-none">
              PAROARA
            </h1>
            <p className="text-[10px] md:text-xs font-subheadline italic opacity-80 tracking-wide">
              O Restaurante Marajoara
            </p>
          </div>
          
          <div className="hidden sm:flex items-center bg-marrom-terra/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border border-caramelo-palha/30 ml-2">
            <Star className="w-3 h-3 fill-caramelo-palha text-caramelo-palha mr-1" />
            4.9
          </div>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-body uppercase tracking-widest opacity-90">
          <a href="#" className="hover:text-caramelo-palha transition-colors border-b border-transparent hover:border-caramelo-palha pb-1">Home</a>
          <a href="#menu" className="hover:text-caramelo-palha transition-colors border-b border-transparent hover:border-caramelo-palha pb-1">Cardápio</a>
          <a href="#promos" className="hover:text-caramelo-palha transition-colors border-b border-transparent hover:border-caramelo-palha pb-1">Promoções</a>
          <a href="#contato" className="hover:text-caramelo-palha transition-colors border-b border-transparent hover:border-caramelo-palha pb-1">Contato</a>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative cursor-pointer group" onClick={() => document.getElementById('cart-trigger')?.click()}>
            <ShoppingCart className="w-6 h-6 text-areia-clara group-hover:text-caramelo-palha transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-caramelo-palha text-marrom-escuro text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-marrom-escuro">
                {totalItems}
              </span>
            )}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex bg-caramelo-palha border-none text-marrom-escuro hover:bg-areia-clara transition-all duration-300 gap-2 font-bold uppercase text-xs tracking-tighter"
            onClick={() => window.open('https://wa.me/559184541085', '_blank')}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>

          <Button variant="ghost" size="icon" className="lg:hidden text-areia-clara">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
