
'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/mock-data';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  activeCategory: Category;
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="w-full bg-background/95 backdrop-blur-md sticky top-[60px] md:top-[72px] z-40 border-b border-areia-escura/30 shadow-sm">
      <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar py-4 flex gap-3 items-center justify-start md:justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "px-6 py-2.5 whitespace-nowrap text-xs md:text-sm font-bold rounded-full transition-all duration-300 border uppercase tracking-wider",
              activeCategory === cat
                ? "bg-marrom-terra text-areia-clara border-marrom-terra shadow-lg scale-105"
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
