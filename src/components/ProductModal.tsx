'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus, Wine, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');

  const db = useFirestore();

  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ modalOpen: true }, '');
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modalOpen) window.history.back();
    };
  }, [isOpen, onClose]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, observations);
    toast({ title: "Adicionado!", description: `${quantity}x ${product.name} na sua sacola.` });
    onClose();
    setQuantity(1);
    setObservations('');
  };

  const isEgua = product.restaurantId === 'egua-na-panela';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className={cn(
        "max-w-2xl p-0 overflow-hidden border-none transition-colors duration-500 max-h-[95vh] md:max-h-[90vh] overflow-y-auto",
        isEgua ? "bg-preto-carvao text-creme-suave" : "bg-areia-clara text-marrom-texto"
      )}>
        <div className="relative h-[250px] md:h-[450px] w-full">
          <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/800/600`} alt={product.name} fill className="object-cover" priority />
        </div>

        <div className="p-5 md:p-8 space-y-6">
          <DialogHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <DialogTitle className={cn("text-xl md:text-3xl font-bold italic", isEgua ? "text-white font-subheadline" : "text-marrom-terra font-subheadline")}>
                  {product.name}
                </DialogTitle>
                <p className="opacity-60 italic text-sm">{product.category}</p>
              </div>
              <span className={cn("text-lg md:text-2xl font-black", isEgua ? "text-fogo-vibrante" : "text-marrom-escuro")}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <p className={cn("text-xs md:text-base italic leading-relaxed", isEgua ? "text-creme-legivel/80" : "text-marrom-texto/90")}>
              {product.longDescription || product.description}
            </p>

            <div className="space-y-2">
              <Label className={cn("text-[9px] uppercase font-black tracking-widest", isEgua ? "text-white" : "text-marrom-madeira")}>Observações</Label>
              <Textarea 
                placeholder="Ex: Sem cebola, ponto da carne mal passado..."
                className={cn(
                  "resize-none border rounded-xl min-h-[80px] text-sm transition-all",
                  isEgua 
                    ? "bg-black/80 border-white/10 text-white placeholder:text-creme-legivel/60 focus:ring-fogo-vibrante" 
                    : "bg-white/60 border-areia-escura/50 text-marrom-texto focus:ring-marrom-terra"
                )}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <div className={cn("flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t", isEgua ? "border-white/5" : "border-areia-escura/30")}>
              <div className={cn("flex items-center rounded-xl border p-1 shadow-sm w-full md:w-auto justify-center", isEgua ? "bg-black/40 border-white/10" : "bg-white border-areia-escura/50")}>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="w-4 h-4" /></Button>
                <span className="w-10 text-center font-black text-base">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}><Plus className="w-4 h-4" /></Button>
              </div>

              <Button 
                className={cn("w-full md:w-auto min-w-[200px] h-12 md:h-14 font-black shadow-xl uppercase tracking-widest rounded-xl transition-all", isEgua ? "bg-fogo-vibrante text-white hover:bg-fogo-escuro" : "bg-marrom-terra text-areia-clara hover:bg-marrom-escuro")}
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