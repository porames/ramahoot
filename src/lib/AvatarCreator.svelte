<script lang="ts">
  import Avatar from '$lib/avatar/Avatar.svelte';

  let { onConfigChange, savedConfig } = $props();

  // ---------- State ----------
  let faceColor = $state('#FFCC4D');
  let eyeStyle = $state('normal'); // normal | happy | wink | wide | sleepy
  let mouthStyle = $state('smile'); // smile | laugh | neutral | sad | surprised | tongue | smirk
  let glasses = $state('none'); // none | round | shades | heart
  let hat = $state('none'); // none | party | cap | top | crown | headband
  let characterType = $state('human'); // human | cat | dog | bear | panda | koala | penguin | chicken

  $effect(() => {
    const config = { characterType, faceColor, eyeStyle, mouthStyle, glasses, hat };
    console.log('AvatarConfig:', config);
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
    '#FFCC4D',
    '#FFD983',
    '#F4A548',
    '#E0A899',
    '#C68642',
    '#8D5524',
    '#F5C6A5',
    '#B0E0E6'
  ];

  const eyeOptions = [
    { id: 'normal', label: 'Normal' },
    { id: 'happy', label: 'Happy' },
    { id: 'wink', label: 'Wink' },
    { id: 'wide', label: 'Wide' },
    { id: 'sleepy', label: 'Sleepy' }
  ];

  const mouthOptions = [
    { id: 'smile', label: 'Smile' },
    { id: 'laugh', label: 'Laugh' },
    { id: 'neutral', label: 'Neutral' },
    { id: 'sad', label: 'Sad' },
    { id: 'surprised', label: 'Surprised' },
    { id: 'tongue', label: 'Tongue' },
    { id: 'smirk', label: 'Smirk' }
  ];

  const glassesOptions = [
    { id: 'none', label: 'None' },
    { id: 'round', label: 'Round' },
    { id: 'shades', label: 'Shades' }
  ];

  const hatOptions = [
    { id: 'none', label: 'None' },
    { id: 'party', label: 'Party' },
    { id: 'cap', label: 'Cap' },
    { id: 'top', label: 'Top Hat' },
    { id: 'crown', label: 'Crown' }
  ];

  const characterOptions = [
    { id: 'human', label: 'Human' },
    { id: 'cat', label: 'Cat' },
    { id: 'dog', label: 'Dog' },
    { id: 'bear', label: 'Bear' }
  ];

  const characterDefaultColors = {
    human: '#FFCC4D',
    cat: '#FFF5F5',
    dog: '#E8B87D',
    bear: '#8B5E3C'
  };

  function randomize() {
    characterType = characterOptions[Math.floor(Math.random() * characterOptions.length)].id;
    faceColor = characterDefaultColors[characterType as keyof typeof characterDefaultColors];
    eyeStyle = eyeOptions[Math.floor(Math.random() * eyeOptions.length)].id;
    mouthStyle = mouthOptions[Math.floor(Math.random() * mouthOptions.length)].id;
    glasses = glassesOptions[Math.floor(Math.random() * glassesOptions.length)].id;
    hat = hatOptions[Math.floor(Math.random() * hatOptions.length)].id;
  }

  function reset() {
    characterType = 'human';
    faceColor = '#FFCC4D';
    eyeStyle = 'normal';
    mouthStyle = 'smile';
    glasses = 'none';
    hat = 'none';
  }

  function changeCharacter(id: string) {
    characterType = id;
    faceColor = characterDefaultColors[id as keyof typeof characterDefaultColors];
  }
</script>

<div
  class="flex flex-wrap gap-8 max-w-[900px] mx-auto p-6 text-slate-700 flex-col items-center sm:flex-row sm:items-start"
>
  <div class="flex-1 basis-[280px] flex flex-col items-center gap-4">
    <div
      class="w-full max-w-[280px] aspect-square bg-gray-100 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden"
    >
      <Avatar {characterType} {faceColor} {eyeStyle} {mouthStyle} {glasses} {hat} />
    </div>

    <div class="flex flex-wrap gap-2 justify-center">
      <button
        class="border-none rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-transform hover:-translate-y-px bg-[#eceef1] text-slate-700"
        onclick={randomize}>🎲 Randomize</button
      >
      <button
        class="border-none rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-transform hover:-translate-y-px bg-[#eceef1] text-slate-700"
        onclick={reset}>↺ Reset</button
      >
    </div>
  </div>

  <div class="flex-1 basis-[380px] flex flex-col gap-5">
    <section>
      <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-2">Character</h3>
      <div class="flex flex-wrap gap-2">
        {#each characterOptions as opt}
          <button
            class="border rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors hover:border-[#5dade2]"
            class:bg-[#5dade2]={characterType === opt.id}
            class:border-[#5dade2]={characterType === opt.id}
            class:text-white={characterType === opt.id}
            class:bg-white={characterType !== opt.id}
            class:border-gray-300={characterType !== opt.id}
            onclick={() => changeCharacter(opt.id)}>{opt.label}</button
          >
        {/each}
      </div>
    </section>

    <section>
      <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-2">Skin tone</h3>
      <div class="flex flex-wrap gap-2 items-center">
        {#each faceColors as color}
          <button
            class="w-[34px] h-[34px] rounded-full border-2 border-transparent cursor-pointer p-0"
            class:border-slate-800={faceColor === color}
            class:shadow-[inset_0_0_0_2px_white]={faceColor === color}
            style="background-color: {color}"
            onclick={() => (faceColor = color)}
            aria-label="Select color {color}"
          ></button>
        {/each}
        <input
          type="color"
          bind:value={faceColor}
          class="w-[34px] h-[34px] p-0 border-2 border-gray-300 rounded-full cursor-pointer bg-transparent"
          aria-label="Custom color picker"
        />
      </div>
    </section>

    <section>
      <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-2">Eyes</h3>
      <div class="flex flex-wrap gap-2">
        {#each eyeOptions as opt}
          <button
            class="border rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors hover:border-[#5dade2]"
            class:bg-[#5dade2]={eyeStyle === opt.id}
            class:border-[#5dade2]={eyeStyle === opt.id}
            class:text-white={eyeStyle === opt.id}
            class:bg-white={eyeStyle !== opt.id}
            class:border-gray-300={eyeStyle !== opt.id}
            onclick={() => (eyeStyle = opt.id)}>{opt.label}</button
          >
        {/each}
      </div>
    </section>

    <section>
      <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-2">Expression</h3>
      <div class="flex flex-wrap gap-2">
        {#each mouthOptions as opt}
          <button
            class="border rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors hover:border-[#5dade2]"
            class:bg-[#5dade2]={mouthStyle === opt.id}
            class:border-[#5dade2]={mouthStyle === opt.id}
            class:text-white={mouthStyle === opt.id}
            class:bg-white={mouthStyle !== opt.id}
            class:border-gray-300={mouthStyle !== opt.id}
            onclick={() => (mouthStyle = opt.id)}>{opt.label}</button
          >
        {/each}
      </div>
    </section>

    <section>
      <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-2">Glasses</h3>
      <div class="flex flex-wrap gap-2">
        {#each glassesOptions as opt}
          <button
            class="border rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors hover:border-[#5dade2]"
            class:bg-[#5dade2]={glasses === opt.id}
            class:border-[#5dade2]={glasses === opt.id}
            class:text-white={glasses === opt.id}
            class:bg-white={glasses !== opt.id}
            class:border-gray-300={glasses !== opt.id}
            onclick={() => (glasses = opt.id)}>{opt.label}</button
          >
        {/each}
      </div>
    </section>

    <section>
      <h3 class="text-xs uppercase tracking-wider text-slate-400 mb-2">Hat</h3>
      <div class="flex flex-wrap gap-2">
        {#each hatOptions as opt}
          <button
            class="border rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors hover:border-[#5dade2]"
            class:bg-[#5dade2]={hat === opt.id}
            class:border-[#5dade2]={hat === opt.id}
            class:text-white={hat === opt.id}
            class:bg-white={hat !== opt.id}
            class:border-gray-300={hat !== opt.id}
            onclick={() => (hat = opt.id)}>{opt.label}</button
          >
        {/each}
      </div>
    </section>
  </div>
</div>
