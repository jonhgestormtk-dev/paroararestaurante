'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa os serviços do Firebase com suporte a persistência offline.
 */
export function initializeFirebase() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);

  // Habilitar cache offline (apenas no lado do cliente)
  if (typeof window !== 'undefined') {
    enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Cache offline: múltiplas abas abertas, persistência habilitada apenas na primeira.');
      } else if (err.code === 'unimplemented') {
        console.warn('Cache offline: o navegador atual não suporta persistência de dados.');
      }
    });
  }

  return { app, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
