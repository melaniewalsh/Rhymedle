import fs from 'fs';

const csvPath = 'src/data/poem_rhyme_game.csv';
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n');

const newLines = [];
for (const line of lines) {
  newLines.push(line);

  // Add blank line after One Art line 2 and 5
  if (line.includes('elizabeth-bishop-one-art')) {
    const parts = line.split(',');
    const lineIndex = parseInt(parts[6]);
    if (lineIndex === 2 || lineIndex === 5) {
      const blankLineIndex = lineIndex + 0.5;
      const blankLine = `elizabeth-bishop-one-art,01-02-2026,Elizabeth Bishop,TRUE,One Art,https://www.poetryfoundation.org/poems/47536/one-art,${blankLineIndex},,,,,,,,TRUE,`;
      newLines.push(blankLine);
      console.log(`Added blank line after One Art line ${lineIndex}`);
    }
  }
}

fs.writeFileSync(csvPath, newLines.join('\n'));
console.log('Done!');
