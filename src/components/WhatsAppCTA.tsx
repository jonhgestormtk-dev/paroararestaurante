
'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WhatsAppCTA() {
  return (
    <section className="py-24 bg-marrom-escuro relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-rustic-texture opacity-[0.05] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline text-caramelo-palha">
              Peça agora pelo WhatsApp
            </h2>
            <p className="text-areia-clara text-lg md:text-xl font-subheadline italic opacity-80">
              Seu pedido chega rápido, fresco e preparado na hora com todo o sabor do Marajó.
            </p>
          </div>

          <Button 
            className="bg-verde-folha hover:bg-verde-escuro text-white px-12 py-8 text-xl font-bold rounded-full shadow-2xl transition-all hover:scale-105 gap-3"
            onClick={() => window.open('https://wa.me/559184541085', '_blank')}
          >
            <MessageCircle className="w-8 h-8" />
            Fazer Pedido • +55 91 8454-1085
          </Button>
          
          <p className="text-areia-escura text-xs uppercase tracking-[0.3em] font-body opacity-60">
            Atendimento exclusivo Belém/PA
          </p>
        </div>
      </div>
    </section>
  );
}
