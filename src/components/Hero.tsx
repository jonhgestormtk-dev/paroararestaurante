
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-banner');
  
  return (
    <section className="relative w-full min-h-[600px] bg-areia-clara pt-24 md:pt-32 overflow-hidden flex items-center">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-6 md:space-y-8 text-center lg:text-left z-10">
          <div className="space-y-2">
            <p className="text-verde-folha font-subheadline text-lg md:text-xl italic tracking-wide">
              Sabor autêntico da Amazônia
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-headline text-marrom-terra leading-[1.1]">
              Sinta o verdadeiro <br className="hidden md:block" /> sabor marajoara
            </h2>
          </div>
          
          <div className="w-full h-[1px] bg-areia-escura max-w-[200px] mx-auto lg:mx-0"></div>

          <p className="text-marrom-texto/80 font-body text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Uma experiência gastronômica inspirada na tradição amazônica, preparada com ingredientes regionais e sabores inesquecíveis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Button 
              size="lg" 
              className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro px-10 py-7 text-lg font-bold rounded-md shadow-xl transition-all hover:scale-105"
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Cardápio
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-marrom-terra text-marrom-terra hover:bg-marrom-terra/10 px-10 py-7 text-lg font-bold rounded-md transition-all gap-2"
              onClick={() => window.open('https://wa.me/559184541085', '_blank')}
            >
              <MessageCircle className="w-5 h-5" />
              Pedir no WhatsApp
            </Button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative h-[350px] md:h-[500px] lg:h-[600px] w-full rounded-tl-[100px] rounded-br-[100px] overflow-hidden shadow-2xl border-4 border-white/50">
          <Image
            src={heroImg?.imageUrl || ''}
            alt="Paroara Experiência"
            fill
            className="object-cover"
            priority
            data-ai-hint="amazon food"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-marrom-escuro/40 to-transparent"></div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-caramelo-palha/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-verde-folha/20 rounded-full blur-3xl"></div>
        </div>
      </div>
      
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-rustic-texture opacity-[0.03] pointer-events-none"></div>
    </section>
  );
}
