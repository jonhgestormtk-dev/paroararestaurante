
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  TrendingUp,
  Clock,
  Database,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { 
  collection, 
  query, 
  limit, 
  orderBy, 
  Timestamp, 
  doc, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';
import { Order, Product } from '@/lib/types';
import { PRODUCTS, CATEGORIES } from '@/lib/mock-data';
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
import { Badge } from '@/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  // Buscar todos os pedidos para estatísticas
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
  const { data: allProducts, loading: loadingProducts } = useCollection<Product>(productsQuery);

  // Buscar categorias
  const catQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: allCategories, loading: loadingCategories } = useCollection(catQuery);

  // Função para popular o banco de dados (Produtos e Categorias)
  const seedDatabase = async () => {
    if (!db) {
      console.error("Firestore não inicializado");
      toast({ variant: "destructive", title: "Erro", description: "Banco de dados não conectado." });
      return;
    }
    
    setIsSeeding(true);
    console.log("Iniciando migração de dados...");
    
    try {
      const batch = writeBatch(db);
      
      // 1. Migrar Categorias
      const validCategories = CATEGORIES.filter(c => c !== 'Todos' && c !== 'Promoções');
      
      validCategories.forEach((catName, index) => {
        const catId = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        const catRef = doc(db, 'categories', catId);
        batch.set(catRef, {
          name: catName,
          active: true,
          order: index * 10,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
      });

      // 2. Migrar Produtos
      PRODUCTS.forEach((product) => {
        const productRef = doc(db, 'products', product.id);
        const { id, ...productData } = product;
        batch.set(productRef, {
          ...productData,
          active: productData.active ?? true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      await batch.commit();
      console.log("Migração concluída com sucesso!");
      
      toast({
        title: "Banco de Dados Criado",
        description: `${validCategories.length} categorias e ${PRODUCTS.length} pratos foram migrados com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao popular banco:', error);
      toast({
        variant: "destructive",
        title: "Erro na Migração",
        description: error.message || "Não foi possível popular o banco de dados.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

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

  const chartData = useMemo(() => {
    if (!allOrders || allOrders.length === 0) return [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dataMap: Record<string, number> = {};
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

  // Mostra que precisa de migração se o carregamento terminou e as coleções estão vazias
  const needsMigration = !loadingProducts && !loadingCategories && 
    (!allProducts || allProducts.length === 0) && 
    (!allCategories || allCategories.length === 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline text-marrom-terra uppercase tracking-wider">Dashboard Admin</h1>
          <p className="text-cinza-organico font-subheadline italic">Dados sincronizados em tempo real com o Firestore.</p>
        </div>
        
        {needsMigration ? (
          <Button 
            onClick={seedDatabase} 
            disabled={isSeeding}
            className="bg-caramelo-palha hover:bg-marrom-madeira text-white gap-2 py-6 px-8 rounded-sm font-bold uppercase tracking-widest text-xs shadow-lg transition-all"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {isSeeding ? 'Criando Banco de Dados...' : 'Criar Banco de Dados do Cardápio'}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-verde-folha bg-verde-folha/10 px-4 py-2 rounded-sm border border-verde-folha/20">
            {loadingProducts || loadingCategories ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Package className="w-4 h-4" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {loadingProducts || loadingCategories ? 'Verificando dados...' : 'Banco de Dados Ativo'}
            </span>
          </div>
        )}
      </div>

      {needsMigration && (
        <Card className="bg-amber-50 border-amber-200 shadow-none">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">Configuração Inicial Necessária</p>
              <p className="text-xs text-amber-700">Seu banco de dados no Firestore está vazio. Clique no botão acima para carregar automaticamente as categorias e os pratos iniciais do restaurante.</p>
            </div>
          </CardContent>
        </Card>
      )}

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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-white border-areia-escura">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-marrom-terra">Volume de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6A432D' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6A432D' }} />
                  <Tooltip cursor={{ fill: 'rgba(75, 46, 31, 0.05)' }} />
                  <Bar dataKey="pedidos" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#A87442' : '#4B2E1F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-cinza-organico italic">
                {allOrders ? "Aguardando primeiro pedido..." : "Carregando dados..."}
              </div>
            )}
          </CardContent>
        </Card>

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
                <Button variant="outline" className="w-full mt-4 text-[10px] uppercase tracking-[0.2em] font-bold border-areia-escura text-marrom-madeira">
                  Ver todos os pedidos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
