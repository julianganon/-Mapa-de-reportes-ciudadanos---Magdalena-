import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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
  res.setHeader('Access-Control-Allow-Origin', 'https://epa-gestion.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Solo el admin puede bloquear
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }

  if (decodedToken.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { tipo, valor, motivo } = req.body;

  if (!tipo || !valor) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    if (tipo === 'ip') {
      // Bloquear por IP
      await db.collection('blocked_ips').add({
        ip: valor,
        desbloqueado: false,
        motivo: motivo || 'Bloqueo manual desde panel',
        bloqueadoEn: FieldValue.serverTimestamp(),
        bloqueadoPor: decodedToken.email,
      });
      console.log(`[BLOQUEO_IP] IP: ${valor} | Admin: ${decodedToken.email}`);
      return res.status(200).json({ ok: true });

    } else if (tipo === 'uid') {
      // Bloquear por UID
      await db.collection('blocked_uids').doc(valor).set({
        uid: valor,
        desbloqueado: false,
        motivo: motivo || 'Bloqueo manual desde panel',
        bloqueadoEn: FieldValue.serverTimestamp(),
        bloqueadoPor: decodedToken.email,
      }, { merge: true });
      console.log(`[BLOQUEO_UID] UID: ${valor} | Admin: ${decodedToken.email}`);
      return res.status(200).json({ ok: true });

    } else {
      return res.status(400).json({ error: 'Tipo inválido' });
    }
  } catch (err) {
    console.error('Error bloquear:', err);
    return res.status(500).json({ error: 'Error al bloquear' });
  }
}
