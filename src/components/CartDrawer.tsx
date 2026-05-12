'use client';

import React, { useState } from 'react';
import { X, Trash2, Minus, Plus, MessageSquare, ShoppingBag as ShoppingBagIcon, User, Phone, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

  const handleSendToWhatsApp = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, preencha seu nome e telefone para continuar."
      });
      return;
    }

    const whatsappNumber = '559184541085';
    
    // 1. Registrar no Firestore para o Painel Admin
    const orderData = {
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
      addDoc(ordersCol, orderData).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: ordersCol.path,
          operation: 'create',
          requestResourceData: orderData
        } satisfies SecurityRuleContext));
      });
    }

    // 2. Preparar mensagem de WhatsApp
    let orderText = `Olá, gostaria de fazer este pedido:\n\n🛒 PEDIDO — PAROARA\n\n`;
    orderText += `👤 Cliente: ${customerInfo.name}\n`;
    orderText += `📞 Contato: ${customerInfo.phone}\n`;
    if (customerInfo.address) orderText += `📍 Entrega: ${customerInfo.address}\n`;
    orderText += `\n-------------------\n`;
    
    cart.forEach(item => {
      orderText += `${item.quantity}x ${item.name} — R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
      if (item.observations) {
        orderText += `   obs: ${item.observations}\n`;
      }
    });

    orderText += `\nTotal: R$ ${totalPrice.toFixed(2).replace('.', ',')}\n\n`;
    orderText += `-------------------\nForma de pagamento:\n-------------------`;

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
    
    // 3. Limpar e fechar
    clearCart();
    setCustomerInfo({ name: '', phone: '', address: '' });
    onClose();

    toast({
      title: "Pedido Enviado!",
      description: "Seu pedido foi registrado e enviado para o WhatsApp da loja."
    });
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
            <div className="py-6 space-y-8">
              {/* Seção de Identificação */}
              <div className="bg-white/50 p-4 rounded-lg border border-areia-escura space-y-4 animate-in fade-in duration-500">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira mb-2">Identificação</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3" /> Nome Completo *
                    </Label>
                    <Input 
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="bg-white h-9 text-sm"
                      placeholder="Como podemos te chamar?"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase tracking-widest flex items-center gap-2">
                      <Phone className="w-3 h-3" /> WhatsApp *
                    </Label>
                    <Input 
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="bg-white h-9 text-sm"
                      placeholder="(91) 98888-7777"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Endereço de Entrega
                    </Label>
                    <Input 
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      className="bg-white h-9 text-sm"
                      placeholder="Rua, número, bairro..."
                    />
                  </div>
                </div>
              </div>

              <Separator className="opacity-40 bg-areia-escura" />

              {/* Itens do Carrinho */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Itens Selecionados</h4>
                {cart.map((item) => (
                  <div key={item.id} className="group animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-areia-escura">
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
                          <span className="font-body font-bold text-marrom-escuro text-sm">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-6 opacity-40 bg-areia-escura" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-6 bg-white border-t border-areia-escura space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-cinza-organico">
              <span>Subtotal</span>
              <span className="font-body">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-xl font-headline text-marrom-terra pt-2">
              <span>Total</span>
              <span className="font-body">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <Button 
            disabled={cart.length === 0}
            className="w-full bg-verde-folha hover:bg-verde-escuro text-areia-clara py-7 rounded-md font-bold text-lg gap-3 shadow-xl transition-all active:scale-95"
            onClick={handleSendToWhatsApp}
          >
            <MessageSquare className="w-6 h-6" />
            Enviar Pedido pelo WhatsApp
          </Button>
          <p className="text-[10px] text-center text-cinza-organico italic uppercase tracking-widest">
            Sua compra será registrada no sistema
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
