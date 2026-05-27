
'use client';

import React from 'react';
import { Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import { CloudinaryImage } from '@/types/image';
import { optimizeImage } from '@/lib/cloudinary';
import { deleteImageRecord } from '@/services/imageService';
import { useFirestore } from '@/firebase';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ImageCardProps {
  image: CloudinaryImage;
  onSelect?: (url: string) => void;
  selectable?: boolean;
}

export function ImageCard({ image, onSelect, selectable }: ImageCardProps) {
  const db = useFirestore();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image.imageUrl);
    toast.success('URL copiada!');
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db || !window.confirm('Excluir esta imagem permanentemente?')) return;

    setIsDeleting(true);
    try {
      await deleteImageRecord(db, image.id, image.publicId);
      toast.success('Imagem removida');
    } catch (error: any) {
      toast.error('Erro ao excluir');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      onClick={() => onSelect && onSelect(image.imageUrl)}
      className={cn(
        "group relative aspect-square rounded-2xl overflow-hidden border border-areia-escura/30 bg-white transition-all hover:shadow-xl",
        selectable && "cursor-pointer hover:ring-2 hover:ring-marrom-terra",
        isDeleting && "opacity-50"
      )}
    >
      <img 
        src={optimizeImage(image.imageUrl)} 
        alt="Foto da Biblioteca" 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
        <div className="flex justify-between items-center">
          <Badge variant="secondary" className="text-[8px] bg-white/20 text-white backdrop-blur-md uppercase tracking-widest border-none">
            {image.restaurantId === 'geral' ? 'Geral' : image.restaurantId}
          </Badge>
          <div className="flex gap-1">
            <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white text-white hover:text-marrom-escuro transition-colors" onClick={handleCopy}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
            {!selectable && (
              <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
