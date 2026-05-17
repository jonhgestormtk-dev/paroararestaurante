
'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  TrendingUp,
  Clock,
  Database,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Calendar
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
import { Order, Product, RestaurantSlug } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'checking' | 'migrating' | 'completed'>('idle');
  const hasAttemptedMigration = useRef(false);

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

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);
  const { data: allProducts, loading: loadingProducts } = useCollection<Product>(productsQuery);

  const catQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: allCategories, loading: loadingCategories } = useCollection(catQuery);

  const seedDatabase = async (force = false) => {
    if (!db || (hasAttemptedMigration.current && !force)) return;
    
    hasAttemptedMigration.current = true;
    setMigrationStatus('migrating');
    setIsSeeding(true);
    
    try {
      const batch = writeBatch(db);
      const restaurants: RestaurantSlug[] = ['paroara', 'egua-da-panela'];
      
      // 1. Migrar Categorias para ambos os restaurantes
      const validCategories = CATEGORIES.filter(c => c !== 'Todos' && c !== 'Promoções');
      
      restaurants.forEach(resId => {
        validCategories.forEach((catName, index) => {
          const catId = `${resId}-${catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`;
          const catRef = doc(db, 'categories', catId);
          batch.set(catRef, {
            restaurantId: resId,
            name: catName,
            active: true,
            order: index * 10,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp()
          }, { merge: true });
        });
      });

      // 2. Migrar Produtos (distribuir entre restaurantes)
      PRODUCTS.forEach((product, idx) => {
        const resId = idx % 2 === 0 ? 'paroara' : 'egua-da-panela';
        const productRef = doc(db, 'products', product.id);
        const { id, ...productData } = product;
        batch.set(productRef, {
          ...productData,
          restaurantId: resId,
          active: productData.active ?? true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      await batch.commit();
      setMigrationStatus('completed');
      toast({ title: "Sincronização Concluída", description: "Dados migrados para multi-restaurante." });
    } catch (error: any) {
      console.error(error);
      setMigrationStatus('idle');
      hasAttemptedMigration.current = false;
      toast({ variant: "destructive", title: "Erro na Sincronização" });
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (!loadingProducts && !loadingCategories && db) {
      if ((!allProducts || allProducts.length === 0) && (!allCategories || allCategories.length === 0)) {
        seedDatabase();
      } else {
        setMigrationStatus('completed');
      }
    }
  }, [loadingProducts, loadingCategories, allProducts, allCategories, db]);

  const stats = useMemo(() => {
    if (!allOrders) return { totalOrders: '0', totalRevenue: 'R$ 0,00', activeProducts: '0' };
    const totalRev = allOrders.reduce((acc, order) => acc + (order.total || 0), 0);
    return {
      totalOrders: allOrders.length.toLocaleString(),
      totalRevenue: `R$ ${totalRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      activeProducts: allProducts?.length.toString() || '0'
    };
  }, [allOrders, allProducts]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-headline text-marrom-terra">Dashboard Admin</h1>
        <Button variant="outline" size="sm" onClick={() => seedDatabase(true)} disabled={isSeeding}>
          {isSeeding ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Sincronizar Dados
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-xs font-bold uppercase text-marrom-madeira opacity-60">Pedidos Totais</p>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold uppercase text-marrom-madeira opacity-60">Faturamento</p>
          <p className="text-3xl font-bold">{stats.totalRevenue}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold uppercase text-marrom-madeira opacity-60">Pratos Ativos</p>
          <p className="text-3xl font-bold">{stats.activeProducts}</p>
        </Card>
      </div>

      <Card className="p-6">
        <CardTitle className="mb-6 text-lg font-headline text-marrom-terra">Últimos Pedidos (Centralizado)</CardTitle>
        <div className="space-y-4">
          {recentOrders?.map(order => (
            <div key={order.id} className="flex items-center justify-between border-b border-areia-escura/30 pb-3">
              <div>
                <p className="font-bold text-marrom-terra text-sm">{order.customer.name}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase">
                    {(order.restaurantId || 'Geral').toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-cinza-organico font-mono">
                    #{order.orderNumber || order.id.substring(0, 5)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-bold text-marrom-escuro">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                <p className="text-[9px] text-cinza-organico italic">{order.status}</p>
              </div>
            </div>
          ))}
          {(!recentOrders || recentOrders.length === 0) && (
            <p className="text-center py-6 text-sm italic text-cinza-organico">Nenhum pedido registrado.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
