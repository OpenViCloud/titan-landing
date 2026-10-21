---
title: Cấu hình VM và volume
description: Các cấu hình (size) VM, cách chọn template hệ điều hành, và loại volume của OpenViCloud.
---

Khi tạo VM, bạn chọn hai thứ riêng biệt: **template** quyết định hệ điều hành, **size** quyết định VM mạnh tới đâu. Hai lựa chọn này độc lập với nhau: template nào cũng dùng được với size nào.

## Size của VM

OpenViCloud có bốn size. Trong ô **Cấu hình** của form **Tạo VM**, mỗi size hiện theo dạng `Medium — 2 vCPU · 4 GB`.

| Size | vCPU | RAM |
|------|------|-----|
| Small | 1 | 2 GB |
| Medium | 2 | 4 GB |
| Large | 4 | 8 GB |
| Extra Large | 8 | 16 GB |

Giá của từng size nằm trong [bảng giá](/vi/#pricing).

Nếu size bạn chọn không còn tồn tại, OpenViCloud từ chối với lỗi `VM_OFFERING_NOT_FOUND`. Portal báo: *Cấu hình đã chọn không còn khả dụng — chọn cấu hình khác*.

## Template hệ điều hành

Template cho biết VM chạy hệ điều hành gì. Ô **Template** hiện tên template và hệ điều hành, theo dạng `<tên> — <hệ điều hành>`.

Danh sách template phụ thuộc vào [zone](/vi/docs/concepts/zone/) bạn chọn. Bạn phải chọn zone trước, rồi mới chọn được template.

Hai lỗi có thể gặp khi chọn template:

- `TEMPLATE_NOT_SYNCED`: template chưa có ở zone này. Portal báo *Template đã chọn chưa có ở zone này — chọn template khác*.
- `TEMPLATE_UNAVAILABLE`: template tạm thời không dùng được ở zone này. Portal báo *Template đã chọn hiện không khả dụng — chọn template khác*.

## Volume

Volume là ổ đĩa bạn tạo riêng rồi gắn vào VM. OpenViCloud có một loại volume duy nhất là **Standard**.

Trong form tạo volume:

1. Chọn **Zone**.
2. Ở ô **Cấu hình ổ đĩa**, chọn `Standard — Dung lượng tuỳ chọn`.
3. Nhập dung lượng vào ô **Dung lượng (GB)**. Ô này bắt buộc và phải lớn hơn 0.

Giá volume tính theo dung lượng, xem [bảng giá](/vi/#pricing).

Xem thêm: [Giới hạn tài khoản](/vi/docs/concepts/quotas/)
