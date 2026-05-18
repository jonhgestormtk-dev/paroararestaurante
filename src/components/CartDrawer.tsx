
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  Minus, 
  Plus, 
  MessageSquare, 
  ShoppingBag as ShoppingBagIcon, 
  User, 
  X,
  ClipboardList,
  Wallet,
  Banknote,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
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
import { PaymentMethod } from '@/lib/types';

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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [changeFor, setChangeFor] = useState('');
  const [copied, setCopied] = useState(false);

  const pixKey = "91984541085";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast({ title: "Chave Pix Copiada!", description: "Agora basta colar no seu banco." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToWhatsApp = async () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, preencha nome, WhatsApp e endereço para continuar."
      });
      return;
    }

    if (paymentMethod === 'Dinheiro' && (!changeFor || Number(changeFor) < totalPrice)) {
      toast({
        variant: "destructive",
        title: "Troco inválido",
        description: "Informe um valor para troco maior que o total do pedido."
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
      payment: {
        method: paymentMethod,
        changeFor: paymentMethod === 'Dinheiro' ? Number(changeFor) : null
      },
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
        orderText += `📍 *Entrega:* ${customerInfo.address}\n`;
        orderText += `\n---------------------------\n`;
        
        cart.forEach(item => {
          orderText += `• ${item.quantity}x *${item.name}* — R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
        });

        orderText += `\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*\n`;
        orderText += `💳 *Pagamento:* ${paymentMethod}${paymentMethod === 'Dinheiro' ? ` (Troco para R$ ${changeFor})` : ''}\n`;
        
        if (paymentMethod === 'Pix') {
          orderText += `\n⚠️ _Por favor, envie o comprovante após o pagamento._\n`;
        }

        orderText += `\n---------------------------\nRestaurante: _${restaurantName}_`;

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
          "p-4 md:p-5 shrink-0 relative",
          isEgua ? "bg-black/40 border-b border-fogo-vibrante/20" : "bg-marrom-escuro"
        )}>
          <div className="flex items-center gap-3">
            <ShoppingBag className={cn("w-5 h-5", isEgua ? "text-fogo-vibrante" : "text-caramelo-palha")} />
            <SheetTitle className={cn(
              "font-headline uppercase tracking-widest text-base md:text-lg",
              isEgua ? "text-white" : "text-areia-clara"
            )}>
              Sua Sacola
            </SheetTitle>
          </div>
          <SheetClose className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/5">
            <X className="w-4 h-4 text-white/40" />
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
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
              <div className="space-y-6">
                {/* Dados do Cliente */}
                <div className={cn(
                  "p-4 rounded-xl border space-y-3",
                  isEgua ? "bg-preto-panela/50 border-white/5" : "bg-white border-marrom-madeira/10 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <User className={cn("w-3 h-3", isEgua ? "text-fogo-vibrante" : "text-marrom-madeira")} />
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Identificação</Label>
                  </div>
                  <div className="space-y-2">
                    <Input 
                      value={customerInfo.name} 
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} 
                      placeholder="Nome Completo *"
                      className={cn(
                        "h-10 border-none rounded-lg text-xs",
                        isEgua ? "bg-black/40 text-white placeholder:text-white/20" : "bg-areia-clara/50 text-marrom-texto"
                      )}
                    />
                    <Input 
                      value={customerInfo.phone} 
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '')})} 
                      placeholder="WhatsApp (com DDD) *"
                      className={cn(
                        "h-10 border-none rounded-lg text-xs",
                        isEgua ? "bg-black/40 text-white placeholder:text-white/20" : "bg-areia-clara/50 text-marrom-texto"
                      )}
                    />
                    <Input 
                      value={customerInfo.address} 
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} 
                      placeholder="Endereço Completo *"
                      className={cn(
                        "h-10 border-none rounded-lg text-xs",
                        isEgua ? "bg-black/40 text-white placeholder:text-white/20" : "bg-areia-clara/50 text-marrom-texto"
                      )}
                    />
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className={cn(
                  "p-4 rounded-xl border space-y-4",
                  isEgua ? "bg-preto-panela/50 border-white/5" : "bg-white border-marrom-madeira/10 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className={cn("w-3 h-3", isEgua ? "text-fogo-vibrante" : "text-marrom-madeira")} />
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Forma de Pagamento</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Pix', icon: Wallet },
                      { id: 'Dinheiro', icon: Banknote },
                      { id: 'Débito', icon: CreditCard },
                      { id: 'Crédito', icon: CreditCard }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border text-[10px] font-bold uppercase transition-all",
                          paymentMethod === method.id 
                            ? (isEgua ? "bg-fogo-vibrante text-white border-fogo-vibrante" : "bg-marrom-terra text-white border-marrom-terra")
                            : (isEgua ? "bg-black/20 border-white/5 text-white/40" : "bg-areia-clara/50 border-transparent text-marrom-texto/60")
                        )}
                      >
                        <method.icon className="w-3.5 h-3.5" />
                        {method.id}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Pix' && (
                    <div className={cn(
                      "p-3 rounded-lg border border-dashed flex flex-col gap-2",
                      isEgua ? "border-fogo-vibrante/20 bg-fogo-vibrante/5" : "border-marrom-madeira/20 bg-marrom-madeira/5"
                    )}>
                      <p className="text-[9px] uppercase font-black opacity-60">Chave Pix (Telefone)</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-bold">(91) 98454-1085</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-2 gap-1.5 text-[9px] uppercase font-black"
                          onClick={handleCopyPix}
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copiado' : 'Copiar'}
                        </Button>
                      </div>
                      <p className="text-[8px] italic opacity-40">Envie o comprovante no WhatsApp após o envio do pedido.</p>
                    </div>
                  )}

                  {paymentMethod === 'Dinheiro' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label className="text-[9px] uppercase font-black opacity-60">Troco para quanto?</Label>
                      <Input 
                        type="number"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Ex: 100"
                        className={cn(
                          "h-10 border-none rounded-lg text-xs",
                          isEgua ? "bg-black/40 text-white" : "bg-areia-clara/50 text-marrom-texto"
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Lista de Itens */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <ClipboardList className={cn("w-3.5 h-3.5", isEgua ? "text-fogo-vibrante" : "text-marrom-madeira")} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Resumo do Pedido</h3>
                  </div>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div 
                        key={item.id} 
                        className={cn(
                          "p-2.5 rounded-xl border flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300",
                          isEgua ? "bg-preto-panela/30 border-white/5" : "bg-white border-marrom-madeira/5"
                        )}
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                          <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className={cn("font-bold text-[11px] uppercase truncate", isEgua ? "text-white" : "text-marrom-texto")}>
                              {item.name}
                            </h4>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive/40 hover:text-destructive p-0.5 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[8px] font-subheadline italic opacity-40 mb-1">
                            {item.restaurantId === 'paroara' ? 'Paroara' : 'Égua da Panela'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className={cn(
                              "flex items-center gap-2 px-1.5 py-0.5 rounded-full",
                              isEgua ? "bg-black/40" : "bg-areia-clara/50"
                            )}>
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-fogo-vibrante transition-colors">
                                <Minus className="w-2.5 h-2.5"/>
                              </button>
                              <span className="text-[9px] font-black w-3 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-fogo-vibrante transition-colors">
                                <Plus className="w-2.5 h-2.5"/>
                              </button>
                            </div>
                            <span className={cn("font-black text-xs", isEgua ? "text-white" : "text-marrom-escuro")}>
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
            "p-4 md:p-5 shrink-0 border-t",
            isEgua ? "bg-black/60 border-white/5 shadow-[0_-15px_30px_rgba(0,0,0,0.4)]" : "bg-white border-marrom-madeira/10 shadow-lg"
          )}>
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="font-headline text-[9px] uppercase tracking-[0.2em] opacity-60">Total</span>
              <span className={cn("font-black text-xl tracking-tighter", isEgua ? "text-fogo-vibrante" : "text-marrom-escuro")}>
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <Button 
              className={cn(
                "w-full h-12 font-black uppercase text-[10px] tracking-[0.2em] gap-2 rounded-xl shadow-xl transition-all active:scale-95 group",
                isEgua 
                  ? "bg-fogo-vibrante text-white hover:bg-fogo-escuro shadow-fogo-vibrante/20" 
                  : "bg-verde-folha text-white hover:bg-verde-escuro shadow-verde-folha/20"
              )} 
              onClick={handleSendToWhatsApp}
            >
              <MessageSquare className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Finalizar no WhatsApp
            </Button>
            <p className="text-[7px] text-center mt-3 opacity-40 uppercase tracking-[0.2em] font-bold">
              Revise seus dados antes de enviar
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
