
'use client';

/**
 * Helper para otimizar URLs do Cloudinary aplicando compressão e formato automáticos.
 */
export function optimizeImage(url: string) {
  if (!url || !url.includes('cloudinary')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

/**
 * Realiza o upload de uma imagem diretamente para o Cloudinary via Unsigned Upload.
 */
export async function uploadImageToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dijgjpenq';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'paroara_upload';

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  // Garante que a imagem vá para a pasta solicitada
  formData.append("folder", "paroara_upload");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Captura a mensagem de erro específica do Cloudinary (ex: "Upload preset not found")
      const errorMessage = data.error?.message || "Erro desconhecido no Cloudinary";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Falha na comunicação com o Cloudinary");
  }
}
