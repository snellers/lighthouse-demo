import {writeFileSync} from 'fs';
import puppeteer from 'puppeteer';
import * as pptrTestingLibrary from 'pptr-testing-library';
import {startFlow, desktopConfig} from 'lighthouse';

const {getDocument, queries} = pptrTestingLibrary;

async function search(page, elementPattern, searchTerm) {
        const $document = await getDocument(page);
        const $searchBox = await queries.getByPlaceholderText($document, elementPattern);
        await $searchBox.type(searchTerm);
        await Promise.all([
                $searchBox.press('Enter'),
                page.waitForNavigation({waitUntil: ['load', 'networkidle2']}),
        ]);
}

async function click(page, elementPattern) {
        await flow.navigate(async () => {
                const $document = await getDocument(page);
                const $links = await queries.getAllByText($document, elementPattern);
                $links[0].click();
        });
}

const browser = await puppeteer.launch();
const page = await browser.newPage();
const flow = await startFlow(page, {
     config: desktopConfig
});

console.log('Opening site...');
await flow.navigate('https://imdb.com');

await flow.startTimespan();
await search(page, /Search IMDb/, 'glengarry');
await flow.endTimespan();

await flow.snapshot();
await click(page, /glengarry glenross/i);

console.log('Writing report...');
writeFileSync('report.html', await flow.generateReport());

await browser.close();
console.log('Done!');
