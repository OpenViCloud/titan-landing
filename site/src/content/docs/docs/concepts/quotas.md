---
title: Account quotas
description: The maximum number of VMs, networks, volumes, snapshots, firewall rules, SSH keys, load balancers and IPv6 networks an OpenViCloud account can use.
---

Each OpenViCloud account has nine quotas. When you have used up a quota, OpenViCloud refuses to create more and returns the matching error code.

## Default quotas

| Quota | Default | Counted per | Error code when exceeded |
|----------|----------|-----------|-----------------|
| Number of VMs | 10 | account | `VM_QUOTA_EXCEEDED` |
| Number of networks | 1 | account | `NETWORK_QUOTA_EXCEEDED` |
| Number of volumes | 10 | account | `VOLUME_QUOTA_EXCEEDED` |
| Number of networks with public IPv6 | 10 | account | `IPV6_QUOTA_EXCEEDED` |
| Number of SSH keys | 20 | account | `SSH_KEY_QUOTA_EXCEEDED` |
| Number of load balancers | 5 | account | `LOAD_BALANCER_QUOTA_EXCEEDED` |
| Snapshots of a VM | 3 | per VM | `VM_SNAPSHOT_QUOTA_EXCEEDED` |
| Snapshots of a volume | 3 | per volume | `VOLUME_SNAPSHOT_QUOTA_EXCEEDED` |
| Firewall rules of a network | 20 | per network | `FIREWALL_QUOTA_EXCEEDED` |

All the error codes above return HTTP `422`.

The three per-resource quotas (VM snapshots, volume snapshots, firewall rules) are counted separately for each VM, each volume and each network. For example: if you have 2 VMs, each VM can keep at most 3 snapshots.

The IPv6 quota counts **networks**, not VMs: it counts how many of your networks were created with **Enable public IPv6** ticked, the same way the network quota counts networks.

## What counts

- **VMs, networks, firewall rules, load balancers**: counted once created, or while being created. Those you have clicked delete on do not count.
- **Volumes**: counted unless you have clicked delete, it has been deleted, or it is in an error state.
- **Snapshots**: counted while being created or once ready. Snapshots you have clicked delete on no longer count.
- **SSH keys**: counted as every key you have saved. Deleting a key is immediate and permanent, so a deleted key never counts.

This means that when a delete request is accepted, the slot goes back to the quota immediately, without waiting for the deletion to finish. For SSH keys, the delete itself is immediate.

## A quota of 0

A quota of `0` means **you cannot create any**, not "unlimited".

## See your quotas in the portal

The **Profile** page, under **Quota**, shows two quotas: **VM limit** and **Network limit**.

The **Overview** page has its own **Quota** card, showing used/limit bars for four quotas: **VMs**, **Networks**, **Volumes** and **Public IPv6**.

The SSH key and load balancer quotas are not shown on the Profile or Overview page today. See [your account](/docs/guides/account/) for where these pages are.

## Changing quotas

OpenViCloud can change any of the nine quotas for your account. If a quota is lowered below what you are using, no resource is deleted. You just cannot create more until your usage is below the quota.

See also: [Error codes](/docs/concepts/error-codes/)
