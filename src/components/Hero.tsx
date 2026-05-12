'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-banner');
  
  return (
    <section className="relative w-full min-h-[500px] md:min-h-[800px] bg-areia-clara pt-20 md:pt-40 pb-12 md:pb-32 overflow-hidden flex items-center">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-rustic-texture opacity-[0.02] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        {/* Text Content */}
        <div className="space-y-4 md:space-y-10 text-center lg:text-left z-10 animate-in fade-in slide-in-from-left-8 duration-1000 order-2 lg:order-1">
          <div className="space-y-2 md:space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-4">
              <div className="h-[1px] w-6 md:w-8 bg-verde-folha/40 hidden lg:block"></div>
              <p className="text-verde-folha font-subheadline text-sm md:text-2xl italic tracking-wide">
                Sabor autêntico da Amazônia
              </p>
            </div>
            <h2 className="text-3xl md:text-6xl lg:text-8xl font-headline text-marrom-terra leading-[1.1] md:leading-[1] tracking-tight">
              Sinta o verdadeiro <br className="hidden md:block" /> sabor marajoara
            </h2>
          </div>
          
          <div className="w-16 md:w-32 h-[1px] bg-areia-escura mx-auto lg:mx-0 opacity-60"></div>

          <p className="text-marrom-texto/70 font-body text-sm md:text-2xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-light italic">
            Uma experiência gastronômica inspirada na tradição amazônica, preparada com ingredientes regionais e sabores inesquecíveis.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2 md:pt-6">
            <Button 
              size="lg" 
              className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro px-6 md:px-12 py-5 md:py-8 text-sm md:text-lg font-bold rounded-none shadow-2xl transition-all hover:scale-105 group"
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Cardápio
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-marrom-terra text-marrom-terra hover:bg-marrom-terra/5 px-6 md:px-12 py-5 md:py-8 text-sm md:text-lg font-bold rounded-none transition-all gap-2 md:gap-3 border-opacity-30"
              onClick={() => window.open('https://wa.me/559184541085', '_blank')}
            >
              <MessageCircle className="w-4 h-4" />
              Pedir no WhatsApp
            </Button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative h-[250px] md:h-[500px] lg:h-[650px] w-full z-10 animate-in fade-in slide-in-from-right-8 duration-1000 order-1 lg:order-2">
          <div className="absolute inset-1 md:inset-4 border-2 border-marrom-terra/10 rounded-tr-[40px] md:rounded-tr-[120px] rounded-bl-[40px] md:rounded-bl-[120px] -z-10 transform translate-x-1 md:translate-x-4 translate-y-1 md:translate-y-4"></div>
          <div className="relative h-full w-full rounded-tr-[40px] md:rounded-tr-[120px] rounded-bl-[40px] md:rounded-bl-[120px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-[4px] md:border-[12px] border-white">
            <Image
              src={heroImg?.imageUrl || ''}
              alt="Paroara Experiência Amazônica"
              fill
              className="object-cover scale-105 hover:scale-100 transition-transform duration-[15s] ease-linear"
              priority
              data-ai-hint="amazon food"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-marrom-escuro/40 via-transparent to-transparent"></div>
          </div>
          
          {/* Floating badge */}
          <div className="absolute -bottom-4 -left-4 md:-bottom-10 md:-left-10 bg-marrom-terra p-4 md:p-10 rounded-full shadow-2xl border-4 md:border-8 border-areia-clara z-20 hidden sm:block animate-bounce-slow">
            <div className="flex flex-col items-center justify-center text-areia-clara">
              <span className="font-headline text-lg md:text-3xl">100%</span>
              <span className="text-[7px] md:text-[10px] uppercase tracking-widest font-bold text-center">Artesanal</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-caramelo-palha/5 rounded-full blur-[60px] md:blur-[150px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-verde-folha/5 rounded-full blur-[50px] md:blur-[120px] pointer-events-none"></div>
    </section>
  );
}