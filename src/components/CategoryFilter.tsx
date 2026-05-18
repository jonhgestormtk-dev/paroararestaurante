
'use client';

import React, { useMemo } from 'react';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface CategoryFilterProps {
  activeCategory: Category;
  categories?: string[];
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ activeCategory, onSelect, categories }: CategoryFilterProps) {
  const pathname = usePathname();
  const restaurantSlug = useMemo(() => {
    const parts = pathname.split('/');
    return parts[2] || 'paroara';
  }, [pathname]);

  const isEgua = restaurantSlug === 'egua-na-panela';
  const displayCategories = categories || ['Todos', 'Promoções', 'Regionais', 'Peixes', 'Grelhados', 'Executivos', 'Massas', 'Bebidas', 'Sobremesas'];

  return (
    <div className={cn(
      "w-full backdrop-blur-md sticky top-[64px] md:top-[80px] z-40 border-b shadow-sm transition-colors",
      isEgua 
        ? "bg-preto-carvao/95 border-fogo-vibrante/20" 
        : "bg-background/95 border-areia-escura/30"
    )}>
      <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar py-3.5 flex gap-2.5 items-center justify-start md:justify-center">
        {displayCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat as any)}
            className={cn(
              "px-5 py-2 whitespace-nowrap text-[11px] md:text-sm font-bold rounded-full transition-all duration-300 border uppercase tracking-wider",
              activeCategory === cat
                ? (isEgua 
                    ? "bg-fogo-vibrante text-white border-fogo-vibrante shadow-[0_0_15px_rgba(230,57,70,0.3)]" 
                    : "bg-marrom-terra text-areia-clara border-marrom-terra shadow-lg")
                : (isEgua
                    ? "bg-preto-panela text-creme-legivel border-white/5 hover:border-fogo-vibrante/40"
                    : "bg-areia-media/30 text-marrom-texto border-areia-escura hover:bg-areia-media")
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
