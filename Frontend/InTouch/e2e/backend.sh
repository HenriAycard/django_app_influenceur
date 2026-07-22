#!/usr/bin/env bash
# Boots the isolated E2E backend for Playwright's webServer.
#
# Creates (if missing) + migrates + seeds the dedicated `intouch_e2e` database,
# then serves it over HTTPS on 127.0.0.1:8010 using the self-signed cert already
# in the backend dir (so SECURE_SSL_REDIRECT=True is satisfied without a settings
# change). Playwright runs this with cwd=Backend/InTouch and the env vars set in
# playwright.config.ts (PG_DBNAME=intouch_e2e, CORS, ALLOWED_HOSTS).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"  # the e2e/ dir

# Best-effort create of the dedicated DB (idempotent; ignored if it exists).
env/bin/python manage.py shell <<'PY' || true
import psycopg2
from django.conf import settings
d = settings.DATABASES['default']
c = psycopg2.connect(dbname='postgres', user=d['USER'], password=d['PASSWORD'],
                     host=d['HOST'], port=d['PORT'])
c.autocommit = True
cur = c.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname='intouch_e2e'")
if not cur.fetchone():
    cur.execute("CREATE DATABASE intouch_e2e")
PY

env/bin/python manage.py migrate --no-input
env/bin/python manage.py shell < "$HERE/seed.py"
exec env/bin/python manage.py runserver_plus \
    --cert-file cert.crt --key-file cert.key 127.0.0.1:8010
