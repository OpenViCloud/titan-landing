---
title: Use volumes
description: Create a volume, attach it to a VM and detach it, delete a volume, use volume snapshots, and how volumes are billed.
---

A volume is a separate data disk, independent of any VM. All actions are under **Volumes** in the left sidebar. The page is titled **Data Volumes**.

## Create a volume

1. Click **Create Volume**.
2. Fill in **Name**, at most 100 characters.
3. Choose a **Zone**. A volume can only be attached to a VM in the same zone.
4. Choose a **Volume Offering**. There is only one type today: **Standard — Custom size**.
5. Fill in **Size (GB)**, greater than 0.
6. Click **Create volume**.

The new volume shows **Creating**, then **Available** once it exists on the infrastructure. If creation fails, the volume shows **Failed**; click **Delete** to remove it.

Each account has at most 10 volumes by default. When you reach it, the portal shows "Volume quota exceeded (max 10)." (code `VOLUME_QUOTA_EXCEEDED`). Volumes you have clicked delete on, **Failed** volumes and **Not found** volumes do not count.

## Attach a volume to a VM

1. Click **Attach** on the volume's row. This button is available when the volume is **Available**.
2. Choose a VM in the **Attach volume** dialog. The list only has VMs in the same zone, in the Running, Ready, Stopped or Frozen state, and not stopping or being deleted.
3. Click **Attach**.

The volume moves to **Attaching**, then **Attached**. The **Attached to** column shows the VM's name. Each volume is attached to only one VM at a time.

## Detach a volume from a VM

Click **Detach** on the row of a volume in the **Attached** state. The volume moves to **Detaching**, then back to **Available**.

If the volume shows **Attached outside OpenViCloud**, a machine not managed by the portal is using it. In that case the portal does not let you attach, detach or delete this volume.

## Delete a volume

1. Detach the volume from its VM if it is attached.
2. Delete all of the volume's snapshots.
3. Click **Delete**, then click **Confirm**.

If the volume still has snapshots, the portal shows "This volume still has snapshots. Delete its snapshots first, then the volume." (code `VOLUME_HAS_SNAPSHOTS`). If the volume is still attached or an action on it has not finished, the portal shows "Cannot delete yet: the volume is attached or a request is still waiting on it." A **Not found** volume (no longer on the infrastructure) can still be deleted.

When you [delete a VM](/docs/guides/vm/), volumes attached to that VM are detached and kept, not deleted.

## Volume snapshots

Click **Snapshots** on the volume's row to open the snapshot list.

**Create a snapshot.** Click **New Snapshot**, enter a name (at most 100 characters), then click **Create**. This button is available when the volume is **Available** or **Attached** and no action is running. The new snapshot is in the **Creating** state, then moves to **Available**.

Each volume has at most 3 snapshots by default. When you reach it, the portal shows "Snapshot quota exceeded (max 3 per volume)." (code `VOLUME_SNAPSHOT_QUOTA_EXCEEDED`). Snapshots you have clicked delete on do not count.

**Restore.** Restore does not overwrite the original volume. It creates a **new** volume from the snapshot:

1. Click **Restore** on a snapshot in the **Available** state.
2. Enter a name for the new volume.
3. Click **Restore**.

The new volume has the same zone, offering and size as the original volume. The original volume and the snapshot stay as they are. The new volume counts toward the volume limit. If you have reached the limit, the restore is refused and the portal shows "Failed to restore snapshot."

**Delete a snapshot.** Click **Delete** on the snapshot, then click **Confirm**. If an action on the snapshot has not finished, the portal shows "Cannot delete yet: a request is still waiting on this snapshot. Try again in a minute."

## How volumes are billed

- A volume is billed per GB per hour while it exists on the infrastructure (**Available** or **Attached**). A volume detached from a VM is still billed. A volume attached to a Stopped VM is still billed.
- A volume stops being billed when the deletion is finished, not when you click delete. A **Not found** volume is not billed.
- Each snapshot that exists on the infrastructure is billed at a fixed hourly price, which does not depend on size, also until the deletion is finished.

The per-GB volume price is on the [pricing table](/#pricing).
