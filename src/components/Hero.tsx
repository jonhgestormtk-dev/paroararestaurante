
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

  const isEgua = restaurantSlug === 'egua-na-panela';

  const displayImage = useMemo(() => {
    if (isEgua) return 'https://i.ibb.co/20cdybn2/Whats-App-Image-2026-05-18-at-10-30-24.jpg';
    return heroImg?.imageUrl || 'https://picsum.photos/seed/paroara-hero/800/600';
  }, [isEgua, heroImg]);

  return (
    <section className={cn(
      "relative w-full min-h-fit pt-20 md:pt-28 pb-6 md:pb-12 overflow-hidden flex items-center",
      isEgua ? "bg-preto-carvao text-creme-suave" : "bg-areia-clara text-marrom-terra"
    )}>
      {/* Texture Layer */}
      <div className={cn(
        "absolute inset-0 pointer-events-none opacity-[0.05]",
        isEgua ? "bg-carbon-texture" : "bg-rustic-texture opacity-[0.02]"
      )}></div>
      
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-3 md:space-y-6 text-center lg:text-left z-10 animate-in fade-in slide-in-from-left-8 duration-1000 order-2 lg:order-1">
          <div className="space-y-1 md:space-y-2">
            <h2 className={cn(
              "text-3xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight",
              isEgua ? "text-white font-subheadline font-bold italic" : "text-marrom-terra font-headline"
            )}>
              {isEgua ? <>O tempero que<br/>faz a gente pirar</> : <>Sinta o verdadeiro<br className="hidden md:block" /> sabor marajoara</>}
            </h2>
          </div>
          
          <div className={cn("w-10 md:w-16 h-[1px] mx-auto lg:mx-0 opacity-40", isEgua ? "bg-fogo-vibrante" : "bg-marrom-terra")}></div>

          <p className={cn(
            "font-body text-[10px] md:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium italic",
            isEgua ? "text-creme-legivel/80" : "text-marrom-texto"
          )}>
            {isEgua 
              ? 'Culinária paraense, com sabores amazônicos e aquele tempero caseiro que lembra tradição e aconchego.' 
              : 'Uma experiência gastronômica inspirada na tradição amazônica, preparada com ingredientes regionais e sabores inesquecíveis.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start pt-2">
            <Button 
              size="lg" 
              className={cn(
                "px-5 md:px-10 py-4 md:py-6 text-[10px] md:text-xs font-bold rounded-none shadow-xl transition-all hover:scale-105 group uppercase tracking-widest",
                isEgua 
                  ? "bg-fogo-vibrante text-creme-suave hover:bg-fogo-escuro" 
                  : "bg-marrom-terra text-areia-clara hover:bg-marrom-escuro"
              )}
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Cardápio
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Image Content */}
        <div className={cn(
          "relative w-full max-w-[450px] lg:max-w-[550px] mx-auto z-10 animate-in fade-in slide-in-from-right-8 duration-1000 order-1 lg:order-2",
          isEgua ? "h-[250px] md:h-[350px] lg:h-[450px]" : "h-[220px] md:h-[320px] lg:h-[400px]"
        )}>
          <div className={cn(
            "absolute inset-1 md:inset-2 border-2 rounded-tr-[20px] md:rounded-tr-[40px] rounded-bl-[20px] md:rounded-bl-[40px] -z-10 transform translate-x-1 md:translate-x-2 translate-y-1 md:translate-y-2",
            isEgua ? "border-fogo-vibrante/20" : "border-marrom-terra/10"
          )}></div>
          <div className={cn(
            "relative h-full w-full rounded-tr-[20px] md:rounded-tr-[40px] rounded-bl-[20px] md:rounded-bl-[40px] overflow-hidden shadow-lg border-[3px] md:border-[4px]",
            isEgua ? "border-preto-panela bg-black" : "border-white bg-white"
          )}>
            <Image
              src={displayImage}
              alt="Restaurante Regional"
              fill
              className={cn(
                "transition-all duration-700",
                isEgua ? "object-contain p-0" : "object-cover scale-105 hover:scale-100 transition-transform duration-[15s] ease-linear"
              )}
              priority
              data-ai-hint={isEgua ? "regional food" : "amazon food"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
