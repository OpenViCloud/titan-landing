#!/bin/bash
# Copies README.md of the five public repositories the assistant knows into knowledge/readmes/<repo>.md, from the head
# of each one's main, and records each commit in knowledge/SOURCE. The image ships the copy; nothing is fetched at run
# time. Rules: titan-ops features/public-site/design.md#chat-assistant.
# With --check, nothing is written: the copy is compared with the head of each main, and the script exits 1 when a
# README changed since the copy. Exit 1 means only that a copy differs; any failure to read a repository (gh failed,
# no README) exits 2.
# Usage: scripts/sync-readmes.sh [--check]
set -euo pipefail
check=false
if [ "${1:-}" = "--check" ]; then
  check=true
  shift
fi
cd "$(dirname "$0")/.."
repos=(titan-cli terraform-provider-openvicloud titan-control-plane titan-incus-worker titan-cloud-console)

fetched=$(mktemp -d)
trap 'rm -rf "$fetched"' EXIT
mkdir -p "$fetched/readmes"
: > "$fetched/SOURCE"
for repo in "${repos[@]}"; do
  sha=$(gh api "repos/OpenViCloud/$repo/commits/main" --jq .sha) || { echo "cannot resolve main of OpenViCloud/$repo" >&2; exit 2; }
  gh api "repos/OpenViCloud/$repo/contents/README.md?ref=$sha" -H "Accept: application/vnd.github.raw" > "$fetched/readmes/$repo.md" ||
    { echo "no README.md in OpenViCloud/$repo@$sha" >&2; exit 2; }
  echo "$repo $sha" >> "$fetched/SOURCE"
done

if [ "$check" = true ]; then
  if diff -r knowledge/readmes "$fetched/readmes"; then
    echo "READMES_CHECK=MATCH knowledge/readmes/ matches the head of main of every repository"
  else
    echo "READMES_CHECK=DIFFER knowledge/readmes/ (from knowledge/SOURCE) differs: run scripts/sync-readmes.sh, open a pull request"
    exit 1
  fi
else
  rm -rf knowledge/readmes
  mkdir -p knowledge
  cp -R "$fetched/readmes" knowledge/readmes
  cp "$fetched/SOURCE" knowledge/SOURCE
  echo "knowledge/readmes/ synced; knowledge/SOURCE names each commit; mention it in the pull request"
fi
