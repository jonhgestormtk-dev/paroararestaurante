
'use client';

import React from 'react';
import { ImageLibrary } from '@/components/admin/ImageLibrary';
import { DragDropUpload } from '@/components/admin/DragDropUpload';
import { ImageIcon, CloudUpload, Image as ImageIconLucide } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPhotosPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <Toaster position="top-right" />
      
      <div className="space-y-1">
        <h1 className="text-3xl font-headline text-marrom-terra">Acervo de Fotos</h1>
        <p className="text-cinza-organico font-subheadline italic">Gerencie todas as imagens do sistema em um só lugar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Upload */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border-areia-escura shadow-sm overflow-hidden sticky top-8">
            <CardHeader className="bg-marrom-escuro text-white p-6">
              <div className="flex items-center gap-3">
                <CloudUpload className="w-5 h-5 text-caramelo-palha" />
                <CardTitle className="text-lg font-headline">Novo Upload</CardTitle>
              </div>
              <CardDescription className="text-areia-clara/60 italic text-xs">As imagens sobem direto para o Cloudinary otimizadas.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DragDropUpload restaurantId="geral" />
              <div className="mt-6 p-4 rounded-xl bg-areia-clara/30 border border-areia-escura/20">
                <h4 className="text-[10px] font-black uppercase text-marrom-madeira mb-2">Dicas de Performance:</h4>
                <ul className="text-[10px] text-cinza-organico space-y-1 italic leading-tight">
                  <li>• Use fotos horizontais (4:3)</li>
                  <li>• Evite imagens maiores que 2000px</li>
                  <li>• O sistema comprime automaticamente</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Biblioteca */}
        <div className="lg:col-span-8">
          <Card className="bg-white border-areia-escura shadow-xl rounded-[2rem] overflow-hidden min-h-[600px]">
            <CardHeader className="p-8 border-b border-areia-escura/10 bg-areia-clara/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-marrom-terra">
                    <ImageIconLucide className="w-5 h-5" />
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Biblioteca Global</CardTitle>
                  </div>
                  <CardDescription className="font-subheadline italic text-xs">Clique nas fotos para copiar o link ou excluir.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <ImageLibrary />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
