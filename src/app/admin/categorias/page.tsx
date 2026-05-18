
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2,
  XCircle,
  Store
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
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
import { cn } from '@/lib/utils';
import { RestaurantSlug } from '@/lib/types';

interface CategoryDoc {
  id: string;
  restaurantId: RestaurantSlug;
  name: string;
  active: boolean;
  order?: number;
  createdAt?: any;
}

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDoc | null>(null);
  const { toast } = useToast();

  const db = useFirestore();
  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('order', 'asc'));
  }, [db]);
  const { data: categories, loading } = useCollection<CategoryDoc>(categoriesQuery);

  const [formData, setFormData] = useState<Partial<CategoryDoc>>({
    restaurantId: 'paroara',
    name: '',
    active: true,
    order: 0
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRestaurant = restaurantFilter === 'todos' || c.restaurantId === restaurantFilter;
      return matchesSearch && matchesRestaurant;
    });
  }, [categories, searchTerm, restaurantFilter]);

  const handleOpenModal = (category?: CategoryDoc) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        restaurantId: category.restaurantId || 'paroara',
        name: category.name,
        active: category.active,
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        restaurantId: restaurantFilter !== 'todos' ? (restaurantFilter as RestaurantSlug) : 'paroara',
        name: '',
        active: true,
        order: categories ? categories.length * 10 : 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!db || !formData.name?.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da categoria é obrigatório." });
      return;
    }

    // Garantir que restaurantId nunca seja undefined para o Firebase
    const dataToSave = { 
      restaurantId: formData.restaurantId || 'paroara',
      name: formData.name,
      active: formData.active ?? true,
      order: formData.order || 0,
      updatedAt: serverTimestamp()
    };
    
    if (editingCategory) {
      const docRef = doc(db, 'categories', editingCategory.id);
      updateDoc(docRef, dataToSave)
        .then(() => {
          toast({ title: "Categoria Atualizada" });
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: dataToSave,
          } satisfies SecurityRuleContext));
        });
    } else {
      const colRef = collection(db, 'categories');
      addDoc(colRef, {
        ...dataToSave,
        createdAt: serverTimestamp()
      })
        .then(() => {
          toast({ title: "Categoria Criada" });
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: colRef.path,
            operation: 'create',
            requestResourceData: dataToSave,
          } satisfies SecurityRuleContext));
        });
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!db || !window.confirm('Excluir esta categoria? Pratos vinculados a ela não serão excluídos.')) return;
    
    const docRef = doc(db, 'categories', id);
    deleteDoc(docRef).then(() => {
      toast({ title: "Removida" });
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext));
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Categorias</h1>
          <p className="text-cinza-organico font-subheadline italic">Gerencie as divisões específicas por restaurante.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="bg-marrom-terra text-areia-clara rounded-sm gap-2 uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden">
        <div className="p-6 border-b border-areia-escura bg-areia-clara/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar categoria..."
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
              <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-areia-escura">
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Restaurante</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Nome</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Ordem</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Carregando...</TableCell></TableRow>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className={cn("hover:bg-areia-media/5 border-areia-escura transition-colors", !cat.active && "opacity-60")}>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        cat.restaurantId === 'paroara' ? "border-marrom-terra text-marrom-terra" : "border-fogo-vibrante text-fogo-vibrante"
                      )}>
                        {cat.restaurantId?.replace('-', ' ') || 'Geral'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-marrom-terra">{cat.name}</TableCell>
                    <TableCell className="font-mono text-xs">{cat.order || 0}</TableCell>
                    <TableCell>
                      {cat.active ? (
                        <Badge className="bg-verde-folha/10 text-verde-folha border-verde-folha/20 text-[8px]">ATIVA</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[8px]">INATIVA</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-marrom-madeira" onClick={() => handleOpenModal(cat)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-cinza-organico italic">
                    Nenhuma categoria encontrada para este filtro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-areia-clara border-none shadow-2xl p-0 overflow-hidden max-w-md">
          <DialogHeader className="p-6 bg-marrom-escuro text-areia-clara">
            <DialogTitle className="font-headline tracking-widest uppercase">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Restaurante</Label>
              <Select 
                value={formData.restaurantId} 
                onValueChange={(v) => setFormData({...formData, restaurantId: v as RestaurantSlug})}
              >
                <SelectTrigger className="bg-white border-areia-escura">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paroara">Paroara</SelectItem>
                  <SelectItem value="egua-na-panela">Égua na Panela</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Nome da Categoria</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-white border-areia-escura"
                placeholder="Ex: Pratos Regionais"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Ordem de Exibição</Label>
              <Input 
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                className="bg-white border-areia-escura"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-sm border border-areia-escura">
              <Label className="text-xs font-bold text-marrom-madeira">Status Ativo</Label>
              <Switch 
                checked={formData.active}
                onCheckedChange={(v) => setFormData({...formData, active: v})}
              />
            </div>
          </div>

          <DialogFooter className="p-6 bg-white border-t border-areia-escura">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] uppercase font-bold tracking-widest">Cancelar</Button>
            <Button onClick={handleSave} className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro rounded-sm px-6 font-bold uppercase tracking-widest text-xs">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
