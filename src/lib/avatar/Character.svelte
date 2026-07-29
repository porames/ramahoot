<script lang="ts">
  import Eyes from '$lib/avatar/Eyes.svelte';
  import Expression from '$lib/avatar/Expression.svelte';
  import Glasses from '$lib/avatar/Glasses.svelte';
  import Hat from '$lib/avatar/Hat.svelte';

  let {
    characterType = 'human',
    faceColor = '#FFCC4D',
    outlineColor = '#3a3a3a',
    faceHighlight = '#FFCC4D',
    faceShadow = '#FFCC4D',
    eyeStyle = 'normal',
    mouthStyle = 'smile',
    glasses = 'none',
    hat = 'none'
  } = $props();

  let hideEyes = $derived(characterType === 'dog');
</script>

{#if characterType === 'human'}
  <ellipse
    cx="150"
    cy="150"
    rx="125"
    ry="115"
    fill="url(#faceGrad)"
    stroke={outlineColor}
    stroke-width="7"
    filter="url(#faceShadow-f)"
  />
  <ellipse cx="150" cy="155" rx="8" ry="6" fill={outlineColor} opacity="0.35" />
  <Eyes {eyeStyle} hide={hideEyes} />
  <Expression {mouthStyle} {characterType} {outlineColor} />
  <Glasses glassesType={glasses} />
  <Hat hatType={hat} />
{:else if characterType === 'cat'}
  <g filter="url(#faceShadow-f)">
    <path
      d="M50.9,137.5 C49.6,147.2 5.6,255.9 150.0,251.4 C294.4,246.9 268.6,177.0 259.0,137.5 C259.0,137.5 266.7,96.5 254.8,66.8 C254.8,66.8 223.1,64.9 197.7,92.1 C197.7,92.1 154.8,71.2 117.9,92.1 C117.9,92.1 89.9,69.5 60.3,66.8 C60.3,66.8 49.5,82.5 50.9,111.7 C52.3,140.9 52.2,127.9 50.9,137.5 Z"
      fill="url(#faceGrad)"
      stroke="none"
    />
    <path
      d="M50.9,137.5 C49.6,147.2 5.6,255.9 150.0,251.4 C294.4,246.9 268.6,177.0 259.0,137.5 C259.0,137.5 266.7,96.5 254.8,66.8 C254.8,66.8 223.1,64.9 197.7,92.1 C197.7,92.1 154.8,71.2 117.9,92.1 C117.9,92.1 89.9,69.5 60.3,66.8 C60.3,66.8 49.5,82.5 50.9,111.7 C52.3,140.9 52.2,127.9 50.9,137.5 Z"
      fill="none"
      stroke={outlineColor}
      stroke-width="6"
      stroke-linejoin="round"
    />
    <line
      x1="85"
      y1="170"
      x2="50"
      y2="165"
      stroke={outlineColor}
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <line
      x1="85"
      y1="180"
      x2="50"
      y2="180"
      stroke={outlineColor}
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <line
      x1="225"
      y1="170"
      x2="260"
      y2="165"
      stroke={outlineColor}
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <line
      x1="225"
      y1="180"
      x2="260"
      y2="180"
      stroke={outlineColor}
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <g transform="matrix(2.43281,0,0,2.43281,-351.492,-517.799)">
      <circle cx="227.113" cy="291.428" r="8.16" fill="url(#cheekGrad)" />
    </g>
    <g transform="matrix(2.43281,0,0,2.43281,-450.756,-517.799)">
      <circle cx="227.113" cy="291.428" r="8.16" fill="url(#cheekGrad)" />
    </g>
    <ellipse cx="157" cy="182" rx="10" ry="7.5" fill="#ff8597" />
  </g>
  <Eyes transform="translate(7,27)" {eyeStyle} hide={hideEyes} />
  <Expression {mouthStyle} {characterType} {outlineColor} />
  <Glasses transform="translate(7,27)" glassesType={glasses} />
  <Hat hatType={hat} />
{:else if characterType === 'dog'}
  <g transform="matrix(1,0,0,1,0.15175,0)">
    <g transform="matrix(0.82137,0,0,0.82137,-71.6259,-68.0319)">
      <path
        fill="url(#faceGrad)"
        d="M148.008,328.249C148.008,328.249 127.148,374.023 274.146,382.046C421.144,390.068 397.006,328.249 397.006,328.249L416.519,319.611C416.519,319.611 446.824,302.008 442.654,259.971C438.517,218.267 416.006,146.13 354.199,180.169L340.603,170.613C340.603,170.613 290.107,114.166 190.965,180.169L181.938,173.764C181.938,173.764 118.63,139.357 99.941,244.952C81.252,350.548 147.05,331.863 148.008,328.249Z"
      />
    </g>
    <g transform="matrix(0.82137,0,0,0.82137,-71.6259,-68.0319)">
      <path
        fill="url(#faceGrad)"
        d="M148.008,328.249C148.008,328.249 127.148,374.023 274.146,382.046C421.144,390.068 397.006,328.249 397.006,328.249L416.519,319.611C416.519,319.611 446.824,302.008 442.654,259.971C438.517,218.267 416.006,146.13 354.199,180.169L340.603,170.613C340.603,170.613 290.107,114.166 190.965,180.169L181.938,173.764C181.938,173.764 118.63,139.357 99.941,244.952C81.252,350.548 147.05,331.863 148.008,328.249Z"
      />
      <clipPath id="_clip1">
        <path
          d="M148.008,328.249C148.008,328.249 127.148,374.023 274.146,382.046C421.144,390.068 397.006,328.249 397.006,328.249L416.519,319.611C416.519,319.611 446.824,302.008 442.654,259.971C438.517,218.267 416.006,146.13 354.199,180.169L340.603,170.613C340.603,170.613 290.107,114.166 190.965,180.169L181.938,173.764C181.938,173.764 118.63,139.357 99.941,244.952C81.252,350.548 147.05,331.863 148.008,328.249Z"
        />
      </clipPath>
      <g clip-path="url(#_clip1)">
        <g transform="matrix(0.435456,-0.0678515,0.143912,0.923595,196.877,-13.4648)">
          <ellipse cx="354.052" cy="304.705" rx="119.548" ry="94.713" fill={faceShadow} />
        </g>
        <g transform="matrix(0.449837,0.129064,-0.257788,0.89849,66.2435,-73.0505)">
          <ellipse cx="354.052" cy="304.705" rx="119.548" ry="94.713" fill={faceShadow} />
        </g>
      </g>
    </g>
    <g transform="matrix(0.82137,0,0,0.82137,-71.6259,-68.0319)">
      <path
        d="M148.008,328.249C142.647,350.784 167.094,366.309 185.126,372.035C192.028,374.226 199.089,375.973 206.22,377.232C227.675,381.019 250.397,382.174 272.064,382.128C301.835,382.065 332.812,380.376 361.297,370.793C380.805,364.231 402.484,351.416 397.006,328.249L416.519,319.611C451.933,297.238 444.06,251.045 433.152,217.692C427.912,201.67 417.487,183.444 401.825,175.589C386.104,167.704 368.765,172.148 354.199,180.169C354.199,180.169 282.142,117.079 190.965,180.169L181.938,173.764C175.143,170.875 168.448,168.451 160.921,168.446C113.057,168.412 100.877,225.585 97.194,263.25C95.663,278.909 95.151,295.975 101.987,310.626C108.621,324.843 121.672,332.873 137.466,331.608C139.991,331.406 142.488,330.807 144.901,330.039C146.04,329.676 147.702,329.404 148.008,328.249Z"
        fill="none"
        stroke={outlineColor}
        stroke-width="7.61"
        stroke-linejoin="round"
      />
    </g>
    <g transform="matrix(0.82137,0,0,0.82137,-71.6259,-68.0319)">
      <path
        d="M397.006,328.249C394.207,327.343 391.402,326.435 388.683,325.31C383.204,323.044 376.69,319.639 372.094,315.931C369.372,313.735 366.931,311.193 364.627,308.562C356.026,298.738 358.277,284.826 364.395,274.469"
        fill="none"
        stroke={outlineColor}
        stroke-width="7.61"
        stroke-linecap="round"
      />
    </g>
    <g transform="matrix(0.82137,0,0,0.82137,-74.6259,-66.0319)">
      <path
        d="M148.008,328.249C151.096,326.746 154.188,325.241 157.185,323.565C162.999,320.313 170.152,315.712 175.095,311.304C184.092,303.28 192.771,291.271 184.048,279.702C182.692,277.904 181.102,276.272 179.393,274.805"
        fill="none"
        stroke={outlineColor}
        stroke-width="7.61"
        stroke-linecap="round"
      />
    </g>
    <g transform="matrix(2.43281,0,0,2.43281,-351.492,-517.799)">
      <circle cx="227.113" cy="291.428" r="8.16" fill="url(#cheekGrad)" />
    </g>
    <g transform="matrix(2.43281,0,0,2.43281,-450.756,-517.799)">
      <circle cx="227.113" cy="291.428" r="8.16" fill="url(#cheekGrad)" />
    </g>
    <g transform="matrix(0.82137,0,0,0.82137,-35.4834,-62.3356)">
      <circle cx="227.113" cy="291.428" r="8.16" fill="#1a1a1a" />
    </g>
  </g>
  <Eyes transform="translate(0,27)" {eyeStyle} hide={false} />
  <Expression {mouthStyle} {characterType} {outlineColor} />
  <Glasses transform="translate(0,27)" glassesType={glasses} />
  <Hat hatType={hat} />
{:else if characterType === 'bear'}
  <circle cx="62" cy="80" r="32" fill="url(#faceGrad)" stroke={outlineColor} stroke-width="6" />
  <circle cx="238" cy="80" r="32" fill="url(#faceGrad)" stroke={outlineColor} stroke-width="6" />
  <circle cx="62" cy="80" r="14" fill={faceShadow} opacity="0.25" />
  <circle cx="238" cy="80" r="14" fill={faceShadow} opacity="0.25" />
  <ellipse
    cx="150"
    cy="150"
    rx="128"
    ry="120"
    fill="url(#faceGrad)"
    stroke={outlineColor}
    stroke-width="7"
    filter="url(#faceShadow-f)"
  />
  <ellipse
    cx="150"
    cy="172"
    rx="34"
    ry="26"
    fill={faceHighlight}
    stroke={outlineColor}
    stroke-width="4"
    opacity="0.8"
  />
  <ellipse cx="150" cy="164" rx="11" ry="8" fill="#1a1a1a" />
  <Eyes {eyeStyle} hide={hideEyes} />
  <Expression {mouthStyle} {characterType} {outlineColor} />
  <Glasses glassesType={glasses} />
  <Hat hatType={hat} />
{:else if characterType === 'panda'}
  <circle cx="58" cy="78" r="30" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="3" />
  <circle cx="242" cy="78" r="30" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="3" />
  <circle
    cx="150"
    cy="152"
    r="116"
    fill="#fafafa"
    stroke="#1a1a1a"
    stroke-width="6"
    filter="url(#faceShadow-f)"
  />
  <ellipse cx="102" cy="128" rx="24" ry="20" fill="#1a1a1a" transform="rotate(-12, 102, 128)" />
  <ellipse cx="198" cy="128" rx="24" ry="20" fill="#1a1a1a" transform="rotate(12, 198, 128)" />
  <circle cx="108" cy="130" r="6" fill="#fff" />
  <circle cx="192" cy="130" r="6" fill="#fff" />
  <ellipse cx="150" cy="164" rx="9" ry="7" fill="#1a1a1a" />
  <Eyes {eyeStyle} hide={hideEyes} />
  <Expression {mouthStyle} {characterType} {outlineColor} />
  <Glasses glassesType={glasses} />
  <Hat hatType={hat} />
{:else if characterType === 'koala'}
  <circle cx="44" cy="82" r="38" fill="#a0a0a0" stroke={outlineColor} stroke-width="5" />
  <circle cx="256" cy="82" r="38" fill="#a0a0a0" stroke={outlineColor} stroke-width="5" />
  <circle cx="44" cy="82" r="22" fill="#cccccc" />
  <circle cx="256" cy="82" r="22" fill="#cccccc" />
  <ellipse
    cx="150"
    cy="155"
    rx="116"
    ry="108"
    fill="url(#faceGrad)"
    stroke={outlineColor}
    stroke-width="7"
    filter="url(#faceShadow-f)"
  />
  <ellipse cx="150" cy="172" rx="20" ry="16" fill="#1a1a1a" />
  <ellipse cx="145" cy="167" rx="8" ry="5" fill="#4a4a4a" opacity="0.35" />
  <Eyes {eyeStyle} hide={hideEyes} />
  <Expression {mouthStyle} {characterType} {outlineColor} />
  <Glasses glassesType={glasses} />
  <Hat hatType={hat} />
{:else if characterType === 'penguin'}
  <path
    d="M 150 35 C 105 38, 62 85, 60 155 C 58 225, 95 268, 150 272 C 205 268, 242 225, 240 155 C 238 85, 195 38, 150 35 Z"
    fill="#4a4a5a"
    stroke="#3a3a4a"
    stroke-width="5"
    filter="url(#faceShadow-f)"
  />
  <ellipse cx="150" cy="195" rx="78" ry="90" fill="#f8f5f0" />
  <ellipse
    cx="58"
    cy="170"
    rx="18"
    ry="38"
    fill="#4a4a5a"
    stroke="#3a3a4a"
    stroke-width="4"
    transform="rotate(18, 58, 170)"
  />
  <ellipse
    cx="242"
    cy="170"
    rx="18"
    ry="38"
    fill="#4a4a5a"
    stroke="#3a3a4a"
    stroke-width="4"
    transform="rotate(-18, 242, 170)"
  />
  <ellipse cx="128" cy="262" rx="18" ry="8" fill="#FFD700" stroke="#e6c200" stroke-width="2" />
  <ellipse cx="172" cy="262" rx="18" ry="8" fill="#FFD700" stroke="#e6c200" stroke-width="2" />
  <circle cx="150" cy="88" r="58" fill="#4a4a5a" stroke="#3a3a4a" stroke-width="4" />
  <path
    d="M 150 62 C 118 62, 95 82, 95 108 C 95 128, 110 142, 150 142 C 190 142, 205 128, 205 108 C 205 82, 182 62, 150 62 Z"
    fill="#f8f5f0"
  />
  <path
    d="M 118 100 Q 126 90 134 100"
    stroke="#3a3a4a"
    stroke-width="3.5"
    fill="none"
    stroke-linecap="round"
  />
  <path
    d="M 166 100 Q 174 90 182 100"
    stroke="#3a3a4a"
    stroke-width="3.5"
    fill="none"
    stroke-linecap="round"
  />
  <path
    d="M 138 112 Q 150 106 162 112 L 150 128 Z"
    fill="#FFD700"
    stroke="#e6c200"
    stroke-width="2"
    stroke-linejoin="round"
  />
  <Eyes {eyeStyle} hide={hideEyes} />
  <Expression {mouthStyle} {characterType} {outlineColor} />
  <Glasses glassesType={glasses} />
  <Hat hatType={hat} />
{:else if characterType === 'chicken'}
  <path
    d="M 112 62 Q 108 38 125 48 Q 132 25 144 48 Q 156 20 165 46 Q 176 24 185 46 Q 198 34 190 62"
    fill="#e63946"
    stroke="#b71c1c"
    stroke-width="2.5"
    stroke-linejoin="round"
  />
  <ellipse
    cx="150"
    cy="155"
    rx="96"
    ry="100"
    fill="url(#faceGrad)"
    stroke={outlineColor}
    stroke-width="6"
    filter="url(#faceShadow-f)"
  />
  <circle cx="113" cy="136" r="10" fill="#fff" stroke="#2d2d2d" stroke-width="2.5" />
  <circle cx="187" cy="136" r="10" fill="#fff" stroke="#2d2d2d" stroke-width="2.5" />
  <circle cx="115" cy="137" r="4.5" fill="#2d2d2d" />
  <circle cx="189" cy="137" r="4.5" fill="#2d2d2d" />
  <polygon
    points="141,148 159,148 150,168"
    fill="#FF8C00"
    stroke="#d47000"
    stroke-width="2"
    stroke-linejoin="round"
  />
  <ellipse cx="150" cy="171" rx="7" ry="10" fill="#e63946" stroke="#b71c1c" stroke-width="1.5" />
  <Eyes {eyeStyle} hide={hideEyes} />
  <Expression {mouthStyle} {characterType} {outlineColor} />
  <Glasses glassesType={glasses} />
  <Hat hatType={hat} />
{/if}
