
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
 * Realiza o upload de uma imagem diretamente para o Cloudinary via Unsigned Upload.
 * Isso permite que o frontend envie a imagem sem expor a API Secret.
 */
export async function uploadImageToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Validação preventiva no lado do cliente
  if (!cloudName || !uploadPreset) {
    throw new Error("Configuração Cloudinary ausente. Verifique o arquivo .env");
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
      // O Cloudinary retorna mensagens detalhadas como "Upload preset not found"
      // ou "Invalid Cloud Name". Capturamos isso para exibir no Toast.
      const errorMessage = data.error?.message || "Erro desconhecido no Cloudinary";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    // Repropaga a mensagem amigável para ser capturada pelo componente de UI
    throw new Error(error.message || "Falha na conexão com o servidor de imagens");
  }
}
