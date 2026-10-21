# OpenViCloud landing

The public website of OpenViCloud (`site/`): the landing page with live prices and the customer docs, in English and
Vietnamese, built with Astro.

The API it reads prices from is [OpenViCloud/control-plane](https://github.com/OpenViCloud/control-plane); the design
docs live in [OpenViCloud/titan](https://github.com/OpenViCloud/titan). Paths such as `docs/features/...` in code
comments refer to titan.

## Develop

Node 22.

```sh
(cd site && npm install && npm run dev)
```

## Test

```sh
(cd site && npm test && npm run build)
```

`site/` checks that the bold labels of its docs are labels the portal shows. It reads `portal-labels/` (the portal's
words) and the API contract `api/openapi-v1.json`, both copies made at a pinned commit:

```sh
scripts/sync-portal-labels.sh <titan-cloud-console commit, tag or branch>   # portal-labels/SOURCE names the commit
scripts/sync-spec.sh <control-plane commit, tag or branch>                   # api/SOURCE names the commit
```

A release runs `scripts/sync-portal-labels.sh --check <the titan-cloud-console commit it ships>`. It exits 1 when the
portal's words changed since the copy, so the docs are checked again before the release.

## Image

Every push to `main` publishes the `linux/arm64` image `ghcr.io/openvicloud/titan-landing` (`ci-site.yml`), tagged
with the commit's first 7 characters. Only the publishing job of a push to `main` may write packages; pull requests run
the tests only. Dev runs the tag that `scripts/pull-images.py` of
[OpenViCloud/titan-local-cluster](https://github.com/OpenViCloud/titan-local-cluster) picks; staging runs the tag a
release of [OpenViCloud/titan](https://github.com/OpenViCloud/titan) promotes.

## License

Proprietary: all rights reserved. No license is granted.
