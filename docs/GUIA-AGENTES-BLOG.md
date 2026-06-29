# Guía para agentes — Artículos del blog

Documento de **continuidad**: si cambias de agente, IDE o herramienta, lee esto antes de crear o actualizar artículos en Sanity o en `/blog`.

**Guías relacionadas (leer primero):**
- [docs/GUIA-AGENTES-CASE-STUDIES.md](./GUIA-AGENTES-CASE-STUDIES.md) — flujo de case studies (el "hermano" de esta guía).
- [sanity/README.md](../sanity/README.md) — inventario de scripts `seed-*` / `patch-*` y comandos CLI.

---

## Qué estamos haciendo

El usuario propone un **tema** (y a veces adjunta una imagen en el chat). El agente debe:

1. Redactar el **artículo** completo (ES) con `bodyHtml` en HTML simple.
2. Dejar la **portada** del artículo en `static/imagenes/<slug>-cover.png` y hacer **commit + push** (Vercel despliega los assets).
3. Crear `sanity/seed-landing-support-article-<slug>.ts` desde la plantilla y ejecutarlo.
4. Opcional: activar `showOnBlog: true` + `featuredOrder` para que aparezca en "Guías recomendadas" en `/blog`.
5. El usuario revisa en `https://moisesvalero.es/blog/<slug>`.

No hace falta crear rutas Svelte: `/blog/[slug]` ya lee Sanity por GROQ.

---

## Entorno obligatorio

| Requisito | Detalle |
|-----------|---------|
| OS | **WSL Ubuntu-Dev** (no PowerShell para `pnpm` / Sanity) |
| Package manager | `pnpm` |
| Sanity auth | `pnpm exec sanity login` en la raíz del repo |
| Ejecutar seeds | `pnpm exec sanity exec sanity/<script>.ts --with-user-token` |
| Comprobar sesión | `pnpm exec sanity exec sanity/check-auth.ts --with-user-token` |
| Proyecto Sanity | `5zhz6irf` · dataset `production` |

**No pegar tokens en el chat.** Usar `.env` local (`SANITY_WRITE_TOKEN`) o sesión `sanity login`.

---

## Flujo paso a paso (nuevo artículo)

```
Usuario propone tema (+ imagen adjunta en el chat)
        ↓
Redactar borrador (titulo, excerpt, bodyHtml, SEO)
        ↓
Guardar portada en static/imagenes/<slug>-cover.png
        ↓
Copiar sanity/seed-landing-support-article-TEMPLATE.ts
        como sanity/seed-landing-support-article-<slug>.ts
        ↓
Rellenar campos EDITAR (SLUG, TITLE, EXCERPT, BODY_HTML, ...)
        ↓
pnpm exec sanity exec sanity/seed-landing-support-article-<slug>.ts --with-user-token
        ↓
git add static/imagenes/<slug>-cover.png sanity/seed-landing-support-article-<slug>.ts
git commit && git push
        ↓
Opcional: showOnBlog + featuredOrder en Studio
        ↓
Verificar en /blog/<slug> tras el deploy
```

### Qué va a git vs solo Sanity

| Cambio | ¿Commit + push? |
|--------|------------------|
| Textos y campos en `landingSupportArticle` | **No** (ya en la nube) |
| PNG de portada en `static/imagenes/` | **Sí** |
| Scripts `sanity/seed-landing-support-article-*.ts` | **Sí** (recomendado) |
| `showOnBlog` / `featuredOrder` en Studio | **No** |

---

## Redacción del artículo

### Campos mínimos

| Campo | Tipo | Notas |
|-------|------|-------|
| `title` | string | 20–90 chars. Claro y específico. |
| `slug` | slug | kebab-case, sin tildes, sin mayúsculas. |
| `categoryLabel` | string | Texto corto que aparece como "eyebrow" (ej. `Guia tecnica`, `Producto`, `Opinion`). |
| `excerpt` | text | 80–220 chars. Lo que ve el lector antes de abrir el artículo. |
| `publishedAt` | datetime | ISO 8601. |
| `readingMinutes` | number | 1–30. Calcúlalo: ~200 palabras por minuto + redondeo. |
| `coverImageSrc` | string | Ruta `/imagenes/<slug>-cover.png` o URL externa. |
| `coverImageAlt` | string | Describe la imagen para lectores de pantalla. |
| `bodyHtml` | text | HTML simple. Mínimo 300 chars. |
| `seoTitle` | string (opcional) | Max 70. Si vacío → `title`. |
| `seoDescription` | text (opcional) | Max 170. Si vacío → `excerpt`. |
| `showOnBlog` | boolean | `true` para que salga en "Guías recomendadas" en `/blog`. |
| `featuredOrder` | number (opcional) | Menor sale antes. Si vacío → orden por fecha. |

### HTML permitido en `bodyHtml`

Solo HTML simple. **No** uses Portable Text, Markdown ni shortcodes.

```html
<p>...</p>
<h2>...</h2>
<h3>...</h3>
<ul><li>...</li></ul>
<ol><li>...</li></ol>
<strong>...</strong> <em>...</em>
<a href="..." rel="noopener noreferrer">...</a>
<blockquote>...</blockquote>
<pre><code>...</code></pre>
<img src="/imagenes/..." alt="..." />
```

Estilos aplicados automáticamente (mira [src/routes/blog/[slug]/+page.svelte](../src/routes/blog/[slug]/+page.svelte) para la verdad, sobre todo los selectores `.prose :global(...)`):

- `h2` y `h3` con jerarquía clara y `text-wrap: balance`.
- `blockquote` con borde azul, fondo claro y tipografía grande.
- `pre` con fondo oscuro y scroll horizontal.
- `img` con border-radius y sombra suave, clickables para lightbox.

### Tono y estructura

- **Tono:** honesto y directo, primera persona. Como los case studies. Sin marketing speak.
- **Estructura recomendada:** intro (1-2 párrafos) → 2-4 secciones con `<h2>` → cierre breve.
- **Bloque de código** solo si aporta (no pegues 80 líneas de config para decir "así se hace").
- **Llamadas a la acción** solo si son naturales ("si te interesa, mira el case study de X"). No fuerces CTA de venta.
- **Longitud objetivo:** 600-1500 palabras. Menos de 300 falla validación; más de 2000 suele perder al lector.

### Imágenes dentro del body

Si necesitas una imagen a mitad de artículo:

- Guárdala en `static/imagenes/<slug>-fig-1.png` (mismo flujo que la portada).
- Referénciala con `<img src="/imagenes/<slug>-fig-1.png" alt="..." />`.
- Commit + push de la imagen igual que la portada.

La página tiene lightbox automático al hacer click en cualquier `<img>` del body.

---

## Imágenes: reglas

### Una sola portada (obligatoria)

A diferencia de los case studies, el blog tiene **una sola imagen de portada** por artículo. La ruta va en `coverImageSrc`.

Recomendaciones:

- **Formato:** PNG o JPG optimizado.
- **Proporción:** apaisada, 16:9 o similar (la UI la recorta a `aspect-ratio: 16/9`).
- **Tamaño:** ~1200×675 px está bien; más grande desperdicia ancho de banda.
- **Nombre:** `static/imagenes/<slug>-cover.png` (kebab-case, igual que el slug).

Si por algún motivo subes la imagen como asset Sanity en vez de ruta estática, usa el campo `image` y deja `coverImageSrc` como fallback. El front prioriza el asset Sanity (ver `fetch-landing-support-article.ts`).

### Cómo recibo la imagen del usuario

El usuario puede adjuntar la imagen en el chat. Pasos:

1. Guarda el adjunto en `static/imagenes/<slug>-cover.png`.
2. Verifica con `stat -c '%s' static/imagenes/<slug>-cover.png` que el archivo no esté vacío.
3. Si el usuario no te da imagen, pregúntale: ¿quiere imagen de stock, IA, captura propia, o lo publicas sin portada?
4. Nunca inventes una URL de imagen externa sin confirmar.

### Errores que ya vimos (no repetir)

1. **Olvidar push** — el artículo sale sin portada hasta que Vercel despliega `static/`.
2. **Slug con tildes o mayúsculas** — falla en el GROQ porque normalizamos con `toLowerCase()`. Siempre kebab-case ASCII.
3. **Body HTML demasiado corto** — la validación pide 300 chars mínimo. Si llegas corto, amplía o parte en dos artículos.
4. **Asignar `featuredOrder` sin querer** — si lo dejas numérico, sale primero que los demás en "Guías recomendadas". Usa `null` o no lo pongas si no quieres destacarlo.
5. **Título de más de 90 chars** — falla la validación de Sanity. Acórtalo.

---

## Portada del blog ("Guías recomendadas")

En `/blog` hay un bloque de "Guías recomendadas" arriba del todo (antes del listado cronológico). Para que un artículo salga ahí:

```ts
showOnBlog: true,
featuredOrder: 1, // opcional: menor sale antes
```

Recomendación: **no** más de 3-4 artículos marcados como `showOnBlog: true` a la vez. Si acumulas demasiados, deja los más recientes/archive los viejos a `false`.

El orden por defecto (sin `featuredOrder`) es por fecha de publicación descendente.

---

## Artículos ya cargados en esta línea de trabajo

> Esta tabla se actualiza a medida que se publican artículos. El listado vivo está en Sanity Studio → menú **Guías / Artículos**.

| Título | Slug | Portada | Seed |
|--------|------|---------|------|
| — | — | — | — |

---

## Diferencias clave con los case studies

| Aspecto | Case study | Artículo de blog |
|---------|-----------|-----------------|
| Schema | `caseStudy` (i18n ES+EN) | `landingSupportArticle` (solo ES por ahora) |
| Imágenes | 3 (cover 16:9, principal, secundarias) | 1 (cover 16:9) |
| Body | Bloques estructurados | HTML simple en `bodyHtml` |
| Destacado | `showOnHome` + `homeLayoutTier` | `showOnBlog` + `featuredOrder` |
| Orden en home | `orderRank` (drag & drop en Studio) | No aplica (no sale en home de portfolio) |
| Validación body | Sin mínimo explícito | `bodyHtml` ≥ 300 chars |
| Listado scripts | `seed-case-study-*.ts` | `seed-landing-support-article-*.ts` |

---

## Archivos clave del código

| Archivo | Rol |
|---------|-----|
| `sanity/schemaTypes/landingSupportArticle.ts` | Esquema CMS |
| `sanity/deskStructure.ts` | Menú en Studio (ítem **Guías / Artículos**) |
| `sanity/seed-landing-support-article-TEMPLATE.ts` | Plantilla a copiar |
| `src/lib/server/sanity/groq-landing-support-article.ts` | GROQ por slug |
| `src/lib/server/sanity/groq-landing-support-articles.ts` | GROQ listado |
| `src/lib/server/fetch-landing-support-article.ts` | Fetch 1 artículo |
| `src/lib/server/fetch-landing-support-articles.ts` | Fetch listado |
| `src/lib/types/landing-support-article.ts` | Tipo TS compartido |
| `src/routes/blog/+page.svelte` | Listado del blog |
| `src/routes/blog/[slug]/+page.svelte` | Página del artículo (SEO, JSON-LD, share, lightbox) |

---

## Checklist rápido para el próximo agente

- [ ] Leí esta guía, la de case studies y `sanity/README.md`
- [ ] `sanity login` OK (`check-auth.ts`)
- [ ] Imagen de portada en `static/imagenes/<slug>-cover.png` (no vacía, 16:9)
- [ ] Slug en kebab-case ASCII, sin tildes
- [ ] `bodyHtml` con HTML válido, ≥ 300 chars
- [ ] `coverImageAlt` descriptivo (a11y)
- [ ] `seoTitle` ≤ 70 chars y `seoDescription` ≤ 170 chars
- [ ] `readable.ts` check: el archivo se llama `seed-landing-support-article-<slug>.ts` y NO es la plantilla
- [ ] Seed ejecutado con `--with-user-token`
- [ ] Imagen y script en git + push
- [ ] Verificado en `/blog/<slug>` tras deploy Vercel
- [ ] Si va a "Guías recomendadas": `showOnBlog: true` + `featuredOrder` opcional

---

## Preguntas al usuario (si falta info)

1. **¿Tema y público?** (qué quieres explicar, a quién le hablas).
2. **¿Imagen de portada?** ¿adjunta en el chat, IA, captura, o lo publicas sin ella?
3. **¿Sale en "Guías recomendadas" en /blog?** (sí/no; si sí, `featuredOrder`).
4. **¿Longitud objetivo?** Si no me dices nada, voy a 800-1200 palabras.
5. **¿Llamadas a la acción o cierre con CTA?** Por defecto redacto cierre suave, sin vender nada.

Con tema + imagen suele bastar para arrancar.
