import fs from 'fs';

// Read the CSV
const csv = fs.readFileSync('src/data/poem_rhyme_game.csv', 'utf-8');
const lines = csv.split('\n');
const header = lines[0];
const rows = lines.slice(1).filter(line => line.trim());

// Poetry Foundation and other links for poems
const poemLinks = {
  'adrienne-rich-aunt-jennifers-tigers': 'https://www.poetryfoundation.org/poems/42495/aunt-jennifers-tigers',
  'alexander-pope-an-essay-on-man-epistle-i': 'https://www.poetryfoundation.org/poems/44899/an-essay-on-man-epistle-i',
  'alfred-lord-tennyson-in-memoriam-ahh-1849': 'https://www.poetryfoundation.org/poems/45336/in-memoriam-a-h-h-obiit-mdcccxxxiii-27',
  'alfred-lord-tennyson-in-memoriam-ring-out-wild-bells': 'https://poets.org/poem/memoriam-ring-out-wild-bells',
  'alfred-lord-tennyson-ulysses': 'https://www.poetryfoundation.org/poems/45392/ulysses',
  'andrew-marvell-to-his-coy-mistress': 'https://www.poetryfoundation.org/poems/44688/to-his-coy-mistress',
  'anne-bradstreet-to-my-dear-and-loving-husband': 'https://www.poetryfoundation.org/poems/43706/to-my-dear-and-loving-husband',
  'ben-jonson-to-the-memory-of-my-beloved-the-author-mr-william-shakespeare': 'https://www.poetryfoundation.org/poems/44466/to-the-memory-of-my-beloved-the-author-mr-william-shakespeare',
  'billy-collins-cheerios': 'https://www.poetryfoundation.org/poems/146918/cheerios',
  'billy-collins-snow-day': 'https://www.poetryfoundation.org/poems/46712/snow-day',
  'claude-mckay-if-we-must-die': 'https://www.poetryfoundation.org/poems/44694/if-we-must-die',
  'dylan-thomas-do-not-get-gentle-into-that-good-night': 'https://www.poetryfoundation.org/poems/46569/do-not-go-gentle-into-that-good-night',
  'edgar-allen-poe-annabel-lee': 'https://www.poetryfoundation.org/poems/44885/annabel-lee',
  'edgar-allen-poe-the-raven': 'https://www.poetryfoundation.org/poems/48860/the-raven',
  'edna-st-vincent-millay-first-fig': 'https://www.poetryfoundation.org/poems/44918/first-fig',
  'edna-st-vincent-millay-recuerdo': 'https://www.poetryfoundation.org/poems/44751/recuerdo',
  'edna-st-vincent-millay-what-lips-my-lips-have-kissed-and-where-and-why': 'https://www.poetryfoundation.org/poems/44749/what-lips-my-lips-have-kissed-and-where-and-why',
  'ee-cummings-anyone-lived-in-a-pretty-how-town': 'https://www.poetryfoundation.org/poems/47249/anyone-lived-in-a-pretty-how-town',
  'elizabeth-barrett-browning-how-do-i-love-thee-sonnet-43': 'https://www.poetryfoundation.org/poems/44961/sonnets-from-the-portuguese-43-how-do-i-love-thee-let-me-count-the-ways',
  'elizabeth-bishop-one-art': 'https://www.poetryfoundation.org/poems/47536/one-art',
  'emily-dickinson-hope-is-the-thing-with-feathers': 'https://www.poetryfoundation.org/poems/42889/hope-is-the-thing-with-feathers-314',
  'emily-dickinson-i-heard-a-fly-buzz---when-i-died': 'https://www.poetryfoundation.org/poems/45703/i-heard-a-fly-buzz-when-i-died-591',
  'emily-dickinson-im-nobody-who-are-you-260': 'https://www.poetryfoundation.org/poems/52197/im-nobody-who-are-you-260',
  'ernest-dowson-vitae-summa-brevis-spem-nos-vetat-incohare-longam': 'https://www.poetryfoundation.org/poems/44367/vitae-summa-brevis-spem-nos-vetat-incohare-longam',
  'ezra-pound-in-a-station-of-the-metro': 'https://www.poetryfoundation.org/poetrymagazine/poems/12675/in-a-station-of-the-metro',
  'geoffrey-chaucer-the-canterbury-tales-prologue': 'https://www.poetryfoundation.org/poems/43926/the-canterbury-tales-general-prologue',
  'gerard-manley-hopkins-gods-grandeur': 'https://www.poetryfoundation.org/poems/44395/gods-grandeur',
  'gwendolyn-brooks-the-bean-eaters': 'https://www.poetryfoundation.org/poems/43315/the-bean-eaters',
  'john-donne-a-valediction-forbidding-mourning': 'https://www.poetryfoundation.org/poems/44131/a-valediction-forbidding-mourning',
  'john-donne-holy-sonnets-death-be-not-proud': 'https://www.poetryfoundation.org/poems/44107/holy-sonnets-death-be-not-proud',
  'john-keats-ode-on-a-grecian-urn': 'https://www.poetryfoundation.org/poems/44477/ode-on-a-grecian-urn',
  'lewis-carroll-the-jabberwocky': 'https://www.poetryfoundation.org/poems/42916/jabberwocky',
  'lord-byron-she-walks-in-beauty': 'https://www.poetryfoundation.org/poems/43844/she-walks-in-beauty',
  'paul-laurence-dunbar-sympathy': 'https://www.poetryfoundation.org/poems/46459/sympathy-56d22658afbc0',
  'percy-shelley-ozymandias': 'https://www.poetryfoundation.org/poems/46565/ozymandias',
  'robert-browning-my-last-duchess': 'https://www.poetryfoundation.org/poems/43768/my-last-duchess',
  'robert-burns-auld-lang-syne': 'https://poets.org/poem/auld-lang-syne',
  'robert-frost-stopping-by-woods-on-a-snowy-evening': 'https://www.poetryfoundation.org/poems/42891/stopping-by-woods-on-a-snowy-evening',
  'samuel-taylor-coleridge-the-rime-of-the-ancient-mariner': 'https://www.poetryfoundation.org/poems/43997/the-rime-of-the-ancient-mariner-text-of-1834',
  'seamus-heaney-digging': 'https://www.poetryfoundation.org/poems/47555/digging',
  'the-beatles-all-you-need-is-love': '',  // No Poetry Foundation link for song lyrics
  'ts-eliot-the-love-song-of-j-alfred-prufrock': 'https://www.poetryfoundation.org/poetrymagazine/poems/44212/the-love-song-of-j-alfred-prufrock',
  'walt-whitman-o-captain-my-captain': 'https://www.poetryfoundation.org/poems/45474/o-captain-my-captain',
  'wh-auden-twelve-songs-ix': 'https://www.poetryfoundation.org/poems/53579/twelve-songs-ix',
  'william-blake-the-lamb': 'https://www.poetryfoundation.org/poems/43670/the-lamb',
  'william-blake-the-tyger': 'https://www.poetryfoundation.org/poems/43687/the-tyger',
  'william-shakespeare-shall-i-compare-thee-to-a-summers-day': 'https://www.poetryfoundation.org/poems/45087/sonnet-18-shall-i-compare-thee-to-a-summers-day',
  'william-wordsworth-i-wandered-lonely-as-a-cloud': 'https://www.poetryfoundation.org/poems/45521/i-wandered-lonely-as-a-cloud',
};


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

// Get unique poems in order of first appearance
const seenSlugs = new Set();
const uniquePoems = [];
for (const row of rows) {
  const slug = row.split(',')[0];
  if (slug && !seenSlugs.has(slug)) {
    seenSlugs.add(slug);
    uniquePoems.push(slug);
  }
}

console.log(`Found ${uniquePoems.length} unique poems`);

// Generate dates starting from 7 days ago through March 1, 2026
const dates = [];
let currentDate = new Date(2025, 11, 24); // Dec 24, 2025 (7 days before Dec 31)
const endDate = new Date(2026, 2, 1); // March 1, 2026

while (currentDate <= endDate) {
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const year = currentDate.getFullYear();
  dates.push(`${month}-${day}-${year}`);
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log(`Generated ${dates.length} dates from 12-24-2025 to 03-01-2026`);

// Shuffle poems using a seeded random for reproducibility
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

// Shuffle the poems before assigning dates
const shuffledPoems = seededShuffle(uniquePoems, 42);

// Assign dates to poems (one poem per date)
const poemDateMap = {};
for (let i = 0; i < shuffledPoems.length; i++) {
  const slug = shuffledPoems[i];
  poemDateMap[slug] = dates[i];
}

console.log('Date assignments:');
uniquePoems.slice(0, 5).forEach(slug => console.log(`  ${slug}: ${poemDateMap[slug]}`));

// Process each row
const newRows = rows.map(row => {
  const cols = row.split(',');
  const slug = cols[0];

  // Assign date (column index 1)
  if (poemDateMap[slug]) {
    cols[1] = poemDateMap[slug];
  }

  // Update link if we have one in our map (overwrite existing)
  if (poemLinks[slug]) {
    cols[5] = poemLinks[slug];
  }

  return cols.join(',');
});

// Write the new CSV
const newCsv = [header, ...newRows].join('\n');
fs.writeFileSync('src/data/poem_rhyme_game.csv', newCsv);

console.log('Done! Updated poem_rhyme_game.csv with dates and links.');

// Show poems without links
const missingLinks = uniquePoems.filter(slug => !poemLinks[slug] || poemLinks[slug] === '');
if (missingLinks.length > 0) {
  console.log('\nPoems still missing links:');
  missingLinks.forEach(slug => console.log(`  - ${slug}`));
}
