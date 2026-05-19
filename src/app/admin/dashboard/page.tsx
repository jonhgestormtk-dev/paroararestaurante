
'use client';

import React, { useMemo } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Store,
  CalendarDays
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
import { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter(order => {
      let date: Date;
      if (order.createdAt instanceof Timestamp) {
        date = order.createdAt.toDate();
      } else if (order.createdAt?.seconds) {
        date = new Date(order.createdAt.seconds * 1000);
      } else {
        date = new Date(order.createdAt);
      }
      return date >= startOfToday;
    });

    const paroaraToday = todayOrders.filter(o => o.restaurantId === 'paroara');
    const eguaToday = todayOrders.filter(o => o.restaurantId === 'egua-na-panela');

    const paroaraRev = paroaraToday.reduce((acc, o) => acc + (o.total || 0), 0);
    const eguaRev = eguaToday.reduce((acc, o) => acc + (o.total || 0), 0);

    return {
      paroara: {
        count: paroaraToday.length,
        revenue: paroaraRev,
        ticket: paroaraToday.length > 0 ? paroaraRev / paroaraToday.length : 0
      },
      egua: {
        count: eguaToday.length,
        revenue: eguaRev,
        ticket: eguaToday.length > 0 ? eguaRev / eguaToday.length : 0
      }
    };
  }, [allOrders]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
        <Card className="bg-white border-areia-escura overflow-hidden">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Pedidos Hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cinza-organico uppercase">Paroara</span>
              <span className="text-2xl font-black text-marrom-terra">{stats?.paroara.count || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cinza-organico uppercase">Égua na Panela</span>
              <span className="text-2xl font-black text-fogo-vibrante">{stats?.egua.count || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Faturamento Diário */}
        <Card className="bg-white border-areia-escura overflow-hidden">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Faturamento Hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cinza-organico uppercase">Paroara</span>
              <span className="text-xl font-black text-marrom-terra">{formatBRL(stats?.paroara.revenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cinza-organico uppercase">Égua na Panela</span>
              <span className="text-xl font-black text-fogo-vibrante">{formatBRL(stats?.egua.revenue || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Médio Diário */}
        <Card className="bg-white border-areia-escura overflow-hidden">
          <CardHeader className="bg-areia-clara/20 py-4 border-b border-areia-escura/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-marrom-terra" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-marrom-madeira">Ticket Médio Hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cinza-organico uppercase">Paroara</span>
              <span className="text-xl font-black text-marrom-terra">{formatBRL(stats?.paroara.ticket || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cinza-organico uppercase">Égua na Panela</span>
              <span className="text-xl font-black text-fogo-vibrante">{formatBRL(stats?.egua.ticket || 0)}</span>
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
                <p className="text-[9px] text-cinza-organico italic uppercase tracking-widest mt-1 opacity-60">{order.status}</p>
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
