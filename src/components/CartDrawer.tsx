
'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Minus, Plus, MessageSquare, ShoppingBag as ShoppingBagIcon, User, Phone, MapPin, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ShoppingBag = ShoppingBagIcon;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const db = useFirestore();
  const { toast } = useToast();
  const pathname = usePathname();
  
  const restaurantSlug = useMemo(() => {
    const parts = pathname.split('/');
    if (parts[1] === 'restaurante' && parts[2]) return parts[2];
    return cart[0]?.restaurantId || 'paroara';
  }, [pathname, cart]);

  const isEgua = restaurantSlug === 'egua-da-panela';

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleSendToWhatsApp = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, preencha seu nome e telefone para continuar."
      });
      return;
    }

    const restaurantId = cart[0]?.restaurantId || 'paroara';
    const restaurantName = restaurantId === 'paroara' ? 'PAROARA' : 'Égua da Panela';
    const whatsappNumber = '559184541085';
    
    const baseOrderData = {
      restaurantId,
      customer: customerInfo,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: totalPrice,
      status: 'Pendente',
      createdAt: serverTimestamp()
    };

    if (db) {
      try {
        const ordersCol = collection(db, 'orders');
        const snapshot = await getDocs(ordersCol);
        const nextOrderNumber = (snapshot.size + 1).toString().padStart(7, '0');
        
        await addDoc(ordersCol, { ...baseOrderData, orderNumber: nextOrderNumber });
        
        let orderText = `Olá, gostaria de fazer um pedido para o *${restaurantName}*:\n\n🛒 *PEDIDO #${nextOrderNumber}*\n\n`;
        orderText += `👤 *Cliente:* ${customerInfo.name}\n`;
        orderText += `📞 *Contato:* ${customerInfo.phone}\n`;
        if (customerInfo.address) orderText += `📍 *Entrega:* ${customerInfo.address}\n`;
        orderText += `\n---------------------------\n`;
        
        cart.forEach(item => {
          orderText += `• ${item.quantity}x *${item.name}* — R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
        });

        orderText += `\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*\n\n`;
        orderText += `---------------------------\nRestaurante: _${restaurantName}_`;

        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}`, '_blank');
        
        clearCart();
        onClose();
        toast({ title: "Pedido Enviado!", description: `Registrado para ${restaurantName}.` });

      } catch (err: any) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: baseOrderData
        } satisfies SecurityRuleContext));
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className={cn(
          "w-full sm:max-w-md p-0 flex flex-col border-none shadow-2xl transition-colors duration-500",
          isEgua ? "bg-preto-carvao text-creme-suave" : "bg-areia-clara text-marrom-texto"
        )}
      >
        <SheetHeader className={cn(
          "p-6 shrink-0 relative",
          isEgua ? "bg-black/40 border-b border-fogo-vibrante/20" : "bg-marrom-escuro"
        )}>
          <div className="flex items-center gap-4">
            <ShoppingBag className={cn("w-6 h-6", isEgua ? "text-fogo-vibrante" : "text-caramelo-palha")} />
            <SheetTitle className={cn(
              "font-headline uppercase tracking-widest text-lg",
              isEgua ? "text-white" : "text-areia-clara"
            )}>
              Sua Sacola
            </SheetTitle>
          </div>
          <SheetClose className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/5">
            <X className="w-5 h-5 text-white/40" />
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="text-sm italic opacity-40">Sua sacola está vazia no momento.</p>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className={cn(
                    "rounded-full uppercase text-[10px] font-black tracking-widest px-6",
                    isEgua ? "border-fogo-vibrante/30 text-fogo-vibrante" : "border-marrom-madeira/30 text-marrom-madeira"
                  )}
                >
                  Explorar Cardápio
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Dados do Cliente */}
                <div className={cn(
                  "p-5 rounded-2xl border space-y-4",
                  isEgua ? "bg-preto-panela/50 border-white/5" : "bg-white border-marrom-madeira/10 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className={cn("w-3.5 h-3.5", isEgua ? "text-fogo-vibrante" : "text-marrom-madeira")} />
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Identificação</Label>
                  </div>
                  <div className="space-y-3">
                    <Input 
                      value={customerInfo.name} 
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} 
                      placeholder="Nome Completo"
                      className={cn(
                        "h-12 border-none rounded-xl text-sm",
                        isEgua ? "bg-black/40 text-white placeholder:text-white/20" : "bg-areia-clara/50 text-marrom-texto"
                      )}
                    />
                    <Input 
                      value={customerInfo.phone} 
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                      placeholder="WhatsApp (com DDD)"
                      className={cn(
                        "h-12 border-none rounded-xl text-sm",
                        isEgua ? "bg-black/40 text-white placeholder:text-white/20" : "bg-areia-clara/50 text-marrom-texto"
                      )}
                    />
                    <Input 
                      value={customerInfo.address} 
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} 
                      placeholder="Endereço (Opcional)"
                      className={cn(
                        "h-12 border-none rounded-xl text-sm",
                        isEgua ? "bg-black/40 text-white placeholder:text-white/20" : "bg-areia-clara/50 text-marrom-texto"
                      )}
                    />
                  </div>
                </div>

                {/* Lista de Itens */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <ClipboardList className={cn("w-3.5 h-3.5", isEgua ? "text-fogo-vibrante" : "text-marrom-madeira")} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Resumo do Pedido</h3>
                  </div>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div 
                        key={item.id} 
                        className={cn(
                          "p-3 rounded-2xl border flex gap-4 animate-in fade-in slide-in-from-right-4 duration-300",
                          isEgua ? "bg-preto-panela/30 border-white/5" : "bg-white border-marrom-madeira/5"
                        )}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                          <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className={cn("font-bold text-xs uppercase truncate", isEgua ? "text-white" : "text-marrom-texto")}>
                              {item.name}
                            </h4>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive/40 hover:text-destructive p-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[9px] font-subheadline italic opacity-40 mb-2">
                            {item.restaurantId === 'paroara' ? 'Paroara' : 'Égua da Panela'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className={cn(
                              "flex items-center gap-3 px-2 py-1 rounded-full",
                              isEgua ? "bg-black/40" : "bg-areia-clara/50"
                            )}>
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-fogo-vibrante transition-colors">
                                <Minus className="w-3 h-3"/>
                              </button>
                              <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-fogo-vibrante transition-colors">
                                <Plus className="w-3 h-3"/>
                              </button>
                            </div>
                            <span className={cn("font-black text-sm", isEgua ? "text-white" : "text-marrom-escuro")}>
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {cart.length > 0 && (
          <div className={cn(
            "p-6 shrink-0 border-t",
            isEgua ? "bg-black/60 border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]" : "bg-white border-marrom-madeira/10 shadow-lg"
          )}>
            <div className="flex justify-between items-center mb-6">
              <span className="font-headline text-[10px] uppercase tracking-[0.3em] opacity-60">Total do Pedido</span>
              <span className={cn("font-black text-2xl tracking-tighter", isEgua ? "text-fogo-vibrante" : "text-marrom-escuro")}>
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <Button 
              className={cn(
                "w-full h-14 font-black uppercase text-xs tracking-[0.2em] gap-3 rounded-2xl shadow-xl transition-all active:scale-95 group",
                isEgua 
                  ? "bg-fogo-vibrante text-white hover:bg-fogo-escuro shadow-fogo-vibrante/20" 
                  : "bg-verde-folha text-white hover:bg-verde-escuro shadow-verde-folha/20"
              )} 
              onClick={handleSendToWhatsApp}
            >
              <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Finalizar no WhatsApp
            </Button>
            <p className="text-[8px] text-center mt-4 opacity-40 uppercase tracking-[0.3em] font-bold">
              Você será redirecionado para o atendimento
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
