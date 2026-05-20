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
    return product.restaurantId === 'egua-na-panela';
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
        "group rounded-2xl overflow-hidden border shadow-sm transition-all duration-500 cursor-pointer flex flex-col h-full transform hover:-translate-y-1",
        isEgua 
          ? "bg-preto-panela border-white/5 hover:shadow-[0_20px_40px_rgba(255,165,0,0.15)]" 
          : "bg-white border-areia-escura/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
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
        "p-3 md:p-4 flex flex-col flex-grow",
        isEgua ? "bg-preto-carvao/40" : "bg-areia-clara/20"
      )}>
        <div className="flex justify-between items-start mb-2">
          <h3 className={cn(
            "font-subheadline text-lg md:text-2xl font-bold leading-tight italic",
            isEgua ? "text-creme-suave" : "text-marrom-terra"
          )}>
            {product.name}
          </h3>
        </div>
        
        <p className={cn(
          "text-xs md:text-sm font-body italic whitespace-pre-wrap mb-4 flex-grow leading-relaxed",
          isEgua ? "text-creme-legivel/80" : "text-cinza-organico"
        )}>
          {product.description}
        </p>
        
        <div className={cn(
          "flex items-center justify-between mt-auto pt-3 border-t",
          isEgua ? "border-white/5" : "border-areia-escura/20"
        )}>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-[10px] md:text-xs font-black uppercase",
              isEgua ? "text-fogo-vibrante" : "text-marrom-madeira/60"
            )}>R$</span>
            <span className={cn(
              "font-body font-black text-lg md:text-2xl tracking-tighter",
              isEgua ? "text-fogo-vibrante" : "text-marrom-escuro"
            )}>
              {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 md:h-10 md:w-10 rounded-full transition-all duration-300 shadow-md group/btn",
              isEgua 
                ? "bg-fogo-vibrante text-white hover:bg-fogo-escuro" 
                : "bg-marrom-terra text-areia-clara hover:bg-caramelo-palha"
            )}
            onClick={handleQuickAdd}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:rotate-90 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}