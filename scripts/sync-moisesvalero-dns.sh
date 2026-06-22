#!/usr/bin/env zsh
# Sincroniza subdominios moisesvalero.es: Vercel + DNS cPanel.
# Uso: cp .env.dns.example .env.dns && editar valores && pnpm run dns:sync

set -euo pipefail

ROOT="$(cd "$(dirname "${(%):-%x}")/.." && pwd)"
ENV_FILE="${DNS_ENV_FILE:-$ROOT/.env.dns}"

if [[ ! -f "$ENV_FILE" ]]; then
	echo "Falta $ENV_FILE — copia .env.dns.example y rellena credenciales." >&2
	exit 1
fi

# shellcheck disable=SC1090
source <(tr -d '\r' < "$ENV_FILE")

: "${CPANEL_HOST:?CPANEL_HOST requerido (ej. cp5.grid-dns.net)}"
: "${CPANEL_USER:?CPANEL_USER requerido}"
: "${CPANEL_TOKEN:?CPANEL_TOKEN requerido}"
: "${DNS_ZONE:=moisesvalero.es}"
: "${VERCEL_CNAME:=cname.vercel-dns.com}"
: "${VERCEL_TEAM:=moisesvs84-6837s-projects}"

CPANEL_BASE="https://${CPANEL_HOST}:2083"

cpanel_api() {
	local module="$1"
	local func="$2"
	shift 2
	local query=""
	for arg in "$@"; do
		query+="${query:+&}$(printf '%s' "$arg" | sed 's/ /%20/g')"
	done
	curl -sS -k \
		-H "Authorization: cpanel ${CPANEL_USER}:${CPANEL_TOKEN}" \
		-H "Accept: application/json" \
		"${CPANEL_BASE}/execute/${module}/${func}?${query}"
}

record_exists() {
	local host="$1"
	local type="$2"
	local target="$3"
	python3 - "$host" "$type" "$target" <<'PY'
import json, sys
host, rtype, target = sys.argv[1:4]
data = json.load(sys.stdin)
for row in data.get("data", []):
    dname = row.get("dname", "")
    if not dname.endswith(host) and dname.rstrip(".") != host.rstrip("."):
        continue
    if row.get("type") != rtype:
        continue
    rec = row.get("record") or row.get("cname") or row.get("address") or ""
    if rec.rstrip(".").lower() == target.rstrip(".").lower():
        sys.exit(0)
sys.exit(1)
PY
}

add_cname() {
	local label="$1"
	local fqdn="${label}.${DNS_ZONE}"

	if cpanel_api DNS parse_zone "zone=${DNS_ZONE}" | record_exists "$fqdn" A "$VERCEL_A"; then
		echo "DNS OK (ya existe): ${fqdn} -> ${VERCEL_A}"
		return 0
	fi

	local resp
	resp="$(cpanel_api DNS add_zone_record \
		"domain=${DNS_ZONE}" \
		"name=${label}" \
		"type=A" \
		"address=${VERCEL_A}" \
		"ttl=14400")"

	if python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('status')==1 else 1)" <<<"$resp"; then
		echo "DNS creado: ${fqdn} -> ${VERCEL_A}"
	else
		echo "Error DNS ${fqdn}: $resp" >&2
		return 1
	fi
}

add_vercel_domain() {
	local fqdn="$1"
	local project="$2"

	if pnpm dlx vercel@latest domains add "$fqdn" "$project" --scope "$VERCEL_TEAM" 2>&1; then
		:
	else
		echo "Vercel: dominio ya asignado o error (ver arriba)"
	fi
}

# subdominio:proyecto-vercel
typeset -A PROJECTS=(
	[analyzer]=web-analyzer
	[agentcheck]=agentchecker
	[scanit]=scanit
	[cv]=cv-generator
	[win95]=win95-gpt
	[devdays]=dev-days
	[prime]=prime-haus
	[recepcionista]=proyecto-ia-recepcionista
)

echo "=== Comprobando zona ${DNS_ZONE} en cPanel ==="
zone_check="$(cpanel_api DNS parse_zone "zone=${DNS_ZONE}")"
if echo "$zone_check" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('status')==1 else 1)"; then
	echo "Zona accesible."
else
	echo "$zone_check" >&2
	echo "No se pudo leer la zona DNS. Si ves Imunify360, whitelistea tu IP en cPanel." >&2
	exit 1
fi

echo ""
echo "=== Vercel + DNS (8 subdominios nuevos) ==="
for label project in ${(kv)PROJECTS}; do
	fqdn="${label}.${DNS_ZONE}"
	echo ""
	echo "--- ${fqdn} (${project}) ---"
	add_vercel_domain "$fqdn" "$project"
	add_cname "$label"
done

echo ""
echo "=== Subdominios ya configurados (solo verificación DNS) ==="
for label in admin soporte sideglass novakit www; do
	fqdn="${label}.${DNS_ZONE}"
	if [[ "$label" == "www" ]]; then
		fqdn="www.${DNS_ZONE}"
	fi
	if cpanel_api DNS parse_zone "zone=${DNS_ZONE}" | record_exists "$fqdn" CNAME "$VERCEL_CNAME"; then
		echo "DNS OK: ${fqdn}"
	else
		echo "DNS FALTA o distinto: ${fqdn} (revisar manualmente en Zone Editor)"
	fi
done

echo ""
echo "Listo. La propagación DNS puede tardar unos minutos."
