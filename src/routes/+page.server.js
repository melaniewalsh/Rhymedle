import { readFileSync } from 'fs';
import { csvParse } from 'd3';

// Author image URLs (from literaturdle)
const authorImages = {
	'Alexander Pope': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Alexander_Pope_by_Michael_Dahl.jpg/330px-Alexander_Pope_by_Michael_Dahl.jpg',
	'Alfred Lord Tennyson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Alfred%2C_Lord_Tennyson_by_Elliott_%26_Fry_-_Original.jpg/330px-Alfred%2C_Lord_Tennyson_by_Elliott_%26_Fry_-_Original.jpg',
	'Robert Burns': 'https://poets.org/sites/default/files/images/biographies/rburns.jpg',
	'Edna St. Vincent Millay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Edna_St._Vincent_Millay_1933_by_Carl_van_Vechten_Retouched.jpg/330px-Edna_St._Vincent_Millay_1933_by_Carl_van_Vechten_Retouched.jpg',
	'Andrew Marvell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Portrait_of_Andrew_Marvell.jpg/330px-Portrait_of_Andrew_Marvell.jpg',
	'Anne Bradstreet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Frontispiece_for_An_Account_of_Anne_Bradstreet_The_Puritan_Poetess%2C_and_Kindred_Topics%2C_edited_by_Colonel_Luther_Caldwell_%28Boston%2C_1898%29_%28cropped%29.jpg/330px-Frontispiece_for_An_Account_of_Anne_Bradstreet_The_Puritan_Poetess%2C_and_Kindred_Topics%2C_edited_by_Colonel_Luther_Caldwell_%28Boston%2C_1898%29_%28cropped%29.jpg',
	'Ben Jonson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Benjamin_Jonson_by_Abraham_van_Blyenberch.jpg/330px-Benjamin_Jonson_by_Abraham_van_Blyenberch.jpg',
	'Billy Collins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Billy_Collins_2015.jpg/330px-Billy_Collins_2015.jpg',
	'Claude McKay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_McKay_James_L._Allen_Portrait_Edit.jpg/330px-Claude_McKay_James_L._Allen_Portrait_Edit.jpg',
	'Dylan Thomas': 'https://upload.wikimedia.org/wikipedia/en/b/bc/Dylan_Thomas_photo.jpg',
	'Edgar Allen Poe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Edgar_Allan_Poe%2C_circa_1849%2C_restored%2C_squared_off.jpg/330px-Edgar_Allan_Poe%2C_circa_1849%2C_restored%2C_squared_off.jpg',
	'E.E. Cummings': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/E._E._Cummings_NYWTS.jpg/330px-E._E._Cummings_NYWTS.jpg',
	'Elizabeth Barrett Browning': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Elizabeth_Barrett_Browning.jpg/330px-Elizabeth_Barrett_Browning.jpg',
	'Elizabeth Bishop': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Elizabeth_Bishop%2C_1934_yearbook_portrait.jpg/330px-Elizabeth_Bishop%2C_1934_yearbook_portrait.jpg',
	'Emily Dickinson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Black-white_photograph_of_Emily_Dickinson2.png/330px-Black-white_photograph_of_Emily_Dickinson2.png',
	'Ernest Dowson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ernest_Dowson.jpg/330px-Ernest_Dowson.jpg',
	'Ezra Pound': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Ezra_Pound_by_Alvin_Langdon_Coburn%2C_1913.jpg/330px-Ezra_Pound_by_Alvin_Langdon_Coburn%2C_1913.jpg',
	'Geoffrey Chaucer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Chaucer_manuscrit_portrait_%28d%C3%A9tail%29.jpeg/330px-Chaucer_manuscrit_portrait_%28d%C3%A9tail%29.jpeg',
	'Gerard Manley Hopkins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/GerardManleyHopkins.jpg/330px-GerardManleyHopkins.jpg',
	'Gwendolyn Brooks': 'https://upload.wikimedia.org/wikipedia/en/8/89/Gwendolyn_Brooks_USPS_postage_stamp.jpg',
	'John Donne': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/John_Donne_by_Isaac_Oliver.jpg/330px-John_Donne_by_Isaac_Oliver.jpg',
	'John Keats': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/John_Keats_by_William_Hilton_circa_1822_02.jpg/500px-John_Keats_by_William_Hilton_circa_1822_02.jpg',
	'Lewis Carroll': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/LewisCarrollSelfPhoto.jpg/330px-LewisCarrollSelfPhoto.jpg',
	'Lord Byron': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Byron_1813_by_Phillips.jpg/330px-Byron_1813_by_Phillips.jpg',
	'Paul Laurence Dunbar': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Paul_Laurence_Dunbar_circa_1890.jpg',
	'Percy Shelley': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Percy_Bysshe_Shelley_by_Alfred_Clint.jpg/330px-Percy_Bysshe_Shelley_by_Alfred_Clint.jpg',
	'Robert Browning': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Robert_Browning_by_Herbert_Rose_Barraud%2C_circa_1888.jpg/330px-Robert_Browning_by_Herbert_Rose_Barraud%2C_circa_1888.jpg',
	'Robert Frost': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Robert_Frost_NYWTS_4.jpg/330px-Robert_Frost_NYWTS_4.jpg',
	'Samuel Taylor Coleridge': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/SamuelTaylorColeridge.jpg/330px-SamuelTaylorColeridge.jpg',
	'Seamus Heaney': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Seamus_Heaney%2C_Irish_poet%2C_brightened_%28cropped%29.jpg/330px-Seamus_Heaney%2C_Irish_poet%2C_brightened_%28cropped%29.jpg',
	'The Beatles': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/The_Beatles_members_at_New_York_City_in_1964.jpg/330px-The_Beatles_members_at_New_York_City_in_1964.jpg',
	'T.S. Eliot': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Thomas_Stearns_Eliot_by_Lady_Ottoline_Morrell_%281934%29.jpg/330px-Thomas_Stearns_Eliot_by_Lady_Ottoline_Morrell_%281934%29.jpg',
	'W.H. Auden': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/AudenVanVechten1939.jpg/330px-AudenVanVechten1939.jpg',
	'Walt Whitman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Walt_Whitman_-_George_Collins_Cox.jpg/330px-Walt_Whitman_-_George_Collins_Cox.jpg',
	'William Blake': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/William_Blake_by_Thomas_Phillips.jpg/330px-William_Blake_by_Thomas_Phillips.jpg',
	'William Shakespeare': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/William_Shakespeare_by_John_Taylor%2C_edited.jpg/330px-William_Shakespeare_by_John_Taylor%2C_edited.jpg',
	'William Wordsworth': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wordsworth_on_Helvellyn_by_Benjamin_Robert_Haydon.jpg/330px-Wordsworth_on_Helvellyn_by_Benjamin_Robert_Haydon.jpg',
	'Adrienne Rich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Adrienne_Rich_%28cropped%29.jpg/330px-Adrienne_Rich_%28cropped%29.jpg',
};

// Seeded shuffle function for deterministic randomization
function seededShuffle(array, seed) {
	const arr = [...array];
	let currentSeed = seed;
	for (let i = arr.length - 1; i > 0; i--) {
		currentSeed = (currentSeed * 9301 + 49297) % 233280;
		const j = Math.floor((currentSeed / 233280) * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export async function load() {
	const csv = readFileSync('src/data/poem_rhyme_game.csv', 'utf-8');
	const rows = csvParse(csv);

	// Build a map of poems by date (MM-DD-YYYY format from CSV)
	const poemsByDate = new Map();

	for (const row of rows) {
		const dateKey = row.date;
		if (!poemsByDate.has(dateKey)) {
			poemsByDate.set(dateKey, []);
		}
		poemsByDate.get(dateKey).push(row);
	}

	// Get all unique authors for the author guessing game
	const allAuthors = [...new Set(rows.map(r => r.author_name).filter(a => a && a.trim()))];

	// Convert poems to a serializable format with all data needed
	const poemsData = {};
	for (const [dateKey, dateRows] of poemsByDate) {
		const poemMap = new Map();

		for (const row of dateRows) {
			const poemSlug = row.poem_slug;
			const lineIndex = parseInt(row.line_index);

			if (!poemMap.has(poemSlug)) {
				poemMap.set(poemSlug, {
					poem_slug: poemSlug,
					author_name: row.author_name,
					author_image: authorImages[row.author_name] || '',
					poem_title: row.poem_title,
					poem_link: row.poem_link,
					lines: []
				});
			}

			const poem = poemMap.get(poemSlug);
			const noChoices = row.no_choices?.toUpperCase() === 'TRUE' || row.no_choices === true;

			// Store all distractors - shuffling will happen client-side
			const distractors = [row.choice_1, row.choice_2, row.choice_3, row.choice_4, row.choice_5, row.choice_6]
				.filter(c => c && c.trim() && c !== row.correct_last_word);

			poem.lines.push({
				line_index: lineIndex,
				line_text: row.line_text,
				correct_last_word: row.correct_last_word,
				no_choices: noChoices,
				distractors: distractors
			});
		}

		const poems = Array.from(poemMap.values());
		if (poems.length > 0) {
			poems[0].lines.sort((a, b) => a.line_index - b.line_index);
			poemsData[dateKey] = poems[0];
		}
	}

	return {
		poemsData,
		allAuthors,
		authorImages
	};
}
