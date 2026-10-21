---
title: Error codes
description: The error codes you may see when using the OpenViCloud portal or API, what they mean and what to do.
---

When a request is refused, OpenViCloud returns a JSON body with a `code` field, for example `VM_QUOTA_EXCEEDED`. The tables below list the codes you may see, grouped by topic.

## Account and requests

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `VALIDATION_ERROR` | 400 | The data you sent is not valid, for example a name is too long or a required field is missing. | Read the `title` field to see which field is wrong, fix it and send again. |
| `IDEMPOTENCY_KEY_REQUIRED` | 400 | An API request that creates a resource is missing the `Idempotency-Key` header. | Add the `Idempotency-Key` header with a new value for each create. |
| `IDEMPOTENCY_KEY_REUSED` | 422 | You reused an old `Idempotency-Key` for a request with different content. | Use a new key. |
| `IDEMPOTENCY_IN_PROGRESS` | 409 | A request with the same `Idempotency-Key` is being processed. | Wait a moment, then send exactly that request again, with the same key. |
| `REQUEST_IN_PROGRESS` | 409 | Two identical requests arrived at the same time, for example a double click on the delete button. The first request is still carried out. | Nothing to do. Reload the page to see the result. |
| `TENANT_PENDING_APPROVAL` | 403 | Your account is waiting for approval. You cannot create or change anything yet. | Wait for OpenViCloud to approve it. |
| `TENANT_SUSPENDED` | 403 | Your account is suspended. You cannot change anything. | — |
| `NOT_A_MEMBER` | 403 | You do not belong to any account. | Sign in with an account that has one, or [sign up](/docs/guides/sign-up/). |
| `INTERNAL_ERROR` | 500 | A system error. | Try again in a few minutes. |

These two account states (`TENANT_PENDING_APPROVAL`, `TENANT_SUSPENDED`) are returned with a body of `code` and `message`; unlike the other codes on this page, there is no `title` field to read.

## Zones, sizes and templates

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `ZONE_NOT_FOUND` | 404 | The zone you chose does not exist. | Choose a zone from the list. |
| `VM_OFFERING_NOT_FOUND` | 404 | The VM size you chose does not exist. | Choose another size. |
| `TEMPLATE_NOT_FOUND` | 404 | The template you chose does not exist. | Choose another template. |
| `TEMPLATE_NOT_SYNCED` | 422 | The template is not in the VM's zone yet. | Choose another template from that zone's list. |
| `TEMPLATE_UNAVAILABLE` | 422 | The template cannot be used in this zone for now. | Choose another template, or try again later. |

## VMs, VM snapshots and SSH sessions

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `VM_QUOTA_EXCEEDED` | 422 | You have used up the number of VMs allowed. | Delete some VMs, see [quotas](/docs/concepts/quotas/). |
| `VM_NAME_TAKEN` | 409 | You already have another VM with the same name. | Choose another name. |
| `VM_NOT_FOUND` | 404 | The VM does not exist, or does not belong to your account. | Reload the VM list. |
| `VM_INVALID_STATUS` | 422 | The VM is in a state that does not allow this action. This also happens when you try to open an SSH session to a VM that is not Running or Ready, or that has a stop or delete request waiting. | See [VM states](/docs/concepts/vm-states/), and wait for the VM to reach a suitable state. |
| `VM_AGENT_NOT_READY` | 422 | You opened an SSH session while the VM is still starting. | Wait a minute and try again. |
| `VM_SESSION_LIMIT_REACHED` | 422 | Your account already has 5 SSH sessions open. | Close one, then try again. |
| `VM_IS_LOAD_BALANCER_BACKEND` | 422 | You tried to delete a VM that a load balancer not yet deleted still sends traffic to. | Remove the VM from the load balancer first. |
| `VM_SNAPSHOT_QUOTA_EXCEEDED` | 422 | The VM already has the maximum number of snapshots. | Delete some of that VM's snapshots. |
| `VM_SNAPSHOT_NOT_FOUND` | 404 | The snapshot does not exist, or does not belong to this VM. | Reload the snapshot list. |
| `VM_SNAPSHOT_INVALID_STATE` | 422 | The snapshot is not ready to be restored or deleted. | Wait for the action running on the snapshot to finish, then try again. |
| `VM_SNAPSHOT_IN_PROGRESS` | 422 | The VM cannot be deleted because one of its snapshots is being created or restored. | Wait for that to finish, then delete again. |

## Networks, firewall and IPv6

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `NETWORK_QUOTA_EXCEEDED` | 422 | You have used up the number of networks allowed. | Delete some networks, see [quotas](/docs/concepts/quotas/). |
| `NETWORK_NAME_TAKEN` | 409 | You already have another network with the same name. | Choose another name. |
| `NETWORK_CIDR_OVERLAP` | 422 | The CIDR range you entered overlaps a network you already have. | Choose another CIDR range. |
| `NETWORK_NOT_FOUND` | 404 | The network does not exist, or does not belong to your account. | Reload the network list. |
| `NETWORK_NOT_ACTIVE` | 422 | The network is not created yet, so a VM cannot be attached to it. | Wait for the network to be created, then create the VM. |
| `NETWORK_ZONE_MISMATCH` | 422 | The network is in a different zone from the VM. | Choose a network in the same [zone](/docs/concepts/zone/). |
| `NETWORK_NOT_EMPTY` | 422 | The network still has VMs, or still has load balancers that are not deleted, so it cannot be deleted. | Delete the VMs and load balancers on the network first. |
| `NETWORK_INVALID_STATE` | 422 | The network is in a state that does not allow this action, for example it is not created yet. | Wait for the network to be created, then try again. |
| `FIREWALL_QUOTA_EXCEEDED` | 422 | The network already has the maximum number of firewall rules. | Delete some rules on that network. |
| `FIREWALL_NETWORK_NOT_READY` | 422 | The network is not created yet, so firewall rules cannot be added. | Wait for the network to be created, then add the rule. |
| `FIREWALL_RULE_NOT_READY` | 422 | The rule is still being created, so it cannot be deleted. | Wait for the rule to be created, then delete it. |
| `FIREWALL_RULE_INVALID_STATE` | 422 | The rule is in a state where it cannot be deleted. | Reload the page to see the rule's new state. |
| `FIREWALL_RULE_NOT_FOUND` | 404 | The rule does not exist, or belongs to another network. | Reload the rule list. |
| `IPV6_QUOTA_EXCEEDED` | 422 | You have used up the number of networks with public IPv6 enabled. | Delete a network that has public IPv6, or create this network without it. |
| `IPV6_NOT_AVAILABLE` | 422 | The zone has no public IPv6 available, or no free address range is left in that zone. | Choose another zone, or create the network without public IPv6. |
| `IPV6_ALLOCATION_CONFLICT` | 409 | Two networks in the same zone requested public IPv6 at the same instant and were given the same address range. | Try creating the network again. |

## Volumes and volume snapshots

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `VOLUME_OFFERING_NOT_FOUND` | 404 | The volume type you chose does not exist. | Choose a volume type from the list. |
| `VOLUME_QUOTA_EXCEEDED` | 422 | You have used up the number of volumes allowed. | Delete some volumes, see [quotas](/docs/concepts/quotas/). |
| `VOLUME_NOT_FOUND` | 404 | The volume does not exist, or does not belong to your account. | Reload the volume list. |
| `VOLUME_INVALID_STATE` | 422 | The volume is in a state that does not allow this action, for example deleting a volume still attached to a VM, or attaching, detaching or deleting a volume that a machine outside the portal is using. | Wait for the volume to finish its current action, or detach the volume from the VM first. |
| `VOLUME_HAS_SNAPSHOTS` | 422 | The volume still has snapshots, so it cannot be deleted. | Delete the volume's snapshots first. |
| `VOLUME_ZONE_MISMATCH` | 422 | The volume and the VM are in two different zones. | Choose a VM in the same [zone](/docs/concepts/zone/) as the volume. |
| `VOLUME_SNAPSHOT_QUOTA_EXCEEDED` | 422 | The volume already has the maximum number of snapshots. | Delete some of that volume's snapshots. |
| `VOLUME_SNAPSHOT_NOT_FOUND` | 404 | The snapshot does not exist, or does not belong to this volume. | Reload the snapshot list. |
| `VOLUME_SNAPSHOT_INVALID_STATE` | 422 | The snapshot is not ready to be restored or deleted. | Wait for the snapshot to be created, then try again. |

## SSH keys

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `SSH_KEY_EXISTS` | 409 | You already saved this exact key. | Use the key you already have, or generate a new one. |
| `SSH_KEY_NAME_TAKEN` | 409 | You already have another SSH key with this name. | Choose another name. |
| `SSH_KEY_NOT_FOUND` | 404 | The key does not exist, or does not belong to your account. This also happens when you create a VM that refers to an SSH key id like this. | Reload the SSH keys list, see [SSH keys](/docs/guides/ssh-keys/). |
| `SSH_KEY_QUOTA_EXCEEDED` | 422 | You have used up the number of SSH keys allowed. | Delete a key you no longer need, see [quotas](/docs/concepts/quotas/). |

## API tokens

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `API_TOKEN_NAME_TAKEN` | 409 | You already have another API token with this name. | Choose another name. |
| `API_TOKEN_NOT_FOUND` | 404 | The token does not exist, or does not belong to your account. Deleting a token twice also gives this. | Reload the API tokens list, see [API tokens](/docs/guides/api-tokens/). |
| `API_TOKEN_QUOTA_EXCEEDED` | 422 | You already have 20 API tokens; expired ones count until deleted. | Delete a token you no longer need. |

## Load balancers

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `LOAD_BALANCER_NOT_FOUND` | 404 | The load balancer does not exist, or does not belong to your account. | Reload the load balancers list. |
| `LOAD_BALANCER_NAME_TAKEN` | 409 | You already have another load balancer with the same name. | Choose another name. |
| `LOAD_BALANCER_QUOTA_EXCEEDED` | 422 | You have used up the number of load balancers allowed. | Delete a load balancer you no longer need, see [quotas](/docs/concepts/quotas/). |
| `LOAD_BALANCER_NEEDS_PUBLIC_IPV6` | 422 | The network you chose does not have public IPv6 enabled. | Choose a network with public IPv6, see [public IPv6](/docs/guides/public-ipv6/). |
| `LOAD_BALANCER_BACKEND_INVALID` | 422 | One of the VMs you chose as a backend is not one of your VMs on that network. | Choose a VM of yours that is on the same network. |
| `LOAD_BALANCER_INVALID_STATE` | 422 | The load balancer is in a state that does not allow this action, or the network has no free address left for a new load balancer. | Reload the page to see its current state. |
| `LOAD_BALANCER_VIP_CONFLICT` | 409 | Two load balancers on the same network requested an address at the same instant and were given the same one. | Try again. |

## Invoices

| Code | HTTP | Meaning | What to do |
|----|------|---------|----------------|
| `INVOICE_NOT_FOUND` | 404 | The invoice does not exist, or does not belong to your account. | Reload the invoice list. |
| `INVOICE_INVALID_STATE` | 422 | The invoice has already been paid, so it can no longer be paid from the wallet. | Nothing to do. |
| `INVOICE_WALLET_INSUFFICIENT` | 422 | Your wallet balance is not enough to pay the whole invoice. Nothing was taken. The `title` field says how much is missing. | — |
| `INVOICE_PAYMENT_CONFLICT` | 409 | This payment could not start, or another payment is already being processed. This click did not take any money. | Reload the invoice to see its new state before you click again. |
