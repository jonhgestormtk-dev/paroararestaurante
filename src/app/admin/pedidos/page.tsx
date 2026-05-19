'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
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
  Wallet,
  PlusCircle,
  StickyNote,
  Store,
  XCircle
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

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string; icon: any }> = {
  'Pendente': { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Pendente', icon: Clock },
  'Em Preparo': { color: '#D97706', bg: 'bg-orange-600/10', label: 'Em Preparo', icon: AlertCircle },
  'Saiu para Entrega': { color: '#2563EB', bg: 'bg-blue-600/10', label: 'Em Rota', icon: Truck },
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
      let date: Date;
      if (createdAt instanceof Timestamp) {
        date = createdAt.toDate();
      } else if (createdAt.seconds) {
        date = new Date(createdAt.seconds * 1000);
      } else {
        date = new Date(createdAt);
      }
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
    if (editingOrder?.status !== 'Pendente') return;
    
    const newItems = [...editFormData.items];
    const item = newItems[index];
    const newQty = Math.max(1, item.quantity + delta);
    newItems[index] = { ...item, quantity: newQty };
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    if (editingOrder?.status !== 'Pendente') return;
    
    const newItems = editFormData.items.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleAddItem = (productId: string) => {
    if (editingOrder?.status !== 'Pendente') return;

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
          quantity: 1,
          observations: ''
        }]
      });
    }
    toast({ title: "Item Adicionado", description: `${product.name} foi adicionado ao pedido.` });
  };

  const handleSaveEdit = async () => {
    if (!db || !editingOrder) return;

    if (editingOrder.status !== 'Pendente') {
      toast({ variant: "destructive", title: "Erro", description: "Apenas pedidos pendentes podem ser editados." });
      return;
    }

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
      if (item.observations) {
        message += `  _Obs: ${item.observations}_\n`;
      }
    });

    message += `\n*Novo Total: R$ ${order.total.toFixed(2).replace('.', ',')}*\n`;
    message += `💳 *Pagamento:* ${order.payment?.method || 'Não inf.'}\n\n`;
    message += `Acompanhamos seu pedido! Qualquer dúvida, estamos à disposição.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Gerenciamento de Pedidos</h1>
          <p className="text-cinza-organico font-subheadline italic">Monitoramento centralizado para todas as unidades.</p>
        </div>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden shadow-2xl rounded-2xl">
        <div className="p-4 md:p-6 border-b border-areia-escura bg-areia-clara/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar por cliente, número ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-areia-escura/50 focus:ring-marrom-terra rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-56 bg-white border-areia-escura/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" />
                <SelectValue placeholder="Status: Todos" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-areia-clara rounded-xl">
              <SelectItem value="todos">Todos os Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key} className="gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-areia-escura/10">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 space-y-4 animate-pulse">
                <div className="h-4 w-1/3 bg-areia-media/20 rounded"></div>
                <div className="h-6 w-1/2 bg-areia-media/20 rounded"></div>
              </div>
            ))
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const resConfig = RESTAURANT_CONFIG[order.restaurantId] || RESTAURANT_CONFIG['paroara'];
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pendente'];

              return (
                <div key={order.id} className="p-5 space-y-5 bg-white hover:bg-areia-clara/5 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border-none shadow-sm", resConfig.color, "text-white")}>
                          {resConfig.name}
                        </Badge>
                        <p className="text-xs font-mono font-black text-marrom-madeira/40">#{order.orderNumber || order.id.substring(0, 8)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-marrom-madeira/60">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-[0.1em] border-none px-3 py-1.5 rounded-full shadow-sm", status.bg)} style={{ color: status.color }}>
                       {status.label}
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-inner", resConfig.color)}>
                        {order.customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-headline text-base text-marrom-escuro truncate uppercase tracking-tighter">
                          {order.customer.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-bold text-verde-folha">
                          <Phone className="w-3 h-3" />
                          {order.customer.phone}
                        </div>
                      </div>
                    </div>
                    {order.customer.address && (
                      <div className="flex items-start gap-2 text-[10px] text-cinza-organico italic px-1">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.customer.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Resumo de Itens Minimalista */}
                  <div className="space-y-2 bg-areia-clara/10 p-4 rounded-2xl border border-areia-escura/20">
                     <p className="text-[8px] font-black uppercase tracking-[0.2em] text-marrom-madeira opacity-40 mb-1">Itens do Pedido</p>
                     <div className="space-y-2">
                       {order.items.map((item, idx) => (
                         <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-marrom-terra">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="opacity-40">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            {item.observations && (
                              <div className="text-[9px] italic text-marrom-madeira/60 flex gap-1.5 pl-2 border-l-2 border-marrom-terra/10 py-0.5">
                                <StickyNote className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                                {item.observations}
                              </div>
                            )}
                         </div>
                       ))}
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-areia-escura/40">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-cinza-organico opacity-40 leading-none mb-1">Total a Receber</p>
                      <div className="text-2xl font-black text-marrom-escuro tracking-tighter">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 text-verde-folha bg-verde-folha/5 hover:bg-verde-folha/10 rounded-2xl transition-all"
                        onClick={() => handleResendToWhatsApp(order)}
                      >
                        <MessageCircle className="w-6 h-6" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-12 w-12 border-areia-escura/40 rounded-2xl hover:bg-areia-clara/20">
                            <MoreVertical className="w-6 h-6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-areia-clara border-areia-escura w-60 rounded-xl p-2 shadow-2xl">
                          {order.status === 'Pendente' && (
                            <DropdownMenuItem onClick={() => handleOpenEditModal(order)} className="py-3 text-[10px] uppercase font-black tracking-widest gap-3 rounded-lg">
                              <Edit2 className="w-4 h-4 text-marrom-madeira" /> Editar Detalhes
                            </DropdownMenuItem>
                          )}
                          <div className="px-2 py-1 text-[8px] font-black uppercase text-cinza-organico opacity-40">Alterar Status</div>
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <DropdownMenuItem 
                              key={key} 
                              onClick={() => handleUpdateStatus(order.id, key as OrderStatus)} 
                              className="py-3 text-[10px] uppercase font-black tracking-widest gap-3 rounded-lg"
                            >
                              <config.icon className="w-4 h-4" style={{ color: config.color }} /> 
                              {config.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 mx-auto text-areia-escura opacity-20" />
              <p className="text-sm italic text-cinza-organico">Nenhum pedido encontrado para este filtro.</p>
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-areia-clara/10">
              <TableRow className="hover:bg-transparent border-areia-escura">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira py-6">Referência / Unidade</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Data & Hora</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Cliente / Endereço</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Itens</TableHead>
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
                    <TableCell colSpan={8} className="h-24 bg-areia-media/5"></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const resConfig = RESTAURANT_CONFIG[order.restaurantId] || RESTAURANT_CONFIG['paroara'];
                  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pendente'];
                  const PayIcon = order.payment?.method ? PAYMENT_ICONS[order.payment.method] || CreditCard : CreditCard;

                  return (
                    <TableRow key={order.id} className="hover:bg-areia-media/5 border-areia-escura transition-colors group">
                      <TableCell className="py-6">
                        <div className="flex flex-col gap-2">
                           <p className="text-xs font-mono text-marrom-terra font-black">
                            #{order.orderNumber || order.id.substring(0, 8)}
                          </p>
                          <Badge className={cn("text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm w-fit border-none shadow-sm", resConfig.color, "text-white")}>
                            {resConfig.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-marrom-madeira uppercase">
                          <Calendar className="w-3 h-3 opacity-40" />
                          {formatDate(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <p className="text-sm font-black text-marrom-terra uppercase tracking-tight">{order.customer.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-verde-folha font-bold">
                            <Phone className="w-3 h-3" />
                            {order.customer.phone}
                          </div>
                          {order.customer.address && (
                            <div className="text-[9px] text-cinza-organico italic truncate max-w-[150px]">
                              {order.customer.address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="space-y-1 pl-2 border-l-2 border-areia-escura max-w-[200px]">
                           {order.items.map((item, idx) => (
                             <div key={idx} className="text-[9px] flex flex-col mb-1">
                               <span className="font-bold text-marrom-madeira leading-tight">{item.quantity}x {item.name}</span>
                               {item.observations && (
                                 <span className="italic text-cinza-organico flex items-center gap-1 opacity-60">
                                   <StickyNote className="w-2.5 h-2.5" /> {item.observations}
                                 </span>
                               )}
                             </div>
                           ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-areia-clara/40 rounded-xl shadow-sm">
                            <PayIcon className="w-4 h-4 text-marrom-terra" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-marrom-terra">
                              {order.payment?.method || 'N/A'}
                            </span>
                            {order.payment?.changeFor && (
                              <span className="text-[8px] text-cinza-organico italic">
                                Troco para R$ {order.payment.changeFor.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-base font-black text-marrom-escuro tracking-tighter">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-[0.1em] border-none px-4 py-2 rounded-full", status.bg)} style={{ color: status.color }}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-marrom-madeira rounded-xl hover:bg-areia-clara/40">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-areia-clara border-areia-escura w-56 rounded-xl p-2 shadow-2xl">
                            {order.status === 'Pendente' && (
                              <DropdownMenuItem onClick={() => handleOpenEditModal(order)} className="text-[10px] font-black uppercase tracking-widest gap-3 rounded-lg py-3">
                                <Edit2 className="w-4 h-4 text-marrom-madeira" /> Editar Pedido
                              </DropdownMenuItem>
                            )}
                            <div className="px-2 py-1 text-[8px] font-black uppercase text-cinza-organico opacity-40">Mudar Status</div>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <DropdownMenuItem 
                                key={key} 
                                onClick={() => handleUpdateStatus(order.id, key as OrderStatus)} 
                                className="text-[10px] font-black uppercase tracking-widest gap-3 rounded-lg py-3"
                              >
                                <config.icon className="w-4 h-4" style={{ color: config.color }} /> 
                                {config.label}
                              </DropdownMenuItem>
                            ))}
                            <Separator className="my-2 bg-areia-escura/30" />
                            <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest gap-3 rounded-lg py-3 text-verde-folha" onClick={() => handleResendToWhatsApp(order)}>
                              <MessageCircle className="w-4 h-4" /> WhatsApp
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-cinza-organico italic font-subheadline opacity-40">
                    Nenhum pedido registrado até o momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal de Edição de Pedido - Mantido similar mas ajustado visualmente */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-areia-clara border-none shadow-2xl p-0 overflow-hidden max-w-2xl rounded-2xl">
          <DialogHeader className="p-6 bg-marrom-escuro text-areia-clara">
            <DialogTitle className="font-headline tracking-widest uppercase text-xl">
              Ajustar Detalhes do Pedido
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira mb-2 opacity-60">Informações do Cliente</h4>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Nome do Cliente</Label>
                  <Input 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="bg-white border-areia-escura/50 rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-40">WhatsApp</Label>
                  <Input 
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value.replace(/\D/g, '')})}
                    className="bg-white border-areia-escura/50 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Endereço de Entrega</Label>
                  <Input 
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    className="bg-white border-areia-escura/50 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira mb-2 opacity-60">Itens & Valores</h4>
                
                <div className="p-4 bg-white/50 border border-areia-escura/30 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold opacity-40 uppercase tracking-widest">Pagamento:</span>
                    <span className="font-black text-marrom-terra uppercase">{editingOrder?.payment?.method || 'N/A'}</span>
                  </div>
                  {editingOrder?.payment?.changeFor && (
                    <div className="flex justify-between text-xs">
                      <span className="font-bold opacity-40 uppercase tracking-widest">Troco para:</span>
                      <span className="font-black text-marrom-terra">R$ {editingOrder.payment.changeFor.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                   <div className="p-3 bg-white/40 border border-dashed border-marrom-madeira/20 rounded-2xl space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-marrom-madeira opacity-40 flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5" /> Adicionar Novo Prato
                    </Label>
                    <Select onValueChange={(v) => handleAddItem(v)}>
                      <SelectTrigger className="bg-white border-areia-escura/50 h-11 rounded-xl text-xs">
                        <SelectValue placeholder="Escolha um prato..." />
                      </SelectTrigger>
                      <SelectContent className="bg-areia-clara border-areia-escura rounded-xl">
                        {products?.filter(p => p.active !== false && p.restaurantId === editingOrder?.restaurantId).map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.emoji} {p.name} - R$ {p.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {editFormData.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-3 bg-white border border-areia-escura/30 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-2">
                            <p className="text-[11px] font-black text-marrom-terra uppercase truncate">{item.name}</p>
                            <p className="text-[10px] font-bold text-cinza-organico">R$ {item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-areia-escura/40 rounded-xl bg-areia-clara/20 p-1">
                              <button onClick={() => handleUpdateItemQty(idx, -1)} className="p-1 hover:bg-areia-media/40 rounded-lg">
                                <Minus className="w-3 h-3 text-marrom-madeira" />
                              </button>
                              <span className="w-6 text-center text-xs font-black text-marrom-escuro">{item.quantity}</span>
                              <button onClick={() => handleUpdateItemQty(idx, 1)} className="p-1 hover:bg-areia-media/40 rounded-lg">
                                <Plus className="w-3 h-3 text-marrom-madeira" />
                              </button>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-xl"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-areia-escura/40">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-marrom-madeira opacity-40">Novo Total</span>
                    <span className="text-2xl font-black text-marrom-escuro tracking-tighter">
                      R$ {editFormData.items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-white border-t border-areia-escura/20">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-[10px] uppercase font-black tracking-widest rounded-xl px-6">Cancelar</Button>
            <Button onClick={handleSaveEdit} className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro rounded-xl px-10 font-black uppercase tracking-widest text-[10px] h-12 shadow-xl">
              Confirmar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
