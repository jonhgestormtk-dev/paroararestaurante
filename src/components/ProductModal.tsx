'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, observations);
    onClose();
    setQuantity(1);
    setObservations('');
  };

  const displayImage = product.imageUrl || `https://picsum.photos/seed/${product.id}/800/600`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-areia-clara text-marrom-texto max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        <div className="relative h-[200px] md:h-[350px] w-full flex-shrink-0">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="p-5 md:p-8 space-y-4 md:space-y-6">
          <DialogHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl md:text-3xl font-subheadline font-bold italic text-marrom-terra leading-tight">
                  {product.name}
                </DialogTitle>
                <p className="text-marrom-madeira font-subheadline text-xs md:text-lg italic opacity-80 mt-1">
                  {product.category}
                </p>
              </div>
              <span className="text-lg md:text-2xl font-body font-black text-marrom-escuro whitespace-nowrap">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6">
            <div className="prose prose-stone max-w-none">
              <p className="text-marrom-texto/90 font-body leading-relaxed text-xs md:text-base italic whitespace-pre-wrap">
                {product.longDescription || product.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-headline text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-marrom-madeira font-black opacity-60">Observações</h4>
              <Textarea 
                placeholder="Ex: Sem cebola, ponto da carne mal passado..."
                className="bg-white/60 border-areia-escura/50 resize-none focus:ring-marrom-terra rounded-lg min-h-[80px] md:min-h-[100px] text-sm"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 md:pt-6 border-t border-areia-escura/30">
              <div className="flex items-center bg-white rounded-xl border border-areia-escura/50 p-1 shadow-sm w-full md:w-auto justify-center md:justify-start">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 md:h-10 md:w-10 text-marrom-terra hover:bg-areia-clara"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 md:w-12 text-center font-black text-base md:text-lg text-marrom-escuro">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 md:h-10 md:w-10 text-marrom-terra hover:bg-areia-clara"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                className="w-full md:w-auto min-w-[200px] md:min-w-[240px] bg-marrom-terra text-areia-clara hover:bg-marrom-escuro h-12 md:h-14 text-sm md:text-base font-bold shadow-xl uppercase tracking-widest rounded-xl transition-transform active:scale-95"
                onClick={handleAddToCart}
              >
                Adicionar • R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
