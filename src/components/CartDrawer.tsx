
'use client';

import React, { useState } from 'react';
import { Trash2, Minus, Plus, MessageSquare, ShoppingBag as ShoppingBagIcon, User, Phone, MapPin, ClipboardList } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

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

    // Identifica o restaurante do primeiro item (assume que o carrinho é de apenas um restaurante por vez)
    const restaurantId = cart[0]?.restaurantId || 'paroara';
    const restaurantName = restaurantId === 'paroara' ? 'PAROARA' : 'ÉGUA DA PANELA';
    const whatsappNumber = '559184541085'; // Centralizado
    
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
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-areia-clara text-marrom-texto">
        <SheetHeader className="p-6 bg-marrom-escuro text-areia-clara">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-caramelo-palha" />
            <SheetTitle className="text-areia-clara font-headline uppercase">Sua Sacola</SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-cinza-organico italic">Sacola vazia.</div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-marrom-madeira/10 space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Seus Dados</Label>
                <Input value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="Nome" />
                <Input value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="WhatsApp" />
                <Input value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="Endereço" />
              </div>

              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-marrom-madeira/5 flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xs uppercase">{item.name}</h4>
                      <p className="text-[10px] text-cinza-organico">{item.restaurantId === 'paroara' ? 'Paroara' : 'Égua da Panela'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1"><Minus className="w-3 h-3"/></button>
                          <span className="text-xs font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1"><Plus className="w-3 h-3"/></button>
                        </div>
                        <span className="font-black text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-marrom-madeira/10">
            <div className="flex justify-between items-end mb-4">
              <span className="font-headline text-xs uppercase">Total</span>
              <span className="font-black text-2xl">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
            <Button className="w-full bg-verde-folha hover:bg-verde-escuro h-14 font-bold text-base gap-3" onClick={handleSendToWhatsApp}>
              <MessageSquare className="w-5 h-5" />
              Finalizar no WhatsApp
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
