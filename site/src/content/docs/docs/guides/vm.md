---
title: Create and manage VMs
description: Create a VM in the portal, stop and start it, delete it, use snapshots, and see when a VM is billed.
---

All VM actions are on the **Virtual Machines** page in the left sidebar. What each state means (Running, Ready, Stopped, Frozen, Error…) is on the [VM states](/docs/concepts/vm-states/) page.

## Before you create a VM

Each VM needs a [network](/docs/guides/network/) in the same cluster. That network must be in the **Created** state. The portal only lists ready networks in the cluster you choose. Your account already has a `default` network ready to use, if your account has one — see [your default network](/docs/guides/network/#your-default-network). A VM gets a public IPv6 address only when its network was created with public IPv6 enabled — see [public IPv6](/docs/guides/public-ipv6/).

## Create a VM

1. Click **Create VM**. Once a cluster and a network are chosen, the line under the title shows them, such as `Singapore 01 · default`.
2. Fill in **Name**. The name is at most 64 characters, uses only letters, digits and hyphens (`-`), and must start with a letter or a digit. It must differ from the names of the VMs you have. The name of a deleted VM can be used again.
3. Check the cluster and network. If you have one cluster, it is already chosen; if that cluster has exactly one usable network, that network is chosen too. To pick another, click **Change** next to them: the **Cluster** and **Network** fields open. They also show by themselves while a cluster or network still has to be chosen. The **Network** field only shows usable networks in the chosen cluster.
4. Choose a **Template**, which is the operating system. The list only shows templates available in that cluster; if it has only one, it is already chosen. With templates of two or more operating systems, pick the operating system on the left, then the template on the right. With more than six templates, type in **Search templates** to find one by name or description.
5. Choose a **Size**. Each row shows the size's vCPU, RAM and price per hour: Small (1 vCPU, 2 GB RAM), Medium (2 vCPU, 4 GB), Large (4 vCPU, 8 GB) or Extra Large (8 vCPU, 16 GB). No size is chosen for you. The bottom of the form shows the template, size and price per hour you picked.
6. Under **Access (optional)**, choose how you will log in. Nothing here is required: without an SSH key, you log in on the VM's [console](#open-the-vms-console) with a console password, or add a key later on the VM's page ([add an SSH key to a running VM](#add-an-ssh-key-to-a-running-vm)).
   - Click **SSH keys** (it reads *None picked* until you pick one), then tick the keys to add to this VM. See [SSH keys and logging in](/docs/guides/ssh-keys/) to add one first. Picked keys are added for the user `ubuntu`.
   - Fill in **Console password**: 12 to 72 characters, to log in as `ubuntu` on the VM's console. OpenViCloud keeps only a hash of it, so it cannot be shown again. A VM created without one has no console password, and none can be set later.
7. Click **Advanced** to change the stop timeout or add cloud-init user data. It is closed at first; what you type stays when you close it again.
   - **Stop timeout (seconds)**: how long a stop waits for the VM's operating system to shut down before its power is cut ([Stop](#stop-start-and-resume)). 30 to 1800 seconds, default 120. Give a VM that needs time to shut down cleanly, such as a database, a longer one.
   - **Cloud-init user data**: a cloud-init document, such as `#cloud-config`, run on the VM's first boot. Up to 32768 bytes.
8. Click **Create VM**.

Choose a cluster, network, template and size. When you click **Create VM**, the portal checks the name, then the rest in this order, shows only the first problem it finds, and sends nothing. A problem with the stop timeout or the cloud-init user data opens **Advanced**, so you see it:

- A console password shorter than 12 or longer than 72 characters: "The console password must be 12 to 72 characters."
- A stop timeout that is not a whole number of seconds from 30 to 1800: "The stop timeout must be a whole number of seconds from 30 to 1800."
- Cloud-init user data over 32768 bytes: "Cloud-init user data is *n* bytes; the limit is 32768."
- **Cluster**, **Network**, **Template** or **Size** still empty: "Choose a cluster, network, template and size."

The new VM appears in the list with the state **Creating**. When the VM runs, the state changes to **Running** or **Ready**, and the **Private IPv4** field shows the VM's address in the network. The **Public IPv6** column shows the VM's address if its network has public IPv6, or "—" otherwise; on the VM's own page this field shows "Not enabled" instead when the network has no public IPv6. If creation fails, the state is **Failed** with a line explaining why.

## When creating a VM is refused

| Message in the portal | Error code | Meaning |
|---|---|---|
| A VM with this name already exists | `VM_NAME_TAKEN` | You already have another VM with the same name. |
| VM quota exceeded | `VM_QUOTA_EXCEEDED` | You have reached the number of VMs allowed. The default is 10 VMs per account. |
| Selected cluster is no longer available — pick another | `CLUSTER_NOT_FOUND` | The cluster you chose no longer exists. |
| That network is in another cluster — pick a network in this cluster | `NETWORK_CLUSTER_MISMATCH` | The network and the VM must be in the same cluster. |
| Selected size is no longer available — pick another | `VM_OFFERING_NOT_FOUND` | The size you chose no longer exists. |
| Selected template is not available in this cluster yet — pick another | `TEMPLATE_NOT_SYNCED` | The template is not in this cluster yet. |
| Selected template is not available right now — pick another | `TEMPLATE_UNAVAILABLE` | The template cannot be used in this cluster for now. |
| A picked SSH key no longer exists — pick again | `SSH_KEY_NOT_FOUND` | One of the SSH keys you picked was deleted meanwhile. |
| Your account is suspended — contact support to create resources | `TENANT_SUSPENDED` | Your account is suspended. |
| Your account is awaiting admin approval — you can browse but can’t create resources yet | `TENANT_PENDING_APPROVAL` | Your account has not been approved yet. |

A VM you have clicked delete on no longer counts toward the VM limit.

## Log in to a VM

See [SSH keys and logging in](/docs/guides/ssh-keys/) — add a key, pick it when you create a VM or add it afterwards, then use the CLI or a direct SSH connection. To reach the VM without SSH, open its [console](#open-the-vms-console).

## Add an SSH key to a running VM

On the VM's page, click **Add SSH key**. The button is enabled only while the VM is **Running**. Starting a second addition while one is already in progress is refused after you click **Add**, with "The VM must be Running, with no other key addition in progress." shown in the dialog.

1. In the **Add an SSH key** dialog, pick 1 to 10 saved SSH keys — see [SSH keys and logging in](/docs/guides/ssh-keys/) to add one first.
2. Click **Add**.

The portal shows **Adding…**, then **Adding the key to the VM…** while it waits for the VM. When the key is in, it shows **Key added** — and, for a VM created earlier without any SSH key, "The key takes effect once you stop the VM and start it again." (see [Stop, Start and Resume](#stop-start-and-resume)): the portal and the CLI tell you when this applies. If it cannot add the key, the portal shows **Could not add the key** with why: a picked key that was since deleted ("A picked SSH key no longer exists — pick again."), or, right after the VM reaches **Running**, "The VM is still starting, so the key could not be added yet. Try again in a few minutes." while its guest agent is not up yet.

## Open the VM's console

Click **Manage** on the VM's row, then open the **Console** tab. It shows the VM's serial console: a text console with the VM's boot messages and a login prompt. Use it when you cannot reach the VM over SSH, for example after a mistake in its network or SSH settings.

- The tab does not connect by itself: click **Connect**. Each console session counts toward the 5 SSH or console sessions your account can have open at once.
- Log in as `ubuntu` with the console password set when the VM was created: **Console password** in the **Create VM** dialog, `--console-password-stdin` of the [CLI](/docs/guides/cli/), `console_password` in [Terraform](/docs/guides/terraform/), or `consolePassword` in the API. A VM created without one cannot be logged in to here with a password.
- The console opens only while the VM is Running or Ready, with no stop, delete or snapshot waiting. A VM has one console at a time: a second one is refused with "Another console session is open on this VM. Close it, then connect again."
- **Disconnect**, or leaving the tab, ends the session. A session with no activity for 30 minutes is closed. When a session ends while you stay on the tab, the tab keeps what it showed, and offers **Reconnect** while the VM runs.

## Stop, Start and Resume

- **Stop** is available when the VM is Running, Ready, Frozen or Error. Stop asks the VM's operating system to shut down, as a computer's power button does, and waits up to the VM's stop timeout (120 seconds unless you changed it). If the VM has not shut down by then, its power is cut, like pulling the plug, and work not yet saved inside the VM can be lost. A VM in Error cannot shut down cleanly, so Stop cuts its power at once.
- **Start** is available when the VM is Stopped.
- **Resume** replaces Start when the VM is Frozen. This button lets the VM continue running.

While a command is running, the action cell shows **Creating…**, **Stopping…**, **Starting…**, **Deleting…** or **Snapshotting…**, and the Stop/Start buttons are hidden for the moment. A VM stays **Stopping** until its operating system has shut down, or until its stop timeout runs out and its power is cut.

### Change the stop timeout

On the VM's page, the **Overview** tab shows **Stop timeout**. Type a new number of seconds, 30 to 1800, and click **Save**; the portal shows "Stop timeout saved". The new value applies from the next stop: a stop already requested keeps the value it was requested with. A number outside 30 to 1800 shows "The stop timeout must be a whole number of seconds from 30 to 1800." The stop timeout of a deleted VM cannot be changed: "This VM is deleted — its stop timeout can no longer be changed." VMs created before stop timeouts existed have 120 seconds. Over the API the field is `stopTimeoutSeconds`, on `POST /v1/tenant/vms` and `PATCH /v1/tenant/vms/{vmId}`; a value outside 30 to 1800 returns `400 VALIDATION_ERROR`.

## Delete a VM

1. Click **Delete** on the VM's row.
2. Click **Confirm** in the "Delete *VM name*?" dialog.

Delete does not wait for the operating system: it cuts the VM's power, then deletes it. Deleting a VM also deletes all of its snapshots. Volumes attached to the VM are detached and kept; a volume is still billed until its deletion finishes ([volumes](/docs/guides/volume/)), except a volume restored from a backup, which stays free.

You cannot delete a VM yet in three cases:

- The VM is still being created. The **Delete** button is disabled while the VM is **Creating**; wait until it is no longer **Creating**, then delete it.
- A snapshot of the VM is being created or reverted. The VM shows **Snapshotting** and the **Delete** button is disabled. Wait for the snapshot to finish, then delete again.
- A load balancer still sends traffic to this VM: "Cannot delete: a load balancer sends traffic to this VM — remove it from the load balancer first" (code `VM_IS_LOAD_BALANCER_BACKEND`). See [load balancers](/docs/guides/load-balancer/).

## VM snapshots

Click **Manage** on the VM's row, then open the **Snapshots** tab.

**Create a snapshot.** Click **New Snapshot**, enter a name (at most 100 characters), then click **Create**. This button is available when the VM is Running, Ready, Stopped or Frozen. Each VM has at most 3 snapshots by default. When you reach it, the portal shows "Snapshot quota exceeded (max 3 per VM)." (code `VM_SNAPSHOT_QUOTA_EXCEEDED`). Snapshots you have clicked delete on do not count.

**Revert.** The **Revert** button is on a snapshot in the **Available** state when no action is running on it. The snapshot shows **Reverting** until it finishes. Revert brings the VM's disk back to when the snapshot was taken and only touches the disk — the VM's size and the attached volumes do not change. Revert does not stop or start the VM. This only works when the VM is Running, Ready, Stopped or Frozen; otherwise the portal shows "Failed to revert snapshot."

**Delete a snapshot.** Click **Delete** on the snapshot, then click **Confirm**. This button is available when no action is running on the snapshot; a **Failed** or **Not found** snapshot can also be deleted. If a revert or a delete does not go through, the snapshot stays as it was, with a line explaining why.

## VM usage

Click **Manage** on the VM's row, then open the **Monitoring** tab. It shows how much CPU, memory and disk the VM uses over time.

Pick **1h**, **24h** or **7d**; the tab opens on **1h**. Usage is kept for 7 days. In **1h** each point is one reading, taken about once a minute; **24h** averages the readings of each 5 minutes, and **7d** of each 30 minutes. While the tab is open it reads again every minute.

The tab has three cards:

- **CPU**: the share of the VM's vCPUs in use, as a percentage. With several vCPUs, 100% means all of them are busy.
- **Memory**: memory used of the VM's total, for example "1.2 GiB of 3.8 GiB".
- **Disk**: space used on the VM's root filesystem (`/`) out of its size, with a chart of how fast the VM reads from and writes to its disks.

Each card's title shows the latest value. A stretch with no reading is a gap in the line, not a straight line across it.

When there is nothing to show:

- A VM that has just started, or one that was stopped for the whole range, has no reading: "No data yet. Usage appears a few minutes after the VM starts."
- Disk space needs the guest agent running inside the VM; without the agent, memory shows on some VMs and not on others. When a card has no such number in the whole range, it shows "Needs the guest agent inside the VM."; CPU and the disk read and write rates are still shown without the agent.

These numbers are for you to see only: they do not change your bill or your quotas.

## Restored from a backup

If you lose data, the platform team can restore one of your existing VMs or volumes from one of its daily backups as a **new** VM or volume in your account. A VM or volume you have already deleted cannot be restored this way. The original is not changed. The portal shows **Restored · free** next to its name in the VM list, on the VM page and in the volume list.

- It is free of charge and outside your quota until you delete it, also while the VM runs.
- A restored VM starts out Stopped. Each volume attached to the original VM is restored with it and attached to the new VM. Start it when you need it.
- Its operating system is the original's as it was at the backup, with the same hostname and SSH host keys. When started, it has its own MAC and IP address.
- Snapshots you take of it are limited and billed as usual.
- You use and delete it like any other VM or volume. A volume restored with a VM keeps the original volume's name: the volume list shows both, and the label tells them apart.

## When a VM is billed

- Compute is billed by the hour, at the price of the size. A VM is billed when it is Running, Ready, Frozen or Error, and while it is Stopping, until it has stopped.
- A VM in the **Stopped** state is not billed for compute.
- Each snapshot that exists on the infrastructure is billed at a fixed hourly price, which does not depend on size, until the deletion is finished. A snapshot being reverted is still billed.
- Volumes are billed separately, see the [volumes](/docs/guides/volume/) page.
- A VM restored from a backup is not billed for compute, see [Restored from a backup](#restored-from-a-backup).

The hourly price of each VM size is on the [pricing table](/#pricing).
