
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const isLogado = sessionStorage.getItem('adminLogado');
    if (isLogado === 'true') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Login Padrão conforme especificação
    if (username === 'admin' && password === 'admin@26') {
      sessionStorage.setItem('adminLogado', 'true');
      toast({
        title: "Acesso Autorizado",
        description: "Bem-vindo ao painel administrativo Paroara.",
      });
      router.push('/admin/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Erro de Acesso",
        description: "Usuário ou senha inválidos.",
      });
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
                placeholder="Ex: admin"
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
