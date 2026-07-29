<script>
  let { hatType = 'none', transform = '' } = $props();
</script>

{#if hatType === 'party'}
  <g {transform}>
    <g transform="translate(150, 98) scale(0.2) translate(-224, -480)">
      <path
        fill="#EAF3FF"
        d="M415.701 428.636c-101.803 39.09-258.047 38.246-382.498.634L226.026 11.35l189.675 417.286z"
      />
      <path
        fill="#D9E6F7"
        d="M415.701 428.636c-23.176 8.898-49.18 15.722-76.982 20.519l-155.54-344.939 42.847-92.866 189.675 417.286z"
      />
      <circle fill="#FFC522" cx="224" cy="41.587" r="41.587" />
      <path
        fill="#FFCF4C"
        d="M224 0l.231.003c8.091 6.805 13.235 17.002 13.235 28.402 0 20.489-16.61 37.099-37.098 37.099-4.062 0-7.97-.654-11.628-1.861a41.387 41.387 0 01-6.327-22.056C182.413 18.619 201.032 0 224 0z"
      />
      <path
        fill="#F0325A"
        d="M365.602 318.418l2.244 4.934 22.921 50.9c-25.624 19.277-49.588 35.363-72.082 48.622-24.62 14.511-47.48 27.154-68.826 35.368-61.399 1.62-117.513-4.086-166.093-16.272 92.971-19.57 187.878-59.605 281.836-123.552z"
      />
      <path
        fill="#547AF2"
        d="M342.897 268.467l5.305 11.668c-99.515 68.777-202.185 108.344-303.959 125.893l36.923-80.5c79.854-19.696 160.017-49.488 240.864-101.904l20.867 44.843z"
      />
      <path
        fill="#F0325A"
        d="M106.033 271.422l38.447-83.331c46.821-17.884 89.672-37.448 134.774-59.638l2.511 5.524 22.558 51.606c-59.618 38.329-126.666 65.517-198.29 85.839z"
      />
      <path
        fill="#FF526D"
        fill-rule="nonzero"
        d="M19.339 480.469C4.699 475.77-3.359 460.09 1.34 445.451c4.699-14.64 20.378-22.698 35.017-17.999 58.268 18.731 124.959 28.591 191.461 28.567 64.05-.026 127.699-9.224 183.169-28.504 14.52-5.061 30.393 2.607 35.454 17.127s-2.607 30.394-17.127 35.454c-61.413 21.346-131.404 31.529-201.496 31.557-72.255.028-144.873-10.737-208.479-31.184z"
      />
    </g>
  </g>
{:else if hatType === 'cap'}
  <g {transform}>
    <path
      d="M 60 100 A 90 90 0 0 1 240 100 Z"
      fill="url(#gradBlue)"
      stroke="#3a3a3a"
      stroke-width="5"
    />
    <path d="M 150 14 L 150 96" stroke="#3f7fae" stroke-width="4" opacity="0.6" />
    <circle cx="150" cy="12" r="8" fill="#4a90c2" stroke="#3a3a3a" stroke-width="3" />
    <path
      d="M 55 100 Q 150 82 245 100 L 255 112 Q 150 94 45 112 Z"
      fill="#4a90c2"
      stroke="#3a3a3a"
      stroke-width="5"
      stroke-linejoin="round"
    />
  </g>
{:else if hatType === 'top'}
  <g {transform}>
    <rect
      x="100"
      y="8"
      width="100"
      height="60"
      rx="5"
      fill="url(#gradDark)"
      stroke="#3a3a3a"
      stroke-width="5"
    />
    <ellipse
      cx="150"
      cy="68"
      rx="78"
      ry="16"
      fill="url(#gradDark)"
      stroke="#3a3a3a"
      stroke-width="5"
    />
    <rect x="100" y="48" width="100" height="14" fill="url(#gradPink)" />
  </g>
{:else if hatType === 'crown'}
  <g {transform}>
    <path
      d="M 80 100 L 80 55 L 112 80 L 150 40 L 188 80 L 220 55 L 220 100 Z"
      fill="url(#gradGold)"
      stroke="#3a3a3a"
      stroke-width="5"
      stroke-linejoin="round"
    />
    <circle cx="150" cy="40" r="8" fill="#e8637d" stroke="#3a3a3a" stroke-width="2" />
    <circle cx="112" cy="80" r="5" fill="#5dade2" stroke="#3a3a3a" stroke-width="2" />
    <circle cx="188" cy="80" r="5" fill="#5dade2" stroke="#3a3a3a" stroke-width="2" />
  </g>
{/if}
