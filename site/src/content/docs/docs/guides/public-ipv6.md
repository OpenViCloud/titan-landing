---
title: Public IPv6
description: Give a network's VMs a public IPv6 address, open the ports you need with firewall rules, and how the quota works.
---

Every network can get its own block of public IPv6 addresses. VMs on that network then have an address on the Internet over IPv6, and can reach the Internet over it.

Your account's `default` network (see [networks](/docs/guides/network/#your-default-network)) already has public IPv6 enabled, if your account has one — so you may already have a network with public IPv6 without creating it yourself.

**A new network blocks inbound traffic until you open a port.** Traffic coming from the Internet is dropped, and the VMs still reach out. Add a [firewall rule](/docs/guides/firewall/) for each port you want to reach from the Internet — for example Ingress TCP 22 from `::/0` for SSH. A network created from the portal before this default keeps every port of every VM open to the whole Internet, and rules cannot close a port there (see [known limitations](/docs/known-limitations/)); on such a network, harden each VM yourself, for example with a firewall inside the guest operating system.

## Turn it on when you create the network

**Enable public IPv6** is a checkbox on the [create network](/docs/guides/network/) dialog, off by default. You cannot turn it on or off after the network is created — decide at creation time.

If you also fill in **CIDR** while the checkbox is ticked, that CIDR must be inside `10.0.0.0/8`, `172.16.0.0/12` or `192.168.0.0/16`. Otherwise the portal shows "With public IPv6 the CIDR must be inside 10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16".

## What you get

The network's `/64` address block is reserved as soon as you submit the form, and its row shows it on a line under the **CIDR** column once the row loads. Each VM on the network gets its own public IPv6 address in that `/64`. The address appears in the **Public IPv6** column of the VM list and on the VM's own page; it can take a couple of minutes to appear after the VM starts.

The VM reaches the Internet over IPv6. IPv4 still has no route to the Internet, even on a network with public IPv6 enabled.

## Quota

By default, an account can have public IPv6 enabled on 10 networks at once. This is shown on the Overview page's Quota card as **Public IPv6**. A network stops counting toward this quota as soon as you click delete on it, not when the deletion finishes.

The network quota is 2 by default — the `default` network plus one of your own — so in practice you will reach the network quota before the public IPv6 quota.

## When it is refused

| Message in the portal | Error code | Meaning |
|---|---|---|
| Public IPv6 quota exceeded — delete a network with public IPv6 first | `IPV6_QUOTA_EXCEEDED` | You already have as many networks with public IPv6 enabled as your account allows (10 by default). |
| Public IPv6 is not available in this cluster | `IPV6_NOT_AVAILABLE` | The cluster has no public IPv6 configured, or every `/64` block of the cluster (255 total) is already taken. |

A network's `/64` is held until its deletion finishes, not as soon as you request it. A network shown as **Failed** never reached the infrastructure, and its `/64` was freed at once.

## Cost

Public IPv6 does not add to your bill.
