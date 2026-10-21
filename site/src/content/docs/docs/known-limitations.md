---
title: Known limitations
description: What OpenViCloud cannot do yet — read this before you create a VM.
---

OpenViCloud is still being built. This page lists what does **not** work yet, so you do not waste time trying it.

## VMs cannot reach the Internet over IPv4

Your VM gets an IPv4 address in the [network](/docs/guides/network/) it is attached to. This address only lets it talk to other VMs on the same network: there is no NAT and no route to the Internet over IPv4, and the network does not accept inbound connections from the Internet over IPv4 either.

A VM reaches the Internet only over IPv6, and only on a network created with public IPv6 enabled. See [public IPv6](/docs/guides/public-ipv6/) for how to create one.

## No SSH button or console in the portal

The portal itself has no button to open a shell and no web console for VMs. To log in to a VM, use the CLI or connect directly over SSH — see [SSH keys and logging in](/docs/guides/ssh-keys/). The **Create VM** dialog has no field for a password or a cloud-init script; SSH keys can only be picked when you create the VM, not added to an existing one from the portal.

## Firewall rules do not block extra traffic yet

The portal has a **Firewall** button on each network for adding rules. Each rule is an **allow** rule, and traffic that matches no rule follows the network's default policy. Networks created from the portal have a default policy that allows all traffic, and the portal has no field to change this policy yet. So adding rules does not block any extra traffic today.

This also means that on a network with public IPv6 enabled, every port of every VM on that network is open to the Internet.

## Topping up the wallet by bank transfer does not work yet

The QR code and the account number in the **Buy credit** dialog do not point to a real OpenViCloud bank account yet. Do not transfer money to this QR code or account number.
