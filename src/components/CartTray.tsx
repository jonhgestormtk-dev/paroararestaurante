'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronUp, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';
import { cn } from '@/lib/utils';

export function CartTray() {
  const { totalItems, totalPrice } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (totalItems === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6 flex justify-center pointer-events-none pb-safe">
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            "w-full max-w-lg h-16 md:h-20 bg-marrom-escuro hover:bg-marrom-terra text-areia-clara shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl flex items-center justify-between px-6 md:px-8 transition-all duration-500 transform translate-y-0 opacity-100 pointer-events-auto border border-white/10 group",
            "animate-in slide-in-from-bottom-full"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-caramelo-palha p-2.5 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-marrom-escuro" />
              </div>
              <span className="absolute -top-2 -right-2 bg-white text-marrom-escuro text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-marrom-escuro shadow-md">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-headline tracking-[0.2em] text-[10px] uppercase text-caramelo-palha opacity-80">Seu Pedido</span>
              <span className="font-body font-black text-lg md:text-xl leading-none">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl group-hover:bg-caramelo-palha group-hover:text-marrom-escuro transition-all">
            <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">Revisar Sacola</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Button>
      </div>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
