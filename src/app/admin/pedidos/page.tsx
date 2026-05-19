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
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, updateDoc, doc, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { Order, OrderStatus, RestaurantSlug, PaymentMethod, OrderType } from '@/lib/types';
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

// Componente de Contador Realtime
const OrderTimer = ({ createdAt }: { createdAt: any }) => {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const date = createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt?.seconds * 1000 || createdAt);
      const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
      setMinutes(diff);
    };
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const isCritical = minutes >= 36;
  const isAttention = minutes >= 26 && minutes < 36;
  const isNormal = minutes < 26;

  let colorClass = "text-emerald-500";
  let priorityLabel = "NORMAL";
  
  if (isCritical) {
    colorClass = "text-rose-500 animate-pulse";
    priorityLabel = "CRÍTICO";
  } else if (isAttention) {
    colorClass = "text-amber-500";
    priorityLabel = "ATENÇÃO";
  }

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex items-center gap-1 text-[10px] font-black", colorClass)}>
        <Timer className="w-3 h-3" />
        {minutes} MIN
      </div>
      <Badge className={cn(
        "text-[8px] font-black px-2 py-0 h-4 border-none uppercase tracking-widest",
        isCritical ? "bg-rose-500 text-white" : isAttention ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
      )}>
        {priorityLabel}
      </Badge>
    </div>
  );
};

// Card de Pedido Operacional
const OrderCard = ({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (id: string, s: OrderStatus) => void }) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pendente'];
  const type = TYPE_CONFIG[order.type || 'Delivery'];
  const PaymentIcon = PAYMENT_ICONS[order.payment.method] || Wallet;
  const isLate = useMemo(() => {
    const date = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt?.seconds * 1000 || order.createdAt);
    return Math.floor((new Date().getTime() - date.getTime()) / 60000) >= 36;
  }, [order.createdAt]);

  const orderTime = useMemo(() => {
    const date = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt?.seconds * 1000 || order.createdAt);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, [order.createdAt]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative bg-white rounded-2xl p-4 border border-areia-escura/30 shadow-sm hover:shadow-xl transition-all duration-300",
        isLate && order.status !== 'Finalizado' && "ring-1 ring-rose-500/20 bg-rose-50/20 shadow-rose-100"
      )}
    >
      {isLate && order.status !== 'Finalizado' && (
        <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce shadow-lg z-10">
          ATRASADO
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="space-y-0.5 min-w-0">
          <h4 className="font-headline text-sm text-marrom-escuro truncate uppercase tracking-tight">
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 p-2 bg-areia-clara/20 rounded-xl border border-areia-escura/10">
        <div className="flex items-center gap-1 text-[10px] font-bold text-cinza-organico">
          <Clock className="w-3 h-3 opacity-40" />
          {orderTime}
        </div>
        <div className="h-3 w-px bg-areia-escura/20" />
        <div className="flex items-center gap-1 text-[10px] font-bold text-cinza-organico uppercase">
          <PaymentIcon className="w-3 h-3 opacity-40" />
          {order.payment.method}
        </div>
        <div className="h-3 w-px bg-areia-escura/20" />
        <div className="flex items-center gap-1 text-[10px] font-bold text-cinza-organico uppercase">
          <type.icon className="w-3 h-3 opacity-40" />
          {type.label}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <OrderTimer createdAt={order.createdAt} />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-areia-media/20">
              <MoreVertical className="w-4 h-4 text-marrom-madeira" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-areia-clara border-areia-escura">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <DropdownMenuItem 
                key={key} 
                onClick={() => onStatusUpdate(order.id, key as OrderStatus)}
                className="text-[10px] font-black uppercase tracking-widest gap-3 py-2.5"
              >
                <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                {cfg.label}
              </DropdownMenuItem>
            ))}
            <div className="h-px bg-areia-escura/20 my-1" />
            <DropdownMenuItem 
              onClick={() => {
                const phone = order.customer.phone.replace(/\D/g, '');
                window.open(`https://wa.me/${phone}`, '_blank');
              }}
              className="text-[10px] font-black uppercase tracking-widest gap-3 py-2.5 text-verde-folha"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

// Coluna do Kanban
const KanbanColumn = ({ 
  title, 
  status, 
  orders, 
  onStatusUpdate,
  icon: Icon,
  accentColor
}: { 
  title: string; 
  status: OrderStatus; 
  orders: Order[]; 
  onStatusUpdate: (id: string, s: OrderStatus) => void;
  icon: any;
  accentColor: string;
}) => {
  return (
    <div className="flex flex-col h-full min-w-[310px] md:min-w-[320px] max-w-[400px] bg-areia-clara/10 rounded-3xl border border-areia-escura/20 overflow-hidden snap-center md:snap-start">
      <div className="p-4 md:p-5 border-b border-areia-escura/20 bg-white/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${accentColor}15` }}>
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <h3 className="text-[10px] md:text-xs font-subheadline font-bold uppercase tracking-[0.2em] text-marrom-escuro">{title}</h3>
        </div>
        <Badge className="bg-white border border-areia-escura/30 text-marrom-escuro font-black h-6">
          {orders.length}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 md:p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onStatusUpdate={onStatusUpdate} />
            ))}
          </AnimatePresence>
          {orders.length === 0 && (
            <div className="py-20 text-center space-y-3 opacity-10">
              <Icon className="w-10 h-10 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhum pedido</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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
      const orderDate = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt?.seconds * 1000 || o.createdAt);
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

  const handleStatusUpdate = async (id: string, newStatus: OrderStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      toast({ title: "Status Atualizado", description: `Pedido movido para: ${newStatus}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao atualizar" });
    }
  };

  return (
    <div className="h-[calc(100svh-160px)] md:h-[calc(100vh-140px)] flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-700">
      {/* Header Operacional */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-areia-escura/30 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-headline text-marrom-terra">Gestão Operacional</h1>
          <p className="text-cinza-organico font-subheadline italic text-[10px] md:text-xs">Acompanhamento multi-restaurante em tempo real.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 md:h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 text-xs"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
              <SelectTrigger className="flex-1 md:w-40 h-10 md:h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 text-[10px]">
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-marrom-madeira" />
                  <SelectValue placeholder="Restaurante" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Consolidado</SelectItem>
                <SelectItem value="paroara">Paroara</SelectItem>
                <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 md:w-auto h-10 md:h-11 rounded-xl bg-areia-clara/10 border-areia-escura/30 gap-2 font-black text-[9px] uppercase tracking-widest px-3">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {selectedDate ? format(selectedDate, "dd 'de' MMM", { locale: ptBR }) : "Data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Kanban Board - Scroll Snap para Mobile */}
      <div className="flex-1 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
        <div className="flex gap-4 md:gap-6 h-full min-w-max px-1">
          <KanbanColumn 
            title="Pendentes" 
            status="Pendente" 
            orders={kanbanData.pendentes} 
            onStatusUpdate={handleStatusUpdate}
            icon={Clock}
            accentColor="#F59E0B"
          />
          <KanbanColumn 
            title="Em Preparo" 
            status="Em Preparo" 
            orders={kanbanData.preparando} 
            onStatusUpdate={handleStatusUpdate}
            icon={Timer}
            accentColor="#3B82F6"
          />
          <KanbanColumn 
            title="Saiu Entrega" 
            status="Saiu para Entrega" 
            orders={kanbanData.rota} 
            onStatusUpdate={handleStatusUpdate}
            icon={Truck}
            accentColor="#8B5CF6"
          />
          <KanbanColumn 
            title="Finalizados" 
            status="Finalizado" 
            orders={kanbanData.finalizados} 
            onStatusUpdate={handleStatusUpdate}
            icon={CheckCircle2}
            accentColor="#10B981"
          />
        </div>
      </div>
    </div>
  );
}
