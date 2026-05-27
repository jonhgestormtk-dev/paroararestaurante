
export function optimizeImage(url: string) {
  if (!url || !url.includes('cloudinary')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

export async function uploadImageToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "paroara_upload"
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dijgjpenq'}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro no upload");
  }

  return response.json();
}
