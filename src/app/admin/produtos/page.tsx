
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
  XCircle
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Product, Category } from '@/lib/types';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const db = useFirestore();
  
  // Buscar Categorias dinamicamente para o formulário
  const catQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: firestoreCategories } = useCollection<{id: string, name: string}>(catQuery);

  const categories = useMemo(() => {
    if (!firestoreCategories || firestoreCategories.length === 0) {
      return ['Regionais', 'Peixes', 'Carnes', 'Grelhados', 'Executivos', 'Massas', 'Bebidas', 'Sobremesas'];
    }
    return firestoreCategories.map(c => c.name);
  }, [firestoreCategories]);

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);
  const { data: products, loading } = useCollection<Product>(productsQuery);

  const [formData, setFormData] = useState<Partial<Product>>({
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
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [products, searchTerm]);

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
        name: '',
        category: categories[0] || 'Regionais',
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

    const isInvalid = !formData.name?.trim() || 
                      formData.price === undefined || formData.price < 0 || 
                      formData.stock === undefined || formData.stock < 0 || 
                      !formData.description?.trim();

    if (isInvalid) {
      toast({ 
        variant: "destructive", 
        title: "Campos Obrigatórios", 
        description: "Certifique-se de preencher Nome, Preço, Estoque e Descrição." 
      });
      return;
    }

    const dataToSave = { 
      ...formData,
      active: formData.active ?? true,
      updatedAt: serverTimestamp()
    };
    
    const productsCol = collection(db, 'products');

    if (editingProduct) {
      const docRef = doc(db, 'products', editingProduct.id);
      updateDoc(docRef, dataToSave)
        .then(() => {
          toast({ title: "Prato Atualizado", description: "As alterações foram salvas com sucesso." });
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: dataToSave,
          } satisfies SecurityRuleContext));
        });
    } else {
      addDoc(productsCol, {
        ...dataToSave,
        createdAt: serverTimestamp()
      })
        .then(() => {
          toast({ title: "Prato Adicionado", description: "O novo item já está disponível no cardápio." });
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: productsCol.path,
            operation: 'create',
            requestResourceData: dataToSave,
          } satisfies SecurityRuleContext));
        });
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!db || !window.confirm('Deseja realmente excluir este prato?')) return;
    
    const docRef = doc(db, 'products', id);
    deleteDoc(docRef).then(() => {
      toast({ title: "Prato Removido", description: "O item foi excluído permanentemente." });
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext));
    });
  };

  const toggleProductActive = (product: Product) => {
    if (!db) return;
    const docRef = doc(db, 'products', product.id);
    const newState = !product.active;
    updateDoc(docRef, { active: newState });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline text-marrom-terra">Gestão de Pratos</h1>
          <p className="text-cinza-organico font-subheadline italic">Adicione, edite ou remova itens do cardápio.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro rounded-sm px-6 py-6 font-bold uppercase tracking-widest text-xs gap-2 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Novo Prato
        </Button>
      </div>

      <Card className="bg-white border-areia-escura overflow-hidden">
        <div className="p-6 border-b border-areia-escura bg-areia-clara/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinza-organico" />
            <Input 
              placeholder="Buscar por nome ou categoria..."
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
                <TableHead className="w-[80px] text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Ref</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Prato</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Categoria</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Preço</TableHead>
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
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className={cn(
                    "hover:bg-areia-media/5 border-areia-escura group transition-colors",
                    product.active === false && "opacity-60 bg-gray-50/50"
                  )}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-sm bg-areia-clara flex items-center justify-center overflow-hidden border border-areia-escura">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-marrom-madeira/20" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-marrom-terra">{product.name}</p>
                        <p className="text-[10px] text-cinza-organico italic line-clamp-1">{product.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-marrom-madeira border-areia-escura bg-areia-clara/30">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-marrom-escuro">R$ {product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleProductActive(product)}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border transition-all",
                            product.active !== false 
                              ? "bg-verde-folha/10 text-verde-folha border-verde-folha/20" 
                              : "bg-gray-200 text-gray-500 border-gray-300"
                          )}
                        >
                          {product.active !== false ? <><CheckCircle2 className="w-3 h-3" /> Ativo</> : <><XCircle className="w-3 h-3" /> Inativo</>}
                        </button>
                        {product.featured && <Sparkles className="w-4 h-4 text-caramelo-palha" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-marrom-madeira" onClick={() => handleOpenModal(product)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-cinza-organico italic">
                    Nenhum prato encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-areia-clara border-none shadow-2xl">
          <DialogHeader className="p-8 bg-marrom-escuro text-areia-clara">
            <DialogTitle className="font-headline text-2xl tracking-widest uppercase">
              {editingProduct ? 'Editar Prato' : 'Novo Prato'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Nome do Prato *</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white border-areia-escura"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({...formData, category: v as any})}
                >
                  <SelectTrigger className="bg-white border-areia-escura">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-areia-clara">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Preço (R$) *</Label>
                  <Input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="bg-white border-areia-escura"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Estoque *</Label>
                  <Input 
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="bg-white border-areia-escura"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/50 rounded-sm border border-areia-escura">
                <Label className="text-xs font-bold text-marrom-madeira">Status Ativo</Label>
                <Switch 
                  checked={formData.active !== false}
                  onCheckedChange={(v) => setFormData({...formData, active: v})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Descrição Curta *</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-white border-areia-escura resize-none h-24"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">URL da Imagem</Label>
                <Input 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="bg-white border-areia-escura"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="featured" 
                    checked={formData.featured}
                    onCheckedChange={(v) => setFormData({...formData, featured: v})}
                  />
                  <Label htmlFor="featured" className="text-xs font-bold text-marrom-madeira">Destaque</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="promo" 
                    checked={formData.promotion}
                    onCheckedChange={(v) => setFormData({...formData, promotion: v})}
                  />
                  <Label htmlFor="promo" className="text-xs font-bold text-marrom-madeira">Promoção</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-white border-t border-areia-escura">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="uppercase tracking-widest text-[10px] font-bold">Cancelar</Button>
            <Button onClick={handleSave} className="bg-marrom-terra text-areia-clara hover:bg-marrom-escuro rounded-sm px-10 py-6 font-bold uppercase tracking-widest text-[10px]">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
