# OpenViCloud landing

The public website of OpenViCloud (`site/`): the landing page with live prices and the customer docs, in English and
Vietnamese, built with Astro.

The API it reads prices from is [OpenViCloud/titan-control-plane](https://github.com/OpenViCloud/titan-control-plane);
the design docs live in titan-ops (`OpenViCloud/titan-ops`, private). Code comments name
one of those docs as `titan-ops <path under docs/>#<anchor>`.

## Develop

Node 22.

```sh
(cd site && npm install && npm run dev)
```

## Test

```sh
(cd site && npm test && npm run build)
```

Before merging a change, check that the build holds no copy of the internal docs. It needs a checkout of
titan-ops (`OpenViCloud/titan-ops`), which is private, so it runs on a machine that can
read it and not in CI (the path absolute or relative to `site/`):

```sh
(cd site && npm run build && node scripts/check-dist.mjs --require-docs --docs-dir <titan-ops checkout>/docs)
```

`site/` checks that the bold labels of its docs are labels the portal shows. It reads `portal-labels/` (the portal's
words) and the API contract `api/openapi-v1.json`, both copies made at a pinned commit:

```sh
scripts/sync-portal-labels.sh <titan-cloud-console commit, tag or branch>   # portal-labels/SOURCE names the commit
scripts/sync-spec.sh <titan-control-plane commit, tag or branch>             # api/SOURCE names the commit
```

A release runs `scripts/sync-portal-labels.sh --check <the titan-cloud-console commit it ships>`. It exits 1 when the
portal's words changed since the copy, so the docs are checked again before the release.

## Image

Every push to `main` publishes the `linux/arm64` and `linux/amd64` image `ghcr.io/openvicloud/titan-landing`
(`ci-site.yml`), tagged with the commit's first 7 characters. The image builds beside the tests, its layers kept in the
Actions cache; only the push job of a push to `main` may write packages, once the tests pass. Pull requests run the
tests and build the image without pushing it. Which tag an environment runs is decided outside this repository: dev by
`scripts/pull-images.py` of [OpenViCloud/titan-local-cluster](https://github.com/OpenViCloud/titan-local-cluster),
the other environments by a release of titan-ops (`OpenViCloud/titan-ops`, private).

## License

Proprietary: all rights reserved. No license is granted.
