
'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Store,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Filter,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { 
  collection, 
  query, 
  limit, 
  orderBy, 
  Timestamp
} from 'firebase/firestore';
import { Order, OrderStatus, RestaurantSlug } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<OrderStatus, string> = {
  'Pendente': 'text-fogo-vibrante bg-fogo-vibrante/10 border-fogo-vibrante/30 font-black',
  'Em Preparo': 'text-amber-600 bg-amber-600/10 border-amber-600/30 font-black',
  'Saiu para Entrega': 'text-blue-600 bg-blue-600/10 border-blue-600/30 font-black',
  'Finalizado': 'text-emerald-600 bg-emerald-600/10 border-emerald-600/30 font-black',
};

type TimeFilter = 'today' | 'yesterday' | '7days' | '30days';
type RestaurantFilter = 'all' | RestaurantSlug;

export default function AdminDashboard() {
  const db = useFirestore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [restaurantFilter, setRestaurantFilter] = useState<RestaurantFilter>('all');

  const allOrdersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: allOrders, loading } = useCollection<Order>(allOrdersQuery);

  const stats = useMemo(() => {
    if (!allOrders) return null;

    const now = new Date();
    const getStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    let currentStart: Date;
    let currentEnd: Date = new Date();
    let prevStart: Date;
    let prevEnd: Date;

    const todayStart = getStartOfDay(now);

    switch (timeFilter) {
      case 'today':
        currentStart = todayStart;
        prevStart = new Date(todayStart);
        prevStart.setDate(prevStart.getDate() - 1);
        prevEnd = todayStart;
        break;
      case 'yesterday':
        currentStart = new Date(todayStart);
        currentStart.setDate(currentStart.getDate() - 1);
        currentEnd = todayStart;
        prevStart = new Date(currentStart);
        prevStart.setDate(prevStart.getDate() - 1);
        prevEnd = currentStart;
        break;
      case '7days':
        currentStart = new Date(todayStart);
        currentStart.setDate(currentStart.getDate() - 7);
        prevStart = new Date(currentStart);
        prevStart.setDate(prevStart.getDate() - 7);
        prevEnd = currentStart;
        break;
      case '30days':
        currentStart = new Date(todayStart);
        currentStart.setDate(currentStart.getDate() - 30);
        prevStart = new Date(currentStart);
        prevStart.setDate(prevStart.getDate() - 30);
        prevEnd = currentStart;
        break;
      default:
        currentStart = todayStart;
        prevStart = todayStart;
        prevEnd = todayStart;
    }

    const getOrderDate = (order: Order) => {
      if (order.createdAt instanceof Timestamp) return order.createdAt.toDate();
      if (order.createdAt?.seconds) return new Date(order.createdAt.seconds * 1000);
      return new Date(order.createdAt);
    };

    const filterByResAndDate = (orders: Order[], start: Date, end: Date) => {
      return orders.filter(o => {
        const date = getOrderDate(o);
        const matchesDate = date >= start && date < end;
        const matchesRes = restaurantFilter === 'all' || o.restaurantId === restaurantFilter;
        return matchesDate && matchesRes;
      });
    };

    const currentOrders = filterByResAndDate(allOrders, currentStart, currentEnd);
    const previousOrders = filterByResAndDate(allOrders, prevStart, prevEnd);

    const calculateMetrics = (orders: Order[]) => {
      const paroara = orders.filter(o => o.restaurantId === 'paroara');
      const egua = orders.filter(o => o.restaurantId === 'egua-na-panela');

      const pRev = paroara.reduce((acc, o) => acc + (o.total || 0), 0);
      const eRev = egua.reduce((acc, o) => acc + (o.total || 0), 0);

      return {
        paroara: { 
          count: paroara.length, 
          revenue: pRev, 
          ticket: paroara.length > 0 ? pRev / paroara.length : 0 
        },
        egua: { 
          count: egua.length, 
          revenue: eRev, 
          ticket: egua.length > 0 ? eRev / egua.length : 0 
        },
        total: {
          count: orders.length,
          revenue: pRev + eRev,
          ticket: orders.length > 0 ? (pRev + eRev) / orders.length : 0
        }
      };
    };

    const current = calculateMetrics(currentOrders);
    const previous = calculateMetrics(previousOrders);

    const getGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const getDiff = (curr: number, prev: number) => curr - prev;

    return {
      current,
      growth: {
        paroara: {
          count: getDiff(current.paroara.count, previous.paroara.count),
          revenue: getGrowth(current.paroara.revenue, previous.paroara.revenue)
        },
        egua: {
          count: getDiff(current.egua.count, previous.egua.count),
          revenue: getGrowth(current.egua.revenue, previous.egua.revenue)
        },
        total: {
          count: getDiff(current.total.count, previous.total.count),
          revenue: getGrowth(current.total.revenue, previous.total.revenue)
        }
      }
    };
  }, [allOrders, timeFilter, restaurantFilter]);

  const recentOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders
      .filter(o => restaurantFilter === 'all' || o.restaurantId === restaurantFilter)
      .slice(0, 5);
  }, [allOrders, restaurantFilter]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const GrowthBadge = ({ value, isPercentage = true }: { value: number; isPercentage?: boolean }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    const labelSuffix = timeFilter === 'today' ? 'vs ontem' : 
                        timeFilter === 'yesterday' ? 'vs anteontem' : 
                        timeFilter === '7days' ? 'vs 7d ant.' : 'vs 30d ant.';

    return (
      <div className={cn(
        "flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full border",
        isPositive 
          ? "text-verde-folha bg-verde-folha/5 border-verde-folha/10" 
          : "text-destructive bg-destructive/5 border-destructive/10"
      )}>
        {isPositive ? (
          isPercentage ? <ArrowUpRight className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />
        ) : (
          isPercentage ? <ArrowDownRight className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />
        )}
        {Math.abs(value).toFixed(0)}{isPercentage ? '%' : ''} 
        <span className="opacity-40 ml-0.5 font-normal">{labelSuffix}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-marrom-terra opacity-20" />
        <p className="text-xs font-black uppercase tracking-widest text-marrom-madeira/40">Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Filtros de Topo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-xl border border-areia-escura/30 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Dashboard</h1>
          <p className="text-cinza-organico font-subheadline italic flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Desempenho e Métricas Multi-Empresa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-marrom-madeira/60 px-1">Período</label>
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="w-40 bg-areia-clara/20 border-areia-escura/50 h-10 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-marrom-madeira/60 px-1">Restaurante</label>
            <Select value={restaurantFilter} onValueChange={(v) => setRestaurantFilter(v as RestaurantFilter)}>
              <SelectTrigger className="w-52 bg-areia-clara/20 border-areia-escura/50 h-10 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 opacity-40" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Consolidado (Todos)</SelectItem>
                <SelectItem value="paroara">Paroara</SelectItem>
                <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pedidos Diários */}
        <Card className="bg-white border-areia-escura overflow-hidden shadow-sm">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Volume de Pedidos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {(restaurantFilter === 'all' || restaurantFilter === 'paroara') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Paroara</span>
                  <span className="text-3xl font-black text-marrom-terra">{stats?.current.paroara.count || 0}</span>
                </div>
              </div>
            )}
            
            {restaurantFilter === 'all' && <div className="h-px bg-areia-escura/20" />}

            {(restaurantFilter === 'all' || restaurantFilter === 'egua-na-panela') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Égua na Panela</span>
                  <span className="text-3xl font-black text-fogo-vibrante">{stats?.current.egua.count || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Faturamento Diário */}
        <Card className="bg-white border-areia-escura overflow-hidden shadow-sm">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Faturamento Bruto</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {(restaurantFilter === 'all' || restaurantFilter === 'paroara') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Paroara</span>
                  <span className="text-xl font-black text-marrom-terra">{formatBRL(stats?.current.paroara.revenue || 0)}</span>
                </div>
                <div className="flex justify-end">
                  <GrowthBadge value={stats?.growth.paroara.revenue || 0} isPercentage={true} />
                </div>
              </div>
            )}

            {restaurantFilter === 'all' && <div className="h-px bg-areia-escura/20" />}

            {(restaurantFilter === 'all' || restaurantFilter === 'egua-na-panela') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Égua na Panela</span>
                  <span className="text-xl font-black text-fogo-vibrante">{formatBRL(stats?.current.egua.revenue || 0)}</span>
                </div>
                <div className="flex justify-end">
                  <GrowthBadge value={stats?.growth.egua.revenue || 0} isPercentage={true} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Médio Diário */}
        <Card className="bg-white border-areia-escura overflow-hidden shadow-sm">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Ticket Médio</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {(restaurantFilter === 'all' || restaurantFilter === 'paroara') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Paroara</span>
                  <span className="text-xl font-black text-marrom-terra">{formatBRL(stats?.current.paroara.ticket || 0)}</span>
                </div>
              </div>
            )}

            {restaurantFilter === 'all' && <div className="h-px bg-areia-escura/20" />}

            {(restaurantFilter === 'all' || restaurantFilter === 'egua-na-panela') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Égua na Panela</span>
                  <span className="text-xl font-black text-fogo-vibrante">{formatBRL(stats?.current.egua.ticket || 0)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden shadow-sm">
        <CardHeader className="p-6 bg-marrom-escuro text-areia-clara">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-caramelo-palha" />
            <CardTitle className="text-lg font-headline tracking-widest uppercase">Últimas Atividades</CardTitle>
          </div>
        </CardHeader>
        <div className="divide-y divide-areia-escura/30">
          {recentOrders?.map(order => (
            <div key={order.id} className="flex items-center justify-between p-6 hover:bg-areia-clara/5 transition-colors">
              <div>
                <p className="font-bold text-marrom-terra text-sm uppercase">{order.customer.name}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className={`text-[8px] font-black tracking-widest uppercase ${order.restaurantId === 'paroara' ? 'border-marrom-terra text-marrom-terra' : 'border-fogo-vibrante text-fogo-vibrante'}`}>
                    {order.restaurantId === 'egua-na-panela' ? 'Égua na Panela' : 'Paroara'}
                  </Badge>
                  <span className="text-[10px] text-cinza-organico font-mono">
                    #{order.orderNumber || order.id.substring(0, 5)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-black text-marrom-escuro">{formatBRL(order.total || 0)}</p>
                <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-widest border mt-1", STATUS_COLORS[order.status])}>
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
          {(!recentOrders || recentOrders.length === 0) && (
            <p className="text-center py-12 text-sm italic text-cinza-organico">Nenhum pedido registrado para este filtro.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
