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
| `Stopped` | The VM is turned off. A VM whose operating system you shut down from inside also shows `Stopped`. |
| `Frozen` | The VM is paused. |
| `Error` | The VM has an error. |
| `Not found` | OpenViCloud can no longer find this VM on the infrastructure. |
| `Failed` | The VM could not be created: the request gave up before the VM existed. The reason shows next to the badge, in the same row. |
| `Unknown` | The VM was created, but its state could not be read yet. The list refreshes by itself until it shows the state. |

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
| Create snapshot, attach volume | `Running`, `Ready`, `Stopped`, `Frozen`, `Starting` |
| SSH session ([log in to a VM](/docs/guides/ssh-keys/)) | `Running` or `Ready` |
| **Delete** | Any state, except `Creating` and `Deleting` |

Some notes:

- **Stop** turns the VM off immediately, like pulling the plug. Shut down important applications inside the VM before you click it.
- You cannot create a snapshot or attach a volume while the VM is `Stopping` or `Deleting`, or when the VM is in `Error`.
- While the VM is `Creating`, **Delete** is disabled. Wait until the VM has been created, then delete it.
- Clicking **Delete** while a snapshot of the VM is being created or reverted is refused with the error `VM_SNAPSHOT_IN_PROGRESS`.
- If you click Stop, Start or Resume in a state that does not allow it, the portal shows *VM is not in a valid state for this action* (error code `VM_INVALID_STATUS`).

## When the VM changes state by itself

The badge always shows the state the VM is in. For example: if you shut down the operating system from inside the VM, the badge shows `Stopped`. Click **Start** to turn the VM back on.

## States and cost

A VM in `Running`, `Ready`, `Frozen` or `Error` is billed at the hourly price of its size. A VM in `Stopped` is not charged this price. However, volumes attached to the VM and the VM's snapshots are still billed while the VM is `Stopped`. The hourly price of each VM size is on the [pricing table](/#pricing).

See also: [Error codes](/docs/concepts/error-codes/) · [Account quotas](/docs/concepts/quotas/)
