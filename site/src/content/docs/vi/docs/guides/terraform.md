---
title: Terraform
description: Khai network, firewall rule, SSH key, VM, volume và load balancer trong file .tf rồi tạo bằng terraform apply, dùng token API.
---

Provider Terraform `openvicloud` quản lý tài nguyên trong [tài khoản](/vi/docs/guides/account/) của bạn từ một file `.tf`: bạn khai cái gì cần tồn tại, `terraform apply` tạo ra và `terraform destroy` xoá đi. Provider gọi cùng API công khai với portal và [công cụ dòng lệnh](/vi/docs/guides/cli/), dùng [token API](/vi/docs/guides/api-tokens/) thay cho đăng nhập trình duyệt. Mã nguồn ở [OpenViCloud/terraform-provider-openvicloud](https://github.com/OpenViCloud/terraform-provider-openvicloud).

## Provider quản lý gì

| Loại | Tên |
|---|---|
| Resource | `openvicloud_network`, `openvicloud_firewall_rule`, `openvicloud_ssh_key`, `openvicloud_vm`, `openvicloud_volume`, `openvicloud_volume_attachment`, `openvicloud_load_balancer` |
| Data source | `openvicloud_clusters`, `openvicloud_templates`, `openvicloud_vm_offerings`, `openvicloud_volume_offerings` |

Snapshot và hoá đơn không nằm trong provider; hãy dùng portal.

## Trước khi bắt đầu

1. Cài [Terraform](https://developer.hashicorp.com/terraform/install).
2. Tạo token API trên portal, ở **Tài khoản → Token API**, rồi đặt vào môi trường của shell chạy Terraform:

```bash
export OPENVICLOUD_TOKEN=ovc_...
```

Provider mặc định gọi API của OpenViCloud (`https://api.openvicloud.com`). Đặt `OPENVICLOUD_API_URL` để trỏ sang nơi khác.

3. Chọn một cluster và một hệ điều hành. CLI liệt kê được cả hai:

```bash
openvicloud cluster list
openvicloud template list
```

## Một network và một VM

Đặt đoạn này vào `main.tf`:

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

và các giá trị bạn đã chọn vào `terraform.tfvars`:

```hcl
cluster_id     = "<cluster>"
template_id = "<template>"
```

Rồi chạy:

```bash
terraform init
terraform apply
```

Tạo VM chờ tới khi OpenViCloud làm xong, có thể mất vài phút. Xong thì đăng nhập bằng CLI:

```bash
openvicloud vm ssh web-1 -- uptime
```

`terraform destroy` xoá những gì file đã khai.

## Cần biết

- VM được coi là đã tạo xong khi ở trạng thái Running hoặc Ready.
- Chỉ tên VM đổi tại chỗ. Mọi thay đổi khác thay VM bằng một VM mới, trừ `ssh_key_ids` và `console_password` sau khi import: lần apply kế chỉ ghi chúng vào state.
- Chưa đặt được thời gian dừng từ Terraform: đặt nó ở [tab Tổng quan](/vi/docs/guides/vm/#đổi-thời-gian-dừng) của VM. VM bị Terraform thay nhận lại 120 giây.
- `console_password` đặt mật khẩu của user `ubuntu` trên [console](/vi/docs/guides/vm/#mở-console-của-vm) của VM, 12 đến 72 ký tự. Đây là giá trị nhạy cảm: khai nó là một biến sensitive và đặt giá trị, ví dụ qua `TF_VAR_console_password`, không viết trong file `.tf`. Đổi nó thì VM bị thay.
- Nâng provider từ bản chưa có `console_password` lên bản có nó thì plan sửa tại chỗ mỗi VM một lần, không bao giờ thay VM.
- OpenViCloud không bao giờ trả lại mật khẩu console. Sau `terraform import`, hay sau lần nâng provider đó, lần apply kế chỉ ghi `console_password` vào state: VM giữ mật khẩu console nó đang có. `terraform apply -replace=openvicloud_vm.<tên>` tạo lại VM với mật khẩu mới.
- Terraform khai cái gì tồn tại, không khai VM đang bật hay tắt. Stop và start VM bằng CLI hoặc portal; Terraform để yên.
- Muốn đưa thứ đã có sẵn vào Terraform, dùng `terraform import`, ví dụ `terraform import openvicloud_vm.web <id VM>`.
- Network tạo không có `default_ingress_policy` chặn traffic từ ngoài network đi vào và cho traffic đi ra. Hãy khai một `openvicloud_firewall_rule` cho mỗi cổng muốn vào được — ví dụ Ingress TCP 22 để SSH, và từng target port của load balancer — hoặc đặt `default_ingress_policy = "Allow"` để mọi cổng mở. Chính sách của network đã có không đổi được: đổi nó trong file thì network bị thay.
- Load balancer cần network tạo với `enable_public_ipv6 = true`. OpenViCloud từ chối xoá VM mà load balancer còn gửi tới, nên hãy gỡ VM khỏi `backend_vm_ids` rồi apply trước khi thay VM đó.
- Áp dụng cùng [giới hạn tài khoản](/vi/docs/concepts/quotas/) như trên portal.
