import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Moon, Sun } from 'lucide-react';
import type { PortfolioData, RepoLanguageReport } from '../types/portfolio';

interface HeroSectionProps {
  portfolio: PortfolioData | null;
  repoReport: RepoLanguageReport | null;
  darkMode: boolean;
  onToggleDark: () => void;
}

const HERO_IMAGE = '/src/assets/images/hero_cs_engineer_studio_1794896013879.jpg';

export function HeroSection({
  portfolio,
  repoReport,
  darkMode,
  onToggleDark,
}: HeroSectionProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const profile = portfolio?.profile;
  const summary = portfolio?.summary;
  const pythonShare = repoReport?.projected.pythonSharePct ?? 74.1;

  return (
    <section id="top" className="border-b border-stone-200 dark:border-zinc-800">
      <div className="mx-auto max-w-[1200px] px-6 py-12 lg:py-16">
        <div className="grid items-stretch gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-zinc-400">
                  {profile?.location ?? 'Bengaluru, India'} ·{' '}
                  {profile?.university ?? 'Jain University'} · CSE (AI & ML)
                </p>
                <button
                  type="button"
                  onClick={onToggleDark}
                  aria-label="Toggle color theme"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 whitespace-nowrap shrink-0 transition-colors hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-3.5 w-3.5" />
                      <span>Light Theme</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-3.5 w-3.5" />
                      <span>Dark Theme</span>
                    </>
                  )}
                </button>
              </div>

              <h1
                className="mt-6 font-display text-[clamp(2.4rem,4.4vw,3.9rem)] font-bold leading-[1.06] tracking-tight text-stone-950 dark:text-zinc-50"
                style={{ textWrap: 'balance' }}
              >
                Hi, I&apos;m Amulya. I build ideas into Python-backed experiences.
              </h1>

              <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-stone-600 dark:text-zinc-300">
                {profile?.bioLead ??
                  "I'm Amulya R, a B.Tech student at Jain University specializing in Computer Science and Engineering (Artificial Intelligence & Machine Learning)."}{' '}
                {profile?.bioBody ??
                  'I turn academic concepts in nutrition scoring, traffic matrix algebra, and Indian environmental datasets into testable Python backend services.'}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#python-lab"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-emerald-900 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              >
                <span>Open Python Lab</span>
                <ArrowDownRight className="h-4 w-4" />
              </a>
              <a
                href="#repo-sync"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 whitespace-nowrap shrink-0 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <span>GitHub Python Upgrade</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[300px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900">
              {!imgFailed ? (
                <img
                  src={HERO_IMAGE}
                  alt="Amulya R studying AI engineering and discrete mathematics in a sunlit studio"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover object-center lg:h-full"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-950/10 to-stone-200 p-8 text-center dark:from-emerald-950/40 dark:to-zinc-900">
                  <span className="font-display text-2xl font-bold text-stone-800 dark:text-zinc-100">
                    Amulya R
                  </span>
                  <span className="mt-2 text-sm text-stone-600 dark:text-zinc-400">
                    B.Tech CSE · AI &amp; Machine Learning
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-width quantitative proof strip below Hero Split */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-stone-200 pt-8 sm:grid-cols-4 dark:border-zinc-800">
          <div>
            <div className="font-mono text-2xl font-semibold tracking-tight text-stone-950 tabular-nums dark:text-zinc-100">
              {summary?.pythonBackedProjects ?? 4}
            </div>
            <div className="mt-1 text-xs font-medium text-stone-500 dark:text-zinc-400">
              Python-Powered Project Solvers
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-semibold tracking-tight text-stone-950 tabular-nums dark:text-zinc-100">
              {summary?.totalSkillTopics ?? 13}
            </div>
            <div className="mt-1 text-xs font-medium text-stone-500 dark:text-zinc-400">
              Indexed Technical Skills
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-semibold tracking-tight text-stone-950 tabular-nums dark:text-zinc-100">
              {summary?.verifiedCertificates ?? 2}
            </div>
            <div className="mt-1 text-xs font-medium text-stone-500 dark:text-zinc-400">
              Wolfram U Discrete Math Certs
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-semibold tracking-tight text-emerald-800 tabular-nums dark:text-emerald-400">
              {pythonShare.toFixed(1)}%
            </div>
            <div className="mt-1 text-xs font-medium text-stone-500 dark:text-zinc-400">
              Projected GitHub Python Share
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
