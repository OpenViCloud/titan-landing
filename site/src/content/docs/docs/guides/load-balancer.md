---
title: Use load balancers
description: Create a load balancer in front of several VMs of a network, its listeners and VMs, how its address is picked, edit and delete it, and how it behaves.
---

A load balancer puts one public IPv6 address in front of several VMs of a network. It is layer 4 (TCP/UDP pass-through): it forwards each connection's packets as they are, without reading or changing them.

## Before you create one

A load balancer attaches to one network that has [public IPv6](/docs/guides/public-ipv6/) enabled and is ready. If no network of yours has public IPv6 yet, the portal shows "No network has public IPv6 yet. Tick "Enable public IPv6" when you create a network." and the form cannot be submitted.

## Create a load balancer

1. Open the **Load balancers** page in the left sidebar.
2. Click **Create load balancer**.
3. Fill in **Name**, up to 100 letters, digits, hyphens and underscores, starting with a letter or a digit.
4. Choose a **Network** — only networks with public IPv6 that are ready are listed.
5. Add one or more **Listeners**: each has a **Protocol** (TCP or UDP), a **Port** and a **Target port**. A new listener defaults to TCP, port 80 to target port 80. Use **Add listener** to add one, or the **×** button next to a listener to remove it.
6. Tick the **VMs** that should receive traffic. Only VMs on the chosen network that exist on the infrastructure and are not being deleted are offered — a stopped VM can still be picked. Until you choose a network, the portal shows "Select a network to pick its VMs"; if the network has no eligible VM yet, it shows "This network has no VM that can take traffic yet".
7. Click **Create load balancer**.

### Limits

- 1 to 10 listeners ("Add 1 to 10 listeners").
- Ports from 1 to 65535 ("Ports must be between 1 and 65535").
- Each protocol and port pair can only be used by one listener ("Each protocol and port can be used by one listener only").
- 1 to 20 VMs ("Pick 1 to 20 VMs").

### When it is refused

| Message in the portal | Error code | Meaning |
|---|---|---|
| A load balancer with this name already exists | `LOAD_BALANCER_NAME_TAKEN` | Another load balancer of yours already has this name. |
| Load balancer quota exceeded | `LOAD_BALANCER_QUOTA_EXCEEDED` | You have reached the number of load balancers allowed. |
| This network has no public IPv6 | `LOAD_BALANCER_NEEDS_PUBLIC_IPV6` | The chosen network does not have public IPv6 enabled. |
| This network is not ready yet — try again in a moment | `NETWORK_INVALID_STATE` | The network is not usable yet. |
| A selected VM can no longer take traffic — refresh and pick again | `LOAD_BALANCER_BACKEND_INVALID` | A VM you picked is not on the network, not on the infrastructure, or belongs to another account. |
| This network has no free load balancer address left | `LOAD_BALANCER_INVALID_STATE` (create) | The network has no free address left for a new load balancer. |
| The load balancer is busy with another change — try again in a moment | `LOAD_BALANCER_INVALID_STATE` (edit) | Another change is already waiting on this load balancer. |
| Another load balancer took the same address at the same moment — submit again | `LOAD_BALANCER_VIP_CONFLICT` | Two load balancers on the same network were created at the same moment and got the same address. Submit again. |

## Address

OpenViCloud picks the address for you — you cannot choose it. It is built from the network's `/64` plus `::1:n`, where `n` is the lowest free number on that network. For example, the first load balancer on `2001:db8:0:d401::/64` gets `2001:db8:0:d401::1:1`.

The address is IPv6 only; a load balancer has no IPv4 address. Each row in the list shows the address with an **IPv6 only** tag, the network it is on, its listeners (for example "TCP 80 → 8080", joined by " · " when there is more than one), and how many VMs it sends to.

## Edit a load balancer

Click **Edit** on a load balancer's row, then **Save**. Editing replaces the whole configuration — all listeners and all VMs — in one request. The network cannot be changed; create a new load balancer if you need a different one. The portal cannot rename a load balancer yet; the API can (`PATCH /v1/tenant/load-balancers/{id}` with `{ "name": "…" }`, using an [API token](/docs/guides/api-tokens/); `GET /v1/tenant/load-balancers` lists each `id`), and the address stays the same. **Edit** is only available while the load balancer is **Active** — not while it is still being created, updated or deleted, and not on a **Not found** or **Failed** row.

## States

A load balancer can be **Creating**, **Updating**, **Deleting**, **Active**, **Not found** or **Failed**. The list polls every 5 seconds while a load balancer is still changing, then stops.

## Delete a load balancer

Click **Delete** on the row, then **Confirm** in the dialog. The **Delete** button is disabled while the load balancer is **Creating** or **Deleting**.

Deleting a VM that a load balancer still sends traffic to is refused: "Cannot delete: a load balancer sends traffic to this VM — remove it from the load balancer first" (code `VM_IS_LOAD_BALANCER_BACKEND`).

## Behaviour

- The load balancer passes TCP or UDP packets through to the VMs you picked; it does not terminate TLS or read HTTP.
- Backends see the real source address of the client, not the load balancer's address.
- Health checking is always on and cannot be turned off. A VM that stops responding stops receiving new traffic quickly; OpenViCloud does not expose a health status for individual backends.
- Each backend receives traffic on the address built from its network card (its EUI-64 address on the network's `/64`). Keep the VM's default IPv6 addressing on that network card — changing it to a different kind of address can stop the VM from receiving load-balanced traffic.

## Quota and cost

By default, an account can have 5 load balancers. This quota is not shown on the Overview page's Quota card. Load balancers do not add to your bill.
