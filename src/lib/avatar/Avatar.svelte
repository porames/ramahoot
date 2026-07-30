<script module lang="ts">
  let nextId = 0;
</script>

<script lang="ts">
  import Character from '$lib/avatar/Character.svelte';

  let {
    characterType = 'human',
    faceColor = '#FFCC4D',
    eyeStyle = 'normal',
    mouthStyle = 'smile',
    glasses = 'none',
    hat = 'none',
    showBackground = true,
    gradSuffix = ''
  } = $props();

  let id = $derived(gradSuffix || `a${++nextId}`);

  function shade(hex: string, percent: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent));
    const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent));
    return `rgb(${r}, ${g}, ${b})`;
  }

  let outlineColor = $derived(shade(faceColor, -55));
  let faceHighlight = $derived(shade(faceColor, 30));
  let faceShadow = $derived(shade(faceColor, -35));
</script>

<svg id="avatar-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faceGrad-{id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color={faceHighlight} />
      <stop offset="100%" stop-color={faceShadow} />
    </linearGradient>
    <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff6f91" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#ff6f91" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="eyeGrad" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#4a4a52" />
      <stop offset="100%" stop-color="#141419" />
    </radialGradient>
    <linearGradient id="mouthGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6b2828" />
      <stop offset="100%" stop-color="#a03838" />
    </linearGradient>
    <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff8fa3" />
      <stop offset="100%" stop-color="#d94f68" />
    </linearGradient>
    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8ecdf0" />
      <stop offset="100%" stop-color="#4a90c2" />
    </linearGradient>
    <linearGradient id="gradDark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a4a4a" />
      <stop offset="100%" stop-color="#1a1a1a" />
    </linearGradient>
    <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe9a8" />
      <stop offset="100%" stop-color="#f2a52c" />
    </linearGradient>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e8e0f4" />
    </radialGradient>
    <filter id="faceShadow-f-{id}" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.18" />
    </filter>
  </defs>

  {#if showBackground}
    <circle cx="150" cy="150" r="148" fill="url(#bgGrad)" />
  {/if}

  <Character
    {characterType}
    {faceColor}
    {outlineColor}
    {faceHighlight}
    {faceShadow}
    {eyeStyle}
    {mouthStyle}
    {glasses}
    {hat}
    gradSuffix={id}
  />
</svg>
