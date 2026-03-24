<script lang="ts">
  /** JSON ya serializado (p. ej. con stringifyJsonLdForHtml). */
  interface Props {
    json: string;
  }
  let { json }: Props = $props();
</script>

<!-- Las llaves {json} no se procesan dentro de <script> en plantillas Svelte; svelte:element sí. -->
<svelte:element this={'script'} type="application/ld+json">{json}</svelte:element>
