/** http(s) のみ許可し、is.gd の公開APIで短縮URLを取得する */

export function validatePublicHttpUrl(input: string): string {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error('URLの形式が正しくありません');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('http または https のURLのみ対応しています');
  }
  return parsed.href;
}

/**
 * TinyURL の旧 api-create.php 経由のリンクは、クリック時にプレビュー待機ページが挟まることがあるため使わない。
 * @see https://www.is.gd/developers.php （format=simple）
 */
export async function shortenUrl(longUrl: string): Promise<string> {
  const safe = validatePublicHttpUrl(longUrl);
  const endpoint = new URL('https://is.gd/create.php');
  endpoint.searchParams.set('format', 'simple');
  endpoint.searchParams.set('url', safe);
  const r = await fetch(endpoint);
  const text = (await r.text()).trim();

  if (text.startsWith('Error:')) {
    const msg = text.slice('Error:'.length).trim();
    throw new Error(msg || '短縮に失敗しました');
  }
  if (!r.ok || !/^https?:\/\//i.test(text)) {
    throw new Error(text || '短縮サービスから有効な応答がありませんでした');
  }
  return text;
}
