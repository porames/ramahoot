<script lang="ts">
  interface PlacedWord {
    text: string;
    count: number;
    size: number;
    x: number;
    y: number;
    w: number;
    h: number;
    rotate: boolean;
    color: string;
  }

  let {
    words = [] as string[],
    minFontSize = 14,
    maxFontSize = 72,
    fontFamily = "'Poppins', 'Segoe UI', sans-serif",
    padding = 4,
    colors = ['#4C6EF5', '#7048E8', '#F76707', '#2F9E44', '#E64980', '#1098AD', '#F59F00', '#495057'],
    rotateChance = 0.3
  }: {
    words?: string[];
    minFontSize?: number;
    maxFontSize?: number;
    fontFamily?: string;
    padding?: number;
    colors?: string[];
    rotateChance?: number;
  } = $props();

  const CANVAS_W = 700;
  const CANVAS_H = 420;

  let containerEl: HTMLDivElement | undefined = $state();
  let wrapperEl: HTMLDivElement | undefined = $state();
  let placedWords: PlacedWord[] = $state([]);
  let ready = $state(false);

  let containerWidth = $state(CANVAS_W);
  let scale = $derived(containerWidth / CANVAS_W);

  // --- frequency counting ---
  function computeFrequencies(list: string[]): { text: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const raw of list) {
      const w = String(raw).trim();
      if (!w) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);
  }

  // --- measure text width using canvas ---
  let measureCtx: CanvasRenderingContext2D | null = null;
  function getMeasureCtx(): CanvasRenderingContext2D {
    if (!measureCtx) {
      const canvas = document.createElement('canvas');
      measureCtx = canvas.getContext('2d');
    }
    return measureCtx!;
  }

  function measureText(text: string, fontSize: number): { w: number; h: number } {
    const ctx = getMeasureCtx();
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    const w = ctx.measureText(text).width;
    const h = fontSize * 1.15;
    return { w, h };
  }

  function rectsOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
    return !(
      a.x + a.w / 2 + padding < b.x - b.w / 2 ||
      a.x - a.w / 2 - padding > b.x + b.w / 2 ||
      a.y + a.h / 2 + padding < b.y - b.h / 2 ||
      a.y - a.h / 2 - padding > b.y + b.h / 2
    );
  }

  // Archimedean spiral placement
  function layout() {
    if (!words || words.length === 0) {
      placedWords = [];
      ready = true;
      return;
    }

    const freqs = computeFrequencies(words);
    const counts = freqs.map((f) => f.count);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);

    const scaleFont = (count: number): number => {
      if (maxCount === minCount) return (minFontSize + maxFontSize) / 2;
      const t = (count - minCount) / (maxCount - minCount);
      return minFontSize + Math.sqrt(t) * (maxFontSize - minFontSize);
    };

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const placed: PlacedWord[] = [];

    freqs.forEach((item, i) => {
      const fontSize = scaleFont(item.count);
      const rotate = Math.random() < rotateChance;
      let { w, h } = measureText(item.text, fontSize);
      if (rotate) [w, h] = [h, w];

      let x = cx;
      let y = cy;
      let angle = 0;
      const angleStep = 0.35;
      const radiusStep = 3.2;
      let radius = 0;
      let placedOk = false;
      const maxSteps = 3000;

      for (let step = 0; step < maxSteps; step++) {
        const candidate = { x, y, w, h };
        const outOfBounds =
          x - w / 2 < 4 || x + w / 2 > CANVAS_W - 4 || y - h / 2 < 4 || y + h / 2 > CANVAS_H - 4;

        if (!outOfBounds) {
          const collides = placed.some((p) => rectsOverlap(candidate, p));
          if (!collides) {
            placedOk = true;
            break;
          }
        }

        angle += angleStep;
        radius = radiusStep * angle;
        x = cx + radius * Math.cos(angle);
        y = cy + radius * Math.sin(angle) * 0.7;
      }

      if (placedOk) {
        placed.push({
          text: item.text,
          count: item.count,
          size: fontSize,
          x,
          y,
          w,
          h,
          rotate,
          color: colors[i % colors.length]
        });
      }
    });

    placedWords = placed;
    ready = true;
  }

  $effect(() => {
    if (!wrapperEl) return;
    const ro = new ResizeObserver((entries) => {
      containerWidth = entries[0].contentBoxSize[0].inlineSize;
    });
    ro.observe(wrapperEl);
    return () => ro.disconnect();
  });

  $effect(() => {
    if (containerEl) layout();
  });
</script>

<div bind:this={wrapperEl} class="word-cloud-wrapper" style="height:{CANVAS_H * scale}px;">
  <div
    class="word-cloud"
    bind:this={containerEl}
    style="width:{CANVAS_W}px; height:{CANVAS_H}px; transform:scale({scale}); transform-origin:top left;"
  >
    {#if ready}
      {#each placedWords as w (w.text)}
        <span
          class="cloud-word"
          title="{w.text}: {w.count}"
          style="
            left:{w.x}px;
            top:{w.y}px;
            font-size:{w.size}px;
            color:{w.color};
            font-family:{fontFamily};
            transform: translate(-50%, -50%) rotate({w.rotate ? '90deg' : '0deg'});
          "
        >
          {w.text}
        </span>
      {/each}
    {/if}
  </div>
</div>

<style>
  .word-cloud-wrapper {
    position: relative;
    overflow: hidden;
    width: 100%;
  }

  .word-cloud {
    position: relative;
    overflow: hidden;
    background: #fafafa;
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  }

  .cloud-word {
    position: absolute;
    font-weight: 600;
    white-space: nowrap;
    user-select: none;
    line-height: 1;
    transition:
      transform 0.15s ease,
      opacity 0.2s ease;
    cursor: default;
  }

  .cloud-word:hover {
    opacity: 0.75;
    transform: translate(-50%, -50%) scale(1.08) !important;
  }
</style>
