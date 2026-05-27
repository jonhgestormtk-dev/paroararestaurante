
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Store
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Product, RestaurantSlug } from '@/lib/types';
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImagePickerModal } from '@/components/admin/ImagePickerModal';
import { Toaster } from 'react-hot-toast';

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const db = useFirestore();
  
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);
  const { data: products, loading } = useCollection<Product>(productsQuery);

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: allCategories } = useCollection<any>(categoriesQuery);

  const [formData, setFormData] = useState<Partial<Product>>({
    restaurantId: 'paroara',
    name: '',
    category: '',
    price: 0,
    description: '',
    imageUrl: '',
    featured: false,
    promotion: false,
    active: true,
    stock: 20
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRestaurant = restaurantFilter === 'todos' || p.restaurantId === restaurantFilter;
      return matchesSearch && matchesRestaurant;
    }).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [products, searchTerm, restaurantFilter]);

  const availableCategories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.filter((c: any) => c.restaurantId === formData.restaurantId && c.active !== false);
  }, [allCategories, formData.restaurantId]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product, active: product.active !== undefined ? product.active : true });
    } else {
      setEditingProduct(null);
      setFormData({
        restaurantId: restaurantFilter !== 'todos' ? (restaurantFilter as RestaurantSlug) : 'paroara',
        name: '', category: '', price: 0, description: '', imageUrl: '', featured: false, promotion: false, active: true, stock: 20
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!db) return;
    if (!formData.name?.trim() || !formData.restaurantId || !formData.category) {
      toast({ variant: "destructive", title: "Erro", description: "Nome, Restaurante e Categoria são obrigatórios." });
      return;
    }
    const dataToSave = { ...formData, active: formData.active ?? true, updatedAt: serverTimestamp() };
    if (editingProduct) {
      updateDoc(doc(db, 'products', editingProduct.id), dataToSave).then(() => toast({ title: "Prato Atualizado" }));
    } else {
      addDoc(collection(db, 'products'), { ...dataToSave, createdAt: serverTimestamp() }).then(() => toast({ title: "Prato Adicionado" }));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Gestão de Pratos</h1>
          <p className="text-cinza-organico font-subheadline italic">Gerencie o catálogo de sabores regionais.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-marrom-terra text-areia-clara rounded-sm gap-2 uppercase tracking-widest text-xs h-12 px-6 shadow-xl">
          <Plus className="w-4 h-4" /> Novo Prato
        </Button>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden">
        <div className="p-6 border-b border-areia-escura bg-areia-clara/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
            <SelectTrigger className="w-full md:w-64"><div className="flex items-center gap-2"><Store className="w-3 h-3" /><SelectValue placeholder="Filtrar Restaurante" /></div></SelectTrigger>
            <SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="paroara">Paroara</SelectItem><SelectItem value="egua-na-panela">Égua na Panela</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto"><Table>
          <TableHeader><TableRow><TableHead>Restaurante</TableHead><TableHead>Prato</TableHead><TableHead>Preço</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-10">Carregando...</TableCell></TableRow> : filteredProducts.map((p) => (
              <TableRow key={p.id}>
                <TableCell><Badge variant="outline" className={cn("text-[9px] uppercase", p.restaurantId === 'paroara' ? "border-marrom-terra" : "border-fogo-vibrante")}>{p.restaurantId}</Badge></TableCell>
                <TableCell className="font-bold">{p.name}</TableCell>
                <TableCell>R$ {p.price.toFixed(2)}</TableCell>
                <TableCell>{p.active ? <Badge className="bg-verde-folha/10 text-verde-folha border-none text-[8px]">ATIVO</Badge> : <Badge variant="secondary" className="text-[8px]">INATIVO</Badge>}</TableCell>
                <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="icon" onClick={() => handleOpenModal(p)}><Edit2 className="w-4 h-4" /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if(window.confirm('Excluir?')) deleteDoc(doc(db!, 'products', p.id)).then(() => toast({title: "Excluído"})); }}><Trash2 className="w-4 h-4" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-areia-clara p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh]">
          <DialogHeader className="p-6 bg-marrom-escuro text-areia-clara shrink-0">
            <DialogTitle className="font-headline uppercase tracking-widest">{editingProduct ? 'Editar Prato' : 'Novo Prato'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <div className="space-y-6">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Imagem do Prato</Label>
                  <ImagePickerModal 
                    value={formData.imageUrl} 
                    onSelect={(url) => setFormData({...formData, imageUrl: url})} 
                    restaurantId={formData.restaurantId || 'paroara'}
                  />
                </div>
                
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Restaurante *</Label>
                  <Select value={formData.restaurantId} onValueChange={(v) => setFormData({...formData, restaurantId: v as RestaurantSlug, category: ''})}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paroara">Paroara</SelectItem><SelectItem value="egua-na-panela">Égua na Panela</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}><SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{availableCategories.map((c: any) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Nome *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-white" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Preço *</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="bg-white" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Estoque</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="bg-white" /></div>
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase">Descrição *</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="h-24 bg-white" /></div>
                <div className="flex gap-4 items-center p-4 bg-white/40 rounded-xl border border-areia-escura/30 shadow-inner">
                  <div className="flex items-center gap-3"><Switch checked={formData.active} onCheckedChange={(v) => setFormData({...formData, active: v})} /><Label className="text-[10px] font-black uppercase">Ativo</Label></div>
                  <div className="flex items-center gap-3"><Switch checked={formData.featured} onCheckedChange={(v) => setFormData({...formData, featured: v})} /><Label className="text-[10px] font-black uppercase">Destaque</Label></div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 bg-white border-t border-areia-escura shrink-0">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest">Cancelar</Button>
            <Button onClick={handleSave} className="bg-marrom-terra text-areia-clara uppercase font-bold tracking-widest text-xs px-10 rounded-sm shadow-xl h-11">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
