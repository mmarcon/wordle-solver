<script>
	import Letter from './Letter.svelte';
	import Wordle from './wordle';
	import * as Realm from "realm-web";
	
	const w = new Wordle();
	const app = new Realm.App({ id: 'wordle-gvqgy' });
	const credentials = Realm.Credentials.anonymous();

	let words = [];
	let nextDisabled = true;
	let noword = false;

	function colorChanged(position, color) {
		words[words.length - 1][position].color = Wordle.COLOR[color];
		nextDisabled = !nextEnabled();
	}

	function nextEnabled() {
		return words[words.length - 1].filter(l => l.color === undefined).length === 0 &&
			words[words.length - 1].filter(l => l.color === Wordle.COLOR.correct).length < 5
	}

	async function getNextWord() {
		if(words.length > 0) {
			w.pushRow(words[words.length - 1]);
		}
		if(!app.currentUser) {
			await app.logIn(credentials);
		}
		const placeholder = words.length > 0 ? 
			words[words.length - 1].map(l => l.color === Wordle.COLOR.correct ? l : {letter: '?'}) :
			[{letter: '?'}, {letter: '?'}, {letter: '?'}, {letter: '?'}, {letter: '?'}];
		words = [...words, placeholder];
		const agg = w.agg();
		console.log(agg);
		const mongodb = app.currentUser.mongoClient('mongodb-atlas');
		const dictionary = mongodb.db('wordle_solver').collection('dictionary');
		try {
			const [{word}] = await dictionary.aggregate(agg);
			words.pop();
			words = [...words, word.split('').map((letter, p) => ({letter, color: placeholder[p].color}))];
			return words;
		} catch {
			noword = true;
		}
	}
</script>

<main>
	{#await getNextWord()}
		<p class="loader">Setting things up...</p>
	{:then _} 
		{#each words as word, i}
			<div class="entry">
				<div class="word">
					{#each word as l, position}
						<Letter letter={l.letter} color={Wordle.color(l.color)} frozen={i < words.length - 1} on:colorchange={(event) => colorChanged(position, event.detail.color)}></Letter>
					{/each}
				</div>
				<button class="next" on:click|once={getNextWord} disabled={nextDisabled}>Next Word</button>
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
	}

	.loader {
		margin-top: 10px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		color: #d7dadc;
		font-weight: 600;
		font-size: 22px;
	}
	.entry {
		margin-top: 10px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		flex-wrap: wrap;
	}
	.word {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.next {
		font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
		background-color: transparent;
		color: #d7dadc;
		text-transform: uppercase;
		border: 2px solid #d7dadc;
		font-size: 14px;
		font-weight: 600;
		line-height: 20px;
		padding: 2px 4px;
		margin: 0 0 0 5px;
		visibility: hidden;
		border-radius: 10px;
		cursor: pointer;
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
		color: #e9667b;
		font-weight: 600;
		font-size: 22px;
		text-transform: uppercase;
	}

	@media only screen and (max-width: 768px) {
		.entry {
			margin-top: 0;
		}
		.next {
			font-size: 16px;
			line-height: 30px;
			margin-top: 8px;
			display: none;
		}
	}

	.entry:last-child .next {
		display: block;
		visibility: visible;
	}
</style>