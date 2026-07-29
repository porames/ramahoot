<script>
  let {
    mouthStyle = 'smile',
    characterType = 'human',
    outlineColor = '#3a3a3a',
    transform = ''
  } = $props();
</script>

<g {transform}>
  {#if characterType === 'human'}
    <!-- Cheeks -->
    {#if mouthStyle === 'smile' || mouthStyle === 'laugh' || mouthStyle === 'tongue'}
      <ellipse cx="92" cy="172" rx="18" ry="11" fill="url(#cheekGrad)" />
      <ellipse cx="208" cy="172" rx="18" ry="11" fill="url(#cheekGrad)" />
    {/if}
    <!-- Mouth -->
    {#if mouthStyle === 'smile'}
      <path
        d="M 100 178 Q 150 218 200 178"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
    {:else if mouthStyle === 'laugh'}
      <path
        d="M 95 175 Q 150 230 205 175 Q 150 200 95 175 Z"
        fill="url(#mouthGrad)"
        stroke="#3a3a3a"
        stroke-width="5"
        stroke-linejoin="round"
      />
      <path d="M 108 178 Q 150 195 192 178" fill="#fff" stroke="#3a3a3a" stroke-width="2" />
      <ellipse cx="150" cy="202" rx="16" ry="9" fill="url(#gradPink)" />
    {:else if mouthStyle === 'neutral'}
      <line
        x1="115"
        y1="188"
        x2="185"
        y2="188"
        stroke="#3a3a3a"
        stroke-width="7"
        stroke-linecap="round"
      />
    {:else if mouthStyle === 'sad'}
      <path
        d="M 100 200 Q 150 170 200 200"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
    {:else if mouthStyle === 'surprised'}
      <ellipse
        cx="150"
        cy="188"
        rx="16"
        ry="20"
        fill="url(#mouthGrad)"
        stroke="#3a3a3a"
        stroke-width="5"
      />
    {:else if mouthStyle === 'tongue'}
      <path
        d="M 100 178 Q 150 218 200 178"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 128 198 Q 150 224 172 198 Q 150 206 128 198 Z"
        fill="url(#gradPink)"
        stroke="#3a3a3a"
        stroke-width="4"
        stroke-linejoin="round"
      />
    {:else if mouthStyle === 'smirk'}
      <path
        d="M 110 185 Q 150 200 195 175"
        stroke="#3a3a3a"
        stroke-width="7"
        fill="none"
        stroke-linecap="round"
      />
    {/if}
  {:else if characterType === 'cat'}
    <g transform="translate(7, 8)">
      {#if mouthStyle === 'smile'}
        <path
          d="M 135 182 Q 150 195 165 182"
          stroke={outlineColor}
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
        />
      {:else if mouthStyle === 'neutral'}
        <line
          x1="135"
          y1="188"
          x2="165"
          y2="188"
          stroke={outlineColor}
          stroke-width="4"
          stroke-linecap="round"
        />
      {:else if mouthStyle === 'sad'}
        <path
          d="M 135 195 Q 150 182 165 195"
          stroke={outlineColor}
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
        />
      {:else}
        <path
          d="M 135 182 Q 150 195 165 182"
          stroke={outlineColor}
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
        />
      {/if}
    </g>
  {:else if characterType === 'dog'}
    <g transform="scale(0.5) translate(152,220)">
      {#if mouthStyle === 'smile'}
        <path
          d="M 100 178 Q 150 218 200 178"
          stroke={outlineColor}
          stroke-width="10"
          fill="none"
          stroke-linecap="round"
        />
      {:else if mouthStyle === 'laugh'}
        <path
          d="M 95 175 Q 150 230 205 175 Q 150 200 95 175 Z"
          fill="url(#mouthGrad)"
          stroke={outlineColor}
          stroke-width="5"
          stroke-linejoin="round"
        />
        <path d="M 108 178 Q 150 195 192 178" fill="#fff" stroke={outlineColor} stroke-width="2" />
        <ellipse cx="150" cy="202" rx="16" ry="9" fill="url(#gradPink)" />
      {:else if mouthStyle === 'neutral'}
        <line
          x1="115"
          y1="188"
          x2="185"
          y2="188"
          stroke={outlineColor}
          stroke-width="10"
          stroke-linecap="round"
        />
      {:else if mouthStyle === 'sad'}
        <path
          d="M 100 200 Q 150 170 200 200"
          stroke={outlineColor}
          stroke-width="10"
          fill="none"
          stroke-linecap="round"
        />
      {:else if mouthStyle === 'surprised'}
        <ellipse
          cx="150"
          cy="188"
          rx="16"
          ry="20"
          fill="url(#mouthGrad)"
          stroke={outlineColor}
          stroke-width="5"
        />
      {:else if mouthStyle === 'tongue'}
        <path
          d="M 100 178 Q 150 218 200 178"
          stroke={outlineColor}
          stroke-width="10"
          fill="none"
          stroke-linecap="round"
        />
        <path
          d="M 128 198 Q 150 224 172 198 Q 150 206 128 198 Z"
          fill="url(#gradPink)"
          stroke={outlineColor}
          stroke-width="4"
          stroke-linejoin="round"
        />
      {:else if mouthStyle === 'smirk'}
        <path
          d="M 110 185 Q 150 200 195 175"
          stroke={outlineColor}
          stroke-width="10"
          fill="none"
          stroke-linecap="round"
        />
      {/if}
    </g>
  {:else if characterType === 'bear'}
    <!-- Cheeks -->
    {#if mouthStyle === 'smile' || mouthStyle === 'laugh' || mouthStyle === 'tongue'}
      <ellipse cx="92" cy="172" rx="18" ry="11" fill="url(#cheekGrad)" />
      <ellipse cx="208" cy="172" rx="18" ry="11" fill="url(#cheekGrad)" />
    {/if}
    {#if mouthStyle === 'sad'}
      <path
        d="M 130 185 Q 150 175 170 185"
        stroke={outlineColor}
        stroke-width="4"
        fill="none"
        stroke-linecap="round"
      />
    {:else if mouthStyle === 'surprised'}
      <ellipse
        cx="150"
        cy="185"
        rx="10"
        ry="12"
        fill="url(#mouthGrad)"
        stroke={outlineColor}
        stroke-width="3"
      />
    {:else if mouthStyle === 'neutral'}
      <line
        x1="135"
        y1="185"
        x2="165"
        y2="185"
        stroke={outlineColor}
        stroke-width="4"
        stroke-linecap="round"
      />
    {:else}
      <path
        d="M 130 183 Q 150 198 170 183"
        stroke={outlineColor}
        stroke-width="4"
        fill="none"
        stroke-linecap="round"
      />
    {/if}
  {:else if characterType === 'panda'}
    {#if mouthStyle === 'sad'}
      <path
        d="M 132 178 Q 150 170 168 178"
        stroke={outlineColor}
        stroke-width="3.5"
        fill="none"
        stroke-linecap="round"
      />
    {:else if mouthStyle === 'surprised'}
      <ellipse
        cx="150"
        cy="180"
        rx="8"
        ry="10"
        fill="url(#mouthGrad)"
        stroke={outlineColor}
        stroke-width="3"
      />
    {:else if mouthStyle === 'neutral'}
      <line
        x1="135"
        y1="178"
        x2="165"
        y2="178"
        stroke={outlineColor}
        stroke-width="3.5"
        stroke-linecap="round"
      />
    {:else}
      <path
        d="M 132 176 Q 150 190 168 176"
        stroke={outlineColor}
        stroke-width="3.5"
        fill="none"
        stroke-linecap="round"
      />
    {/if}
  {:else if characterType === 'koala'}
    {#if mouthStyle === 'surprised'}
      <ellipse
        cx="150"
        cy="195"
        rx="8"
        ry="8"
        fill="url(#mouthGrad)"
        stroke={outlineColor}
        stroke-width="3"
      />
    {:else if mouthStyle === 'neutral'}
      <line
        x1="138"
        y1="192"
        x2="162"
        y2="192"
        stroke={outlineColor}
        stroke-width="3"
        stroke-linecap="round"
      />
    {:else if mouthStyle === 'sad'}
      <path
        d="M 135 195 Q 150 188 165 195"
        stroke={outlineColor}
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
    {:else}
      <path
        d="M 135 191 Q 150 200 165 191"
        stroke={outlineColor}
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
    {/if}
  {/if}
</g>
