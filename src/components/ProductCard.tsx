
'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
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
      className="group bg-areia-media/30 rounded-[6px] overflow-hidden border border-areia-escura/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint={product.category}
        />
        {product.promotion && (
          <Badge className="absolute top-2 left-2 bg-verde-folha text-areia-clara border-none font-bold">
            PROMO
          </Badge>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-headline text-lg text-marrom-terra line-clamp-1">
            {product.emoji && <span className="mr-2">{product.emoji}</span>}
            {product.name}
          </h3>
        </div>
        
        <p className="text-xs text-cinza-organico font-body line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-subheadline font-bold text-marrom-escuro text-lg">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-marrom-terra text-areia-clara hover:bg-caramelo-palha transition-colors"
            onClick={handleQuickAdd}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
