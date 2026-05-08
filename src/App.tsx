import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'url-shortener-theme';

function getInitialDark(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function App() {
  const owner = import.meta.env.VITE_OWNER_NAME?.trim() ?? '';
  const [dark, setDark] = useState(getInitialDark);
  const [input, setInput] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [dark]);

  const shorten = useCallback(async () => {
    setError(null);
    setShortUrl(null);
    setCopied(false);
    setLoading(true);
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input }),
      });
      const data = (await res.json()) as { shortUrl?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? '短縮に失敗しました');
      }
      if (!data.shortUrl) {
        throw new Error('応答が不正です');
      }
      setShortUrl(data.shortUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : '短縮に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const copy = useCallback(async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('クリップボードへコピーできませんでした');
    }
  }, [shortUrl]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              URL短縮ツール
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              長いURLを短くしてコピーできます（is.gd 経由）
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-label={dark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            {dark ? 'ライト' : 'ダーク'}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <label htmlFor="url" className="mb-2 block text-sm font-medium">
            元のURL
          </label>
          <input
            id="url"
            type="url"
            name="url"
            autoComplete="url"
            placeholder="https://example.com/very/long/path"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mb-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none ring-teal-500/40 transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 dark:border-zinc-600 dark:bg-zinc-950 dark:focus:border-teal-400"
          />

          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={() => void shorten()}
            className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '短縮中…' : 'URLを短縮'}
          </button>

          {error ? (
            <p
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {shortUrl ? (
            <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50/80 p-4 dark:border-teal-900 dark:bg-teal-950/40">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-teal-800 dark:text-teal-200">
                短縮URL
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 break-all text-base font-medium text-teal-700 underline-offset-2 hover:underline dark:text-teal-300"
                >
                  {shortUrl}
                </a>
                <button
                  type="button"
                  onClick={() => void copy()}
                  className="shrink-0 rounded-lg border border-teal-600 bg-white px-4 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-50 dark:border-teal-500 dark:bg-zinc-900 dark:text-teal-100 dark:hover:bg-zinc-800"
                >
                  {copied ? 'コピー済み' : 'コピー'}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          短縮は is.gd の公開APIを利用しています。レート制限・利用規約・可用性は同サービスに依存します。
        </p>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        {owner ? (
          <p className="mb-1">
            <span className="text-zinc-700 dark:text-zinc-300">{owner}</span>
          </p>
        ) : null}
        <p>© OFFICENN</p>
      </footer>
    </div>
  );
}
