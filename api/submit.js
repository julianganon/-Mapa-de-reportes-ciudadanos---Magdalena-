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

const RATE_LIMIT_MS = 60000;

const GEO_BOUNDS = {
  latMin: -36.0,
  latMax: -34.5,
  lngMin: -58.5,
  lngMax: -56.5,
};

const VALID_CAT_IDS = [
  'obra','calle','luminaria','basura','cloaca',
  'agua','aguas','faltlum','tacho','rampa','zanja','otro'
];

const ATTACK_PATTERNS = [
  'ontoggle','onerror','onload','onclick','onmouse','onkey',
  'javascript:','<script','<iframe','<details','<svg','<img',
  'data:text','eval(','document.','window.','fetch(','xmlhttp',
  'alert(','confirm(','prompt('
];

function containsAttackPattern(str) {
  if (!str) return false;
  const lower = String(str).toLowerCase();
  return ATTACK_PATTERNS.some(p => lower.includes(p));
}

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

function inBounds(lat, lng) {
  return (
    lat >= GEO_BOUNDS.latMin && lat <= GEO_BOUNDS.latMax &&
    lng >= GEO_BOUNDS.lngMin && lng <= GEO_BOUNDS.lngMax
  );
}

// ── Registrar evento sospechoso en Firestore ─────────────────────
// Guarda evidencia completa para denuncia: IP, fecha, UID, email,
// herramienta usada y detalle del intento.
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
      endpoint: endpoint || '/api/submit',
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 'IP_DESCONOCIDA';
  const userAgent = req.headers['user-agent'] || '';

  try {
    // ── 1. Verificar token Firebase ──────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await registrarSospechoso({
        evento: 'TOKEN_INVALIDO',
        detalle: 'Request sin header Authorization',
        ip: clientIp,
        userAgent,
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
        detalle: 'Token Firebase inválido o expirado',
        ip: clientIp,
        userAgent,
      });
      return res.status(401).json({ error: 'Token inválido' });
    }

    const uid = decodedToken.uid;
    const userEmail = decodedToken.email || '';
    const userName = decodedToken.name || '';

    console.log(`[SUBMIT] IP: ${clientIp} | UID: ${uid}`);

    // ── 2. Bloqueo silencioso por UID ────────────────────────────
    const BLOCKED_UIDS = (process.env.BLOCKED_UIDS || '').split(',').filter(Boolean);
    if (BLOCKED_UIDS.includes(uid)) {
      console.log(`[BLOQUEADO] UID: ${uid} | IP: ${clientIp}`);
      await registrarSospechoso({
        evento: 'UID_BLOQUEADO',
        detalle: 'UID en lista negra intentó enviar reclamo',
        ip: clientIp,
        uid,
        email: userEmail,
        userAgent,
      });
      return res.status(200).json({ ok: true, id: 'blocked' });
    }

    // ── 3. Rate limit persistente en Firestore ───────────────────
    const rateLimitRef = db.collection('rate_limits').doc(uid);
    const rateLimitDoc = await rateLimitRef.get();

    if (rateLimitDoc.exists) {
      const lastSubmit = rateLimitDoc.data().lastSubmit?.toMillis() || 0;
      if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
        await registrarSospechoso({
          evento: 'RATE_LIMIT',
          detalle: 'Demasiados envíos en menos de 60 segundos',
          ip: clientIp,
          uid,
          email: userEmail,
          userAgent,
        });
        return res.status(429).json({ error: 'Esperá un momento antes de enviar otro reclamo' });
      }
    }

    // ── 4. Validar campos ────────────────────────────────────────
    const { cats, description, lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      await registrarSospechoso({
        evento: 'GEO_INVALIDO',
        detalle: `Coordenadas no numéricas: lat=${lat} lng=${lng}`,
        ip: clientIp,
        uid,
        email: userEmail,
        userAgent,
      });
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }

    if (!inBounds(lat, lng)) {
      console.log(`[GEO_INVALIDO] UID: ${uid} | lat: ${lat} | lng: ${lng} | IP: ${clientIp}`);
      await registrarSospechoso({
        evento: 'GEO_INVALIDO',
        detalle: `Coordenadas fuera de Magdalena: lat=${lat} lng=${lng}`,
        ip: clientIp,
        uid,
        email: userEmail,
        userAgent,
      });
      return res.status(400).json({ error: 'Ubicación fuera del área de Magdalena' });
    }

    if (typeof description !== 'string' || description.length > 300) {
      return res.status(400).json({ error: 'Descripción inválida' });
    }

    if (containsAttackPattern(description)) {
      const patron = ATTACK_PATTERNS.find(p => description.toLowerCase().includes(p));
      console.log(`[ATAQUE] Patrón detectado - UID: ${uid} | IP: ${clientIp}`);
      await registrarSospechoso({
        evento: 'ATAQUE_PATRON',
        detalle: `Patrón: "${patron}" en: "${description.substring(0, 100)}"`,
        ip: clientIp,
        uid,
        email: userEmail,
        userAgent,
      });
      return res.status(400).json({ error: 'Contenido no permitido en la descripción' });
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
      await registrarSospechoso({
        evento: 'ATAQUE_PATRON',
        detalle: `Categorías inválidas: ${JSON.stringify(cats).substring(0, 100)}`,
        ip: clientIp,
        uid,
        email: userEmail,
        userAgent,
      });
      return res.status(400).json({ error: 'Categorías inválidas' });
    }

    const contactName = sanitize(req.body.contactName || '').substring(0, 100);
    const contactInfo = sanitize(req.body.contactInfo || '').substring(0, 100);
    const safeDesc = sanitize(description).substring(0, 300);

    // ── 5. Guardar reclamo ───────────────────────────────────────
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
    await rateLimitRef.set({ lastSubmit: FieldValue.serverTimestamp(), uid });

    // ── 6. Webhook a Google Sheets (opcional) ───────────────────
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
