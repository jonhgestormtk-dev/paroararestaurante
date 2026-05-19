
'use client';

import React, { useMemo } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Store,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight
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
import { Order, OrderStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<OrderStatus, string> = {
  'Pendente': 'text-fogo-vibrante bg-fogo-vibrante/10 border-fogo-vibrante/30 font-black',
  'Em Preparo': 'text-amber-600 bg-amber-600/10 border-amber-600/30 font-black',
  'Saiu para Entrega': 'text-blue-600 bg-blue-600/10 border-blue-600/30 font-black',
  'Finalizado': 'text-emerald-600 bg-emerald-600/10 border-emerald-600/30 font-black',
};

export default function AdminDashboard() {
  const db = useFirestore();

  const allOrdersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: allOrders } = useCollection<Order>(allOrdersQuery);

  const recentOrdersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);
  const { data: recentOrders } = useCollection<Order>(recentOrdersQuery);

  const stats = useMemo(() => {
    if (!allOrders) return null;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const getOrderDate = (order: Order) => {
      if (order.createdAt instanceof Timestamp) return order.createdAt.toDate();
      if (order.createdAt?.seconds) return new Date(order.createdAt.seconds * 1000);
      return new Date(order.createdAt);
    };

    const todayOrders = allOrders.filter(o => getOrderDate(o) >= startOfToday);
    const yesterdayOrders = allOrders.filter(o => {
      const d = getOrderDate(o);
      return d >= startOfYesterday && d < startOfToday;
    });

    const calculateStats = (orders: Order[]) => {
      const paroara = orders.filter(o => o.restaurantId === 'paroara');
      const egua = orders.filter(o => o.restaurantId === 'egua-na-panela');

      const pRev = paroara.reduce((acc, o) => acc + (o.total || 0), 0);
      const eRev = egua.reduce((acc, o) => acc + (o.total || 0), 0);

      return {
        paroara: { count: paroara.length, revenue: pRev, ticket: paroara.length > 0 ? pRev / paroara.length : 0 },
        egua: { count: egua.length, revenue: eRev, ticket: egua.length > 0 ? eRev / egua.length : 0 }
      };
    };

    const t = calculateStats(todayOrders);
    const y = calculateStats(yesterdayOrders);

    const getGrowth = (today: number, yesterday: number) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return ((today - yesterday) / yesterday) * 100;
    };

    return {
      today: t,
      growth: {
        paroara: {
          count: getGrowth(t.paroara.count, y.paroara.count),
          revenue: getGrowth(t.paroara.revenue, y.paroara.revenue),
          ticket: getGrowth(t.paroara.ticket, y.paroara.ticket)
        },
        egua: {
          count: getGrowth(t.egua.count, y.egua.count),
          revenue: getGrowth(t.egua.revenue, y.egua.revenue),
          ticket: getGrowth(t.egua.ticket, y.egua.ticket)
        }
      }
    };
  }, [allOrders]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const GrowthBadge = ({ value }: { value: number }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <div className={cn(
        "flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full border",
        isPositive 
          ? "text-verde-folha bg-verde-folha/5 border-verde-folha/10" 
          : "text-destructive bg-destructive/5 border-destructive/10"
      )}>
        {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
        {Math.abs(value).toFixed(0)}% <span className="opacity-40 ml-0.5 font-normal">vs ontem</span>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Dashboard Admin</h1>
          <p className="text-cinza-organico font-subheadline italic flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Desempenho Diário • Hoje
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pedidos Diários */}
        <Card className="bg-white border-areia-escura overflow-hidden shadow-sm">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Pedidos Hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Paroara</span>
                <span className="text-3xl font-black text-marrom-terra">{stats?.today.paroara.count || 0}</span>
              </div>
              <div className="flex justify-end">
                <GrowthBadge value={stats?.growth.paroara.count || 0} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Égua na Panela</span>
                <span className="text-3xl font-black text-fogo-vibrante">{stats?.today.egua.count || 0}</span>
              </div>
              <div className="flex justify-end">
                <GrowthBadge value={stats?.growth.egua.count || 0} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faturamento Diário */}
        <Card className="bg-white border-areia-escura overflow-hidden shadow-sm">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Faturamento Hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Paroara</span>
                <span className="text-xl font-black text-marrom-terra">{formatBRL(stats?.today.paroara.revenue || 0)}</span>
              </div>
              <div className="flex justify-end">
                <GrowthBadge value={stats?.growth.paroara.revenue || 0} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Égua na Panela</span>
                <span className="text-xl font-black text-fogo-vibrante">{formatBRL(stats?.today.egua.revenue || 0)}</span>
              </div>
              <div className="flex justify-end">
                <GrowthBadge value={stats?.growth.egua.revenue || 0} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Médio Diário */}
        <Card className="bg-white border-areia-escura overflow-hidden shadow-sm">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Ticket Médio Hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Paroara</span>
                <span className="text-xl font-black text-marrom-terra">{formatBRL(stats?.today.paroara.ticket || 0)}</span>
              </div>
              <div className="flex justify-end">
                <GrowthBadge value={stats?.growth.paroara.ticket || 0} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">Égua na Panela</span>
                <span className="text-xl font-black text-fogo-vibrante">{formatBRL(stats?.today.egua.ticket || 0)}</span>
              </div>
              <div className="flex justify-end">
                <GrowthBadge value={stats?.growth.egua.ticket || 0} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden shadow-sm">
        <CardHeader className="p-6 bg-marrom-escuro text-areia-clara">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-caramelo-palha" />
            <CardTitle className="text-lg font-headline tracking-widest uppercase">Últimos Pedidos</CardTitle>
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
            <p className="text-center py-12 text-sm italic text-cinza-organico">Nenhum pedido registrado.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
