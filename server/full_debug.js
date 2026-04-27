import scrapeModule from 'website-scraper';
import PuppeteerPluginModule from 'website-scraper-puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveDependency(module) {
    if (typeof module === 'function') return module;
    if (module && typeof module === 'object' && module.default && typeof module.default === 'function') return module.default;
    return module;
}

const scrape = resolveDependency(scrapeModule);
const PuppeteerPlugin = resolveDependency(PuppeteerPluginModule);

async function test() {
    const siteDir = path.join(__dirname, 'outputs', 'test-' + Date.now());
    console.log('Target directory:', siteDir);
    
    try {
        const options = {
            urls: ['https://example.com'],
            directory: siteDir,
            plugins: [
                new PuppeteerPlugin({
                    launchOptions: { headless: true }
                })
            ]
        };

        console.log('Starting scrape...');
        await scrape(options);
        console.log('Scrape SUCCESS');
    } catch (err) {
        console.log('--- ERROR LOG ---');
        console.log('Message:', err.message);
        console.log('Stack:', err.stack);
        console.log('Full Error:', JSON.stringify(err, null, 2));
    }
}

test();
