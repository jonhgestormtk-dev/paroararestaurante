
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
      className="group bg-white rounded-lg overflow-hidden border border-areia-escura/30 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer flex flex-col h-full transform hover:-translate-y-2"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint={product.category}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-marrom-escuro/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {product.promotion && (
          <Badge className="absolute top-4 left-4 bg-verde-folha text-areia-clara border-none font-black tracking-widest text-[9px] px-3 py-1 shadow-lg">
            PROMOÇÃO
          </Badge>
        )}
        
        <Badge className="absolute top-4 right-4 bg-marrom-escuro/60 backdrop-blur-md text-areia-clara border-none font-bold text-[9px] px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          {product.category}
        </Badge>
      </div>
      
      <div className="p-6 flex flex-col flex-grow bg-areia-clara/20">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-headline text-xl text-marrom-terra leading-tight line-clamp-2">
            {product.emoji && <span className="mr-2 opacity-80">{product.emoji}</span>}
            {product.name}
          </h3>
        </div>
        
        <p className="text-xs md:text-sm text-cinza-organico font-body italic line-clamp-2 mb-6 flex-grow opacity-80 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-areia-escura/20">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-marrom-madeira/60 font-bold mb-1">A partir de</span>
            <span className="font-body font-black text-marrom-escuro text-xl">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-marrom-terra text-areia-clara hover:bg-caramelo-palha transition-all duration-300 shadow-md group/btn"
              onClick={handleQuickAdd}
            >
              <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hidden md:flex rounded-full border-marrom-terra/20 text-marrom-terra hover:bg-marrom-terra hover:text-areia-clara text-[10px] font-bold uppercase tracking-widest px-4"
            >
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
