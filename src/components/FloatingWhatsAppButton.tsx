'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export function FloatingWhatsAppButton() {
  const { totalItems } = useCart();
  const whatsappNumber = '559184541085';

  const handleClick = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed right-4 md:right-8 z-[55] bg-[#25D366] text-white p-3.5 md:p-5 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] transition-all duration-500 hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white/20 group",
        totalItems > 0 
          ? "bottom-24 md:bottom-32" 
          : "bottom-6 md:bottom-8"
      )}
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform" />
      
      {/* Indicador de Status Online */}
      <span className="absolute top-0 left-0 flex h-3 w-3 md:h-4 md:w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-white"></span>
      </span>
      
      {/* Tooltip Mobile/Desktop */}
      <span className="absolute right-full mr-3 bg-marrom-escuro text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
        Falar com Atendente
      </span>
    </button>
  );
}
