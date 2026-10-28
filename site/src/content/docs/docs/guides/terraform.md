---
title: Terraform
description: Declare networks, firewall rules, SSH keys, VMs, volumes and load balancers in a .tf file and create them with terraform apply, using an API token.
---

The `openvicloud` Terraform provider manages the resources of your [account](/docs/guides/account/) from a `.tf` file: you declare what should exist, and `terraform apply` creates it and `terraform destroy` removes it. It calls the same public API as the portal and the [command-line tool](/docs/guides/cli/), with an [API token](/docs/guides/api-tokens/) instead of a browser login. The source is at [OpenViCloud/terraform-provider-openvicloud](https://github.com/OpenViCloud/terraform-provider-openvicloud).

## What it manages

| Kind | Name |
|---|---|
| Resource | `openvicloud_network`, `openvicloud_firewall_rule`, `openvicloud_ssh_key`, `openvicloud_vm`, `openvicloud_volume`, `openvicloud_volume_attachment`, `openvicloud_load_balancer` |
| Data source | `openvicloud_clusters`, `openvicloud_templates`, `openvicloud_vm_offerings`, `openvicloud_volume_offerings` |

Snapshots and invoices are not in the provider; use the portal.

## Before you start

1. Install [Terraform](https://developer.hashicorp.com/terraform/install).
2. Create an API token on the portal, under **Account → API tokens**, and put it in the environment of the shell that runs Terraform:

```bash
export OPENVICLOUD_TOKEN=ovc_...
```

The provider talks to the OpenViCloud API (`https://api.openvicloud.com`) by default. Set `OPENVICLOUD_API_URL` to point it elsewhere.

3. Pick a cluster and an operating system. The CLI lists both:

```bash
openvicloud cluster list
openvicloud template list
```

## A network and a VM

Put this in `main.tf`:

```hcl
terraform {
  required_providers {
    openvicloud = { source = "openvicloud/openvicloud" }
  }
}

provider "openvicloud" {}

variable "cluster_id" {
  type = string
}

variable "template_id" {
  type = string
}

resource "openvicloud_network" "web" {
  name    = "web"
  cluster_id = var.cluster_id
}

resource "openvicloud_ssh_key" "me" {
  name       = "me"
  public_key = file("~/.ssh/id_ed25519.pub")
}

resource "openvicloud_vm" "web" {
  name           = "web-1"
  cluster_id        = var.cluster_id
  network_id     = openvicloud_network.web.id
  template_id    = var.template_id
  vm_offering_id = "s"
  ssh_key_ids    = [openvicloud_ssh_key.me.id]
}
```

and the values you picked in `terraform.tfvars`:

```hcl
cluster_id     = "<cluster>"
template_id = "<template>"
```

Then:

```bash
terraform init
terraform apply
```

Creating a VM waits until OpenViCloud has finished it, which can take a couple of minutes. When it is done, log in with the CLI:

```bash
openvicloud vm ssh web-1 -- uptime
```

`terraform destroy` removes what the file declares.

## What to know

- A VM is created when it is Running or Ready.
- Only a VM's name changes in place. Any other change replaces the VM.
- Terraform declares what exists, not whether a VM is on. Stop and start a VM with the CLI or the portal; Terraform leaves it as it is.
- To bring something that already exists under Terraform, use `terraform import`, for example `terraform import openvicloud_vm.web <vm id>`.
- A load balancer needs a network created with `enable_public_ipv6 = true`. OpenViCloud refuses to delete a VM a load balancer still sends to, so remove it from `backend_vm_ids` and apply before you replace that VM.
- The same [account limits](/docs/concepts/quotas/) apply as in the portal.
