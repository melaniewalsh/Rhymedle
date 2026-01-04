import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSV
const csvPath = path.join(__dirname, '..', 'poem_rhyme_game.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV (handle quoted fields with commas)
function parseCSVLine(line) {
	const result = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === ',' && !inQuotes) {
			result.push(current);
			current = '';
		} else {
			current += char;
		}
	}
	result.push(current);
	return result;
}

const lines = csvContent.split('\n').filter(line => line.trim());
const headers = parseCSVLine(lines[0]);
const rows = lines.slice(1).map(line => {
	const values = parseCSVLine(line);
	const obj = {};
	headers.forEach((header, i) => {
		obj[header] = values[i] || '';
	});
	return obj;
});

// Get unique poem links
const uniquePoems = new Map();
for (const row of rows) {
	const key = row.poem_slug;
	if (!uniquePoems.has(key)) {
		uniquePoems.set(key, {
			slug: row.poem_slug,
			author: row.author_name,
			csvTitle: row.poem_title,
			link: row.poem_link
		});
	}
}

console.log(`Found ${uniquePoems.size} unique poems\n`);

// Function to fetch and extract title from a URL
async function fetchTitle(url) {
	if (!url || url.trim() === '') {
		return { error: 'No URL provided' };
	}

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
			}
		});

		if (!response.ok) {
			return { error: `HTTP ${response.status}` };
		}

		const html = await response.text();

		// Try to extract title from various patterns
		let scrapedTitle = null;

		// Poetry Foundation - look for the poem title in h1
		if (url.includes('poetryfoundation.org')) {
			const h1Match = html.match(/<h1[^>]*class="[^"]*c-hdgSans[^"]*"[^>]*>([^<]+)<\/h1>/i);
			if (h1Match) {
				scrapedTitle = h1Match[1].trim();
			} else {
				// Fallback to title tag
				const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
				if (titleMatch) {
					scrapedTitle = titleMatch[1].replace(/\s*\|.*$/, '').replace(/\s*by\s+.*$/i, '').trim();
				}
			}
		}
		// Poets.org
		else if (url.includes('poets.org')) {
			// Look for the poem title in the page
			const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
			if (h1Match) {
				scrapedTitle = h1Match[1].trim();
			} else {
				const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
				if (titleMatch) {
					scrapedTitle = titleMatch[1].replace(/\s*\|.*$/, '').replace(/\s*by\s+.*$/i, '').trim();
				}
			}
		}
		// Generic fallback
		else {
			const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
			if (titleMatch) {
				scrapedTitle = titleMatch[1].replace(/\s*\|.*$/, '').replace(/\s*-\s*.*$/, '').trim();
			}
		}

		return { title: scrapedTitle, status: response.status };
	} catch (err) {
		return { error: err.message };
	}
}

// Process poems with delay to avoid rate limiting
async function processPoems() {
	const results = [];
	const poems = Array.from(uniquePoems.values());

	let missingLinks = 0;
	let brokenLinks = 0;
	let titleMismatches = 0;
	let successful = 0;

	for (let i = 0; i < poems.length; i++) {
		const poem = poems[i];
		console.log(`[${i + 1}/${poems.length}] Checking: ${poem.csvTitle}`);

		if (!poem.link || poem.link.trim() === '') {
			console.log(`  -> MISSING LINK\n`);
			results.push({ ...poem, status: 'MISSING_LINK' });
			missingLinks++;
			continue;
		}

		const result = await fetchTitle(poem.link);

		if (result.error) {
			console.log(`  -> ERROR: ${result.error}\n`);
			results.push({ ...poem, status: 'ERROR', error: result.error });
			brokenLinks++;
		} else if (result.title) {
			const csvTitleNorm = poem.csvTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
			const scrapedTitleNorm = result.title.toLowerCase().replace(/[^\w\s]/g, '').trim();

			if (csvTitleNorm !== scrapedTitleNorm && !scrapedTitleNorm.includes(csvTitleNorm) && !csvTitleNorm.includes(scrapedTitleNorm)) {
				console.log(`  -> MISMATCH`);
				console.log(`     CSV:     "${poem.csvTitle}"`);
				console.log(`     Scraped: "${result.title}"\n`);
				results.push({ ...poem, status: 'MISMATCH', scrapedTitle: result.title });
				titleMismatches++;
			} else {
				console.log(`  -> OK (${result.title})\n`);
				results.push({ ...poem, status: 'OK', scrapedTitle: result.title });
				successful++;
			}
		} else {
			console.log(`  -> Could not extract title\n`);
			results.push({ ...poem, status: 'NO_TITLE' });
		}

		// Rate limiting - wait 500ms between requests
		if (i < poems.length - 1) {
			await new Promise(resolve => setTimeout(resolve, 500));
		}
	}

	// Summary
	console.log('\n========== SUMMARY ==========');
	console.log(`Total poems: ${poems.length}`);
	console.log(`Successful: ${successful}`);
	console.log(`Missing links: ${missingLinks}`);
	console.log(`Broken links: ${brokenLinks}`);
	console.log(`Title mismatches: ${titleMismatches}`);

	// List problems
	if (missingLinks > 0) {
		console.log('\n--- MISSING LINKS ---');
		results.filter(r => r.status === 'MISSING_LINK').forEach(r => {
			console.log(`  ${r.author} - ${r.csvTitle}`);
		});
	}

	if (brokenLinks > 0) {
		console.log('\n--- BROKEN LINKS ---');
		results.filter(r => r.status === 'ERROR').forEach(r => {
			console.log(`  ${r.csvTitle}: ${r.link}`);
			console.log(`    Error: ${r.error}`);
		});
	}

	if (titleMismatches > 0) {
		console.log('\n--- TITLE MISMATCHES ---');
		results.filter(r => r.status === 'MISMATCH').forEach(r => {
			console.log(`  CSV:     "${r.csvTitle}"`);
			console.log(`  Scraped: "${r.scrapedTitle}"`);
			console.log(`  Link:    ${r.link}\n`);
		});
	}

	return results;
}

processPoems();
