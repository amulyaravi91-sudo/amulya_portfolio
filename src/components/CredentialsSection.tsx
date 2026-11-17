import { ArrowUpRight } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';

interface CredentialsSectionProps {
  portfolio: PortfolioData | null;
}

export function CredentialsSection({ portfolio }: CredentialsSectionProps) {
  const education = portfolio?.education;
  const skillMatrix = portfolio?.skillMatrix ?? [];
  const certificates = portfolio?.certificates ?? [];
  const interests = portfolio?.interests ?? [];

  return (
    <section id="credentials" className="border-b border-stone-200 dark:border-zinc-800">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left column: Education & Toolkit Matrix */}
          <div className="space-y-10 lg:col-span-7">
            <div>
              <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-zinc-400">
                04. Education &amp; Skill Matrix
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-950 dark:text-zinc-50">
                Foundations &amp; verified coursework.
              </h2>

              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                  {education?.status ?? 'Currently Pursuing'} · {education?.location ?? 'Bengaluru, India'}
                </div>
                <h3 className="mt-2 font-display text-xl font-bold text-stone-950 dark:text-zinc-100">
                  {education?.degree ?? 'Bachelor of Technology (B.Tech)'}
                </h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-zinc-300">
                  {education?.field ??
                    'Computer Science & Engineering — Specialization in Artificial Intelligence & Machine Learning'}
                </p>
                <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-zinc-100">
                  {education?.institution ?? 'Jain University'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-stone-950 dark:text-zinc-100">
                Python-Indexed Toolkit
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {skillMatrix.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-display text-base font-bold text-stone-950 dark:text-zinc-100">
                        {group.category}
                      </h4>
                      <span className="font-mono text-xs text-stone-500 tabular-nums dark:text-zinc-400">
                        {group.totalReferences} links
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-zinc-400">
                      {group.focus}
                    </p>
                    <div className="mt-3 text-xs font-medium text-stone-800 dark:text-zinc-200">
                      {group.items.map((item) => item.name).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Wolfram U Certificates & Research Interests */}
          <div className="space-y-10 lg:col-span-5">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-950 dark:text-zinc-100">
                Certificates
              </h3>
              <div className="mt-4 space-y-4">
                {certificates.map((cert) => (
                  <article
                    key={cert.id}
                    className="rounded-xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70"
                  >
                    <div className="text-xs text-stone-500 dark:text-zinc-400">
                      {cert.issuer} · {cert.date}
                    </div>
                    <h4 className="mt-1.5 font-display text-base font-bold text-stone-950 dark:text-zinc-100">
                      {cert.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-stone-600 dark:text-zinc-400">
                      {cert.topics.join(' · ')}
                    </p>
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
                    >
                      <span>View verified PDF</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-stone-950 dark:text-zinc-100">
                Areas of Curiosity
              </h3>
              <ul className="mt-4 divide-y divide-stone-200 border-y border-stone-200 dark:divide-zinc-800 dark:border-zinc-800">
                {interests.map((interest) => (
                  <li
                    key={interest}
                    className="py-3 text-sm font-medium text-stone-700 dark:text-zinc-300"
                  >
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
