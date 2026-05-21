
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  MoreVertical,
  Calendar as CalendarIcon,
  Store,
  Package,
  UtensilsCrossed,
  Wallet,
  CreditCard,
  Banknote,
  XCircle,
  Timer,
  Edit2,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Save,
  MapPin,
  User,
  Phone
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { 
  collection, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';
import { Order, OrderStatus, RestaurantSlug } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string; icon: any }> = {
  'Pendente': { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Pendente', icon: Clock },
  'Em Preparo': { color: '#3B82F6', bg: 'bg-blue-500/10', label: 'Preparando', icon: AlertCircle },
  'Saiu para Entrega': { color: '#8B5CF6', bg: 'bg-violet-500/10', label: 'Em Rota', icon: Truck },
  'Finalizado': { color: '#10B981', bg: 'bg-emerald-500/10', label: 'Finalizado', icon: CheckCircle2 },
  'Cancelado': { color: '#EF4444', bg: 'bg-rose-500/10', label: 'Cancelado', icon: XCircle },
};

const TYPE_CONFIG: Record<string, { icon: any; label: string }> = {
  'Delivery': { icon: Truck, label: 'Delivery' },
  'Retirada': { icon: Package, label: 'Retirada' },
  'Salão': { icon: UtensilsCrossed, label: 'No Salão' },
};

const PAYMENT_ICONS: Record<string, any> = {
  'Pix': Wallet,
  'Dinheiro': Banknote,
  'Débito': CreditCard,
  'Crédito': CreditCard
};

const getSafeDate = (createdAt: any) => {
  if (!createdAt) return new Date();
  if (createdAt instanceof Timestamp) return createdAt.toDate();
  if (typeof createdAt?.toDate === 'function') return createdAt.toDate();
  if (createdAt?.seconds) return new Date(createdAt.seconds * 1000);
  return new Date(createdAt);
};

const OrderTimer = ({ createdAt, status }: { createdAt: any; status: OrderStatus }) => {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (status === 'Finalizado' || status === 'Cancelado') return;
    const calculate = () => {
      const date = getSafeDate(createdAt);
      const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
      setMinutes(Math.max(0, diff));
    };
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (status === 'Finalizado' || status === 'Cancelado') {
    return (
      <div className="flex items-center gap-2 text-cinza-organico/40">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Concluído</span>
      </div>
    );
  }

  const isCritical = minutes >= 36;
  const isAttention = minutes >= 26 && minutes < 36;
  let colorClass = "text-emerald-500";
  if (isCritical) colorClass = "text-rose-500 animate-pulse";
  else if (isAttention) colorClass = "text-amber-500";

  return (
    <div className={cn("flex items-center gap-1 text-[10px] font-black", colorClass)}>
      <Timer className="w-3 h-3" />
      {minutes} MIN
    </div>
  );
};

const OrderCard = ({ 
  order, 
  onStatusUpdate, 
  onEdit,
  onNotify 
}: { 
  order: Order; 
  onStatusUpdate: (id: string, s: OrderStatus) => void; 
  onEdit: (order: Order) => void;
  onNotify: (order: Order) => void;
}) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pendente'];
  const type = TYPE_CONFIG[order.type || 'Delivery'] || TYPE_CONFIG['Delivery'];
  const PaymentIcon = PAYMENT_ICONS[order.payment.method] || Wallet;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white rounded-2xl p-4 border border-areia-escura/30 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-subheadline font-bold text-lg text-marrom-escuro truncate uppercase tracking-tight italic">
            {order.customer.name}
          </h4>
          <p className={cn(
            "text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
            order.restaurantId === 'paroara' ? "text-marrom-terra" : "text-fogo-vibrante"
          )}>
            <Store className="w-3 h-3" />
            {order.restaurantId === 'egua-na-panela' ? 'Égua na Panela' : 'Paroara'} • #{order.orderNumber || order.id.substring(0, 6)}
          </p>
        </div>
        <div className="text-right ml-2">
          <p className="text-xs font-black text-marrom-escuro">R$ {order.total.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3 p-2 bg-areia-clara/20 rounded-xl border border-areia-escura/10">
        <div className="flex items-center gap-1 text-[10px] font-bold text-cinza-organico uppercase">
          <PaymentIcon className="w-3.5 h-3.5 opacity-40" />
          {order.payment.method}
        </div>
        <div className="h-3 w-px bg-areia-escura/20" />
        <div className="flex items-center gap-1 text-[10px] font-bold text-cinza-organico uppercase">
          <type.icon className="w-3.5 h-3.5 opacity-40" />
          {type.label}
        </div>
      </div>

      <div className="mb-4 space-y-1.5 px-2 py-2 border-t border-b border-areia-escura/10">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-[10px] font-bold text-marrom-madeira/80 truncate leading-tight">
              {item.quantity}x {item.name}
            </span>
            {item.observations && (
              <p className="text-[9px] italic text-fogo-vibrante/70 pl-3 leading-tight border-l-2 border-fogo-vibrante/20 mt-0.5">
                ↳ {item.observations}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <OrderTimer createdAt={order.createdAt} status={order.status} />
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-verde-folha hover:bg-verde-folha/10"
            onClick={() => onNotify(order)}
            title="Notificar Cliente"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="w-4 h-4 text-marrom-madeira" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-areia-clara border-areia-escura shadow-xl">
              {order.status === 'Pendente' && (
                <DropdownMenuItem 
                  onSelect={() => onEdit(order)}
                  className="text-[10px] font-black uppercase gap-3 py-2.5 text-marrom-madeira cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar Pedido
                </DropdownMenuItem>
              )}
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                if (key === order.status) return null;
                return (
                  <DropdownMenuItem 
                    key={key} 
                    onSelect={() => onStatusUpdate(order.id, key as OrderStatus)}
                    className="text-[10px] font-black uppercase gap-3 py-2.5 cursor-pointer"
                  >
                    <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    Mover para: {cfg.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

const KanbanColumn = ({ title, orders, onStatusUpdate, onEdit, onNotify, icon: Icon, accentColor, isMobile = false }: any) => {
  return (
    <div className={cn(
      "flex flex-col h-full bg-areia-clara/10 rounded-3xl border border-areia-escura/20 overflow-hidden",
      isMobile ? "w-full" : "min-w-[310px] max-w-[400px]"
    )}>
      {!isMobile && (
        <div className="p-4 md:p-5 border-b border-areia-escura/20 bg-white/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${accentColor}15` }}>
              <Icon className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <h3 className="text-xl font-bold font-subheadline text-marrom-escuro tracking-tight italic">{title}</h3>
          </div>
          <Badge className="bg-white border border-areia-escura/30 text-marrom-escuro font-black h-6">{orders.length}</Badge>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="p-3 md:p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {orders.length > 0 ? (
              orders.map((order: any) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={onStatusUpdate} 
                  onEdit={onEdit}
                  onNotify={onNotify}
                />
              ))
            ) : (
              <div className="py-20 text-center opacity-30 italic text-xs">
                Nenhum pedido aqui
              </div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

const EditOrderDialogContent = ({ 
  order, 
  onSave, 
  onClose 
}: { 
  order: Order; 
  onSave: (updatedOrder: Order) => void; 
  onClose: () => void 
}) => {
  const [localOrder, setLocalOrder] = useState<Order>(() => JSON.parse(JSON.stringify(order)));
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateItemObs = (idx: number, obs: string) => {
    const newItems = [...localOrder.items];
    newItems[idx] = { ...newItems[idx], observations: obs };
    setLocalOrder({ ...localOrder, items: newItems });
  };

  const handleUpdateItemQty = (idx: number, delta: number) => {
    const newItems = [...localOrder.items];
    const newQty = Math.max(1, (newItems[idx].quantity || 0) + delta);
    newItems[idx] = { ...newItems[idx], quantity: newQty };
    setLocalOrder({ ...localOrder, items: newItems });
  };

  const handleTriggerSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    onSave(localOrder);
  };

  const currentTotal = localOrder.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3.5 h-3.5 text-marrom-madeira" />
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Cliente</Label>
              </div>
              <div className="space-y-3">
                <Input 
                  placeholder="Nome do Cliente"
                  value={localOrder.customer.name}
                  onChange={(e) => setLocalOrder({...localOrder, customer: {...localOrder.customer, name: e.target.value}})}
                  className="bg-white border-areia-escura h-11 text-sm font-bold rounded-xl"
                />
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
                  <Input 
                    placeholder="WhatsApp"
                    value={localOrder.customer.phone}
                    onChange={(e) => setLocalOrder({...localOrder, customer: {...localOrder.customer, phone: e.target.value.replace(/\D/g, '')}})}
                    className="bg-white border-areia-escura h-11 pl-10 text-sm rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3.5 h-3.5 text-marrom-madeira" />
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Endereço</Label>
              </div>
              <Textarea 
                placeholder="Endereço de Entrega"
                value={localOrder.customer.address}
                onChange={(e) => setLocalOrder({...localOrder, customer: {...localOrder.customer, address: e.target.value}})}
                className="bg-white border-areia-escura min-h-[90px] text-sm italic rounded-xl resize-none"
              />
            </div>
          </div>

          <Separator className="bg-areia-escura/30" />

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-marrom-madeira" />
              <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Itens do Pedido</Label>
            </div>

            <div className="space-y-4">
              {localOrder.items?.map((item, idx) => (
                <div key={idx} className="p-4 bg-white/60 rounded-2xl border border-areia-escura/20 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="font-subheadline font-bold text-lg text-marrom-escuro uppercase italic leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-black text-marrom-madeira/60">
                        un. R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-areia-escura/40 rounded-xl p-1 shadow-sm">
                      <button 
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, -1)}
                        className="p-1 hover:bg-areia-media/20 rounded-md"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, 1)}
                        className="p-1 hover:bg-areia-media/20 rounded-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-fogo-vibrante/70">Observação do Item</Label>
                    <Input 
                      placeholder="Ex: Sem cebola..."
                      value={item.observations || ''}
                      onChange={(e) => handleUpdateItemObs(idx, e.target.value)}
                      className="h-9 text-xs bg-white/40 border-areia-escura/50 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="p-5 md:p-6 bg-white border-t border-areia-escura shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left w-full md:w-auto">
          <p className="text-[9px] font-black uppercase text-marrom-madeira/40 tracking-widest">Novo Total</p>
          <p className="text-2xl font-black text-marrom-escuro tracking-tighter">
            R$ {currentTotal.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="ghost" onClick={onClose} disabled={isSaving} className="flex-1 md:flex-none text-[10px] font-bold uppercase h-12 rounded-xl">
            Cancelar
          </Button>
          <Button 
            onClick={handleTriggerSave}
            disabled={isSaving}
            className="flex-[2] md:flex-none bg-marrom-terra text-areia-clara h-12 px-8 gap-2 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
};

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  const { toast } = useToast();
  const db = useFirestore();

  // Trava de Segurança de Interface: Força restauração de eventos de ponteiro ao fechar o modal
  useEffect(() => {
    if (!isEditModalOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = 'auto';
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEditModalOpen]);

  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: allOrders, loading } = useCollection<Order>(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter(o => {
      const orderDate = getSafeDate(o.createdAt);
      const matchesDate = !selectedDate || isSameDay(orderDate, selectedDate);
      const matchesRes = restaurantFilter === 'all' || o.restaurantId === restaurantFilter;
      const matchesSearch = o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           o.orderNumber?.includes(searchTerm);
      return matchesDate && matchesRes && matchesSearch;
    });
  }, [allOrders, selectedDate, restaurantFilter, searchTerm]);

  const kanbanData = useMemo(() => {
    return {
      pendentes: filteredOrders.filter(o => o.status === 'Pendente'),
      preparando: filteredOrders.filter(o => o.status === 'Em Preparo'),
      rota: filteredOrders.filter(o => o.status === 'Saiu para Entrega'),
      finalizados: filteredOrders.filter(o => o.status === 'Finalizado' || o.status === 'Cancelado'),
    };
  }, [filteredOrders]);

  const handleStatusUpdate = (id: string, newStatus: OrderStatus) => {
    if (!db) return;
    const docRef = doc(db, 'orders', id);
    const dataToUpdate = { status: newStatus, updatedAt: serverTimestamp() };
    
    updateDoc(docRef, dataToUpdate)
      .then(() => {
        toast({ title: "Status Atualizado", description: `Pedido movido para: ${newStatus}` });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate
        } satisfies SecurityRuleContext));
      });
  };

  const handleNotifyClient = (order: Order) => {
    const restaurantName = order.restaurantId === 'paroara' ? 'PAROARA' : 'Égua na Panela';
    const statusLabel = STATUS_CONFIG[order.status]?.label || order.status;
    
    let message = `Olá, *${order.customer.name}*! 👋\n\n`;
    message += `Temos uma atualização do seu pedido no *${restaurantName}*.\n\n`;
    message += `📍 *Status Atual:* _${statusLabel}_\n`;
    message += `🔢 *Pedido:* #${order.orderNumber || order.id.substring(0, 6)}\n\n`;
    
    message += `*Resumo do Pedido:*\n`;
    order.items.forEach(item => {
      message += `• ${item.quantity}x ${item.name}${item.observations ? ` (_${item.observations}_)` : ''}\n`;
    });
    
    message += `\n💰 *Total:* R$ ${order.total.toFixed(2).replace('.', ',')}\n`;
    
    if (order.status === 'Saiu para Entrega') {
      message += `\n🚀 Prepare a mesa! O entregador já está a caminho.`;
    } else if (order.status === 'Em Preparo') {
      message += `\n👨‍🍳 Nossos chefs já estão preparando seu prato com todo carinho.`;
    } else if (order.status === 'Finalizado') {
      message += `\n✨ Seu pedido foi finalizado! Esperamos que aproveite.`;
    }

    const phone = order.customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleSaveOrderEdit = (updatedOrder: Order) => {
    if (!db) return;
    
    // Fecha o modal imediatamente para evitar travamento na UI
    setIsEditModalOpen(false);
    
    const docRef = doc(db, 'orders', updatedOrder.id);
    const newTotal = updatedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const dataToUpdate = {
      customer: updatedOrder.customer,
      items: updatedOrder.items,
      total: newTotal,
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, dataToUpdate)
      .then(() => {
        setEditingOrder(null);
        toast({ title: "Pedido Atualizado", description: "As informações foram salvas com sucesso." });
      })
      .catch((err) => {
        setEditingOrder(null);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate
        } satisfies SecurityRuleContext));
      });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-10 h-10 animate-spin text-marrom-terra opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-marrom-madeira/40">Sincronizando Pedidos...</p>
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-700">
      {/* Header com Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-areia-escura/30 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-headline text-marrom-terra">Gestão de Pedidos</h1>
          <p className="hidden md:block text-cinza-organico font-subheadline italic text-xs">Acompanhamento e edição em tempo real.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-3">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 text-xs" 
            />
          </div>
          <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
            <SelectTrigger className="w-full lg:w-40 h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 text-[10px]">
              <div className="flex items-center gap-2"><Store className="w-3.5 h-3.5" /><SelectValue placeholder="Restaurante" /></div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paroara">Paroara</SelectItem>
              <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild className="sm:col-span-2 lg:col-span-1">
              <Button variant="outline" className="w-full lg:w-auto h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 gap-2 font-black text-[9px] uppercase tracking-widest px-4">
                <CalendarIcon className="w-3.5 h-3.5" />
                {selectedDate ? format(selectedDate, "dd 'de' MMM", { locale: ptBR }) : "Data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={ptBR} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Mobile Tabs View */}
      <div className="lg:hidden flex-1 overflow-hidden">
        <Tabs defaultValue="pendentes" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 bg-areia-media/20 p-1 rounded-xl mx-1 h-auto">
            <TabsTrigger 
              value="pendentes" 
              className="text-[10px] font-black uppercase rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-600 border-b-2 border-transparent data-[state=active]:border-amber-600"
            >
              PND ({kanbanData.pendentes.length})
            </TabsTrigger>
            <TabsTrigger 
              value="preparando" 
              className="text-[10px] font-black uppercase rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              PRE ({kanbanData.preparando.length})
            </TabsTrigger>
            <TabsTrigger 
              value="rota" 
              className="text-[10px] font-black uppercase rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-600 border-b-2 border-transparent data-[state=active]:border-violet-600"
            >
              ROT ({kanbanData.rota.length})
            </TabsTrigger>
            <TabsTrigger 
              value="finalizados" 
              className="text-[10px] font-black uppercase rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 border-b-2 border-transparent data-[state=active]:border-emerald-600"
            >
              FIM ({kanbanData.finalizados.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 mt-4 overflow-hidden">
            <TabsContent value="pendentes" className="h-full m-0 p-0">
              <KanbanColumn orders={kanbanData.pendentes} onStatusUpdate={handleStatusUpdate} onEdit={handleOpenEdit} onNotify={handleNotifyClient} isMobile />
            </TabsContent>
            <TabsContent value="preparando" className="h-full m-0 p-0">
              <KanbanColumn orders={kanbanData.preparando} onStatusUpdate={handleStatusUpdate} onEdit={handleOpenEdit} onNotify={handleNotifyClient} isMobile />
            </TabsContent>
            <TabsContent value="rota" className="h-full m-0 p-0">
              <KanbanColumn orders={kanbanData.rota} onStatusUpdate={handleStatusUpdate} onEdit={handleOpenEdit} onNotify={handleNotifyClient} isMobile />
            </TabsContent>
            <TabsContent value="finalizados" className="h-full m-0 p-0">
              <KanbanColumn orders={kanbanData.finalizados} onStatusUpdate={handleStatusUpdate} onEdit={handleOpenEdit} onNotify={handleNotifyClient} isMobile />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Desktop Kanban View */}
      <div className="hidden lg:flex flex-1 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-6 h-full min-w-max px-1">
          <KanbanColumn 
            title="Pendentes" 
            orders={kanbanData.pendentes} 
            onStatusUpdate={handleStatusUpdate} 
            onEdit={handleOpenEdit} 
            onNotify={handleNotifyClient}
            icon={Clock} 
            accentColor="#F59E0B" 
          />
          <KanbanColumn 
            title="Em Preparo" 
            orders={kanbanData.preparando} 
            onStatusUpdate={handleStatusUpdate} 
            onEdit={handleOpenEdit} 
            onNotify={handleNotifyClient}
            icon={Timer} 
            accentColor="#3B82F6" 
          />
          <KanbanColumn 
            title="Saiu Entrega" 
            orders={kanbanData.rota} 
            onStatusUpdate={handleStatusUpdate} 
            onEdit={handleOpenEdit} 
            onNotify={handleNotifyClient}
            icon={Truck} 
            accentColor="#8B5CF6" 
          />
          <KanbanColumn 
            title="Finalizados" 
            orders={kanbanData.finalizados} 
            onStatusUpdate={handleStatusUpdate} 
            onEdit={handleOpenEdit} 
            onNotify={handleNotifyClient}
            icon={CheckCircle2} 
            accentColor="#10B981" 
          />
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditModalOpen(false);
          setTimeout(() => setEditingOrder(null), 200);
        }
      }}>
        <DialogContent className="max-w-2xl bg-areia-clara p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[95vh] md:h-auto max-h-[95vh] md:max-h-[90vh]">
          <DialogHeader className="p-5 md:p-6 bg-marrom-escuro text-areia-clara shrink-0">
            <DialogTitle className="font-headline uppercase tracking-widest flex items-center gap-3 text-sm md:text-base">
              <Edit2 className="w-4 h-4 md:w-5 md:h-5 text-caramelo-palha" />
              Editar Pedido #{editingOrder?.orderNumber || editingOrder?.id.substring(0, 6)}
            </DialogTitle>
          </DialogHeader>

          {editingOrder && (
            <EditOrderDialogContent 
              order={editingOrder} 
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleSaveOrderEdit} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
