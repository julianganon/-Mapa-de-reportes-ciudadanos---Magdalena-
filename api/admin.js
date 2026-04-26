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

// ── Registrar evento sospechoso en Firestore ─────────────────────
async function registrarSospechoso({ evento, detalle, ip, uid, email, userAgent, endpoint }) {
  try {
    const ahora = new Date();
    const fechaAR = ahora.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    await db.collection('suspicious').add({
      evento,
      detalle: detalle || '',
      ip: ip || 'DESCONOCIDA',
      uid: uid || 'NO_AUTENTICADO',
      email: email || '',
      userAgent: userAgent || '',
      endpoint: endpoint || '/api/admin',
      fecha: ahora.toISOString(),
      fechaAR,
      bloqueado: true,
      revisado: false,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error('[SUSPICIOUS] Error al registrar:', e);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://magdalena-reporta.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 'IP_DESCONOCIDA';
  const userAgent = req.headers['user-agent'] || '';

  // ── GET — verificar si el token es de admin ──────────────────
  if (req.method === 'GET') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      const idToken = authHeader.split('Bearer ')[1];
      let decodedToken;
      try {
        decodedToken = await auth.verifyIdToken(idToken);
      } catch {
        return res.status(401).json({ error: 'Token inválido' });
      }
      if (decodedToken.email !== ADMIN_EMAIL) return res.status(403).json({ isAdmin: false });
      return res.status(200).json({ isAdmin: true });
    } catch (err) {
      return res.status(500).json({ error: 'Error' });
    }
  }

  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ── Verificar token ──────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await registrarSospechoso({
        evento: 'TOKEN_INVALIDO',
        detalle: `Intento de operación admin (${req.method}) sin token`,
        ip: clientIp,
        userAgent,
        endpoint: '/api/admin',
      });
      return res.status(401).json({ error: 'No autorizado' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch {
      await registrarSospechoso({
        evento: 'TOKEN_INVALIDO',
        detalle: `Token inválido en operación admin (${req.method})`,
        ip: clientIp,
        userAgent,
        endpoint: '/api/admin',
      });
      return res.status(401).json({ error: 'Token inválido' });
    }

    // ── Verificar que sea admin ──────────────────────────────────
    if (decodedToken.email !== ADMIN_EMAIL) {
      await registrarSospechoso({
        evento: 'ACCESO_ADMIN_DENEGADO',
        detalle: `Intento de operación admin (${req.method}) con cuenta no autorizada`,
        ip: clientIp,
        uid: decodedToken.uid,
        email: decodedToken.email,
        userAgent,
        endpoint: '/api/admin',
      });
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
