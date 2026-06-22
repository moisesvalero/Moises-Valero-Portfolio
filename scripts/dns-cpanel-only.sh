#!/usr/bin/env zsh
set -euo pipefail
ROOT="$(cd "$(dirname "${(%):-%x}")/.." && pwd)"
source <(tr -d '\r' < "$ROOT/.env.dns")
CPANEL_BASE="https://${CPANEL_HOST}:2083"
# Vercel pide A para subdominios con DNS en ginernet (no nameservers Vercel)
VERCEL_A="${VERCEL_A:-76.76.21.21}"
LABELS=(analyzer agentcheck scanit cv win95 devdays prime recepcionista)
for label in $LABELS; do
	fqdn="${label}.${DNS_ZONE}"
	echo "==== $fqdn A -> $VERCEL_A ===="
	resp=$(curl -sS -k \
		-H "Authorization: cpanel ${CPANEL_USER}:${CPANEL_TOKEN}" \
		-H "Accept: application/json" \
		"${CPANEL_BASE}/execute/DNS/add_zone_record?domain=${DNS_ZONE}&name=${label}&type=A&address=${VERCEL_A}&ttl=14400")
	echo "$resp"
done
