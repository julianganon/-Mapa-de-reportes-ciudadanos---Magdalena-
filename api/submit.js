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
  latMin: -36.0, latMax: -34.5,
  lngMin: -58.5, lngMax: -56.5,
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

// ── Detección de spam ────────────────────────────────────────────
const SPAM_PATTERNS = [
  /https?:\/\//i,                    // cualquier URL
  /(.)\1{8,}/,                       // carácter repetido 8+ veces
  /\b(casino|viagra|crypto|bitcoin|porn|xxx|onlyfans|buy now|click here|free money)\b/i,
  /\b(ganar|gana|dinero fácil|inversión segura|llama ya|oferta)\b/i,
  /\bspam\b/i,                       // la palabra "spam" literal
  /\bprueba\b/i,                     // test bombing
  /(\p{Emoji})\1{2,}/u,             // emoji repetido 3+ veces
];

// Más del 70% de letras en mayúsculas → grito / spam
function isShouting(str) {
  if (!str || str.length < 8) return false;
  const letters = str.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ]/g, '');
  if (letters.length === 0) return false;
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '');
  return (upper.length / letters.length) > 0.7;
}

function containsSpam(str) {
  if (!str) return false;
  if (isShouting(str)) return true;
  return SPAM_PATTERNS.some(p => p.test(String(str)));
}

// ────────────────────────────────────────────────────────────────

const VENTANA_MS = 10 * 60 * 1000;
const NIVEL_1 = 3;
const NIVEL_2 = 5;
const NIVEL_3 = 8;

function containsAttackPattern(str) {
  if (!str) return false;
  const lower = String(str).toLowerCase();
  return ATTACK_PATTERNS.some(p => lower.includes(p));
}

function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/\\/g, '&#092;')
    .trim();
}

function inBounds(lat, lng) {
  return lat >= GEO_BOUNDS.latMin && lat <= GEO_BOUNDS.latMax &&
         lng >= GEO_BOUNDS.lngMin && lng <= GEO_BOUNDS.lngMax;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Registrar evento sospechoso ──────────────────────────────────
async function registrarSospechoso({
  evento, detalle,
  ip, uid, email, userAgent, userName,
  endpoint, nivel,
  mensaje, cats, lat, lng,
  reportId,
  fingerprint,
}) {
  try {
    const ahora = new Date();
    const fechaAR = ahora.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    await db.collection('suspicious').add({
      uid: uid || 'NO_AUTENTICADO',
      email: email || '',
      userName: userName || '',
      ip: ip || 'DESCONOCIDA',
      userAgent: userAgent || '',
      endpoint: endpoint || '/api/submit',
      evento,
      detalle: detalle || '',
      nivel: nivel || 0,
      mensaje: mensaje || '',
      cats: cats || [],
      lat: lat ?? null,
      lng: lng ?? null,
      reportId: reportId || null,
      fecha: ahora.toISOString(),
      fechaAR,
      timestamp: FieldValue.serverTimestamp(),
      bloqueado: true,
      revisado: false,
    });
  } catch (e) {
    console.error('[SUSPICIOUS] Error al registrar:', e);
  }
}

// ── Sistema de bloqueo progresivo ────────────────────────────────
async function evaluarNivelThreat(uid, ip) {
  try {
    const ventanaInicio = new Date(Date.now() - VENTANA_MS);
    const snapshot = await db.collection('suspicious')
      .where('uid', '==', uid)
      .where('timestamp', '>=', ventanaInicio)
      .get();

    const count = snapshot.size;

    if (count >= NIVEL_3) {
      await db.collection('blocked_uids').doc(uid).set({
        uid,
        ip,
        bloqueadoEn: FieldValue.serverTimestamp(),
        motivo: `Nivel 3 alcanzado: ${count} eventos en 10 minutos`,
        desbloqueado: false,
      }, { merge: true });
      console.log(`[BLOQUEO_AUTO] UID: ${uid} | Eventos: ${count}`);
      return 3;
    }

    if (count >= NIVEL_2) return 2;
    if (count >= NIVEL_1) return 1;
    return 0;

  } catch (e) {
    console.error('[THREAT] Error evaluando nivel:', e);
    return 0;
  }
}

// ── Verificar si UID está bloqueado ─────────────────────────────
async function isBlocked(uid) {
  const envBlocked = (process.env.BLOCKED_UIDS || '').split(',').filter(Boolean);
  if (envBlocked.includes(uid)) return true;

  try {
    const doc = await db.collection('blocked_uids').doc(uid).get();
    if (doc.exists && doc.data().desbloqueado === false) return true;
  } catch (e) {
    console.error('[BLOCKED] Error verificando:', e);
  }
  return false;
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
        detalle: 'Request sin Authorization',
        ip: clientIp, userAgent,
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
        detalle: 'Token inválido o expirado',
        ip: clientIp, userAgent,
      });
      return res.status(401).json({ error: 'Token inválido' });
    }

    const uid = decodedToken.uid;
    const userEmail = decodedToken.email || '';
    const userName = decodedToken.name || '';

    const { cats, description, lat, lng, fingerprint } = req.body;

    console.log(`[SUBMIT] IP: ${clientIp} | UID: ${uid}`);

    // ── 2. Verificar bloqueo ─────────────────────────────────────
    const bloqueado = await isBlocked(uid);
    if (bloqueado) {
      console.log(`[BLOQUEADO] UID: ${uid} | IP: ${clientIp}`);
      await registrarSospechoso({
        evento: 'UID_BLOQUEADO',
        detalle: 'UID bloqueado intentó enviar',
        ip: clientIp, uid, email: userEmail, userAgent, userName,
        mensaje: typeof description === 'string' ? description : '',
        cats: Array.isArray(cats) ? cats : [],
        lat: typeof lat === 'number' ? lat : null,
        lng: typeof lng === 'number' ? lng : null,
        fingerprint: fingerprint || null,
      });
      return res.status(200).json({ ok: true, id: 'blocked' });
    }

    // ── 3. Rate limit persistente ────────────────────────────────
    const rateLimitRef = db.collection('rate_limits').doc(uid);
    const rateLimitDoc = await rateLimitRef.get();

    if (rateLimitDoc.exists) {
      const lastSubmit = rateLimitDoc.data().lastSubmit?.toMillis() || 0;
      if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
        await registrarSospechoso({
          evento: 'RATE_LIMIT',
          detalle: 'Envíos en ráfaga',
          ip: clientIp, uid, email: userEmail, userAgent, userName,
          mensaje: typeof description === 'string' ? description : '',
          cats: Array.isArray(cats) ? cats : [],
          lat: typeof lat === 'number' ? lat : null,
          lng: typeof lng === 'number' ? lng : null,
        });

        const nivel = await evaluarNivelThreat(uid, clientIp);
        if (nivel >= 2) await delay(3000);

        return res.status(429).json({ error: 'Esperá un momento antes de enviar otro reclamo' });
      }
    }

    // ── 4. Validar campos ────────────────────────────────────────
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      await registrarSospechoso({
        evento: 'GEO_INVALIDO',
        detalle: `Coords no numéricas: lat=${lat} lng=${lng}`,
        ip: clientIp, uid, email: userEmail, userAgent, userName,
        mensaje: typeof description === 'string' ? description : '',
        cats: Array.isArray(cats) ? cats : [],
        lat: lat ?? null,
        lng: lng ?? null,
      });
      const nivel = await evaluarNivelThreat(uid, clientIp);
      if (nivel >= 2) await delay(3000);
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }

    if (!inBounds(lat, lng)) {
      await registrarSospechoso({
        evento: 'GEO_INVALIDO',
        detalle: `Fuera de Magdalena: lat=${lat} lng=${lng}`,
        ip: clientIp, uid, email: userEmail, userAgent, userName,
        mensaje: typeof description === 'string' ? description : '',
        cats: Array.isArray(cats) ? cats : [],
        lat, lng,
        fingerprint: fingerprint || null,
      });
      const nivel = await evaluarNivelThreat(uid, clientIp);
      if (nivel >= 2) await delay(3000);
      return res.status(400).json({ error: 'Ubicación fuera del área de Magdalena' });
    }

    if (typeof description !== 'string' || description.length > 300) {
      return res.status(400).json({ error: 'Descripción inválida' });
    }

    if (containsAttackPattern(description)) {
      const patron = ATTACK_PATTERNS.find(p => description.toLowerCase().includes(p));
      await registrarSospechoso({
        evento: 'ATAQUE_PATRON',
        detalle: `Patrón detectado: "${patron}"`,
        ip: clientIp, uid, email: userEmail, userAgent, userName,
        mensaje: description,
        cats: Array.isArray(cats) ? cats : [],
        lat, lng,
        fingerprint: fingerprint || null,
      });
      const nivel = await evaluarNivelThreat(uid, clientIp);
      if (nivel >= 2) await delay(3000);
      return res.status(200).json({ ok: true, id: 'blocked' });
    }

    // ── NUEVO: Detección de spam ─────────────────────────────────
    if (containsSpam(description)) {
      const patronDetectado = isShouting(description)
        ? 'mayoría mayúsculas'
        : (SPAM_PATTERNS.find(p => p.test(description))?.toString() || 'patrón desconocido');

      await registrarSospechoso({
        evento: 'SPAM_DETECTADO',
        detalle: `Patrón de spam: ${patronDetectado}`,
        ip: clientIp, uid, email: userEmail, userAgent, userName,
        mensaje: description,           // evidencia sin sanitizar
        cats: Array.isArray(cats) ? cats : [],
        lat, lng,
        fingerprint: fingerprint || null,
      });
      const nivel = await evaluarNivelThreat(uid, clientIp);
      if (nivel >= 2) await delay(3000);
      // Respuesta falsa: el hacker cree que funcionó
      return res.status(200).json({ ok: true, id: 'blocked' });
    }

    if (!Array.isArray(cats) || cats.length === 0) {
      return res.status(400).json({ error: 'Seleccioná al menos una categoría' });
    }

    const safeCats = cats
      .filter(c => VALID_CAT_IDS.includes(c.id))
      .map(c => ({ id: sanitize(c.id), name: sanitize(c.name), icon: sanitize(c.icon) }));

    if (safeCats.length === 0) {
      await registrarSospechoso({
        evento: 'ATAQUE_PATRON',
        detalle: `Categorías inválidas: ${JSON.stringify(cats).substring(0, 100)}`,
        ip: clientIp, uid, email: userEmail, userAgent, userName,
        mensaje: description,
        cats,
        lat, lng,
        fingerprint: fingerprint || null,
      });
      const nivel = await evaluarNivelThreat(uid, clientIp);
      if (nivel >= 2) await delay(3000);
      return res.status(400).json({ error: 'Categorías inválidas' });
    }

    const contactName = sanitize(req.body.contactName || '').substring(0, 100);
    const contactInfo = sanitize(req.body.contactInfo || '').substring(0, 100);
    const safeDesc = sanitize(description).substring(0, 300);

    // ── 5. Guardar reclamo ───────────────────────────────────────
    const report = {
      cats: safeCats, description: safeDesc, lat, lng,
      timestamp: new Date().toISOString(), status: 'Pendiente',
      contactName: contactName || null, contactInfo: contactInfo || null,
      userUid: uid, userName, userEmail,
      fingerprint: fingerprint || null,
    };

    const docRef = await db.collection('reports').add(report);
    await rateLimitRef.set({ lastSubmit: FieldValue.serverTimestamp(), uid });

    // ── 6. Webhook a Google Sheets ───────────────────────────────
    const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
    if (sheetsUrl) {
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      fetch(sheetsUrl, {
        method: 'POST', mode: 'no-cors',
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
