
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

/**
 * Configuração do Cloudinary para operações seguras no lado do servidor.
 * A deleção requer API Key e Secret, que nunca devem ser expostas no frontend.
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'ID da imagem é obrigatório' }, { status: 400 });
    }

    // O método destroy remove a imagem permanentemente do Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Erro ao deletar imagem do Cloudinary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
