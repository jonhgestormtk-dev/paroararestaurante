'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
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
  ChevronRight,
  MapPin,
  User,
  Phone
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, updateDoc, doc, query, orderBy, Timestamp, where, serverTimestamp } from 'firebase/firestore';
import { Order, OrderStatus, RestaurantSlug, PaymentMethod, OrderType, Product } from '@/lib/types';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

// Configurações de Status
const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string; icon: any }> = {
  'Pendente': { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Pendente', icon: Clock },
  'Em Preparo': { color: '#3B82F6', bg: 'bg-blue-500/10', label: 'Preparando', icon: AlertCircle },
  'Saiu para Entrega': { color: '#8B5CF6', bg: 'bg-violet-500/10', label: 'Em Rota', icon: Truck },
  'Finalizado': { color: '#10B981', bg: 'bg-emerald-500/10', label: 'Finalizado', icon: CheckCircle2 },
  'Cancelado': { color: '#EF4444', bg: 'bg-rose-500/10', label: 'Cancelado', icon: XCircle },
};

const TYPE_CONFIG: Record<OrderType, { icon: any; label: string }> = {
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

const handleSendWhatsAppUpdate = (order: Order) => {
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
    message += `\n🚀 Prepare a mesa! O entregador já está a caminho do seu endereço.`;
  } else if (order.status === 'Em Preparo') {
    message += `\n👨‍🍳 Nossos chefs já estão preparando seu prato com todo carinho.`;
  } else if (order.status === 'Pendente') {
    message += `\n✅ Recebemos seu pedido e estamos processando agora.`;
  } else if (order.status === 'Finalizado') {
    message += `\n✨ Seu pedido foi finalizado! Esperamos que aproveite a experiência.`;
  }

  const phone = order.customer.phone.replace(/\D/g, '');
  window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
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
  let priorityLabel = "NORMAL";
  if (isCritical) { colorClass = "text-rose-500 animate-pulse"; priorityLabel = "CRÍTICO"; }
  else if (isAttention) { colorClass = "text-amber-500"; priorityLabel = "ATENÇÃO"; }

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex items-center gap-1 text-[10px] font-black", colorClass)}>
        <Timer className="w-3 h-3" />
        {minutes} MIN
      </div>
      <Badge className={cn("text-[8px] font-black px-2 py-0 h-4 border-none uppercase tracking-widest", isCritical ? "bg-rose-500 text-white" : isAttention ? "bg-amber-500 text-white" : "bg-emerald-500 text-white")}>
        {priorityLabel}
      </Badge>
    </div>
  );
};

const OrderCard = ({ order, onStatusUpdate, onEdit }: { order: Order; onStatusUpdate: (id: string, s: OrderStatus) => void; onEdit: (order: Order) => void }) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pendente'];
  const type = TYPE_CONFIG[order.type || 'Delivery'];
  const PaymentIcon = PAYMENT_ICONS[order.payment.method] || Wallet;
  
  const isLate = useMemo(() => {
    if (order.status === 'Finalizado' || order.status === 'Cancelado') return false;
    const date = getSafeDate(order.createdAt);
    return Math.floor((new Date().getTime() - date.getTime()) / 60000) >= 36;
  }, [order.createdAt, order.status]);

  const orderTime = useMemo(() => {
    const date = getSafeDate(order.createdAt);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, [order.createdAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative bg-white rounded-2xl p-4 border border-areia-escura/30 shadow-sm hover:shadow-xl transition-all duration-300",
        isLate && "ring-1 ring-rose-500/20 bg-rose-50/20"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-0.5 min-w-0">
          <h4 className="font-subheadline font-bold text-base md:text-lg text-marrom-escuro truncate uppercase tracking-tight italic">
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
        <div className="text-right">
          <p className="text-xs font-black text-marrom-escuro">R$ {order.total.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3 p-2 bg-areia-clara/20 rounded-xl border border-areia-escura/10">
        <div className="flex items-center gap-1 text-[10px] font-bold text-cinza-organico">
          <Clock className="w-3.5 h-3.5 opacity-40" />
          {orderTime}
        </div>
        <div className="h-3 w-px bg-areia-escura/20" />
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

      <div className="mb-4 space-y-1.5 px-2 py-2 border-t border-b border-areia-escura/10 bg-areia-clara/5 rounded-sm">
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

      <div className="flex items-center justify-between">
        <OrderTimer createdAt={order.createdAt} status={order.status} />
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-verde-folha hover:bg-verde-folha/10"
            onClick={() => handleSendWhatsAppUpdate(order)}
            title="Notificar Cliente no WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="w-4 h-4 text-marrom-madeira" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-areia-clara border-areia-escura shadow-2xl">
              {order.status === 'Pendente' && (
                <DropdownMenuItem 
                  onClick={() => onEdit(order)}
                  className="text-[10px] font-black uppercase gap-3 py-2.5 text-marrom-madeira"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar Pedido
                </DropdownMenuItem>
              )}
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <DropdownMenuItem 
                  key={key} 
                  onClick={() => onStatusUpdate(order.id, key as OrderStatus)}
                  className="text-[10px] font-black uppercase gap-3 py-2.5"
                >
                  <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  Mudar para: {cfg.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

const KanbanColumn = ({ title, orders, onStatusUpdate, onEdit, icon: Icon, accentColor }: any) => {
  return (
    <div className="flex flex-col h-full min-w-[310px] md:min-w-[320px] max-w-[400px] bg-areia-clara/10 rounded-3xl border border-areia-escura/20 overflow-hidden">
      <div className="p-4 md:p-5 border-b border-areia-escura/20 bg-white/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${accentColor}15` }}>
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-subheadline text-marrom-escuro tracking-tight italic">{title}</h3>
        </div>
        <Badge className="bg-white border border-areia-escura/30 text-marrom-escuro font-black h-6">{orders.length}</Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 md:p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order: any) => (
              <OrderCard key={order.id} order={order} onStatusUpdate={onStatusUpdate} onEdit={onEdit} />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
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
    updateDoc(docRef, { status: newStatus }).then(() => {
      toast({ title: "Status Atualizado", description: `Pedido movido para: ${newStatus}` });
    });
  };

  const handleSaveOrderEdit = () => {
    if (!db || !editingOrder) return;
    
    const docRef = doc(db, 'orders', editingOrder.id);
    const newTotal = editingOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const dataToUpdate = {
      customer: editingOrder.customer,
      items: editingOrder.items,
      total: newTotal,
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, dataToUpdate)
      .then(() => {
        toast({ title: "Pedido Atualizado", description: "As informações foram salvas com sucesso." });
        setIsEditModalOpen(false);
        setEditingOrder(null);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate
        } satisfies SecurityRuleContext));
      });
  };

  const handleUpdateItemObs = (idx: number, obs: string) => {
    if (!editingOrder) return;
    const newItems = [...editingOrder.items];
    newItems[idx].observations = obs;
    setEditingOrder({ ...editingOrder, items: newItems });
  };

  const handleUpdateItemQty = (idx: number, delta: number) => {
    if (!editingOrder) return;
    const newItems = [...editingOrder.items];
    newItems[idx].quantity = Math.max(1, newItems[idx].quantity + delta);
    setEditingOrder({ ...editingOrder, items: newItems });
  };

  return (
    <div className="h-[calc(100svh-160px)] md:h-[calc(100vh-140px)] flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-areia-escura/30 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-headline text-marrom-terra">Gestão de Pedidos</h1>
          <p className="text-cinza-organico font-subheadline italic text-[10px] md:text-xs">Sincronização multi-restaurante em tempo real.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10 md:h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 text-xs" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
              <SelectTrigger className="flex-1 md:w-40 h-10 md:h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 text-[10px]">
                <div className="flex items-center gap-2"><Store className="w-3.5 h-3.5" /><SelectValue placeholder="Restaurante" /></div>
              </SelectTrigger>
              <SelectContent><SelectItem value="all">Consolidado</SelectItem><SelectItem value="paroara">Paroara</SelectItem><SelectItem value="egua-na-panela">Égua na Panela</SelectItem></SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 md:w-auto h-10 md:h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 gap-2 font-black text-[9px] uppercase tracking-widest px-3">
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
      </div>

      <div className="flex-1 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-4 md:gap-6 h-full min-w-max px-1">
          <KanbanColumn 
            title="Pendentes" 
            orders={kanbanData.pendentes} 
            onStatusUpdate={handleStatusUpdate} 
            onEdit={(order: Order) => { setEditingOrder(order); setIsEditModalOpen(true); }} 
            icon={Clock} 
            accentColor="#F59E0B" 
          />
          <KanbanColumn 
            title="Em Preparo" 
            orders={kanbanData.preparando} 
            onStatusUpdate={handleStatusUpdate} 
            onEdit={(order: Order) => { setEditingOrder(order); setIsEditModalOpen(true); }} 
            icon={Timer} 
            accentColor="#3B82F6" 
          />
          <KanbanColumn 
            title="Saiu Entrega" 
            orders={kanbanData.rota} 
            onStatusUpdate={handleStatusUpdate} 
            onEdit={(order: Order) => { setEditingOrder(order); setIsEditModalOpen(true); }} 
            icon={Truck} 
            accentColor="#8B5CF6" 
          />
          <KanbanColumn 
            title="Finalizados" 
            orders={kanbanData.finalizados} 
            onStatusUpdate={handleStatusUpdate} 
            onEdit={(order: Order) => { setEditingOrder(order); setIsEditModalOpen(true); }} 
            icon={CheckCircle2} 
            accentColor="#10B981" 
          />
        </div>
      </div>

      {/* Modal de Edição de Pedido */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-areia-clara p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[95vh]">
          <DialogHeader className="p-6 bg-marrom-escuro text-areia-clara shrink-0">
            <DialogTitle className="font-headline uppercase tracking-widest flex items-center gap-3">
              <Edit2 className="w-5 h-5 text-caramelo-palha" />
              Editar Pedido #{editingOrder?.orderNumber || editingOrder?.id.substring(0, 6)}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {/* Seção Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-marrom-madeira" />
                    <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Cliente</Label>
                  </div>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Nome do Cliente"
                      value={editingOrder?.customer.name || ''}
                      onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, customer: {...editingOrder.customer, name: e.target.value}} : null)}
                      className="bg-white border-areia-escura h-11 text-sm font-bold"
                    />
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
                      <Input 
                        placeholder="WhatsApp"
                        value={editingOrder?.customer.phone || ''}
                        onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, customer: {...editingOrder.customer, phone: e.target.value.replace(/\D/g, '')}} : null)}
                        className="bg-white border-areia-escura h-11 pl-10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-marrom-madeira" />
                    <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Endereço</Label>
                  </div>
                  <Textarea 
                    placeholder="Endereço de Entrega"
                    value={editingOrder?.customer.address || ''}
                    onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, customer: {...editingOrder.customer, address: e.target.value}} : null)}
                    className="bg-white border-areia-escura min-h-[90px] text-sm italic"
                  />
                </div>
              </div>

              <Separator className="bg-areia-escura/30" />

              {/* Seção Itens */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-marrom-madeira" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Itens do Pedido</Label>
                </div>

                <div className="space-y-4">
                  {editingOrder?.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white/60 rounded-2xl border border-areia-escura/20 space-y-3">
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
                            onClick={() => handleUpdateItemQty(idx, -1)}
                            className="p-1 hover:bg-areia-media/20 rounded-md transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateItemQty(idx, 1)}
                            className="p-1 hover:bg-areia-media/20 rounded-md transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase text-fogo-vibrante/70">Observação do Item</Label>
                        <Input 
                          placeholder="Sem cebola, bem passado..."
                          value={item.observations || ''}
                          onChange={(e) => handleUpdateItemObs(idx, e.target.value)}
                          className="h-9 text-xs bg-white/40 border-areia-escura/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-white border-t border-areia-escura shrink-0 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 text-left w-full">
              <p className="text-[10px] font-black uppercase text-marrom-madeira/40 tracking-widest">Novo Total Estimado</p>
              <p className="text-2xl font-black text-marrom-escuro tracking-tighter">
                R$ {editingOrder?.items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-[10px] font-bold uppercase h-12 px-6">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveOrderEdit}
                className="bg-marrom-terra text-areia-clara h-12 px-10 gap-2 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
