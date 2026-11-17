import { Download } from 'lucide-react';

export type WorkspaceTab = 'original' | 'python-lab' | 'repo-sync';

interface TopBarProps {
  activeView: WorkspaceTab;
  onSelectView: (view: WorkspaceTab) => void;
}

export function TopBar({ activeView, onSelectView }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#F9F9F6]/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-[#0B0D0C]/95">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-8 px-6 py-3.5">
        <button
          type="button"
          onClick={() => onSelectView('original')}
          className="font-display text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 dark:text-zinc-100"
        >
          Amulya R
        </button>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => onSelectView('original')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'original'
                ? 'text-emerald-800 underline underline-offset-4 dark:text-emerald-400'
                : 'text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Original Website
          </button>
          <button
            type="button"
            onClick={() => onSelectView('python-lab')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'python-lab'
                ? 'text-emerald-800 underline underline-offset-4 dark:text-emerald-400'
                : 'text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Python Backend
          </button>
          <button
            type="button"
            onClick={() => onSelectView('repo-sync')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'repo-sync'
                ? 'text-emerald-800 underline underline-offset-4 dark:text-emerald-400'
                : 'text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            GitHub Python Setup
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/api/export/github-bundle.zip"
            download="amulya-portfolio-python-upgrade.zip"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-emerald-900 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Python ZIP</span>
          </a>
        </div>
      </div>
    </header>
  );
}
