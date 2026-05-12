
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings,
  LogOut, 
  Menu,
  X,
  Tags
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
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
    { label: 'Categorias', icon: Tags, path: '/admin/categorias' },
    { label: 'Pedidos', icon: ShoppingBag, path: '/admin/pedidos' },
    { label: 'Configurações', icon: Settings, path: '/admin/configuracoes' },
  ];

  if (pathname === '/admin/login') return <>{children}</>;
  if (isCheckingAuth) return null;

  return (
    <div className="min-h-screen bg-areia-clara flex overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-marrom-escuro text-areia-clara transition-all duration-300 ease-in-out shadow-2xl flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl text-caramelo-palha tracking-widest leading-none">PAROARA</h2>
              <p className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-40">Admin Panel</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-areia-clara hover:bg-white/10" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Separator className="bg-marrom-madeira/20 mb-8" />

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 py-6 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all border-l-2",
                    isActive 
                      ? "bg-marrom-terra/40 text-white border-caramelo-palha shadow-md" 
                      : "hover:bg-white/5 opacity-60 hover:opacity-100 border-transparent"
                  )}
                  onClick={() => {
                    router.push(item.path);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-caramelo-palha" : "text-areia-media/60")} />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <Separator className="bg-marrom-madeira/20 my-6" />

          {/* Footer Section */}
          <div className="space-y-4">
            <div className="bg-marrom-terra/20 p-4 rounded-md border border-marrom-madeira/20 flex items-center gap-3">
              <div className="w-9 h-9 shrink-0 rounded-full bg-caramelo-palha flex items-center justify-center text-marrom-escuro font-black text-sm shadow-inner">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-wider truncate">Administrador</p>
                <p className="text-[9px] font-body italic opacity-40 truncate">admin@paroara.com</p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 text-destructive hover:bg-destructive/10 hover:text-destructive py-6 rounded-sm text-[10px] uppercase tracking-widest font-bold"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-areia-escura flex items-center justify-between px-4 lg:px-10 z-40">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-marrom-terra" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            <div className="flex flex-col lg:hidden">
              <h1 className="text-lg font-headline tracking-widest text-marrom-terra leading-none">PAROARA</h1>
              <p className="text-[7px] font-black tracking-widest uppercase opacity-40">Admin Area</p>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end opacity-90">
            <h1 className="text-2xl font-headline tracking-[0.2em] text-marrom-terra leading-none uppercase">
              PAROARA
            </h1>
            <p className="text-[9px] font-subheadline italic text-marrom-madeira tracking-widest uppercase mt-1">
              Restaurante Marajoara
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative bg-areia-clara/50">
          <div className="absolute inset-0 bg-rustic-texture opacity-[0.01] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
