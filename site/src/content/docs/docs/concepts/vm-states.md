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
| `Unknown` | An action on the VM ended, but its state could not be read yet. The list refreshes by itself until it shows the state. |

## Changing state

When you have just clicked a button, the VM shows a changing state until the action finishes:

| Status | Meaning |
|--------|----------|
| `Creating` | The VM is being created. |
| `Starting` | The VM is being turned on. |
| `Stopping` | The VM is being turned off: its operating system is shutting down, or its power is cut once its stop timeout runs out. |
| `Deleting` | The VM is being deleted. |
| `Snapshotting` | A snapshot of the VM is being created or reverted. |

During that time, the action column has a greyed-out button, for example `Stopping…`, and you cannot click **Stop** or **Start**. The list refreshes by itself until the VM reaches its new state.

## Allowed actions

| Action | Available when the VM is |
|----------|-------------------|
| **Stop** | `Running`, `Ready`, `Frozen`, `Error` |
| **Start** | `Stopped` |
| **Resume** | `Frozen` (the **Start** button is renamed **Resume**) |
| Create snapshot | `Running`, `Ready`, `Stopped`, `Frozen` |
| Attach volume | `Running`, `Ready`, `Stopped`, `Frozen`, `Starting` |
| **Add SSH key** ([add an SSH key to a running VM](/docs/guides/vm/#add-an-ssh-key-to-a-running-vm)) | `Running` |
| SSH session ([log in to a VM](/docs/guides/ssh-keys/)) or console session ([the VM console](/docs/guides/vm/#open-the-vms-console)) | `Running` or `Ready` |
| **Delete** | Any state, except `Creating`, `Deleting` and `Snapshotting` |

Some notes:

- **Stop** asks the VM's operating system to shut down and waits up to the VM's stop timeout (120 seconds by default, 30 to 1800); a VM that has not shut down by then has its power cut, like pulling the plug. A VM in `Error` has its power cut at once. Details in the [VM guide](/docs/guides/vm/#stop-start-and-resume).
- You cannot create a snapshot or attach a volume while the VM is `Stopping`, `Deleting` or `Snapshotting`, or when the VM is in `Error`. You cannot create a snapshot while the VM is `Starting`; wait until it has started.
- While a snapshot of the VM is being created or reverted, the VM shows `Snapshotting`. You cannot start, stop or delete it, and you cannot open an SSH or console session to it, until the snapshot is done.
- While the VM is `Creating`, **Delete** is disabled. Wait until it is no longer `Creating`, then delete it.
- If you click Stop, Start or Resume in a state that does not allow it, the portal shows *VM is not in a valid state for this action* (error code `VM_INVALID_STATUS`).

## When the VM changes state by itself

The badge always shows the state the VM is in. For example: if you shut down the operating system from inside the VM, the badge shows `Stopped`. Click **Start** to turn the VM back on.

## States and cost

A VM in `Running`, `Ready`, `Frozen` or `Error` is billed at the hourly price of its size. A VM in `Stopping` is still billed until it has stopped. A VM in `Stopped` is not charged this price. However, volumes attached to the VM and the VM's snapshots are still billed while the VM is `Stopped`. The hourly price of each VM size is on the [pricing table](/#pricing).

See also: [Error codes](/docs/concepts/error-codes/) · [Account quotas](/docs/concepts/quotas/)
