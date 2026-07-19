import { cors, send, supabaseAdmin } from '../_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from('app_updates')
      .select('latest_version,download_url,sha256,enabled,required,updated_at')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;

    return send(res, 200, {
      ok: true,
      update: data
        ? {
            enabled: data.enabled !== false,
            latestVersion: data.latest_version || '',
            downloadUrl: data.download_url || '',
            sha256: data.sha256 || '',
            required: Boolean(data.required),
            updatedAt: data.updated_at || ''
          }
        : {
            enabled: false,
            latestVersion: '',
            downloadUrl: '',
            sha256: '',
            required: false,
            updatedAt: ''
          }
    });
  } catch (error) {
    return send(res, 500, { ok: false, error: error.message || String(error) });
  }
}
