
'use client';

import React from 'react';
import { Leaf, Flame, Smartphone, Star } from 'lucide-react';

const experiences = [
  {
    icon: <Leaf className="w-10 h-10 text-verde-folha" />,
    title: "Ingredientes Regionais",
    description: "Selecionamos os ingredientes mais frescos e autênticos diretamente dos produtores da Ilha do Marajó e do interior do Pará."
  },
  {
    icon: <Flame className="w-10 h-10 text-caramelo-palha" />,
    title: "Preparo Artesanal",
    description: "Nossas receitas são heranças ancestrais, preparadas com o fogo e o tempo que a verdadeira culinária regional exige."
  },
  {
    icon: <Smartphone className="w-10 h-10 text-marrom-madeira" />,
    title: "Atendimento Rápido",
    description: "Sua experiência premium continua no digital. Faça seu pedido pelo WhatsApp e receba no conforto do seu lar com agilidade."
  }
];

export function ExperienceSection() {
  return (
    <section className="bg-areia-media/15 py-32 border-y border-areia-escura/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-rustic-texture opacity-[0.02] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className="flex items-center justify-center gap-2 text-verde-folha/60 mb-2">
            <Star className="w-4 h-4 fill-verde-folha/40" />
            <span className="text-[10px] font-body uppercase tracking-[0.5em] font-black">Nossa Essência</span>
            <Star className="w-4 h-4 fill-verde-folha/40" />
          </div>
          <h2 className="text-4xl md:text-5xl font-headline text-marrom-terra">Experiência Paroara</h2>
          <div className="w-20 h-1 bg-marrom-madeira/30 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {experiences.map((exp, idx) => (
            <div 
              key={idx}
              className="bg-white/40 backdrop-blur-md p-10 rounded-2xl border border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col items-center text-center"
            >
              <div className="mb-10 bg-white w-24 h-24 rounded-full flex items-center justify-center border border-areia-escura/30 group-hover:scale-110 transition-transform duration-500 shadow-sm relative">
                <div className="absolute inset-2 border border-dashed border-areia-escura/20 rounded-full animate-spin-slow"></div>
                {exp.icon}
              </div>
              <h4 className="font-headline text-2xl text-marrom-terra mb-6 tracking-wide">{exp.title}</h4>
              <p className="text-cinza-organico font-body leading-relaxed text-lg italic opacity-80">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
