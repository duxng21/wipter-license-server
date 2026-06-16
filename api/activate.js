import { cors, getLicense, normalizeKey, normalizeMachineId, publicLicense, requirePost, send, supabaseAdmin } from './_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requirePost(req, res)) return;

  try {
    const key = normalizeKey(req.body?.key);
    const machineId = normalizeMachineId(req.body?.machineId);
    if (!key || !machineId) return send(res, 400, { ok: false, error: 'Missing license key or machineId' });

    const db = supabaseAdmin();
    let license = await getLicense(db, key);
    if (!license) return send(res, 404, { ok: false, error: 'License key not found' });
    if (license.status === 'blocked') return send(res, 403, { ok: false, error: 'License is blocked' });

    if (license.status === 'unused') {
      const { data, error } = await db
        .from('licenses')
        .update({ status: 'active', machine_id: machineId, activated_at: new Date().toISOString(), last_seen_at: new Date().toISOString() })
        .eq('license_key', key)
        .eq('status', 'unused')
        .select('*')
        .single();
      if (error) throw error;
      return send(res, 200, { ok: true, message: 'Activated successfully', license: publicLicense(data) });
    }

    if (license.status === 'active') {
      if (license.machine_id !== machineId) {
        return send(res, 403, { ok: false, error: 'License already activated on another device' });
      }
      const { data, error } = await db
        .from('licenses')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('license_key', key)
        .select('*')
        .single();
      if (error) throw error;
      return send(res, 200, { ok: true, message: 'License already active on this device', license: publicLicense(data) });
    }

    return send(res, 500, { ok: false, error: 'Invalid license status' });
  } catch (error) {
    return send(res, 500, { ok: false, error: error.message || String(error) });
  }
}
