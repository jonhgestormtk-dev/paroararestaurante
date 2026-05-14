'use client';

import React, { useState } from 'react';
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
import { CartDrawer } from './CartDrawer';

export function Header() {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Cardápio', path: '/produtos' },
    { label: 'Promoções', path: '#promos' },
    { label: 'Contato', path: '#contato' },
  ];

  return (
    <>
      <header className="fixed top-0 z-50 w-full h-16 md:h-20 bg-marrom-escuro text-areia-clara shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-marrom-madeira/40 transition-all duration-500 backdrop-blur-sm bg-opacity-95 flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-2 md:gap-5">
            <div className="flex flex-col items-start">
              <h1 className="text-lg md:text-3xl font-headline tracking-[0.2em] text-caramelo-palha leading-none uppercase">
                PAROARA
              </h1>
              <p className="text-[7px] md:text-[10px] font-subheadline text-areia-media/80 tracking-widest uppercase mt-0.5">
                O Restaurante Marajoara
              </p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-[10px] font-body uppercase tracking-[0.2em] font-bold opacity-80">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className="hover:text-caramelo-palha transition-all duration-300 border-b-2 border-transparent hover:border-caramelo-palha pb-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-6">
            <div 
              className="relative cursor-pointer group p-2 hover:bg-white/5 rounded-full transition-colors" 
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-areia-clara group-hover:text-caramelo-palha transition-all duration-300" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-caramelo-palha text-marrom-escuro text-[8px] md:text-[9px] font-black h-4 w-4 md:h-5 md:w-5 rounded-full flex items-center justify-center border-2 border-marrom-escuro animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </div>

            <Button 
              className="hidden md:flex bg-caramelo-palha border-none text-marrom-escuro hover:bg-areia-clara hover:scale-105 transition-all duration-500 gap-2 font-black uppercase text-[10px] tracking-[0.1em] px-5 py-5 rounded shadow-xl"
              onClick={() => window.open('https://wa.me/559184541085', '_blank')}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>

            {/* Mobile Menu Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-areia-clara hover:bg-white/10 p-0 h-10 w-10">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-marrom-escuro border-r border-marrom-madeira/40 text-areia-clara p-0 w-[80%] max-w-[300px]">
                <SheetHeader className="p-8 border-b border-marrom-madeira/20">
                  <SheetTitle className="text-caramelo-palha font-headline text-2xl tracking-widest text-left">
                    PAROARA
                  </SheetTitle>
                  <p className="text-[10px] font-subheadline italic text-areia-media/60 tracking-widest uppercase text-left">
                    Restaurante Marajoara
                  </p>
                </SheetHeader>
                <nav className="flex flex-col p-6 gap-2">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      href={link.path}
                      className="px-4 py-4 hover:bg-white/5 rounded-sm transition-all text-[10px] font-bold uppercase tracking-[0.2em] hover:text-caramelo-palha"
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="mt-8 pt-8 border-t border-marrom-madeira/20">
                    <Button 
                      className="w-full bg-caramelo-palha border-none text-marrom-escuro hover:bg-areia-clara transition-all duration-500 gap-2 font-black uppercase text-[10px] tracking-[0.1em] px-5 py-6 rounded shadow-xl"
                      onClick={() => window.open('https://wa.me/559184541085', '_blank')}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </div>
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
