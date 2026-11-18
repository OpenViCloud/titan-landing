---
title: Known limitations
description: What OpenViCloud cannot do yet — read this before you create a VM.
---

OpenViCloud is still being built. This page lists what does **not** work yet, so you do not waste time trying it.

## VMs cannot reach the Internet over IPv4

Your VM gets an IPv4 address in the [network](/docs/guides/network/) it is attached to. This address only lets it talk to other VMs on the same network: there is no NAT and no route to the Internet over IPv4, and the network does not accept inbound connections from the Internet over IPv4 either.

A VM reaches the Internet only over IPv6, and only on a network created with public IPv6 enabled. See [public IPv6](/docs/guides/public-ipv6/) for how to create one.

## Firewall rules do not block unless you set a deny policy

The portal has a **Firewall** button on each network for adding rules, and each rule is an **allow** rule. A network's default policy decides what happens to traffic that matches no rule.

Networks created from the portal have a default policy of Allow for both directions, and the portal has no field to change this. On such a network, all inbound and outbound traffic is allowed — on a network with public IPv6 enabled, every port of every VM on it is open to the Internet.

A network created with a deny default policy (over the API, or in [Terraform](/docs/guides/terraform/)) drops all inbound and outbound traffic except what a rule allows.

## You cannot buy credit in the portal yet

During the beta the portal has no way to buy credit. OpenViCloud adds credit to your wallet. To ask for more, [open an issue](https://github.com/OpenViCloud/titan-support/issues/new/choose) at `OpenViCloud/titan-support` on GitHub and write the **Tenant ID** shown on your **Profile** page. The issue is public: do not write your email or other personal data in it.
