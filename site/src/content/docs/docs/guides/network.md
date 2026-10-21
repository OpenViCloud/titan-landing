---
title: Create and delete networks
description: Create a private network for your VMs in the portal, choose its name, zone and CIDR range, and delete the network when you no longer need it.
---

A network is a private network that connects your VMs to each other. Each VM needs a network, so you create the network first and then [create the VM](/docs/guides/vm/).

## Create a network

1. Open the **Networks** page in the left sidebar.
2. Click **Create Network**.
3. Fill in **Name**. The name is at most 100 characters, uses only letters, digits, hyphens (`-`) and underscores (`_`), and must start with a letter or a digit.
4. Choose a **Zone**. If you leave it empty, the portal shows "Choose a zone" and sends nothing.
5. Fill in **CIDR** if you want to choose the address range, for example `10.0.0.0/24`. This field is optional. If you leave it empty, the system picks a range and shows it in the **CIDR** column when the network is created.
6. Tick **Enable public IPv6** if you want VMs on this network reachable from the Internet over IPv6. See [public IPv6](/docs/guides/public-ipv6/) before you tick it.
7. Click **Create Network**.

The new network appears in the table with the state **Creating**. The table polls every 5 seconds while a row is still changing, then stops. When the state becomes **Created**, you can create VMs and firewall rules on that network. If creation fails, the row shows **Failed**, **Errored**, **Unavailable** or **Not found**.

## Network names

Names must be unique within your account. If a name is taken, the portal shows "A network with this name already exists" (code `NETWORK_NAME_TAKEN`). The name of a network that is being deleted is still reserved. Once the deletion is finished, you can use that name again.

You can rename a network with the **Rename** button on its row. The new name follows the same rules as above. If you pick a name already in use, the portal shows "A network named "<new name>" already exists" (code `NETWORK_NAME_TAKEN`). The **Rename** button is disabled once a delete has been requested for the network.

## CIDR range

If you choose a CIDR yourself, it must not overlap the range of another network in your account that has been created, including a network that is being deleted. If it overlaps, the portal shows "This CIDR overlaps with an existing network" (code `NETWORK_CIDR_OVERLAP`). This rule only looks at your own networks. Other accounts using the same range do not affect you.

IPv4 addresses in a network only let VMs on the same network talk to each other. The network has no route to the Internet over IPv4. See [known limitations](/docs/known-limitations/).

## Zone

A network lives in the zone you choose when you create it. When you create a VM, the portal only lists **Created** networks in the VM's zone.

## Quota

By default, a new account can create 1 network. When you reach it, the portal shows "Network quota exceeded" (code `NETWORK_QUOTA_EXCEEDED`). This quota can be adjusted for your account. A network that is being deleted no longer counts toward the quota.

## Delete a network

1. Delete all VMs that use the network. While VMs remain, the **Delete** button is disabled and shows the hint "Remove all VMs first".
2. Click **Delete** on the network's row.
3. Click **Confirm** in the dialog.

While the network still has VMs or a [load balancer](/docs/guides/load-balancer/) that has not finished deleting, the **Delete** button is disabled; when the reason is a load balancer, hovering over the button shows "Delete the load balancers of this network first". If the server still refuses, the portal shows "Cannot delete: the network still has VMs or load balancers" (code `NETWORK_NOT_EMPTY`). Delete in this order: load balancers, then VMs, then the network.

After you confirm, the portal shows "Network deleted", but the network stays in the table with the state **Deleting** until the deletion is finished, and only then disappears. The network's firewall rules are deleted with the network. If OpenViCloud cannot delete the network, the row goes back to its previous state and shows the reason in red under the zone line; click **Delete** again to retry.

The **Delete** button is also disabled while the network is **Creating** or **Deleting**. A network in the **Failed** or **Not found** state can still be deleted.
