
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
  AlertCircle,
  User,
  Package,
  Edit2,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Wallet
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

const STATUS_COLORS: Record<OrderStatus, string> = {
  'Pendente': 'text-caramelo-palha bg-caramelo-palha/10 border-caramelo-palha/20',
  'Em Preparo': 'text-marrom-madeira bg-marrom-madeira/10 border-marrom-madeira/20',
  'Saiu para Entrega': 'text-verde-folha bg-verde-folha/10 border-verde-folha/20',
  'Finalizado': 'text-marrom-escuro bg-marrom-escuro/10 border-marrom-escuro/20',
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

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const orderIdMatch = o.id.toLowerCase().includes(searchTerm.toLowerCase());
      const orderNumMatch = o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const customerMatch = o.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSearch = orderIdMatch || orderNumMatch || customerMatch;
      const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const formatDate = (createdAt: any) => {
    if (!createdAt) return '...';
    try {
      if (createdAt instanceof Timestamp) {
        return createdAt.toDate().toLocaleDateString('pt-BR');
      }
      if (createdAt.seconds) {
        return new Date(createdAt.seconds * 1000).toLocaleDateString('pt-BR');
      }
      return new Date(createdAt).toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data Inválida';
    }
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

  const handleUpdateItemQty = (index: number, delta: number) => {
    const newItems = [...editFormData.items];
    const item = newItems[index];
    const newQty = Math.max(1, item.quantity + delta);
    newItems[index] = { ...item, quantity: newQty };
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editFormData.items.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleAddItem = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (!product) return;

    const existingItemIndex = editFormData.items.findIndex(i => i.productId === productId);
    if (existingItemIndex > -1) {
      handleUpdateItemQty(existingItemIndex, 1);
    } else {
      setEditFormData({
        ...editFormData,
        items: [...editFormData.items, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }]
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!db || !editingOrder) return;

    if (editFormData.items.length === 0) {
      toast({ variant: "destructive", title: "Erro", description: "O pedido deve ter pelo menos um item." });
      return;
    }

    const newTotal = editFormData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    try {
      await updateDoc(doc(db, 'orders', editingOrder.id), {
        'customer.name': editFormData.name,
        'customer.phone': editFormData.phone,
        'customer.address': editFormData.address,
        items: editFormData.items,
        total: newTotal
      });
      toast({ title: "Pedido Atualizado", description: "As alterações foram salvas com sucesso." });
      setIsEditModalOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao Editar", description: "Não foi possível salvar as alterações." });
    }
  };

  const handleResendToWhatsApp = (order: Order) => {
    const phone = order.customer.phone.replace(/\D/g, '');
    let message = `Olá *${order.customer.name}*, seu pedido *#${order.orderNumber || order.id.substring(0, 8)}* no Paroara foi atualizado.\n\n`;
    message += `🛒 *RESUMO ATUALIZADO:*\n`;
    
    order.items.forEach(item => {
      message += `• ${item.quantity}x *${item.name}* - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });

    message += `\n*Novo Total: R$ ${order.total.toFixed(2).replace('.', ',')}*\n`;
    message += `💳 *Pagamento:* ${order.payment?.method || 'Não inf.'}\n\n`;
    message += `Acompanhamos seu pedido! Qualquer dúvida, estamos à disposição.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const exportToCSV = () => {
    if (!orders) return;
    const headers = ['ID', 'Num Pedido', 'Data', 'Cliente', 'Telefone', 'Total', 'Pagamento', 'Status'];
    const rows = orders.map(o => [
      o.id,
      o.orderNumber || '-',
      formatDate(o.createdAt),
      o.customer.name,
      o.customer.phone,
      o.total.toFixed(2),
      o.payment?.method || 'N/A',
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
    <div className="space-y-8 animate-in fade-in duration-500">
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
        <div className="p-4 md:p-6 border-b border-areia-escura bg-areia-clara/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar por cliente, ID ou número..."
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

        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-areia-escura">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 space-y-4 animate-pulse">
                <div className="h-4 w-1/3 bg-areia-media/20 rounded"></div>
                <div className="h-6 w-1/2 bg-areia-media/20 rounded"></div>
              </div>
            ))
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-5 space-y-4 bg-white hover:bg-areia-clara/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xl font-mono text-marrom-terra font-black tracking-widest bg-marrom-terra/5 px-3 py-1 rounded-sm border border-marrom-terra/10">
                      #{order.orderNumber || order.id.substring(0, 8)}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-marrom-madeira mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-widest border", STATUS_COLORS[order.status])}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-marrom-terra opacity-60" />
                    <p className="text-sm font-black text-marrom-terra uppercase tracking-tight">{order.customer.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-verde-folha">
                    <Phone className="w-3.5 h-3.5" />
                    {order.customer.phone}
                  </div>
                  {order.customer.address && (
                    <div className="flex items-center gap-2 text-[10px] text-cinza-organico italic">
                      <MapPin className="w-3.5 h-3.5" />
                      {order.customer.address}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-areia-clara/10 p-3 rounded-sm border border-areia-escura/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-marrom-madeira opacity-60">
                      <Package className="w-2.5 h-2.5" /> Itens
                    </div>
                    <div className="text-[10px] text-marrom-texto truncate">
                      {order.items.length} produto(s)
                    </div>
                  </div>
                  <div className="bg-areia-clara/10 p-3 rounded-sm border border-areia-escura/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-marrom-madeira opacity-60">
                      <CreditCard className="w-2.5 h-2.5" /> Pagamento
                    </div>
                    <div className="text-[10px] font-bold text-marrom-texto truncate">
                      {order.payment?.method || 'Não inf.'}
                      {order.payment?.changeFor ? ` (T: ${order.payment.changeFor})` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dashed border-areia-escura/30">
                  <div className="text-lg font-black text-marrom-escuro">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-verde-folha bg-verde-folha/5 rounded-full"
                      onClick={() => handleResendToWhatsApp(order)}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10 border-areia-escura rounded-full">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-areia-clara border-areia-escura w-56">
                        {order.status === 'Pendente' && (
                          <DropdownMenuItem onClick={() => handleOpenEditModal(order)} className="py-3 text-xs uppercase font-bold tracking-widest gap-2">
                            <Edit2 className="w-4 h-4 text-marrom-madeira" /> Editar Pedido
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Pendente')} className="py-3 text-xs uppercase font-bold tracking-widest gap-2">
                          <Clock className="w-4 h-4 text-caramelo-palha" /> Pendente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Em Preparo')} className="py-3 text-xs uppercase font-bold tracking-widest gap-2">
                          <AlertCircle className="w-4 h-4 text-marrom-madeira" /> Em Preparo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Saiu para Entrega')} className="py-3 text-xs uppercase font-bold tracking-widest gap-2">
                          <Truck className="w-4 h-4 text-verde-folha" /> Em Rota
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Finalizado')} className="py-3 text-xs uppercase font-bold tracking-widest gap-2">
                          <CheckCircle className="w-4 h-4 text-marrom-escuro" /> Finalizado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-cinza-organico italic text-sm">Nenhum pedido encontrado.</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-areia-clara/10">
              <TableRow className="hover:bg-transparent border-areia-escura">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Ref Pedido</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Data</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Cliente</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Pagamento</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Total</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={7} className="h-20 bg-areia-media/5"></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const PayIcon = order.payment?.method ? PAYMENT_ICONS[order.payment.method] || CreditCard : CreditCard;
                  return (
                    <TableRow key={order.id} className="hover:bg-areia-media/5 border-areia-escura group transition-colors">
                      <TableCell>
                        <p className="text-xs font-mono text-marrom-terra font-black">
                          #{order.orderNumber || order.id.substring(0, 8)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-marrom-madeira uppercase">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
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
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-areia-media/20 rounded-sm">
                            <PayIcon className="w-3.5 h-3.5 text-marrom-madeira" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-marrom-terra leading-none">
                              {order.payment?.method || 'N/A'}
                            </span>
                            {order.payment?.changeFor && (
                              <span className="text-[8px] text-cinza-organico italic mt-0.5">
                                Troco para R$ {order.payment.changeFor.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-marrom-escuro text-sm">R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
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
                            {order.status === 'Pendente' && (
                              <DropdownMenuItem onClick={() => handleOpenEditModal(order)} className="text-xs uppercase font-bold tracking-widest gap-2">
                                <Edit2 className="w-3 h-3 text-marrom-madeira" /> Editar Pedido
                              </DropdownMenuItem>
                            )}
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
                            <DropdownMenuItem className="text-xs uppercase font-bold tracking-widest gap-2 text-verde-folha" onClick={() => handleResendToWhatsApp(order)}>
                              <MessageCircle className="w-3 h-3" /> WhatsApp
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-cinza-organico italic font-subheadline">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal de Edição de Pedido */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-areia-clara border-none shadow-2xl p-0 overflow-hidden max-w-2xl">
          <DialogHeader className="p-6 bg-marrom-escuro text-areia-clara">
            <DialogTitle className="font-headline tracking-widest uppercase">
              Editar Detalhes do Pedido
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna Dados do Cliente */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira mb-2">Informações do Cliente</h4>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nome</Label>
                  <Input 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="bg-white border-areia-escura"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">WhatsApp</Label>
                  <Input 
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value.replace(/\D/g, '')})}
                    className="bg-white border-areia-escura"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Endereço</Label>
                  <Input 
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    className="bg-white border-areia-escura"
                  />
                </div>
              </div>

              {/* Coluna Itens do Pedido */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira mb-2">Resumo de Pagamento</h4>
                <div className="p-4 bg-white/50 border border-areia-escura rounded-sm space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold opacity-60 uppercase tracking-widest">Método:</span>
                    <span className="font-black text-marrom-terra">{editingOrder?.payment?.method || 'N/A'}</span>
                  </div>
                  {editingOrder?.payment?.changeFor && (
                    <div className="flex justify-between text-xs">
                      <span className="font-bold opacity-60 uppercase tracking-widest">Troco para:</span>
                      <span className="font-black text-marrom-terra">R$ {editingOrder.payment.changeFor.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <h4 className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira mb-2 pt-2">Itens</h4>
                <div className="space-y-2">
                  {editFormData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-areia-escura rounded-sm">
                      <div className="flex-1 pr-2">
                        <p className="text-[10px] font-bold text-marrom-terra truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-areia-escura rounded-sm bg-areia-clara/20">
                          <button onClick={() => handleUpdateItemQty(idx, -1)} className="p-1 hover:bg-areia-media">
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-5 text-center text-[10px] font-black">{item.quantity}</span>
                          <button onClick={() => handleUpdateItemQty(idx, 1)} className="p-1 hover:bg-areia-media">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-dashed border-areia-escura">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Total</span>
                    <span className="text-lg font-black text-marrom-escuro">
                      R$ {editFormData.items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-white border-t border-areia-escura">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-[10px] uppercase font-bold tracking-widest">Cancelar</Button>
            <Button onClick={handleSaveEdit} className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro rounded-sm px-8 font-bold uppercase tracking-widest text-[10px]">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
