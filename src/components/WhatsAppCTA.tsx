'use client';

import React, { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function WhatsAppCTA() {
  const pathname = usePathname();
  const restaurantSlug = useMemo(() => {
    const parts = pathname.split('/');
    return parts[2] || 'paroara';
  }, [pathname]);

  const isEgua = restaurantSlug === 'egua-na-panela';
  
  // Números diferenciados por restaurante
  const whatsappNumber = isEgua ? '5591985256348' : '559184541085';
  const whatsappDisplay = isEgua ? '(91) 98525-6348' : '(91) 8454-1085';

  const handleOrder = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    <section className={cn(
      "py-24 md:py-32 relative overflow-hidden transition-colors",
      isEgua ? "bg-preto-carvao" : "bg-marrom-escuro"
    )}>
      <div className={cn(
        "absolute top-0 left-0 w-full h-full opacity-[0.08] pointer-events-none",
        isEgua ? "bg-carbon-texture" : "bg-rustic-texture"
      )}></div>
      
      <div className={cn(
        "absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px]",
        isEgua ? "bg-fogo-vibrante/20" : "bg-caramelo-palha/10"
      )}></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="space-y-6">
            <h2 className={cn(
              "text-4xl md:text-6xl font-bold italic leading-tight tracking-tight uppercase",
              isEgua ? "text-fogo-vibrante font-subheadline" : "text-caramelo-palha font-subheadline"
            )}>
              {isEgua ? <>Pediu,<br className="hidden md:block" /> provou, pirou! 😍</> : <>Peça agora pelo <br className="hidden md:block" /> WhatsApp</>}
            </h2>
            <div className={cn("w-20 h-1 mx-auto rounded-full", isEgua ? "bg-fogo-vibrante/30" : "bg-caramelo-palha/30")}></div>
            <p className="text-areia-clara text-lg md:text-2xl font-body opacity-80 max-w-2xl mx-auto leading-relaxed font-light italic">
              {isEgua 
                ? 'A panela tá no fogo! Peça seus favoritos e receba o melhor tempero regional em casa.' 
                : 'Seu pedido chega rápido, fresco e preparado na hora com todo o vigor e sabor do Marajó.'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Button 
              className={cn(
                "text-white px-10 md:px-16 py-8 md:py-10 text-xl md:text-2xl font-black rounded-full transition-all hover:scale-105 active:scale-95 gap-4 group",
                isEgua 
                  ? "bg-fogo-vibrante hover:bg-fogo-escuro shadow-[0_20px_60px_rgba(230,57,70,0.4)]" 
                  : "bg-verde-folha hover:bg-verde-escuro shadow-[0_20px_60px_rgba(78,91,44,0.4)]"
              )}
              onClick={handleOrder}
            >
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-transform" />
              Fazer Pedido Agora
            </Button>
            
            <div className="flex items-center gap-3 text-areia-media/60 uppercase tracking-[0.4em] font-bold text-[8px] md:text-[10px]">
              <span className="w-8 md:w-10 h-[1px] bg-white/20"></span>
              Atendimento Exclusivo Belém/PA
              <span className="w-8 md:w-10 h-[1px] bg-white/20"></span>
            </div>
            
            <p className={cn(
              "font-black text-xl md:text-2xl tracking-widest",
              isEgua ? "text-fogo-vibrante" : "text-caramelo-palha"
            )}>{whatsappDisplay}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
