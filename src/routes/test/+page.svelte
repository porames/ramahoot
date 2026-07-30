<script lang="ts">
  import BarChart, { type ChartDatum } from '$lib/components/BarChart.svelte';

  const revenueData: ChartDatum[] = [
    { label: 'Jan', value: 4200 },
    { label: 'Feb', value: 5100 },
    { label: 'Mar', value: 3800 },
    { label: 'Apr', value: 6300 },
    { label: 'May', value: 7000 },
    { label: 'Jun', value: 5600 }
  ];
</script>

<div class="min-h-screen bg-[#FFFCF5] py-12 px-4">
  <div class="max-w-lg mx-auto">
    <BarChart
      title="Monthly revenue"
      subtitle="Last 6 months, in USD"
      data={revenueData}
      badge="+18%"
    />
  </div>
</div>
