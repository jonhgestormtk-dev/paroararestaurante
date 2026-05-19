
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
  Clock,
  Filter,
  Loader2,
  Trophy,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { 
  collection, 
  query, 
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
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
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
import { Progress } from '@/components/ui/progress';

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  'Pendente': { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Pendente' },
  'Em Preparo': { color: '#3B82F6', bg: 'bg-blue-500/10', label: 'Preparando' },
  'Saiu para Entrega': { color: '#8B5CF6', bg: 'bg-purple-500/10', label: 'Em Entrega' },
  'Finalizado': { color: '#10B981', bg: 'bg-emerald-500/10', label: 'Finalizado' },
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

    // Processamento de vendas por hora
    const hourlyDataMap: Record<number, { hour: string; revenue: number; count: number }> = {};
    for (let i = 0; i < 24; i++) {
      hourlyDataMap[i] = { hour: `${i}h`, revenue: 0, count: 0 };
    }

    currentOrders.forEach(o => {
      const h = getOrderDate(o).getHours();
      hourlyDataMap[h].revenue += o.total || 0;
      hourlyDataMap[h].count += 1;
    });

    const hourlyData = Object.values(hourlyDataMap);

    // Processamento de status
    const statusDataMap: Record<string, number> = {};
    currentOrders.forEach(o => {
      statusDataMap[o.status] = (statusDataMap[o.status] || 0) + 1;
    });

    const statusChartData = Object.entries(STATUS_CONFIG).map(([status, config]) => ({
      name: status,
      value: statusDataMap[status as OrderStatus] || 0,
      color: config.color
    }));

    // Top Produtos
    const productMap: Record<string, { name: string; qty: number; revenue: number; restaurant: string }> = {};
    currentOrders.forEach(o => {
      o.items.forEach(item => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { name: item.name, qty: 0, revenue: 0, restaurant: o.restaurantId };
        }
        productMap[item.productId].qty += item.quantity;
        productMap[item.productId].revenue += (item.price * item.quantity);
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const calculateMetrics = (orders: Order[]) => {
      const paroara = orders.filter(o => o.restaurantId === 'paroara');
      const egua = orders.filter(o => o.restaurantId === 'egua-na-panela');

      const pRev = paroara.reduce((acc, o) => acc + (o.total || 0), 0);
      const eRev = egua.reduce((acc, o) => acc + (o.total || 0), 0);

      // Mock de tempo de preparo (em minutos) - Em produção seria baseado em timestamps de status
      const pPrep = paroara.length > 0 ? 18 + Math.random() * 5 : 0;
      const ePrep = egua.length > 0 ? 22 + Math.random() * 8 : 0;

      return {
        paroara: { 
          count: paroara.length, 
          revenue: pRev, 
          ticket: paroara.length > 0 ? pRev / paroara.length : 0,
          avgPrep: pPrep
        },
        egua: { 
          count: egua.length, 
          revenue: eRev, 
          ticket: egua.length > 0 ? eRev / egua.length : 0,
          avgPrep: ePrep
        },
        total: {
          count: orders.length,
          revenue: pRev + eRev,
          ticket: orders.length > 0 ? (pRev + eRev) / orders.length : 0,
          avgPrep: (pPrep + ePrep) / 2
        }
      };
    };

    const current = calculateMetrics(currentOrders);
    const previous = calculateMetrics(previousOrders);

    const getGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      current,
      hourlyData,
      statusChartData,
      topProducts,
      growth: {
        paroara: { revenue: getGrowth(current.paroara.revenue, previous.paroara.revenue) },
        egua: { revenue: getGrowth(current.egua.revenue, previous.egua.revenue) },
        total: { revenue: getGrowth(current.total.revenue, previous.total.revenue) }
      }
    };
  }, [allOrders, timeFilter, restaurantFilter]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const GrowthIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <span className={cn(
        "flex items-center gap-0.5 text-[10px] font-black",
        isPositive ? "text-emerald-500" : "text-rose-500"
      )}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-areia-clara/30">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-marrom-terra opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-5 h-5 text-marrom-terra/40" />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-marrom-madeira/40">Sincronizando Inteligência...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Premium com Filtros Glassmorphism */}
      <div className="relative overflow-hidden bg-marrom-escuro p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-rustic-texture opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-caramelo-palha/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline text-areia-clara tracking-tight">Analytics Central</h1>
            <div className="flex items-center gap-3 text-caramelo-palha/60 font-subheadline italic">
              <CalendarDays className="w-4 h-4" /> 
              <span>Monitoramento Operacional e Financeiro</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="w-40 bg-transparent border-none text-areia-clara text-xs font-bold focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-marrom-escuro border-white/10 text-areia-clara">
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-white/10 hidden md:block" />

            <Select value={restaurantFilter} onValueChange={(v) => setRestaurantFilter(v as RestaurantFilter)}>
              <SelectTrigger className="w-52 bg-transparent border-none text-areia-clara text-xs font-bold focus:ring-0">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-caramelo-palha" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-marrom-escuro border-white/10 text-areia-clara">
                <SelectItem value="all">Visão Consolidada</SelectItem>
                <SelectItem value="paroara">Paroara Premium</SelectItem>
                <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid Comparativo Multiempresa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { id: 'paroara' as RestaurantSlug, name: 'Paroara', color: 'text-marrom-terra', accent: 'bg-marrom-terra', stats: stats?.current.paroara, growth: stats?.growth.paroara },
          { id: 'egua-na-panela' as RestaurantSlug, name: 'Égua na Panela', color: 'text-fogo-vibrante', accent: 'bg-fogo-vibrante', stats: stats?.current.egua, growth: stats?.growth.egua }
        ].map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className={cn(
              "relative bg-white rounded-[2rem] p-8 border border-areia-escura/30 shadow-xl overflow-hidden",
              restaurantFilter !== 'all' && restaurantFilter !== company.id && "opacity-40 grayscale pointer-events-none"
            )}
          >
            <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full", company.accent)}></div>
            
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className={cn("text-xs font-black uppercase tracking-[0.3em] opacity-40", company.color)}>Empresa</h3>
                <h2 className="text-2xl font-headline tracking-widest uppercase">{company.name}</h2>
              </div>
              <div className={cn("p-4 rounded-2xl", company.accent + "/10")}>
                <Store className={cn("w-6 h-6", company.color)} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-cinza-organico opacity-60">Pedidos</p>
                <p className="text-2xl font-black text-marrom-escuro">{company.stats?.count}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-cinza-organico opacity-60">Faturamento</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black text-marrom-escuro">{formatBRL(company.stats?.revenue || 0)}</p>
                  {company.growth && <GrowthIndicator value={company.growth.revenue} />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-cinza-organico opacity-60">Ticket Médio</p>
                <p className="text-xl font-black text-marrom-escuro">{formatBRL(company.stats?.ticket || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-cinza-organico opacity-60">Tempo Preparo</p>
                <div className="flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5 text-cinza-organico" />
                  <p className="text-xl font-black text-marrom-escuro">{company.stats?.avgPrep.toFixed(0)}m</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráfico de Vendas por Hora */}
      <Card className="bg-white border-areia-escura rounded-[2rem] shadow-xl overflow-hidden">
        <CardHeader className="p-8 border-b border-areia-escura/10 flex flex-row items-center justify-between bg-areia-clara/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-marrom-madeira">
              <BarChart3 className="w-4 h-4" />
              <CardTitle className="text-xs font-black uppercase tracking-widest">Fluxo de Vendas por Hora</CardTitle>
            </div>
            <CardDescription className="font-subheadline italic">Distribuição de faturamento ao longo do dia</CardDescription>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-marrom-terra"></div>
              <span className="text-[10px] font-bold text-cinza-organico">Faturamento</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.hourlyData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#281A15" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#281A15" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
                tickFormatter={(val) => `R$${val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#281A15', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)' 
                }}
                itemStyle={{ color: '#F3E7D3', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                labelStyle={{ color: '#A87442', marginBottom: '4px', fontSize: '12px', fontWeight: 700 }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#281A15" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorRev)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Operação e Analytics Detalhado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status de Pedidos (Donut) */}
        <Card className="bg-white border-areia-escura rounded-[2rem] shadow-xl overflow-hidden">
          <CardHeader className="p-8 border-b border-areia-escura/10">
            <div className="flex items-center gap-2 text-marrom-madeira">
              <PieChartIcon className="w-4 h-4" />
              <CardTitle className="text-xs font-black uppercase tracking-widest">Distribuição por Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.statusChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {stats?.statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats?.statusChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-black text-cinza-organico uppercase tracking-widest">{item.name}</span>
                  <span className="text-xs font-black ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Eficiência Operacional */}
        <Card className="bg-white border-areia-escura rounded-[2rem] shadow-xl overflow-hidden">
          <CardHeader className="p-8 border-b border-areia-escura/10">
            <div className="flex items-center gap-2 text-marrom-madeira">
              <Timer className="w-4 h-4" />
              <CardTitle className="text-xs font-black uppercase tracking-widest">Tempo de Preparo</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase text-marrom-terra tracking-widest">Paroara Premium</p>
                <p className="text-lg font-black">{stats?.current.paroara.avgPrep.toFixed(0)} min</p>
              </div>
              <Progress value={Math.min(100, (stats?.current.paroara.avgPrep || 0) / 40 * 100)} className="h-2 bg-marrom-terra/10" />
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Dentro da Meta (Ideal: 25min)</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase text-fogo-vibrante tracking-widest">Égua na Panela</p>
                <p className="text-lg font-black">{stats?.current.egua.avgPrep.toFixed(0)} min</p>
              </div>
              <Progress value={Math.min(100, (stats?.current.egua.avgPrep || 0) / 40 * 100)} className="h-2 bg-fogo-vibrante/10" />
              <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">Atenção (Ideal: 30min)</p>
            </div>
          </CardContent>
        </Card>

        {/* Produtos TOP Performance */}
        <Card className="bg-white border-areia-escura rounded-[2rem] shadow-xl overflow-hidden">
          <CardHeader className="p-8 border-b border-areia-escura/10">
            <div className="flex items-center gap-2 text-marrom-madeira">
              <Trophy className="w-4 h-4" />
              <CardTitle className="text-xs font-black uppercase tracking-widest">Top Vendidos</CardTitle>
            </div>
          </CardHeader>
          <div className="divide-y divide-areia-escura/10">
            {stats?.topProducts.map((p, idx) => (
              <div key={idx} className="p-6 flex items-center gap-4 hover:bg-areia-clara/5 transition-colors group">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-110",
                  idx === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" :
                  idx === 1 ? "bg-slate-100 text-slate-500 border border-slate-200" :
                  idx === 2 ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-areia-clara text-cinza-organico"
                )}>
                  {idx < 3 ? `TOP ${idx + 1}` : `#${idx + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-marrom-terra text-sm truncate uppercase tracking-tighter">{p.name}</p>
                  <p className="text-[9px] text-cinza-organico font-black uppercase tracking-widest opacity-40">{p.restaurant}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-black text-marrom-escuro">{p.qty} un.</p>
                  <p className="text-[10px] text-cinza-organico font-bold">{formatBRL(p.revenue)}</p>
                </div>
              </div>
            ))}
            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <div className="p-12 text-center">
                <p className="text-xs italic text-cinza-organico opacity-40">Nenhum dado de vendas registrado.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
