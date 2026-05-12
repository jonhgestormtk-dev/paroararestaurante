
'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  MapPin, 
  Calendar,
  MessageCircle,
  MoreVertical,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { Order, OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const STATUS_COLORS: Record<OrderStatus, string> = {
  'Pendente': 'text-caramelo-palha bg-caramelo-palha/10 border-caramelo-palha/20',
  'Em Preparo': 'text-marrom-madeira bg-marrom-madeira/10 border-marrom-madeira/20',
  'Saiu para Entrega': 'text-verde-folha bg-verde-folha/10 border-verde-folha/20',
  'Finalizado': 'text-marrom-escuro bg-marrom-escuro/10 border-marrom-escuro/20',
};

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const { toast } = useToast();

  const db = useFirestore();
  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: orders, loading } = useCollection<Order>(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const matchesSearch = o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast({ title: "Status Atualizado", description: `Pedido movido para: ${newStatus}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: "Não foi possível alterar o status do pedido." });
    }
  };

  const exportToCSV = () => {
    if (!orders) return;
    const headers = ['ID', 'Data', 'Cliente', 'Telefone', 'Total', 'Status'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.createdAt?.seconds * 1000).toLocaleDateString(),
      o.customer.name,
      o.customer.phone,
      o.total.toFixed(2),
      o.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedidos_paroara_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Pedidos</h1>
          <p className="text-cinza-organico font-subheadline italic">Gerencie os pedidos em tempo real.</p>
        </div>
        <Button 
          onClick={exportToCSV}
          variant="outline"
          className="border-areia-escura text-marrom-madeira hover:bg-marrom-terra hover:text-white rounded-sm px-6 py-6 font-bold uppercase tracking-widest text-xs gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden">
        <div className="p-6 border-b border-areia-escura bg-areia-clara/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar por cliente ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-areia-escura/50 focus:ring-marrom-terra"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white border-areia-escura/50">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3" />
                <SelectValue placeholder="Filtrar Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-areia-clara">
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Em Preparo">Em Preparo</SelectItem>
              <SelectItem value="Saiu para Entrega">Saiu para Entrega</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-areia-clara/10">
              <TableRow className="hover:bg-transparent border-areia-escura">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">ID / Data</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Cliente</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Itens</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Total</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={6} className="h-20 bg-areia-media/5"></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-areia-media/5 border-areia-escura group transition-colors">
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-mono text-cinza-organico">#{order.id.substring(0, 8)}</p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-marrom-madeira uppercase">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-marrom-terra">{order.customer.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-verde-folha font-bold">
                          <Phone className="w-3 h-3" />
                          {order.customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-marrom-escuro">R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-widest border", STATUS_COLORS[order.status])}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-marrom-madeira">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-areia-clara border-areia-escura">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Pendente')} className="text-xs uppercase font-bold tracking-widest gap-2">
                            <Clock className="w-3 h-3 text-caramelo-palha" /> Pendente
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Em Preparo')} className="text-xs uppercase font-bold tracking-widest gap-2">
                            <AlertCircle className="w-3 h-3 text-marrom-madeira" /> Em Preparo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Saiu para Entrega')} className="text-xs uppercase font-bold tracking-widest gap-2">
                            <Truck className="w-3 h-3 text-verde-folha" /> Em Rota
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Finalizado')} className="text-xs uppercase font-bold tracking-widest gap-2">
                            <CheckCircle className="w-3 h-3 text-marrom-escuro" /> Finalizado
                          </DropdownMenuItem>
                          <Separator className="my-1 bg-areia-escura" />
                          <DropdownMenuItem className="text-xs uppercase font-bold tracking-widest gap-2 text-verde-folha" onClick={() => window.open(`https://wa.me/${order.customer.phone.replace(/\D/g,'')}`, '_blank')}>
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-cinza-organico italic font-subheadline">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
