
'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Hero() {
  const pathname = usePathname();
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-banner');
  
  const restaurantSlug = useMemo(() => {
    const parts = pathname.split('/');
    return parts[2] || 'paroara';
  }, [pathname]);

  const isEgua = restaurantSlug === 'egua-da-panela';

  return (
    <section className={cn(
      "relative w-full min-h-[480px] md:min-h-[500px] pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden flex items-center",
      isEgua ? "bg-preto-carvao text-creme-suave" : "bg-areia-clara text-marrom-terra"
    )}>
      {/* Texture Layer */}
      <div className={cn(
        "absolute inset-0 pointer-events-none opacity-[0.05]",
        isEgua ? "bg-carbon-texture" : "bg-rustic-texture opacity-[0.02]"
      )}></div>
      
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-4 md:space-y-6 text-center lg:text-left z-10 animate-in fade-in slide-in-from-left-8 duration-1000 order-2 lg:order-1">
          <div className="space-y-1 md:space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-4">
              <div className={cn("h-[1px] w-6 md:w-8 hidden lg:block", isEgua ? "bg-fogo-vibrante/40" : "bg-verde-folha/40")}></div>
              <p className={cn(
                "font-subheadline text-xs md:text-lg italic tracking-wide",
                isEgua ? "text-fogo-vibrante" : "text-verde-folha"
              )}>
                {isEgua ? 'Sabor que incendeia a tradição' : 'Sabor autêntico da Amazônia'}
              </p>
            </div>
            <h2 className={cn(
              "text-3xl md:text-4xl lg:text-6xl font-headline leading-[1.1] tracking-tight",
              isEgua ? "text-white" : "text-marrom-terra"
            )}>
              {isEgua ? <>O tempero que<br/>faz a gente pirar</> : <>Sinta o verdadeiro<br className="hidden md:block" /> sabor marajoara</>}
            </h2>
          </div>
          
          <div className={cn("w-12 md:w-24 h-[1px] mx-auto lg:mx-0 opacity-40", isEgua ? "bg-fogo-vibrante" : "bg-areia-escura")}></div>

          <p className={cn(
            "font-body text-xs md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light italic",
            isEgua ? "text-creme-legivel/80" : "text-marrom-texto/70"
          )}>
            {isEgua 
              ? 'Culinária paraense, com sabores amazônicos e aquele tempero caseiro que lembra tradição e aconchego.' 
              : 'Uma experiência gastronômica inspirada na tradição amazônica, preparada com ingredientes regionais e sabores inesquecíveis.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center lg:justify-start pt-2 md:pt-4">
            <Button 
              size="lg" 
              className={cn(
                "px-6 md:px-10 py-5 md:py-7 text-[11px] md:text-sm font-bold rounded-none shadow-xl transition-all hover:scale-105 group uppercase tracking-widest",
                isEgua 
                  ? "bg-fogo-vibrante text-creme-suave hover:bg-fogo-escuro" 
                  : "bg-marrom-terra text-areia-clara hover:bg-marrom-escuro"
              )}
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Cardápio
              <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative h-[280px] md:h-[350px] lg:h-[450px] w-full z-10 animate-in fade-in slide-in-from-right-8 duration-1000 order-1 lg:order-2">
          <div className={cn(
            "absolute inset-1 md:inset-3 border-2 rounded-tr-[30px] md:rounded-tr-[60px] rounded-bl-[30px] md:rounded-bl-[60px] -z-10 transform translate-x-1 md:translate-x-3 translate-y-1 md:translate-y-3",
            isEgua ? "border-fogo-vibrante/20" : "border-marrom-terra/10"
          )}></div>
          <div className={cn(
            "relative h-full w-full rounded-tr-[30px] md:rounded-tr-[60px] rounded-bl-[30px] md:rounded-bl-[60px] overflow-hidden shadow-lg border-[4px] md:border-[6px]",
            isEgua ? "border-preto-panela" : "border-white"
          )}>
            <Image
              src={isEgua ? 'https://i.ibb.co/20cdybn2/Whats-App-Image-2026-05-18-at-10-30-24.jpg' : (heroImg?.imageUrl || '')}
              alt="Restaurante Regional"
              fill
              className="object-cover scale-105 hover:scale-100 transition-transform duration-[15s] ease-linear"
              priority
              data-ai-hint={isEgua ? "regional food" : "amazon food"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
