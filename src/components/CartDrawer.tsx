
'use client';

import React from 'react';
import { X, Trash2, Minus, Plus, MessageSquare, ShoppingBag as ShoppingBagIcon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const ShoppingBag = ShoppingBagIcon;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  const handleSendToWhatsApp = () => {
    const whatsappNumber = '+559184541085';
    
    let orderText = `Olá, gostaria de fazer este pedido:\n\n🛒 PEDIDO — PAROARA\n\n`;
    
    cart.forEach(item => {
      orderText += `${item.quantity}x ${item.name} — R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
      if (item.observations) {
        orderText += `   obs: ${item.observations}\n`;
      }
    });

    orderText += `\nTotal: R$ ${totalPrice.toFixed(2).replace('.', ',')}\n\n`;
    orderText += `-------------------\nNome:\nEndereço:\nForma de pagamento:\n-------------------`;

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedText}`, '_blank');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-areia-clara text-marrom-texto">
        <SheetHeader className="p-6 bg-marrom-escuro text-areia-clara">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-areia-clara font-headline text-xl">Seu Pedido</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-areia-clara">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="bg-areia-media/30 p-8 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-cinza-organico opacity-30" />
              </div>
              <p className="font-subheadline italic text-cinza-organico text-lg">Seu cesto está vazio.</p>
              <Button 
                variant="outline" 
                className="border-marrom-madeira text-marrom-madeira"
                onClick={onClose}
              >
                Voltar ao Cardápio
              </Button>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="group animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border border-areia-escura">
                      <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-headline text-marrom-terra text-sm leading-tight">{item.name}</h4>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive opacity-40 hover:opacity-100 transition-opacity"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-cinza-organico line-clamp-1">{item.description}</p>
                      {item.observations && (
                        <p className="text-[10px] bg-areia-media/50 p-1 px-2 rounded italic text-marrom-madeira">
                          Obs: {item.observations}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-areia-escura rounded-md bg-white">
                          <button 
                            className="p-1 px-2 text-marrom-terra"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                            className="p-1 px-2 text-marrom-terra"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-body font-bold text-marrom-escuro">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-6 opacity-40 bg-areia-escura" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 bg-white border-t border-areia-escura space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-cinza-organico">
              <span>Subtotal</span>
              <span className="font-body">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-sm text-cinza-organico">
              <span>Taxa de Entrega</span>
              <span className="text-verde-folha font-semibold">Grátis*</span>
            </div>
            <div className="flex justify-between text-xl font-headline text-marrom-terra pt-2">
              <span>Total</span>
              <span className="font-body">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <Button 
            disabled={cart.length === 0}
            className="w-full bg-verde-folha hover:bg-verde-escuro text-areia-clara py-7 rounded-md font-bold text-lg gap-3 shadow-xl"
            onClick={handleSendToWhatsApp}
          >
            <MessageSquare className="w-6 h-6" />
            Enviar Pedido pelo WhatsApp
          </Button>
          <p className="text-[10px] text-center text-cinza-organico italic uppercase tracking-widest">
            Atendimento das 11h às 23h
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
