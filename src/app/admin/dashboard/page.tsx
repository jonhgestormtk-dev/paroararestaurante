
'use client';

import React, { useMemo } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, orderBy, Timestamp } from 'firebase/firestore';
import { Order, Product } from '@/lib/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const db = useFirestore();

  // Buscar todos os pedidos para estatísticas e gráfico
  const allOrdersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: allOrders } = useCollection<Order>(allOrdersQuery);

  // Buscar últimos 5 para a lista lateral
  const recentOrdersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);
  const { data: recentOrders } = useCollection<Order>(recentOrdersQuery);

  // Buscar todos os produtos para contagem
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);
  const { data: allProducts } = useCollection<Product>(productsQuery);

  // Cálculos de Estatísticas Reais
  const stats = useMemo(() => {
    if (!allOrders) return {
      totalOrders: '0',
      totalRevenue: 'R$ 0,00',
      activeProducts: allProducts?.length.toString() || '0',
      monthlyOrders: '0'
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalRev = allOrders.reduce((acc, order) => acc + (order.total || 0), 0);
    const monthly = allOrders.filter(order => {
      const date = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt?.seconds * 1000);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    return {
      totalOrders: allOrders.length.toLocaleString(),
      totalRevenue: `R$ ${totalRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      activeProducts: allProducts?.length.toString() || '0',
      monthlyOrders: monthly.toString()
    };
  }, [allOrders, allProducts]);

  // Agrupar dados para o gráfico (Últimos 6 meses)
  const chartData = useMemo(() => {
    if (!allOrders) return [];

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dataMap: Record<string, number> = {};

    // Inicializar os últimos 6 meses com zero
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = months[d.getMonth()];
      dataMap[label] = 0;
    }

    allOrders.forEach(order => {
      const date = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt?.seconds * 1000);
      const label = months[date.getMonth()];
      if (dataMap[label] !== undefined) {
        dataMap[label]++;
      }
    });

    return Object.entries(dataMap).map(([name, pedidos]) => ({ name, pedidos }));
  }, [allOrders]);

  const metrics = [
    { label: 'Total de Pedidos', value: stats.totalOrders, icon: ShoppingBag, color: 'text-marrom-terra' },
    { label: 'Receita Total', value: stats.totalRevenue, icon: DollarSign, color: 'text-verde-folha' },
    { label: 'Produtos Ativos', value: stats.activeProducts, icon: Package, color: 'text-caramelo-palha' },
    { label: 'Pedidos do Mês', value: stats.monthlyOrders, icon: TrendingUp, color: 'text-marrom-madeira' },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-headline text-marrom-terra">Dashboard Real</h1>
        <p className="text-cinza-organico font-subheadline italic">Dados sincronizados em tempo real com o Firestore.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((stat, i) => (
          <Card key={i} className="bg-white border-areia-escura hover:shadow-lg transition-all group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira/60">{stat.label}</p>
                  <p className="text-2xl font-bold text-marrom-escuro">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-sm bg-areia-clara", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-marrom-terra w-0 group-hover:w-full transition-all duration-500"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <Card className="lg:col-span-2 bg-white border-areia-escura">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-marrom-terra">Volume de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#6A432D' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#6A432D' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(75, 46, 31, 0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5DCCB',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'DM Sans'
                    }}
                  />
                  <Bar dataKey="pedidos" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#A87442' : '#4B2E1F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-cinza-organico italic">
                Aguardando dados de pedidos...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders Section */}
        <Card className="bg-white border-areia-escura">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-lg text-marrom-terra">Últimos Pedidos</CardTitle>
            <Clock className="w-4 h-4 text-marrom-madeira/40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-marrom-terra truncate max-w-[120px]">{order.customer.name}</p>
                      <p className="text-[10px] text-cinza-organico italic">R$ {order.total.toFixed(2)}</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[8px] uppercase font-bold tracking-widest",
                      order.status === 'Pendente' ? "text-caramelo-palha border-caramelo-palha/20" : 
                      order.status === 'Finalizado' ? "text-verde-folha border-verde-folha/20" : "text-marrom-madeira"
                    )}>
                      {order.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-cinza-organico text-xs italic">Nenhum pedido recente.</div>
              )}
              
              <Link href="/admin/pedidos" passHref>
                <Button variant="outline" className="w-full mt-4 text-[10px] uppercase tracking-[0.2em] font-bold border-areia-escura text-marrom-madeira hover:bg-marrom-terra hover:text-white transition-all">
                  Ver todos os pedidos
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
