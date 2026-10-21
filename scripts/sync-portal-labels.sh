#!/bin/bash
# Copies the words the portal shows from one commit of OpenViCloud/titan-cloud-console into portal-labels/:
# portal/src/i18n/{en,vi}.ts and portal/src/lib/*State.ts, and records that commit in portal-labels/SOURCE.
# The site's label check reads the copy (site/src/scripts/labels.test.js); CI never fetches the portal.
# With --check, nothing is written: the copy is compared with that commit, and the script exits 1 when they differ.
# A release runs --check with the titan-cloud-console commit it ships.
# Usage: scripts/sync-portal-labels.sh [--check] <titan-cloud-console commit, tag or branch>
set -euo pipefail
check=false
if [ "${1:-}" = "--check" ]; then
  check=true
  shift
fi
ref=${1:?usage: scripts/sync-portal-labels.sh [--check] <titan-cloud-console commit, tag or branch>}
cd "$(dirname "$0")/.."
repo=OpenViCloud/titan-cloud-console
sha=$(gh api "repos/$repo/commits/$ref" --jq .sha)

fetched=$(mktemp -d)
trap 'rm -rf "$fetched"' EXIT
mkdir -p "$fetched/i18n" "$fetched/lib"
fetch() {
  gh api "repos/$repo/contents/portal/src/$1?ref=$sha" -H "Accept: application/vnd.github.raw" > "$fetched/$1"
}
fetch i18n/en.ts
fetch i18n/vi.ts
states=$(gh api "repos/$repo/contents/portal/src/lib?ref=$sha" --jq '.[] | select(.name | endswith("State.ts")) | .name')
if [ -z "$states" ]; then
  echo "no portal/src/lib/*State.ts at $repo@$sha: the portal moved its state words, so the copy cannot be trusted" >&2
  exit 2
fi
while IFS= read -r name; do
  fetch "lib/$name"
done <<< "$states"

if [ "$check" = true ]; then
  if diff -r portal-labels/i18n "$fetched/i18n" && diff -r portal-labels/lib "$fetched/lib"; then
    echo "LABELS_CHECK=MATCH portal-labels/ matches $repo@$sha"
  else
    echo "LABELS_CHECK=DIFFER portal-labels/ (from $(cat portal-labels/SOURCE)) differs from $repo@$sha: run scripts/sync-portal-labels.sh $sha, fix the docs, open a pull request"
    exit 1
  fi
else
  rm -rf portal-labels/i18n portal-labels/lib
  mkdir -p portal-labels
  cp -R "$fetched/i18n" "$fetched/lib" portal-labels/
  echo "$sha" > portal-labels/SOURCE
  echo "portal-labels/ synced from $repo@$sha; mention it in the pull request"
fi
