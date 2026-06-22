#!/usr/bin/env python3
import json
import urllib.request

TOKEN = open("/home/moi6/.local/share/com.vercel.cli/auth.json").read()
TOKEN = json.loads(TOKEN)["token"]
TEAM = "team_Pw8g0iScxZ56Qd6XWiEIlfOk"
TARGETS = [
    "analyzer.moisesvalero.es",
    "agentcheck.moisesvalero.es",
    "scanit.moisesvalero.es",
    "cv.moisesvalero.es",
    "win95.moisesvalero.es",
    "devdays.moisesvalero.es",
    "prime.moisesvalero.es",
    "recepcionista.moisesvalero.es",
]

def api(url):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

projects = api(f"https://api.vercel.com/v9/projects?teamId={TEAM}&limit=100")["projects"]
index = {}
for p in projects:
    doms = api(f"https://api.vercel.com/v9/projects/{p['id']}/domains?teamId={TEAM}").get("domains", [])
    for d in doms:
        index[d["name"]] = {
            "project": p["name"],
            "verified": d.get("verified"),
            "misconfigured": d.get("misconfigured"),
        }

for t in TARGETS:
    info = index.get(t)
    if info:
        print(f"{t:35} -> {info['project']:30} verified={info['verified']} misconfigured={info['misconfigured']}")
    else:
        print(f"{t:35} -> NOT ON ANY PROJECT")
