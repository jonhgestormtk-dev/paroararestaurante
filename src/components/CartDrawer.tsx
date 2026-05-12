
'use client';

import React, { useState } from 'react';
import { X, Trash2, Minus, Plus, MessageSquare, ShoppingBag as ShoppingBagIcon, User, Phone, MapPin, ClipboardList } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
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

    const whatsappNumber = '559184541085';
    
    // Preparar dados base
    const baseOrderData = {
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
      const ordersCol = collection(db, 'orders');
      try {
        const snapshot = await getDocs(ordersCol);
        const nextOrderNumber = (snapshot.size + 1).toString().padStart(7, '0');
        
        const orderData = {
          ...baseOrderData,
          orderNumber: nextOrderNumber
        };

        await addDoc(ordersCol, orderData);
        
        let orderText = `Olá, gostaria de fazer este pedido:\n\n🛒 *PEDIDO #${nextOrderNumber} — PAROARA*\n\n`;
        orderText += `👤 *Cliente:* ${customerInfo.name}\n`;
        orderText += `📞 *Contato:* ${customerInfo.phone}\n`;
        if (customerInfo.address) orderText += `📍 *Entrega:* ${customerInfo.address}\n`;
        orderText += `\n---------------------------\n`;
        
        cart.forEach(item => {
          orderText += `• ${item.quantity}x *${item.name}* — R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
          if (item.observations) {
            orderText += `   _Obs: ${item.observations}_\n`;
          }
        });

        orderText += `\n*Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}*\n\n`;
        orderText += `---------------------------\nForma de pagamento sugerida: _Cartão / Pix_`;

        const encodedText = encodeURIComponent(orderText);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
        
        clearCart();
        setCustomerInfo({ name: '', phone: '', address: '' });
        onClose();

        toast({
          title: "Pedido Enviado!",
          description: `Seu pedido #${nextOrderNumber} foi registrado com sucesso.`
        });

      } catch (err: any) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: ordersCol.path,
          operation: 'create',
          requestResourceData: baseOrderData
        } satisfies SecurityRuleContext));
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-areia-clara text-marrom-texto border-l-0 sm:border-l border-marrom-madeira/20">
        <SheetHeader className="p-4 md:p-6 bg-marrom-escuro text-areia-clara flex-shrink-0 shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-caramelo-palha/20 p-2 rounded-full">
                <ShoppingBag className="w-5 h-5 text-caramelo-palha" />
              </div>
              <SheetTitle className="text-areia-clara font-headline text-lg tracking-wider uppercase">Sua Sacola</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-areia-clara hover:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {cart.length === 0 ? (
            <div className="py-24 text-center px-6 space-y-6">
              <div className="bg-areia-media/20 p-10 rounded-full w-24 h-24 mx-auto flex items-center justify-center border border-dashed border-marrom-madeira/10">
                <ShoppingBag className="w-10 h-10 text-marrom-madeira/20" />
              </div>
              <div className="space-y-2">
                <p className="font-headline text-lg text-marrom-terra">Sua sacola está vazia</p>
                <p className="font-subheadline italic text-cinza-organico text-sm">Que tal escolher um prato típico?</p>
              </div>
              <Button 
                variant="outline" 
                className="border-marrom-madeira text-marrom-madeira hover:bg-marrom-madeira hover:text-white transition-all px-8 py-5 uppercase tracking-widest font-bold text-[10px]"
                onClick={onClose}
              >
                Explorar Cardápio
              </Button>
            </div>
          ) : (
            <div className="py-4 px-4 md:px-6 space-y-6 pb-32">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-marrom-madeira/10 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="w-3.5 h-3.5 text-caramelo-palha" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-marrom-madeira">Identificação</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase tracking-widest font-bold opacity-60 flex items-center gap-2 mb-1">
                      <User className="w-3 h-3" /> Nome
                    </Label>
                    <Input 
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="bg-white border-marrom-madeira/10 h-10 text-sm focus:ring-marrom-terra rounded-lg"
                      placeholder="Como podemos te chamar?"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase tracking-widest font-bold opacity-60 flex items-center gap-2 mb-1">
                      <Phone className="w-3 h-3" /> WhatsApp
                    </Label>
                    <Input 
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="bg-white border-marrom-madeira/10 h-10 text-sm focus:ring-marrom-terra rounded-lg"
                      placeholder="(91) 90000-0000"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase tracking-widest font-bold opacity-60 flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3" /> Endereço de Entrega
                    </Label>
                    <Input 
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      className="bg-white border-marrom-madeira/10 h-10 text-sm focus:ring-marrom-terra rounded-lg"
                      placeholder="Rua, número, bairro..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-marrom-madeira">Pratos Selecionados</h4>
                  <span className="text-[10px] bg-marrom-terra/5 px-2 py-0.5 rounded-full text-marrom-terra font-bold">{cart.length} itens</span>
                </div>
                
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="relative bg-white p-3 rounded-xl border border-marrom-madeira/5 shadow-sm">
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-marrom-madeira/5">
                          <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-headline text-marrom-terra text-[13px] leading-tight line-clamp-2 uppercase">{item.name}</h4>
                            <button 
                              className="text-destructive/40 hover:text-destructive p-1"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-areia-clara border border-marrom-madeira/10 rounded-full h-7 overflow-hidden">
                              <button 
                                className="w-7 h-full flex items-center justify-center hover:bg-white text-marrom-terra active:scale-90"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[11px] font-black w-5 text-center text-marrom-escuro">{item.quantity}</span>
                              <button 
                                className="w-7 h-full flex items-center justify-center hover:bg-white text-marrom-terra active:scale-90"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-body font-black text-marrom-escuro text-sm">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {item.observations && (
                        <div className="mt-2 text-[10px] text-cinza-organico italic bg-areia-clara/40 px-2 py-1.5 rounded-lg border border-marrom-madeira/5">
                          Obs: {item.observations}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <div className="p-5 md:p-6 bg-white border-t border-marrom-madeira/10 flex-shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 rounded-t-[1.5rem] pb-safe">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-end">
                <span className="font-headline text-xs text-marrom-terra uppercase tracking-wider">Total do Pedido</span>
                <span className="font-body font-black text-2xl text-marrom-escuro">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <Button 
              className="w-full bg-verde-folha hover:bg-verde-escuro text-white h-14 rounded-xl font-bold text-base gap-3 shadow-lg shadow-verde-folha/10 transition-all active:scale-[0.98]"
              onClick={handleSendToWhatsApp}
            >
              <MessageSquare className="w-5 h-5" />
              Enviar para o WhatsApp
            </Button>
            <p className="text-[8px] text-center text-cinza-organico mt-3 uppercase tracking-widest font-black opacity-40">
              Tradição Marajoara • Belém PA
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
