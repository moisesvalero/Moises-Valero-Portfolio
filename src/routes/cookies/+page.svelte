<script lang="ts">
	import { locale } from '$lib/i18n/index.js';
</script>

<svelte:head>
	{#if $locale === 'en'}
		<title>Cookie policy | Moisés Valero</title>
		<meta
			name="description"
			content="Cookie and similar technologies policy for moisesvalero.es (Google Analytics, Typebot, technical cookies)."
		/>
	{:else}
		<title>Política de cookies | Moisés Valero</title>
		<meta
			name="description"
			content="Política de cookies y tecnologías similares de moisesvalero.es (Google Analytics, Typebot, cookies técnicas)."
		/>
	{/if}
</svelte:head>

<main class="legal-doc" id="contenido">
	{#if $locale === 'en'}
		<article class="legal-inner">
			<h1>Cookie policy</h1>
			<p class="legal-updated">Version dated 22 March 2026</p>

			<p class="legal-disclaimer">
				This document is drafted for transparency and compliance with Regulation (EU) 2016/679
				(GDPR), Directive 2002/58/EC (ePrivacy) as transposed, and applicable national law. It does
				not replace individual legal advice.
			</p>

			<h2>1. Data controller</h2>
			<p>
				<strong>Moisés Valero</strong> — professional website at
				<a href="https://moisesvalero.es">moisesvalero.es</a>. Contact for privacy and cookies:
				<a href="mailto:info@moisesvalero.es">info@moisesvalero.es</a>.
			</p>

			<h2>2. Scope</h2>
			<p>
				This policy describes the cookies and similar technologies used on this website and how you
				can manage your choices. By continuing to browse after configuring your preferences, you
				declare that you have read this information.
			</p>

			<h2>3. What are cookies?</h2>
			<p>
				Cookies are small text files or identifiers stored on your terminal (computer, tablet,
				smartphone) when you visit a website. Similar technologies include local storage, pixels, or
				scripts that perform comparable functions.
			</p>

			<h2>4. Cookies and technologies we use</h2>

			<h3>4.1 Strictly necessary (always, subject to browser settings)</h3>
			<p>
				These are required for basic operation or to record your explicit choices. For example:
				storing your <strong>language preference</strong> (via the server cookie used when you
				switch ES/EN) and your <strong>cookie consent</strong> (stored locally in the browser so we do
				not show the banner repeatedly in the same way).
			</p>
			<p>
				<strong>Legal basis:</strong> legitimate interest / technical necessity and, where applicable,
				compliance with the obligation to document consent.
			</p>

			<h3>4.2 Analytics — Google Analytics 4 (only if you click “Accept all”)</h3>
			<p>
				If you accept all cookies, we load <strong>Google Analytics 4</strong>, a web analytics
				service provided by <strong>Google Ireland Limited</strong> (for users in the EEA/UK, as
				applicable) /
				<strong>Google LLC</strong> (USA), which uses cookies and similar mechanisms to collect aggregated
				information about how visitors use the site (e.g. pages viewed, approximate location, device and
				browser data, events and duration).
			</p>
			<p>
				Google may process this data according to its own terms. You can review how Google uses data
				at
				<a
					href="https://policies.google.com/technologies/cookies"
					rel="noopener noreferrer"
					target="_blank">Google’s Cookie Policy</a
				>
				and its privacy policy at
				<a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank"
					>policies.google.com/privacy</a
				>. Typical identifiers include cookies such as <code>_ga</code> and related names; retention periods
				are determined by Google’s configuration and product rules.
			</p>
			<p>
				<strong>Legal basis:</strong> your consent (Art. 6(1)(a) GDPR), given via the cookie banner.
			</p>

			<h3>4.3 Third-party embed — Typebot chat (only if you click “Accept all”)</h3>
			<p>
				The optional assistant chat is served from <strong>Typebot</strong> (typebot.io or the configured
				domain). Loading the iframe may involve cookies or similar technologies under Typebot’s and its
				infrastructure providers’ policies.
			</p>
			<p><strong>Legal basis:</strong> your consent.</p>

			<h2>5. Summary table (non-exhaustive)</h2>
			<div class="table-wrap">
				<table class="legal-table">
					<thead>
						<tr>
							<th>Type</th>
							<th>Purpose</th>
							<th>When it runs</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Technical / preference</td>
							<td>Language, cookie choice storage</td>
							<td>According to configuration / always for basic functions</td>
						</tr>
						<tr>
							<td>Google Analytics 4</td>
							<td>Audience measurement and site usage statistics</td>
							<td>Only after “Accept all”</td>
						</tr>
						<tr>
							<td>Typebot (embed)</td>
							<td>Conversational assistant</td>
							<td>Only after “Accept all”</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h2>6. Retention</h2>
			<p>
				Session cookies expire when you close the browser (unless otherwise indicated). Persistent
				cookies remain for the period set by each provider (e.g. Google). You can delete them from
				your browser at any time.
			</p>

			<h2>7. How to change or withdraw consent</h2>
			<p>
				Use <strong>“Cookie preferences”</strong> in the site footer to reopen the banner. You may also
				adjust your browser to block or delete cookies; blocking necessary cookies may affect language
				memory or consent storage.
			</p>

			<h2>8. International transfers</h2>
			<p>
				Providers such as Google or Typebot may process data in countries outside the EEA. Where
				required, transfers rely on appropriate safeguards (e.g. Standard Contractual Clauses) as
				described in the providers’ documentation.
			</p>

			<h2>9. Updates</h2>
			<p>
				We may amend this policy to reflect legal or technical changes. Material changes will be
				reflected in the version date above.
			</p>

			<h2>10. Contact</h2>
			<p>
				Questions about this policy: <a href="mailto:info@moisesvalero.es">info@moisesvalero.es</a>
			</p>
		</article>
	{:else}
		<article class="legal-inner">
			<h1>Política de cookies</h1>
			<p class="legal-updated">Versión con fecha 22 de marzo de 2026</p>

			<p class="legal-disclaimer">
				Este documento se redacta con fines de transparencia y adecuación al Reglamento (UE)
				2016/679 (RGPD), a la Directiva 2002/58/CE (privacidad y comunicaciones electrónicas) en su
				transposición española (entre otras, Ley 34/2002 y normativa de cookies) y a la legislación
				aplicable. No sustituye asesoramiento jurídico individual.
			</p>

			<h2>1. Responsable</h2>
			<p>
				<strong>Moisés Valero</strong>, titular del sitio web
				<a href="https://moisesvalero.es">moisesvalero.es</a>. Para consultas sobre privacidad y
				cookies:
				<a href="mailto:info@moisesvalero.es">info@moisesvalero.es</a>.
			</p>

			<h2>2. Ámbito</h2>
			<p>
				Esta política informa sobre el uso de cookies y tecnologías similares en este sitio y sobre
				cómo puede gestionar sus preferencias. La navegación tras configurar su elección implica que
				ha tomado conocimiento de esta información.
			</p>

			<h2>3. ¿Qué son las cookies?</h2>
			<p>
				Las cookies son pequeños archivos o identificadores que se almacenan en su terminal
				(ordenador, tablet, smartphone) cuando accede a una página web. Por “tecnologías similares”
				se entiende, entre otras, el almacenamiento local, píxeles o scripts con finalidades
				equivalentes.
			</p>

			<h2>4. Cookies y tecnologías que utilizamos</h2>

			<h3>4.1 Estrictamente necesarias</h3>
			<p>
				Permiten el funcionamiento básico del sitio o guardan decisiones suyas. Incluyen, entre
				otras: la <strong>preferencia de idioma</strong> (mediante la cookie de servidor utilizada
				al cambiar ES/EN) y el registro de su <strong>consentimiento de cookies</strong> (almacenado en
				el navegador para no solicitarle la misma acción de forma repetida de manera incompatible con
				la normativa).
			</p>
			<p>
				<strong>Base jurídica:</strong> interés legítimo y/o ejecución de medidas precontractuales a su
				solicitud, y en su caso cumplimiento de obligaciones legales en materia de prueba del consentimiento.
			</p>

			<h3>4.2 Analíticas — Google Analytics 4 (solo si pulsa «Aceptar todas»)</h3>
			<p>
				Si acepta todas las cookies, se carga <strong>Google Analytics 4</strong>, servicio de
				analítica web prestado por <strong>Google Ireland Limited</strong> (para usuarios en el
				EEE/Reino Unido, en su caso) y/o <strong>Google LLC</strong> (EE. UU.), que utiliza cookies y
				mecanismos análogos para obtener información agregada sobre el uso del sitio (páginas vistas,
				ubicación aproximada, dispositivo y navegador, eventos, tiempo de permanencia, etc.).
			</p>
			<p>
				Google tratará los datos conforme a sus propias condiciones. Puede consultar el uso de
				cookies por Google en
				<a
					href="https://policies.google.com/technologies/cookies?hl=es"
					rel="noopener noreferrer"
					target="_blank">Política de cookies de Google</a
				>
				y la información general en
				<a
					href="https://policies.google.com/privacy?hl=es"
					rel="noopener noreferrer"
					target="_blank">Política de privacidad de Google</a
				>. De forma orientativa pueden generarse identificadores como <code>_ga</code> y denominaciones
				afines; los plazos de conservación dependen de la configuración del producto y de las opciones
				que Google aplique.
			</p>
			<p>
				<strong>Base jurídica:</strong> consentimiento (art. 6.1.a RGPD), prestado mediante el banner.
			</p>

			<h3>4.3 Incorporación de terceros — Chat Typebot (solo si pulsa «Aceptar todas»)</h3>
			<p>
				El asistente de chat opcional se sirve desde <strong>Typebot</strong> (dominio configurado, p.
				ej. typebot.io). La carga del iframe puede implicar cookies o tecnologías similares bajo la política
				de Typebot y de sus proveedores de infraestructura.
			</p>
			<p><strong>Base jurídica:</strong> consentimiento.</p>

			<h2>5. Tabla resumen (no exhaustiva)</h2>
			<div class="table-wrap">
				<table class="legal-table">
					<thead>
						<tr>
							<th>Tipo</th>
							<th>Finalidad</th>
							<th>Cuándo actúa</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Técnicas / preferencias</td>
							<td>Idioma, almacenamiento de la elección de cookies</td>
							<td>Según configuración / necesarias para funciones básicas</td>
						</tr>
						<tr>
							<td>Google Analytics 4</td>
							<td>Medición de audiencia y estadísticas de uso</td>
							<td>Solo tras «Aceptar todas»</td>
						</tr>
						<tr>
							<td>Typebot (incrustado)</td>
							<td>Asistente conversacional</td>
							<td>Solo tras «Aceptar todas»</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h2>6. Plazo de conservación</h2>
			<p>
				Las cookies de sesión caducan al cerrar el navegador (salvo que se indique lo contrario).
				Las persistentes permanecen el tiempo fijado por cada responsable (p. ej. Google). Puede
				eliminarlas desde la configuración de su navegador en cualquier momento.
			</p>

			<h2>7. Cómo modificar o retirar el consentimiento</h2>
			<p>
				Utilice el enlace <strong>«Preferencias de cookies»</strong> en el pie del sitio para volver a
				mostrar el banner. También puede configurar su navegador para bloquear o borrar cookies; el bloqueo
				de cookies necesarias puede afectar al recuerdo del idioma o a la guarda de su decisión.
			</p>

			<h2>8. Transferencias internacionales</h2>
			<p>
				Proveedores como Google o Typebot pueden tratar datos en países fuera del EEE. Cuando
				proceda, las transferencias se basan en garantías adecuadas (p. ej. cláusulas contractuales
				tipo) según la documentación de cada proveedor.
			</p>

			<h2>9. Actualizaciones</h2>
			<p>
				Podremos modificar esta política por cambios legales o técnicos. La fecha de versión
				indicada arriba reflejará las actualizaciones relevantes.
			</p>

			<h2>10. Contacto</h2>
			<p>
				Consultas sobre esta política:
				<a href="mailto:info@moisesvalero.es">info@moisesvalero.es</a>
			</p>
		</article>
	{/if}
</main>

<style>
	.legal-doc {
		min-height: 60vh;
		padding: 120px 24px 80px;
		max-width: 760px;
		margin: 0 auto;
		font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
	}

	.legal-inner h1 {
		font-size: clamp(28px, 4vw, 36px);
		font-weight: 800;
		color: #1d1d1f;
		margin: 0 0 8px;
		letter-spacing: -0.03em;
	}

	.legal-updated {
		color: #86868b;
		font-size: 13px;
		margin: 0 0 16px;
	}

	.legal-disclaimer {
		background: #f5f5f7;
		border: 1px solid #e8e8ed;
		border-radius: 12px;
		padding: 14px 16px;
		font-size: 13px;
		line-height: 1.55;
		color: #424245;
		margin: 0 0 28px;
	}

	.legal-inner h2 {
		font-size: 18px;
		font-weight: 700;
		color: #1d1d1f;
		margin: 32px 0 12px;
	}

	.legal-inner h3 {
		font-size: 15px;
		font-weight: 700;
		color: #1d1d1f;
		margin: 20px 0 10px;
	}

	.legal-inner p {
		font-size: 15px;
		line-height: 1.65;
		color: #424245;
		margin: 0 0 12px;
	}

	.legal-inner a {
		color: #0071e3;
		font-weight: 600;
		text-decoration: none;
		word-break: break-word;
	}

	.legal-inner a:hover {
		text-decoration: underline;
	}

	.legal-inner code {
		font-size: 0.9em;
		background: #f1f5f9;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.table-wrap {
		overflow-x: auto;
		margin: 16px 0 24px;
		border: 1px solid #e8e8ed;
		border-radius: 12px;
	}

	.legal-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.legal-table th,
	.legal-table td {
		padding: 12px 14px;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid #e8e8ed;
	}

	.legal-table th {
		background: #f8fafc;
		font-weight: 700;
		color: #1d1d1f;
	}

	.legal-table tr:last-child td {
		border-bottom: none;
	}
</style>
