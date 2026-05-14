'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WhatsAppCTA() {
  const handleOrder = () => {
    window.open('https://wa.me/559184541085', '_blank');
  };

  return (
    <section className="py-24 md:py-32 bg-marrom-escuro relative overflow-hidden">
      {/* Texture and Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-rustic-texture opacity-[0.08] pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-caramelo-palha/10 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-verde-folha/10 rounded-full blur-[100px]"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-headline text-caramelo-palha leading-tight tracking-tight uppercase italic">
              Peça agora pelo <br className="hidden md:block" /> WhatsApp
            </h2>
            <div className="w-20 h-1 bg-caramelo-palha/30 mx-auto rounded-full"></div>
            <p className="text-areia-clara text-lg md:text-2xl font-body opacity-80 max-w-2xl mx-auto leading-relaxed font-light italic">
              Seu pedido chega rápido, fresco e preparado na hora com todo o vigor e sabor do Marajó.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Button 
              className="bg-verde-folha hover:bg-verde-escuro text-white px-10 md:px-16 py-8 md:py-10 text-xl md:text-2xl font-black rounded-full shadow-[0_20px_60px_rgba(78,91,44,0.4)] transition-all hover:scale-105 active:scale-95 gap-4 group"
              onClick={handleOrder}
            >
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-transform" />
              Fazer Pedido Agora
            </Button>
            
            <div className="flex items-center gap-3 text-areia-media/60 uppercase tracking-[0.4em] font-bold text-[8px] md:text-[10px]">
              <span className="w-8 md:w-10 h-[1px] bg-white/20"></span>
              Atendimento Exclusivo Belém/PA
              <span className="w-8 md:w-10 h-[1px] bg-white/20"></span>
            </div>
            
            <p className="text-caramelo-palha font-black text-xl md:text-2xl tracking-widest">+55 91 8454-1085</p>
          </div>
        </div>
      </div>
    </section>
  );
}