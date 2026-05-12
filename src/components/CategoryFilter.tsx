
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
    <div className="w-full bg-background/80 backdrop-blur-sm sticky top-[60px] z-40 border-b border-border shadow-sm">
      <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar py-4 flex gap-3 items-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "px-5 py-2 whitespace-nowrap text-sm font-medium rounded-full transition-all duration-300 border",
              activeCategory === cat
                ? "bg-marrom-terra text-areia-clara border-marrom-terra shadow-md scale-105"
                : "bg-areia-clara text-marrom-texto border-areia-escura hover:bg-areia-media"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
