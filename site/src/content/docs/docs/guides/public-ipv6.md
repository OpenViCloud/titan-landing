---
title: Public IPv6
description: Give a network's VMs a public IPv6 address reachable from the Internet, how the quota works, and why you must still harden each VM yourself.
---

Every network can get its own block of public IPv6 addresses. VMs on that network are then reachable from the Internet over IPv6.

**Every port is open by default.** Networks created from the portal allow all traffic by default, and the portal has no field to change this. This means every port of every VM on a public-IPv6 network is open to the whole Internet, and [firewall rules](/docs/guides/firewall/) created from the portal cannot close any port — they can only add more allowed traffic. Harden each VM yourself before relying on this: for example, run a firewall inside the guest operating system that only allows the ports you intend to expose.

## Turn it on when you create the network

**Enable public IPv6** is a checkbox on the [create network](/docs/guides/network/) dialog, off by default. You cannot turn it on or off after the network is created — decide at creation time.

If you also fill in **CIDR** while the checkbox is ticked, that CIDR must be inside `10.0.0.0/8`, `172.16.0.0/12` or `192.168.0.0/16`. Otherwise the portal shows "With public IPv6 the CIDR must be inside 10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16".

## What you get

The network's `/64` address block is reserved as soon as you submit the form, and its row shows it on a line under the **CIDR** column once the row loads. Each VM on the network gets its own public IPv6 address in that `/64`. The address appears in the **Public IPv6** column of the VM list and on the VM's own page; it can take a couple of minutes to appear after the VM starts.

The VM is reachable from the Internet over IPv6. IPv4 still has no route to the Internet, even on a network with public IPv6 enabled.

## Quota

By default, an account can have public IPv6 enabled on 10 networks at once. This is shown on the Overview page's Quota card as **Public IPv6**. A network stops counting toward this quota as soon as you click delete on it, not when the deletion finishes.

The default network quota is only 1, so in practice you will reach the network quota before the public IPv6 quota.

## When it is refused

| Message in the portal | Error code | Meaning |
|---|---|---|
| Public IPv6 quota exceeded — delete a network with public IPv6 first | `IPV6_QUOTA_EXCEEDED` | You already have as many networks with public IPv6 enabled as your account allows (10 by default). |
| Public IPv6 is not available in this zone | `IPV6_NOT_AVAILABLE` | The zone has no public IPv6 configured, or every `/64` block of the zone (255 total) is already taken. |
| Another network took the same IPv6 range at the same moment — submit again | `IPV6_ALLOCATION_CONFLICT` | Two networks requested public IPv6 in the same zone at the same time and picked the same `/64`. Submit the form again. |

A network's `/64` is held until its deletion is finished, not just requested.

## Cost

Public IPv6 does not add to your bill.
