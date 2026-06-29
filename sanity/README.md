# Sanity — scripts y flujo para agentes

Documentación de los scripts CLI en esta carpeta.

**Guías generales de continuidad (leer primero):**
- [docs/GUIA-AGENTES-CASE-STUDIES.md](../docs/GUIA-AGENTES-CASE-STUDIES.md) — repos GitHub → case study.
- [docs/GUIA-AGENTES-BLOG.md](../docs/GUIA-AGENTES-BLOG.md) — tema + imagen → artículo del blog.
- [AGENTS.md](../AGENTS.md)

## Requisitos

1. Sesión local: `pnpm exec sanity login` (WSL, en la raíz del repo).
2. Ejecutar scripts con token de usuario:
   ```bash
   pnpm exec sanity exec sanity/<script>.ts --with-user-token
   ```
3. Alternativa: `SANITY_WRITE_TOKEN` en `.env` (no commitear).

Proyecto: `5zhz6irf` · dataset: `production` (ver `sanity.config.ts`).

Comprobar sesión:

```bash
pnpm exec sanity exec sanity/check-auth.ts --with-user-token
```

---

## Flujo: nuevo case study desde GitHub

Cuando el usuario pase un repo con README y capturas:

1. **Leer** el README del repo y localizar imágenes (`public/`, `docs/`, screenshots en el README).
2. **Crear** `sanity/seed-case-study-<slug>.ts` siguiendo un seed existente (p. ej. `seed-case-study-sideglass-dashboard.ts`).
3. **Descargar** capturas a `static/imagenes/` si las rutas del seed apuntan a `/imagenes/...` (fallback strings en el documento Sanity).
4. **Subir** el documento:
   ```bash
   pnpm exec sanity exec sanity/seed-case-study-<slug>.ts --with-user-token
   ```
5. **Commit + push** de `static/imagenes/*` y el script de seed (el contenido Sanity ya está en la nube; las imágenes estáticas sí necesitan deploy).
6. Si no hay capturas en el repo, usar Playwright:
   ```bash
   node scripts/capture-web-analyzer-screenshots.mjs
   ```
   (adaptar o crear script similar; requiere `pnpm dlx playwright@1.60.0 install chromium` en WSL).

La ruta pública es `/proyectos/[slug]` vía `src/routes/proyectos/[slug]/` (GROQ en `src/lib/server/sanity/groq.ts`).

---

## Portada (proyectos destacados)

- **Límite fijo:** 4 proyectos (`src/lib/components/portfolio/PortfolioProjects.svelte` → `homeProjectCap = 4`).
- **Layout:** 1 `hero` + hasta 3 `spotlight` (no hay fila `standard` si solo hay esos cuatro).
- Los case studies con `showOnHome: true` se ordenan por **`orderRank`** (drag and drop en Studio → menú **Proyectos**). Afecta home y `/proyectos`.
- En Studio: arrastra proyectos en la lista **Proyectos** para reordenar. Si la lista no tiene orden, usa **Reset order** en el menú ⋮ de esa vista.

**Configuración actual deseada** (actualizar con el script, no a mano en Studio):

| Orden | Slug | Tier |
|------:|------|------|
| 1 | `fisionova` | `hero` |
| 2 | `rebranding-galeria-nova` | `spotlight` |
| 3 | `agentchecker` | `spotlight` |
| 4 | `sideglass-dashboard` | `spotlight` |

```bash
pnpm exec sanity exec sanity/patch-home-featured-projects.ts --with-user-token
```

Editar el array `FEATURED` en ese archivo si cambia la selección.

---

## Inventario de scripts

### Case studies (seed)

| Script | Propósito |
|--------|-----------|
| `seed-case-study-next-agent-template.ts` | Next Agent Template |
| `seed-case-study-sideglass-dashboard.ts` | Sideglass |
| `seed-case-study-agentchecker.ts` | agentchecker |
| `seed-case-study-web-analyzer.ts` | Web Analyzer |
| `seed-existing-project-pages.ts` | Migración inicial: vshield, ember-iron, galeria-nova, chatbot |
| `seed-initial-content.ts` | Documento singleton `portfolioSite` y contenido base |

### Blog / artículos (seed)

| Script | Propósito |
|--------|-----------|
| `seed-landing-support-article-TEMPLATE.ts` | **Plantilla** — copiar como `seed-landing-support-article-<slug>.ts` y rellenar |

> Para crear un artículo nuevo, sigue [docs/GUIA-AGENTES-BLOG.md](../docs/GUIA-AGENTES-BLOG.md).

### Portada y sitio

| Script | Propósito |
|--------|-----------|
| `patch-case-study-live-urls.ts` | Actualiza `liveUrl` de demos (subdominios moisesvalero.es) |
| `patch-sideglass-home-image.ts` | Tarjeta portada Sideglass (`images.cardImagePath`) |
| `patch-agentchecker-home-image.ts` | Tarjeta portada agentchecker (`images.cardImagePath`) |
| `patch-home-featured-projects.ts` | **Portada:** 4 destacados + ocultar el resto (`showOnHome: false`) |
| `patch-portfolio-site.ts` | Parche del singleton `portfolioSite` |
| `patch-portfolio-copy-i18n-safe.ts` | Copy i18n del portfolio (`pnpm run sanity:patch-portfolio`) |
| `migrate-home-locale-safe.ts` | Migración locale home (`pnpm run sanity:migrate-home-locale`) |

### Mantenimiento / auditoría

| Script | Propósito |
|--------|-----------|
| `check-auth.ts` | Verifica usuario Sanity, proyecto y case studies visibles |
| `fix-missing-keys.ts` | Repara `_key` faltantes en arrays Sanity |
| `audit-portfolio-unused-fields.ts` | Audita campos huérfanos |
| `cleanup-portfolio-unused-fields.ts` | Limpia campos no usados |

### Scripts npm relacionados (`package.json`)

- `pnpm run studio` — Sanity Studio local
- `pnpm run sanity:patch-portfolio` — copy i18n seguro
- `pnpm run sanity:migrate-home-locale` — migración locale

### Capturas (fuera de `sanity/`)

| Script | Propósito |
|--------|-----------|
| `scripts/capture-agentchecker-card.mjs` | Card 16:9 portada agentchecker (`agentcheck-rho.vercel.app`) |
| `scripts/capture-web-analyzer-screenshots.mjs` | Capturas del **standalone** `web-analyzer-three.vercel.app` (no el del portfolio) |

---

## Qué va a git vs solo Sanity

| Cambio | ¿Commit + push? |
|--------|------------------|
| Textos / campos en documentos `caseStudy` | No (ya en Sanity) |
| Imágenes en `static/imagenes/` referenciadas por rutas | **Sí** |
| Scripts `sanity/seed-*.ts` / `patch-*.ts` | Recomendable |
| `showOnHome` / portada vía patch | No (solo Sanity) |

---

## Esquema relevante

- `sanity/schemaTypes/caseStudy.ts` — plantilla `/proyectos/[slug]`
- `sanity/schemaTypes/landingSupportArticle.ts` — artículos `/blog/[slug]`
- `sanity/schemaTypes/portfolioSite.ts` — textos de home y `maxHomeProjects` (default 4)
- Mapeo front: `src/lib/server/sanity/map-sanity-case-study.ts`, `map-site-portfolio.ts`

---

## Convenciones al redactar case studies

- Campos ES obligatorios; EN en `titleEn`, `heroDescriptionEn`, `retoEn`, etc.
- Tono: proyecto personal honesto; métricas creíbles o cualitativas si el usuario lo pide.
- `repoUrl` y `liveUrl` cuando existan.
- Portada/archivo: `images.cardImagePath` (ruta) o `images.cardImage` (asset Sanity); si vacío, `images.principal`.
- `checklistPublicacion` en `true` al publicar.

## Convenciones al redactar artículos del blog

- Solo ES. Si en el futuro quieres EN, duplicar campos en `landingSupportArticle`.
- `bodyHtml` con HTML simple (`<h2>`, `<h3>`, `<p>`, `<ul>`, `<strong>`, `<blockquote>`, `<pre>`). Mínimo 300 chars.
- Portada en `static/imagenes/<slug>-cover.png` (16:9) y `coverImageSrc` apuntando a esa ruta.
- `showOnBlog: true` solo si debe salir en "Guías recomendadas" en `/blog`; `featuredOrder` menor sale antes.
