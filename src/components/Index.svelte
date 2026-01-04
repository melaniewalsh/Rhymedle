<script>
	import { getContext } from "svelte";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import confetti from "canvas-confetti";

	const data = getContext("data");
	const poemsData = data.poemsData;
	const allAuthors = data.allAuthors;
	const authorImages = data.authorImages;

	const hardModeContext = getContext("hardMode");
	const isHardMode = $derived(hardModeContext?.isHardMode ?? false);

	// Get today's date string for comparison
	const today = new Date();
	const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	// Get selected date from URL or use today (client-side)
	function getSelectedDate() {
		if (browser) {
			const urlDate = $page.url.searchParams.get('date');
			if (urlDate) return urlDate;
		}
		return todayString;
	}

	let dayString = $derived(getSelectedDate());

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

	// Convert YYYY-MM-DD to MM-DD-YYYY for CSV lookup
	function toCsvDateFormat(dateStr) {
		const [year, month, day] = dateStr.split('-');
		return `${month}-${day}-${year}`;
	}

	// Get poem for the selected date
	function getPoemForDate(dateStr) {
		const csvDateKey = toCsvDateFormat(dateStr);
		let poemData = poemsData[csvDateKey];

		// Fallback: if no poem for this date, use modulo selection from all poems
		if (!poemData) {
			const allPoems = Object.values(poemsData);
			const [year, month, day] = dateStr.split('-').map(Number);
			const date = new Date(year, month - 1, day);
			const dayNumber = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
			poemData = allPoems[dayNumber % allPoems.length];
		}

		// Get day number for seeded shuffle
		const [year, month, day] = dateStr.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		const dayNumber = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));

		// Process lines to add shuffled choices
		const processedLines = poemData.lines.map((line, lineIndex) => {
			let choices = [];
			const isBlank = !line.line_text || line.line_text.trim() === '';
			if (!line.no_choices && !isBlank) {
				const correctAnswer = line.correct_last_word;
				const shuffledDistractors = seededShuffle(line.distractors, dayNumber + lineIndex);
				const selectedDistractors = shuffledDistractors.slice(0, 2);
				const allOptions = [correctAnswer, ...selectedDistractors];
				choices = seededShuffle(allOptions, dayNumber + lineIndex + 1000);
			}
			return { ...line, choices };
		});

		return {
			...poemData,
			author_image: authorImages[poemData.author_name] || poemData.author_image || '',
			lines: processedLines
		};
	}

	// Get author choices for the selected date
	function getAuthorChoicesForDate(dateStr, poem) {
		const [year, month, day] = dateStr.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		const dayNumber = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));

		const otherAuthors = allAuthors.filter(a => a && a !== poem.author_name).sort();
		const shuffledOthers = seededShuffle(otherAuthors, dayNumber);
		const wrongAuthors = shuffledOthers.slice(0, 4);
		return seededShuffle([poem.author_name, ...wrongAuthors], dayNumber);
	}

	// Derived poem and author choices
	let poem = $derived(getPoemForDate(dayString));
	let authorChoices = $derived(getAuthorChoicesForDate(dayString, poem));

	// Initialize game state
	let selectedWords = $state(poem.lines.map(() => ""));
	let attemptsUsed = $state(0);
	let maxAttempts = 3;
	let correctCount = $state(0);
	let showFinalReveal = $state(false);
	let showAuthorGuess = $state(false);
	let selectedAuthor = $state("");
	let authorSubmitted = $state(false);
	let showDramaticReveal = $state(false);
	let lineResults = $state(poem.lines.map(() => null)); // null, 'correct', or 'incorrect'
	let lastCheckedWords = $state(poem.lines.map(() => "")); // Track words at last check
	let focusedLineIndex = $state(null); // Track which line input is focused
	let hintsUsed = $state(0); // Track number of hints used
	let fiftyFiftyChoices = $state(poem.lines.map(() => null)); // Track 50/50 reduced choices for each line
	let fiftyFiftyUsed = $state(0); // Track number of 50/50 uses

	// Load saved game state from localStorage for current day
	function loadGameState() {
		if (!browser) return;

		const stored = localStorage.getItem("rhymedle-game");
		if (!stored) return;

		try {
			const allGames = JSON.parse(stored);
			const savedState = allGames[dayString];
			if (savedState) {
				selectedWords = savedState.selectedWords || poem.lines.map(() => "");
				attemptsUsed = savedState.attemptsUsed || 0;
				correctCount = savedState.correctCount || 0;
				showFinalReveal = savedState.showFinalReveal || false;
				showAuthorGuess = savedState.showAuthorGuess || false;
				selectedAuthor = savedState.selectedAuthor || "";
				authorSubmitted = savedState.authorSubmitted || false;
				showDramaticReveal = savedState.showDramaticReveal || false;
				lineResults = savedState.lineResults || poem.lines.map(() => null);
				lastCheckedWords =
					savedState.lastCheckedWords || poem.lines.map(() => "");
				hintsUsed = savedState.hintsUsed || 0;
				fiftyFiftyChoices =
					savedState.fiftyFiftyChoices || poem.lines.map(() => null);
				fiftyFiftyUsed = savedState.fiftyFiftyUsed || 0;
			}
		} catch (e) {
			console.error("Error loading game state:", e);
		}
	}

	// Save game state to localStorage
	function saveGameState() {
		if (!browser) return;

		const stored = localStorage.getItem("rhymedle-game");
		const allGames = stored ? JSON.parse(stored) : {};

		allGames[dayString] = {
			selectedWords,
			attemptsUsed,
			correctCount,
			totalCount,
			showFinalReveal,
			showAuthorGuess,
			selectedAuthor,
			authorSubmitted,
			showDramaticReveal,
			lineResults,
			lastCheckedWords,
			hintsUsed,
			fiftyFiftyChoices,
			fiftyFiftyUsed
		};

		localStorage.setItem("rhymedle-game", JSON.stringify(allGames));
	}

	let isLoadingState = false;

	// Load state when day changes
	$effect(() => {
		if (dayString) {
			isLoadingState = true;
			// Reset to defaults first
			selectedWords = poem.lines.map(() => "");
			attemptsUsed = 0;
			correctCount = 0;
			showFinalReveal = false;
			showAuthorGuess = false;
			selectedAuthor = "";
			authorSubmitted = false;
			showDramaticReveal = false;
			lineResults = poem.lines.map(() => null);
			hintsUsed = 0;
			fiftyFiftyChoices = poem.lines.map(() => null);
			fiftyFiftyUsed = 0;

			// Then load saved state if it exists
			loadGameState();
			isLoadingState = false;
		}
	});

	// Auto-save state when it changes (but not during initial load)
	$effect(() => {
		if (!isLoadingState && browser) {
			// Track these variables so effect runs when they change
			selectedWords;
			attemptsUsed;
			correctCount;
			showFinalReveal;
			showAuthorGuess;
			selectedAuthor;
			authorSubmitted;
			showDramaticReveal;
			lineResults;
			lastCheckedWords;
			hintsUsed;
			fiftyFiftyChoices;
			fiftyFiftyUsed;

			saveGameState();
		}
	});

	// Helper to check if a line is a blank/spacer line
	function isBlankLine(line) {
		return !line.line_text || line.line_text.trim() === '';
	}

	// Count only lines with choices (excluding blank lines)
	const linesWithChoices = poem.lines.filter((line) => !line.no_choices && !isBlankLine(line));
	let totalCount = $state(linesWithChoices.length);

	function checkAnswer() {
		let count = 0;
		const results = [];

		poem.lines.forEach((line, index) => {
			if (line.no_choices || isBlankLine(line)) {
				results.push(null);
			} else {
				let isCorrect;
				if (isHardMode) {
					// In hard mode, compare typed text with correct word (case-insensitive, no punctuation)
					const { word: correctWord } = separateWordAndPunctuation(
						line.correct_last_word || ""
					);
					isCorrect =
						selectedWords[index]?.toLowerCase() === correctWord.toLowerCase();
				} else {
					// In easy mode, compare full value with punctuation
					isCorrect = selectedWords[index] === line.correct_last_word;
				}
				results.push(isCorrect ? "correct" : "incorrect");
				if (isCorrect) count++;
			}
		});

		lineResults = results;
		correctCount = count;
		attemptsUsed++;

		// Save current words as last checked state
		lastCheckedWords = [...selectedWords];

		// If perfect score or used all attempts, show final reveal
		if (count === totalCount || attemptsUsed >= maxAttempts) {
			showFinalReveal = true;
			showAuthorGuess = true;
			showResultMessage();

			// Trigger confetti for perfect rhyme score
			if (count === totalCount) {
				triggerConfetti();
			}
		}
	}

	function triggerConfetti() {
		if (!browser) return;

		// Fire confetti from both sides
		const end = Date.now() + 1200;
		const colors = ['#10493b', '#d2a710', '#ffffff'];

		(function frame() {
			confetti({
				particleCount: 3,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
				colors: colors
			});
			confetti({
				particleCount: 3,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
				colors: colors
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		}());
	}

	function submitAuthorGuess() {
		authorSubmitted = true;
		showDramaticReveal = true;

		// Trigger confetti for correct author guess
		if (selectedAuthor === poem.author_name) {
			triggerConfetti();
		}
	}

	function giveUp() {
		// Set all incorrect answers to show the reveal
		const results = poem.lines.map((line, index) => {
			if (line.no_choices || isBlankLine(line)) return null;
			const isCorrect = selectedWords[index] === line.correct_last_word;
			return isCorrect ? "correct" : "incorrect";
		});
		lineResults = results;
		showFinalReveal = true;
		showAuthorGuess = true;
		showResultMessage();
	}

	function useHint() {
		if (!isHardMode) return; // Only works in hard mode

		hintsUsed++;

		// For each line with choices, reveal the first N letters based on hintsUsed
		poem.lines.forEach((line, index) => {
			if (!line.no_choices && !isBlankLine(line)) {
				const { word: correctWord } = separateWordAndPunctuation(
					line.correct_last_word || ""
				);
				const hintLetters = correctWord.substring(0, hintsUsed);
				const currentInput = selectedWords[index].toLowerCase();
				const correctStart = correctWord
					.substring(0, currentInput.length)
					.toLowerCase();

				// Replace if: input is wrong, or input is shorter than hint letters
				if (
					currentInput !== correctStart ||
					selectedWords[index].length < hintsUsed
				) {
					selectedWords[index] = hintLetters;
				}
			}
		});
	}

	function use5050() {
		if (isHardMode) return; // Only works in easy mode

		fiftyFiftyUsed++;

		// For each line with choices that hasn't been answered correctly
		const newFiftyFiftyChoices = [...fiftyFiftyChoices];
		poem.lines.forEach((line, index) => {
			if (
				!line.no_choices &&
				!isBlankLine(line) &&
				lineResults[index] !== "correct" &&
				!fiftyFiftyChoices[index]
			) {
				const correctAnswer = line.correct_last_word;
				const wrongChoices = line.choices.filter((c) => c !== correctAnswer);

				// Randomly select one wrong answer
				const randomWrongIndex = Math.floor(
					Math.random() * wrongChoices.length
				);
				const randomWrong = wrongChoices[randomWrongIndex];

				// Shuffle the correct and wrong answer
				const twoChoices =
					Math.random() < 0.5
						? [correctAnswer, randomWrong]
						: [randomWrong, correctAnswer];

				newFiftyFiftyChoices[index] = twoChoices;
			}
		});
		fiftyFiftyChoices = newFiftyFiftyChoices;
	}

	async function shareResults() {
		if (!browser) return;

		const authorCorrect = selectedAuthor === poem.author_name;
		const modeText = isHardMode ? "Hard Mode" : "Easy Mode";
		const hintsText =
			isHardMode && hintsUsed > 0
				? `, ${hintsUsed} hint${hintsUsed > 1 ? "s" : ""}`
				: "";
		const fiftyFiftyText =
			!isHardMode && fiftyFiftyUsed > 0
				? `, ${fiftyFiftyUsed} hint${fiftyFiftyUsed > 1 ? "s" : ""} (50/50)`
				: "";
		const shareText = `Rhymedle ${dayString} (${modeText})

Rhymes: ${correctCount}/${totalCount} (${attemptsUsed === 0 ? "gave up" : `${attemptsUsed} attempt${attemptsUsed > 1 ? "s" : ""}`}${hintsText}${fiftyFiftyText})
Author: ${authorCorrect ? "✓" : "✗"}

${window.location.origin}${window.location.pathname.replace(/\/$/, '')}`;

		// Check if we're on mobile (touch device with small screen)
		const isMobile = 'ontouchstart' in window && window.innerWidth <= 768;

		// Use Web Share API only on mobile
		if (isMobile && navigator.share) {
			try {
				await navigator.share({
					text: shareText
				});
			} catch (err) {
				// User cancelled or share failed, fall back to clipboard
				if (err.name !== 'AbortError') {
					copyToClipboard(shareText);
				}
			}
		} else {
			// Use clipboard for desktop
			copyToClipboard(shareText);
		}
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text).then(() => {
			showCopyNotification = true;
			setTimeout(() => {
				showCopyNotification = false;
			}, 2000);
		});
	}

	let showCopyNotification = $state(false);
	let showResultToast = $state(false);
	let resultToastMessage = $state('');

	function showResultMessage() {
		if (correctCount === totalCount && attemptsUsed === 1) {
			resultToastMessage = 'Perfect!';
		} else if (correctCount === totalCount) {
			resultToastMessage = 'Excellent!';
		} else if (correctCount >= totalCount * 0.7) {
			resultToastMessage = 'Well done!';
		} else if (correctCount >= totalCount * 0.5) {
			resultToastMessage = 'Good effort!';
		} else {
			resultToastMessage = 'Keep practicing!';
		}
		showResultToast = true;
		setTimeout(() => {
			showResultToast = false;
		}, 2000);
	}

	function getLineWithoutLastWord(lineText) {
		const words = lineText.split(" ");
		return words.slice(0, -1).join(" ");
	}

	function separateWordAndPunctuation(word) {
		// Match word and trailing punctuation (including hyphens/dashes for Dickinson)
		const match = word.match(/^(.+?)([.,;:!?\-—]*)$/);
		if (match) {
			return {
				word: match[1],
				punctuation: match[2]
			};
		}
		return { word, punctuation: "" };
	}

	function getWikipediaLink(authorName) {
		if (!authorName) return "";
		// Replace spaces with underscores for Wikipedia URL format
		const formattedName = authorName.replace(/ /g, "_");
		return `https://en.wikipedia.org/wiki/${formattedName}`;
	}

	function getLetterClass(userInput, correctWord, index, lineIndex) {
		if (!userInput || index >= userInput.length) return "";

		// Only show colors after checking answer
		if (!lineResults[lineIndex] || lineResults[lineIndex] === null) {
			return "";
		}

		// Only show colors for letters that were present at last check
		const lastChecked = lastCheckedWords[lineIndex] || "";
		if (
			index >= lastChecked.length ||
			userInput[index] !== lastChecked[index]
		) {
			return ""; // New or changed letter - show black
		}

		const userLetter = userInput[index].toLowerCase();
		const correctLetter = correctWord[index]?.toLowerCase();
		return userLetter === correctLetter ? "correct-letter" : "incorrect-letter";
	}

	$effect(() => {
		// Check if all lines with choices have been selected
		const allSelected = poem.lines.every((line, index) => {
			if (line.no_choices || isBlankLine(line)) return true; // skip lines without choices
			if (isHardMode) {
				// In hard mode, check if input matches correct answer
				const { word: correctWord } = separateWordAndPunctuation(
					line.correct_last_word || ""
				);
				return selectedWords[index].toLowerCase() === correctWord.toLowerCase();
			}
			return selectedWords[index] !== "";
		});
		return allSelected;
	});
</script>

<div class="container">
	<div class="poem-wrapper">
		<h3 class="instruction-title">
			Complete the rhymes in this poem. <span class="instruction-subtitle"
				>{#if isHardMode}(Fill in the Blank){:else}(Select One){/if}</span
			>
		</h3>

		<div class="poem">
			{#each poem.lines as line, index}
				<p class="poem-line">
					<span class="line-content">
					{#if !line.line_text || line.line_text.trim() === ''}
						&nbsp;
					{:else if line.no_choices}
						{line.line_text}
					{:else if showFinalReveal}
						{@const { word, punctuation } = separateWordAndPunctuation(
							line.correct_last_word || ""
						)}
						<span class="dissolve" style="animation: dissolve 1s ease-in;">
							{getLineWithoutLastWord(line.line_text)}
							<strong>{word}</strong>{punctuation}
						</span>
					{:else}
						{@const { word: correctWord, punctuation } =
							separateWordAndPunctuation(line.correct_last_word || "")}
						{getLineWithoutLastWord(line.line_text)}
						{#if isHardMode}
							<span
								class="hard-mode-display"
								onclick={(e) => {
									const input = e.currentTarget.nextElementSibling;
									if (input) input.focus();
								}}
								>{#if selectedWords[index]}{#each selectedWords[index] as letter, letterIndex}<span
											class="letter-char {getLetterClass(
												selectedWords[index],
												correctWord,
												letterIndex,
												index
											)}">{letter}</span
										>{/each}{#if focusedLineIndex === index}<span
											class="blinking-cursor">|</span
										>{/if}{:else if focusedLineIndex !== index}<span
										class="placeholder-ellipsis">...</span
									>{:else}<span class="blinking-cursor">|</span>{/if}</span
							>
							<input
								type="text"
								class="hard-mode-input-real"
								bind:value={selectedWords[index]}
								disabled={attemptsUsed > 0 && lineResults[index] === "correct"}
								onfocus={(e) => {
									focusedLineIndex = index;
									// Move cursor to end so typing appends after hint letters
									const input = e.target;
									setTimeout(() => {
										input.selectionStart = input.selectionEnd =
											input.value.length;
									}, 0);
								}}
								onblur={() => (focusedLineIndex = null)}
							/>
							<span class="punctuation">{punctuation}</span>
						{:else}
							{@const choicesToShow = fiftyFiftyChoices[index] || line.choices}
							<select
								bind:value={selectedWords[index]}
								disabled={attemptsUsed > 0 && lineResults[index] === "correct"}
							>
								<option value="">--</option>
								{#each choicesToShow as choice}
									{@const { word } = separateWordAndPunctuation(choice)}
									<option value={choice}>{word}</option>
								{/each}
							</select><span class="punctuation">{punctuation}</span>
						{/if}
					{/if}
					</span>
					<span class="line-result-column">
						{#if lineResults[index] && !line.no_choices && !isBlankLine(line)}
							<span class="line-result {lineResults[index]}">
								{lineResults[index] === "correct" ? "✓" : "✗"}
							</span>
						{/if}
					</span>
				</p>
			{/each}
		</div>
	</div>

	{#if !showFinalReveal}
		<div class="button-group">
			<button
				class="check-button"
				onclick={checkAnswer}
				disabled={poem.lines.some(
					(line, index) => !line.no_choices && !isBlankLine(line) && selectedWords[index] === ""
				)}
			>
				📚 Check Answer
			</button>
			{#if isHardMode}
				<button class="hint-button" onclick={useHint}> 💡 Hint </button>
			{:else}
				<button class="fifty-fifty-button" onclick={use5050}>
					💡 Hint: 50/50
				</button>
			{/if}
			<button class="give-up-button" onclick={giveUp}> Give up </button>
		</div>
	{/if}

	<div class="attempts-info">
		Attempts: {attemptsUsed === 0 ? 0 : attemptsUsed} / {maxAttempts}
		<span class="score">Score: {correctCount} / {totalCount}</span>
		{#if isHardMode && hintsUsed > 0}
			<span class="hints-used">Hints: {hintsUsed}</span>
		{/if}
		{#if !isHardMode && fiftyFiftyUsed > 0}
			<span class="fifty-fifty-used">Hints: {fiftyFiftyUsed} (50/50)</span>
		{/if}
	</div>

	{#if showAuthorGuess && !authorSubmitted}
		<div
			class="author-guess-section"
			style="animation: fadeInUp 0.6s ease-out;"
		>
			<h3>Who wrote this poem?</h3>
			<div class="author-buttons">
				{#each authorChoices.filter((a) => a && a.trim()) as author}
					<button
						class="author-button {selectedAuthor === author ? 'selected' : ''}"
						onclick={() => {
							selectedAuthor = author;
							submitAuthorGuess();
						}}
					>
						{author}
					</button>
				{/each}
			</div>
		</div>
	{:else if showDramaticReveal}
		<div class="reveal-box" style="animation: fadeInUp 0.8s ease-out;">
			<p
				class="guess-label {selectedAuthor === poem.author_name
					? 'correct-guess'
					: 'incorrect-guess'}"
			>
				You guessed: {selectedAuthor}
			</p>
			<div class="reveal-content-box">
				{#if poem.author_image}
					<img
						class="author-image"
						src={poem.author_image}
						alt={poem.author_name}
					/>
				{/if}
				<p class="reveal-label">The correct author was:</p>
				<p class="reveal-author-name">{poem.author_name}</p>
				<p class="reveal-label">Excerpt from:</p>
				<p class="reveal-title">"{poem.poem_title}"</p>
			</div>
			<a
				class="poem-link-button"
				href={poem.poem_link}
				target="_blank"
				rel="noopener noreferrer"
			>
				Read this poem →
			</a>
			<a
				class="wiki-link-button"
				href={getWikipediaLink(poem.author_name)}
				target="_blank"
				rel="noopener noreferrer"
			>
				Learn more about this author →
			</a>
			<button class="share-button" onclick={shareResults}>
				<span
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "8px"
					}}
				>
					Share your results
					<svg
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						height="20"
						viewBox="0 0 24 24"
						width="20"
					>
						<path
							fill="white"
							d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
						></path>
					</svg>
				</span>
			</button>
		</div>
	{/if}

	{#if showCopyNotification}
		<div class="copy-notification">Score copied to clipboard!</div>
	{/if}

	{#if showResultToast}
		<div class="result-toast">{resultToastMessage}</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem 2rem;
	}

	.poem-wrapper {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
	}

	.instruction-title {
		text-align: left;
		font-weight: bold;
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
	}

	.instruction-subtitle {
		text-align: left;
		/* font-style: italic; */
		color: #666;
		margin: 0 0 1rem 0;
		/* font-size: 0.95rem; */
		font-family: "Baskerville", "Georgia", serif;
	}

	@media (max-width: 640px) {
		.instruction-subtitle {
			display: block;
			margin-top: 0.25rem;
		}
	}

	.poem {
		background: #fefef8;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		line-height: 1.6;
		border: 1px solid black;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		font-family: "Baskerville", "Georgia", serif;
		font-size: 15px;
	}

	.poem-line {
		margin: 0.5rem 0;
		/* min-height: 1.8rem; */
		display: flex;
		align-items: center;
		white-space: pre-wrap;
	}

	.line-result-column {
		width: 1.5rem;
		min-width: 1.5rem;
		flex-shrink: 0;
		text-align: right;
		margin-left: auto;
	}

	.line-content {
		flex: 1;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	select {
		font-family: "Baskerville", "Georgia", serif;
		font-size: 15px;
		padding: 0.25rem 0.5rem;
		border: 1px solid #666;
		border-radius: 4px;
		background: white;
		margin-left: 0.35rem;
		margin-right: 0.4rem;
		height: 1.75rem;
		box-sizing: border-box;
	}

	.punctuation {
		font-family: "Baskerville", "Georgia", serif;
		font-size: 15px;
		margin-left: 0;
		margin-right: 0.5rem;
	}

	select:disabled {
		background: #f0f0f0;
		cursor: not-allowed;
	}

	.hard-mode-display {
		display: inline-flex;
		align-items: center;
		font-family: "Baskerville", "Georgia", serif;
		font-size: 15px;
		padding: 0.25rem 0.5rem;
		border: 1px solid #666;
		border-radius: 4px;
		background: white;
		min-width: 150px;
		height: 1.75rem;
		box-sizing: border-box;
		cursor: text;
		text-align: left;
		margin-left: 0.35rem;
		margin-right: 0.4rem;
	}

	@media (max-width: 640px) {
		.hard-mode-display {
			min-width: 70px;
		}
	}

	.hard-mode-input-real {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
	}

	.letter-char {
		display: inline;
		font-family: "Baskerville", "Georgia", serif;
		font-size: 15px;
	}

	.blinking-cursor {
		display: inline;
		font-family: "Baskerville", "Georgia", serif;
		font-size: 15px;
		margin-left: -2px;
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	.placeholder-ellipsis {
		color: #000000;
		font-family: "Baskerville", "Georgia", serif;
		font-size: 15px;
	}

	.correct-letter {
		color: #155724;
		font-weight: bold;
	}

	.incorrect-letter {
		color: #721c24;
	}

	.button-group {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin: 1rem 0;
	}

	.check-button {
		display: inline-block;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		background: #d1d5db;
		color: #1f2937;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
		transition: all 0.2s;
	}

	.check-button:hover:not(:disabled) {
		background: #9ca3af;
	}

	.check-button:disabled {
		background: #e5e7eb;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.hint-button {
		display: inline-block;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		background: #fbbf24;
		color: #1f2937;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
		transition: all 0.2s;
	}

	.hint-button:hover {
		background: #f59e0b;
	}

	.fifty-fifty-button {
		display: inline-block;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		background: #fbbf24;
		color: #1f2937;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
		transition: all 0.2s;
	}

	.fifty-fifty-button:hover {
		background: #f59e0b;
	}

	.give-up-button {
		display: inline-block;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		background: transparent;
		color: #666;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		transition: color 0.2s;
	}

	.give-up-button:hover {
		color: #333;
	}

	.result {
		text-align: center;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1.5rem;
		font-size: 1.2rem;
		font-weight: bold;
	}

	.result.correct {
		background: #d4edda;
		color: #155724;
	}

	.result.incorrect {
		background: #f8d7da;
		color: #721c24;
	}

	.poem-link {
		text-align: center;
		margin-top: 2rem;
	}

	.poem-link a {
		color: #333;
		text-decoration: none;
		border-bottom: 1px solid #333;
	}

	.poem-link a:hover {
		border-bottom: 2px solid #333;
	}

	.line-result {
		display: inline-block;
		font-weight: bold;
		font-size: 1rem;
	}

	.line-result.correct {
		color: #155724;
	}
	svg {
		width: auto;
		display: inline;
	}

	.line-result.incorrect {
		color: #721c24;
	}

	.attempts-info {
		text-align: center;
		margin: 1rem 0;
		font-size: 1rem;
	}

	.attempts-info .score {
		margin-left: 1rem;
		font-weight: bold;
	}

	.attempts-info .hints-used {
		margin-left: 1rem;
		color: #f59e0b;
		font-weight: bold;
	}

	.attempts-info .fifty-fifty-used {
		margin-left: 1rem;
		color: #f59e0b;
		font-weight: bold;
	}

	.final-result {
		text-align: center;
		padding: 1.5rem;
		border-radius: 8px;
		margin-top: 1.5rem;
		font-size: 1.3rem;
		font-weight: bold;
	}

	.final-result.correct {
		background: #d4edda;
		color: #155724;
	}

	.final-result.incorrect {
		background: #f8d7da;
		color: #721c24;
	}

	.dissolve {
		display: inline;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes dissolve {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes dramaticScale {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.author-guess-section {
		margin-top: 2rem;
		text-align: center;
	}

	.author-guess-section h3 {
		font-size: 1.3rem;
		margin-bottom: 1rem;
		font-weight: bold;
		font-family: "Baskerville", "Georgia", serif;
	}

	.author-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 1rem;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.author-button {
		padding: 0.65rem 1.25rem;
		font-size: 15px;
		background: white;
		color: #333;
		border: 1px solid #666;
		border-radius: 6px;
		cursor: pointer;
		font-family: "Baskerville", "Georgia", serif;
		transition: all 0.2s ease;
		flex: 0 0 auto;
		min-width: 100px;
	}

	.author-button:empty {
		display: none;
	}

	.author-button:hover {
		background: #f5f5e8;
		transform: translateY(-2px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.author-button.selected {
		background: rgb(16, 73, 59);
		color: white;
		border-color: black;
	}

	.reveal-box {
		margin: 1rem auto 0 auto;
		max-width: 500px;
		width: 100%;
	}

	.reveal-content-box {
		background: #fefef8;
		border: 1px solid black;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		text-align: center;
		margin-bottom: 1rem;
		font-family: "Baskerville", "Georgia", serif;
	}

	.incorrect-guess {
		text-align: center;
		font-size: 0.95rem;
		color: #721c24;
		margin-bottom: 0.5rem;
		font-family: "Baskerville", "Georgia", serif;
	}

	.correct-guess {
		text-align: center;
		font-size: 0.95rem;
		color: #33a835;
		margin-bottom: 0.5rem;
		font-family: "Baskerville", "Georgia", serif;
	}

	.author-image {
		width: 120px;
		height: 120px;
		object-fit: cover;
		border-radius: 50%;
		margin: 0 auto 1rem auto;
		display: block;
		border: 3px solid rgb(16, 73, 59);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.reveal-label {
		font-size: 14px;
		color: #666;
		margin: 1rem 0 0.25rem 0;
	}

	.author-image + .reveal-label {
		margin-top: 0;
	}

	.reveal-author-name {
		font-size: 24px;
		font-weight: bold;
		color: rgb(16, 73, 60);
		margin: 0 0 0.5rem 0;
	}

	.reveal-title {
		font-size: 18px;
		color: #333;
		margin: 0 0 0.5rem 0;
		/* font-style: italic; */
	}

	.author-guess-result {
		font-size: 0.95rem;
		padding: 0.5rem;
		margin: 1rem 0 0 0;
		border-radius: 4px;
	}

	.author-guess-result.correct {
		background: #d4edda;
		color: #155724;
	}

	.poem-link-button {
		display: block;
		width: 100%;
		text-align: center;
		padding: 0.75rem 1.5rem;
		background: rgb(16, 73, 59);
		border: 1px solid black;
		border-radius: 8px;
		color: white;
		text-decoration: none;
		font-size: 15px;
		transition: all 0.2s;
		font-family: "Baskerville", "Georgia", serif;
		cursor: pointer;
	}

	.poem-link-button:hover {
		transform: translateY(-2px);
	}

	.wiki-link-button {
		display: block;
		width: 100%;
		text-align: center;
		padding: 0.75rem 1.5rem;
		margin-top: 0.5rem;
		background: white;
		border: 1px solid black;
		border-radius: 8px;
		color: #333;
		text-decoration: none;
		font-size: 15px;
		transition: all 0.2s;
		font-family: "Baskerville", "Georgia", serif;
		cursor: pointer;
	}

	.wiki-link-button:hover {
		background: #f5f5f5;
		transform: translateY(-2px);
	}

	.share-button {
		display: block;
		width: 100%;
		text-align: center;
		padding: 0.75rem 1.5rem;
		margin-top: 0.75rem;
		background: black;
		border: 1px solid black;
		border-radius: 8px;
		color: white;
		text-decoration: none;
		font-size: 15px;
		transition: all 0.2s;
		font-family: "Baskerville", "Georgia", serif;
		cursor: pointer;
	}

	.share-button:hover {
		background: #333;
		transform: translateY(-2px);
	}

	.copy-notification {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #fefef8;
		color: #333;
		border: 1px solid black;
		border-radius: 8px;
		padding: 1.5rem 2rem;
		font-size: 16px;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		animation: fadeInUp 0.3s ease-out;
		font-family: "Baskerville", "Georgia", serif;
	}

	.result-toast {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #fefef8;
		color: rgb(16, 73, 60);
		border: 1px solid black;
		border-radius: 8px;
		padding: 1.5rem 2rem;
		font-size: 18px;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		animation: fadeInUp 0.3s ease-out;
		font-family: "Baskerville", "Georgia", serif;
	}
</style>
