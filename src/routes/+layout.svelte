<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950">
  {@render children()}
</div>
