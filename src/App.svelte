<script>
	import Letter from './Letter.svelte';
	import Definition from './Definition.svelte';
	import Wordle from './wordle';
	import * as Realm from "realm-web";
	
	const w = new Wordle();
	const app = new Realm.App({ id: 'wordle-gvqgy' });
	const credentials = Realm.Credentials.anonymous();

	let words = [];
	let nextDisabled = true;
	let noword = false;
	let fetchingWord = false;

	function colorChanged(position, color) {
		words[words.length - 1][position].color = Wordle.COLOR[color];
		nextDisabled = !nextEnabled();
	}

	function nextEnabled() {
		return words[words.length - 1].filter(l => l.color === undefined).length === 0 &&
			words[words.length - 1].filter(l => l.color === Wordle.COLOR.correct).length < 5
	}

	async function getNextWord() {
		fetchingWord = true;
		if(words.length > 0) {
			w.pushRow(words[words.length - 1]);
		}
		if(!app.currentUser) {
			await app.logIn(credentials);
		}
		const placeholder = words.length > 0 ? 
			words[words.length - 1].map(l => l.color === Wordle.COLOR.correct ? l : {letter: '?'}) :
			[{letter: '?'}, {letter: '?'}, {letter: '?'}, {letter: '?'}, {letter: '?'}];
		placeholder.ph = true;
		words = [...words, placeholder];
		const agg = w.agg();
		const mongodb = app.currentUser.mongoClient('mongodb-atlas');
		const dictionary = mongodb.db('wordle_solver').collection('dictionary');
		try {
			const [{word, count}] = await dictionary.aggregate(agg);
			// Get rid of placeholder
			words.pop();
			const nextWordObj = word.split('').map((letter, p) => ({letter, color: placeholder[p].color}));
			nextWordObj.count = count;
			words = [...words, nextWordObj];
			nextDisabled = !nextEnabled();
			return words;
		} catch {
			noword = true;
		} finally {
			fetchingWord = false;
		}
	}

	async function changeStartWord() {
		const newStartWord = prompt('What word should we start with?', assembleWord(words[0]));
		if(newStartWord) {
			if(newStartWord.length === 5) {
				const newStartWordObj = newStartWord.toLowerCase().split('').map(letter => ({letter}));
				const mongodb = app.currentUser.mongoClient('mongodb-atlas');
				const dictionary = mongodb.db('wordle_solver').collection('dictionary');
				const [{count}] = await dictionary.aggregate([{$count: 'count'}]);
				newStartWordObj.count = count;
				words = [newStartWordObj];
				w.reset();
				return;
			}
			alert('The word must have exactly 5 characters.')
		}
	}

	function assembleWord(word) {
		return word.map(({letter}) => letter).join('');
	}
</script>

<main>
	{#await getNextWord()}
		<p class="loader">Setting things up...</p>
	{:then _} 
		{#each words as word, i}
			<div class="entry">
				<div class="word">
					<div class="letters">
						{#each word as l, position}
							<Letter letter={l.letter} color={Wordle.color(l.color)} frozen={i < words.length - 1 || noword} on:colorchange={(event) => colorChanged(position, event.detail.color)}></Letter>
						{/each}
					</div>
					{#if word.count && i === words.length - 1}
						<div class="count">
							<progress max={words[0].count} value={words[0].count - word.count} title="Selected out of {word.count} words"></progress>
						</div>
					{/if}
				</div>
				{#if i === words.length - 1 && !noword}
					{#if !word.ph && i === words.length - 1}
					<Definition word={assembleWord(word)}></Definition>
					{/if}

					{#if !fetchingWord}
					<div class="button-bar">
						<button class="next" on:click|once={getNextWord} disabled={nextDisabled}>Next Word</button>
						<button class="change" on:click={changeStartWord}><span>or</span> change start word</button>
					</div>
					{/if}
				{/if}
			</div>
		{/each}
	{/await}
	{#if noword}
		<p class="noword">No matching words found</p>
	{/if}
</main>

<style>
	:global(body) {
		background-color: #121213;
		--color-absent: #3a3a3c;
    --color-correct: #538d4e;
    --color-present: #b59f3b;
    --color-undefined: transparent;
		--color-text-normal: #d7dadc;
		--color-text-error: #e9667b;
		--color-text-link: #3b81e9;
		font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
	}

	main {
		padding-top: 12px;
	}

	.loader {
		margin-top: 10px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		color: var(--color-text-normal);
		font-weight: 600;
		font-size: 22px;
	}
	.entry {
		margin-top: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.word {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.letters {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.count progress {
    height: 6px;
		-webkit-appearance: none;
    appearance: none;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
	}

	.count progress::-webkit-progress-bar {
		background-color: var(--color-text-normal);
	}
	.count progress::-webkit-progress-value {
		background-color: var(--color-correct);
	}

	.next {
		font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
		background-color: transparent;
		color: var(--color-text-normal);
		text-transform: uppercase;
		border: 2px solid var(--color-text-normal);
		font-size: 14px;
		font-weight: 600;
		line-height: 20px;
		padding: 2px 4px;
		margin: 0 0 0 5px;
		border-radius: 10px;
		cursor: pointer;
	}

	.change {
		font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
		background-color: transparent;
		border: 2px transparent;
		font-size: 14px;
		font-weight: 500;
		line-height: 20px;
		padding: 2px 4px;
		cursor: pointer;
		color: var(--color-text-link);
		margin: 0 0 0 5px;
	}
	.change span {
		color: var(--color-text-normal);
	}
	.next:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.noword {
		margin-top: 10px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		color: var(--color-text-error);
		font-weight: 600;
		font-size: 22px;
		text-transform: uppercase;
	}

	.button-bar {
		display: flex;
	}
	@media only screen and (max-width: 768px) {
		.entry {
			margin-top: 0;
		}
		.next, .change {
			font-size: 16px;
			line-height: 30px;
			margin-top: 8px;
		}
	}
</style>