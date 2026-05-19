
'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon,
  MessageCircle,
  MoreVertical,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  User,
  Package,
  Edit2,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Wallet,
  PlusCircle,
  StickyNote,
  Store,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, updateDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Order, OrderStatus, Product } from '@/lib/types';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string; icon: any }> = {
  'Pendente': { color: '#F97316', bg: 'bg-orange-500/10', label: 'Pendente', icon: Clock },
  'Em Preparo': { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Em Preparo', icon: AlertCircle },
  'Saiu para Entrega': { color: '#3B82F6', bg: 'bg-blue-500/10', label: 'Em Rota', icon: Truck },
  'Finalizado': { color: '#10B981', bg: 'bg-emerald-500/10', label: 'Finalizado', icon: CheckCircle },
  'Cancelado': { color: '#EF4444', bg: 'bg-rose-500/10', label: 'Cancelado', icon: XCircle },
};

const RESTAURANT_CONFIG = {
  'paroara': { name: 'Paroara', color: 'bg-marrom-terra', text: 'text-marrom-terra' },
  'egua-na-panela': { name: 'Égua na Panela', color: 'bg-fogo-vibrante', text: 'text-fogo-vibrante' },
};

const PAYMENT_ICONS: Record<string, any> = {
  'Pix': Wallet,
  'Dinheiro': Banknote,
  'Débito': CreditCard,
  'Crédito': CreditCard
};

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  const [editFormData, setEditFormData] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    items: [] as any[] 
  });
  
  const { toast } = useToast();
  const db = useFirestore();

  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: orders, loading } = useCollection<Order>(ordersQuery);

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('name', 'asc'));
  }, [db]);
  const { data: products } = useCollection<Product>(productsQuery);

  const getOrderDate = (createdAt: any) => {
    if (!createdAt) return new Date();
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt.seconds) return new Date(createdAt.seconds * 1000);
    return new Date(createdAt);
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const orderDate = getOrderDate(o.createdAt);
      const matchesDate = !selectedDate || isSameDay(orderDate, selectedDate);
      
      const orderIdMatch = o.id.toLowerCase().includes(searchTerm.toLowerCase());
      const orderNumMatch = o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const customerMatch = o.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSearch = orderIdMatch || orderNumMatch || customerMatch;
      const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
      
      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter, selectedDate]);

  const formatDateLabel = (createdAt: any) => {
    const date = getOrderDate(createdAt);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast({ title: "Status Atualizado", description: `Pedido movido para: ${newStatus}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: "Não foi possível alterar o status do pedido." });
    }
  };

  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditFormData({
      name: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address || '',
      items: JSON.parse(JSON.stringify(order.items))
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!db || !editingOrder) return;
    const newTotal = editFormData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    try {
      await updateDoc(doc(db, 'orders', editingOrder.id), {
        'customer.name': editFormData.name,
        'customer.phone': editFormData.phone,
        'customer.address': editFormData.address,
        items: editFormData.items,
        total: newTotal
      });
      toast({ title: "Pedido Atualizado" });
      setIsEditModalOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao Editar" });
    }
  };

  const handleResendToWhatsApp = (order: Order) => {
    const phone = order.customer.phone.replace(/\D/g, '');
    let message = `Olá *${order.customer.name}*, seu pedido *#${order.orderNumber || order.id.substring(0, 8)}* foi atualizado.\n\n*Novo Total: R$ ${order.total.toFixed(2).replace('.', ',')}*`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Pedidos</h1>
          <p className="text-cinza-organico font-subheadline italic">Gerenciamento centralizado de vendas.</p>
        </div>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden shadow-2xl rounded-2xl">
        <div className="p-4 md:p-6 border-b border-areia-escura bg-areia-clara/20 flex flex-col md:flex-row gap-4 items-center">
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-areia-escura/50 shadow-sm w-full md:w-auto">
            <Button 
              variant={isSameDay(selectedDate || new Date(), new Date()) ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className={cn(
                "text-[10px] uppercase font-black tracking-widest rounded-lg px-4 h-10",
                isSameDay(selectedDate || new Date(), new Date()) ? "bg-marrom-terra text-white" : "text-marrom-madeira"
              )}
            >
              Hoje
            </Button>
            <Separator orientation="vertical" className="h-6 bg-areia-escura/30" />
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "text-[10px] uppercase font-black tracking-widest rounded-lg px-4 h-10 gap-2",
                    !isSameDay(selectedDate || new Date(), new Date()) ? "bg-marrom-terra/10 text-marrom-terra" : "text-marrom-madeira/60"
                  )}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {selectedDate ? format(selectedDate, "dd 'de' MMM", { locale: ptBR }) : "Data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar cliente ou pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl h-12"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-56 rounded-xl h-12">
              <SelectValue placeholder="Status: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-areia-clara/10">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Pedido / Unidade</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Cliente</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Total</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Carregando...</TableCell></TableRow>
              ) : filteredOrders.map((order) => {
                const resConfig = RESTAURANT_CONFIG[order.restaurantId] || RESTAURANT_CONFIG['paroara'];
                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pendente'];
                return (
                  <TableRow key={order.id} className="hover:bg-areia-media/5 transition-colors">
                    <TableCell className="py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs font-black">#{order.orderNumber || order.id.substring(0, 6)}</span>
                        <Badge className={cn("text-[8px] font-black uppercase border-none text-white", resConfig.color)}>
                          {resConfig.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-black uppercase">{order.customer.name}</span>
                        <span className="text-[10px] text-cinza-organico">{formatDateLabel(order.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-lg font-black tracking-tighter">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-none px-4 py-2 rounded-full", status.bg)} style={{ color: status.color }}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-areia-clara border-areia-escura w-56 rounded-xl">
                          <DropdownMenuItem onClick={() => handleResendToWhatsApp(order)} className="text-[10px] font-black uppercase tracking-widest gap-3 py-3 text-verde-folha">
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                          </DropdownMenuItem>
                          <Separator className="my-1" />
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <DropdownMenuItem key={key} onClick={() => handleUpdateStatus(order.id, key as OrderStatus)} className="text-[10px] font-black uppercase tracking-widest gap-3 py-3">
                              <config.icon className="w-4 h-4" style={{ color: config.color }} /> {config.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
