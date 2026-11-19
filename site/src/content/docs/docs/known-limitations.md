---
title: Known limitations
description: What OpenViCloud cannot do yet — read this before you create a VM.
---

OpenViCloud is still being built. This page lists what does **not** work yet, so you do not waste time trying it.

## VMs cannot reach the Internet over IPv4

Your VM gets an IPv4 address in the [network](/docs/guides/network/) it is attached to. This address only lets it talk to other VMs on the same network: there is no NAT and no route to the Internet over IPv4, and the network does not accept inbound connections from the Internet over IPv4 either.

A VM reaches the Internet only over IPv6, and only on a network created with public IPv6 enabled. See [public IPv6](/docs/guides/public-ipv6/) for how to create one.

## A network's default policy cannot be changed

A network's default policy decides what happens to traffic that matches no [firewall rule](/docs/guides/firewall/). It is set when the network is created and cannot be changed afterwards.

- A new network blocks inbound traffic from outside the network and allows outbound traffic. To reach a VM from the Internet, add a rule — for example Ingress TCP 22 for SSH.
- Blocking inbound traffic does not block traffic between VMs of the same network.
- A network created before this default without a policy — every network created from the portal before then — allows all traffic in both directions. On such a network with public IPv6 enabled, every port of every VM is open to the Internet, and rules cannot close a port. To get the new default, create a new network and create new VMs on it.

## You cannot buy credit in the portal yet

During the beta the portal has no way to buy credit. OpenViCloud adds credit to your wallet. To ask for more, [open an issue](https://github.com/OpenViCloud/titan-support/issues/new/choose) at `OpenViCloud/titan-support` on GitHub and write the **Tenant ID** shown on your **Profile** page. The issue is public: do not write your email or other personal data in it.
