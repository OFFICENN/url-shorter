import type { VercelRequest, VercelResponse } from '@vercel/node';
import { shortenUrl } from '../lib/shorten-url';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const raw = typeof body.url === 'string' ? body.url : '';
    const shortUrl = await shortenUrl(raw);
    res.status(200).json({ shortUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : '短縮に失敗しました';
    res.status(400).json({ error: message });
  }
}
