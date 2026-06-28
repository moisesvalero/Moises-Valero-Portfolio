# AGENTS.md — Portfolio Moisés Valero

Instrucciones para **agentes de IA** que trabajen en este repo (Cursor, Claude Code, Copilot, etc.).

## Lee primero

1. **[docs/GUIA-AGENTES-CASE-STUDIES.md](docs/GUIA-AGENTES-CASE-STUDIES.md)** — flujo completo: repos GitHub → Sanity → imágenes → portada. **Documento principal de continuidad.**
2. **[sanity/README.md](sanity/README.md)** — inventario de scripts `seed-*` / `patch-*` y comandos CLI.

## Contexto en una frase

Portfolio SvelteKit + Sanity; el usuario añade **case studies** desde repos GitHub; tú redactas, subes a Sanity, capturas imágenes y haces commit de `static/imagenes/`.

## Comandos que usarás a menudo

```bash
# WSL, raíz del repo
pnpm exec sanity login
pnpm exec sanity exec sanity/check-auth.ts --with-user-token
pnpm exec sanity exec sanity/seed-case-study-<slug>.ts --with-user-token
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

## Mantenimiento periódico (seguridad)

Cada cierto tiempo (o si el usuario se queja de vulnerabilidades al pushear), ejecuta:

```bash
pnpm audit --audit-level=high
```

Si hay **high** en dependencias **directas** → `pnpm update <pkg>`.

Si hay **high** en dependencias **transitivas** (dentro de vercel, sanity, etc.) → añade overrides en `pnpm-workspace.yaml` solo si es seguro (mismo major version). Ejemplo:

```yaml
overrides:
  minimatch: 10.2.4
```

Luego `pnpm install && pnpm run check && pnpm test`. Si pasa todo, commit + push con mensaje `chore: bump deps and override transitive vulns`.
