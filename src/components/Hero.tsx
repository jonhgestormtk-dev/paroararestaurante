'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-banner');
  
  return (
    <section className="relative w-full min-h-[350px] md:min-h-[500px] bg-areia-clara pt-16 md:pt-24 pb-6 md:pb-16 overflow-hidden flex items-center">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-rustic-texture opacity-[0.02] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-3 md:space-y-6 text-center lg:text-left z-10 animate-in fade-in slide-in-from-left-8 duration-1000 order-2 lg:order-1">
          <div className="space-y-1 md:space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-4">
              <div className="h-[1px] w-6 md:w-8 bg-verde-folha/40 hidden lg:block"></div>
              <p className="text-verde-folha font-subheadline text-xs md:text-lg italic tracking-wide">
                Sabor autêntico da Amazônia
              </p>
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-headline text-marrom-terra leading-[1.1] tracking-tight">
              Sinta o verdadeiro <br className="hidden md:block" /> sabor marajoara
            </h2>
          </div>
          
          <div className="w-12 md:w-24 h-[1px] bg-areia-escura mx-auto lg:mx-0 opacity-40"></div>

          <p className="text-marrom-texto/70 font-body text-xs md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light italic">
            Uma experiência gastronômica inspirada na tradição amazônica, preparada com ingredientes regionais e sabores inesquecíveis.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center lg:justify-start pt-1 md:pt-2">
            <Button 
              size="lg" 
              className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro px-5 md:px-8 py-4 md:py-6 text-[10px] md:text-sm font-bold rounded-none shadow-xl transition-all hover:scale-105 group uppercase tracking-widest"
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Cardápio
              <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-marrom-terra text-marrom-terra hover:bg-marrom-terra/5 px-5 md:px-8 py-4 md:py-6 text-[10px] md:text-sm font-bold rounded-none transition-all gap-2 border-opacity-30 uppercase tracking-widest"
              onClick={() => window.open('https://wa.me/559184541085', '_blank')}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative h-[180px] md:h-[350px] lg:h-[450px] w-full z-10 animate-in fade-in slide-in-from-right-8 duration-1000 order-1 lg:order-2">
          <div className="absolute inset-1 md:inset-3 border-2 border-marrom-terra/10 rounded-tr-[30px] md:rounded-tr-[60px] rounded-bl-[30px] md:rounded-bl-[60px] -z-10 transform translate-x-1 md:translate-x-3 translate-y-1 md:translate-y-3"></div>
          <div className="relative h-full w-full rounded-tr-[30px] md:rounded-tr-[60px] rounded-bl-[30px] md:rounded-bl-[60px] overflow-hidden shadow-lg border-[4px] md:border-[6px] border-white">
            <Image
              src={heroImg?.imageUrl || ''}
              alt="Paroara Experiência Amazônica"
              fill
              className="object-cover scale-105 hover:scale-100 transition-transform duration-[15s] ease-linear"
              priority
              data-ai-hint="amazon food"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
