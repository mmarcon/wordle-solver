<script>
	import Letter from './Letter.svelte';
	import Wordle from './wordle';
	import * as Realm from "realm-web";
	
	const w = new Wordle();
	const app = new Realm.App({ id: 'wordle-gvqgy' });

	let words = [];
	let nextDisabled = true;

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
		const agg = w.agg();
		const mongodb = app.currentUser.mongoClient('mongodb-atlas');
		const dictionary = mongodb.db('wordle_solver').collection('dictionary');
		const [{word}] = await dictionary.aggregate(agg);
		words = [...words, word.split('').map(letter => ({letter}))];
		return words;
	}
</script>

<svelte:head>
	
	<style>
		body {
			background-color: #121213;
		}
	</style>
</svelte:head>

<main>
	{#await getNextWord()}
		<p class="loader">Setting things up...</p>
	{:then _} 
		{#each words as word, i}
			<div class="entry">
				<div class="word">
					{#each word.map(({letter}) => letter) as l, position}
						<Letter letter="{l}" color="" frozen={i < words.length - 1} on:colorchange={(event) => colorChanged(position, event.detail.color)}></Letter>
					{/each}
				</div>
				<button class="next" on:click={getNextWord} disabled={nextDisabled}>Next Word</button>
			</div>
		{/each}
	{/await}
</main>

<style>
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
	.entry:last-child .next {
		visibility: visible;
	}
	.next:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>