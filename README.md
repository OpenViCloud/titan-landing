# OpenViCloud landing

The public website of OpenViCloud (`site/`): the landing page with live prices and the customer docs, in English and
Vietnamese, built with Astro. Beside it, `chat/`: the assistant that answers visitors on that site.

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

## Chat assistant

`chat/` is the assistant that answers visitors who have not signed up, at `POST /api/chat` on the site's origin. It
asks free models on OpenRouter, from the customer docs of `site/`, the READMEs in `chat/knowledge/readmes/` and the
live prices of the API; its manner is in `chat/persona.md`. The landing pages `/` and `/vi/` show the chat box that
asks it; where `/api/chat` reaches no service, every answer is the busy text. The route from `/api/chat` of the
site's origin to the assistant belongs to each environment's network layer, so the site's image knows nothing of it.
Dev has it, as an Ingress path (`gitops/chat/ingress.yaml` of OpenViCloud/titan-local-cluster); dev has no OpenRouter
key, so there every answer is still the busy text. Prd has no route yet. Rules:
`titan-ops features/public-site/design.md#chat-assistant`.

```sh
(cd chat && npm install && npm test)   # no test calls a real model; set TEST_DATABASE_URL and TEST_NATS_URL (JetStream on) to run the Postgres and NATS tests
(cd chat && OPENROUTER_API_KEY=… API_BASE_URL=http://api.localhost:8080 DOCS_DIR=../site/src/content/docs npm start)
```

Optional env: `DATABASE_URL` (without it nothing is kept), `NATS_URL` (with JetStream on, every pod counts the daily cap
per address in one memory-only bucket; without it, or while NATS fails, each pod counts on its own, a store that does
not answer within 1 s included), `CHAT_MODELS`
(comma list, overrides the default order), `PORT` (8080).

The READMEs are a copy made at the head of each repository's `main`, or at the commit an argument names;
`chat/knowledge/SOURCE` names the commits:

```sh
chat/scripts/sync-readmes.sh           # copy again
chat/scripts/sync-readmes.sh --check   # exit 1 when a README at the head of main differs from the copy
chat/scripts/sync-readmes.sh --check titan-control-plane=<commit>   # that repository at that commit, the others at main
chat/scripts/sync-readmes.sh titan-control-plane=<commit>           # copy again, that repository at that commit
```

Every push to `main` also publishes `ghcr.io/openvicloud/titan-landing-chat` (`ci-chat.yml`), built from the root of
the repository (`docker build -f chat/Dockerfile .`) because the image carries the site's docs.

## License

Proprietary: all rights reserved. No license is granted.
