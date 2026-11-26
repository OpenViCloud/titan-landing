---
title: Use firewall rules
description: Add and delete firewall rules on a network, their fields and limits, and what a network does with traffic no rule allows.
---

## What a rule does

Every firewall rule you add is an **allow** rule. What happens to traffic no rule allows is the network's default policy, shown at the top of the firewall panel:

- A new network shows "Inbound from outside the network: blocked unless a rule allows it" and "Outbound: allowed". Traffic from the Internet reaches a VM with [public IPv6](/docs/guides/public-ipv6/) only on the ports your Ingress rules open. This does not block traffic between VMs of the same network.
- A network created before this default without a policy — every network created from the portal before then — shows "Inbound from outside the network: allowed" and "Outbound: allowed": every port is open, and rules cannot close one.
- A network created over the API or [Terraform](/docs/guides/terraform/) with a Deny outbound policy shows "Outbound: blocked unless a rule allows it": VMs reach out, and reach each other, only where an Egress rule allows it.

Your account's `default` network, if you have one (see [networks](/docs/guides/network/#your-default-network)), normally has six Ingress rules open once it is ready: TCP ports 22 (SSH), 80 (HTTP) and 443 (HTTPS), each from `::/0` and from `0.0.0.0/0`. A network you create yourself starts with no rules — add your own as described below.

The default policy cannot be changed after the network is created. See [known limitations](/docs/known-limitations/).

## Open the firewall panel

Click **Firewall** on a network's row in the [Networks](/docs/guides/network/) page. This opens the "Firewall Rules" panel for that network.

## Add a rule

1. Click **Add Rule**.
2. Choose a **Direction**: Ingress or Egress.
3. Choose a **Protocol**: TCP, UDP, ICMP or All.
4. Fill in **CIDR**. For Ingress this is the source; for Egress this is the destination. Both IPv4 and IPv6 CIDRs are accepted; an IPv6 CIDR must be written from its base address. The **Add rule** button stays disabled until this field has a value; leaving it empty and submitting another way shows "CIDR is required."
5. If the protocol is TCP or UDP, fill in **Start Port**, from 1 to 65535; without it the portal shows "Start Port is required for TCP and UDP." **End Port** is optional: leave it empty to allow the single start port. These fields are not shown for ICMP or All.
6. Click **Add rule**.

If the request is refused, the portal says why when it knows the reason: "This network has reached its firewall rule limit." (`FIREWALL_QUOTA_EXCEEDED`), "The network is not ready for rules yet." (`FIREWALL_NETWORK_NOT_READY`), or the suspended / pending-approval message of your account. Any other refusal shows "Failed to create rule."

## Rules cannot be edited

There is no way to change a rule once created. Delete it and add a new one instead.

## Delete a rule

Click **Delete** on the rule's row. There is no confirmation dialog. The portal shows "Rule deletion requested", the row shows **Deleting**, and then the rule disappears from the list once the deletion is finished. If OpenViCloud cannot delete the rule, the row shows the state OpenViCloud last read for the rule — **Unknown** if it has none — and the reason in red after the state.

A network's rules are deleted together with the network when you delete it.

## States

A rule can be **Creating**, **enabled**, **Deleting**, **Not found**, **Failed** or **Unknown**. **disabled** or **logged** only appear if the rule was changed outside OpenViCloud.

## Quota

By default, a network can have 20 firewall rules. This is per network, not per account.
