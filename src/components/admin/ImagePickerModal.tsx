
'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ImageLibrary } from './ImageLibrary';
import { DragDropUpload } from './DragDropUpload';
import { ImageIcon, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface ImagePickerModalProps {
  value?: string;
  onSelect: (url: string) => void;
  restaurantId: string;
}

export function ImagePickerModal({ value, onSelect, restaurantId }: ImagePickerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (url: string) => {
    onSelect(url);
    setIsOpen(false);
    toast.success('Imagem selecionada');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="space-y-2 cursor-pointer group">
          <div className={cn(
            "w-full aspect-video rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center gap-3 transition-all",
            value ? "border-marrom-terra" : "border-areia-escura/40 hover:border-marrom-terra/40 bg-areia-clara/10"
          )}>
            {value ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-marrom-madeira">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-marrom-madeira/60">Adicionar Foto</span>
              </>
            )}
          </div>
          {value && (
            <Button variant="ghost" size="sm" className="w-full text-[9px] uppercase font-black tracking-widest h-8 text-marrom-madeira hover:bg-marrom-terra/5">
              Alterar Imagem
            </Button>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl bg-areia-clara p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[95vh]">
        <DialogHeader className="p-6 bg-marrom-escuro text-areia-clara shrink-0">
          <DialogTitle className="font-headline tracking-widest uppercase flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-caramelo-palha" />
            Biblioteca de Imagens
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="library" className="flex-1 flex flex-col">
            <div className="px-6 border-b border-areia-escura/20 bg-white">
              <TabsList className="bg-transparent h-14 p-0 gap-8">
                <TabsTrigger value="library" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-marrom-terra rounded-none h-full text-[10px] font-black uppercase tracking-widest">
                  Biblioteca
                </TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-marrom-terra rounded-none h-full text-[10px] font-black uppercase tracking-widest">
                  Fazer Upload
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-areia-clara/30">
              <TabsContent value="library" className="m-0">
                <ImageLibrary onSelect={handleSelect} selectable />
              </TabsContent>
              <TabsContent value="upload" className="m-0">
                <DragDropUpload restaurantId={restaurantId} onSuccess={handleSelect} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
