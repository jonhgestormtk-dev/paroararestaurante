
'use client';

/**
 * Helper para otimizar URLs do Cloudinary aplicando compressão e formato automáticos.
 * Reduz o peso das imagens mantendo a qualidade visual.
 */
export function optimizeImage(url: string) {
  if (!url || !url.includes('cloudinary')) return url;
  // Insere parâmetros de otimização f_auto (formato) e q_auto (qualidade)
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

/**
 * Realiza o upload de uma imagem diretamente para o Cloudinary.
 * Utiliza a estratégia de "Unsigned Upload" para permitir uploads via Client-side.
 */
export async function uploadImageToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Verifica se as configurações básicas estão presentes
  if (!cloudName || !uploadPreset) {
    throw new Error("Configuração Cloudinary ausente no arquivo .env");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

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
      // O Cloudinary retorna a mensagem detalhada em data.error.message
      const errorMessage = data.error?.message || "Erro desconhecido no servidor de imagens";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    // Repropaga a mensagem exata para ser exibida no Toast do Admin
    throw new Error(error.message || "Falha na conexão com Cloudinary");
  }
}
