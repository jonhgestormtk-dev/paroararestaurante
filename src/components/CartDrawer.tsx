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
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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

  const isEgua = restaurantSlug === 'egua-na-panela';

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [changeFor, setChangeFor] = useState('');
  const [copied, setCopied] = useState(false);

  const pixKey = "91985256348";

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

    const restaurantId = cart[0]?.restaurantId || 'paroara';
    const restaurantName = restaurantId === 'paroara' ? 'PAROARA' : 'Égua na Panela';
    const whatsappNumber = restaurantId === 'paroara' ? '559184541085' : '5591985256348';
    
    const baseOrderData = {
      restaurantId,
      customer: customerInfo,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        observations: item.observations || ''
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
          if (item.observations) {
            orderText += `  _Obs: ${item.observations}_\n`;
          }
        });

        orderText += `\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*\n`;
        orderText += `💳 *Pagamento:* ${paymentMethod}${paymentMethod === 'Dinheiro' ? ` (Troco para R$ ${changeFor})` : ''}\n`;
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
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {cart.length > 0 && (
              <div className="space-y-6">
                <div className={cn(
                  "p-4 rounded-xl border space-y-3",
                  isEgua ? "bg-preto-panela/50 border-white/5" : "bg-white border-marrom-madeira/10 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <User className={cn("w-3 h-3", isEgua ? "text-fogo-vibrante" : "text-marrom-madeira")} />
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Identificação</Label>
                  </div>
                  <div className="space-y-2.5">
                    <Input 
                      value={customerInfo.name} 
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} 
                      placeholder="Nome Completo *"
                      className={cn(
                        "h-12 border rounded-xl text-sm font-medium transition-all focus:ring-1 focus:ring-fogo-vibrante/50",
                        isEgua 
                          ? "bg-black/80 border-white/10 text-white placeholder:text-creme-legivel/80" 
                          : "bg-areia-clara/50 border-marrom-madeira/10 text-marrom-texto"
                      )}
                    />
                    <Input 
                      value={customerInfo.phone} 
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '')})} 
                      placeholder="WhatsApp (com DDD) *"
                      className={cn(
                        "h-12 border rounded-xl text-sm font-medium transition-all focus:ring-1 focus:ring-fogo-vibrante/50",
                        isEgua 
                          ? "bg-black/80 border-white/10 text-white placeholder:text-creme-legivel/80" 
                          : "bg-areia-clara/50 border-marrom-madeira/10 text-marrom-texto"
                      )}
                    />
                    <Input 
                      value={customerInfo.address} 
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} 
                      placeholder="Endereço Completo *"
                      className={cn(
                        "h-12 border rounded-xl text-sm font-medium transition-all focus:ring-1 focus:ring-fogo-vibrante/50",
                        isEgua 
                          ? "bg-black/80 border-white/10 text-white placeholder:text-creme-legivel/80" 
                          : "bg-areia-clara/50 border-marrom-madeira/10 text-marrom-texto"
                      )}
                    />
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-xl border space-y-4",
                  isEgua ? "bg-preto-panela/50 border-white/5" : "bg-white border-marrom-madeira/10 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <CreditCard className={cn("w-3.5 h-3.5", isEgua ? "text-fogo-vibrante" : "text-marrom-madeira")} />
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Forma de Pagamento</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
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
                          "flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                          paymentMethod === method.id 
                            ? (isEgua ? "bg-fogo-vibrante text-white border-fogo-vibrante shadow-lg" : "bg-marrom-terra text-white border-marrom-terra shadow-lg")
                            : (isEgua ? "bg-black/20 border-white/5 text-white/40" : "bg-areia-clara/60 border-transparent text-marrom-texto/60")
                        )}
                      >
                        <method.icon className="w-4 h-4" />
                        {method.id}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Pix' && (
                    <div className={cn("p-5 rounded-2xl border border-dashed flex flex-col gap-3", isEgua ? "border-fogo-vibrante/30 bg-fogo-vibrante/5" : "border-marrom-madeira/30 bg-areia-media/20")}>
                      <div className="flex justify-between items-center">
                        <p className={cn("text-[9px] uppercase font-black tracking-widest opacity-60", isEgua ? "text-white" : "text-marrom-madeira")}>Chave Pix (Telefone)</p>
                        <Button size="sm" variant="ghost" className="h-8 gap-2 text-[9px] uppercase font-black" onClick={handleCopyPix}>
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copiar
                        </Button>
                      </div>
                      <span className={cn("font-mono text-base font-black", isEgua ? "text-white" : "text-marrom-escuro")}>91985256348</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <ClipboardList className={cn("w-4 h-4", isEgua ? "text-fogo-vibrante" : "text-marrom-madeira")} />
                    <h3 className={cn("text-base font-subheadline font-bold uppercase", isEgua ? "text-white/80" : "text-marrom-madeira/80")}>Resumo do Pedido</h3>
                  </div>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className={cn("p-4 rounded-2xl border flex flex-col gap-3", isEgua ? "bg-preto-panela/40 border-white/5" : "bg-white border-marrom-madeira/5 shadow-sm")}>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col flex-1 pr-4">
                            <h4 className={cn("font-subheadline font-bold text-lg md:text-xl uppercase italic leading-tight", isEgua ? "text-white" : "text-marrom-texto")}>
                              {item.name}
                            </h4>
                            {item.observations && (
                              <p className={cn(
                                "text-[11px] md:text-xs italic mt-1.5 pl-3 border-l-2 leading-snug",
                                isEgua ? "text-fogo-vibrante border-fogo-vibrante/30" : "text-caramelo-palha border-caramelo-palha/30"
                              )}>
                                ↳ {item.observations}
                              </p>
                            )}
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-destructive/40 hover:text-destructive transition-colors shrink-0"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={cn("flex items-center gap-4 px-3 py-1.5 rounded-xl", isEgua ? "bg-black/60" : "bg-areia-clara/60")}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-fogo-vibrante transition-colors"><Minus className="w-3.5 h-3.5"/></button>
                            <span className="text-xs font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-fogo-vibrante transition-colors"><Plus className="w-3.5 h-3.5"/></button>
                          </div>
                          <span className={cn("font-black text-base md:text-lg", isEgua ? "text-white" : "text-marrom-escuro")}>
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
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
          <div className={cn("p-5 md:p-6 shrink-0 border-t", isEgua ? "bg-black/80 border-white/5" : "bg-white border-marrom-madeira/10 shadow-2xl")}>
            <div className="flex justify-between items-center mb-5 px-1">
              <span className={cn("font-headline text-[10px] uppercase tracking-[0.2em] opacity-60", isEgua ? "text-white" : "text-marrom-madeira")}>Total do Pedido</span>
              <span className={cn("font-black text-2xl tracking-tighter", isEgua ? "text-fogo-vibrante" : "text-marrom-escuro")}>
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <Button className={cn("w-full h-14 font-black uppercase text-xs tracking-[0.2em] gap-3 rounded-2xl shadow-2xl", isEgua ? "bg-fogo-vibrante text-white" : "bg-verde-folha text-white")} onClick={handleSendToWhatsApp}>
              <MessageSquare className="w-5 h-5" />
              Finalizar no WhatsApp
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
