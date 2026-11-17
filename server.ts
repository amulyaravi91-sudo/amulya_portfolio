import express from 'express';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function runPython(
  args: string[],
  stdinPayload?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      'python3',
      args,
      { cwd: __dirname, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve(stdout.trim());
      }
    );

    if (stdinPayload !== undefined && child.stdin) {
      child.stdin.write(stdinPayload);
      child.stdin.end();
    }
  });
}

async function runPythonJson(args: string[], stdinPayload?: string): Promise<unknown> {
  const out = await runPython(args, stdinPayload);
  return JSON.parse(out);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (_req, res) => {
    try {
      const pyVersion = await runPython(['--version']);
      res.json({ ok: true, runtime: 'express+python3', python: pyVersion });
    } catch (err) {
      res.status(500).json({ ok: false, error: (err as Error).message });
    }
  });

  app.get('/api/portfolio', async (_req, res) => {
    try {
      const data = await runPythonJson([
        '-m',
        'backend.engines.portfolio_processor',
        '--action',
        'summary',
      ]);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/portfolio/projects', async (req, res) => {
    try {
      const domain = String(req.query.domain || 'all');
      const query = String(req.query.q || '');
      const data = await runPythonJson([
        '-m',
        'backend.engines.portfolio_processor',
        '--action',
        'filter',
        '--domain',
        domain,
        '--query',
        query,
      ]);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/analyze/:analyzer', async (req, res) => {
    const analyzer = req.params.analyzer;
    if (!['food', 'traffic', 'aqi', 'ambulance'].includes(analyzer)) {
      res.status(400).json({ error: 'Unsupported analyzer' });
      return;
    }
    try {
      const data = await runPythonJson(
        ['-m', 'backend.engines.project_analytics', '--analyzer', analyzer, '--payload', '-'],
        JSON.stringify(req.body ?? {})
      );
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/contact', async (_req, res) => {
    try {
      const data = await runPythonJson([
        '-m',
        'backend.engines.contact_processor',
        '--action',
        'list',
      ]);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/contact', async (req, res) => {
    try {
      const data = (await runPythonJson(
        ['-m', 'backend.engines.contact_processor', '--action', 'submit', '--payload', '-'],
        JSON.stringify(req.body ?? {})
      )) as { ok?: boolean };
      res.status(data.ok ? 200 : 400).json(data);
    } catch (err) {
      res.status(500).json({ ok: false, errors: [(err as Error).message] });
    }
  });

  app.get('/api/github/languages', async (_req, res) => {
    try {
      const data = await runPythonJson([
        '-m',
        'backend.engines.repo_linguist',
        '--action',
        'analyze',
      ]);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/export/github-bundle.zip', async (_req, res) => {
    try {
      const outPath = path.join(__dirname, 'backend', 'data', 'amulya-portfolio-python-upgrade.zip');
      await runPythonJson([
        '-m',
        'backend.engines.repo_linguist',
        '--action',
        'bundle',
        '--out',
        outPath,
      ]);
      res.download(outPath, 'amulya-portfolio-python-upgrade.zip');
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/github/sync-status', (_req, res) => {
    res.json({
      tokenConfigured: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()),
      repository: 'amulyaravi91-sudo/amulya-portfolio',
    });
  });

  app.post('/api/github/sync', async (_req, res) => {
    const token = process.env.GITHUB_TOKEN?.trim();
    if (!token) {
      res.status(400).json({
        ok: false,
        message:
          'GITHUB_TOKEN is not configured in server secrets. Download the ready-to-upload Python ZIP bundle or add GITHUB_TOKEN to Secrets to push directly.',
      });
      return;
    }

    try {
      const owner = 'amulyaravi91-sudo';
      const repo = 'amulya-portfolio';
      const filesToSync: Array<{ repoPath: string; localPath: string }> = [
        { repoPath: 'backend/app.py', localPath: 'backend/app.py' },
        { repoPath: 'backend/requirements.txt', localPath: 'backend/requirements.txt' },
        { repoPath: 'backend/engines/__init__.py', localPath: 'backend/engines/__init__.py' },
        { repoPath: 'backend/engines/portfolio_processor.py', localPath: 'backend/engines/portfolio_processor.py' },
        { repoPath: 'backend/engines/project_analytics.py', localPath: 'backend/engines/project_analytics.py' },
        { repoPath: 'backend/engines/contact_processor.py', localPath: 'backend/engines/contact_processor.py' },
        { repoPath: 'backend/engines/repo_linguist.py', localPath: 'backend/engines/repo_linguist.py' },
        { repoPath: 'backend/tests/test_portfolio_backend.py', localPath: 'backend/tests/test_portfolio_backend.py' },
        { repoPath: 'backend/data/portfolio_raw.json', localPath: 'backend/data/portfolio_raw.json' },
        { repoPath: 'backend/data/portfolio_processed.json', localPath: 'backend/data/portfolio_processed.json' },
      ];

      // Ensure processed JSON is fresh before pushing
      await runPythonJson(['-m', 'backend.engines.portfolio_processor', '--action', 'process']);

      const updated: string[] = [];
      for (const file of filesToSync) {
        const absPath = path.join(__dirname, file.localPath);
        const contentB64 = fs.readFileSync(absPath).toString('base64');
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.repoPath}`;

        let existingSha: string | undefined;
        const getResp = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'amulya-portfolio-sync',
          },
        });
        if (getResp.ok) {
          const existing = (await getResp.json()) as { sha?: string };
          existingSha = existing.sha;
        }

        const putResp = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'amulya-portfolio-sync',
          },
          body: JSON.stringify({
            message: `feat(python): add/update ${file.repoPath} backend module`,
            content: contentB64,
            ...(existingSha ? { sha: existingSha } : {}),
          }),
        });

        if (!putResp.ok) {
          const errText = await putResp.text();
          throw new Error(`GitHub push failed for ${file.repoPath}: ${putResp.status} ${errText}`);
        }
        updated.push(file.repoPath);
      }

      res.json({ ok: true, updatedFiles: updated });
    } catch (err) {
      res.status(500).json({ ok: false, message: (err as Error).message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
