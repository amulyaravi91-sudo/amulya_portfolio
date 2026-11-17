import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Copy, Download, RefreshCw, UploadCloud } from 'lucide-react';
import type { RepoLanguageReport } from '../types/portfolio';

interface RepoSyncSectionProps {
  repoReport: RepoLanguageReport | null;
  onRefreshRepo: () => Promise<void>;
}

const LANG_BAR_COLORS: Record<string, string> = {
  Python: 'bg-emerald-700 dark:bg-emerald-500',
  HTML: 'bg-amber-600 dark:bg-amber-500',
  JavaScript: 'bg-stone-500 dark:bg-zinc-400',
};

const GIT_COMMANDS = `unzip amulya-portfolio-python-upgrade.zip -d .
git add backend/
git commit -m "feat: add Python backend to process portfolio data"
git push origin main`;

export function RepoSyncSection({ repoReport, onRefreshRepo }: RepoSyncSectionProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/github/sync-status')
      .then((r) => r.json())
      .then((data: { tokenConfigured?: boolean }) => {
        setTokenConfigured(Boolean(data.tokenConfigured));
      })
      .catch(() => {});
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await onRefreshRepo();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDirectPush() {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const resp = await fetch('/api/github/sync', { method: 'POST' });
      const data = (await resp.json()) as {
        ok?: boolean;
        updatedFiles?: string[];
        message?: string;
      };
      if (!resp.ok || !data.ok) {
        setSyncFeedback(data.message || 'Unable to push to GitHub.');
      } else {
        setSyncFeedback(
          `Committed ${data.updatedFiles?.length ?? 0} files under backend/ to amulyaravi91-sudo/amulya-portfolio without touching your HTML/CSS/JS.`
        );
        await onRefreshRepo();
      }
    } catch (err) {
      setSyncFeedback((err as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  function handleCopyGit() {
    navigator.clipboard.writeText(GIT_COMMANDS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section id="repo-sync" className="border-b border-stone-200 dark:border-zinc-800">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-zinc-400">
              GitHub Repository Python Injection (Zero Website Changes)
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl dark:text-zinc-50">
              Add Python backend to amulya-portfolio without modifying your site.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-stone-600 dark:text-zinc-400">
              Your existing <span className="font-mono">index.html</span>,{' '}
              <span className="font-mono">style.css</span>,{' '}
              <span className="font-mono">main.js</span>,{' '}
              <span className="font-mono">config.js</span>, and portrait stay 100% untouched. Only
              the <span className="font-mono">backend/</span> folder is added.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 whitespace-nowrap shrink-0 transition-colors hover:bg-stone-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Re-scan GitHub Bytes</span>
            </button>
            <a
              href="/api/export/github-bundle.zip"
              download="amulya-portfolio-python-upgrade.zip"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-emerald-900 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download backend/ ZIP</span>
            </a>
          </div>
        </div>

        {repoReport ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 lg:col-span-7 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 dark:text-zinc-200">
                    Current GitHub Repository ({repoReport.repository})
                  </span>
                  <span className="font-mono text-stone-500 dark:text-zinc-400">
                    {repoReport.current.totalBytes.toLocaleString()} bytes · {repoReport.source}
                  </span>
                </div>
                <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
                  {repoReport.current.languages.map((lang) => (
                    <div
                      key={lang.language}
                      className={LANG_BAR_COLORS[lang.language] ?? 'bg-stone-400'}
                      style={{ width: `${lang.percentage}%` }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs text-stone-600 dark:text-zinc-400">
                  {repoReport.current.languages.map((lang) => (
                    <span key={lang.language}>
                      {lang.language} {lang.percentage}% ({lang.bytes.toLocaleString()} B)
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-200 pt-6 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-950 dark:text-zinc-100">
                    After Adding backend/ Folder Only
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-emerald-800 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{repoReport.projected.pythonSharePct}% Python</span>
                  </span>
                </div>
                <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
                  {repoReport.projected.languages.map((lang) => (
                    <div
                      key={lang.language}
                      className={LANG_BAR_COLORS[lang.language] ?? 'bg-stone-400'}
                      style={{ width: `${lang.percentage}%` }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs text-stone-700 dark:text-zinc-300">
                  {repoReport.projected.languages.map((lang) => (
                    <span key={lang.language}>
                      {lang.language} {lang.percentage}% ({lang.bytes.toLocaleString()} B)
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-stone-200 pt-5 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200">
                    Quick Terminal Push (After Downloading ZIP)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyGit}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 hover:underline dark:text-emerald-400"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copied ? 'Copied' : 'Copy commands'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-xl border border-stone-200 bg-[#F9F9F6] p-3.5 font-mono text-xs text-stone-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                  {GIT_COMMANDS}
                </pre>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <a
                    href={repoReport.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 hover:underline dark:text-emerald-400"
                  >
                    <span>Open github.com/amulyaravi91-sudo/amulya-portfolio</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>

                  {tokenConfigured && (
                    <button
                      type="button"
                      onClick={handleDirectPush}
                      disabled={syncing}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 px-3.5 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>{syncing ? 'Pushing...' : 'Push backend/ Directly to GitHub'}</span>
                    </button>
                  )}
                </div>

                {syncFeedback && (
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    {syncFeedback}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 lg:col-span-5 dark:border-zinc-800 dark:bg-zinc-900/70">
              <h3 className="font-display text-base font-bold text-stone-950 dark:text-zinc-100">
                Files Included in backend/ ZIP
              </h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                Only Python backend modules and processed portfolio data—zero existing files altered.
              </p>

              <div className="mt-4 divide-y divide-stone-100 border-t border-stone-200 dark:divide-zinc-800 dark:border-zinc-800">
                {repoReport.pythonModules.map((mod) => (
                  <div
                    key={mod.path}
                    className="flex items-center justify-between gap-4 py-2.5 text-xs"
                  >
                    <span className="truncate font-mono text-stone-800 dark:text-zinc-200">
                      {mod.path}
                    </span>
                    <span className="shrink-0 font-mono text-stone-500 tabular-nums dark:text-zinc-400">
                      {mod.bytes.toLocaleString()} B
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-500 dark:border-zinc-800 dark:bg-zinc-900/70">
            Analyzing GitHub repository bytes via Python...
          </div>
        )}
      </div>
    </section>
  );
}
