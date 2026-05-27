
'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { CloudinaryImage } from '@/types/image';
import { ImageCard } from './ImageCard';
import { Search, Grid, List, Loader2, ImageOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageLibraryProps {
  onSelect?: (url: string) => void;
  selectable?: boolean;
}

export function ImageLibrary({ onSelect, selectable }: ImageLibraryProps) {
  const [filter, setFilter] = useState('todos');
  const db = useFirestore();

  const imagesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'images'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: images, loading } = useCollection<CloudinaryImage>(imagesQuery);

  const filteredImages = useMemo(() => {
    if (!images) return [];
    if (filter === 'todos') return images;
    return images.filter(img => img.restaurantId === filter);
  }, [images, filter]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-cinza-organico">
        <Loader2 className="w-10 h-10 animate-spin opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Acessando Acervo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-areia-escura/30 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-48 bg-areia-clara/20">
              <SelectValue placeholder="Restaurante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Fotos</SelectItem>
              <SelectItem value="paroara">Paroara</SelectItem>
              <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
              <SelectItem value="geral">Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira/60">
          {filteredImages.length} Arquivos no total
        </p>
      </div>

      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((img) => (
            <ImageCard key={img.id} image={img} onSelect={onSelect} selectable={selectable} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center space-y-4 border-2 border-dashed border-areia-escura/20 rounded-[2rem]">
          <ImageOff className="w-12 h-12 mx-auto text-areia-escura/40" />
          <p className="text-sm italic text-cinza-organico">Nenhuma imagem encontrada para este filtro.</p>
        </div>
      )}
    </div>
  );
}
