
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
        <div className="relative h-[250px] md:h-[350px]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-6 md:p-8">
          <DialogHeader className="mb-4">
            <div className="flex justify-between items-end">
              <div>
                <DialogTitle className="text-3xl font-headline text-marrom-terra mb-2">
                  {product.name}
                </DialogTitle>
                <p className="text-marrom-madeira font-subheadline text-lg italic">
                  {product.category}
                </p>
              </div>
              <span className="text-2xl font-bold text-marrom-escuro">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="prose prose-stone">
              <p className="text-marrom-texto/80 font-body leading-relaxed">
                {aiDesc || product.longDescription || product.description}
              </p>
              {!aiDesc && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-verde-folha p-0 h-auto gap-1 font-semibold hover:text-verde-escuro"
                  onClick={handleEnrich}
                  disabled={isEnriching}
                >
                  <Sparkles className="w-3 h-3" />
                  {isEnriching ? 'Tecendo a história...' : 'Conhecer a tradição deste prato'}
                </Button>
              )}
            </div>

            <div>
              <h4 className="font-headline text-sm uppercase tracking-widest text-marrom-madeira mb-3">Observações</h4>
              <Textarea 
                placeholder="Ex: Sem cebola, ponto da carne mal passado..."
                className="bg-white/50 border-areia-escura resize-none focus:ring-marrom-terra"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-areia-escura">
              <div className="flex items-center bg-white rounded-md border border-areia-escura p-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-marrom-terra"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-marrom-terra"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                className="w-full md:w-auto min-w-[200px] bg-marrom-terra text-areia-clara hover:bg-marrom-escuro py-6 text-lg font-bold shadow-lg"
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
