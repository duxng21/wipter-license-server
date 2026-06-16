import { cors, getLicense, normalizeKey, normalizeMachineId, publicLicense, requirePost, send, supabaseAdmin } from './_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requirePost(req, res)) return;

  try {
    const key = normalizeKey(req.body?.key);
    const machineId = normalizeMachineId(req.body?.machineId);
    if (!key || !machineId) return send(res, 400, { ok: false, error: 'Missing license key or machineId' });

    const db = supabaseAdmin();
    const license = await getLicense(db, key);
    if (!license) return send(res, 404, { ok: false, error: 'License key not found' });
    if (license.status === 'blocked') return send(res, 403, { ok: false, error: 'License is blocked' });
    if (license.status !== 'active') return send(res, 403, { ok: false, error: 'License is not activated' });
    if (license.machine_id !== machineId) return send(res, 403, { ok: false, error: 'License belongs to another device' });

    const { data, error } = await db
      .from('licenses')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('license_key', key)
      .select('*')
      .single();
    if (error) throw error;

    return send(res, 200, { ok: true, message: 'License valid', license: publicLicense(data) });
  } catch (error) {
    return send(res, 500, { ok: false, error: error.message || String(error) });
  }
}
