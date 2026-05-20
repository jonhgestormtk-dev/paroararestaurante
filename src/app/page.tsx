'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, ChefHat, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SplashPage() {
  const restaurants = [
    {
      id: 'egua-na-panela',
      name: 'Égua na Panela',
      tagline: 'Sabor Regional & Agilidade',
      description: 'Culinária paraense autêntica voltada para a praticidade do seu dia a dia. Comida rápida, caseira e com o tempero que a nossa terra exige.',
      color: 'bg-fogo-vibrante',
      hoverColor: 'hover:bg-fogo-escuro',
      icon: <Utensils className="w-12 h-12 text-creme-suave" />,
      image: 'https://i.ibb.co/20cdybn2/Whats-App-Image-2026-05-18-at-10-30-24.jpg',
      badge: 'DIA A DIA / RÁPIDO',
      badgeIcon: <Zap className="w-3 h-3" />
    },
    {
      id: 'paroara',
      name: 'PAROARA',
      tagline: 'Rusticidade Amazônica Premium',
      description: 'Uma jornada refinada pela cultura marajoara. Explore sabores profundos e texturas sofisticadas para quem deseja aprofundar o paladar no melhor do Marajó.',
      color: 'bg-marrom-terra',
      hoverColor: 'hover:bg-marrom-escuro',
      icon: <ChefHat className="w-12 h-12 text-caramelo-palha" />,
      image: 'https://i.ibb.co/MyTx3cXr/file.jpg',
      badge: 'GOURMET / EXPERIÊNCIA',
      badgeIcon: <Sparkles className="w-3 h-3" />
    }
  ];

  return (
    <div className="min-h-screen bg-areia-clara flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-rustic-texture opacity-[0.03] pointer-events-none"></div>
      
      <div className="max-w-6xl w-full z-10 space-y-12">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl md:text-8xl font-subheadline font-bold italic text-marrom-terra leading-tight">Seja bem vindo!</h1>
          <p className="text-cinza-organico font-body text-[10px] md:text-sm max-w-2xl mx-auto opacity-60 uppercase tracking-[0.4em] font-bold">Qual experiência você deseja hoje?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {restaurants.map((res, idx) => (
            <Link 
              key={res.id} 
              href={`/restaurante/${res.id}`}
              className={cn(
                "group relative h-[450px] md:h-[550px] overflow-hidden rounded-3xl shadow-2xl transition-all duration-700 hover:scale-[1.02] border border-areia-escura/20",
                "animate-in fade-in slide-in-from-bottom-8",
                idx === 0 ? "delay-300" : "delay-500"
              )}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={res.image} 
                  alt={res.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.45]"
                />
              </div>

              {/* Top Badge */}
              <div className="absolute top-6 left-6 z-20">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-white font-black text-[9px] tracking-[0.2em] shadow-xl backdrop-blur-md border border-white/10",
                  res.color
                )}>
                  {res.badgeIcon}
                  {res.badge}
                </div>
              </div>
              
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-end text-center p-8 pb-12 transition-opacity duration-500",
                "bg-gradient-to-t from-black via-black/40 to-transparent"
              )}>
                <div className="mb-6 transform transition-all duration-700 group-hover:-translate-y-4">
                  {res.icon}
                </div>
                
                <h2 className="text-4xl md:text-5xl font-headline text-white tracking-widest mb-2 uppercase">{res.name}</h2>
                <p className="text-caramelo-palha font-subheadline text-xl italic mb-6">{res.tagline}</p>
                
                {/* Description - Hidden by default, slides up on hover on desktop, always visible on mobile if needed but here we keep the hover effect */}
                <div className="overflow-hidden max-h-0 group-hover:max-h-32 transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100">
                  <p className="text-white/80 font-body text-sm max-w-sm mb-8 leading-relaxed italic">
                    {res.description}
                  </p>
                </div>
                
                <div className={cn(
                  "flex items-center gap-2 px-8 py-4 mt-4 rounded-full text-white font-black uppercase tracking-widest text-xs transition-all",
                  res.color, res.hoverColor, "shadow-2xl"
                )}>
                  Explorar Sabores
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center pt-8 opacity-40 animate-in fade-in duration-1000 delay-1000">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-marrom-terra">
            Tradição Paraense & Requinte Marajoara • Belém/PA
          </p>
        </div>
      </div>
    </div>
  );
}
