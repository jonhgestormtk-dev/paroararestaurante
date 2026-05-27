
import { Firestore, collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

export async function saveImageMetadata(db: Firestore, data: { imageUrl: string, publicId: string, restaurantId: string }) {
  const colRef = collection(db, 'images');
  return addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function deleteImageRecord(db: Firestore, id: string, publicId: string) {
  // Primeiro deletar do Cloudinary via nossa API de servidor segura
  const response = await fetch('/api/delete-image', {
    method: 'POST',
    body: JSON.stringify({ publicId }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error("Falha ao remover do Cloudinary");
  }

  // Se a exclusão no Cloudinary foi bem-sucedida, removemos o registro do Firestore
  const docRef = doc(db, 'images', id);
  return deleteDoc(docRef);
}
