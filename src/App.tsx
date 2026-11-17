/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { TopBar, type WorkspaceTab } from './components/TopBar';
import { PythonLabSection, type LabTab } from './components/PythonLabSection';
import { RepoSyncSection } from './components/RepoSyncSection';
import { ContactFooterSection } from './components/ContactFooterSection';
import type { PortfolioData, RepoLanguageReport } from './types/portfolio';

export default function App() {
  const [activeView, setActiveView] = useState<WorkspaceTab>('original');
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [repoReport, setRepoReport] = useState<RepoLanguageReport | null>(null);
  const [activeLabTab, setActiveLabTab] = useState<LabTab>('food');

  const loadPortfolio = useCallback(async () => {
    try {
      const resp = await fetch('/api/portfolio');
      if (resp.ok) {
        setPortfolio((await resp.json()) as PortfolioData);
      }
    } catch {
      // Handled gracefully
    }
  }, []);

  const loadRepoLanguages = useCallback(async () => {
    try {
      const resp = await fetch('/api/github/languages');
      if (resp.ok) {
        setRepoReport((await resp.json()) as RepoLanguageReport);
      }
    } catch {
      // Handled gracefully
    }
  }, []);

  useEffect(() => {
    loadPortfolio();
    loadRepoLanguages();
  }, [loadPortfolio, loadRepoLanguages]);

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#141715]">
      <TopBar activeView={activeView} onSelectView={setActiveView} />

      {activeView === 'original' && (
        <main className="h-[calc(100vh-61px)] w-full">
          <iframe
            src="/portfolio/index.html"
            title="Amulya R Original Portfolio Website"
            className="h-full w-full border-0"
          />
        </main>
      )}

      {activeView === 'python-lab' && (
        <main>
          <PythonLabSection activeTab={activeLabTab} onChangeTab={setActiveLabTab} />
          <ContactFooterSection portfolio={portfolio} />
        </main>
      )}

      {activeView === 'repo-sync' && (
        <main>
          <RepoSyncSection repoReport={repoReport} onRefreshRepo={loadRepoLanguages} />
          <ContactFooterSection portfolio={portfolio} />
        </main>
      )}
    </div>
  );
}
