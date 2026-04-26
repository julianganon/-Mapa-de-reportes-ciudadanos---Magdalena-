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

const ORIGIN = 'https://magdalena-reporta.vercel.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Campos que NUNCA salen en la respuesta pública
const PRIVATE_FIELDS = ['userEmail', 'userUid', 'contactName', 'contactInfo'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Sin caché CDN — datos siempre frescos
  res.setHeader('Cache-Control', 'no-store, no-cache');

  // Verificar si es admin para decidir qué campos devolver
  let isAdmin = false;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
      isAdmin = decoded.email === ADMIN_EMAIL;
    } catch {
      // Token inválido — se trata como visitante público, sin error
    }
  }

  try {
    const snapshot = await db.collection('reports')
      .orderBy('timestamp', 'desc')
      .get();

    const reports = [];
    snapshot.forEach(doc => {
      const data = doc.data();

      if (!isAdmin) {
        // Visitante público: eliminar todos los campos privados
        PRIVATE_FIELDS.forEach(f => delete data[f]);
      }

      reports.push({ id: doc.id, ...data });
    });

    // ETag: huella digital del estado actual
    const latestTs = reports.length > 0 ? reports[0].timestamp : '0';
    const etag = `"${reports.length}-${latestTs}"`;
    res.setHeader('ETag', etag);

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    return res.status(200).json({ reports });
  } catch (err) {
    console.error('Error reading reports:', err);
    return res.status(500).json({ error: 'Error al leer reclamos' });
  }
}
