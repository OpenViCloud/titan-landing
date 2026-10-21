---
title: Zones
description: A zone is where your VMs, networks and volumes run; resources that work together must be in the same zone.
---

A zone is a cluster of OpenViCloud servers. Each VM, network and volume you create lives in exactly one zone.

## Zone list

The zones you can choose show in the **Zone** field of the create forms for VMs, networks and volumes. The portal gets this list from the `GET /v1/zones` API. This API does not need you to sign in.

If you send a zone that is not in the list, OpenViCloud refuses with the error `ZONE_NOT_FOUND`. In the create VM form, the portal shows: *Selected zone is no longer available — pick another*. In that case, choose another zone from the list.

## Choose a zone when you create a resource

You choose the zone once, when you create the resource. After it is created, you cannot change the zone of a VM, network or volume.

In the **Create VM** form:

1. Choose the **Zone** first.
2. The **Network** field only lists active networks in that zone.
3. The **Template** field only lists templates available in that zone. If the zone has no templates yet, this field shows *No templates in this zone yet*.

## Resources must be in the same zone

- **VM and network**: a VM must be in the same zone as the network it is attached to. If the zones differ, OpenViCloud refuses with the error `NETWORK_ZONE_MISMATCH`. The portal shows: *That network is in another zone — pick a network in this zone*.
- **Volume and VM**: you can only attach a volume to a VM in the same zone. The **Attach volume** dialog only lists VMs in the same zone as the volume. If you call the API with a VM in another zone, you get the error `VOLUME_ZONE_MISMATCH`.

## Templates per zone

Each zone has its own template list. A template available in one zone may not be in another zone yet. If you create a VM with a template that is not in the chosen zone yet, you get the error `TEMPLATE_NOT_SYNCED`. Choose another template from that zone's list.

See also: [VM and volume sizes](/docs/concepts/sizes/) · [Error codes](/docs/concepts/error-codes/)
