<script>
	import Letter from './Letter.svelte';
	import Wordle from './wordle';
	
	const w = new Wordle();

	let words = [
		[{letter: 'h'}, {letter: 'e'}, {letter: 'l'}, {letter: 'l'}, {letter: 'o'}]
	];
	let candidateWords = [
		[{letter: 'w'}, {letter: 'o'}, {letter: 'r'}, {letter: 'l'}, {letter: 'd'}],
		[{letter: 'f'}, {letter: 'o'}, {letter: 'o'}, {letter: 'l'}, {letter: 's'}]
	];
	let nextDisabled = true;

	function nextWord() {
		w.pushRow(words[words.length - 1]);
		console.log(w.agg());
		words = [...words, candidateWords.shift()];
	}

	function colorChanged(position, color) {
		words[words.length - 1][position].color = Wordle.COLOR[color];
		nextDisabled = !nextEnabled();
	}

	function nextEnabled() {
		return words[words.length - 1].filter(l => l.color === undefined).length === 0;
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
	{#each words as word, i}
		<div class="entry">
			<div class="word">
				{#each word.map(({letter}) => letter) as l, position}
					<Letter letter="{l}" color="" frozen={i < words.length - 1} on:colorchange={(event) => colorChanged(position, event.detail.color)}></Letter>
				{/each}
			</div>
			<button class="next" on:click={nextWord} disabled={nextDisabled}>Next Word</button>
		</div>
	{/each}
</main>

<style>
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