'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  Plus, 
  Minus, 
  Trash2, 
  Store,
  CreditCard,
  Banknote,
  Wallet,
  Search,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Product, RestaurantSlug, PaymentMethod, OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function AdminPDV() {
  const { toast } = useToast();
  const db = useFirestore();
  
  const [restaurantId, setRestaurantId] = useState<RestaurantSlug>('paroara');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [changeFor, setChangeFor] = useState('');

  // Buscar produtos filtrados pelo restaurante selecionado
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('restaurantId', '==', restaurantId)
    );
  }, [db, restaurantId]);
  
  const { data: allProducts, loading: loadingProducts } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => 
      p.active !== false && 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        observations: ''
      }]);
    }
    toast({ title: "Item Adicionado", description: `${product.name} entrou na cesta.` });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const updateObs = (id: string, obs: string) => {
    setCart(cart.map(item => 
      item.productId === id ? { ...item, observations: obs } : item
    ));
  };

  const totalPrice = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const handleFinalize = async () => {
    if (!db) return;
    if (cart.length === 0) {
      toast({ variant: "destructive", title: "Cesta Vazia", description: "Adicione pelo menos um item." });
      return;
    }
    if (!customer.name.trim() || !customer.phone.trim()) {
      toast({ variant: "destructive", title: "Dados do Cliente", description: "Nome e telefone são obrigatórios." });
      return;
    }

    setIsLoading(true);

    const ordersCol = collection(db, 'orders');
    
    // Gerar número de pedido simples baseado no timestamp
    const snapshot = await getDocs(ordersCol);
    const orderNumber = (snapshot.size + 1).toString().padStart(6, '0');

    const orderData = {
      restaurantId,
      orderNumber,
      customer: {
        name: customer.name,
        phone: customer.phone.replace(/\D/g, ''),
        address: customer.address || 'Venda Local / Balcão'
      },
      items: cart,
      total: totalPrice,
      status: 'Finalizado' as OrderStatus,
      payment: {
        method: paymentMethod,
        changeFor: paymentMethod === 'Dinheiro' && changeFor ? Number(changeFor) : null
      },
      createdAt: serverTimestamp()
    };

    addDoc(ordersCol, orderData)
      .then(() => {
        toast({ title: "Venda Realizada", description: `Pedido #${orderNumber} registrado com sucesso.` });
        // Limpar tudo
        setCart([]);
        setCustomer({ name: '', phone: '', address: '' });
        setChangeFor('');
        setIsLoading(false);
      })
      .catch(async () => {
        setIsLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: orderData
        } satisfies SecurityRuleContext));
      });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Venda PDV</h1>
          <p className="text-cinza-organico font-subheadline italic">Realize vendas rápidas direto do balcão.</p>
        </div>
        
        <Select value={restaurantId} onValueChange={(v) => {
          setRestaurantId(v as RestaurantSlug);
          setCart([]); // Limpa a cesta ao trocar de restaurante
        }}>
          <SelectTrigger className="w-full md:w-64 bg-white border-areia-escura">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-marrom-terra" />
              <SelectValue placeholder="Escolha o Restaurante" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paroara">Paroara</SelectItem>
            <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Catálogo de Produtos */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white border-areia-escura">
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
                <Input 
                  placeholder="Buscar no cardápio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-areia-escura focus:ring-marrom-terra"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {loadingProducts ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-marrom-terra opacity-20" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="group flex gap-4 p-3 rounded-xl border border-areia-escura hover:bg-marrom-terra/5 transition-all text-left active:scale-[0.98]"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-areia-escura/30">
                          <img src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200/200`} className="object-cover w-full h-full" alt={product.name} />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="font-subheadline font-bold italic text-marrom-terra text-base md:text-lg truncate uppercase tracking-tighter">
                            {product.name}
                          </h4>
                          <p className="text-[10px] text-marrom-madeira font-black">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="col-span-full text-center py-20 italic text-cinza-organico">Nenhum produto encontrado neste restaurante.</p>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Resumo da Venda */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-10 space-y-6">
            {/* Dados do Cliente */}
            <Card className="bg-white border-areia-escura shadow-sm">
              <CardHeader className="py-4 border-b border-areia-escura/30">
                <CardTitle className="text-sm font-headline flex items-center gap-2">
                  <User className="w-4 h-4 text-marrom-madeira" /> Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Input 
                  placeholder="Nome do Cliente"
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                  className="bg-areia-clara/20 border-areia-escura h-10 text-xs"
                />
                <Input 
                  placeholder="WhatsApp (ex: 91988887777)"
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value.replace(/\D/g, '')})}
                  className="bg-areia-clara/20 border-areia-escura h-10 text-xs"
                />
                <Input 
                  placeholder="Endereço (opcional)"
                  value={customer.address}
                  onChange={(e) => setCustomer({...customer, address: e.target.value})}
                  className="bg-areia-clara/20 border-areia-escura h-10 text-xs"
                />
              </CardContent>
            </Card>

            {/* Cesta */}
            <Card className="bg-white border-areia-escura shadow-xl">
              <CardHeader className="py-4 border-b border-areia-escura/30">
                <CardTitle className="text-sm font-headline flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-marrom-madeira" /> Cesta
                  </div>
                  <Badge className="bg-marrom-terra text-white text-[9px]">{cart.length} ITENS</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[300px]">
                  <div className="p-4 space-y-4">
                    {cart.map((item, idx) => (
                      <div key={item.productId} className="space-y-2 pb-4 border-b border-dashed border-areia-escura/50 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-bold text-marrom-terra uppercase truncate">{item.name}</p>
                            <p className="text-[10px] text-marrom-madeira/60">R$ {item.price.toFixed(2)} un.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-areia-escura rounded-sm bg-areia-clara/10">
                              <button onClick={() => updateQty(item.productId, -1)} className="p-1 hover:bg-areia-media"><Minus className="w-2.5 h-2.5" /></button>
                              <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                              <button onClick={() => updateQty(item.productId, 1)} className="p-1 hover:bg-areia-media"><Plus className="w-2.5 h-2.5" /></button>
                            </div>
                            <button onClick={() => removeItem(item.productId)} className="text-destructive p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <Input 
                          placeholder="Observação do item..."
                          value={item.observations}
                          onChange={(e) => updateObs(item.productId, e.target.value)}
                          className="h-7 text-[9px] border-areia-escura/50"
                        />
                      </div>
                    ))}
                    {cart.length === 0 && (
                      <p className="text-center py-10 italic text-cinza-organico text-xs">Cesta vazia.</p>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 bg-areia-clara/30 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-marrom-madeira">Pagamento</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'Pix', icon: Wallet },
                        { id: 'Dinheiro', icon: Banknote },
                        { id: 'Débito', icon: CreditCard },
                        { id: 'Crédito', icon: CreditCard }
                      ].map(method => (
                        <Button
                          key={method.id}
                          variant={paymentMethod === method.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                          className={cn(
                            "h-9 text-[10px] uppercase font-bold tracking-widest gap-2",
                            paymentMethod === method.id ? "bg-marrom-terra" : "border-areia-escura"
                          )}
                        >
                          <method.icon className="w-3 h-3" /> {method.id}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'Dinheiro' && (
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold">Troco para quanto?</Label>
                      <Input 
                        type="number"
                        placeholder="Ex: 100"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        className="h-8 text-xs border-areia-escura"
                      />
                    </div>
                  )}

                  <Separator className="bg-areia-escura" />

                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Total</span>
                    <span className="text-2xl font-black text-marrom-escuro">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>

                  <Button 
                    onClick={handleFinalize}
                    disabled={isLoading || cart.length === 0}
                    className="w-full h-14 bg-marrom-terra text-white hover:bg-marrom-escuro font-black uppercase tracking-widest text-xs gap-3 shadow-xl"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Finalizar Venda
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
