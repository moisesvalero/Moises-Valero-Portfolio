/**
 * Seed para el artículo del blog: Servidor doméstico 24/7 con un smartphone Android (POCO X3), Hermes IA, Crons y DLNA
 * Repo público: https://github.com/moisesvalero/android-home-server
 */

import { getCliClient } from 'sanity/cli';
import { createClient } from '@sanity/client';

const SLUG = 'servidor-domestico-movil-viejo';
const PUBLISHED_AT = '2026-09-25T12:00:00.000Z';

const TITLE = 'Cómo convertí un smartphone Android en un servidor doméstico 24/7 con IA y DLNA';

const COVER_IMAGE_SRC = '/imagenes/servidor-domestico-movil-viejo-cover.png';
const COVER_IMAGE_ALT =
	'Smartphone actuando como servidor doméstico con métricas de terminal en pantalla junto a un televisor reproduciendo contenido multimedia en el salón.';

const CATEGORY_LABEL = 'Guía técnica';
const EXCERPT =
	'Guía paso a paso para transformar un smartphone Android en un servidor doméstico 24/7: agente de IA Hermes, crons de empleo y chollos, y servidor DLNA con dashboard web para tu Smart TV con 0€ al mes.';

const READING_MINUTES = 13;
const SHOW_ON_BLOG = true;
const FEATURED_ORDER: number | null = 1;

const SEO_TITLE = 'Servidor doméstico con un smartphone Android: IA autónoma, crons y DLNA';
const SEO_DESCRIPTION =
	'Aprende a transformar un smartphone Android en un servidor doméstico 24/7: agente de IA con Hermes, crons de empleo y chollos por Telegram, y streaming a tu Smart TV con 0€ al mes.';

const BODY_HTML = `
<p>Todos tenemos en casa un cajón donde van a morir los teléfonos antiguos. Dispositivos que sustituimos no porque su procesador haya dejado de funcionar, sino porque la batería ya no dura un día entero o porque la pantalla tiene alguna grieta superficial. En mi caso, ese teléfono era un <strong>Xiaomi POCO X3</strong>: un procesador Snapdragon de 8 núcleos ARM64, <strong>6 GB de memoria RAM LPDDR4X</strong> y almacenamiento flash UFS de alta velocidad.</p>

<p>Durante meses estuve pagando pequeñas cuotas por servidores privados virtuales (VPS) y peleándome con las capas gratuitas de la nube (como la micro-instancia de Google Cloud con un escaso gigabyte de memoria que colapsaba con cualquier tarea pesada). Miré el teléfono en el cajón y la conclusión fue inmediata: <strong>tenía sobre la mesa una máquina 6 veces más potente, con procesamiento paralelo real, batería de respaldo integrada y cero euros de coste mensual</strong>. Solo necesitaba el sistema operativo y el software adecuados para cobrar una segunda vida.</p>

<p>En esta guía técnica comparto la arquitectura completa, las medidas de seguridad física para la batería y el código de configuración para montar un servidor doméstico 24/7 que combina tres pilares: un <strong>agente de inteligencia artificial autónomo (Hermes Agent)</strong>, una suite de <strong>crons programados para cazar ofertas de empleo y chollos tecnológicos</strong>, y un <strong>servidor multimedia DLNA con panel web moderno</strong> para transmitir películas y series a la Smart TV del salón. Todo el código fuente del proyecto, modularizado y adaptable a cualquier teléfono Android y cualquier modelo de lenguaje, está disponible en abierto en el repositorio <a href="https://github.com/moisesvalero/android-home-server" target="_blank" rel="noopener noreferrer">android-home-server en GitHub</a>.</p>

<h2>1. La comparativa: ¿Por qué un smartphone bate a una VPS barata?</h2>

<p>Antes de escribir una sola línea de código, conviene poner las cifras sobre la mesa. Cuando contratamos una VPS básica o recurrimos a niveles gratuitos de proveedores cloud habituales, nos encontramos con cuellos de botella muy severos:</p>

<ul>
	<li><strong>Memoria RAM:</strong> Una instancia gratuita convencional ofrece 1 GB de RAM. A poco que levantes un par de procesos de Node.js o entornos de Python con librerías de scraping, el gestor de memoria del kernel (OOM Killer) interviene y cuelga el servidor. El POCO X3 cuenta con 6 GB de RAM física, dejando más de 2.5 GB limpios exclusivamente para tus servicios.</li>
	<li><strong>Potencia de CPU:</strong> Las máquinas virtuales compartidas asignan fracciones de núcleo (0.25 vCPU) sometidas a estrangulamiento térmico y de crédito. Un chip móvil de gama media integra 8 núcleos físicos ARM64 con capacidad de cómputo en paralelo real.</li>
	<li><strong>Almacenamiento:</strong> Los discos mecánicos o volúmenes de red de bajo coste sufren en operaciones concurrentes de entrada/salida (IOPS). La memoria flash interna (UFS) de un móvil ejecuta lecturas y escrituras de bases de datos SQLite de forma prácticamente instantánea.</li>
	<li><strong>SAI / UPS integrado de serie:</strong> Si hay una tormenta o un corte de luz en tu edificio, una Raspberry Pi o un mini PC doméstico se apaga de golpe, corriendo el riesgo de corromper la tarjeta microSD o la base de datos. El smartphone cuenta con su propia batería: continúa operando durante horas sin inmutarse.</li>
	<li><strong>Consumo eléctrico:</strong> El terminal consume entre <strong>1 y 3 vatios</strong> en reposo y carga ligera. El impacto en tu factura eléctrica anual es de apenas un par de euros.</li>
</ul>

<blockquote>"El hardware de un smartphone Android supera con creces los recursos de la mayoría de servidores que contratamos en la nube para automatizaciones personales."</blockquote>

<h2>2. Seguridad física: La estrategia del 50% para la batería</h2>

<p>El mayor riesgo técnico al reutilizar un móvil como servidor 24/7 no está en el software, sino en la química de su batería. Dejar una batería de iones de litio conectada a un cargador de pared de forma ininterrumpida al 100% de carga provoca degradación acelerada, sobrecalentamiento constante y, con el tiempo, hinchazón física de la celda.</p>

<p>Para solucionar este problema de forma infalible y sin necesidad de modificar el hardware ni rootear el terminal, implementé un enfoque en dos niveles:</p>

<h3>El temporizador de corriente analógico</h3>
<p>Conecté el cargador del teléfono a un <strong>enchufe con temporizador mecánico</strong> (un accesorio estándar de menos de 5 euros). El temporizador está programado para dejar pasar corriente únicamente <strong>30 a 45 minutos dos veces al día</strong> (por ejemplo, a primera hora de la mañana y a última de la tarde).</p>
<p>Durante el resto de la jornada, el cargador permanece completamente apagado. Con este ciclo, el nivel de carga del móvil oscila de forma natural entre el <strong>45% y el 70%</strong>. A nivel electroquímico, el litio se mantiene en su rango de reposo más estable (~3.8V por celda), eliminando por completo la presión química del 100% y asegurando años de vida útil sin hinchazón.</p>

<h3>El watchdog térmico y de carga (cron_battery_guard.py)</h3>
<p>Como medida de contingencia ante fallos mecánicos del enchufe o desconexiones accidentales, un script en Python programado como cron cada 30 minutos vigila la salud del dispositivo consultando la API de Termux:</p>

<pre><code># Consulta de telemetría sin permisos especiales
termux-battery-status
</code></pre>

<p>El script evalúa dos umbrales críticos:</p>
<ul>
	<li><strong>Batería baja (&lt; 25%):</strong> Si el porcentaje cae por debajo de este umbral (lo que indicaría que el temporizador ha fallado o alguien desenchufó el cable), envía una alerta urgente a Telegram para intervenir antes de que el dispositivo se apague.</li>
	<li><strong>Alerta térmica preventiva (≥ 45°C / 48°C):</strong> Si la temperatura del teléfono supera los 45°C por una alta carga continuada de trabajo o temperatura ambiental elevada, emite un aviso de emergencia inmediato para pausar tareas intensivas y proteger el hardware.</li>
</ul>

<h2>3. Preparación del sistema: Termux sin root en ARM64</h2>

<p>Una de las grandes ventajas de este montaje es que <strong>no requiere rootear el dispositivo ni desbloquear el bootloader</strong>. Todo el entorno se ejecuta limpiamente en el espacio de usuario gracias a Termux.</p>

<h3>Paso 1: Instalación desde F-Droid</h3>
<p>Es fundamental no utilizar la versión de Termux presente en Google Play Store, ya que está obsoleta y congelada debido a políticas antiguas de Android. Debes descargar <strong>Termux</strong> y el complemento <strong>Termux:API</strong> directamente desde <a href="https://f-droid.org" target="_blank" rel="noopener noreferrer">F-Droid</a>.</p>

<h3>Paso 2: Neutralizar el ahorro de energía (Doze)</h3>
<p>Android por defecto suspende las aplicaciones en segundo plano cuando la pantalla se apaga. Para convertir el móvil en un servidor fiable:</p>
<ol>
	<li>Ve a <em>Ajustes → Aplicaciones → Termux → Batería</em> y selecciona <strong>"Sin restricciones"</strong>.</li>
	<li>Ejecuta dentro de Termux el comando para adquirir el bloqueo de suspensión del procesador:</li>
</ol>
<pre><code>termux-wake-lock
</code></pre>

<h3>Paso 3: Entorno base y compiladores nativos</h3>
<p>Para evitar problemas al compilar librerías de Python escritas en C o Rust (como <code>cryptography</code>, <code>lxml</code> o <code>psutil</code>) sobre la arquitectura <code>aarch64</code> de Android, instalamos los paquetes nativos precompilados mediante el gestor <code>pkg</code>:</p>

<pre><code>pkg update -y
pkg install -y python nodejs-lts git openssh cronie termux-api \\
               rust binutils make clang libxml2 libxslt \\
               python-psutil python-cryptography python-lxml
npm install -g pm2
</code></pre>

<h3>Paso 4: Hardening de SSH sin contraseñas</h3>
<p>Para administrar el servidor de forma remota y cómoda desde tu ordenador a través del puerto <code>8022</code> de Termux, debemos blindar el acceso:</p>
<ul>
	<li>Copia tu clave pública SSH (<code>~/.ssh/id_ed25519.pub</code>) al archivo <code>~/.ssh/authorized_keys</code> del teléfono.</li>
	<li>Modifica la configuración en <code>$PREFIX/etc/ssh/sshd_config</code> desactivando la autenticación por contraseña (<code>PasswordAuthentication no</code>) y habilitando únicamente autenticación por claves (<code>PubkeyAuthentication yes</code>).</li>
	<li><strong>Regla de oro:</strong> Nunca abras ni redirijas el puerto 8022 en tu router hacia Internet. La administración debe quedar estrictamente restringida a tu red Wi-Fi local o realizarse a través de una VPN doméstica segura como WireGuard o Tailscale.</li>
</ul>

<blockquote>"¿Por qué no necesitas una IP estática ni abrir puertos en el router? Porque la comunicación con Telegram y los modelos de IA se realiza por sondeo saliente (long-polling). El móvil inicia las peticiones hacia fuera; jamás expone servicios a la red pública."</blockquote>

<h2>4. El agente de IA: Hermes Agent bajo control local</h2>

<p>El núcleo de inteligencia del servidor es <strong>Hermes Agent</strong>, un agente de IA versátil capaz de gestionar herramientas, memoria y llamadas a modelos de lenguaje. Corre como servicio desatendido gestionado por PM2.</p>

<h3>Selección de modelo y optimización de costes</h3>
<p>Para dotar de inteligencia al servidor sin gastar fortunas en llamadas a la API, conectamos Hermes con el modelo <strong>DeepSeek Flash (V4.1)</strong>. Ofrece un equilibrio perfecto: excelente capacidad de redacción y filtrado en castellano, una velocidad de respuesta que roza el tiempo real y un coste por millón de tokens tan bajo que permite ejecutar múltiples análisis diarios por una fracción de céntimo al mes.</p>

<h3>Motor de búsqueda con triple redundancia</h3>
<p>Un agente autónomo que depende de la web no puede detenerse si una API externa de búsqueda arroja un error 429 de límite de cuota. Para evitar puntos únicos de fallo, implementé en <code>scripts/web_search_helper.py</code> una arquitectura de búsqueda resistente en tres escalones:</p>
<ol>
	<li><strong>Rotación multiclave de Tavily:</strong> El sistema soporta un array de API keys separadas por comas. Si una clave agota su saldo mensual, conmuta automáticamente a la siguiente sin interrumpir el proceso.</li>
	<li><strong>Extracción profunda con Firecrawl:</strong> Utilizado para raspar páginas complejas y convertirlas a formato Markdown limpio y procesable por el LLM.</li>
	<li><strong>Fallback nativo con DuckDuckGo:</strong> Si todas las APIs de pago fallan o no hay conexión con ellas, un scraper ligero basado en peticiones HTTP seguras consulta DuckDuckGo de forma 100% gratuita y sin límites de saldo.</li>
</ol>

<h3>Megafonía física en casa: El plugin TTS (/di y /habla)</h3>
<p>Uno de los detalles más prácticos del proyecto fue aprovechar los <strong>altavoces estéreo físicos</strong> del POCO X3 como un sistema de megafonía doméstica que puedo controlar en cualquier momento desde mi Telegram, esté donde esté.</p>
<p>A través de un plugin nativo para Hermes (<code>plugins/megaphone</code>), el sistema intercepta comandos que comiencen por <code>/di &lt;mensaje&gt;</code> o <code>/habla &lt;mensaje&gt;</code>. En lugar de pasar el mensaje por el LLM (lo que consumiría tokens y añadiría latencia), el plugin toma el control directo:</p>

<pre><code># El plugin eleva el volumen multimedia al 100% y sintetiza el texto
termux-volume music 15
termux-tts-speak -s MUSIC -l es-ES "Atención: la cena está servida en el comedor"
</code></pre>

<p>La respuesta es instantánea (menos de 300 milisegundos), con cero consumo de tokens y con la voz nativa en español del sistema de síntesis de Android resonando con total claridad en el salón.</p>

<h2>5. Automatización: Crons de empleo y radar de chollos</h2>

<p>Con el agente y el entorno listos, el servidor ejecuta una batería de tareas desatendidas que me informan a diario directamente a través de un canal privado de Telegram.</p>

<h3>El escáner de empleo inteligente (cron_empleo.py)</h3>
<p>El objetivo de este script es realizar un barrido diario a primera hora de la mañana por portales de empleo clave (InfoJobs, Indeed, Tecnoempleo, Trabajos.com, portales municipales locales y plataformas de empleo remoto en España). Para que una herramienta de este tipo sea realmente útil y no se convierta en spam molesto, resolvimos tres desafíos técnicos:</p>

<ul>
	<li><strong>Doble vertiente de búsqueda:</strong> El script rastrea tanto ofertas presenciales en la comarca (fábrica, producción, logística, comercio, administración) como vacantes 100% en remoto en toda España (desarrollo web frontend, WordPress, soporte técnico N1 y atención al cliente).</li>
	<li><strong>Memoria persistente contra duplicados (seen_jobs.json):</strong> Cada vez que se detecta una oferta, se almacena un identificador hash de su URL en un archivo JSON en disco. Al día siguiente, el script ignora automáticamente las ofertas que ya fueron notificadas, mostrando con una etiqueta destacada únicamente las vacantes estrictamente nuevas de las últimas 24 horas.</li>
	<li><strong>Curación editorial con DeepSeek:</strong> Los resultados en bruto se pasan a un prompt estructurado de DeepSeek. El modelo extrae el puesto, la empresa, la ubicación, si permite teletrabajo y la URL directa limpia, descartando puestos que exijan experiencia senior fuera de perfil.</li>
</ul>

<h3>El radar cazachollos (cron_chollos.py)</h3>
<p>Este cron rastrea a mediodía foros especializados, canales de liquidaciones y plataformas de comercio electrónico en busca de ofertas agresivas en tecnología:</p>
<ul>
	<li>Ofertas en consolas (Xbox Series X), códigos de suscripción a Game Pass y periféricos.</li>
	<li>Descuentos en hardware informático y ecosistema Apple (MacBook, iPad, AirPods).</li>
	<li>Detección de errores de precio y liquidaciones de inventario por descatalogación.</li>
</ul>
<p>El LLM valida que la oferta contenga un precio final concreto y un descuento palpable frente a su PVP habitual, enviando la ficha lista para comprar con su enlace directo antes de que se agote el stock.</p>

<h2>6. Servidor Multimedia DLNA y Dashboard Web</h2>

<p>El tercer gran propósito del POCO X3 es servir como reproductor multimedia doméstico para una Smart TV Samsung sin tener que recurrir a suscripciones adicionales ni conectar memorias USB físicas al televisor.</p>

<h3>DLNA nativo con MiniDLNA (Puerto 8200)</h3>
<p>En lugar de instalar suites pesadas como Plex o Jellyfin (que requieren bases de datos densas e intentan transcodificar vídeo en tiempo real en la CPU del teléfono), instalamos <strong>MiniDLNA</strong>. Corre en Termux con un consumo ridículo de apenas <strong>17 MB de memoria RAM y 0% de CPU en reposo</strong>. Al transmitir a la televisión, se limita a leer los datos de la memoria flash y enviarlos por la red Wi-Fi local mediante streaming directo.</p>
<p>En el televisor Samsung, basta con pulsar el botón <em>Fuentes</em> del mando a distancia para ver el icono <strong>POCO X3 Media Server</strong> con todas las carpetas organizadas.</p>

<h3>El Dashboard Web estilo macOS / VisionOS (Puerto 8090)</h3>
<p>Para gestionar la biblioteca de películas y series sin tocar la terminal, desarrollé un panel web interactivo accesible desde cualquier navegador en la red local (<code>http://&lt;IP-DEL-MOVIL&gt;:8090</code>):</p>

<ul>
	<li><strong>Telemetría en tiempo real (Bento Card):</strong> Muestra la temperatura exacta del teléfono con código de color, un ecualizador animado del estado del sistema, nivel de batería y gigas libres de almacenamiento flash.</li>
	<li><strong>Cola de subidas Drag &amp; Drop:</strong> Puedes arrastrar múltiples archivos de vídeo desde el ordenador. El servidor HTTP (<code>dashboard_server.py</code>) escribe directamente a disco en bloques de 64 KB con control de timeouts y limpieza automática de parciales si se interrumpe la red, evitando archivos corruptos en la biblioteca.</li>
	<li><strong>Carátulas HD automáticas (fetch_cover.py):</strong> Al completar la subida de un vídeo, un proceso en segundo plano consulta las APIs públicas de IMDb y TVMaze, localiza el póster oficial en alta definición y lo guarda junto al archivo para que aparezca tanto en la web como en la Smart TV.</li>
</ul>

<h3>La trampa de los archivos AVI y el "Botón Mágico"</h3>
<p>Al conectar el sistema a la Smart TV Samsung nos encontramos con un obstáculo técnico muy común en los televisores modernos: <strong>el sistema operativo Tizen rechaza por hardware los archivos .avi codificados con vídeo MPEG-4 Parte 2 (DivX o Xvid antiguos)</strong>, mostrando el frustrante mensaje de <em>"Formato de archivo no compatible"</em>.</p>

<p>Forzar al procesador del móvil a transcodificar un archivo pesado de vídeo con <code>ffmpeg</code> habría provocado sobrecalentamiento, consumo excesivo de batería y varios minutos de espera con los ventiladores del chip al 100%. La solución arquitectónica fue mucho más limpia:</p>

<ol>
	<li><strong>Detección en el navegador:</strong> Si arrastras un archivo con extensión <code>.avi</code> al Dashboard web, el panel lo intercepta y muestra un modal explicativo.</li>
	<li><strong>El Mac Helper local:</strong> Un microservicio ultraligero corre en el ordenador de trabajo como servicio de fondo (LaunchAgent de macOS), consumiendo 0% de CPU y solo 16 MB de RAM.</li>
	<li><strong>Conversión con 1 clic:</strong> Al pulsar el botón <strong>[ 🪄 Convertir y Subir ]</strong> en la web, el ordenador convierte el vídeo a máxima velocidad mediante su procesador con <code>ffmpeg</code> nativo (pasándolo a contenedor <code>.mp4</code>, vídeo H.264 perfil Main 4.0 y audio AAC), comprueba la integridad por hash SHA-256 y lo transfiere automáticamente al POCO X3 con su carátula asociada.</li>
</ol>

<h2>7. Persistencia y despliegue continuo</h2>

<p>Para asegurar que este servidor funcione de manera completamente desatendida durante meses, implementamos dos mecanismos fundamentales:</p>

<h3>Auto-arranque tras reinicio (Termux:Boot)</h3>
<p>Con el paquete <code>termux-boot</code> instalado, creamos el script en <code>~/.termux/boot/start-services.sh</code>:</p>

<pre><code>#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
sshd
pm2 resurrect
</code></pre>

<p>Si por cualquier motivo el teléfono se reinicia, Termux arranca automáticamente en segundo plano, adquiere el wake-lock para no dormirse, inicia el servidor SSH y resucita mediante PM2 el trío de servicios: el agente Hermes, el servidor DLNA y el panel web multimedia.</p>

<h3>Flujo de despliegue sincronizado (deploy.sh)</h3>
<p>Para no editar código directamente en la pequeña pantalla táctil del móvil, el desarrollo se realiza en el ordenador y se sincroniza al teléfono mediante un script de despliegue con <code>rsync</code> por SSH:</p>

<pre><code>./deploy.sh
</code></pre>

<p>El script aplica una separación estricta: sincroniza únicamente el código fuente de los scripts, plugins y configuraciones del repositorio, pero <strong>respeta y nunca sobrescribe los datos vivos del móvil</strong> (las variables de entorno locales en <code>.env</code>, los archivos de memoria de crons como <code>seen_jobs.json</code> o las bases de datos de miniDLNA).</p>

<h2>Conclusión: Tecnología circular y soberanía digital</h2>

<p>Dar una segunda vida a un teléfono móvil que parecía inservible no es solo un ejercicio gratificante de bricolaje tecnológico: es una reivindicación del potencial de la informática doméstica. Por <strong>cero euros de gasto recurrente</strong> y con un consumo eléctrico prácticamente imperceptible, disponemos de un asistente de inteligencia artificial siempre accesible, un rastreador diario de oportunidades laborales y ofertas, y un centro multimedia familiar de alto rendimiento.</p>

<p>Si tienes un smartphone con procesador decente olvidado en un cajón, te animo a desempolvarlo e intentarlo. Tienes toda la estructura de carpetas, scripts de automatización e instrucciones detalladas listas para clonar en el repositorio oficial de GitHub: <a href="https://github.com/moisesvalero/android-home-server" target="_blank" rel="noopener noreferrer">github.com/moisesvalero/android-home-server</a>.</p>
`.trim();

function getClient() {
	const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN;
	if (token) {
		return createClient({
			projectId: process.env.SANITY_PROJECT_ID || '5zhz6irf',
			dataset: process.env.SANITY_DATASET || 'production',
			token,
			useCdn: false,
			apiVersion: '2025-01-01'
		});
	}
	return getCliClient({ apiVersion: '2025-01-01' });
}

async function main() {
	if (TITLE.includes('[PLANTILLA]') || SLUG.startsWith('plantilla-')) {
		throw new Error('Configura los campos antes de ejecutar.');
	}

	const client = getClient();

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

	console.log(`Cargando artículo "${TITLE}" (${SLUG}) en Sanity...`);
	await client.createOrReplace(doc);
	console.log(`✅ Artículo ${SLUG} cargado con éxito en Sanity.`);
}

main().catch((error) => {
	console.error(`❌ Error cargando ${SLUG} en Sanity:`, error);
	process.exit(1);
});
