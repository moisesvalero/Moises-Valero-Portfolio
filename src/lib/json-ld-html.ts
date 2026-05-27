/**
 * Serializa JSON-LD para insertarlo en el DOM (p. ej. vía `JsonLdScript.svelte`).
 * Cualquier `</script>` en el contenido (CMS, FAQ con HTML) rompería el parser HTML;
 * sustituir `<` por \\u003c evita cierre prematuro de la etiqueta script.
 *
 * Nota: en plantillas Svelte, `{expr}` dentro de `<script>...</script>` no se evalúa;
 * usar `<svelte:element this="script" type="application/ld+json">` o el componente compartido.
 */
export function stringifyJsonLdForHtml(value: unknown): string {
	return JSON.stringify(value).replace(/</g, '\\u003c');
}
