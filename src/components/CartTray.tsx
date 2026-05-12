
'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronUp } from 'lucide-react';
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
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none">
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            "w-full max-w-lg h-14 md:h-16 bg-verde-folha hover:bg-verde-escuro text-areia-clara shadow-2xl rounded-full flex items-center justify-between px-6 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto",
            "animate-in slide-in-from-bottom-full"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-caramelo-palha text-marrom-escuro text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span className="font-headline tracking-wider text-sm md:text-base">Ver Pedido</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-body font-bold text-lg">
              R$ {totalPrice.toFixed(2).replace('.', ',')}
            </span>
            <ChevronUp className="w-5 h-5 animate-bounce" />
          </div>
        </Button>
      </div>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
