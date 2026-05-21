
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Users, 
  Clock, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Calendar as CalendarIcon,
  AlertCircle,
  Trophy,
  Activity,
  Zap,
  Briefcase,
  PieChart as PieIcon,
  BarChart3,
  Loader2,
  Edit2,
  Check,
  X,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, Timestamp, doc, setDoc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { format, isSameDay, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const SPARKLINE_UP = [10, 15, 12, 25, 30, 28, 45];
const SPARKLINE_DOWN = [50, 45, 48, 30, 25, 20, 15];

const COLORS = ['#A87442', '#4B2E1F', '#4E5B2C', '#F97316'];

const KPICard = ({ title, value, growth, icon: Icon, isNegative = false, trendData }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-3xl p-6 border border-areia-escura/30 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
  >
    <div className="relative z-10 flex justify-between items-start mb-4">
      <div className="p-3 rounded-2xl bg-areia-clara/50 text-marrom-terra">
        <Icon className="w-5 h-5" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full",
        isNegative ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
      )}>
        {isNegative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
        {growth}%
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-cinza-organico opacity-60">{title}</p>
      <h3 className="text-2xl font-black text-marrom-escuro tracking-tighter">{value}</h3>
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData.map((v: number, i: number) => ({ v, i }))}>
          <Area 
            type="monotone" 
            dataKey="v" 
            stroke={isNegative ? "#EF4444" : "#10B981"} 
            fill={isNegative ? "#EF4444" : "#10B981"} 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default function AdminFinancial() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [companyFilter, setCompanyFilter] = useState('all');
  
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goals, setGoals] = useState({ paroara: 100000, egua: 80000 });
  const [editGoalValues, setEditGoalValues] = useState({ paroara: '100000', egua: '80000' });
  
  const db = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: orders, loading } = useCollection<Order>(ordersQuery);

  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: settingsData } = useDoc<any>(settingsRef);

  useEffect(() => {
    if (settingsData) {
      const pGoal = Number(settingsData.paroaraGoal || 100000);
      const eGoal = Number(settingsData.eguaGoal || 80000);
      setGoals({ paroara: pGoal, egua: eGoal });
      setEditGoalValues({ paroara: pGoal.toString(), egua: eGoal.toString() });
    }
  }, [settingsData]);

  const stats = useMemo(() => {
    if (!orders) return null;

    const currentOrders = orders.filter(o => {
      const oDate = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt);
      const matchesDate = !selectedDate || isSameDay(oDate, selectedDate);
      const matchesRes = companyFilter === 'all' || o.restaurantId === companyFilter;
      return matchesDate && matchesRes;
    });

    const revenue = currentOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const avgTicket = currentOrders.length > 0 ? revenue / currentOrders.length : 0;
    const cancellations = orders.filter(o => {
      const oDate = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt);
      return o.status === 'Cancelado' && (!selectedDate || isSameDay(oDate, selectedDate));
    }).length;
    const estimatedProfit = revenue * 0.35; 

    const paroaraOrders = currentOrders.filter(o => o.restaurantId === 'paroara');
    const eguaOrders = currentOrders.filter(o => o.restaurantId === 'egua-na-panela');

    const payments = currentOrders.reduce((acc: any, o) => {
      const method = o.payment?.method || 'Outros';
      acc[method] = (acc[method] || 0) + (o.total || 0);
      return acc;
    }, {});

    const paymentData = Object.entries(payments).map(([name, value]) => ({ name, value }));

    const hourlyData = Array.from({ length: 24 }).map((_, h) => ({
      hour: `${h}h`,
      revenue: currentOrders.filter(o => {
        const date = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt);
        return date.getHours() === h;
      }).reduce((acc, curr) => acc + curr.total, 0)
    }));

    const monthStart = startOfMonth(new Date());
    const monthOrders = orders.filter(o => {
      const date = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt);
      return date >= monthStart && o.status !== 'Cancelado';
    });

    const paroaraMonthRev = monthOrders.filter(o => o.restaurantId === 'paroara').reduce((acc, o) => acc + (o.total || 0), 0);
    const eguaMonthRev = monthOrders.filter(o => o.restaurantId === 'egua-na-panela').reduce((acc, o) => acc + (o.total || 0), 0);

    return {
      revenue,
      avgTicket,
      totalOrders: currentOrders.length,
      cancellations,
      estimatedProfit,
      paroara: {
        revenue: paroaraOrders.reduce((acc, o) => acc + o.total, 0),
        orders: paroaraOrders.length,
        avgTicket: paroaraOrders.length > 0 ? paroaraOrders.reduce((acc, o) => acc + o.total, 0) / paroaraOrders.length : 0,
        monthRevenue: paroaraMonthRev,
        goalProgress: goals.paroara > 0 ? Math.min(100, (paroaraMonthRev / goals.paroara) * 100) : 0
      },
      egua: {
        revenue: eguaOrders.reduce((acc, o) => acc + o.total, 0),
        orders: eguaOrders.length,
        avgTicket: eguaOrders.length > 0 ? eguaOrders.reduce((acc, o) => acc + o.total, 0) / eguaOrders.length : 0,
        monthRevenue: eguaMonthRev,
        goalProgress: goals.egua > 0 ? Math.min(100, (eguaMonthRev / goals.egua) * 100) : 0
      },
      paymentData,
      hourlyData
    };
  }, [orders, companyFilter, selectedDate, goals]);

  const handleSaveGoals = () => {
    if (!db) return;
    const pVal = Number(editGoalValues.paroara);
    const eVal = Number(editGoalValues.egua);
    
    if (isNaN(pVal) || isNaN(eVal)) {
      toast({ variant: "destructive", title: "Erro", description: "Informe valores numéricos válidos." });
      return;
    }

    const docRef = doc(db, 'settings', 'global');
    const updateData = { paroaraGoal: pVal, eguaGoal: eVal };
    
    setDoc(docRef, updateData, { merge: true })
      .then(() => {
        setGoals({ paroara: pVal, egua: eVal });
        setIsEditingGoals(false);
        toast({ title: "Metas Atualizadas", description: "Os novos objetivos de faturamento foram salvos." });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: updateData
        } satisfies SecurityRuleContext));
      });
  };

  const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-areia-clara/30">
      <Loader2 className="w-12 h-12 animate-spin text-marrom-terra opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-marrom-madeira/40">Sincronizando BI...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      <div className="relative overflow-hidden bg-marrom-escuro p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
        <div className="absolute inset-0 bg-rustic-texture opacity-5 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-caramelo-palha/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-caramelo-palha/20 rounded-xl">
                <Activity className="w-5 h-5 text-caramelo-palha" />
              </div>
              <Badge className="bg-caramelo-palha text-marrom-escuro text-[9px] font-black tracking-widest border-none">LIVE ANALYTICS</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline text-areia-clara tracking-tight">Financeiro</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <div className="flex items-center px-4 gap-2 border-r border-white/10">
              <Filter className="w-4 h-4 text-caramelo-palha" />
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-40 bg-transparent border-none text-areia-clara text-xs font-bold focus:ring-0 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-marrom-escuro border-white/10 text-areia-clara">
                  <SelectItem value="all">Grupo Consolidado</SelectItem>
                  <SelectItem value="paroara">Paroara</SelectItem>
                  <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-44 bg-transparent border-none text-areia-clara text-xs font-bold focus:ring-0 h-10 gap-2">
                  <CalendarIcon className="w-4 h-4 text-caramelo-palha" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Receita Líquida" 
          value={formatBRL(stats?.revenue || 0)} 
          growth="12.5" 
          icon={DollarSign} 
          trendData={SPARKLINE_UP}
        />
        <KPICard 
          title="Ticket Médio" 
          value={formatBRL(stats?.avgTicket || 0)} 
          growth="4.2" 
          icon={ShoppingBag} 
          trendData={SPARKLINE_UP}
        />
        <KPICard 
          title="Lucro Estimado" 
          value={formatBRL(stats?.estimatedProfit || 0)} 
          growth="8.9" 
          icon={Zap} 
          trendData={SPARKLINE_UP}
        />
        <KPICard 
          title="Cancelamentos" 
          value={stats?.cancellations} 
          growth="2.1" 
          icon={AlertCircle} 
          isNegative 
          trendData={SPARKLINE_DOWN}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-white border-areia-escura rounded-[2.5rem] shadow-xl overflow-hidden">
          <CardHeader className="p-8 border-b border-areia-escura/10 flex flex-row items-center justify-between bg-areia-clara/10">
            <div className="space-y-1">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-marrom-terra" /> Fluxo de Receita Diária
              </CardTitle>
              <CardDescription className="text-[10px]">Evolução financeira consolidada por unidade</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.hourlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B2E1F" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4B2E1F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1412', borderRadius: '16px', border: 'none', color: '#FFF', fontSize: '12px' }}
                  itemStyle={{ color: '#A87442', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4B2E1F" strokeWidth={4} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-areia-escura rounded-[2.5rem] shadow-xl overflow-hidden">
          <CardHeader className="p-8 border-b border-areia-escura/10 bg-areia-clara/10">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-marrom-terra" /> Mix de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats?.paymentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {stats?.paymentData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cinza-organico">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-marrom-escuro">{formatBRL(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-marrom-escuro border-none rounded-[2.5rem] shadow-2xl overflow-hidden relative text-areia-clara">
          <div className="absolute inset-0 bg-rustic-texture opacity-5"></div>
          <CardHeader className="p-8 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-caramelo-palha">Objetivos de Faturamento</CardTitle>
              <button 
                onClick={() => setIsEditingGoals(!isEditingGoals)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {isEditingGoals ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-caramelo-palha" />
                      <h4 className="text-lg font-headline text-areia-clara">PAROARA</h4>
                    </div>
                    {isEditingGoals ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input 
                          type="number"
                          value={editGoalValues.paroara}
                          onChange={(e) => setEditGoalValues({...editGoalValues, paroara: e.target.value})}
                          className="bg-white/10 border-white/20 text-white font-black h-10 w-32"
                        />
                      </div>
                    ) : (
                      <p className="text-2xl font-black text-white">{formatBRL(goals.paroara)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-caramelo-palha uppercase opacity-60">Realizado este mês</p>
                    <p className="text-lg font-black text-white">{formatBRL(stats?.paroara.monthRevenue || 0)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.paroara.goalProgress || 0}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-caramelo-palha to-marrom-terra"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-caramelo-palha">Progresso: {Math.round(stats?.paroara.goalProgress || 0)}%</span>
                    <span className="opacity-40">Restante: {formatBRL(Math.max(0, goals.paroara - (stats?.paroara.monthRevenue || 0)))}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-fogo-vibrante" />
                      <h4 className="text-lg font-headline text-areia-clara">ÉGUA NA PANELA</h4>
                    </div>
                    {isEditingGoals ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input 
                          type="number"
                          value={editGoalValues.egua}
                          onChange={(e) => setEditGoalValues({...editGoalValues, egua: e.target.value})}
                          className="bg-white/10 border-white/20 text-white font-black h-10 w-32"
                        />
                        <Button onClick={handleSaveGoals} size="icon" className="bg-caramelo-palha text-marrom-escuro h-10 w-10">
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-2xl font-black text-white">{formatBRL(goals.egua)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-fogo-vibrante uppercase opacity-60">Realizado este mês</p>
                    <p className="text-lg font-black text-white">{formatBRL(stats?.egua.monthRevenue || 0)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.egua.goalProgress || 0}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-fogo-vibrante to-fogo-escuro"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-fogo-vibrante">Progresso: {Math.round(stats?.egua.goalProgress || 0)}%</span>
                    <span className="opacity-40">Restante: {formatBRL(Math.max(0, goals.egua - (stats?.egua.monthRevenue || 0)))}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-8">
          <Card className="bg-white border-areia-escura rounded-[2.5rem] shadow-xl overflow-hidden">
            <CardHeader className="p-8 border-b border-areia-escura/10 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-caramelo-palha" /> Performance Diária
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-cinza-organico uppercase opacity-60">Hoje: Paroara</p>
                  <p className="text-xl font-black">{formatBRL(stats?.paroara.revenue || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-cinza-organico uppercase opacity-60">Hoje: Égua</p>
                  <p className="text-xl font-black">{formatBRL(stats?.egua.revenue || 0)}</p>
                </div>
              </div>
              <Progress value={(stats?.paroara.revenue || 0) > 0 ? ((stats?.paroara.revenue || 0) / (stats?.revenue || 1)) * 100 : 50} className="h-2 bg-areia-clara" />
              
              <div className="grid grid-cols-1 gap-4 pt-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-marrom-madeira">Smart Insights</h3>
                {[
                  { text: "Ticket médio do grupo subiu 4.2% nesta semana.", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { text: "Alta taxa de cancelamento observada entre 14h e 15h.", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" }
                ].map((insight, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn("p-4 rounded-2xl border border-transparent flex items-center gap-3 transition-all", insight.bg)}
                  >
                    <div className={cn("p-2 rounded-xl bg-white/40", insight.color)}>
                      <insight.icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] font-bold text-marrom-escuro italic leading-tight">{insight.text}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
