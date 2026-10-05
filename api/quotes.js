import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WRITE_KEY = process.env.MANTRA_WRITE_KEY;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function allowed(req) {
  if (!WRITE_KEY) return false;
  return req.headers['x-mantra-key'] === WRITE_KEY;
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return json(res, 503, { error: 'Database is not configured yet.' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('quotes')
        .select('id,text,author,source,source_url,tag,created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return json(res, 200, data || []);
    }

    if (req.method === 'POST') {
      if (!allowed(req)) return json(res, 401, { error: 'Edit key required.' });

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const text = String(body.text || '').trim();
      if (!text) return json(res, 400, { error: 'Quote text is required.' });

      const payload = {
        text,
        author: String(body.author || 'Unknown').trim().slice(0, 200),
        source: String(body.source || '').trim().slice(0, 300),
        source_url: String(body.source_url || '').trim().slice(0, 1200),
        tag: String(body.tag || 'Mantra').trim().slice(0, 100)
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert(payload)
        .select('id,text,author,source,source_url,tag,created_at')
        .single();

      if (error) throw error;
      return json(res, 201, data);
    }

    if (req.method === 'DELETE') {
      if (!allowed(req)) return json(res, 401, { error: 'Edit key required.' });

      const id = String(req.query?.id || '').trim();
      if (!id) return json(res, 400, { error: 'Quote id is required.' });

      const { error } = await supabase.from('quotes').delete().eq('id', id);
      if (error) throw error;
      return json(res, 200, { ok: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return json(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Database operation failed.' });
  }
}
