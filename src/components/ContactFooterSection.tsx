import { useEffect, useState } from 'react';
import { ArrowUpRight, Send } from 'lucide-react';
import type { EnquiryRecord, PortfolioData } from '../types/portfolio';

interface ContactFooterSectionProps {
  portfolio: PortfolioData | null;
}

export function ContactFooterSection({ portfolio }: ContactFooterSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<EnquiryRecord[]>([]);

  async function loadEnquiries() {
    try {
      const resp = await fetch('/api/contact');
      if (resp.ok) {
        const data = (await resp.json()) as { enquiries: EnquiryRecord[] };
        setRecentEnquiries(data.enquiries || []);
      }
    } catch {
      // ignore transient load failure
    }
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await resp.json()) as {
        ok?: boolean;
        record?: EnquiryRecord;
        errors?: string[];
      };

      if (!resp.ok || !data.ok) {
        setFeedback({
          ok: false,
          text: data.errors?.join(' ') || 'Please check the form fields and try again.',
        });
      } else {
        setFeedback({
          ok: true,
          text: `Processed by Python backend and categorized under "${data.record?.category}".`,
        });
        setName('');
        setEmail('');
        setMessage('');
        await loadEnquiries();
      }
    } catch (err) {
      setFeedback({ ok: false, text: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer id="contact" className="bg-stone-100/70 dark:bg-zinc-950">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-zinc-400">
              06. Get in Touch
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl dark:text-zinc-50">
              Have an idea? Let&apos;s connect.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-zinc-400">
              Messages submitted here are validated, classified, and logged directly by the Python
              enquiry processor.
            </p>

            {recentEnquiries.length > 0 && (
              <div className="mt-8 border-t border-stone-200 pt-6 dark:border-zinc-800">
                <h3 className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                  Recent Python-Processed Enquiries ({recentEnquiries.length})
                </h3>
                <div className="mt-3 space-y-3">
                  {recentEnquiries.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-stone-200 bg-white p-3.5 text-xs dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between gap-2 font-medium text-stone-900 dark:text-zinc-100">
                        <span>{item.name}</span>
                        <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-stone-600 dark:text-zinc-400">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium text-stone-700 dark:text-zinc-300">
                  Your name
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1.5 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>

                <label className="block text-xs font-medium text-stone-700 dark:text-zinc-300">
                  Your email
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
              </div>

              <label className="mt-4 block text-xs font-medium text-stone-700 dark:text-zinc-300">
                Message
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a project idea, research topic, or collaboration note..."
                  className="mt-1.5 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submitting ? 'Processing...' : 'Submit via Python Backend'}</span>
                </button>

                {feedback && (
                  <p
                    className={`text-xs font-medium ${
                      feedback.ok
                        ? 'text-emerald-800 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6 text-xs text-stone-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>© {new Date().getFullYear()} Amulya R · Bengaluru, India</span>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={portfolio?.profile.githubUrl ?? 'https://github.com/amulyaravi91-sudo/amulya-portfolio'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stone-950 dark:hover:text-zinc-100"
            >
              <span>GitHub Repository</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href={portfolio?.profile.liveUrl ?? 'https://amulyaravi91-sudo.github.io/amulya-portfolio/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stone-950 dark:hover:text-zinc-100"
            >
              <span>GitHub Pages Site</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a href="#top" className="hover:text-stone-950 dark:hover:text-zinc-100">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
