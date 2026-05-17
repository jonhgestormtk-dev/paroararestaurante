'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingCart, MessageCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CartDrawer } from './CartDrawer';

export function Header() {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();

  const restaurantSlug = useMemo(() => {
    const parts = pathname.split('/');
    if (parts[1] === 'restaurante' && parts[2]) {
      return parts[2];
    }
    return null;
  }, [pathname]);

  const isEgua = restaurantSlug === 'egua-da-panela';

  const navLinks = useMemo(() => {
    const base = [{ label: 'Início', path: '/' }];
    if (restaurantSlug) {
      return [
        ...base,
        { label: 'Cardápio', path: `/restaurante/${restaurantSlug}/produtos` },
        { label: 'Contato', path: '#contato' },
      ];
    }
    return [...base, { label: 'Cardápio Global', path: '/produtos' }];
  }, [restaurantSlug]);

  return (
    <>
      <header className={cn(
        "fixed top-0 z-50 w-full h-16 md:h-20 shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-500 backdrop-blur-sm bg-opacity-95 flex items-center border-b",
        isEgua 
          ? "bg-preto-carvao text-creme-suave border-fogo-vibrante/20" 
          : "bg-marrom-escuro text-areia-clara border-marrom-madeira/40"
      )}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-5">
            <div className="flex flex-col items-start">
              <h1 className={cn(
                "text-lg md:text-3xl font-headline tracking-[0.2em] leading-none uppercase",
                isEgua ? "text-fogo-vibrante" : "text-caramelo-palha"
              )}>
                {restaurantSlug ? restaurantSlug.replace('-', ' ') : 'PAROARA'}
              </h1>
              <p className={cn(
                "text-[7px] md:text-[10px] font-subheadline tracking-widest uppercase mt-0.5",
                isEgua ? "text-creme-legivel/80" : "text-areia-media/80"
              )}>
                {isEgua ? 'Culinária Regional e Afetiva' : 'O Restaurante Marajoara'}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[10px] font-body uppercase tracking-[0.2em] font-bold opacity-80">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className={cn(
                  "transition-all duration-300 border-b-2 border-transparent pb-1",
                  isEgua ? "hover:text-fogo-vibrante hover:border-fogo-vibrante" : "hover:text-caramelo-palha hover:border-caramelo-palha"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div 
              className="relative cursor-pointer group p-2 hover:bg-white/5 rounded-full transition-colors" 
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className={cn(
                "w-5 h-5 md:w-6 md:h-6 transition-all duration-300",
                isEgua ? "text-creme-suave group-hover:text-fogo-vibrante" : "text-areia-clara group-hover:text-caramelo-palha"
              )} />
              {totalItems > 0 && (
                <span className={cn(
                  "absolute top-0 right-0 text-[8px] md:text-[9px] font-black h-4 w-4 md:h-5 md:w-5 rounded-full flex items-center justify-center border-2",
                  isEgua 
                    ? "bg-fogo-vibrante text-creme-suave border-preto-carvao" 
                    : "bg-caramelo-palha text-marrom-escuro border-marrom-escuro"
                )}>
                  {totalItems}
                </span>
              )}
            </div>

            <Button 
              className={cn(
                "hidden md:flex border-none hover:scale-105 transition-all duration-500 gap-2 font-black uppercase text-[10px] tracking-[0.1em] px-5 py-5 rounded shadow-xl",
                isEgua 
                  ? "bg-fogo-vibrante text-creme-suave hover:bg-fogo-escuro" 
                  : "bg-caramelo-palha text-marrom-escuro hover:bg-areia-clara"
              )}
              onClick={() => window.open('https://wa.me/559184541085', '_blank')}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                  "lg:hidden p-0 h-10 w-10",
                  isEgua ? "text-creme-suave hover:bg-white/5" : "text-areia-clara hover:bg-white/10"
                )}>
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className={cn(
                "border-r p-0 w-[80%] max-w-[300px]",
                isEgua ? "bg-preto-carvao text-creme-suave border-fogo-vibrante/20" : "bg-marrom-escuro text-areia-clara border-marrom-madeira/40"
              )}>
                <SheetHeader className="p-8 border-b border-white/5">
                  <SheetTitle className={cn(
                    "font-headline text-2xl tracking-widest text-left",
                    isEgua ? "text-fogo-vibrante" : "text-caramelo-palha"
                  )}>
                    {restaurantSlug ? restaurantSlug.replace('-', ' ') : 'MENU'}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-6 gap-2">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      href={link.path}
                      className="px-4 py-4 hover:bg-white/5 rounded-sm transition-all text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}