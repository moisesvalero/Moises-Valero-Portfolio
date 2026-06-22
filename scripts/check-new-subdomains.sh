#!/usr/bin/env zsh
hosts=(analyzer agentcheck scanit cv win95 devdays prime recepcionista)
for h in $hosts; do
  http=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "http://${h}.moisesvalero.es" 2>/dev/null || echo ERR)
  https=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "https://${h}.moisesvalero.es" 2>/dev/null || echo ERR)
  echo "${h}.moisesvalero.es  http=${http}  https=${https}"
done
