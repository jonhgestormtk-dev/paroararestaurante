'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart();
  const pathname = usePathname();
  
  const isEgua = useMemo(() => {
    return product.restaurantId === 'egua-da-panela';
  }, [product.restaurantId]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  // Fallback image if imageUrl is empty
  const displayImage = product.imageUrl || `https://picsum.photos/seed/${product.id}/600/600`;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group rounded-lg overflow-hidden border shadow-sm transition-all duration-500 cursor-pointer flex flex-col h-full transform hover:-translate-y-1",
        isEgua 
          ? "bg-preto-panela border-white/5 hover:shadow-[0_20px_40px_rgba(255,77,77,0.15)]" 
          : "bg-white border-areia-escura/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          data-ai-hint={product.category}
        />
        
        {/* Overlays */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          isEgua ? "bg-gradient-to-t from-fogo-vibrante/20 to-transparent" : "bg-gradient-to-t from-marrom-escuro/40 to-transparent"
        )}></div>
        
        {product.promotion && (
          <Badge className={cn(
            "absolute top-2 left-2 md:top-3 md:left-3 border-none font-black tracking-widest text-[7px] md:text-[8px] px-1.5 py-0.5 md:px-2 md:py-1 shadow-lg",
            isEgua ? "bg-fogo-vibrante text-white" : "bg-verde-folha text-areia-clara"
          )}>
            PROMOÇÃO
          </Badge>
        )}
      </div>
      
      <div className={cn(
        "p-2 md:p-3 flex flex-col flex-grow",
        isEgua ? "bg-preto-carvao/40" : "bg-areia-clara/20"
      )}>
        <div className="flex justify-between items-start mb-1.5">
          <h3 className={cn(
            "font-subheadline text-base md:text-xl font-black leading-tight italic",
            isEgua ? "text-white" : "text-marrom-terra"
          )}>
            {product.emoji && <span className="mr-1 not-italic opacity-80">{product.emoji}</span>}
            {product.name}
          </h3>
        </div>
        
        <p className={cn(
          "text-[11px] md:text-base font-body italic whitespace-pre-wrap mb-3 flex-grow opacity-80 leading-relaxed",
          isEgua ? "text-creme-legivel" : "text-cinza-organico"
        )}>
          {product.description}
        </p>
        
        <div className={cn(
          "flex items-center justify-between mt-auto pt-2 border-t",
          isEgua ? "border-white/5" : "border-areia-escura/20"
        )}>
          <div className="flex flex-col">
            <span className={cn(
              "text-[7px] md:text-[8px] uppercase tracking-widest font-bold",
              isEgua ? "text-fogo-vibrante/60" : "text-marrom-madeira/60"
            )}>R$</span>
            <span className={cn(
              "font-body font-black text-sm md:text-lg",
              isEgua ? "text-white" : "text-marrom-escuro"
            )}>
              {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="icon"
              className={cn(
                "h-6 w-6 md:h-8 md:w-8 rounded-full transition-all duration-300 shadow-md group/btn",
                isEgua 
                  ? "bg-fogo-vibrante text-white hover:bg-fogo-escuro" 
                  : "bg-marrom-terra text-areia-clara hover:bg-caramelo-palha"
              )}
              onClick={handleQuickAdd}
            >
              <Plus className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/btn:rotate-90 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}