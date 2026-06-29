# AGENTS.md — Portfolio Moisés Valero

Instrucciones para **agentes de IA** que trabajen en este repo (Cursor, Claude Code, Copilot, etc.).

## Lee primero

1. **[docs/GUIA-AGENTES-CASE-STUDIES.md](docs/GUIA-AGENTES-CASE-STUDIES.md)** — flujo completo: repos GitHub → Sanity → imágenes → portada. **Documento principal de continuidad.**
2. **[docs/GUIA-AGENTES-BLOG.md](docs/GUIA-AGENTES-BLOG.md)** — flujo para artículos del blog (`/blog/[slug]`): tema + imagen → Sanity → portada recomendada.
3. **[sanity/README.md](sanity/README.md)** — inventario de scripts `seed-*` / `patch-*` y comandos CLI.

## Contexto en una frase

Portfolio SvelteKit + Sanity; el usuario añade **case studies** desde repos GitHub y **artículos de blog** con un tema e imagen adjunta; tú redactas, subes a Sanity, dejas imágenes en `static/imagenes/` y haces commit + push.

## Comandos que usarás a menudo

```bash
# WSL, raíz del repo
pnpm exec sanity login
pnpm exec sanity exec sanity/check-auth.ts --with-user-token
pnpm exec sanity exec sanity/seed-case-study-<slug>.ts --with-user-token
pnpm exec sanity exec sanity/seed-landing-support-article-<slug>.ts --with-user-token
pnpm exec sanity exec sanity/patch-home-featured-projects.ts --with-user-token
node scripts/capture-web-analyzer-screenshots.mjs   # solo Web Analyzer standalone
node scripts/capture-agentchecker-card.mjs
```

## No hagas sin confirmar

- Capturas del analizador en `moisesvalero.es/tools/...` para el case study **web-analyzer** (usar `web-analyzer-three.vercel.app`).
- `git push --force` a `main`.
- Commitear `.env` o tokens.

## Stack y convenciones

- **pnpm** en WSL · Svelte 5 runes · TypeScript estricto · oxlint · conventional commits en inglés.
- Validación proporcional: `pnpm lint`, `pnpm check`, `pnpm format:check` según el cambio.

## Portada actual (4 proyectos)

`fisionova` (hero) · `rebranding-galeria-nova` · `agentchecker` · `sideglass-dashboard` (spotlight). Detalle en la guía.
