---
title: Create and manage VMs
description: Create a VM in the portal, stop and start it, delete it, use snapshots, and see when a VM is billed.
---

All VM actions are on the **Virtual Machines** page in the left sidebar. What each state means (Running, Ready, Stopped, Frozen, Error…) is on the [VM states](/docs/concepts/vm-states/) page.

## Before you create a VM

Each VM needs a [network](/docs/guides/network/) in the same zone. That network must be in the **Created** state. The portal only lists ready networks in the zone you choose. A VM gets a public IPv6 address only when its network was created with public IPv6 enabled — see [public IPv6](/docs/guides/public-ipv6/).

## Create a VM

1. Click **Create VM**.
2. Fill in **Name**. The name is at most 64 characters, uses only letters, digits and hyphens (`-`), and must start with a letter or a digit. It must differ from the names of the VMs you have. The name of a deleted VM can be used again.
3. Choose a **Zone**.
4. Choose a **Network**. This field only shows networks in the zone you just chose.
5. Choose a **Template**, which is the operating system. This field only shows templates available in that zone.
6. Choose a **Size**: Small (1 vCPU, 2 GB RAM), Medium (2 vCPU, 4 GB), Large (4 vCPU, 8 GB) or Extra Large (8 vCPU, 16 GB).
7. Under **SSH keys**, tick the keys to add to this VM. See [SSH keys and logging in](/docs/guides/ssh-keys/) to add one first. Picked keys are added for the user `ubuntu`.
8. Click **Create VM**.

Fill in every field above SSH keys. If **Zone**, **Network**, **Template** or **Size** is still empty when you click **Create VM**, the portal shows "Choose a zone, network, template and size." and sends nothing.

The new VM appears in the list with the state **Creating**. When the VM runs, the state changes to **Running** or **Ready**, and the **Private IPv4** field shows the VM's address in the network. The **Public IPv6** column shows the VM's address if its network has public IPv6, or "—" otherwise; on the VM's own page this field shows "Not enabled" instead when the network has no public IPv6. If creation fails, the state is **Failed** with a line explaining why.

## When creating a VM is refused

| Message in the portal | Error code | Meaning |
|---|---|---|
| A VM with this name already exists | `VM_NAME_TAKEN` | You already have another VM with the same name. |
| VM quota exceeded | `VM_QUOTA_EXCEEDED` | You have reached the number of VMs allowed. The default is 10 VMs per account. |
| Selected zone is no longer available — pick another | `ZONE_NOT_FOUND` | The zone you chose no longer exists. |
| That network is in another zone — pick a network in this zone | `NETWORK_ZONE_MISMATCH` | The network and the VM must be in the same zone. |
| Selected size is no longer available — pick another | `VM_OFFERING_NOT_FOUND` | The size you chose no longer exists. |
| Selected template is not available in this zone yet — pick another | `TEMPLATE_NOT_SYNCED` | The template is not in this zone yet. |
| Selected template is not available right now — pick another | `TEMPLATE_UNAVAILABLE` | The template cannot be used in this zone for now. |
| A picked SSH key no longer exists — pick again | `SSH_KEY_NOT_FOUND` | One of the SSH keys you picked was deleted meanwhile. |
| Your account is suspended — contact support to create resources | `TENANT_SUSPENDED` | Your account is suspended. |
| Your account is awaiting admin approval — you can browse but can’t create resources yet | `TENANT_PENDING_APPROVAL` | Your account has not been approved yet. |

A VM you have clicked delete on no longer counts toward the VM limit.

## Log in to a VM

See [SSH keys and logging in](/docs/guides/ssh-keys/) — add a key, pick it when you create a VM, then use the CLI or a direct SSH connection.

## Stop, Start and Resume

- **Stop** is available when the VM is Running, Ready, Frozen or Error. Stop turns the VM off immediately, without waiting for the operating system to shut down, like pulling the plug. Save any unfinished work before you click it.
- **Start** is available when the VM is Stopped.
- **Resume** replaces Start when the VM is Frozen. This button lets the VM continue running.

While a command is running, the action cell shows **Creating…**, **Stopping…**, **Starting…** or **Deleting…**, and the Stop/Start buttons are hidden for the moment.

## Delete a VM

1. Click **Delete** on the VM's row.
2. Click **Confirm** in the "Delete *VM name*?" dialog.

Deleting a VM also deletes all of its snapshots. Volumes attached to the VM are detached and kept; a volume is still billed until its deletion finishes ([volumes](/docs/guides/volume/)).

You cannot delete a VM yet in three cases:

- The VM was just created and is not ready. The **Delete** button is disabled while the VM is **Creating** and does not exist yet; if the list is a few seconds old and you click it anyway, the portal shows "Cannot delete yet: the VM is still being set up. Try again in a minute."
- A snapshot of the VM is being created or reverted: "Cannot delete: a snapshot operation is in progress for this VM" (code `VM_SNAPSHOT_IN_PROGRESS`). Wait for the snapshot to finish, then delete again.
- A load balancer still sends traffic to this VM: "Cannot delete: a load balancer sends traffic to this VM — remove it from the load balancer first" (code `VM_IS_LOAD_BALANCER_BACKEND`). See [load balancers](/docs/guides/load-balancer/).

## VM snapshots

Click **Manage** on the VM's row, then open the **Snapshots** tab.

**Create a snapshot.** Click **New Snapshot**, enter a name (at most 100 characters), then click **Create**. This button is available when the VM is Running, Ready, Stopped or Frozen, and the VM is not stopping or being deleted. Each VM has at most 3 snapshots by default. When you reach it, the portal shows "Snapshot quota exceeded (max 3 per VM)." (code `VM_SNAPSHOT_QUOTA_EXCEEDED`). Snapshots you have clicked delete on do not count.

**Revert.** The **Revert** button is on a snapshot in the **Available** state when no action is running on it. The snapshot shows **Reverting** until it finishes. Revert brings the VM's disk back to when the snapshot was taken and only touches the disk — the VM's size and the attached volumes do not change. Revert does not stop or start the VM. This only works when the VM is Running, Ready, Stopped or Frozen, with no stop or delete waiting; otherwise the portal shows "Failed to revert snapshot."

**Delete a snapshot.** Click **Delete** on the snapshot, then click **Confirm**. This button is available when no action is running on the snapshot; a **Failed** or **Not found** snapshot can also be deleted.

## When a VM is billed

- Compute is billed by the hour, at the price of the size. A VM is billed when it is Running, Ready, Frozen or Error.
- A VM in the **Stopped** state is not billed for compute.
- Each snapshot that exists on the infrastructure is billed at a fixed hourly price, which does not depend on size, until the deletion is finished. A snapshot being reverted is still billed.
- Volumes are billed separately, see the [volumes](/docs/guides/volume/) page.

The hourly price of each VM size is on the [pricing table](/#pricing).
