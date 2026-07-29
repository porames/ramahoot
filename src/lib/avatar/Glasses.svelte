<script>
  let { glassesType = 'none', transform = '' } = $props();
</script>

{#if glassesType === 'round'}
  <g {transform}>
    <circle cx="108" cy="130" r="26" fill="none" stroke="#3a3a3a" stroke-width="6" />
    <circle cx="192" cy="130" r="26" fill="none" stroke="#3a3a3a" stroke-width="6" />
    <line x1="134" y1="130" x2="166" y2="130" stroke="#3a3a3a" stroke-width="6" />
    <line x1="82" y1="130" x2="62" y2="122" stroke="#3a3a3a" stroke-width="6" />
    <line x1="218" y1="130" x2="238" y2="122" stroke="#3a3a3a" stroke-width="6" />
  </g>
{:else if glassesType === 'shades'}
  <g {transform}>
    <rect
      x="80"
      y="110"
      width="60"
      height="45"
      rx="12"
      fill="url(#gradDark)"
      stroke="#3a3a3a"
      stroke-width="5"
    />
    <path d="M 84 114 Q 100 112 115 118 L 108 135 Q 100 130 88 130 Z" fill="#fff" opacity="0.2" />
    <rect
      x="164"
      y="110"
      width="60"
      height="45"
      rx="12"
      fill="url(#gradDark)"
      stroke="#3a3a3a"
      stroke-width="5"
    />
    <path d="M 168 114 Q 184 112 199 118 L 192 135 Q 184 130 172 130 Z" fill="#fff" opacity="0.2" />
    <line x1="136" y1="128" x2="164" y2="128" stroke="#3a3a3a" stroke-width="6" />
    <line x1="80" y1="124" x2="58" y2="116" stroke="#3a3a3a" stroke-width="6" />
    <line x1="220" y1="124" x2="242" y2="116" stroke="#3a3a3a" stroke-width="6" />
  </g>
{/if}
