<script lang="ts">
  import ArticulosPage from '../../diseno-web-alcoy/articulos/+page.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<ArticulosPage {data} />
