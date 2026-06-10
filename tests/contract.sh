#!/usr/bin/env bash
set -euo pipefail

PORTS=(3001 3002 3003 3004 3005 3006 3007)
NAMES=("node-express" "python-fastapi" "ruby-rails" "java-springboot" "kotlin-springboot" "go-gin" "node-nestjs")

failures=0

assert_status() {
  local port=$1
  local method=$2
  local path=$3
  local expected=$4
  local body=${5:-}
  local tmp
  tmp=$(mktemp)

  if [[ -n "$body" ]]; then
    status=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$body" \
      "http://localhost:${port}${path}")
  else
    status=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "http://localhost:${port}${path}")
  fi

  if [[ "$status" != "$expected" ]]; then
    echo "FAIL [$port] $method $path expected $expected got $status"
    cat "$tmp"
    echo
    failures=$((failures + 1))
  else
    echo "OK   [$port] $method $path -> $expected"
  fi
  rm -f "$tmp"
}

for i in "${!PORTS[@]}"; do
  port=${PORTS[$i]}
  name=${NAMES[$i]}
  echo "=== Contract tests: $name (:$port) ==="

  assert_status "$port" GET /healthz 200
  assert_status "$port" GET /ships 200
  assert_status "$port" GET /ships/11111111-1111-1111-1111-111111111111 200
  assert_status "$port" GET /ships/00000000-0000-0000-0000-000000000001 404
  assert_status "$port" GET /ships/11111111-1111-1111-1111-111111111111/crewmates 200
  assert_status "$port" GET /ships/11111111-1111-1111-1111-111111111111/missions 200
  assert_status "$port" GET /crewmates 200
  assert_status "$port" GET /crewmates/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa 200
  assert_status "$port" GET /missions 200
  assert_status "$port" GET /missions/dddddddd-dddd-dddd-dddd-dddddddddddd 200

  assert_status "$port" POST /ships 400 '{"name":""}'
  assert_status "$port" POST /crewmates 400 '{"ship_id":"00000000-0000-0000-0000-000000000001","name":"X","role":"pilot","species":"Human","rank":1}'

  unique_registry="REG-TEST-${port}-$(date +%s)"
  assert_status "$port" POST /ships 201 "{\"name\":\"Test Ship\",\"class\":\"scout\",\"registry\":\"${unique_registry}\"}"

  echo
done

if [[ "$failures" -gt 0 ]]; then
  echo "$failures contract assertion(s) failed"
  exit 1
fi

echo "All contract tests passed across ${#PORTS[@]} backends."
