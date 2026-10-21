---
title: Your account
description: The account menu, the Members and Profile pages, the Overview page, and how language and theme are remembered.
---

This page covers the parts of the portal that are about your account rather than a specific resource: the account menu, the **Members** and **Profile** pages, and the **Overview** page.

## The account menu

Click the button with your account name in the top right of the portal. The menu has:

- **Profile** — opens the Profile page, described below.
- **Log out**.
- **Theme** — **System**, **Light** or **Dark**. See Theme, below.
- **Language** — **English** or **Tiếng Việt**. See Language, below.

## Members

Open **Members**, under **Account** in the left sidebar. The page lists the people who have access to your account, with their **Member ID** and the date they **Joined**.

You cannot invite, add or remove members from this page. Your account gets its one member, you, at sign-up, and nothing adds more today, so the list shows a single row.

## SSH keys

Open **SSH keys**, under **Account** in the left sidebar, to manage the keys you can pick from when creating a VM. See [SSH keys](/docs/guides/ssh-keys/).

## Profile

Open **Profile** from the account menu. It shows:

- **Tenant name** — the username from your sign-in.
- **Tenant ID**.
- **Status** — `Active` or `Suspended`. See [sign up and get approved](/docs/guides/sign-up/).
- **Quota**: **VM limit** and **Network limit**. See [quotas](/docs/concepts/quotas/).

Nothing on this page can be edited.

## Overview

The **Overview** page (the first item in the sidebar) shows:

- **Resources** cards: **Virtual Machines**, **Networks**, **Data Volumes** and **This Month** (this month's cost so far).
- **Recent Activity**, a list of recent requests on your account and their results.
- A **Quota** card with used/limit bars for **VMs**, **Networks**, **Volumes** and **Public IPv6**. See [quotas](/docs/concepts/quotas/).

## Search

From a screen at least 900 pixels wide, the header has a search box. Press `/` to focus it, or click it directly. Type at least two characters to search your VMs by name, private IPv4 or public IPv6 address, your networks by name or CIDR, and your volumes by name. Picking a VM opens its detail page; picking a network or volume opens its list, filtered to that name.

## Language

Pick **English** or **Tiếng Việt** in the account menu. The waiting-for-approval screen and the terms-of-service screen each have their own language switch in the corner, since you reach them before the account menu is available.

Your choice is remembered in this browser. On your first visit, with nothing remembered yet, the portal shows Tiếng Việt if you are in Vietnam, English otherwise. The sign-in page follows your remembered choice; with nothing remembered, it follows your browser's language instead.

Money and dates follow the chosen language — for example `900,000 ₫` in English and `900.000 ₫` in Tiếng Việt. Status words (like `Running` or `Failed`) stay in English in both languages. Text that the server sent as-is, such as a VM's failure reason, also stays in whatever language the server used.

## Theme

Pick **System**, **Light** or **Dark** in the account menu. **System** (the default) follows your device's setting. Your choice is remembered in this browser.
