import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSV from src/data
const csvPath = path.join(__dirname, '..', 'src', 'data', 'poem_rhyme_game.csv');
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

function toCSVField(value) {
	if (!value) return '';
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return '"' + value.replace(/"/g, '""') + '"';
	}
	return value;
}

const lines = csvContent.split('\n');
const headers = parseCSVLine(lines[0]);
const dataLines = lines.slice(1).filter(line => line.trim());

// Find column indices
const slugIndex = headers.indexOf('poem_slug');
const linkIndex = headers.indexOf('poem_link');
const titleIndex = headers.indexOf('poem_title');
const authorIndex = headers.indexOf('author_name');

console.log(`Headers: ${headers.join(', ')}`);
console.log(`Slug index: ${slugIndex}, Link index: ${linkIndex}`);

// Known links for poems
const knownLinks = {
	'alfred-lord-tennyson-in-memoriam-ahh-1849': 'https://poets.org/poem/memoriam-h-h-obiit-mdcccxxxiii-27',
	'alfred-lord-tennyson-ulysses': 'https://www.poetryfoundation.org/poems/45392/ulysses',
	'allen-ginsberg-howl': 'https://www.poetryfoundation.org/poems/49303/howl',
	'allen-ginsberg-a-supermarket-in-california': 'https://www.poetryfoundation.org/poems/47660/a-supermarket-in-california',
	'andrew-marvell-to-his-coy-mistress': 'https://www.poetryfoundation.org/poems/44688/to-his-coy-mistress',
	'anne-bradstreet-to-my-dear-and-loving-husband': 'https://www.poetryfoundation.org/poems/43701/to-my-dear-and-loving-husband',
	'ben-jonson-to-the-memory-of-my-beloved-the-author-mr-william-shakespeare': 'https://www.poetryfoundation.org/poems/44466/to-the-memory-of-my-beloved-the-author-mr-william-shakespeare',
	'billy-collins-snow-day': 'https://www.poetryfoundation.org/poems/46712/snow-day',
	'billy-collins-cheerios': 'https://poets.org/poem/cheerios',
	'charles-bukowski-bluebird': 'https://www.poetryfoundation.org/poems/58881/bluebird-56d23d653d4e8',
	'christina-rossetti-goblin-market': 'https://www.poetryfoundation.org/poems/44996/goblin-market',
	'claude-mckay-if-we-must-die': 'https://www.poetryfoundation.org/poems/44694/if-we-must-die',
	'ee-cummings-little-tree': 'https://www.poetryfoundation.org/poems/47252/little-tree',
	'ee-cummings-anyone-lived-in-a-pretty-how-town': 'https://www.poetryfoundation.org/poems/47249/anyone-lived-in-a-pretty-how-town',
	'edgar-allen-poe-annabel-lee': 'https://www.poetryfoundation.org/poems/44885/annabel-lee',
	'edgar-allen-poe-the-raven': 'https://www.poetryfoundation.org/poems/48860/the-raven',
	'edna-st-vincent-millay-first-fig': 'https://www.poetryfoundation.org/poems/44245/first-fig',
	'edna-st-vincent-millay-what-lips-my-lips-have-kissed-and-where-and-why': 'https://www.poetryfoundation.org/poems/44250/what-lips-my-lips-have-kissed-and-where-and-why',
	'elizabeth-barrett-browning-how-do-i-love-thee-sonnet-43': 'https://www.poetryfoundation.org/poems/43742/sonnets-from-the-portuguese-43-how-do-i-love-thee-let-me-count-the-ways',
	'elizabeth-bishop-one-art': 'https://www.poetryfoundation.org/poems/47536/one-art',
	'emily-dickinson-im-nobody-who-are-you-260': 'https://www.poetryfoundation.org/poems/52391/im-nobody-who-are-you-260',
	'emily-dickinson-i-heard-a-fly-buzz---when-i-died-': 'https://www.poetryfoundation.org/poems/45703/i-heard-a-fly-buzz-when-i-died-591',
	'emily-dickinson-hope-is-the-thing-with-feathers': 'https://www.poetryfoundation.org/poems/42889/hope-is-the-thing-with-feathers-314',
	'ernest-dowson-vitae-summa-brevis-spem-nos-vetat-incohare-longam': 'https://www.poetryfoundation.org/poems/50437/vitae-summa-brevis-spem-nos-vetat-incohare-longam',
	'ezra-pound-in-a-station-of-the-metro': 'https://www.poetryfoundation.org/poetrymagazine/poems/12675/in-a-station-of-the-metro',
	'geoffrey-chaucer-the-canterbury-tales-prologue': 'https://www.poetryfoundation.org/poems/43926/the-canterbury-tales-general-prologue',
	'gerard-manley-hopkins-gods-grandeur': 'https://www.poetryfoundation.org/poems/44395/gods-grandeur',
	'gertrude-stein-sacred-emily': 'https://www.poetryfoundation.org/poems/52389/sacred-emily',
	'gwendolyn-brooks-we-real-cool': 'https://www.poetryfoundation.org/poetrymagazine/poems/28112/we-real-cool',
	'gwendolyn-brooks-the-bean-eaters': 'https://www.poetryfoundation.org/poems/43315/the-bean-eaters',
	'henry-wadsworth-longfellow-the-song-of-hiawatha': 'https://www.poetryfoundation.org/poems/44641/the-song-of-hiawatha',
	'john-donne-a-valediction-forbidding-mourning': 'https://www.poetryfoundation.org/poems/44131/a-valediction-forbidding-mourning',
	'john-donne-holy-sonnets-death-be-not-proud': 'https://www.poetryfoundation.org/poems/44107/holy-sonnets-death-be-not-proud',
	'john-keats-ode-on-a-grecian-urn': 'https://www.poetryfoundation.org/poems/44477/ode-on-a-grecian-urn',
	'john-milton-on-the-morning-of-christs-nativity': 'https://www.poetryfoundation.org/poems/44733/on-the-morning-of-christs-nativity',
	'john-milton-paradise-lost-book-1': 'https://www.poetryfoundation.org/poems/45718/paradise-lost-book-1-1674-version',
	'khalil-gibran-on-marriage': 'https://www.poetryfoundation.org/poems/148575/on-marriage-5bff1992e5829',
	'langston-hughes-harlem': 'https://www.poetryfoundation.org/poems/46548/harlem',
	'langston-hughes-the-weary-blues': 'https://www.poetryfoundation.org/poems/47347/the-weary-blues',
	'lewis-carroll-the-jabberwocky': 'https://www.poetryfoundation.org/poems/42916/jabberwocky',
	'lord-byron-she-walks-in-beauty': 'https://www.poetryfoundation.org/poems/43844/she-walks-in-beauty',
	'maya-angelou-still-i-rise': 'https://www.poetryfoundation.org/poems/46446/still-i-rise',
	'paul-laurence-dunbar-we-wear-the-mask': 'https://www.poetryfoundation.org/poems/44203/we-wear-the-mask',
	'percy-shelley-ozymandias': 'https://www.poetryfoundation.org/poems/46565/ozymandias',
	'robert-browning-my-last-duchess': 'https://www.poetryfoundation.org/poems/43768/my-last-duchess',
	'robert-frost-stopping-by-woods-on-a-snowy-evening': 'https://www.poetryfoundation.org/poems/42891/stopping-by-woods-on-a-snowy-evening',
	'robert-frost-mending-wall': 'https://www.poetryfoundation.org/poems/44266/mending-wall',
	'robert-frost-the-road-not-taken': 'https://www.poetryfoundation.org/poems/44272/the-road-not-taken',
	'samuel-taylor-coleridge-kubla-khan': 'https://www.poetryfoundation.org/poems/43991/kubla-khan',
	'sylvia-plath-lady-lazarus': 'https://www.poetryfoundation.org/poems/49000/lady-lazarus',
	'sylvia-plath-daddy': 'https://www.poetryfoundation.org/poems/48999/daddy-56d22aafa45b2',
	'ts-eliot-the-hollow-men': 'https://www.poetryfoundation.org/poems/46561/the-hollow-men',
	'ts-eliot-the-love-song-of-j-alfred-prufrock': 'https://www.poetryfoundation.org/poetrymagazine/poems/44212/the-love-song-of-j-alfred-prufrock',
	'ts-eliot-the-waste-land': 'https://www.poetryfoundation.org/poems/47311/the-waste-land',
	'wh-auden-twelve-songs-ix': 'https://poets.org/poem/twelve-songs-ix',
	'wh-auden-musée-des-beaux-arts': 'https://poets.org/poem/musee-des-beaux-arts',
	'wallace-stevens-anecdote-of-the-jar': 'https://www.poetryfoundation.org/poems/46729/anecdote-of-the-jar',
	'walt-whitman-song-of-myself': 'https://www.poetryfoundation.org/poems/45477/song-of-myself-1892-version',
	'walt-whitman-o-captain-my-captain': 'https://www.poetryfoundation.org/poems/45474/o-captain-my-captain',
	'william-blake-the-tyger': 'https://www.poetryfoundation.org/poems/43687/the-tyger',
	'william-blake-the-lamb': 'https://www.poetryfoundation.org/poems/43670/the-lamb',
	'william-butler-yeats-the-second-coming': 'https://www.poetryfoundation.org/poems/43290/the-second-coming',
	'william-butler-yeats-sailing-to-byzantium': 'https://www.poetryfoundation.org/poems/43291/sailing-to-byzantium',
	'william-butler-yeats-easter-1916': 'https://www.poetryfoundation.org/poems/43289/easter-1916',
	'william-carlos-williams-the-red-wheelbarrow': 'https://www.poetryfoundation.org/poems/45502/the-red-wheelbarrow',
	'william-shakespeare-sonnet-97-how-like-a-winter-hath-my-absence-been': 'https://www.poetryfoundation.org/poems/45107/sonnet-97-how-like-a-winter-hath-my-absence-been',
	'william-shakespeare-shall-i-compare-thee-to-a-summers-day': 'https://www.poetryfoundation.org/poems/45087/sonnet-18-shall-i-compare-thee-to-a-summers-day',
	'william-wordsworth-i-wandered-lonely-as-a-cloud': 'https://www.poetryfoundation.org/poems/45521/i-wandered-lonely-as-a-cloud',
	'mary-oliver-wild-geese': 'https://www.poetryfoundation.org/poems/58880/wild-geese-56d222a04e8ec',
	'seamus-heaney-digging': 'https://www.poetryfoundation.org/poems/47555/digging',
	'dylan-thomas-do-not-go-gentle-into-that-good-night': 'https://poets.org/poem/do-not-go-gentle-good-night',
	'philip-larkin-this-be-the-verse': 'https://www.poetryfoundation.org/poems/48419/this-be-the-verse',
	'lucille-clifton-homage-to-my-hips': 'https://www.poetryfoundation.org/poems/49487/homage-to-my-hips',
	'li-young-lee-persimmons': 'https://www.poetryfoundation.org/poems/43011/persimmons',
	'wh-auden-in-memory-of-w-b-yeats': 'https://poets.org/poem/memory-w-b-yeats',
	'robert-hayden-those-winter-sundays': 'https://www.poetryfoundation.org/poems/46461/those-winter-sundays',
	'ted-hughes-the-thought-fox': 'https://www.poetryfoundation.org/poems/52775/the-thought-fox',
	'danez-smith-dear-white-america': 'https://www.poetryfoundation.org/poems/141850/dear-white-america',
	'amanda-gorman-the-hill-we-climb': 'https://www.poetryfoundation.org/poems/157338/the-hill-we-climb',
	'adrienne-rich-aunt-jennifers-tigers': 'https://www.poetryfoundation.org/poems/53010/aunt-jennifers-tigers',
	'tupac-shakur-the-rose-that-grew-from-concrete': 'https://allpoetry.com/The-Rose-That-Grew-From-Concrete',
	'shel-silverstein-falling-up': 'https://www.poetryfoundation.org/poets/shel-silverstein',
	'sappho-i-asked-myself': 'https://www.poetryfoundation.org/poets/sappho',
	'rupi-kaur-milk-and-honey': 'https://www.rupikaur.com/',
};

// Process and update CSV - preserving ALL columns
async function updateCSV() {
	const updatedLines = [lines[0]]; // Keep header exactly as is
	let updatedCount = 0;
	const notFound = new Set();

	for (const line of dataLines) {
		const values = parseCSVLine(line);
		const slug = values[slugIndex];
		const currentLink = values[linkIndex];

		if (!currentLink || currentLink.trim() === '') {
			// Try to find link
			if (knownLinks[slug]) {
				values[linkIndex] = knownLinks[slug];
				updatedCount++;
				console.log(`✓ Added link for: ${values[titleIndex]} (${slug})`);
			} else {
				notFound.add(`${values[authorIndex]} - ${values[titleIndex]}`);
			}
		}

		// Reconstruct CSV line preserving all columns
		const newLine = values.map(v => toCSVField(v)).join(',');
		updatedLines.push(newLine);
	}

	// Write updated CSV
	fs.writeFileSync(csvPath, updatedLines.join('\n'));

	console.log(`\n========== SUMMARY ==========`);
	console.log(`Updated ${updatedCount} rows with new links`);
	console.log(`Still missing: ${notFound.size} poems`);

	if (notFound.size > 0) {
		console.log('\n--- STILL MISSING ---');
		notFound.forEach(p => console.log(`  ${p}`));
	}
}

updateCSV();
