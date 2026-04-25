import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar que sea admin
    if (decodedToken.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const docRef = db.collection('reports').doc(id);

    if (req.method === 'DELETE') {
      await docRef.delete();
      return res.status(200).json({ ok: true, action: 'deleted' });
    }

    if (req.method === 'PUT') {
      await docRef.update({ status: 'Solucionado' });
      return res.status(200).json({ ok: true, action: 'solved' });
    }

  } catch (err) {
    console.error('Error admin:', err);
    return res.status(500).json({ error: 'Error en operación admin' });
  }
}
