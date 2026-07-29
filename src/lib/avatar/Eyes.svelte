<script>
  let { eyeStyle = 'normal', hide = false, transform = '' } = $props();
</script>

{#if !hide}
  <g {transform}>
    <!-- Eyebrows -->
    {#if eyeStyle === 'happy' || eyeStyle === 'laugh'}
      <path
        d="M 92 102 Q 110 90 128 102"
        stroke="#3a3a3a"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 172 102 Q 190 90 208 102"
        stroke="#3a3a3a"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
    {:else if eyeStyle === 'sad'}
      <path
        d="M 92 108 Q 110 118 128 108"
        stroke="#3a3a3a"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 172 108 Q 190 118 208 108"
        stroke="#3a3a3a"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
    {:else if eyeStyle === 'surprised' || eyeStyle === 'wide'}
      <path
        d="M 90 96 Q 110 84 130 96"
        stroke="#3a3a3a"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 170 96 Q 190 84 210 96"
        stroke="#3a3a3a"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
    {:else}
      <path
        d="M 92 104 Q 110 94 128 104"
        stroke="#3a3a3a"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 172 104 Q 190 94 208 104"
        stroke="#3a3a3a"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
    {/if}

    <!-- Eyes -->
    {#if eyeStyle === 'normal'}
      <circle cx="108" cy="130" r="20" fill="#fff" stroke="#3a3a3a" stroke-width="5" />
      <circle cx="192" cy="130" r="20" fill="#fff" stroke="#3a3a3a" stroke-width="5" />
      <circle cx="108" cy="132" r="10" fill="url(#eyeGrad)" />
      <circle cx="192" cy="132" r="10" fill="url(#eyeGrad)" />
      <circle cx="104" cy="127" r="3.5" fill="#fff" />
      <circle cx="188" cy="127" r="3.5" fill="#fff" />
    {:else if eyeStyle === 'happy'}
      <path
        d="M 90 132 Q 108 112 126 132"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 174 132 Q 192 112 210 132"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
    {:else if eyeStyle === 'wink'}
      <circle cx="108" cy="130" r="20" fill="#fff" stroke="#3a3a3a" stroke-width="5" />
      <circle cx="108" cy="132" r="10" fill="url(#eyeGrad)" />
      <circle cx="104" cy="127" r="3.5" fill="#fff" />
      <path
        d="M 174 130 Q 192 142 210 130"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
    {:else if eyeStyle === 'wide'}
      <circle cx="108" cy="130" r="24" fill="#fff" stroke="#3a3a3a" stroke-width="5" />
      <circle cx="192" cy="130" r="24" fill="#fff" stroke="#3a3a3a" stroke-width="5" />
      <circle cx="108" cy="132" r="12" fill="url(#eyeGrad)" />
      <circle cx="192" cy="132" r="12" fill="url(#eyeGrad)" />
      <circle cx="103" cy="126" r="4" fill="#fff" />
      <circle cx="187" cy="126" r="4" fill="#fff" />
    {:else if eyeStyle === 'sleepy'}
      <path
        d="M 92 130 Q 108 122 124 130"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 176 130 Q 192 122 208 130"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
    {/if}
  </g>
{/if}
