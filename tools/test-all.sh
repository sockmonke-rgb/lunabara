#!/usr/bin/env bash
# Runs every headless check against a build (default: index.html). Exits non-zero if anything fails.
# Usage: tools/test-all.sh [build.html]
cd "$(dirname "$0")/.."
BUILD="${1:-index.html}"
fail=0

echo "=== parse"
node -e "const h=require('fs').readFileSync(process.argv[1],'utf8');const s=h.split('<script>').map(x=>x.split('</script>')[0]).find(x=>x.includes('const BUILD='));if(!s){console.log('FAIL: game script not found');process.exit(1)}try{new Function(s);console.log('PASS: script parses')}catch(e){console.log('FAIL: '+e.message);process.exit(1)}" "$BUILD" || fail=1

for t in smoke restore reset assist collide errlog props; do
  echo "=== $t"
  out=$(node "tools/$t.js" "$BUILD" 2>&1); code=$?
  echo "$out" | grep -E 'PASS|FAIL|errors:'
  if [ $code -ne 0 ] || echo "$out" | grep -q 'FAIL'; then fail=1; fi
done

for s in 7 11 23 99 314; do
  echo "=== navsim seed $s"
  out=$(node tools/navsim.js $s); echo "$out"
  echo "$out" | grep -q 'unfinished trips over 45s: 0' || fail=1
  echo "$out" | grep -qE 'max overlap into a building 0\.00 greenhouse wall crossings 0 habitat dome crossings 0 pad crossings 0 wallow side crossings 0 bathhouse wall crossings 0' || fail=1
done

echo
if [ $fail -eq 0 ]; then echo "ALL PASS"; else echo "SOMETHING FAILED"; fi
exit $fail
