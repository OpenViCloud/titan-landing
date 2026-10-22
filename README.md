# OpenViCloud landing

The public website of OpenViCloud (`site/`): the landing page with live prices and the customer docs, in English and
Vietnamese, built with Astro.

The API it reads prices from is [OpenViCloud/titan-control-plane](https://github.com/OpenViCloud/titan-control-plane);
the design docs live in [OpenViCloud/titan-ops](https://github.com/OpenViCloud/titan-ops). Paths such as
`docs/features/...` in code comments refer to titan-ops.

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
scripts/sync-spec.sh <titan-control-plane commit, tag or branch>             # api/SOURCE names the commit
```

A release runs `scripts/sync-portal-labels.sh --check <the titan-cloud-console commit it ships>`. It exits 1 when the
portal's words changed since the copy, so the docs are checked again before the release.

## Image

Every push to `main` publishes the `linux/arm64` image `ghcr.io/openvicloud/titan-landing` (`ci-site.yml`), tagged with
the commit's first 7 characters. The image builds beside the tests, its layers kept in the Actions cache; only the push
job of a push to `main` may write packages, once the tests pass. Pull requests run the tests and build the image without
pushing it. Which tag an environment runs is decided outside this repository: dev by `scripts/pull-images.py` of
[OpenViCloud/titan-local-cluster](https://github.com/OpenViCloud/titan-local-cluster), staging by a release of
[OpenViCloud/titan-ops](https://github.com/OpenViCloud/titan-ops).

## License

Proprietary: all rights reserved. No license is granted.
