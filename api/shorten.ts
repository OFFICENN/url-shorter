import { shortenUrl } from './lib/shorten-url';

/**
 * Node.js ランタイム + @vercel/node は本番で 500 になるケースがあるため、
 * Edge（Web 標準 API）で動かす。
 */
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  let body: { url?: unknown };
  try {
    body = (await request.json()) as { url?: unknown };
  } catch {
    return json({ error: 'JSONの形式が正しくありません' }, 400);
  }

  try {
    const raw = typeof body.url === 'string' ? body.url : '';
    const shortUrl = await shortenUrl(raw);
    return json({ shortUrl }, 200);
  } catch (e) {
    const message = e instanceof Error ? e.message : '短縮に失敗しました';
    return json({ error: message }, 400);
  }
}

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
