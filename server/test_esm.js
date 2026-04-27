import PuppeteerPlugin from 'website-scraper-puppeteer';
import * as RawPuppeteerPlugin from 'website-scraper-puppeteer';

console.log('--- ESM Debug Info ---');
console.log('Default Import type:', typeof PuppeteerPlugin);
console.log('Default Import keys:', Object.keys(PuppeteerPlugin || {}));
console.log('Namespace Import keys:', Object.keys(RawPuppeteerPlugin));

try {
    console.log('Attempting instantiation of Default Import...');
    const instance = new PuppeteerPlugin();
    console.log('Success!');
} catch (e) {
    console.log('FAILED Default Import instantiation:', e.message);
    if (PuppeteerPlugin.default) {
        console.log('Found .default on Default Import, trying that...');
        try {
            const instance2 = new PuppeteerPlugin.default();
            console.log('Success with .default!');
        } catch (e2) {
            console.log('FAILED .default instantiation:', e2.message);
        }
    }
}
