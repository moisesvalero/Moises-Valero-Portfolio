/**
 * Seed para el articulo del blog: Kimi K3 de Moonshot AI
 */

import { getCliClient } from 'sanity/cli';

const SLUG = 'kimi-k3-llm-moonshot-ai';
const PUBLISHED_AT = '2026-07-21T08:00:00.000Z';

const TITLE = 'Kimi K3 de Moonshot AI: 2.8T parámetros, MoE y weights abiertos';

const COVER_IMAGE_SRC = '/imagenes/kimi-k3-cover.png';
const COVER_IMAGE_ALT = 'Ilustración futurista de red neuronal representando el modelo LLM Kimi K3';

const CATEGORY_LABEL = 'Inteligencia Artificial';
const EXCERPT =
	'Analizamos Kimi K3, el nuevo modelo multimodal de 2,8 billones de parámetros de Moonshot AI: arquitectura MoE, atención KDA, 1M de contexto y weights abiertos.';

const READING_MINUTES = 5;
const SHOW_ON_BLOG = true;
const FEATURED_ORDER: number | null = 1;

const SEO_TITLE = 'Kimi K3 de Moonshot AI: 2.8T parámetros, MoE y weights abiertos';
const SEO_DESCRIPTION =
	'Análisis en profundidad de Kimi K3 de Moonshot AI: 2,8 billones de parámetros, 1M de tokens, atención KDA, #1 en Frontend Code y pesos abiertos.';

const BODY_HTML = `
<p>El panorama de la Inteligencia Artificial acaba de experimentar un avance de gran calado. <strong>Moonshot AI</strong> ha presentado oficialmente <strong>Kimi K3</strong>, su nuevo modelo de lenguaje de frontera que destaca en capacidad, eficiencia de escalado y rendimiento agéntico. Con una escala masiva de <strong>2,8 billones de parámetros (2.8 Trillion)</strong> organizada en una arquitectura Sparse Mixture-of-Experts (MoE) y una ventana de contexto de 1 millón de tokens, Kimi K3 se posiciona en la cúspide de los modelos de IA actuales.</p>

<h2>1. Arquitectura: La revolución de Sparse MoE y KDA</h2>
<p>Uno de los aspectos más sobresalientes de Kimi K3 no es solo su volumen de parámetros, sino la eficiencia con la que gestiona el cómputo. A pesar de contar con 2,8 billones de parámetros totales, el modelo utiliza una aproximación rala (sparse MoE) donde solo activa <strong>16 de sus 896 expertos por token</strong>.</p>

<p>Para resolver los cuellos de botella habituales al procesar contextos masivos, Moonshot AI ha incorporado dos innovaciones de arquitectura fundamentales:</p>

<ul>
	<li><strong>Kimi Delta Attention (KDA):</strong> Un mecanismo híbrido de atención lineal diseñado específicamente para reducir el coste computacional y el uso de memoria durante la inferencia en documentos extensos (hasta 1.000.000 de tokens).</li>
	<li><strong>Attention Residuals (AttnRes):</strong> Una mejora en las conexiones residuales estándar que optimiza el flujo de información en redes profundas, logrando una eficiencia de escalado 2,5 veces superior a la de Kimi K2.</li>
</ul>

<h2>2. Benchmarks: Líder en Frontend y Capacidades Agénticas</h2>
<p>En las evaluaciones de <em>Artificial Analysis</em>, Kimi K3 ha alcanzado los puestos de cabeza en el índice global de inteligencia, compitiendo directamente con los modelos insignia de OpenAI y Anthropic.</p>

<p>Donde ha causado un impacto singular entre la comunidad de desarrollo es en la generación de código y automatización agéntica. Kimi K3 se ha situado en el <strong>#1 de la Frontend Code Arena (Arena.ai)</strong>, superando a otros modelos de frontera en pruebas a ciegas de maquetación UI, desarrollo de componentes complejos e interactividad.</p>

<pre><code>// Ficha técnica esencial de Kimi K3
const kimiK3Specs = {
  totalParameters: '2.8T',
  architecture: 'Sparse MoE (16/896 active experts)',
  contextWindow: '1,000,000 tokens',
  modalities: ['Text', 'Vision'],
  keyInnovations: ['Kimi Delta Attention (KDA)', 'Attention Residuals (AttnRes)'],
  openWeightsRelease: '27 de Julio de 2026'
};
</code></pre>

<h2>3. Precios de API y Pesos Abiertos (Open Weights)</h2>
<p>A diferencia de otras soluciones propietarias cerradas, Moonshot AI ha anunciado una medida clave para el ecosistema de código abierto: <strong>los pesos abiertos completos (Open Weights) de Kimi K3 estarán disponibles el 27 de julio de 2026</strong>.</p>

<p>Actualmente, el modelo se encuentra accesible a través de la API oficial de Moonshot AI y plataformas integradas, con una estructura de precios fijada en aproximadamente <strong>$3,00 por millón de tokens de entrada</strong> y <strong>$15,00 por millón de tokens de salida</strong>.</p>

<blockquote>"Kimi K3 demuestra que la atención lineal híbrida y la ultra-especialización de expertos permiten operar con 1M de tokens en producción con una eficiencia inédita."</blockquote>

<h2>4. Conclusión</h2>
<p>La llegada de Kimi K3 refuerza el papel de Moonshot AI como referente indiscutible en la investigación de modelos de lenguaje. Su combinación de visión nativa, destreza en código y la próxima liberación de pesos abiertos marcan un hito indispensable para el desarrollo tecnológico de este año.</p>
`.trim();

async function main() {
	if (TITLE.includes('[PLANTILLA]') || SLUG.startsWith('plantilla-')) {
		throw new Error(
			`Este archivo es la plantilla. Copialo como seed-landing-support-article-<slug>.ts y rellena los campos EDITAR antes de ejecutarlo.`
		);
	}

	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: `landingSupportArticle.${SLUG}`,
		_type: 'landingSupportArticle',
		title: TITLE,
		slug: { _type: 'slug', current: SLUG },
		categoryLabel: CATEGORY_LABEL,
		excerpt: EXCERPT,
		publishedAt: PUBLISHED_AT,
		readingMinutes: READING_MINUTES,
		showOnBlog: SHOW_ON_BLOG,
		...(FEATURED_ORDER !== null ? { featuredOrder: FEATURED_ORDER } : {}),
		coverImageSrc: COVER_IMAGE_SRC,
		coverImageAlt: COVER_IMAGE_ALT,
		bodyHtml: BODY_HTML,
		seoTitle: SEO_TITLE,
		seoDescription: SEO_DESCRIPTION
	};

	await client.createOrReplace(doc);
	console.log(`Articulo ${SLUG} cargado en Sanity.`);
}

main().catch((error) => {
	console.error(`Error cargando ${SLUG} en Sanity:`, error);
	process.exit(1);
});
