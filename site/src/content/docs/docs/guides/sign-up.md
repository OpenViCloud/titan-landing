---
title: Sign up and get approved
description: Create an OpenViCloud account with GitHub or email, accept the terms of service, and understand the account states.
---

You need an account to use OpenViCloud. This page explains how to sign up, when your account can be used, and the states you may see.

## Sign up

1. Open the customer portal. If you are not signed in, the portal sends you to the sign-in page.
2. Choose one of two ways:
   - **Sign in with GitHub.** OpenViCloud uses the email from your GitHub account.
   - **Sign up with email and password** using the registration form on the sign-in page.
3. The first time you enter the portal, OpenViCloud creates an account for you.

Each user belongs to exactly one account.

## When your account is approved

Every new account starts in the `PendingApproval` state (waiting for approval).

- **Signed in with GitHub:** the account is approved immediately and moves to `Active`, because OpenViCloud trusts the email that GitHub provides.
- **Signed up with email and password:** the account stays in `PendingApproval` until an administrator approves it.

When your account is approved, your wallet is opened at the same time.

## While your account is waiting for approval

While you wait, the portal only shows the **Account pending approval** screen with a **Sign out** button. You cannot open the other pages of the portal yet. This screen also has a language switch in the corner, so you can read it in English or Tiếng Việt before you are approved.

Every create, change or delete action is refused with the code `TENANT_PENDING_APPROVAL`.

The portal reads your account state when the page loads. After you are approved, reload the page to enter the portal.

## Accept the terms of service

Once your account is `Active`, the portal shows the **Terms of Service** screen if you have not accepted the current version of the terms. A `Suspended` account that still owes acceptance also sees this screen.

1. Click the **Terms of Service** link to read them. The link opens in a new tab.
2. Tick the box **I have read and agree to the Terms of Service.** This box is not ticked for you.
3. Click **Accept & continue**. You can only click this button after you tick the box.

If you click **Decline**, you are signed out.

Acceptance is recorded per user, not per account. When a new version of the terms is published, you must accept again the next time you enter the portal. You can always read the terms through the **Terms of Service** link at the bottom of the left sidebar, which opens them in a new tab without needing to sign in.

## When your account is suspended

An administrator can move an account to `Suspended`. A rejected sign-up also has this state.

While suspended, every action that changes something is refused with the code `TENANT_SUSPENDED`. This includes creating, deleting, starting and stopping resources, **topping up the wallet** and **paying invoices**. If you still owe acceptance of the terms, accepting them is also blocked while suspended.

Suspension does not turn off your resources. Running VMs keep running and are still billed as usual.

You can see your account's current state on the **Profile** page, on the **Status** line. See [your account](/docs/guides/account/).
