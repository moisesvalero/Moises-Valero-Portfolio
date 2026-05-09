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
  - flujo de formulario y endpoints `/api/*`

## Notas rápidas

- El repo ya no se documenta como plantilla genérica: este README describe el proyecto real.
- Solo existe un `README` en raíz; no hay otros readmes de plantilla que limpiar actualmente.
