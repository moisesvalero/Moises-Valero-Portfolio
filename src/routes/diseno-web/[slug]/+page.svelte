<script lang="ts">
  import ArticuloPage from '../../diseno-web-alcoy/[slug]/+page.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<ArticuloPage {data} />
