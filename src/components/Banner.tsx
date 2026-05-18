'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Banner() {
  const hero = PlaceHolderImages.find(img => img.id === 'hero-banner');
  const displayImage = hero?.imageUrl || 'https://picsum.photos/seed/hero/1200/600';
  
  return (
    <section className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
      <Image
        src={displayImage}
        alt="Paroara Hero"
        fill
        className="object-cover brightness-[0.4] transition-transform duration-[10s] hover:scale-105"
        priority
        data-ai-hint="amazon forest"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-marrom-escuro/20 backdrop-blur-[2px] p-6 md:p-10 rounded-lg border border-areia-clara/10">
          <h2 className="text-3xl md:text-5xl font-headline text-areia-clara mb-4 drop-shadow-lg">
            Sabor da Amazônia servido com tradição.
          </h2>
          <p className="font-subheadline text-areia-media text-lg md:text-xl mb-8 italic">
            Descubra a rusticidade premium da cultura marajoara.
          </p>
          <Button 
            size="lg" 
            className="bg-caramelo-palha text-marrom-escuro font-bold px-10 py-6 rounded-md hover:bg-areia-clara hover:scale-105 transition-all duration-300 shadow-xl"
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver Cardápio
          </Button>
        </div>
      </div>
    </section>
  );
}
