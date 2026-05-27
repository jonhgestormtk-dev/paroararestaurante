
export function optimizeImage(url: string) {
  if (!url || !url.includes('cloudinary')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

export async function uploadImageToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "paroara_upload";
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dijgjpenq";

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
      // O Cloudinary retorna erros no formato { error: { message: "..." } }
      const errorMessage = data.error?.message || "Erro desconhecido no servidor de imagens";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    // Garante que o erro seja propagado com uma mensagem legível
    throw new Error(error.message || "Falha na comunicação com o Cloudinary");
  }
}
