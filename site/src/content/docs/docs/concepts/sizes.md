---
title: VM and volume sizes
description: OpenViCloud's VM sizes, how to choose an operating system template, and the volume type.
---

When you create a VM, you choose two separate things: the **template** decides the operating system, the **size** decides how powerful the VM is. The two choices are independent: any template works with any size.

## VM sizes

OpenViCloud has four sizes. In the **Size** field of the **Create VM** form, each size shows as `Medium — 2 vCPU · 4 GB`.

| Size | vCPU | RAM |
|------|------|-----|
| Small | 1 | 2 GB |
| Medium | 2 | 4 GB |
| Large | 4 | 8 GB |
| Extra Large | 8 | 16 GB |

The price of each size is in the [pricing table](/#pricing).

If the size you chose no longer exists, OpenViCloud refuses with the error `VM_OFFERING_NOT_FOUND`. The portal shows: *Selected size is no longer available — pick another*.

## Operating system templates

A template tells which operating system the VM runs. The **Template** field shows the template name and the operating system, as `<name> — <operating system>`.

The template list depends on the [zone](/docs/concepts/zone/) you choose. You must choose the zone first, then you can choose a template.

Two errors can happen when you choose a template:

- `TEMPLATE_NOT_SYNCED`: the template is not in this zone yet. The portal shows *Selected template is not available in this zone yet — pick another*.
- `TEMPLATE_UNAVAILABLE`: the template cannot be used in this zone for now. The portal shows *Selected template is not available right now — pick another*.

## Volumes

A volume is a disk you create separately and then attach to a VM. OpenViCloud has a single volume type, **Standard**.

In the create volume form:

1. Choose a **Zone**.
2. In the **Volume Offering** field, choose `Standard — Custom size`.
3. Enter the size in the **Size (GB)** field. This field is required and must be greater than 0.

The volume price depends on its size, see the [pricing table](/#pricing).

See also: [Account quotas](/docs/concepts/quotas/)
