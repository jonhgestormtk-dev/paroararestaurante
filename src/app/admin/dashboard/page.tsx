'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Store,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
  Loader2,
  Trophy,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Timer,
  AlertCircle,
  Truck,
  CheckCircle2,
  XCircle,
  Wallet,
  MapPin,
  UtensilsCrossed,
  Package,
  TrendingDown,
  Banknote,
  CreditCard,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { Order, OrderStatus, RestaurantSlug, OrderType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Cell,
  Pie
} from 'recharts';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
    <div className="flex items-center gap-1.5 text-[10px] font-black">
      <Timer className={cn("w-3 h-3", colorClass)} />
      <span className={colorClass}>{minutes} MIN</span>
    </div>
  );
};

export default function AdminDashboard() {
  const db = useFirestore();
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | '7days' | '30days'>('today');
  const [restaurantFilter, setRestaurantFilter] = useState<'all' | RestaurantSlug>('all');

  const allOrdersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: allOrders, loading } = useCollection<Order>(allOrdersQuery);

  const handleStatusUpdate = (id: string, newStatus: OrderStatus) => {
    if (!db) return;
    const docRef = doc(db, 'orders', id);
    updateDoc(docRef, { status: newStatus });
  };

  const stats = useMemo(() => {
    if (!allOrders) return null;

    const now = new Date();
    const getStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    let currentStart: Date;
    let currentEnd: Date = new Date();
    currentEnd.setHours(23, 59, 59, 999);
    const todayStart = getStartOfDay(now);

    switch (timeFilter) {
      case 'today': currentStart = todayStart; break;
      case 'yesterday':
        currentStart = new Date(todayStart);
        currentStart.setDate(currentStart.getDate() - 1);
        currentEnd = new Date(todayStart);
        currentEnd.setMilliseconds(-1);
        break;
      case '7days':
        currentStart = new Date(todayStart);
        currentStart.setDate(currentStart.getDate() - 7);
        break;
      case '30days':
        currentStart = new Date(todayStart);
        currentStart.setDate(currentStart.getDate() - 30);
        break;
      default: currentStart = todayStart;
    }

    const getOrderDate = (order: Order) => getSafeDate(order.createdAt);

    const currentOrders = allOrders.filter(o => {
      const date = getOrderDate(o);
      const matchesDate = date >= currentStart && date <= currentEnd;
      const matchesRes = restaurantFilter === 'all' || o.restaurantId === restaurantFilter;
      return matchesDate && matchesRes;
    });

    const activeOrders = allOrders.filter(o => {
      const date = getOrderDate(o);
      const isToday = date >= todayStart;
      const matchesRes = restaurantFilter === 'all' || o.restaurantId === restaurantFilter;
      const isOngoing = o.status !== 'Finalizado' && o.status !== 'Cancelado';
      return isToday && matchesRes && isOngoing;
    });

    const hourlyDataMap: Record<number, { hour: string; revenue: number }> = {};
    for (let i = 0; i < 24; i++) hourlyDataMap[i] = { hour: `${i}h`, revenue: 0 };
    currentOrders.forEach(o => {
      const h = getOrderDate(o).getHours();
      hourlyDataMap[h].revenue += o.total || 0;
    });

    const statusChartData = Object.entries(STATUS_CONFIG).map(([status, config]) => {
      const count = currentOrders.filter(o => o.status === status).length;
      return { name: status, value: count, color: config.color };
    });

    const calculateMetrics = (orders: Order[]) => {
      const p = orders.filter(o => o.restaurantId === 'paroara' && o.status !== 'Cancelado');
      const e = orders.filter(o => o.restaurantId === 'egua-na-panela' && o.status !== 'Cancelado');
      const pRev = p.reduce((acc, o) => acc + (o.total || 0), 0);
      const eRev = e.reduce((acc, o) => acc + (o.total || 0), 0);
      return {
        paroara: { count: p.length, revenue: pRev, avgPrep: p.length > 0 ? 18 : 0 },
        egua: { count: e.length, revenue: eRev, avgPrep: e.length > 0 ? 22 : 0 }
      };
    };

    return {
      current: calculateMetrics(currentOrders),
      hourlyData: Object.values(hourlyDataMap),
      statusChartData,
      recentOrders: activeOrders
    };
  }, [allOrders, timeFilter, restaurantFilter]);

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-areia-clara/30">
      <Loader2 className="w-12 h-12 animate-spin text-marrom-terra opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-marrom-madeira/40">Sincronizando Operação...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="relative overflow-hidden bg-marrom-escuro p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
        <div className="absolute inset-0 bg-rustic-texture opacity-5 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline text-areia-clara tracking-tight">Dashboard</h1>
            <p className="text-caramelo-palha/60 font-subheadline italic">Monitoramento Operacional em Tempo Real</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
              <SelectTrigger className="w-40 bg-transparent border-none text-areia-clara text-xs font-bold focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-marrom-escuro border-white/10 text-areia-clara">
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="7days">7 Dias</SelectItem>
                <SelectItem value="30days">30 Dias</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-white/10" />
            <Select value={restaurantFilter} onValueChange={(v: any) => setRestaurantFilter(v)}>
              <SelectTrigger className="w-52 bg-transparent border-none text-areia-clara text-xs font-bold focus:ring-0">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-caramelo-palha" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-marrom-escuro border-white/10 text-areia-clara">
                <SelectItem value="all">Visão Consolidada</SelectItem>
                <SelectItem value="paroara">Paroara</SelectItem>
                <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { id: 'paroara', name: 'Paroara', color: 'text-marrom-terra', stats: stats?.current.paroara },
          { id: 'egua-na-panela', name: 'Égua na Panela', color: 'text-fogo-vibrante', stats: stats?.current.egua }
        ].map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 border border-areia-escura/30 shadow-xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className={cn("text-[11px] font-subheadline font-bold uppercase tracking-[0.3em] opacity-40 text-marrom-terra")}>Restaurante</h3>
                <h2 className="text-2xl font-headline uppercase">{company.name}</h2>
              </div>
              <Store className={cn("w-6 h-6", company.color)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-subheadline font-bold uppercase text-cinza-organico opacity-60">Pedidos</p>
                <p className="text-2xl font-black">{company.stats?.count}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-subheadline font-bold uppercase text-cinza-organico opacity-60">Faturamento</p>
                <p className="text-xl font-black">{formatBRL(company.stats?.revenue || 0)}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-subheadline font-bold uppercase text-cinza-organico opacity-60">Avg. Preparo</p>
                <p className="text-xl font-black text-marrom-terra">{company.stats?.avgPrep} min</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Card className="bg-white border-areia-escura rounded-[2rem] shadow-2xl overflow-hidden">
        <CardHeader className="p-8 border-b border-areia-escura/20 bg-areia-clara/10 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-marrom-terra">
              <Activity className="w-5 h-5" />
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Painel Operacional Ativo</CardTitle>
            </div>
            <CardDescription className="font-subheadline italic text-xs">Exibindo apenas pedidos em andamento de hoje ({new Date().toLocaleDateString('pt-BR')}).</CardDescription>
          </div>
          <Badge className="bg-marrom-terra text-white uppercase text-[10px] font-black px-4 py-1">Em Preparo/Rota</Badge>
        </CardHeader>
        
        <div className="divide-y divide-areia-escura/10">
          <AnimatePresence mode="popLayout">
            {stats?.recentOrders.map((order) => {
              const orderDate = getSafeDate(order.createdAt);
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pendente'];
              const type = TYPE_CONFIG[order.type || 'Delivery'];
              const PaymentIcon = PAYMENT_ICONS[order.payment.method] || Wallet;
              
              const isLate = Math.floor((new Date().getTime() - orderDate.getTime()) / 60000) >= 36;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-6 flex flex-col md:flex-row md:items-center gap-6 group transition-all relative overflow-hidden",
                    "hover:bg-areia-clara/20",
                    isLate && "bg-rose-50/30 border-l-4 border-rose-500 shadow-inner"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 shrink-0 shadow-sm",
                    order.restaurantId === 'paroara' ? "bg-marrom-terra text-white" : "bg-fogo-vibrante text-white"
                  )}>
                    {order.customer.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-headline text-lg text-marrom-escuro truncate uppercase tracking-tighter italic">
                        {order.customer.name}
                      </h4>
                      {isLate && (
                        <Badge className="bg-rose-500 text-white animate-bounce text-[8px] font-black border-none uppercase">
                          Atrasado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-widest mb-3">
                      <span className={cn(
                        "flex items-center gap-1.5",
                        order.restaurantId === 'paroara' ? "text-marrom-terra" : "text-fogo-vibrante"
                      )}>
                        <Store className="w-3 h-3" />
                        {order.restaurantId === 'egua-na-panela' ? 'Égua na Panela' : 'Paroara'} • #{order.orderNumber || order.id.substring(0, 6)}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-w-md p-3 bg-areia-clara/10 rounded-sm border border-areia-escura/5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <span className="text-[10px] font-bold text-marrom-madeira/80">
                            {item.quantity}x {item.name}
                          </span>
                          {item.observations && (
                            <span className="text-[9px] italic text-fogo-vibrante/70 pl-3 border-l-2 border-fogo-vibrante/20">
                              ↳ {item.observations}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-white/40 p-4 rounded-2xl border border-areia-escura/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 opacity-40" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-marrom-escuro">
                          {orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <OrderTimer createdAt={order.createdAt} status={order.status} />
                      </div>
                    </div>

                    <div className="h-8 w-px bg-areia-escura/30 hidden md:block" />

                    <div className="flex items-center gap-2">
                      <PaymentIcon className="w-3.5 h-3.5 opacity-40" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-cinza-organico uppercase">Pagamento</span>
                        <span className="text-[11px] font-black text-marrom-escuro uppercase">{order.payment.method}</span>
                      </div>
                    </div>

                    <div className="h-8 w-px bg-areia-escura/30 hidden md:block" />

                    <div className="flex items-center gap-2">
                      <type.icon className="w-3.5 h-3.5 opacity-40" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-cinza-organico uppercase">Tipo</span>
                        <span className="text-[11px] font-black text-marrom-escuro uppercase">{type.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[220px]">
                    <div className="flex flex-col items-end">
                      <p className="text-xs font-bold text-cinza-organico uppercase tracking-tighter mb-1">Total</p>
                      <p className="text-xl font-black text-marrom-escuro tracking-tighter">
                        {formatBRL(order.total)}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={cn(
                          "px-4 py-2 rounded-full flex items-center gap-2 border shadow-sm transition-transform hover:scale-105",
                          status.bg
                        )} style={{ borderColor: `${status.color}40` }}>
                          <status.icon className="w-3 h-3" style={{ color: status.color }} />
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: status.color }}>
                            {status.label}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-areia-clara border-areia-escura">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <DropdownMenuItem key={key} onClick={() => handleStatusUpdate(order.id, key as OrderStatus)} className="text-[10px] font-black uppercase gap-2">
                            <cfg.icon className="w-3 h-3" style={{ color: cfg.color }} /> {cfg.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <div className="p-20 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-areia-escura opacity-20" />
                <p className="text-sm italic text-cinza-organico">Nenhum pedido em andamento registrado para hoje.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}