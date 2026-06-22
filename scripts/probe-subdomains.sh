#!/usr/bin/env zsh
set -euo pipefail
hosts=(agentcheck scanit analyzer cv win95 devdays prime recepcionista novakit)
for h in $hosts; do
  echo "=== ${h}.moisesvalero.es ==="
  curl -sS -o /dev/null -w "https:%{http_code}\n" --max-time 15 "https://${h}.moisesvalero.es" 2>&1 || echo "https:FAIL"
  curl -sS -o /dev/null -w "http:%{http_code}\n" --max-time 15 "http://${h}.moisesvalero.es" 2>&1 || echo "http:FAIL"
done
