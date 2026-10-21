#!/bin/bash
# Copies the public API contract api/openapi-v1.json from one commit of OpenViCloud/control-plane and records that commit in
# api/SOURCE. The site's label check reads it (site/src/scripts/labels.test.js); CI never fetches the contract.
# Usage: scripts/sync-spec.sh <control-plane commit, tag or branch>
set -euo pipefail
ref=${1:?usage: scripts/sync-spec.sh <control-plane commit, tag or branch>}
cd "$(dirname "$0")/.."
sha=$(gh api "repos/OpenViCloud/control-plane/commits/$ref" --jq .sha)
gh api "repos/OpenViCloud/control-plane/contents/api/openapi-v1.json?ref=$sha" \
  -H "Accept: application/vnd.github.raw" > api/openapi-v1.json
echo "$sha" > api/SOURCE
echo "api/openapi-v1.json synced from OpenViCloud/control-plane@$sha; mention it in the pull request"
