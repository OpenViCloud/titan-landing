---
title: Clusters
description: A cluster is where your VMs, networks and volumes run; resources that work together must be in the same cluster.
---

A cluster is a group of OpenViCloud servers. Each VM, network and volume you create lives in exactly one cluster.

## Cluster list

The clusters you can choose show in the **Cluster** field of the create forms for VMs, networks and volumes. The portal gets this list from the `GET /v1/clusters` API. This API does not need you to sign in.

If you send a cluster that is not in the list, OpenViCloud refuses with the error `CLUSTER_NOT_FOUND`. In the create VM form, the portal shows: *Selected cluster is no longer available — pick another*. In that case, choose another cluster from the list.

## Choose a cluster when you create a resource

You choose the cluster once, when you create the resource. After it is created, you cannot change the cluster of a VM, network or volume.

In the **Create VM** form:

1. Choose the **Cluster** first.
2. The **Network** field only lists active networks in that cluster.
3. The **Template** field only lists templates available in that cluster. If the cluster has no templates yet, this field shows *No templates in this cluster yet*.

## Resources must be in the same cluster

- **VM and network**: a VM must be in the same cluster as the network it is attached to. If the clusters differ, OpenViCloud refuses with the error `NETWORK_CLUSTER_MISMATCH`. The portal shows: *That network is in another cluster — pick a network in this cluster*.
- **Volume and VM**: you can only attach a volume to a VM in the same cluster. The **Attach volume** dialog only lists VMs in the same cluster as the volume. If you call the API with a VM in another cluster, you get the error `VOLUME_CLUSTER_MISMATCH`.

## Templates per cluster

Each cluster has its own template list. A template available in one cluster may not be in another cluster yet. If you create a VM with a template that is not in the chosen cluster yet, you get the error `TEMPLATE_NOT_SYNCED`. Choose another template from that cluster's list.

See also: [VM and volume sizes](/docs/concepts/sizes/) · [Error codes](/docs/concepts/error-codes/)
