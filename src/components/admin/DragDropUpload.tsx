
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { saveImageMetadata } from '@/services/imageService';
import { useFirestore } from '@/firebase';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DragDropUploadProps {
  restaurantId: string;
  onSuccess?: (url: string) => void;
}

export function DragDropUpload({ restaurantId, onSuccess }: DragDropUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const db = useFirestore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!db || acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    const uploadToast = toast.loading('Enviando imagem...');

    try {
      const file = acceptedFiles[0];
      const result = await uploadImageToCloudinary(file);
      
      await saveImageMetadata(db, {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        restaurantId: restaurantId
      });

      toast.success('Upload concluído!', { id: uploadToast });
      if (onSuccess) onSuccess(result.secure_url);
    } catch (error: any) {
      console.error(error);
      toast.error('Erro no upload: ' + error.message, { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  }, [db, restaurantId, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-center",
        isDragActive ? "border-marrom-terra bg-marrom-terra/5" : "border-areia-escura/40 hover:border-marrom-terra/40 bg-areia-clara/20",
        isUploading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-marrom-terra">
        {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-black uppercase tracking-widest text-marrom-madeira">
          {isDragActive ? "Solte para enviar" : "Arraste uma foto ou clique aqui"}
        </p>
        <p className="text-[10px] text-cinza-organico italic uppercase tracking-wider">Formatos aceitos: JPG, PNG, WEBP (Max 5MB)</p>
      </div>
    </div>
  );
}
