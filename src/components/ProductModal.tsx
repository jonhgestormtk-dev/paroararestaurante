'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus, Wine, Check, ShoppingCart, Loader2 } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

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

  // Busca bebidas para sugestão (Cross-sell)
  const beveragesQuery = useMemo(() => {
    if (!db || !product || !isOpen) return null;
    return query(
      collection(db, 'products'),
      where('restaurantId', '==', product.restaurantId),
      where('category', '==', 'Bebidas'),
      limit(4)
    );
  }, [db, product, isOpen]);

  const { data: beverages, loading: loadingBevs } = useCollection<Product>(beveragesQuery);

  const filteredBeverages = useMemo(() => {
    if (!beverages) return [];
    // Filtrar apenas ativas e garantir que não seja o próprio produto (caso raro de abrir uma bebida)
    return beverages.filter(b => b.active !== false && b.id !== product?.id);
  }, [beverages, product]);

  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
      setObservations('');
      return;
    }
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
  };

  const handleAddSuggestion = (bev: Product) => {
    addToCart(bev, 1, '');
    toast({ 
      title: "Bebida Adicionada!", 
      description: `${bev.name} incluída para acompanhar.` 
    });
  };

  const isEgua = product.restaurantId === 'egua-na-panela';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className={cn(
        "max-w-2xl p-0 overflow-hidden border-none transition-colors duration-500 max-h-[95vh] md:max-h-[90vh] flex flex-col",
        isEgua ? "bg-preto-carvao text-creme-suave" : "bg-areia-clara text-marrom-texto"
      )}>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="relative h-[250px] md:h-[400px] w-full">
            <Image 
              src={product.imageUrl || `https://picsum.photos/seed/${product.id}/800/600`} 
              alt={product.name} 
              fill 
              className="object-cover" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="p-5 md:p-8 space-y-8">
            <DialogHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <DialogTitle className={cn(
                    "text-2xl md:text-4xl font-bold italic leading-tight", 
                    isEgua ? "text-white font-subheadline" : "text-marrom-terra font-subheadline"
                  )}>
                    {product.name}
                  </DialogTitle>
                  <p className="opacity-60 italic text-sm mt-1">{product.category}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xl md:text-3xl font-black block", 
                    isEgua ? "text-fogo-vibrante" : "text-marrom-escuro"
                  )}>
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-8">
              <p className={cn(
                "text-sm md:text-lg italic leading-relaxed", 
                isEgua ? "text-creme-legivel/80" : "text-marrom-texto/90"
              )}>
                {product.longDescription || product.description}
              </p>

              {/* MODO SUGESTIVO: Bebidas para acompanhar */}
              {filteredBeverages.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Wine className={cn("w-4 h-4", isEgua ? "text-fogo-vibrante" : "text-caramelo-palha")} />
                    <h3 className={cn(
                      "text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]",
                      isEgua ? "text-white/80" : "text-marrom-madeira"
                    )}>
                      Para Acompanhar
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredBeverages.map((bev) => (
                      <button
                        key={bev.id}
                        onClick={() => handleAddSuggestion(bev)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 group text-left",
                          isEgua 
                            ? "bg-black/40 border-white/5 hover:border-fogo-vibrante/40" 
                            : "bg-white/60 border-areia-escura/40 hover:border-marrom-terra/40"
                        )}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/10">
                          <img 
                            src={bev.imageUrl || `https://picsum.photos/seed/${bev.id}/200/200`} 
                            className="w-full h-full object-cover" 
                            alt={bev.name} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black uppercase truncate leading-none mb-1">{bev.name}</p>
                          <p className={cn("text-xs font-bold", isEgua ? "text-fogo-vibrante" : "text-marrom-terra")}>
                            + R$ {bev.price.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm",
                          isEgua ? "bg-fogo-vibrante text-white" : "bg-marrom-terra text-white"
                        )}>
                          <Plus className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] opacity-60", 
                  isEgua ? "text-white" : "text-marrom-madeira"
                )}>
                  Observações do Pedido
                </Label>
                <Textarea 
                  placeholder="Ex: Sem cebola, ponto da carne mal passado, gelo e limão à parte..."
                  className={cn(
                    "resize-none border rounded-2xl min-h-[100px] text-sm transition-all p-4",
                    isEgua 
                      ? "bg-black/80 border-white/10 text-white placeholder:text-creme-legivel/40 focus:ring-fogo-vibrante" 
                      : "bg-white/80 border-areia-escura/50 text-marrom-texto focus:ring-marrom-terra"
                  )}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé de Ação fixo */}
        <div className={cn(
          "p-5 md:p-8 shrink-0 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)]", 
          isEgua ? "bg-black/90 border-white/5" : "bg-white/95 border-areia-escura/30"
        )}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className={cn(
              "flex items-center rounded-2xl border p-1.5 shadow-inner w-full md:w-auto justify-between md:justify-center md:gap-4", 
              isEgua ? "bg-black/40 border-white/10" : "bg-areia-clara/50 border-areia-escura/50"
            )}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Minus className="w-5 h-5" />
              </Button>
              <span className="w-8 text-center font-black text-xl">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl"
                onClick={() => setQuantity(q => q + 1)}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            <Button 
              className={cn(
                "w-full md:w-auto min-w-[280px] h-14 md:h-16 font-black shadow-2xl uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-95 text-xs gap-3", 
                isEgua 
                  ? "bg-fogo-vibrante text-white hover:bg-fogo-escuro" 
                  : "bg-marrom-terra text-areia-clara hover:bg-marrom-escuro"
              )}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
              Adicionar • R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
