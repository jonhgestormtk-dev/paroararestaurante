
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Lock } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

  useEffect(() => {
    const isLogado = sessionStorage.getItem('adminLogado');
    if (isLogado === 'true') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const bootstrapUsers = async () => {
    if (!db) return;
    const usersCol = collection(db, 'adminUsers');
    const snapshot = await getDocs(usersCol);
    
    if (snapshot.empty) {
      const initialUsers = [
        { username: 'admin', password: 'admin@26', role: 'admin' },
        { username: 'suportthreej', password: 'ThreeJ@suport3', role: 'admin' },
        { username: 'operador', password: '123', role: 'operador' }
      ];
      
      for (const user of initialUsers) {
        await addDoc(usersCol, user);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsLoading(true);

    try {
      // Garantir que existam usuários no banco (Bootstrap na primeira tentativa)
      await bootstrapUsers();

      const usersCol = collection(db, 'adminUsers');
      const q = query(usersCol, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password === password) {
          sessionStorage.setItem('adminLogado', 'true');
          sessionStorage.setItem('adminUser', JSON.stringify({
            username: userData.username,
            role: userData.role
          }));

          toast({
            title: "Acesso Autorizado",
            description: `Bem-vindo, ${username}.`,
          });

          // Redirecionamento baseado em cargo
          if (userData.role === 'operador') {
            router.push('/admin/pedidos');
          } else {
            router.push('/admin/dashboard');
          }
          return;
        }
      }

      toast({
        variant: "destructive",
        title: "Erro de Acesso",
        description: "Usuário ou senha inválidos.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro no Servidor",
        description: "Não foi possível conectar ao banco de dados.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-areia-clara flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-rustic-texture opacity-[0.03] pointer-events-none"></div>
      
      <Card className="w-full max-w-[420px] bg-white border-areia-escura shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-2 pt-10">
          <div className="mx-auto w-16 h-16 bg-marrom-terra rounded-full flex items-center justify-center mb-4 border-4 border-areia-clara shadow-lg">
            <ShieldCheck className="w-8 h-8 text-areia-clara" />
          </div>
          <CardTitle className="font-headline text-3xl text-marrom-terra tracking-widest">PAROARA</CardTitle>
          <p className="text-[10px] uppercase tracking-[0.5em] text-marrom-madeira font-bold opacity-60">Painel Administrativo</p>
        </CardHeader>
        
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira/80">Usuário</label>
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu usuário"
                className="bg-areia-clara/30 border-areia-escura focus:ring-marrom-terra"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira/80">Senha</label>
              <div className="relative">
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-areia-clara/30 border-areia-escura focus:ring-marrom-terra pr-10"
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marrom-madeira/40" />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-marrom-terra text-areia-clara hover:bg-marrom-escuro py-6 text-sm font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Acessar Painel'}
            </Button>
          </form>
          
          <p className="text-center mt-10 text-[9px] text-cinza-organico uppercase tracking-widest opacity-40">
            Tradição Marajoara • Segurança Paroara
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
