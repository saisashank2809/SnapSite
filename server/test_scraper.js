const scrape = require('website-scraper');
let PuppeteerPlugin = require('website-scraper-puppeteer');

console.log('--- Debug Info ---');
console.log('PuppeteerPlugin raw type:', typeof PuppeteerPlugin);
console.log('PuppeteerPlugin raw keys:', Object.keys(PuppeteerPlugin));

if (PuppeteerPlugin && typeof PuppeteerPlugin === 'object' && PuppeteerPlugin.default) {
    console.log('Detected ESM-style export, using .default');
    PuppeteerPlugin = PuppeteerPlugin.default;
}

console.log('PuppeteerPlugin final type:', typeof PuppeteerPlugin);

async function test() {
    try {
        console.log('Attempting to instantiate PuppeteerPlugin...');
        const plugin = new PuppeteerPlugin({
            launchOptions: { headless: true }
        });
        console.log('Success: Plugin instantiated');
        
        console.log('Attempting to run scrape...');
        // Use a dummy directory
        const testDir = './test_scrape_' + Date.now();
        await scrape({
            urls: ['https://example.com'],
            directory: testDir,
            plugins: [plugin]
        });
        console.log('Success: Scrape completed');
    } catch (err) {
        console.error('FAILED with error:');
        console.error(err);
    }
}

test();
