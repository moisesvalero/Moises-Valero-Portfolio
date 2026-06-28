# Arquitectura de Vercel y Sanity

Documento de **continuidad** para agentes: explica cómo se relacionan el portfolio, el Sanity Studio y los deploys en Vercel.

---

## Visión general

Un único repo (`Moises-Valero-Portfolio`) despliega a **dos proyectos Vercel** distintos. El script `scripts/vercel-build.mjs` detecta cuál está construyendo y lanza el build correcto.

```
                 Repo GitHub (Moises-Valero-Portfolio)
                              │
                 scripts/vercel-build.mjs
                 detecta VERCEL_PROJECT_ID
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     migracion-portfolio-sveltekit    moisesvalero-admin-sanity
     (moisesvalero.es)                (admin.moisesvalero.es)
     SvelteKit → vite build            Sanity → sanity build
     Output: .svelte-kit/              Output: dist/
```

| Proyecto Vercel | URL pública | Qué es | Build |
|------------------|-------------|--------|------|
| `migracion-portfolio-sveltekit` | `moisesvalero.es` | Portfolio público (SvelteKit) | `vite build` (adapter-vercel) |
| `moisesvalero-admin-sanity` | `admin.moisesvalero.es` | Sanity Studio (CMS privado) | `pnpm exec sanity build` |

---

## Cómo funciona `scripts/vercel-build.mjs`

El `vercel.json` define `"buildCommand": "pnpm run build:vercel"` para ambos proyectos. Ese script ejecuta `scripts/vercel-build.mjs`, que decide qué construir:

```js
const ADMIN_PROJECT_ID = 'prj_uRgQPJ9hh0bdiFcwKlU7RvRjjZ4S';
const projectId = process.env.VERCEL_PROJECT_ID ?? '';

if (projectId === ADMIN_PROJECT_ID) {
    execSync('pnpm exec sanity build', { stdio: 'inherit', env: studioEnv });
} else {
    execSync('pnpm run build', { stdio: 'inherit' });
}
```

- Si `VERCEL_PROJECT_ID` coincide con el admin → construye Sanity Studio (output `dist/`).
- Si no → construye SvelteKit (output `.svelte-kit/` + adapter-vercel).

`studioEnv` inyecta `SANITY_STUDIO_PROJECT_ID` y `SANITY_STUDIO_DATASET` con fallback a `5zhz6irf` / `production`.

---

## Configuración de cada proyecto en Vercel

| Setting | Portfolio (`moisesvalero.es`) | Admin Studio (`admin.moisesvalero.es`) |
|---------|------------------------------|----------------------------------------|
| Framework | `sveltekit-1` | `sveltekit-1` (heredado, no afecta) |
| Build command | `pnpm run build:vercel` (del `vercel.json`) | `pnpm run build:vercel` (del `vercel.json`) |
| Output directory | `.svelte-kit` (adapter-vercel) | `dist` (sanity build) |
| Alias/dominio | `moisesvalero.es` | `admin.moisesvalero.es` |
| Env vars | muchas (Sanity, Resend, Analytics, etc.) | **ninguna** — los fallbacks del script cubren projectId/dataset |

---

## Sanity: Studio y datos

### Sanity Studio (`admin.moisesvalero.es`)

- Config en `sanity.config.ts` y `sanity.cli.ts`.
- `sanity.cli.ts` tiene `autoUpdates: true` con `appId: 'sf0j1droxrabn7xv2bxz1idb'`.
- Build local: `pnpm exec sanity build` → output `dist/`.
- Deploy manual: `pnpm exec sanity deploy` → sube a `sanity.studio` (alternativa, no usa Vercel).
- Acceso al Studio: `admin.moisesvalero.es` (Vercel) o `moisesvalero-portfolio.sanity.studio` (Sanity hosting).

### Datos Sanity

- Proyecto: `5zhz6irf` · dataset: `production`.
- Esquemas en `sanity/schemaTypes/` (`caseStudy`, `portfolioSite`, `landingSupportArticle`, `locale`, `analyzerLead`).
- Seeds y parches en `sanity/seed-*.ts` y `sanity/patch-*.ts` (ver `sanity/README.md`).
- El portfolio lee Sanity por GROQ (`src/lib/server/sanity/groq.ts`, `groq-site-portfolio.ts`).

---

## Errores de Vercel ya cometidos (no repetir)

1. **Sanity 5.x en local + autoUpdates runtime 5.31 en Vercel** → `Command failed: pnpm exec sanity build`. El build de Vercel del admin Studio rompía por mismatch de versión. Solución: subir a `sanity@6.2.0`. **No bajar nunca a 5.x.**
2. **Preview deployments acumulados** → Vercel crea un preview por cada push a cada rama. Si no se usan, desactivar en Vercel → Settings → Git → Preview deployments.
3. **Husky `prepare` falla en Vercel** → `. prepare: .git can't be found` es un warning esperado, no rompe el build.
4. **El admin project no tiene env vars** → Los fallbacks de `vercel-build.mjs` cubren `projectId` y `dataset`. No añadir env vars al admin a menos que se necesiten tokens nuevos.
5. **Deployar al proyecto equivocado desde CLI** → `vercel deploy` usa el proyecto linkeado en `.vercel/`. Para cambiar: `pnpm exec vercel link --project <nombre> --yes`. Volver a linkear el portfolio después.

---

## Comandos útiles

```bash
# Deploy manual del portfolio (moisesvalero.es)
pnpm exec vercel deploy --prod --yes

# Deploy manual del Sanity Studio (admin.moisesvalero.es)
pnpm exec vercel link --project moisesvalero-admin-sanity --yes
pnpm exec vercel deploy --prod --yes
pnpm exec vercel link --project migracion-portfolio-sveltekit --yes   # volver al portfolio

# Deploy del Studio a Sanity hosting (alternativa sin Vercel)
pnpm exec sanity deploy

# Build local del Studio
pnpm exec sanity build

# Listar deploys de un proyecto
pnpm exec vercel list <nombre-proyecto>
```

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `vercel.json` | Config compartida: build command, redirects, install command |
| `scripts/vercel-build.mjs` | Detecta proyecto Vercel y lanza build correcto |
| `sanity.config.ts` | Config del Studio (projectId, dataset, schema, plugins) |
| `sanity.cli.ts` | Config CLI de Sanity (projectId, dataset, autoUpdates, appId) |
| `sanity/schemaTypes/caseStudy.ts` | Esquema del case study en Sanity |
| `src/lib/server/sanity/groq.ts` | Queries GROQ del portfolio a Sanity |