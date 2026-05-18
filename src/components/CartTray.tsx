
'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function CartTray() {
  const { totalItems, totalPrice } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  const isEgua = useMemo(() => {
    return pathname.includes('egua-na-panela');
  }, [pathname]);

  if (totalItems === 0) return null;

  return (
    <>
      {/* A barra só é renderizada se a sacola NÃO estiver aberta */}
      {!isDrawerOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6 flex justify-center pointer-events-none pb-safe">
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              "w-full max-w-lg h-16 md:h-20 flex items-center justify-between px-6 md:px-8 transition-all duration-500 transform translate-y-0 opacity-100 pointer-events-auto border group rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
              "animate-in slide-in-from-bottom-full",
              isEgua 
                ? "bg-preto-carvao hover:bg-black text-white border-fogo-vibrante/20" 
                : "bg-marrom-escuro hover:bg-marrom-terra text-areia-clara border-white/10"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  "p-2.5 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform",
                  isEgua ? "bg-fogo-vibrante" : "bg-caramelo-palha"
                )}>
                  <ShoppingBag className={cn("w-6 h-6", isEgua ? "text-white" : "text-marrom-escuro")} />
                </div>
                <span className={cn(
                  "absolute -top-2 -right-2 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 shadow-md",
                  isEgua 
                    ? "bg-white text-fogo-vibrante border-preto-carvao" 
                    : "bg-white text-marrom-escuro border-marrom-escuro"
                )}>
                  {totalItems}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className={cn(
                  "font-headline tracking-[0.2em] text-[10px] uppercase opacity-80",
                  isEgua ? "text-fogo-vibrante" : "text-caramelo-palha"
                )}>
                  Seu Pedido
                </span>
                <span className="font-body font-black text-lg md:text-xl leading-none">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl transition-all",
              isEgua 
                ? "group-hover:bg-fogo-vibrante group-hover:text-white" 
                : "group-hover:bg-caramelo-palha group-hover:text-marrom-escuro"
            )}>
              <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">Revisar Sacola</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Button>
        </div>
      )}

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
