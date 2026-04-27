import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import scrapeModule from 'website-scraper';
import PuppeteerPluginModule from 'website-scraper-puppeteer';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hyper-defensive Constructor Resolver
function resolveDependency(module) {
    if (typeof module === 'function') return module;
    if (module && typeof module === 'object' && module.default && typeof module.default === 'function') return module.default;
    if (module && typeof module === 'object' && module.PuppeteerPlugin && typeof module.PuppeteerPlugin === 'function') return module.PuppeteerPlugin;
    return module;
}

const scrape = resolveDependency(scrapeModule);
const PuppeteerPlugin = resolveDependency(PuppeteerPluginModule);

console.log('--- DEFENSIVE INITIALIZATION ---');
console.log('scrape type:', typeof scrape);
console.log('PuppeteerPlugin type:', typeof PuppeteerPlugin);

// Top-level instantiation test to catch errors immediately on startup
try {
    console.log('Testing PuppeteerPlugin constructor...');
    const testPlugin = new PuppeteerPlugin({ launchOptions: { headless: true } });
    console.log('Success: PuppeteerPlugin is a valid constructor.');
} catch (e) {
    console.error('CRITICAL: PuppeteerPlugin is NOT a constructor!', e.message);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const jobs = new Map();
const OUTPUT_DIR = path.join(__dirname, 'outputs');
fs.ensureDirSync(OUTPUT_DIR);

app.post('/api/extract', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const jobId = uuidv4();
    const jobDir = path.join(OUTPUT_DIR, jobId);
    const siteDir = path.join(jobDir, 'site');
    const zipPath = path.join(jobDir, 'extraction.zip');

    jobs.set(jobId, { status: 'processing', progress: 0, url });
    res.json({ jobId });

    try {
        // website-scraper will create this directory; it must not exist beforehand


        console.log(`Starting extraction for: ${url}`);
        
        const options = {
            urls: [url],
            directory: siteDir,
            plugins: [
                new PuppeteerPlugin({
                    launchOptions: { 
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
                    },
                    scrollToBottom: { timeout: 10000, viewportN: 10 }
                })
            ],
            recursive: false,
            requestConcurrency: 5
        };

        await scrape(options);

        // ZIP formatting
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            jobs.set(jobId, { status: 'completed', progress: 100, url, downloadUrl: `/api/download/${jobId}` });
        });

        archive.on('error', (err) => { throw err; });

        archive.pipe(output);
        archive.directory(siteDir, false);
        await archive.finalize();

    } catch (error) {
        console.error('Extraction error:', error);
        jobs.set(jobId, { status: 'failed', error: error.message });
    }
});

app.get('/api/status/:jobId', (req, res) => {
    const job = jobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

app.get('/api/download/:jobId', (req, res) => {
    const zipPath = path.join(OUTPUT_DIR, req.params.jobId, 'extraction.zip');
    if (fs.existsSync(zipPath)) {
        res.download(zipPath, 'extracted-site.zip');
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(PORT, () => {
    console.log(`\n✅ Server (Defensive ESM) running on http://localhost:${PORT}`);
});
