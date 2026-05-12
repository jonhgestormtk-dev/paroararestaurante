
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings,
  LogOut, 
  Star,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Proteger Rotas
    const logado = sessionStorage.getItem('adminLogado');
    if (!logado && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsCheckingAuth(false);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [pathname, router]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminLogado');
    router.push('/admin/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Produtos', icon: Package, path: '/admin/produtos' },
    { label: 'Pedidos', icon: ShoppingBag, path: '/admin/pedidos' },
    { label: 'Configurações', icon: Settings, path: '/admin/configuracoes' },
  ];

  if (pathname === '/admin/login') return <>{children}</>;
  if (isCheckingAuth) return null;

  return (
    <div className="min-h-screen bg-areia-clara flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-marrom-escuro text-areia-clara transition-transform duration-300 shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="font-headline text-3xl text-caramelo-palha tracking-widest">PAROARA</h2>
              <p className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-40">Admin Panel</p>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden text-areia-clara" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          <Separator className="bg-marrom-madeira/20 mb-10" />

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 py-6 rounded-sm text-xs uppercase tracking-widest font-bold transition-all",
                  pathname === item.path 
                    ? "bg-marrom-terra text-white shadow-lg border-l-4 border-caramelo-palha" 
                    : "hover:bg-white/5 opacity-60 hover:opacity-100"
                )}
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) setIsSidebarOpen(false);
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          <Separator className="bg-marrom-madeira/20 mb-6" />

          <div className="space-y-2">
            <div className="bg-marrom-terra/30 p-4 rounded-sm border border-marrom-madeira/10 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-caramelo-palha flex items-center justify-center text-marrom-escuro font-bold">A</div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">Administrador</p>
                <p className="text-[10px] opacity-40 truncate">admin@paroara.com</p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 text-destructive hover:bg-destructive/10 hover:text-destructive py-6 rounded-sm text-xs uppercase tracking-widest font-bold"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-areia-escura flex items-center justify-between px-6 lg:px-10 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end opacity-90 hover:opacity-100 transition-opacity">
              <h1 className="text-2xl font-headline tracking-[0.2em] text-marrom-terra leading-none uppercase">
                PAROARA
              </h1>
              <p className="text-[9px] font-subheadline italic text-marrom-madeira tracking-widest uppercase mt-1">
                Restaurante Marajoara
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          <div className="absolute inset-0 bg-rustic-texture opacity-[0.01] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
