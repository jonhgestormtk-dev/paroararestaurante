'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus, Wine, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const [addedDrinks, setAddedDrinks] = useState<string[]>([]);

  const db = useFirestore();

  // Efeito para interceptar o botão voltar no mobile e fechar o modal
  useEffect(() => {
    if (!isOpen) return;

    // Adiciona um estado fictício no histórico para o botão voltar interceptar
    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = () => {
      // Quando o usuário clica em "voltar" no celular/navegador
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // Se o modal fechar por meios normais (X ou clique fora), 
      // precisamos remover o estado que injetamos para não "sujar" o histórico
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  // Buscar Bebidas Ativas para Upselling
  const drinksQuery = useMemo(() => {
    if (!db || !product || product.category === 'Bebidas') return null;
    return query(
      collection(db, 'products'),
      where('restaurantId', '==', product.restaurantId),
      where('category', '==', 'Bebidas'),
      where('active', '==', true),
      limit(4)
    );
  }, [db, product]);

  const { data: suggestedDrinks } = useCollection<Product>(drinksQuery);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, observations);
    toast({
      title: "Adicionado!",
      description: `${quantity}x ${product.name} na sua sacola.`
    });
    onClose();
    setQuantity(1);
    setObservations('');
    setAddedDrinks([]);
  };

  const handleAddDrink = (drink: Product) => {
    addToCart(drink, 1);
    setAddedDrinks(prev => [...prev, drink.id]);
    toast({
      title: "Bebida Adicionada!",
      description: `${drink.name} agora acompanha seu pedido.`
    });
  };

  const displayImage = product.imageUrl || `https://picsum.photos/seed/${product.id}/800/600`;
  const isEgua = product.restaurantId === 'egua-na-panela';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setAddedDrinks([]);
        onClose();
      }
    }}>
      <DialogContent className={cn(
        "max-w-2xl p-0 overflow-hidden border-none transition-colors duration-500 max-h-[95vh] md:max-h-[90vh] overflow-y-auto",
        isEgua ? "bg-preto-carvao text-creme-suave" : "bg-areia-clara text-marrom-texto"
      )}>
        <div className="relative h-[250px] md:h-[450px] w-full flex-shrink-0">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent",
            isEgua ? "opacity-40" : "opacity-20"
          )}></div>
        </div>

        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
          <DialogHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <DialogTitle className={cn(
                  "text-xl md:text-3xl font-bold italic leading-tight",
                  isEgua ? "text-white font-subheadline" : "text-marrom-terra font-subheadline"
                )}>
                  {product.name}
                </DialogTitle>
                <p className={cn(
                  "font-subheadline text-xs md:text-lg italic mt-1 opacity-60",
                  isEgua ? "text-creme-legivel" : "text-marrom-madeira"
                )}>
                  {product.category}
                </p>
              </div>
              <span className={cn(
                "text-lg md:text-2xl font-body font-black whitespace-nowrap",
                isEgua ? "text-fogo-vibrante" : "text-marrom-escuro"
              )}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-6 md:space-y-8">
            <div className="prose prose-stone max-w-none">
              <p className={cn(
                "font-body leading-relaxed text-xs md:text-base italic whitespace-pre-wrap",
                isEgua ? "text-creme-legivel/80" : "text-marrom-texto/90"
              )}>
                {product.longDescription || product.description}
              </p>
            </div>

            {/* SEÇÃO DE CROSS-SELLING */}
            {suggestedDrinks && suggestedDrinks.length > 0 && (
              <div className={cn(
                "p-4 md:p-5 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 duration-700",
                isEgua ? "bg-black/40 border-white/5" : "bg-white/50 border-areia-escura/40"
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <Wine className={cn("w-4 h-4", isEgua ? "text-fogo-vibrante" : "text-marrom-terra")} />
                  <h4 className={cn(
                    "text-lg md:text-2xl font-subheadline font-bold",
                    isEgua ? "text-fogo-vibrante" : "text-marrom-madeira"
                  )}>Que tal uma bebida para acompanhar?</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedDrinks.map((drink) => {
                    const isAdded = addedDrinks.includes(drink.id);
                    return (
                      <div key={drink.id} className={cn(
                        "flex items-center justify-between p-2 rounded-xl transition-all border",
                        isEgua ? "bg-preto-panela/50 border-white/5" : "bg-white border-areia-escura/20"
                      )}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/5">
                            <img src={drink.imageUrl || `https://picsum.photos/seed/${drink.id}/100/100`} className="object-cover w-full h-full" alt={drink.name} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold truncate uppercase">{drink.name}</p>
                            <p className={cn("text-[9px] font-black", isEgua ? "text-fogo-vibrante" : "text-marrom-terra")}>+ R$ {drink.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          disabled={isAdded}
                          onClick={() => handleAddDrink(drink)}
                          className={cn(
                            "h-8 w-8 rounded-lg shrink-0",
                            isAdded 
                              ? (isEgua ? "bg-verde-folha/20 text-verde-folha" : "bg-verde-folha/10 text-verde-folha")
                              : (isEgua ? "bg-fogo-vibrante/10 text-fogo-vibrante hover:bg-fogo-vibrante hover:text-white" : "bg-marrom-terra/5 text-marrom-terra hover:bg-marrom-terra hover:text-white")
                          )}
                        >
                          {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className={cn(
                "font-headline text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black opacity-60",
                isEgua ? "text-white" : "text-marrom-madeira"
              )}>Observações</h4>
              <Textarea 
                placeholder="Ex: Sem cebola, ponto da carne mal passado..."
                className={cn(
                  "resize-none rounded-lg min-h-[80px] md:min-h-[100px] text-sm",
                  isEgua ? "bg-black/40 border-white/10 text-white placeholder:text-white/20" : "bg-white/60 border-areia-escura/50 text-marrom-texto focus:ring-marrom-terra"
                )}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <div className={cn(
              "flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t",
              isEgua ? "border-white/5" : "border-areia-escura/30"
            )}>
              <div className={cn(
                "flex items-center rounded-xl border p-1 shadow-sm w-full md:w-auto justify-center",
                isEgua ? "bg-black/40 border-white/10" : "bg-white border-areia-escura/50"
              )}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-9 w-9 md:h-10 md:w-10",
                    isEgua ? "text-fogo-vibrante hover:bg-white/5" : "text-marrom-terra hover:bg-areia-clara"
                  )}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 md:w-12 text-center font-black text-base md:text-lg">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-9 w-9 md:h-10 md:w-10",
                    isEgua ? "text-fogo-vibrante hover:bg-white/5" : "text-marrom-terra hover:bg-areia-clara"
                  )}
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                className={cn(
                  "w-full md:w-auto min-w-[200px] md:min-w-[240px] h-12 md:h-14 text-sm md:text-base font-black shadow-xl uppercase tracking-widest rounded-xl transition-all active:scale-95",
                  isEgua 
                    ? "bg-fogo-vibrante text-white hover:bg-fogo-escuro" 
                    : "bg-marrom-terra text-areia-clara hover:bg-marrom-escuro"
                )}
                onClick={handleAddToCart}
              >
                Adicionar à Cesta • R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
