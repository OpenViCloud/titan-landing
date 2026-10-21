---
title: API tokens
description: Create a token on the portal so CI jobs, scripts and the CLI can call the API as you, without a browser login.
---

API tokens are under **Account → API tokens** in the left sidebar. A token acts as you in your account: anything you can do with the portal or the CLI, a request carrying the token can do too — except admin functions, which a token never reaches.

## Create a token

1. On the **API tokens** page, click **Create token**.
2. Fill in **Name**, at most 64 characters — name it after where it will be used, for example `ci-deploy`.
3. Pick **Expires after**: 30 days, 90 days (the default), 1 year, or Never.
4. Click **Create token**.

The portal then shows the token once, starting with `ovc_`. The portal warns: **You won't be able to see this token again. Copy it now.** Click **Copy** and store it somewhere safe, such as your CI's secret store — OpenViCloud keeps only a fingerprint of it. If you lose it, delete it and create a new one.

The table lists each token with its **Name**, the first characters of the **Token**, when it was **Created**, and when it **Expires** (`Never`, a date, or `Expired <date>`).

### When creating a token is refused

| Message in the portal | Error code | Meaning |
|---|---|---|
| A token with this name already exists | `API_TOKEN_NAME_TAKEN` | You already have another token with this name. |
| Token limit reached (20) — delete a token first | `API_TOKEN_QUOTA_EXCEEDED` | You have 20 tokens; expired tokens count until you delete them. |

## Use a token

With the CLI, set it in the environment instead of running `openvicloud auth login`:

```bash
export OPENVICLOUD_TOKEN=ovc_...
openvicloud vm list
```

Against the API, send it as a bearer token:

```bash
curl -H "Authorization: Bearer $OPENVICLOUD_TOKEN" https://api-titan-staging.openvicloud.com/v1/tenant/vms
```

A request with a token is refused with HTTP `401` when the token was deleted, has expired, or is mistyped. If your account is suspended or still waiting for approval, a token can read but not change anything, exactly like a browser login.

## Delete a token

Click the bin icon on the token's row and confirm. The token stops working at once: the next request that carries it gets `401`. Deleting cannot be undone.
