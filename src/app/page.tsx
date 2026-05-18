
'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, ChefHat, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SplashPage() {
  const restaurants = [
    {
      id: 'egua-da-panela',
      name: 'Égua da Panela',
      tagline: 'Culinária Regional e Afetiva',
      description: 'Pratos com gostinho de casa, preparados com os melhores temperos do Pará.',
      color: 'bg-fogo-vibrante',
      hoverColor: 'hover:bg-fogo-escuro',
      icon: <Utensils className="w-12 h-12 text-creme-suave" />,
      image: 'https://picsum.photos/seed/egua/1200/800'
    },
    {
      id: 'paroara',
      name: 'PAROARA',
      tagline: 'O Restaurante Marajoara',
      description: 'Rusticidade Amazônica Premium com sabores tradicionais da Ilha do Marajó.',
      color: 'bg-marrom-terra',
      hoverColor: 'hover:bg-marrom-escuro',
      icon: <ChefHat className="w-12 h-12 text-caramelo-palha" />,
      image: 'https://i.ibb.co/rKvQHQHj/file.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-areia-clara flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-rustic-texture opacity-[0.03] pointer-events-none"></div>
      
      <div className="max-w-6xl w-full z-10 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-8xl font-subheadline font-bold italic text-marrom-terra leading-tight">Seja bem vindo!</h1>
          <p className="text-cinza-organico font-body text-[10px] md:text-sm max-w-2xl mx-auto opacity-60 uppercase tracking-[0.4em] font-bold">Escolha uma de nossas experiências para começar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {restaurants.map((res) => (
            <Link 
              key={res.id} 
              href={`/restaurante/${res.id}`}
              className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl shadow-2xl transition-all duration-700 hover:scale-[1.02]"
            >
              <div className="absolute inset-0">
                <img 
                  src={res.image} 
                  alt={res.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-50"
                />
              </div>
              
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center text-center p-8 transition-opacity duration-500",
                "bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              )}>
                <div className="mb-6 transform transition-transform duration-500 group-hover:-translate-y-4">
                  {res.icon}
                </div>
                
                <h2 className="text-4xl md:text-5xl font-headline text-white tracking-widest mb-2 uppercase">{res.name}</h2>
                <p className="text-caramelo-palha font-subheadline text-lg italic mb-6">{res.tagline}</p>
                <p className="text-white/80 font-body text-sm max-w-sm mb-8 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">{res.description}</p>
                
                <div className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-full text-white font-black uppercase tracking-widest text-xs transition-all",
                  res.color, res.hoverColor
                )}>
                  Entrar no Cardápio
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center pt-8 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-marrom-terra">
            Qualidade & Tradição • Belém/PA
          </p>
        </div>
      </div>
    </div>
  );
}
