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
  /https?:\/\//i,
  /(.)\1{8,}/,
  /\b(casino|viagra|crypto|bitcoin|porn|xxx|onlyfans|buy now|click here|free money)\b/i,
  /\b(ganar|gana|dinero fácil|inversión segura|llama ya|oferta)\b/i,
  /\bspam\b/i,
  /\bprueba\b/i,
  /(\p{Emoji})\1{2,}/u,
];

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

// ── Umbrales por IP (más bajos porque 1 IP puede rotar UIDs) ─────
const IP_NIVEL_1 = 4;
const IP_NIVEL_2 = 7;
const IP_NIVEL_3 = 10;

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
// FIX: ahora evalúa por UID *y* por IP de forma independiente.
// Esto evita que rotar cuentas esquive el bloqueo automático.
async function evaluarNivelThreat(uid, ip) {
  try {
    const ventanaInicio = new Date(Date.now() - VENTANA_MS);

    // ── Conteo por UID ───────────────────────────────────────────
    let countUid = 0;
    if (uid && uid !== 'NO_AUTENTICADO') {
      const snapUid = await db.collection('suspicious')
        .where('uid', '==', uid)
        .where('timestamp', '>=', ventanaInicio)
        .get();
      countUid = snapUid.size;
    }

    // ── Conteo por IP ────────────────────────────────────────────
    // FIX: el original ignoraba la IP — si el atacante rotaba UIDs
    // nunca acumulaba suficientes eventos para el bloqueo automático.
    let countIp = 0;
    if (ip && ip !== 'IP_DESCONOCIDA') {
      const snapIp = await db.collection('suspicious')
        .where('ip', '==', ip)
        .where('timestamp', '>=', ventanaInicio)
        .get();
      countIp = snapIp.size;
    }

    // ── Bloquear UID si supera nivel 3 ──────────────────────────
    if (countUid >= NIVEL_3 && uid && uid !== 'NO_AUTENTICADO') {
      await db.collection('blocked_uids').doc(uid).set({
        uid,
        ip,
        bloqueadoEn: FieldValue.serverTimestamp(),
        motivo: `Auto: ${countUid} eventos UID en 10min`,
        desbloqueado: false,
      }, { merge: true });
      LOCAL_BLOCKED_CACHE.add(uid);
      console.log(`[BLOQUEO_UID_AUTO] UID: ${uid} | Eventos: ${countUid}`);
    }

    // ── Bloquear IP si supera umbral ─────────────────────────────
    // FIX: bloqueo automático por IP, independiente del UID.
    if (countIp >= IP_NIVEL_3 && ip && ip !== 'IP_DESCONOCIDA') {
      const existe = await db.collection('blocked_ips')
        .where('ip', '==', ip)
        .where('desbloqueado', '==', false)
        .limit(1)
        .get();

      if (existe.empty) {
        await db.collection('blocked_ips').add({
          ip,
          desbloqueado: false,
          motivo: `Auto: ${countIp} eventos IP en 10min`,
          bloqueadoEn: FieldValue.serverTimestamp(),
          bloqueadoPor: 'sistema',
        });
        LOCAL_BLOCKED_IPS.add(ip);
        console.log(`[BLOQUEO_IP_AUTO] IP: ${ip} | Eventos: ${countIp}`);
      }
    }

    // ── Nivel resultante (el mayor entre UID e IP) ───────────────
    const nivelUid = countUid >= NIVEL_3 ? 3 : countUid >= NIVEL_2 ? 2 : countUid >= NIVEL_1 ? 1 : 0;
    const nivelIp  = countIp  >= IP_NIVEL_3 ? 3 : countIp  >= IP_NIVEL_2 ? 2 : countIp  >= IP_NIVEL_1 ? 1 : 0;
    return Math.max(nivelUid, nivelIp);

  } catch (e) {
    console.error('[THREAT] Error evaluando nivel:', e);
    return 0;
  }
}

// ── Caché local de IPs bloqueadas (evita lecturas a Firestore) ───
const LOCAL_BLOCKED_IPS = new Set();

async function isBlockedIP(ip) {
  if (!ip || ip === 'IP_DESCONOCIDA') return false;
  if (LOCAL_BLOCKED_IPS.has(ip)) return true;
  try {
    const snap = await db.collection('blocked_ips')
      .where('ip', '==', ip)
      .where('desbloqueado', '==', false)
      .limit(1)
      .get();
    if (!snap.empty) {
      LOCAL_BLOCKED_IPS.add(ip);
      return true;
    }
  } catch (e) {
    console.error('[BLOCKED_IP] Error verificando:', e);
  }
  return false;
}

// ── Caché local de UIDs bloqueados ───────────────────────────────
const LOCAL_BLOCKED_CACHE = new Set();

async function isBlocked(uid) {
  if (LOCAL_BLOCKED_CACHE.has(uid)) return true;

  const envBlocked = (process.env.BLOCKED_UIDS || '').split(',').filter(Boolean);
  if (envBlocked.includes(uid)) {
    LOCAL_BLOCKED_CACHE.add(uid);
    return true;
  }

  try {
    const doc = await db.collection('blocked_uids').doc(uid).get();
    if (doc.exists && doc.data().desbloqueado === false) {
      LOCAL_BLOCKED_CACHE.add(uid);
      return true;
    }
  } catch (e) {
    console.error('[BLOCKED] Error verificando:', e);
  }
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://magdalena-reporta.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 'IP_DESCONOCIDA';
  const userAgent = req.headers['user-agent'] || '';

  // ── Verificar IP bloqueada (antes del token) ─────────────────
  const ipBloqueada = await isBlockedIP(clientIp);
  if (ipBloqueada) {
    console.log(`[IP_BLOQUEADA] IP: ${clientIp}`);
    return res.status(200).json({ ok: true, id: 'blocked' });
  }

  try {
    // ── 1. Verificar token Firebase ──────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await registrarSospechoso({
        evento: 'TOKEN_INVALIDO',
        detalle: 'Request sin Authorization',
        ip: clientIp, userAgent,
        uid: 'NO_AUTENTICADO',
      });
      // FIX: evaluar amenaza por IP aunque no haya UID válido
      await evaluarNivelThreat('NO_AUTENTICADO', clientIp);
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
        uid: 'NO_AUTENTICADO',
      });
      // FIX: evaluar amenaza por IP aunque el token sea inválido.
      // Antes esto terminaba acá sin evaluar nada — el atacante podía
      // acumular TOKEN_INVALIDO indefinidamente sin consecuencias.
      await evaluarNivelThreat('NO_AUTENTICADO', clientIp);
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

    // ── Normalización para detección de bypass ───────────────────
    const normalizedDesc = description
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (containsAttackPattern(normalizedDesc)) {
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

    if (containsSpam(description) || containsSpam(normalizedDesc)) {
      const patronDetectado = isShouting(description)
        ? 'mayoría mayúsculas'
        : (SPAM_PATTERNS.find(p => p.test(description))?.toString() || 'patrón desconocido');

      await registrarSospechoso({
        evento: 'SPAM_DETECTADO',
        detalle: `Patrón de spam: ${patronDetectado}`,
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
