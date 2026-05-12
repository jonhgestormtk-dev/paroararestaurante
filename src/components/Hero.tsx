
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-banner');
  
  return (
    <section className="relative w-full min-h-[750px] bg-areia-clara pt-32 md:pt-44 overflow-hidden flex items-center">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-rustic-texture opacity-[0.02] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Text Content */}
        <div className="space-y-8 md:space-y-10 text-center lg:text-left z-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="h-[1px] w-8 bg-verde-folha/40 hidden lg:block"></div>
              <p className="text-verde-folha font-subheadline text-lg md:text-2xl italic tracking-wide">
                Sabor autêntico da Amazônia
              </p>
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-headline text-marrom-terra leading-[1] tracking-tight">
              Sinta o verdadeiro <br className="hidden md:block" /> sabor marajoara
            </h2>
          </div>
          
          <div className="w-32 h-[1px] bg-areia-escura mx-auto lg:mx-0 opacity-60"></div>

          <p className="text-marrom-texto/70 font-body text-lg md:text-2xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-light italic">
            Uma experiência gastronômica inspirada na tradição amazônica, preparada com ingredientes regionais e sabores inesquecíveis.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6">
            <Button 
              size="lg" 
              className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro px-12 py-8 text-lg font-bold rounded-none shadow-2xl transition-all hover:scale-105 group"
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Cardápio
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-marrom-terra text-marrom-terra hover:bg-marrom-terra/5 px-12 py-8 text-lg font-bold rounded-none transition-all gap-3 border-opacity-30"
              onClick={() => window.open('https://wa.me/559184541085', '_blank')}
            >
              <MessageCircle className="w-5 h-5" />
              Pedir no WhatsApp
            </Button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative h-[400px] md:h-[600px] lg:h-[700px] w-full z-10 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="absolute inset-4 border-2 border-marrom-terra/10 rounded-tr-[120px] rounded-bl-[120px] -z-10 transform translate-x-4 translate-y-4"></div>
          <div className="relative h-full w-full rounded-tr-[120px] rounded-bl-[120px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-[12px] border-white">
            <Image
              src={heroImg?.imageUrl || ''}
              alt="Paroara Experiência Amazônica"
              fill
              className="object-cover scale-105 hover:scale-100 transition-transform duration-[15s] ease-linear"
              priority
              data-ai-hint="amazon food"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-marrom-escuro/50 via-transparent to-transparent"></div>
          </div>
          
          {/* Floating badge */}
          <div className="absolute -bottom-10 -left-10 bg-marrom-terra p-10 rounded-full shadow-2xl border-8 border-areia-clara z-20 hidden md:block animate-bounce-slow">
            <div className="flex flex-col items-center justify-center text-areia-clara">
              <span className="font-headline text-3xl">100%</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Artesanal</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-caramelo-palha/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-verde-folha/5 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
}
