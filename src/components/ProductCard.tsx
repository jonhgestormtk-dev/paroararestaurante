'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-lg overflow-hidden border border-areia-escura/30 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          data-ai-hint={product.category}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-marrom-escuro/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {product.promotion && (
          <Badge className="absolute top-2 left-2 md:top-3 md:left-3 bg-verde-folha text-areia-clara border-none font-black tracking-widest text-[7px] md:text-[8px] px-1.5 py-0.5 md:px-2 md:py-1 shadow-lg">
            PROMOÇÃO
          </Badge>
        )}
      </div>
      
      <div className="p-2.5 md:p-4 flex flex-col flex-grow bg-areia-clara/20">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="font-headline text-[11px] md:text-base text-marrom-terra leading-tight line-clamp-2 uppercase tracking-wide">
            {product.emoji && <span className="mr-1 opacity-80">{product.emoji}</span>}
            {product.name}
          </h3>
        </div>
        
        <p className="text-[9px] md:text-xs text-cinza-organico font-body italic line-clamp-2 mb-2 md:mb-4 flex-grow opacity-80 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-areia-escura/20">
          <div className="flex flex-col">
            <span className="text-[7px] md:text-[9px] uppercase tracking-widest text-marrom-madeira/60 font-bold">R$</span>
            <span className="font-body font-black text-marrom-escuro text-sm md:text-lg">
              {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="icon"
              className="h-7 w-7 md:h-9 md:w-9 rounded-full bg-marrom-terra text-areia-clara hover:bg-caramelo-palha transition-all duration-300 shadow-md group/btn"
              onClick={handleQuickAdd}
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:rotate-90 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
