<script lang="ts">
  export interface ChartDatum {
    label: string;
    value: number;
  }

  interface Props {
    data: ChartDatum[];
    title?: string;
    subtitle?: string;
    badge?: string;
    height?: number;
  }

  let { data, title = 'Revenue', subtitle = '', badge = '', height = 220 }: Props = $props();

  const BAR_COLORS = ['#FFD23F', '#4D7CFE', '#FF5FA2', '#17C964', '#FFD23F', '#4D7CFE'] as const;

  const BORDER = 'border-[3px] border-black';
  const HARD_SHADOW = 'shadow-[5px_5px_0px_0px_#111]';
  const HARD_SHADOW_SM = 'shadow-[3px_3px_0px_0px_#111]';

  const BASELINE = 3; // px, height of the literal baseline strip below the bars

  let hovered = $state<number | null>(null);

  const maxValue = $derived(Math.max(1, ...data.map((d) => d.value)));
  // the bars/gridlines/y-axis all share this exact height — the baseline
  // is a separate element stacked below it, not a border on it
  const plotHeight = $derived(height - BASELINE);

  function formatValue(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n.toLocaleString();
  }
</script>

<div class={`relative bg-white ${BORDER} ${HARD_SHADOW} rounded-lg p-5 mb-4`}>
  {#if badge}
    <div
      class={`absolute -top-4 -right-3 rotate-6 bg-[#FFD23F] ${BORDER} ${HARD_SHADOW_SM} rounded-md px-3 py-1 flex items-center gap-1`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3">
        <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
      </svg>
      <span class="text-xs font-black tracking-wide">{badge}</span>
    </div>
  {/if}

  <div class="mb-4">
    <h3 class="text-xl font-black tracking-tight text-black">{title}</h3>
    {#if subtitle}
      <p class="text-sm font-bold text-black/50 mt-0.5">{subtitle}</p>
    {/if}
  </div>

  <div class="flex gap-3">
    <!-- y-axis: sized to exactly match the bars' container below (plotHeight) -->
    <div
      class="flex flex-col justify-between text-[10px] font-bold text-black/40 select-none text-right"
      style="height:{plotHeight}px;"
    >
      {#each [4, 3, 2, 1, 0] as level (level)}
        <span class="leading-none">{formatValue(Math.round((level / 4) * maxValue))}</span>
      {/each}
    </div>

    <!-- chart column -->
    <div class="flex-1">
      <!-- bars + gridlines + tooltip all share this one coordinate system -->
      <div class="relative" style="height:{plotHeight}px;">
        <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
          {#each [1, 2, 3, 4] as i (i)}
            <div
              class="absolute left-0 right-0 h-px bg-black/10"
              style="bottom:{(i / 4) * 100}%;"
            ></div>
          {/each}
        </div>

        {#if hovered !== null}
          <div
            class={`absolute -top-2 -translate-x-1/2 -translate-y-full bg-white ${BORDER} ${HARD_SHADOW_SM} rounded-md px-3 py-1.5 pointer-events-none whitespace-nowrap z-10`}
            style="left:{(hovered + 0.5) * (100 / data.length)}%;"
          >
            <p class="text-[11px] font-black uppercase text-black/60 m-0">{data[hovered].label}</p>
            <p class="text-base font-black text-black m-0">
              {data[hovered].value.toLocaleString()}
            </p>
          </div>
        {/if}

        <div class="relative h-full flex items-end gap-3">
          {#each data as d, i (d.label)}
            <div
              class="group flex-1 h-full flex flex-col justify-end items-center cursor-default"
              role="img"
              aria-label="{d.label}: {d.value}"
              onmouseenter={() => (hovered = i)}
              onmouseleave={() => (hovered = null)}
            >
              <div
                class="w-full max-w-12 border-[3px] border-b-0 border-black rounded-t transition-transform duration-100 ease-out origin-bottom group-hover:brightness-110 group-hover:-translate-y-0.5"
                style="height:{(d.value / maxValue) * 100}%; background:{BAR_COLORS[
                  i % BAR_COLORS.length
                ]};"
              ></div>
            </div>
          {/each}
        </div>
      </div>

      <!-- literal baseline strip, stacked in normal flow right below the bars -->
      <div class="w-full bg-black" style="height:{BASELINE}px;"></div>

      <!-- x-axis labels, own row below the baseline -->
      <div class="flex gap-3 mt-2">
        {#each data as d (d.label)}
          <span class="flex-1 text-center text-xs font-extrabold text-black whitespace-nowrap">
            {d.label}
          </span>
        {/each}
      </div>
    </div>
  </div>
</div>
