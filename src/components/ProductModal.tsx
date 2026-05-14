'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { enrichDishDescription } from '@/ai/flows/ai-enrich-dish-description-flow';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [aiDesc, setAiDesc] = useState<string | null>(null);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, observations);
    onClose();
    setQuantity(1);
    setObservations('');
    setAiDesc(null);
  };

  const handleEnrich = async () => {
    setIsEnriching(true);
    try {
      const result = await enrichDishDescription({
        dishName: product.name,
        ingredients: product.ingredients || []
      });
      setAiDesc(result.description);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-areia-clara text-marrom-texto max-h-[90vh] overflow-y-auto">
        <div className="relative h-[250px] md:h-[350px] w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-6 md:p-8">
          <DialogHeader className="mb-4">
            <div className="flex justify-between items-end gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl md:text-3xl font-subheadline font-bold italic text-marrom-terra mb-1">
                  {product.name}
                </DialogTitle>
                <p className="text-marrom-madeira font-subheadline text-base md:text-lg italic opacity-80">
                  {product.category}
                </p>
              </div>
              <span className="text-xl md:text-2xl font-body font-black text-marrom-escuro whitespace-nowrap">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="prose prose-stone max-w-none">
              <p className="text-marrom-texto/90 font-body leading-relaxed text-sm md:text-base italic">
                {aiDesc || product.longDescription || product.description}
              </p>
              {!aiDesc && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-verde-folha p-0 h-auto gap-2 font-bold hover:text-verde-escuro mt-2"
                  onClick={handleEnrich}
                  disabled={isEnriching}
                >
                  <Sparkles className="w-4 h-4" />
                  {isEnriching ? 'Tecendo a história...' : 'Conhecer a tradição deste prato'}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-headline text-[10px] uppercase tracking-[0.3em] text-marrom-madeira font-black">Observações</h4>
              <Textarea 
                placeholder="Ex: Sem cebola, ponto da carne mal passado..."
                className="bg-white/60 border-areia-escura/50 resize-none focus:ring-marrom-terra rounded-lg min-h-[100px]"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-areia-escura/30">
              <div className="flex items-center bg-white rounded-xl border border-areia-escura/50 p-1 shadow-sm">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-marrom-terra hover:bg-areia-clara"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-black text-lg text-marrom-escuro">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-marrom-terra hover:bg-areia-clara"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                className="w-full md:w-auto min-w-[240px] bg-marrom-terra text-areia-clara hover:bg-marrom-escuro h-14 text-base font-bold shadow-xl uppercase tracking-widest rounded-xl"
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
