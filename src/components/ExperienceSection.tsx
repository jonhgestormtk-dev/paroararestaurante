
'use client';

import React from 'react';
import { Leaf, Flame, Smartphone } from 'lucide-react';

const experiences = [
  {
    icon: <Leaf className="w-8 h-8 text-verde-folha" />,
    title: "Ingredientes Regionais",
    description: "Selecionamos ingredientes frescos e autênticos da biodiversidade amazônica."
  },
  {
    icon: <Flame className="w-8 h-8 text-caramelo-palha" />,
    title: "Preparo Artesanal",
    description: "Receitas tradicionais marajoaras preparadas com técnicas de alta gastronomia."
  },
  {
    icon: <Smartphone className="w-8 h-8 text-marrom-madeira" />,
    title: "Atendimento Premium",
    description: "Faça seu pedido com facilidade e rapidez diretamente pelo nosso WhatsApp."
  }
];

export function ExperienceSection() {
  return (
    <section className="bg-areia-media/20 py-20 border-y border-areia-escura/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp, idx) => (
            <div 
              key={idx}
              className="bg-white/50 backdrop-blur-sm p-8 rounded-lg border border-areia-escura/50 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="mb-6 bg-areia-clara w-16 h-16 rounded-full flex items-center justify-center border border-areia-escura group-hover:scale-110 transition-transform">
                {exp.icon}
              </div>
              <h4 className="font-headline text-xl text-marrom-terra mb-3">{exp.title}</h4>
              <p className="text-cinza-organico font-body leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
