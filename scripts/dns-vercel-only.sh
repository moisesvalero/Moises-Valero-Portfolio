#!/usr/bin/env zsh
set -euo pipefail
TEAM=moisesvs84-6837s-projects
typeset -A PROJECTS=(
	[analyzer.moisesvalero.es]=web-analyzer
	[agentcheck.moisesvalero.es]=agentchecker
	[scanit.moisesvalero.es]=scanit
	[cv.moisesvalero.es]=cv-generator
	[win95.moisesvalero.es]=win95-gpt
	[devdays.moisesvalero.es]=dev-days
	[prime.moisesvalero.es]=prime-haus
	[recepcionista.moisesvalero.es]=proyecto-ia-recepcionista
)
for domain project in ${(kv)PROJECTS}; do
	echo "==== $domain -> $project ===="
	pnpm dlx vercel@latest domains add "$domain" "$project" --scope "$TEAM" 2>&1 || true
	echo
done
