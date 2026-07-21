/**
 * Seed para el articulo del blog: Kimi K3 de Moonshot AI (Versión extendida y editorial con título corto)
 */

import { getCliClient } from 'sanity/cli';

const SLUG = 'kimi-k3-llm-moonshot-ai';
const PUBLISHED_AT = '2026-07-21T08:00:00.000Z';

const TITLE = 'Kimi K3: El nuevo titán MoE de Moonshot AI';

const COVER_IMAGE_SRC = '/imagenes/kimi-k3-cover.png';
const COVER_IMAGE_ALT =
	'Ilustración futurista de red neuronal representando el modelo LLM Kimi K3 de Moonshot AI';

const CATEGORY_LABEL = 'Análisis Técnico';
const EXCERPT =
	'Analizamos en profundidad Kimi K3, la nueva bestia de 2,8 billones de parámetros de Moonshot AI: atención lineal KDA, Attention Residuals, 1M de contexto y el impacto de sus pesos abiertos.';

const READING_MINUTES = 8;
const SHOW_ON_BLOG = true;
const FEATURED_ORDER: number | null = 1;

const SEO_TITLE = 'Kimi K3: El nuevo titán MoE de Moonshot AI';
const SEO_DESCRIPTION =
	'Análisis completo de Kimi K3 de Moonshot AI: arquitectura Sparse MoE, atención KDA, #1 en Frontend Code Arena y liberación de pesos abiertos.';

const BODY_HTML = `
<p>El panorama global de la Inteligencia Artificial ha vivido un hito sin precedentes. <strong>Moonshot AI</strong>, la compañía fundada por el renombrado investigador <strong>Yang Zhilin</strong>, ha lanzado oficialmente <strong>Kimi K3</strong>, un modelo de lenguaje de frontera que marca un antes y un después en escala, velocidad de inferencia y capacidad de desarrollo agéntico.</p>

<p>Con una dimensión masiva de <strong>2,8 billones de parámetros (2.8 Trillion)</strong> y una ventana de contexto nativa de 1 millón de tokens, Kimi K3 no solo compite directamente con las alternativas cerradas de mayor calado en el mercado, sino que introduce soluciones arquitectónicas revolucionarias diseñadas para superar los límites físicos de los Transformers tradicionales.</p>

<h2>La arquitectura detrás del gigante: Sparse MoE y Stable LatentMoE</h2>

<p>Procesar cerca de 3 billones de parámetros de forma monolítica supondría un coste computacional inasumible para la mayoría de infraestructuras en producción. Para resolver este reto, Moonshot AI ha implementado una arquitectura de tipo <strong>Sparse Mixture-of-Experts (MoE)</strong> impulsada por el sistema de ruteo dinámico <strong>Stable LatentMoE</strong>.</p>

<p>Kimi K3 integra un total de <strong>896 expertos especializados</strong> dentro de su red. Sin embargo, durante la inferencia para responder a cualquier petición, el sistema activa de forma ultra-eficiente tan solo <strong>16 expertos por token</strong>. Esto permite mantener la riqueza cognitiva de un modelo colosal mientras se opera con una latencia reducida y un consumo energético controlado.</p>

<h2>Kimi Delta Attention: El fin de la barrera cuadrática en 1M de tokens</h2>

<p>Uno de los mayores cuellos de botella al trabajar con contextos de 1 millón de tokens en Transformers estándar es la atención cuadrática tradicional, cuyo consumo de memoria y computación escala exponencialmente a medida que aumenta la longitud del documento.</p>

<p>Para solucionar esta limitación, Moonshot AI ha presentado <strong>Kimi Delta Attention (KDA)</strong>, un mecanismo híbrido de atención lineal que mantiene un estado de memoria interna compacta. A diferencia de los métodos convencionales, KDA actúa de forma similar a una memoria recurrente continua, logrando velocidades de decodificación hasta <strong>6,3 veces más rápidas</strong> en documentos extremadamente extensos sin degradar la precisión del contexto distante.</p>

<h2>Attention Residuals: Previniendo la degradación en redes ultra-profundas</h2>

<p>A medida que los modelos de lenguaje añaden más capas para ganar capacidad de razonamiento, las conexiones residuales clásicas tienden a diluir la información original que transita desde las primeras fases de la red. En Kimi K3, esto se ha resuelto mediante <strong>Attention Residuals (AttnRes)</strong>.</p>

<p>Esta innovación reemplaza la suma residual pasiva por un mecanismo dinámico y dependiente de la entrada, permitiendo a las capas superiores recuperar directamente representaciones clave de capas anteriores. El resultado según los informes técnicos de Moonshot AI es una <strong>eficiencia de escalado 2,5 veces superior</strong> a la de su predecesor, Kimi K2.</p>

<h2>Dominio absoluto en desarrollo Frontend y agentes</h2>

<p>Más allá de las cifras teóricas, el verdadero impacto de Kimi K3 se observa en la práctica diaria del desarrollo de software. En las pruebas ciegas del leaderboard <strong>Frontend Code Arena (Arena.ai)</strong>, Kimi K3 ha alcanzado el <strong>puesto #1 mundial</strong>, superando a los modelos más avanzados del sector en tareas de arquitectura de componentes, maquetación adaptativa, estado interactivo y refactorización compleja.</p>

<p>Asimismo, los datos de <em>Artificial Analysis</em> sitúan a Kimi K3 de forma consistente entre los primeros puestos del índice global de inteligencia, destacando de manera especial en la resolución autónoma de tareas complejas en múltiples pasos (workflow agéntico).</p>

<h2>Pesos Abiertos: Un cambio de paradigma para la comunidad</h2>

<p>La noticia que ha terminado por sacudir la industria es el compromiso de Moonshot AI con la comunidad de código abierto: los <strong>pesos abiertos completos (Open Weights) de Kimi K3 se liberan el 27 de julio de 2026</strong>.</p>

<p>Hasta la fecha, acceder a un modelo de esta escala requería depender exclusivamente de APIs propietarias y de las políticas de uso de plataformas cerradas. La liberación de Kimi K3 permitirá a investigadores, empresas e integradores desplegar u optimizar localmente uno de los modelos más avanzados del mundo.</p>

<blockquote>"Kimi K3 demuestra que la combinación de atención lineal híbrida, enrutamiento latente de expertos y apertura de weights marca el nuevo estándar en la evolución de la Inteligencia Artificial."</blockquote>

<h2>Conclusión</h2>

<p>El lanzamiento de Kimi K3 representa una consolidación rotunda para Moonshot AI y el equipo liderado por Yang Zhilin. La convergencia entre su innovadora atención KDA, el rendimiento sobresaliente en código frontend y la inminente llegada de sus pesos abiertos abre una nueva etapa donde la IA de frontera se vuelve más accesible, rápida e interactiva que nunca.</p>
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
	console.log(`Articulo ${SLUG} actualizado con nuevo titulo en Sanity.`);
}

main().catch((error) => {
	console.error(`Error cargando ${SLUG} en Sanity:`, error);
	process.exit(1);
});
