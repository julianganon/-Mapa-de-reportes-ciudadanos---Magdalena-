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

const ALLOWED_ORIGINS = [
  'https://magdalena-reporta.vercel.app',
  'https://magdalena-reporta-estadisticas.vercel.app'
];
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const PRIVATE_FIELDS = ['userEmail', 'userUid', 'contactName', 'contactInfo'];

// ── Caché en memoria del servidor ────────────────────────────────
// Firestore solo se consulta UNA VEZ cada 60 segundos,
// sin importar cuántas personas tengan la página abierta.
const CACHE_TTL_MS = 60000;
let _cache = null;
let _cacheTime = 0;

// ── Rate limit por IP en GET ─────────────────────────────────────
// Máximo 30 requests por IP por minuto.
const READ_LIMIT_MAP = new Map();
const READ_LIMIT_MAX = 30;
const READ_LIMIT_MS = 60000;

function isReadRateLimited(ip) {
  const now = Date.now();
  const entry = READ_LIMIT_MAP.get(ip) || { count: 0, start: now };
  if (now - entry.start > READ_LIMIT_MS) {
    READ_LIMIT_MAP.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= READ_LIMIT_MAX) return true;
  entry.count++;
  READ_LIMIT_MAP.set(ip, entry);
  return false;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'no-store, no-cache');

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
  if (isReadRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Esperá un momento.' });
  }

  let isAdmin = false;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
      isAdmin = decoded.email === ADMIN_EMAIL;
    } catch {
      // Token inválido — visitante público
    }
  }

  try {
    const now = Date.now();
    const cacheValid = _cache && (now - _cacheTime < CACHE_TTL_MS);

    if (cacheValid && !isAdmin) {
      const etag = _cache.etag;
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
      return res.status(200).json({ reports: _cache.publicReports });
    }

    const snapshot = await db.collection('reports')
      .orderBy('timestamp', 'desc')
      .get();

    const fullReports = [];
    const publicReports = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      fullReports.push({ id: doc.id, ...data });
      const publicData = { ...data };
      PRIVATE_FIELDS.forEach(f => delete publicData[f]);
      publicReports.push({ id: doc.id, ...publicData });
    });

    const latestTs = fullReports.length > 0 ? fullReports[0].timestamp : '0';
    const etag = `"${fullReports.length}-${latestTs}"`;

    _cache = { publicReports, etag };
    _cacheTime = now;

    res.setHeader('ETag', etag);

    if (!isAdmin && req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    const responseReports = isAdmin ? fullReports : publicReports;
    return res.status(200).json({ reports: responseReports });

  } catch (err) {
    console.error('Error reading reports:', err);
    return res.status(500).json({ error: 'Error al leer reclamos' });
  }
}
