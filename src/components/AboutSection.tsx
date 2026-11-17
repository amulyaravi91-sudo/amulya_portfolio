import type { PortfolioData } from '../types/portfolio';

interface AboutSectionProps {
  portfolio: PortfolioData | null;
}

export function AboutSection({ portfolio }: AboutSectionProps) {
  const pillars = portfolio?.profile.pillars ?? [
    {
      index: '01',
      title: 'Learn with curiosity',
      detail: 'Explore new mathematical models, algorithms, and developer tools.',
    },
    {
      index: '02',
      title: 'Build with purpose',
      detail: 'Turn academic concepts into testable Python data pipelines.',
    },
    {
      index: '03',
      title: 'Grow consistently',
      detail: 'Refine code quality, documentation, and fundamentals step by step.',
    },
  ];

  return (
    <section id="about" className="border-b border-stone-200 dark:border-zinc-800">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-zinc-400">
              01. About Me
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl dark:text-zinc-50">
              Not just learning technology. Exploring what&apos;s possible.
            </h2>
          </div>

          <div className="lg:col-span-7">
            <p className="text-base leading-relaxed text-stone-700 dark:text-zinc-300">
              {portfolio?.profile.bioLead ??
                "I'm Amulya R, a B.Tech student at Jain University specializing in Computer Science and Engineering (Artificial Intelligence & Machine Learning)."}
            </p>
            <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-zinc-400">
              {portfolio?.profile.bioBody ??
                'I enjoy discovering how technology works, strengthening my fundamentals in mathematics and programming, and turning curious questions into real Python-backed systems.'}
            </p>

            <div className="mt-10 grid gap-6 border-t border-stone-200 pt-8 sm:grid-cols-3 dark:border-zinc-800">
              {pillars.map((pillar) => (
                <div key={pillar.index}>
                  <span className="font-mono text-xs font-medium text-emerald-800 dark:text-emerald-400">
                    {pillar.index}
                  </span>
                  <h3 className="mt-2 font-display text-base font-bold text-stone-950 dark:text-zinc-100">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-zinc-400">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
