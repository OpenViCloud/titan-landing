#!/bin/bash
# Copies README.md of the five public repositories the assistant knows into knowledge/readmes/<repo>.md and records
# each commit in knowledge/SOURCE. A repository is read at the head of its main, or at the commit an argument
# <repo>=<40 hex> names: a release checks the README of the commit it ships. The image ships the copy; nothing is
# fetched at run time. Rules: titan-ops features/public-site/design.md#chat-assistant.
# With --check, nothing is written: the copy is compared with the same commits, and the script exits 1 when a README
# differs from the copy. Exit 1 means only that a copy differs; any failure to read a repository (gh failed, no
# README) or a bad argument (anything but <repo>=<40 hex> for one of the five, or a repository named twice) exits 2.
# Usage: scripts/sync-readmes.sh [--check] [<repo>=<commit> ...]
set -euo pipefail
check=false
if [ "${1:-}" = "--check" ]; then
  check=true
  shift
fi
cd "$(dirname "$0")/.."
repos=(titan-cli terraform-provider-openvicloud titan-control-plane titan-incus-worker titan-cloud-console)

# "<repo> <commit>" lines, one per argument; no associative array, so macOS's bash 3.2 runs it.
pinned=""
for arg in "$@"; do
  name=${arg%%=*}
  commit=${arg#*=}
  known=false
  for repo in "${repos[@]}"; do
    [ "$repo" = "$name" ] && known=true
  done
  if [ "$known" != true ] || [ "$arg" = "$name" ] || ! [[ "$commit" =~ ^[0-9a-f]{40}$ ]]; then
    echo "bad argument $arg: expected <repo>=<40 hex commit>, <repo> one of ${repos[*]}" >&2
    exit 2
  fi
  if printf '%s' "$pinned" | grep -q "^$name "; then
    echo "bad argument $arg: $name is named twice" >&2
    exit 2
  fi
  pinned+="$name $commit"$'\n'
done

fetched=$(mktemp -d)
trap 'rm -rf "$fetched"' EXIT
mkdir -p "$fetched/readmes"
: > "$fetched/SOURCE"
for repo in "${repos[@]}"; do
  sha=$(printf '%s' "$pinned" | sed -n "s/^$repo //p")
  if [ -z "$sha" ]; then
    sha=$(gh api "repos/OpenViCloud/$repo/commits/main" --jq .sha) || { echo "cannot resolve main of OpenViCloud/$repo" >&2; exit 2; }
  fi
  gh api "repos/OpenViCloud/$repo/contents/README.md?ref=$sha" -H "Accept: application/vnd.github.raw" > "$fetched/readmes/$repo.md" ||
    { echo "no README.md in OpenViCloud/$repo@$sha" >&2; exit 2; }
  echo "$repo $sha" >> "$fetched/SOURCE"
done

if [ "$check" = true ]; then
  if diff -r knowledge/readmes "$fetched/readmes"; then
    echo "READMES_CHECK=MATCH knowledge/readmes/ matches every repository (the commits named, else the head of main)"
  else
    echo "READMES_CHECK=DIFFER knowledge/readmes/ (from knowledge/SOURCE) differs: run scripts/sync-readmes.sh with the same <repo>=<commit> arguments, open a pull request"
    exit 1
  fi
else
  rm -rf knowledge/readmes
  mkdir -p knowledge
  cp -R "$fetched/readmes" knowledge/readmes
  cp "$fetched/SOURCE" knowledge/SOURCE
  echo "knowledge/readmes/ synced; knowledge/SOURCE names each commit; mention it in the pull request"
fi
