'use client';

import React from 'react';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  activeCategory: Category;
  categories?: string[];
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ activeCategory, onSelect, categories }: CategoryFilterProps) {
  const displayCategories = categories || ['Todos', 'Promoções', 'Regionais', 'Peixes', 'Grelhados', 'Executivos', 'Massas', 'Bebidas', 'Sobremesas'];

  return (
    <div className="w-full bg-background/95 backdrop-blur-md sticky top-[64px] md:top-[80px] z-40 border-b border-areia-escura/30 shadow-sm">
      <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar py-3.5 flex gap-2.5 items-center justify-start md:justify-center">
        {displayCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat as any)}
            className={cn(
              "px-5 py-2 whitespace-nowrap text-[11px] md:text-sm font-bold rounded-full transition-all duration-300 border uppercase tracking-wider",
              activeCategory === cat
                ? "bg-marrom-terra text-areia-clara border-marrom-terra shadow-lg"
                : "bg-areia-media/30 text-marrom-texto border-areia-escura hover:bg-areia-media hover:border-marrom-madeira"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
