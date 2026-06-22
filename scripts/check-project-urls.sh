#!/usr/bin/env zsh
urls=(
  https://analyzer.moisesvalero.es
  https://agentcheck.moisesvalero.es
  https://scanit.moisesvalero.es
  https://cv.moisesvalero.es
  https://win95.moisesvalero.es
  https://devdays.moisesvalero.es
  https://prime.moisesvalero.es
  https://recepcionista.moisesvalero.es
  https://novakit.moisesvalero.es
  https://admin.moisesvalero.es
  https://soporte.moisesvalero.es
  https://sideglass.moisesvalero.es
  https://ember.moisesvalero.es
  https://v-shield.moisesvalero.es
  https://scanit-rho.vercel.app
  https://web-analyzer-three.vercel.app
)
for u in $urls; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-time 20 "$u" || echo ERR)
  echo "$code $u"
done
