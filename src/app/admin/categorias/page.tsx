
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Tags, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2,
  XCircle
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryDoc {
  id: string;
  name: string;
  active: boolean;
  order?: number;
  createdAt?: any;
}

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('');
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
    name: '',
    active: true,
    order: 0
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const handleOpenModal = (category?: CategoryDoc) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        active: category.active,
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        active: true,
        order: categories ? categories.length : 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!db || !formData.name?.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da categoria é obrigatório." });
      return;
    }

    const dataToSave = { 
      ...formData,
      updatedAt: serverTimestamp()
    };
    
    if (editingCategory) {
      const docRef = doc(db, 'categories', editingCategory.id);
      updateDoc(docRef, dataToSave)
        .then(() => {
          toast({ title: "Categoria Atualizada", description: "As alterações foram salvas." });
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
          toast({ title: "Categoria Criada", description: "Nova categoria adicionada ao cardápio." });
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
      toast({ title: "Removida", description: "Categoria excluída com sucesso." });
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext));
    });
  };

  const toggleActive = (category: CategoryDoc) => {
    if (!db) return;
    const docRef = doc(db, 'categories', category.id);
    updateDoc(docRef, { active: !category.active });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Categorias</h1>
          <p className="text-cinza-organico font-subheadline italic">Gerencie as divisões do seu cardápio.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro rounded-sm px-6 py-6 font-bold uppercase tracking-widest text-xs gap-2 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden">
        <div className="p-6 border-b border-areia-escura bg-areia-clara/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-areia-escura/50 focus:ring-marrom-terra"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-areia-clara/10">
              <TableRow className="hover:bg-transparent border-areia-escura">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Ordem</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Nome</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={4} className="h-16 bg-areia-media/5"></TableCell>
                  </TableRow>
                ))
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className={cn("hover:bg-areia-media/5 border-areia-escura group transition-colors", !cat.active && "opacity-60")}>
                    <TableCell className="font-mono text-xs">{cat.order || 0}</TableCell>
                    <TableCell>
                      <span className="text-sm font-bold text-marrom-terra">{cat.name}</span>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => toggleActive(cat)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border transition-all",
                          cat.active 
                            ? "bg-verde-folha/10 text-verde-folha border-verde-folha/20" 
                            : "bg-gray-200 text-gray-500 border-gray-300"
                        )}
                      >
                        {cat.active ? <><CheckCircle2 className="w-3 h-3" /> Ativa</> : <><XCircle className="w-3 h-3" /> Inativa</>}
                      </button>
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
                  <TableCell colSpan={4} className="h-32 text-center text-cinza-organico italic">
                    Nenhuma categoria encontrada.
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Nome da Categoria</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-white border-areia-escura"
                placeholder="Ex: Pratos Regionais"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Ordem de Exibição</Label>
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
            <Button onClick={handleSave} className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro rounded-sm px-6 font-bold uppercase tracking-widest text-[10px]">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
