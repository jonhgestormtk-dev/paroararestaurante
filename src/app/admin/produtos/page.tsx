
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  XCircle,
  Store
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
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

  const [formData, setFormData] = useState<Partial<Product>>({
    restaurantId: 'paroara',
    name: '',
    category: 'Regionais',
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

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        active: product.active !== undefined ? product.active : true
      });
    } else {
      setEditingProduct(null);
      setFormData({
        restaurantId: 'paroara',
        name: '',
        category: 'Regionais',
        price: 0,
        description: '',
        imageUrl: '',
        featured: false,
        promotion: false,
        active: true,
        stock: 20
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!db) return;

    if (!formData.name?.trim() || !formData.restaurantId) {
      toast({ variant: "destructive", title: "Erro", description: "Nome e Restaurante são obrigatórios." });
      return;
    }

    const dataToSave = { 
      ...formData,
      active: formData.active ?? true,
      updatedAt: serverTimestamp()
    };
    
    if (editingProduct) {
      const docRef = doc(db, 'products', editingProduct.id);
      updateDoc(docRef, dataToSave).then(() => {
        toast({ title: "Prato Atualizado" });
      });
    } else {
      addDoc(collection(db, 'products'), {
        ...dataToSave,
        createdAt: serverTimestamp()
      }).then(() => {
        toast({ title: "Prato Adicionado" });
      });
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!db || !window.confirm('Excluir prato?')) return;
    deleteDoc(doc(db, 'products', id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Gestão de Pratos</h1>
          <p className="text-cinza-organico font-subheadline italic">Adicione ou remova itens do catálogo unificado.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-marrom-terra text-areia-clara rounded-sm gap-2 uppercase tracking-widest text-xs">
          <Plus className="w-4 h-4" />
          Novo Prato
        </Button>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden">
        <div className="p-6 border-b border-areia-escura bg-areia-clara/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
            <SelectTrigger className="w-full md:w-64">
              <div className="flex items-center gap-2">
                <Store className="w-3 h-3" />
                <SelectValue placeholder="Filtrar Restaurante" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Restaurantes</SelectItem>
              <SelectItem value="paroara">Paroara</SelectItem>
              <SelectItem value="egua-da-panela">Égua da Panela</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurante</TableHead>
                <TableHead>Prato</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-20 text-center">Carregando...</TableCell></TableRow>
              ) : filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      product.restaurantId === 'paroara' ? "border-marrom-terra text-marrom-terra" : "border-verde-folha text-verde-folha"
                    )}>
                      {product.restaurantId}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">{product.name}</TableCell>
                  <TableCell className="text-xs uppercase">{product.category}</TableCell>
                  <TableCell className="font-bold">R$ {product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.active !== false ? <Badge className="bg-verde-folha text-[8px]">ATIVO</Badge> : <Badge variant="secondary" className="text-[8px]">INATIVO</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-areia-clara">
          <DialogHeader>
            <DialogTitle className="font-headline uppercase">{editingProduct ? 'Editar Prato' : 'Novo Prato'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Pertence ao Restaurante *</Label>
                <Select 
                  value={formData.restaurantId} 
                  onValueChange={(v) => setFormData({...formData, restaurantId: v as RestaurantSlug})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paroara">Paroara</SelectItem>
                    <SelectItem value="egua-da-panela">Égua da Panela</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Nome do Prato *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Preço *</Label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Estoque *</Label>
                  <Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Descrição *</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="h-24" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">URL da Imagem</Label>
                <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.active} onCheckedChange={(v) => setFormData({...formData, active: v})} />
                  <Label className="text-xs">Ativo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.featured} onCheckedChange={(v) => setFormData({...formData, featured: v})} />
                  <Label className="text-xs">Destaque</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4">
            <Button onClick={handleSave} className="bg-marrom-terra text-areia-clara uppercase font-bold tracking-widest text-xs px-10">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
