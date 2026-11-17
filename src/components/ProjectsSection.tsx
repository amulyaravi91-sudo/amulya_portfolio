import { useEffect, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import type { PortfolioData, ProjectItem } from '../types/portfolio';

interface ProjectsSectionProps {
  portfolio: PortfolioData | null;
  onLaunchAnalyzer: (analyzer: 'food' | 'traffic' | 'aqi' | 'ambulance') => void;
}

const PROJECT_IMAGES: Record<string, string> = {
  'food-scanner': '/src/assets/images/project_food_scanner_1794896015496.jpg',
  'traffic-optimization': '/src/assets/images/project_traffic_matrix_1794896015535.jpg',
  'aqi-analysis': '/src/assets/images/project_aqi_india_1794896016516.jpg',
  'ambulance-corridor': '/src/assets/images/project_ambulance_corridor_1794896016434.jpg',
};

const FILTER_TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'ai', label: 'AI & Smart Mobility' },
  { id: 'math', label: 'Mathematics' },
  { id: 'data', label: 'Environmental Data' },
];

export function ProjectsSection({ portfolio, onLaunchAnalyzer }: ProjectsSectionProps) {
  const [domain, setDomain] = useState('all');
  const [query, setQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<ProjectItem[]>(
    portfolio?.projects ?? []
  );
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (portfolio?.projects && domain === 'all' && query === '') {
      setFilteredProjects(portfolio.projects);
    }
  }, [portfolio, domain, query]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ domain, q: query });
        const resp = await fetch(`/api/portfolio/projects?${params.toString()}`, {
          signal: controller.signal,
        });
        if (resp.ok) {
          const data = (await resp.json()) as { projects: ProjectItem[] };
          setFilteredProjects(data.projects);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError' && portfolio?.projects) {
          setFilteredProjects(portfolio.projects);
        }
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [domain, query, portfolio]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <section id="projects" className="border-b border-stone-200 dark:border-zinc-800">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-zinc-400">
              02. Selected Work
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl dark:text-zinc-50">
              Ideas in progress, backed by Python.
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-200/70 p-1 dark:bg-zinc-900">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDomain(tab.id)}
                  className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    domain === tab.id
                      ? 'bg-white text-stone-950 shadow-xs dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter via Python..."
                aria-label="Filter projects by keyword"
                className="min-h-[40px] w-full rounded-lg border border-stone-200 bg-white py-2 pr-3 pl-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none sm:w-48 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {loading && filteredProjects.length === 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">
              No projects matched &ldquo;{query}&rdquo; in this category.
            </p>
            <button
              type="button"
              onClick={() => {
                setDomain('all');
                setQuery('');
              }}
              className="mt-4 rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {filteredProjects.map((project) => {
              const imgUrl = PROJECT_IMAGES[project.id];
              const isBroken = brokenImages[project.id] || !imgUrl;
              return (
                <article
                  key={project.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-colors hover:border-stone-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 text-left dark:bg-zinc-950"
                  >
                    {!isBroken ? (
                      <img
                        src={imgUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenImages((prev) => ({ ...prev, [project.id]: true }))
                        }
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-200 to-stone-100 p-6 dark:from-zinc-900 dark:to-zinc-800">
                        <span className="font-display text-lg font-semibold text-stone-700 dark:text-zinc-200">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </button>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between gap-4 text-xs text-stone-500 dark:text-zinc-400">
                        <span>
                          {project.index} · {project.category}
                        </span>
                        <span className="font-mono">{project.metricsLabel}</span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-stone-950 dark:text-zinc-50">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
                        {project.summary}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-4 dark:border-zinc-800">
                      <span className="text-xs text-stone-500 dark:text-zinc-400">
                        {project.skillsUsed.join(' · ')}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="text-xs font-medium text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onLaunchAnalyzer(project.analyzerKey)}
                          className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                        >
                          <span>Run Python Solver</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] w-full bg-stone-100 dark:bg-zinc-950">
              {PROJECT_IMAGES[selectedProject.id] && !brokenImages[selectedProject.id] && (
                <img
                  src={PROJECT_IMAGES[selectedProject.id]}
                  alt={selectedProject.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm hover:bg-white dark:bg-zinc-900/90 dark:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs font-medium text-stone-500 dark:text-zinc-400">
                {selectedProject.index} · {selectedProject.category} · {selectedProject.metricsLabel}
              </p>
              <h3
                id="project-modal-title"
                className="mt-2 font-display text-2xl font-bold text-stone-950 dark:text-zinc-50"
              >
                {selectedProject.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
                {selectedProject.summary}
              </p>
              <p className="mt-4 text-xs text-stone-500 dark:text-zinc-400">
                Stack: {selectedProject.skillsUsed.join(' · ')}
              </p>
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-stone-100 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="rounded-lg border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const key = selectedProject.analyzerKey;
                    setSelectedProject(null);
                    onLaunchAnalyzer(key);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <span>Open in Python Lab</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
