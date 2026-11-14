#!/usr/bin/env bash
# Rotate the production EARTHDATA_TOKEN without ever printing it.
#
# Renews the current token via Earthdata Login (/api/users/renew_token), then
# updates the macOS Keychain, the local .env and the Render service, redeploys
# and checks GES DISC access. Owner of the Render account only (macOS).
#
# Keychain items (service names):
#   earthdata-token   current Earthdata user token
#   render-api-key    Render API key
#
# Usage: scripts/rotate-earthdata-token.sh [--no-render]
set -euo pipefail

RENDER_SERVICE_ID="${RENDER_SERVICE_ID:-srv-dbsc3o0ae00c73d5lve0}"
PROBE_URL="https://data.gesdisc.earthdata.nasa.gov/data/GPM_L3/GPM_3IMERGM.07/2025/3B-MO.MS.MRG.3IMERG.20250901-S000000-E235959.09.V07B.HDF5"
UPDATE_RENDER=1
[[ "${1:-}" == "--no-render" ]] && UPDATE_RENDER=0

die() { echo "error: $*" >&2; exit 1; }
for cmd in security curl jq awk; do command -v "$cmd" >/dev/null || die "missing $cmd"; done

repo_root="$(git rev-parse --show-toplevel)"
old_token="$(security find-generic-password -s earthdata-token -w)" || die "no earthdata-token in Keychain"

echo "1/5 Renewing token with Earthdata Login..."
response="$(curl -sS -X POST https://urs.earthdata.nasa.gov/api/users/renew_token \
  -H "Authorization: Bearer ${old_token}")"
new_token="$(jq -r '.access_token // empty' <<<"$response")"
[[ -n "$new_token" ]] || die "renew failed: $(jq -c '{error, error_description}' <<<"$response")"
expires="$(jq -r '.expiration_date' <<<"$response")"

echo "2/5 Checking GES DISC access..."
status="$(curl -sS -o /dev/null -L -r 0-0 -w '%{http_code}' -H "Authorization: Bearer ${new_token}" "$PROBE_URL")"
[[ "$status" == "200" || "$status" == "206" ]] || die "GES DISC returned $status with the new token; Keychain unchanged"

echo "3/5 Saving to Keychain..."
security add-generic-password -a "$USER" -s earthdata-token -U -w "$new_token"

echo "4/5 Updating .env..."
env_file="${repo_root}/.env"
[[ -f "$env_file" ]] || cp "${repo_root}/.env.example" "$env_file"
TOK="$new_token" awk 'BEGIN { t = ENVIRON["TOK"]; done = 0 }
  /^EARTHDATA_TOKEN=/ { print "EARTHDATA_TOKEN=" t; done = 1; next }
  { print }
  END { if (!done) print "EARTHDATA_TOKEN=" t }' "$env_file" > "${env_file}.tmp"
mv "${env_file}.tmp" "$env_file"
chmod 600 "$env_file"

if [[ "$UPDATE_RENDER" == "1" ]]; then
  echo "5/5 Updating Render and redeploying..."
  render_key="$(security find-generic-password -s render-api-key -w)" || die "no render-api-key in Keychain"
  jq -n --arg v "$new_token" '{value: $v}' | curl -sS -f -o /dev/null -X PUT \
    "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars/EARTHDATA_TOKEN" \
    -H "Authorization: Bearer ${render_key}" -H "Content-Type: application/json" -d @- \
    || die "Render env update failed; Keychain and .env already hold the new token"
  deploy_id="$(curl -sS -f -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
    -H "Authorization: Bearer ${render_key}" -H "Content-Type: application/json" -d '{}' | jq -r .id)"
  echo "    deploy ${deploy_id} started"
else
  echo "5/5 Skipped Render (--no-render)"
fi

echo "Done. New token expires ${expires}. The previous token is no longer valid."
