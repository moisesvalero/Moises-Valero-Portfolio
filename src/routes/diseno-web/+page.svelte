<script lang="ts">
  import DisenoWebAlcoyPage from '../diseno-web-alcoy/+page.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<DisenoWebAlcoyPage {data} />
