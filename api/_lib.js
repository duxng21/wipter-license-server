import { createClient } from '@supabase/supabase-js';

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function send(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.end(JSON.stringify(payload));
}

export function cors(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 200, { ok: true });
    return true;
  }
  return false;
}

export function requirePost(req, res) {
  if (req.method !== 'POST') {
    send(res, 405, { ok: false, error: 'POST required' });
    return false;
  }
  return true;
}

export function normalizeKey(key = '') {
  return String(key).trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

export function normalizeMachineId(machineId = '') {
  return String(machineId).trim().slice(0, 255);
}

export function publicLicense(row) {
  return {
    key: row.license_key,
    status: row.status,
    plan: 'lifetime',
    product: 'Wipter Tool',
    activatedAt: row.activated_at,
    lastSeenAt: row.last_seen_at,
  };
}

export function requireAdmin(req, res) {
  const expected = process.env.ADMIN_SECRET || '';
  const provided = req.headers['x-admin-secret'] || '';
  if (!expected || expected === 'change-me-long-random-secret') {
    send(res, 500, { ok: false, error: 'ADMIN_SECRET is not configured' });
    return false;
  }
  if (provided !== expected) {
    send(res, 401, { ok: false, error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function generateLicenseKey() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const groups = [];
  for (let g = 0; g < 3; g++) {
    let part = '';
    for (let i = 0; i < 4; i++) {
      part += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    groups.push(part);
  }
  return `WIPTER-${groups.join('-')}`;
}

export async function getLicense(db, key) {
  const { data, error } = await db.from('licenses').select('*').eq('license_key', key).maybeSingle();
  if (error) throw error;
  return data;
}
