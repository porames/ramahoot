<script lang="ts">
  import Avatar from '$lib/avatar/Avatar.svelte';

  let { onConfigChange, savedConfig } = $props();

  let faceColor = $state('#FFCC4D');
  let eyeStyle = $state('normal');
  let mouthStyle = $state('smile');
  let glasses = $state('none');
  let hat = $state('none');
  let characterType = $state('human');

  $effect(() => {
    const config = { characterType, faceColor, eyeStyle, mouthStyle, glasses, hat };
    onConfigChange?.(config);
  });

  $effect(() => {
    if (!savedConfig) return;
    characterType = savedConfig.characterType;
    faceColor = savedConfig.faceColor;
    eyeStyle = savedConfig.eyeStyle;
    mouthStyle = savedConfig.mouthStyle;
    glasses = savedConfig.glasses;
    hat = savedConfig.hat;
  });

  const faceColors = [
    '#FFCC4D', '#FFD983', '#F4A548', '#E0A899',
    '#C68642', '#8D5524', '#F5C6A5', '#B0E0E6'
  ];

  const eyeOptions = [
    { id: 'normal', label: 'Normal' }, { id: 'happy', label: 'Happy' },
    { id: 'wink', label: 'Wink' }, { id: 'wide', label: 'Wide' }, { id: 'sleepy', label: 'Sleepy' }
  ];

  const mouthOptions = [
    { id: 'smile', label: 'Smile' }, { id: 'laugh', label: 'Laugh' },
    { id: 'neutral', label: 'Neutral' }, { id: 'sad', label: 'Sad' },
    { id: 'surprised', label: 'Surprised' }, { id: 'tongue', label: 'Tongue' }, { id: 'smirk', label: 'Smirk' }
  ];

  const glassesOptions = [
    { id: 'none', label: 'None' }, { id: 'round', label: 'Round' }, { id: 'shades', label: 'Shades' }
  ];

  const hatOptions = [
    { id: 'none', label: 'None' }, { id: 'party', label: 'Party' },
    { id: 'cap', label: 'Cap' }, { id: 'top', label: 'Top Hat' }, { id: 'crown', label: 'Crown' }
  ];

  const characterOptions = [
    { id: 'human', label: 'Human' }, { id: 'cat', label: 'Cat' },
    { id: 'dog', label: 'Dog' }, { id: 'bear', label: 'Bear' }
  ];

  const characterDefaultColors: Record<string, string> = {
    human: '#FFCC4D', cat: '#FFF5F5', dog: '#E8B87D', bear: '#8B5E3C'
  };

  function randomize() {
    const type = characterOptions[Math.floor(Math.random() * characterOptions.length)].id;
    characterType = type;
    faceColor = characterDefaultColors[type];
    eyeStyle = eyeOptions[Math.floor(Math.random() * eyeOptions.length)].id;
    mouthStyle = mouthOptions[Math.floor(Math.random() * mouthOptions.length)].id;
    glasses = glassesOptions[Math.floor(Math.random() * glassesOptions.length)].id;
    hat = hatOptions[Math.floor(Math.random() * hatOptions.length)].id;
  }

  function reset() {
    characterType = 'human'; faceColor = '#FFCC4D'; eyeStyle = 'normal';
    mouthStyle = 'smile'; glasses = 'none'; hat = 'none';
  }

  function changeCharacter(id: string) {
    characterType = id;
    faceColor = characterDefaultColors[id] || '#FFCC4D';
  }
</script>

<div class="flex flex-wrap gap-6 max-w-[900px] mx-auto p-4 flex-col items-center sm:flex-row sm:items-start">
  <div class="flex-1 basis-[260px] flex flex-col items-center gap-4">
    <div class="w-full max-w-[240px] border-[4px] border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_#111] overflow-hidden">
      <Avatar {characterType} {faceColor} {eyeStyle} {mouthStyle} {glasses} {hat} />
    </div>
    <div class="flex gap-2">
      <button
        onclick={randomize}
        class="border-[3px] border-black rounded-lg bg-[#FFD23F] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all"
      >🎲 Randomize</button>
      <button
        onclick={reset}
        class="border-[3px] border-black rounded-lg bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all"
      >↺ Reset</button>
    </div>
  </div>

  <div class="flex-1 basis-[380px] flex flex-col gap-5">
    <section>
      <h3 class="text-xs font-bold text-black mb-2">Character</h3>
      <div class="flex flex-wrap gap-2">
        {#each characterOptions as opt}
          <button
            class="border-[3px] border-black rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
            class:bg-[#17C964]={characterType === opt.id}
            class:text-white={characterType === opt.id}
            class:shadow-[2px_2px_0px_0px_#111]={characterType === opt.id}
            class:bg-white={characterType !== opt.id}
            class:text-black={characterType !== opt.id}
            class:hover:shadow-[2px_2px_0px_0px_#111]={characterType !== opt.id}
            onclick={() => changeCharacter(opt.id)}
          >{opt.label}</button>
        {/each}
      </div>
    </section>

    <section>
      <h3 class="text-xs font-bold text-black mb-2">Skin tone</h3>
      <div class="flex flex-wrap gap-2 items-center">
        {#each faceColors as color}
          <button
            class="w-[34px] h-[34px] border-[3px] border-black rounded-full cursor-pointer p-0 transition-all"
            class:shadow-[2px_2px_0px_0px_#111]={faceColor === color}
            style="background-color: {color}"
            onclick={() => (faceColor = color)}
            aria-label="Select color {color}"
          ></button>
        {/each}
        <input
          type="color"
          bind:value={faceColor}
          class="w-[34px] h-[34px] border-[3px] border-black rounded-full cursor-pointer bg-transparent"
          aria-label="Custom color picker"
        />
      </div>
    </section>

    <section>
      <h3 class="text-xs font-bold text-black mb-2">Eyes</h3>
      <div class="flex flex-wrap gap-2">
        {#each eyeOptions as opt}
          <button
            class="border-[3px] border-black rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
            class:bg-[#4D7CFE]={eyeStyle === opt.id}
            class:text-white={eyeStyle === opt.id}
            class:shadow-[2px_2px_0px_0px_#111]={eyeStyle === opt.id}
            class:bg-white={eyeStyle !== opt.id}
            class:text-black={eyeStyle !== opt.id}
            class:hover:shadow-[2px_2px_0px_0px_#111]={eyeStyle !== opt.id}
            onclick={() => (eyeStyle = opt.id)}
          >{opt.label}</button>
        {/each}
      </div>
    </section>

    <section>
      <h3 class="text-xs font-bold text-black mb-2">Expression</h3>
      <div class="flex flex-wrap gap-2">
        {#each mouthOptions as opt}
          <button
            class="border-[3px] border-black rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
            class:bg-[#4D7CFE]={mouthStyle === opt.id}
            class:text-white={mouthStyle === opt.id}
            class:shadow-[2px_2px_0px_0px_#111]={mouthStyle === opt.id}
            class:bg-white={mouthStyle !== opt.id}
            class:text-black={mouthStyle !== opt.id}
            class:hover:shadow-[2px_2px_0px_0px_#111]={mouthStyle !== opt.id}
            onclick={() => (mouthStyle = opt.id)}
          >{opt.label}</button>
        {/each}
      </div>
    </section>

    <section>
      <h3 class="text-xs font-bold text-black mb-2">Glasses</h3>
      <div class="flex flex-wrap gap-2">
        {#each glassesOptions as opt}
          <button
            class="border-[3px] border-black rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
            class:bg-[#4D7CFE]={glasses === opt.id}
            class:text-white={glasses === opt.id}
            class:shadow-[2px_2px_0px_0px_#111]={glasses === opt.id}
            class:bg-white={glasses !== opt.id}
            class:text-black={glasses !== opt.id}
            class:hover:shadow-[2px_2px_0px_0px_#111]={glasses !== opt.id}
            onclick={() => (glasses = opt.id)}
          >{opt.label}</button>
        {/each}
      </div>
    </section>

    <section>
      <h3 class="text-xs font-bold text-black mb-2">Hat</h3>
      <div class="flex flex-wrap gap-2">
        {#each hatOptions as opt}
          <button
            class="border-[3px] border-black rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
            class:bg-[#4D7CFE]={hat === opt.id}
            class:text-white={hat === opt.id}
            class:shadow-[2px_2px_0px_0px_#111]={hat === opt.id}
            class:bg-white={hat !== opt.id}
            class:text-black={hat !== opt.id}
            class:hover:shadow-[2px_2px_0px_0px_#111]={hat !== opt.id}
            onclick={() => (hat = opt.id)}
          >{opt.label}</button>
        {/each}
      </div>
    </section>
  </div>
</div>