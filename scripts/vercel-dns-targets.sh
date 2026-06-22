#!/usr/bin/env zsh
# Tabla DNS correcta: CNAME por proyecto (mismo patrón que admin/soporte/novakit).
set -euo pipefail
TEAM=moisesvs84-6837s-projects
AUTH="$HOME/.local/share/com.vercel.cli/auth.json"
TOKEN=$(python3 -c "import json; print(json.load(open('$AUTH'))['token'])")

printf "%-35s %-45s %s\n" "SUBDOMINIO" "TIPO" "DESTINO"
printf "%s\n" "--------------------------------------------------------------------------------"

domains=(
	analyzer.moisesvalero.es
	agentcheck.moisesvalero.es
	scanit.moisesvalero.es
	cv.moisesvalero.es
	win95.moisesvalero.es
	devdays.moisesvalero.es
	prime.moisesvalero.es
	recepcionista.moisesvalero.es
)

for d in $domains; do
	json=$(curl -sS "https://api.vercel.com/v6/domains/$d/config?teamId=team_Pw8g0iScxZ56Qd6XWiEIlfOk" \
		-H "Authorization: Bearer $TOKEN")
	python3 -c "
import json,sys
d=json.loads(sys.argv[1])
label=sys.argv[2].split('.',1)[0]
cname=None
for block in d.get('recommendedCNAME') or []:
    val=block.get('value')
    if isinstance(val, list) and val:
        cname=''.join(val) if all(len(x)==1 for x in val) else val[0]
    elif isinstance(val, str):
        cname=val
    break
if not cname:
    for block in d.get('recommendedCNAME') or []:
        parts=block.get('value') or []
        if parts:
            cname=''.join(parts) if isinstance(parts[0], str) and len(parts[0])==1 else parts[0]
            break
print(f'{label:35} CNAME {cname}')
" "$json" "$d"
done

echo ""
echo "Referencia (ya funcionan así):"
echo "admin.moisesvalero.es      CNAME 4185446a003c7a82.vercel-dns-017.com"
echo "soporte.moisesvalero.es    CNAME b407c27c2346d2a1.vercel-dns-017.com"
