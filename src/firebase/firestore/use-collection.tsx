
'use client';

import { useState, useEffect } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  CollectionReference
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(queryRef: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reseta o estado quando o queryRef muda ou é nulo
    if (!queryRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as T));
        setData(items);
        setLoading(false);
      },
      async (err) => {
        console.error('Firestore onSnapshot error:', err);
        
        // Tenta extrair o caminho da coleção para um erro mais claro
        let path = 'unknown';
        if ('path' in queryRef) {
          path = (queryRef as CollectionReference).path;
        } else if ((queryRef as any)._query?.path?.segments) {
          path = (queryRef as any)._query.path.segments.join('/');
        }

        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list'
        });
        
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryRef]);

  return { data, loading, error };
}
