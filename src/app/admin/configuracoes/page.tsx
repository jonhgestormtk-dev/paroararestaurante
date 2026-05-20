'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Store,
  Sparkles,
  Loader2,
  Power,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, orderBy } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Separator } from '@/components/ui/separator';

export default function AdminSettings() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  // Buscar configurações reais
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: firestoreSettings, loading: settingsLoading } = useDoc<any>(settingsRef);

  // Buscar produtos para o seletor de promoção
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('name', 'asc'));
  }, [db]);
  const { data: products } = useCollection<Product>(productsQuery);

  const [settings, setSettings] = useState({
    storeName: 'Paroara | Restaurante | Beer Drik’s',
    whatsapp: '5591985256348',
    address: 'Mercado Municipal - Francisco Bolonha - Complexo do Ver-o-Peso',
    openingHours: 'Terça a Domingo: 9h às 15:30h',
    promoProductId: '',
    // Controle de disponibilidade
    paroaraActive: true,
    eguaActive: true,
    paroaraMessage: 'Desculpe! Não estamos em funcionamento hoje.',
    eguaMessage: 'Desculpe! Não estamos em funcionamento hoje.'
  });

  useEffect(() => {
    if (firestoreSettings) {
      setSettings(prev => ({
        ...prev,
        ...firestoreSettings
      }));
    }
  }, [firestoreSettings]);

  const handleSave = () => {
    if (!db) return;
    setIsLoading(true);
    
    const docRef = doc(db, 'settings', 'global');
    
    setDoc(docRef, settings, { merge: true })
      .then(() => {
        toast({
          title: "Configurações Salvas",
          description: "As informações do restaurante foram atualizadas com sucesso.",
        });
        setIsLoading(false);
      })
      .catch(async (error) => {
        setIsLoading(false);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: settings,
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (settingsLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-marrom-terra opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline text-marrom-terra">Configurações</h1>
        <p className="text-cinza-organico font-subheadline italic">Gerencie o funcionamento e informações dos seus restaurantes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Disponibilidade do Restaurante */}
          <Card className="bg-white border-areia-escura shadow-sm overflow-hidden">
            <CardHeader className="bg-marrom-escuro text-white">
              <div className="flex items-center gap-3">
                <Power className="w-5 h-5 text-caramelo-palha" />
                <CardTitle className="text-lg font-headline">Status de Funcionamento</CardTitle>
              </div>
              <CardDescription className="text-areia-clara/60">Ative ou desative o acesso dos clientes ao cardápio de cada unidade.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Paroara Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-marrom-terra">Restaurante Paroara</Label>
                    <p className="text-[10px] text-cinza-organico italic">Define se o cardápio Paroara está visível.</p>
                  </div>
                  <Switch 
                    checked={settings.paroaraActive}
                    onCheckedChange={(v) => setSettings({...settings, paroaraActive: v})}
                  />
                </div>
                {!settings.paroaraActive && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[9px] font-bold uppercase text-marrom-madeira">Mensagem de Indisponibilidade (Paroara)</Label>
                    <Input 
                      value={settings.paroaraMessage}
                      onChange={(e) => setSettings({...settings, paroaraMessage: e.target.value})}
                      placeholder="Ex: Não funcionaremos no feriado..."
                      className="bg-areia-clara/20 border-areia-escura text-xs h-9"
                    />
                  </div>
                )}
              </div>

              <Separator className="bg-areia-escura/30" />

              {/* Égua Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-fogo-vibrante">Égua na Panela</Label>
                    <p className="text-[10px] text-cinza-organico italic">Define se o cardápio Égua na Panela está visível.</p>
                  </div>
                  <Switch 
                    checked={settings.eguaActive}
                    onCheckedChange={(v) => setSettings({...settings, eguaActive: v})}
                  />
                </div>
                {!settings.eguaActive && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[9px] font-bold uppercase text-fogo-vibrante">Mensagem de Indisponibilidade (Égua)</Label>
                    <Input 
                      value={settings.eguaMessage}
                      onChange={(e) => setSettings({...settings, eguaMessage: e.target.value})}
                      placeholder="Ex: Fechado para manutenção..."
                      className="bg-areia-clara/20 border-areia-escura text-xs h-9"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-areia-escura shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-marrom-terra" />
                <CardTitle className="text-lg font-headline text-marrom-terra">Perfil do Restaurante</CardTitle>
              </div>
              <CardDescription>Nome e destaque promocional da página inicial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Nome do Estabelecimento</Label>
                <Input 
                  value={settings.storeName}
                  onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                  className="bg-areia-clara/20 border-areia-escura"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3 h-3 text-caramelo-palha" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Prato em Destaque (Banner Home)</Label>
                </div>
                <Select 
                  value={settings.promoProductId || "none"} 
                  onValueChange={(v) => setSettings({...settings, promoProductId: v})}
                >
                  <SelectTrigger className="bg-areia-clara/20 border-areia-escura">
                    <SelectValue placeholder="Selecione um produto para promover..." />
                  </SelectTrigger>
                  <SelectContent className="bg-areia-clara">
                    <SelectItem value="none">Nenhum (Ocultar Banner)</SelectItem>
                    {products?.filter(p => p.active !== false).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.emoji} {p.name} - R$ {p.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-white border-areia-escura shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-marrom-terra" />
                <CardTitle className="text-lg font-headline text-marrom-terra">Contato & WhatsApp</CardTitle>
              </div>
              <CardDescription>Configurações globais de contato.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Número Principal (ADM)</Label>
                <div className="relative">
                  <Input 
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({...settings, whatsapp: e.target.value.replace(/\D/g, '')})}
                    className="bg-areia-clara/20 border-areia-escura pl-10"
                    placeholder="Ex: 5591985256348"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-marrom-terra opacity-40">+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-areia-escura shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-marrom-terra" />
                <CardTitle className="text-lg font-headline text-marrom-terra">Localização & Horários</CardTitle>
              </div>
              <CardDescription>Endereço físico e horários de funcionamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Endereço Completo</Label>
                <Textarea 
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  className="bg-areia-clara/20 border-areia-escura resize-none h-20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira">Horário de Funcionamento</Label>
                <div className="flex items-center gap-3 p-3 bg-areia-clara/10 border border-dashed border-areia-escura rounded-sm">
                  <Clock className="w-4 h-4 text-marrom-madeira/40" />
                  <Input 
                    value={settings.openingHours}
                    onChange={(e) => setSettings({...settings, openingHours: e.target.value})}
                    className="bg-transparent border-none p-0 h-auto focus:ring-0 text-sm italic"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-marrom-terra text-areia-clara hover:bg-marrom-escuro py-8 rounded-sm font-bold uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-95 flex items-center gap-3"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isLoading ? 'Salvando Alterações...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
