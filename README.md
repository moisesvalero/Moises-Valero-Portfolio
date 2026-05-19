# Portfolio SvelteKit + Sanity

Portfolio profesional de `moisesvalero.es` construido con **SvelteKit 2 + Svelte 5 + TypeScript**, con contenido gestionado en **Sanity**, automatizaciones SEO (sitemap, robots, IndexNow) y APIs internas para captación de leads (formulario, WhatsApp y analizador PageSpeed).

![Captura del portfolio](./static/imagenes/readme-portfolio-captura.png)

## Stack técnico

- `SvelteKit` + `Vite` + `TypeScript`
- `Sanity` como CMS headless (lectura y escritura desde servidor)
- `Vercel` (adapter automático en producción)
- `Resend` para envío de emails de contacto y leads
- `Google PageSpeed Insights API` para el analizador web

## Qué incluye el proyecto

- Home/portfolio principal y páginas de proyectos (`/`, `/proyectos/*`)
- Landing SEO local para servicios web (`/diseno-web` y `/diseno-web-alcoy`)
- Blog/artículos por slug desde CMS (`/diseno-web/[slug]`, `/diseno-web-alcoy/[slug]`)
- SEO técnico: canónicas, `sitemap.xml`, `robots.txt`, `llms.txt`, `indexnow-key.txt`
- Endpoints backend para formularios, locale, análisis PageSpeed e integración webhook de Sanity

## Estructura principal

```txt
src/
  routes/
    +layout.server.ts            # locale, site config, canonical/noindex
    api/
      contact/                   # formulario + WhatsApp
      locale/                    # cambio de idioma
      pagespeed/                 # analizador + captura lead
      indexnow/submit/           # envío manual a IndexNow
      webhooks/sanity/indexnow/  # auto IndexNow al publicar en Sanity
    diseno-web*/                 # landings SEO
    proyectos/                   # casos/proyectos
  lib/
    components/                  # bloques UI/landing/portfolio
    server/                      # fetch a Sanity, mapeos y lógica server
    data/                        # defaults/fallbacks locales
sanity/
  schemaTypes/                   # esquemas CMS
  seed-*.ts / patch-*.ts         # scripts de seed/migración
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run check
npm run studio
```

Scripts extra de contenido en Sanity:

- `npm run sanity:patch-og`
- `npm run sanity:clone-landing-national`
- `npm run sanity:hero-marquee`
- `npm run sanity:seed-support-articles`

## Variables de entorno

Duplica `.env.example` a `.env` y configura lo que necesites.

### Base

- `PUBLIC_SITE_URL` URL pública del sitio

### Sanity (lectura/escritura CMS)

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_READ_TOKEN` (opcional lectura privada)
- `SANITY_WRITE_TOKEN` (si escribes desde API/scripts)

### Captación y analizador

- `PAGESPEED_API_KEY`
- `PAGESPEED_MAX_CALLS_PER_DAY` (opcional)
- `PAGESPEED_RATE_LIMIT_PER_HOUR` (opcional)
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `WHATSAPP_E164` (opcional)

### IndexNow y webhooks

- `INDEXNOW_KEY`
- `INDEXNOW_SUBMIT_TOKEN`
- `SANITY_WEBHOOK_TOKEN`

## Endpoints API relevantes

- `POST /api/contact/form` envío de formulario por email (con rate limit + honeypot)
- `GET /api/contact/whatsapp` redirección server-side a WhatsApp
- `POST /api/pagespeed/analyze` encola/ejecuta análisis de URL
- `GET /api/pagespeed/analyze/[jobId]` polling del estado del análisis
- `POST /api/pagespeed/lead` envío de informe y registro de lead
- `POST /api/locale` persistencia de idioma (`es`/`en`) en cookie
- `POST /api/indexnow/submit` notificación manual a IndexNow
- `POST /api/webhooks/sanity/indexnow` notificación automática al publicar artículos

## Flujo de contenido (CMS)

1. El frontend intenta cargar contenido desde Sanity.
2. Si faltan variables o falla Sanity, usa defaults locales de `src/lib/data`.
3. El mapeo unifica estructura para renderizar sin romper páginas.
4. Artículos y landings SEO se sirven por slug y generan canónica coherente.

## Desarrollo local

```bash
npm install
npm run dev
```

Para validar antes de desplegar:

```bash
npm run check
npm run build
```

## Despliegue

- Preparado para desplegar en Vercel.
- En producción, define las variables de entorno del bloque anterior.
- Verifica después del deploy:
  - `/sitemap.xml`
  - `/robots.txt`
  - `/llms.txt`
  - `/llms-full.txt`
  - flujo de formulario y endpoints `/api/*`

## SEO + GEO (Generative Engine Optimization)

El proyecto tiene una capa SEO/GEO centralizada para que buscadores tradicionales y buscadores generativos (ChatGPT, Claude, Perplexity, Google AI Overviews) puedan indexar e ingerir el contenido.

### Qué se inyecta automáticamente

| Pieza | Dónde | Responsable |
|---|---|---|
| `<link rel="canonical">` | Todas las páginas | `src/routes/+layout.server.ts` (con regla Alcoy ↔ nacional). **No tocar.** |
| `noindex` en hosts no productivos | Todas las páginas | `+layout.server.ts` + `+layout.svelte` |
| `<link rel="alternate" hreflang>` (es/en/x-default) | Todas las páginas | `src/routes/+layout.svelte` |
| `<link rel="alternate" type="text/plain" href="/llms.txt">` | Todas las páginas | `src/routes/+layout.svelte` |
| `<html lang="...">` dinámico (cookie → Accept-Language → fallback es) | SSR de cualquier ruta | `src/hooks.server.ts` (vía `transformPageChunk`) + `src/app.html` |
| `/robots.txt` con AI bots permitidos y `Disallow: /api/` | endpoint | `src/routes/robots.txt/+server.js` |
| `/sitemap.xml` con `<xhtml:link hreflang>` y artículos del CMS | endpoint | `src/routes/sitemap.xml/+server.js` |
| `/llms.txt` (índice estilo llmstxt.org) | endpoint | `src/routes/llms.txt/+server.js` |
| `/llms-full.txt` (todo el contenido de las landings en Markdown) | endpoint | `src/routes/llms-full.txt/+server.ts` |

### Registro central de páginas

Todo el GEO se alimenta desde `src/lib/site-pages.ts`. Cada entrada describe `path`, `titleEs/En`, `descEs/En`, `changefreq`, `priority`, `group` y `locales`.

```ts
export const sitePages: SitePage[] = [
  { path: '/diseno-web-alcoy', titleEs: '...', descEs: '...', changefreq: 'weekly', priority: 0.95, group: 'landing', locales: ['es'] },
  // ...
];
```

### Helpers reutilizables

- `src/lib/seo.ts`: store `seo` (writable) + `setSeo(partial)` + `defaultSeo` con todos los campos del playbook (`schemaType`, `keywords`, `faq`, `howto`, `softwareName`, …). Listo para que páginas nuevas lo usen.
- `src/lib/components/JsonLd.svelte`: componente opcional que inyecta automáticamente `Organization` + `WebSite` (con `SearchAction`) + `BreadcrumbList` derivado de `page.url.pathname`. Acepta `type`, `faq`, `howto`, `softwareName`. Pensado para páginas nuevas: las landings y artículos actuales ya tienen JSON-LD propio y siguen funcionando.
- `src/lib/components/JsonLdScript.svelte`: wrapper de bajo nivel para JSON-LD pre-serializado (lo usan los `<svelte:head>` actuales).

### Las dos landings de diseño

`/diseno-web-alcoy` y `/diseno-web` (esta última reusa el componente Alcoy) inyectan **8 bloques JSON-LD**: `ProfessionalService`, `Organization`, `Service`, `WebPage`, `FAQPage`, `BreadcrumbList`, `WebSite + SearchAction` y `SoftwareApplication` (analizador PageSpeed). Las metas OG/Twitter, robots, canonical, hreflang y links a `llms.txt` se mantienen intactas.

### Cómo añadir una página nueva al GEO

1. Crea la ruta `src/routes/.../+page.svelte` con su contenido y su propio `<svelte:head>` (título y description únicos por ruta).
2. Añade una entrada en `src/lib/site-pages.ts` con `path`, `titleEs` (y `titleEn` si tiene versión inglesa), `descEs/En`, `changefreq`, `priority`, `group` (`landing | portfolio | project | support | legal`) y `locales`.
3. Si es una página nueva sin JSON-LD propio, importa `<JsonLd type="WebPage" />` (o `Article`, `FAQPage`, `HowTo`, `SoftwareApplication`, `CollectionPage`) y pásale `faq` o `howto` si aplica.
4. Listo: la URL aparecerá automáticamente en `/sitemap.xml`, `/llms.txt` y, si añades su contenido al renderer de `llms-full.txt`, también en el volcado completo.

### AEO (AI Engine Optimization) v1.0

Cada página indexable expone un **twin Markdown** (`/ruta.md`, home → `/index.md`) con `X-Robots-Tag: noindex`. Los crawlers IA y clientes con `Accept: text/markdown` reciben Markdown en la URL canónica; el HTML sigue indexable.

| Pieza | Ubicación |
|---|---|
| Negociación `Accept` + bots IA | `src/hooks.server.ts` (antes/después de `resolve`) |
| Builders y registro | `src/lib/aeo/` |
| Twins explícitos | `src/routes/**/*.md/+server.ts` |
| `<link rel="alternate" type="text/markdown">` | `src/routes/+layout.svelte` |
| Twins en sitemap | `src/routes/sitemap.xml/+server.js` |

**Checklist al crear una página indexable nueva:**

1. Entrada en `src/lib/site-pages.ts` (`aeoTwin` por defecto `true`).
2. Builder en `src/lib/aeo/builders/` y registro en `src/lib/aeo/registry.ts`.
3. Ruta `src/routes/.../nombre.md/+server.ts` que llame a `serveMarkdownTwin`.
4. `npm run check` y probar: `curl -sI -H "Accept: text/markdown" http://localhost:5173/tu-ruta`.

Validación local (con `npm run dev`):

```bash
curl -sI -H "Accept: text/markdown" http://localhost:5173/
curl -sI -A "Mozilla/5.0 (compatible; GPTBot/1.0)" http://localhost:5173/
curl -sI http://localhost:5173/index.md
curl -sI -A "Mozilla/5.0 Chrome" http://localhost:5173/
```



