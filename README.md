# Moises Valero Portfolio

Portfolio profesional de [moisesvalero.es](https://moisesvalero.es), construido con **SvelteKit 2**, **Svelte 5**, **TypeScript** y **Sanity**. El proyecto combina una experiencia visual cuidada con SEO técnico, contenido editable desde CMS y endpoints server-side para captación de leads.

![Captura del portfolio](./static/imagenes/readme-portfolio-captura.png)

## Enlaces

- **Web:** [moisesvalero.es](https://moisesvalero.es)
- **Stack principal:** SvelteKit, Svelte 5, TypeScript, Sanity, Vercel
- **Objetivo:** portfolio personal, landings SEO locales y casos de proyecto

## Trabajo con agentes IA

Si usas Cursor, Claude Code u otra herramienta para **añadir case studies desde GitHub** o gestionar la portada:

| Documento | Contenido |
|-----------|-----------|
| **[AGENTS.md](AGENTS.md)** | Entrada rápida para cualquier agente |
| **[docs/GUIA-AGENTES-CASE-STUDIES.md](docs/GUIA-AGENTES-CASE-STUDIES.md)** | Guía completa de continuidad (flujo, errores, proyectos ya cargados) |
| **[sanity/README.md](sanity/README.md)** | Scripts CLI Sanity (`seed-*`, `patch-*`) |

## Qué demuestra este proyecto

- Interfaz moderna con modo oscuro, animaciones, microinteracciones y diseño responsive.
- Arquitectura SvelteKit con rutas públicas, endpoints server-side y datos híbridos CMS/fallback local.
- SEO avanzado: sitemap, robots, canonical, hreflang, JSON-LD, `llms.txt` y twins Markdown para AEO/GEO.
- Integraciones reales: Sanity CMS, Resend, analizador web propio, IndexNow y Typebot.
- Cuidado de producción: variables privadas en servidor, `.env.example`, rate limits y honeypots.

## Stack técnico

| Área | Tecnología |
| --- | --- |
| Frontend | SvelteKit 2, Svelte 5, TypeScript, Vite |
| CMS | Sanity |
| Deploy | Vercel / adapter auto |
| UI | CSS custom, animaciones propias |
| Email/leads | Resend, formularios server-side |
| SEO/AEO | JSON-LD, sitemap, robots, llms.txt, Markdown twins |
| Analítica/auditoría | GA4 opcional, analizador web propio |

## Funcionalidades principales

- Home portfolio con presentación, stack, trayectoria, servicios y proyectos.
- Páginas de proyecto en `/proyectos/*`.
- Landings SEO para servicios web en `/diseno-web` y `/diseno-web-alcoy`.
- Blog/artículos por slug desde Sanity.
- Cambio de idioma `es/en` con cookie httpOnly.
- Formulario de contacto y redirección server-side a WhatsApp.
- Analizador web propio con captura de lead.
- Webhook Sanity -> IndexNow para notificar contenido nuevo o actualizado.

## Estructura del proyecto

```txt
src/
  routes/
    +layout.server.ts            # locale, site config, canonical/noindex
    api/
      contact/                   # formulario + WhatsApp
      locale/                    # cambio de idioma
      web-audit/                 # analizador + captura lead
      indexnow/submit/           # envío manual a IndexNow
      webhooks/sanity/indexnow/  # auto IndexNow al publicar en Sanity
    diseno-web*/                 # landings SEO
    proyectos/                   # casos/proyectos
  lib/
    components/                  # bloques UI/landing/portfolio
    server/                      # fetch a Sanity, mapeos y lógica server
    data/                        # defaults/fallbacks locales
sanity/
  README.md                      # inventario scripts CMS (leer antes de case studies/portada)
  schemaTypes/                   # esquemas CMS
  seed-*.ts / patch-*.ts         # scripts de seed/migración
static/
  fonts/                         # fuentes autoalojadas
  imagenes/                      # assets públicos del portfolio
docs/
  GUIA-AGENTES-CASE-STUDIES.md   # handoff agentes: GitHub → Sanity → portada
AGENTS.md                        # índice rápido para agentes IA
```


## Licencia

Este proyecto se publica bajo **PolyForm Noncommercial 1.0.0**. Puedes revisar, estudiar y usar el código para fines no comerciales; el uso comercial requiere permiso explícito.

Consulta [LICENSE](./LICENSE) para más detalles.
