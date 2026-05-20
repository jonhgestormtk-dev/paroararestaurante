
'use client';

import React, { useMemo } from 'react';
import { Leaf, Flame, Smartphone, Star, Heart, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function ExperienceSection() {
  const pathname = usePathname();
  const isEgua = pathname.includes('egua-na-panela');

  const experiences = useMemo(() => {
    if (isEgua) {
      return [
        {
          icon: <Heart className="w-10 h-10 text-fogo-vibrante" />,
          title: "Sabor Regional",
          description: "Pratos que abraçam a alma, preparados com o tempero e o carinho de uma verdadeira cozinha paraense."
        },
        {
          icon: <Flame className="w-10 h-10 text-fogo-vibrante" />,
          title: "Fogo & Tempero",
          description: "A intensidade do fogo e o equilíbrio das ervas regionais transformam ingredientes simples em banquetes memoráveis."
        },
        {
          icon: <Zap className="w-10 h-10 text-fogo-vibrante" />,
          title: "Entrega Rápida",
          description: "O calor da nossa panela direto para sua mesa. Garantimos que seu pedido chegue rápido e fumegante."
        }
      ];
    }
    return [
      {
        icon: <Leaf className="w-10 h-10 text-verde-folha" />,
        title: "Ingredientes Regionais",
        description: "Selecionamos os ingredientes mais frescos e autênticos diretamente dos produtores da Ilha do Marajó."
      },
      {
        icon: <Flame className="w-10 h-10 text-caramelo-palha" />,
        title: "Preparo Artesanal",
        description: "Nossas receitas são heranças ancestrais, preparadas com o fogo e o tempo que a culinária regional exige."
      },
      {
        icon: <Smartphone className="w-10 h-10 text-marrom-madeira" />,
        title: "Atendimento Rápido",
        description: "Sua experiência premium continua no digital. Faça seu pedido pelo WhatsApp com agilidade."
      }
    ];
  }, [isEgua]);

  return (
    <section className={cn(
      "py-24 md:py-40 border-y relative overflow-hidden transition-colors duration-500",
      isEgua 
        ? "bg-preto-panela border-fogo-vibrante/10" 
        : "bg-areia-media/15 border-areia-escura/30"
    )}>
      {/* Texture Layer */}
      <div className={cn(
        "absolute inset-0 pointer-events-none opacity-[0.03]",
        isEgua ? "bg-carbon-texture" : "bg-rustic-texture"
      )}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className={cn(
            "flex items-center justify-center gap-2 mb-2",
            isEgua ? "text-fogo-vibrante" : "text-marrom-terra"
          )}>
            <Star className={cn("w-4 h-4", isEgua ? "fill-fogo-vibrante" : "fill-marrom-terra/50")} />
            <span className="text-[11px] font-black uppercase tracking-[0.5em]">
              {isEgua ? 'Nossos Valores' : 'Nossa Essência'}
            </span>
            <Star className={cn("w-4 h-4", isEgua ? "fill-fogo-vibrante" : "fill-marrom-terra/50")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
          {experiences.map((exp, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-10 rounded-[40px] border transition-all duration-700 group flex flex-col items-center text-center",
                isEgua 
                  ? "bg-black/40 border-white/5 hover:border-fogo-vibrante/30 hover:shadow-[0_30px_60px_rgba(230,57,70,0.1)]" 
                  : "bg-white/40 border-white/60 shadow-sm hover:shadow-xl"
              )}
            >
              <div className={cn(
                "mb-10 w-24 h-24 rounded-3xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-500 relative",
                isEgua 
                  ? "bg-preto-carvao border-fogo-vibrante/20" 
                  : "bg-white border-areia-escura/30 shadow-sm"
              )}>
                {isEgua && <div className="absolute inset-0 bg-fogo-vibrante/5 blur-xl group-hover:bg-fogo-vibrante/10 transition-all"></div>}
                {exp.icon}
              </div>
              <h4 className={cn(
                "text-2xl mb-6 tracking-wide",
                isEgua ? "text-white font-subheadline font-bold italic" : "text-marrom-terra font-headline"
              )}>{exp.title}</h4>
              <p className={cn(
                "font-body leading-relaxed text-base italic",
                isEgua ? "text-creme-legivel opacity-80" : "text-marrom-madeira font-medium"
              )}>{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
