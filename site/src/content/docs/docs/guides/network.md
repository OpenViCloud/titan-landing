---
title: Create and delete networks
description: Create a private network for your VMs in the portal, choose its name, cluster and CIDR range, and delete the network when you no longer need it.
---

A network is a private network that connects your VMs to each other. An account usually already has one, named `default`, created automatically when the account was approved — see [your default network](#your-default-network) below. Create another one here if you want more than that.

## Your default network

When your account was approved, OpenViCloud created a network named `default` for you, with public IPv6 enabled, on the first cluster that offers it. Like every new network it blocks inbound traffic from outside it by default, and once it is ready it normally has two rules open so you can reach it right away: Ingress TCP port 22 (SSH) from anywhere, over both IPv6 (`::/0`) and IPv4 (`0.0.0.0/0`). See [firewall rules](/docs/guides/firewall/) and [public IPv6](/docs/guides/public-ipv6/).

If no cluster had public IPv6 available yet when your account was approved, you did not get this network — create one yourself below, as before.

The default network is a normal network: rename it, add or remove firewall rules, or delete it like any other. Once deleted, it does not come back.

Accounts created before this existed also received a `default` network, unless they already had at least one network of their own.

## Create a network

1. Open the **Networks** page in the left sidebar.
2. Click **Create Network**.
3. Fill in **Name**. The name is at most 100 characters, uses only letters, digits, hyphens (`-`) and underscores (`_`), and must start with a letter or a digit.
4. Choose a **Cluster**. If you leave it empty, the portal shows "Choose a cluster" and sends nothing.
5. Fill in **CIDR** if you want to choose the address range, for example `10.0.0.0/24`. This field is optional. If you leave it empty, the system picks a range and shows it in the **CIDR** column when the network is created.
6. Tick **Enable public IPv6** if you want VMs on this network to have a public IPv6 address. Traffic from the Internet is blocked until you add a [firewall rule](/docs/guides/firewall/) — see [public IPv6](/docs/guides/public-ipv6/) before you tick it.
7. Click **Create Network**.

The new network appears in the table with the state **Creating**. The table polls every 5 seconds while a row is still changing, then stops. When **Creating** ends, the network may show **Pending** for a while as the infrastructure finishes setting it up. When the state becomes **Created**, you can create VMs and firewall rules on that network. If creation fails, the row shows **Failed**, **Errored**, **Unavailable**, **Unknown** or **Not found**.

## Network names

Names must be unique within your account. If a name is taken, the portal shows "A network with this name already exists" (code `NETWORK_NAME_TAKEN`). The name of a network that is being deleted is still reserved. Once the deletion is finished, you can use that name again.

You can rename a network with the **Rename** button on its row. The new name follows the same rules as above. If you pick a name already in use, the portal shows "A network named "<new name>" already exists" (code `NETWORK_NAME_TAKEN`). The **Rename** button is disabled once a delete has been requested for the network.

## CIDR range

If you choose a CIDR yourself, it must not overlap the range of another network in your account that has been created, including a network that is being deleted. If it overlaps, the portal shows "This CIDR overlaps with an existing network" (code `NETWORK_CIDR_OVERLAP`). This rule only looks at your own networks. Other accounts using the same range do not affect you.

IPv4 addresses in a network only let VMs on the same network talk to each other. The network has no route to the Internet over IPv4. See [known limitations](/docs/known-limitations/).

## Cluster

A network lives in the cluster you choose when you create it. When you create a VM, the portal only lists **Created** networks in the VM's cluster.

## Quota

By default, a new account can create 2 networks — the default network plus one of your own. When you reach it, the portal shows "Network quota exceeded" (code `NETWORK_QUOTA_EXCEEDED`). This quota can be adjusted for your account. A network that is being deleted no longer counts toward the quota.

## Delete a network

1. Delete all VMs that use the network. While VMs remain, the **Delete** button is disabled and shows the hint "Remove all VMs first".
2. Click **Delete** on the network's row.
3. Click **Confirm** in the dialog.

While the network still has VMs or a [load balancer](/docs/guides/load-balancer/) that has not finished deleting, the **Delete** button is disabled; when the reason is a load balancer, hovering over the button shows "Delete the load balancers of this network first". If the server still refuses, the portal shows "Cannot delete: the network still has VMs or load balancers" (code `NETWORK_NOT_EMPTY`). Delete in this order: load balancers, then VMs, then the network.

After you confirm, the portal shows "Network deleted", but the network stays in the table with the state **Deleting** until the deletion is finished, and only then disappears. The network's firewall rules are deleted with the network. If OpenViCloud cannot delete the network, the row shows the state OpenViCloud last read for the network — **Unknown** if it has none — and the reason in red under the cluster line; click **Delete** again to retry.

The **Delete** button is also disabled while the network is **Creating** or **Deleting**. A network in the **Failed** or **Not found** state can still be deleted.
