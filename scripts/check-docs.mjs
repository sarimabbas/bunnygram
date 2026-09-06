import fs from 'node:fs';
import assert from 'node:assert/strict';

const docs = new URL('../packages/docs/', import.meta.url);
const output = new URL('out/', docs);
const pages = fs.readdirSync(new URL('pages/', docs), { recursive: true }).filter(p => p.endsWith('.mdx'));
for (const page of pages) {
  const route = page.replace(/\.mdx$/, '');
  const html = fs.readFileSync(new URL(route + '.html', output), 'utf8');
  assert(html.includes('Bunnygram is no longer maintained'), `Missing archive notice: ${route}`);
  assert(html.includes('https://bunnygram.lil.run'), `Missing new origin: ${route}`);
}
let references = 0;
for (const file of fs.readdirSync(output, { recursive: true }).filter(p => p.endsWith('.html'))) {
  const html = fs.readFileSync(new URL(file, output), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (match[1].startsWith('//')) continue;
    const url = decodeURI(match[1].split(/[?#]/)[0]).slice(1);
    assert([url, url + '.html', url + '/index.html'].some(p => fs.existsSync(new URL(p, output))), `${file}: missing ${url}`);
    references++;
  }
}
assert(fs.readFileSync(new URL('public/cover.png', docs)).equals(fs.readFileSync(new URL('cover.png', output))), 'Cover image changed');
console.log(`PASS: ${pages.length} documentation pages, ${references} local references, original cover image.`);
