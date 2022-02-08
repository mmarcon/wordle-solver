<script>
	export let color, letter, frozen;

  function setColor(theColor) {
    color = theColor
  }
</script>

<div class="letter-wrapper">
  <div style="--letter-color: var(--color-{color})" class="letter">
    {letter}
  </div>
  <div class="color-selector">
    <button class="absent" on:click={()=>setColor('absent')} disabled={!!frozen}></button>
    <button class="present" on:click={()=>setColor('present')} disabled={!!frozen}></button>
    <button class="correct" on:click={()=>setColor('correct')} disabled={!!frozen}></button>
  </div>
</div>

<style>
  .letter-wrapper {
    --color-absent: #3a3a3c;
    --color-correct: #538d4e;
    --color-present: #b59f3b;
    --color-undefined: transparent;
    display: inline-flex;
    flex-direction: column;
    margin: 0 8px;
    align-items: center;
  }
  .letter {
    width: 62px;
    height: 62px;
		background-color: var(--letter-color);
    border: 1px solid #3a3a3c;
    color: #d7dadc;
    font-size: 32px;
    line-height: 32px;
    font-weight: 700;
    font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
    display: inline-flex;
    justify-content: center;
    vertical-align: middle;
    user-select: none;
    box-sizing: border-box;
    align-items: center;
    margin-bottom: 5px;
    text-transform: uppercase;
	}

  .color-selector button {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin: 0;
    padding: 0;
  }

  .color-selector button:disabled {
    display: none;
  }

  .color-selector .absent{
    background-color: var(--color-absent);
  }

  .color-selector .present{
    background-color: var(--color-present);
  }

  .color-selector .correct{
    background-color: var(--color-correct);
  }
</style>