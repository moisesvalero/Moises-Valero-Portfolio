# Guía para agentes — Case studies y portada

Documento de **continuidad**: si cambias de agente, IDE o herramienta, lee esto antes de tocar proyectos en Sanity o la home del portfolio.

**Índice técnico de scripts:** [sanity/README.md](../sanity/README.md)

---

## Qué estamos haciendo

El usuario va pasando **repos de GitHub** de proyectos personales. El agente debe:

1. Leer README y capturas del repo.
2. Redactar el **case study** completo (ES + EN) y subirlo a **Sanity** (`caseStudy`).
3. Dejar imágenes en `static/imagenes/` y **commit + push** (Vercel despliega assets).
4. Opcional: activar en **portada** (`showOnHome`, tier `hero` / `spotlight`).
5. El usuario revisa en `https://moisesvalero.es/proyectos/<slug>`.

No hace falta crear rutas Svelte nuevas: `/proyectos/[slug]` ya lee Sanity por GROQ.

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

Capturas con Playwright (si hace falta):

```bash
pnpm dlx playwright@1.60.0 install chromium   # una vez en WSL
node scripts/capture-<proyecto>.mjs
```

---

## Flujo paso a paso (nuevo proyecto)

```
Usuario pasa URL GitHub (+ ¿en portada?)
        ↓
Leer README, homepage del repo, imágenes en public/docs
        ↓
Crear sanity/seed-case-study-<slug>.ts (copiar plantilla existente)
        ↓
Imágenes → static/imagenes/ (descarga repo o Playwright en liveUrl correcta)
        ↓
pnpm exec sanity exec sanity/seed-case-study-<slug>.ts --with-user-token
        ↓
git add static/imagenes/* sanity/seed-case-study-<slug>.ts
git commit && git push
        ↓
Si portada: patch-home-featured-projects.ts o Studio (ver abajo)
```

### Qué va a git vs solo Sanity

| Cambio | ¿Commit + push? |
|--------|------------------|
| Textos y campos en `caseStudy` | **No** (ya en la nube) |
| PNG en `static/imagenes/` | **Sí** |
| Scripts `sanity/seed-*.ts` | **Sí** (recomendado) |
| `showOnHome` / tiers / `orderRank` en Studio | **No** |

---

## Imágenes: reglas importantes

### Tres usos distintos

| Campo | Dónde se ve | Formato recomendado |
|-------|-------------|---------------------|
| `images.principal` | Página `/proyectos/[slug]` (mockup principal) | La mejor del producto |
| `images.secondary1/2` | Case study (secundarias) | Detalle, móvil, informe… |
| `images.cardImagePath` | **Portada** y tarjetas en `/proyectos` | **16:9 horizontal** |

Si `cardImagePath` está vacío, la portada usa `images.principal` → suele verse mal si la principal es vertical (terminal, móvil, etc.).

### Scripts de captura existentes

| Script | URL correcta | Notas |
|--------|--------------|-------|
| `scripts/capture-web-analyzer-screenshots.mjs` | `https://web-analyzer-three.vercel.app` | **No** usar `moisesvalero.es/tools/analizador-web` (es otra UI integrada en el portfolio) |
| `scripts/capture-agentchecker-card.mjs` | `https://agentcheck-rho.vercel.app` | Card 16:9 para portada; case study sigue con `agentchecker-screen.png` |

### Errores que ya cometimos (no repetir)

1. **Capturas del producto equivocado** — Web Analyzer del repo ≠ analizador embebido en el portfolio.
2. **Imagen vertical en portada** — `agentchecker-screen.png` (1280×1555) se veía mini; solución: `cardImagePath` → `agentchecker-card.png` (16:9).
3. **Tres PNG idénticos** — validar con `stat -c '%n %s' static/imagenes/...` que los bytes difieren.
4. **Olvidar push** — el case study se ve sin imágenes hasta que Vercel despliega `static/`.

---

## Portada (4 proyectos)

- Límite fijo en código: **4** (`PortfolioProjects.svelte` → `homeProjectCap = 4`).
- Layout: **1 hero** + **3 spotlight**.
- Orden en web: campo **`orderRank`** (lista ordenable en Sanity Studio → menú **Proyectos**).
- Quién sale: `showOnHome: true` + `homeLayoutTier` (`hero` | `spotlight` | `standard`).

### Selección acordada (marzo 2026)

| Orden (orderRank) | Slug | Tier |
|-------------------|------|------|
| 1 | `fisionova` | `hero` |
| 2 | `rebranding-galeria-nova` | `spotlight` |
| 3 | `agentchecker` | `spotlight` |
| 4 | `sideglass-dashboard` | `spotlight` |

Aplicar visibilidad y tiers (no el orden drag):

```bash
pnpm exec sanity exec sanity/patch-home-featured-projects.ts --with-user-token
```

Reordenar en Studio arrastrando en **Proyectos**, o con **Reset order** si hace falta.

---

## Proyectos ya cargados en esta línea de trabajo

| Título | Slug | Repo | Live / demo | Portada | Seed |
|--------|------|------|-------------|---------|------|
| Next Agent Template | `next-agent-template` | [repo](https://github.com/moisesvalero/next-agent-template) | [demo](https://next-agent-template.vercel.app) | No | `seed-case-study-next-agent-template.ts` |
| Sideglass | `sideglass-dashboard` | [repo](https://github.com/moisesvalero/sideglass-dashboard) | [sideglass.moisesvalero.es](https://sideglass.moisesvalero.es) | Sí (spotlight) | `seed-case-study-sideglass-dashboard.ts` |
| agentchecker | `agentchecker` | [repo](https://github.com/moisesvalero/agentchecker) | [agentcheck-rho.vercel.app](https://agentcheck-rho.vercel.app) | Sí (spotlight) | `seed-case-study-agentchecker.ts` |
| Web Analyzer | `web-analyzer` | [repo](https://github.com/moisesvalero/web-analyzer) | [web-analyzer-three.vercel.app](https://web-analyzer-three.vercel.app) | No | `seed-case-study-web-analyzer.ts` |

**Sideglass portada:** `images.cardImagePath` = `/imagenes/sideglass-landscape-dark.png`  
**agentchecker portada:** `images.cardImagePath` = `/imagenes/agentchecker-card.png`

---

## Redacción de case studies

- Campos ES obligatorios; EN en `*En` (`titleEn`, `heroDescriptionEn`, `retoEn`, …).
- Proyectos **personales** — tono honesto; métricas creíbles o cualitativas si el usuario lo pide.
- `repoUrl` + `liveUrl` del **repo desplegado**, no confundir con variantes integradas en el portfolio.
- Bloques: `reto`, `hice`, `resultado`, 4 `metrics`, `stack`, `tags`, `seoDescription`.
- `checklistPublicacion` todo a `true` al publicar.

Plantilla de referencia: `sanity/seed-case-study-sideglass-dashboard.ts`.

---

## Archivos clave del código

| Archivo | Rol |
|---------|-----|
| `sanity/schemaTypes/caseStudy.ts` | Esquema CMS |
| `src/lib/server/sanity/groq-site-portfolio.ts` | Proyectos en home (`orderRank`, `cardImagePath`) |
| `src/lib/server/sanity/groq.ts` | Case study por slug |
| `src/lib/components/portfolio/PortfolioProjects.svelte` | UI portada (hero + spotlight) |
| `src/routes/proyectos/[slug]/` | Página case study dinámica |

---

## Checklist rápido para el próximo agente

- [ ] Leí esta guía y `sanity/README.md`
- [ ] `sanity login` OK (`check-auth.ts`)
- [ ] `liveUrl` apunta al deploy del **repo**, no a una copia en el portfolio
- [ ] `cardImagePath` en 16:9 si va a portada
- [ ] Seed ejecutado con `--with-user-token`
- [ ] Imágenes en git + push
- [ ] Verificado en `/proyectos/<slug>` tras deploy Vercel
- [ ] Si portada: `showOnHome` + tier + orden en Studio

---

## Preguntas al usuario (si falta info)

1. ¿URL GitHub?
2. ¿En portada? (sí/no; si sí, hero o spotlight)
3. ¿Algo que el README no deje claro (rol, año, cliente vs personal)?

Con el enlace de GitHub suele bastar para arrancar.
