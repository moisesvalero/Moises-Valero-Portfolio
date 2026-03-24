/**
 * Serializa JSON-LD para `<script type="application/ld+json">`.
 * Cualquier `</script>` en el contenido (p. ej. textos de CMS o FAQ con HTML)
 * cerraría la etiqueta en el parser HTML y dejaría JSON inválido; Search Console
 * lo reporta como error de análisis. Sustituir `<` por \\u003c es seguro para JSON.
 */
export function stringifyJsonLdForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
