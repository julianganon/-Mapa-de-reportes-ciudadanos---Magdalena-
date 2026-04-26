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

const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60000;

const VALID_CAT_IDS = [
  'obra','calle','luminaria','basura','cloaca',
  'agua','aguas','faltlum','tacho','rampa','zanja','otro'
];

function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\\/g, '&#092;')
    .trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://magdalena-reporta.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
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

    const uid = decodedToken.uid;
    const userEmail = decodedToken.email || '';
    const userName = decodedToken.name || '';

    // Registro de IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 'IP_DESCONOCIDA';
    console.log(`[SEGURIDAD] Reporte entrante - IP: ${clientIp} | Email: ${userEmail} | UID: ${uid}`);

    // Bloqueo silencioso por UID — el atacante cree que funcionó
    const BLOCKED_UIDS = (process.env.BLOCKED_UIDS || '').split(',').filter(Boolean);
    if (BLOCKED_UIDS.includes(uid)) {
      console.log(`[BLOQUEADO] UID: ${uid} | IP: ${clientIp}`);
      return res.status(200).json({ ok: true, id: 'blocked' });
    }

    // Rate limiting
    const now = Date.now();
    const lastSubmit = rateLimitMap.get(uid) || 0;
    if (now - lastSubmit < RATE_LIMIT_MS) {
      return res.status(429).json({ error: 'Esperá un momento antes de enviar otro reclamo' });
    }

    const { cats, description, lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }
    if (typeof description !== 'string' || description.length > 300) {
      return res.status(400).json({ error: 'Descripción inválida' });
    }
    if (!Array.isArray(cats) || cats.length === 0) {
      return res.status(400).json({ error: 'Seleccioná al menos una categoría' });
    }

    const safeCats = cats
      .filter(c => VALID_CAT_IDS.includes(c.id))
      .map(c => ({
        id: sanitize(c.id),
        name: sanitize(c.name),
        icon: sanitize(c.icon)
      }));

    if (safeCats.length === 0) {
      return res.status(400).json({ error: 'Categorías inválidas' });
    }

    const contactName = sanitize(req.body.contactName || '').substring(0, 100);
    const contactInfo = sanitize(req.body.contactInfo || '').substring(0, 100);
    const safeDesc = sanitize(description).substring(0, 300);

    const report = {
      cats: safeCats,
      description: safeDesc,
      lat,
      lng,
      timestamp: new Date().toISOString(),
      status: 'Pendiente',
      contactName: contactName || null,
      contactInfo: contactInfo || null,
      userUid: uid,
      userName,
      userEmail,
    };

    const docRef = await db.collection('reports').add(report);
    rateLimitMap.set(uid, now);

    const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
    if (sheetsUrl) {
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      fetch(sheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...report, mapsUrl, secret: process.env.SHEETS_TOKEN })
      }).catch(() => {});
    }

    return res.status(200).json({ ok: true, id: docRef.id });

  } catch (err) {
    console.error('Error submit:', err);
    return res.status(500).json({ error: 'Error al guardar el reclamo' });
  }
}
