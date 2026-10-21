---
title: VM states
description: What each VM state in the portal means and which actions you can take in each state.
---

The **Virtual Machines** page shows each VM's state as a badge next to its name. This page explains each state and the buttons you can click.

## VM states

| Status | Meaning |
|--------|---------|
| `Running` | The VM is running. |
| `Ready` | The VM is running, and the operating system inside has reported that it is ready. |
| `Stopped` | The VM is turned off. |
| `Frozen` | The VM is paused. |
| `Error` | The VM has an error. |
| `Not found` | OpenViCloud can no longer find this VM on the system. |
| `Failed` | The request to create the VM was refused. The reason shows next to the badge, in the same row. |
| `Unknown` | The portal has no information about the VM's state yet. |

## Changing state

When you have just clicked a button, the VM shows a changing state until the action finishes:

| Status | Meaning |
|--------|----------|
| `Creating` | The VM is being created. |
| `Starting` | The VM is being turned on. |
| `Stopping` | The VM is being turned off. |
| `Deleting` | The VM is being deleted. |

During that time, the action column has a greyed-out button, for example `Stopping…`, and you cannot click **Stop** or **Start**. The list refreshes by itself until the VM reaches its new state.

## Allowed actions

| Action | Available when the VM is |
|----------|-------------------|
| **Stop** | `Running`, `Ready`, `Frozen`, `Error` |
| **Start** | `Stopped` |
| **Resume** | `Frozen` (the **Start** button is renamed **Resume**) |
| Create snapshot, attach volume | `Running`, `Ready`, `Stopped`, `Frozen` |
| SSH session ([log in to a VM](/docs/guides/ssh-keys/)) | `Running` or `Ready`, with no stop or delete waiting |
| **Delete** | Any state, except while `Deleting` |

Some notes:

- **Stop** turns the VM off immediately, like pulling the plug. Shut down important applications inside the VM before you click it.
- You cannot create a snapshot or attach a volume while the VM is `Stopping` or `Deleting`, or when the VM is in `Error`.
- While the VM is still `Creating` and does not exist yet, **Delete** is disabled. If the list is a few seconds old and the click goes through, the portal shows *Cannot delete yet: the VM is still being set up. Try again in a minute.* Try again after about a minute.
- Clicking **Delete** while a snapshot of the VM is being created or restored is refused with the error `VM_SNAPSHOT_IN_PROGRESS`.
- If you click Stop, Start or Resume in a state that does not allow it, the portal shows *VM is not in a valid state for this action* (error code `VM_INVALID_STATUS`).

## When the VM is not in the state you requested

Sometimes the VM is in a different state from your last request. For example: you shut down the operating system from inside the VM. In that case, the badge shows `Stopped`, with the line `requested: Running` next to it. Click **Start** to turn the VM back on.

## States and cost

A VM in `Running`, `Ready`, `Frozen` or `Error` is billed at the hourly price of its size. A VM in `Stopped` is not charged this price. However, volumes attached to the VM and the VM's snapshots are still billed while the VM is `Stopped`. The hourly price of each VM size is on the [pricing table](/#pricing).

See also: [Error codes](/docs/concepts/error-codes/) · [Account quotas](/docs/concepts/quotas/)
