---
title: Cluster
description: Cluster là nơi VM, network và volume của bạn chạy; tài nguyên muốn dùng chung phải cùng một cluster.
---

Cluster là một cụm máy chủ của OpenViCloud. Mỗi VM, network và volume bạn tạo đều nằm trong đúng một cluster.

## Danh sách cluster

Danh sách cluster bạn chọn được hiện trong ô **Cluster** của các form tạo VM, network và volume. Portal lấy danh sách này từ API `GET /v1/clusters`. API này không cần đăng nhập.

Nếu bạn gửi một cluster không có trong danh sách, OpenViCloud từ chối với lỗi `CLUSTER_NOT_FOUND`. Trong form tạo VM, portal báo: *Cluster đã chọn không còn khả dụng — chọn cluster khác*. Khi đó, hãy chọn một cluster khác trong danh sách.

## Chọn cluster khi tạo tài nguyên

Bạn chọn cluster một lần, lúc tạo tài nguyên. Sau khi tạo, bạn không đổi được cluster của VM, network hay volume.

Trong form **Tạo VM**:

1. Chọn **Cluster** trước.
2. Ô **Mạng** chỉ liệt kê các network đang hoạt động trong cluster đó.
3. Ô **Template** chỉ liệt kê các template có sẵn ở cluster đó. Nếu cluster chưa có template nào, ô này báo *Cluster này chưa có template*.

## Tài nguyên phải cùng cluster

- **VM và network**: VM phải ở cùng cluster với network nó gắn vào. Nếu khác cluster, OpenViCloud từ chối với lỗi `NETWORK_CLUSTER_MISMATCH`. Portal báo: *Mạng này ở cluster khác — chọn một mạng trong cluster này*.
- **Volume và VM**: bạn chỉ gắn được volume vào VM cùng cluster. Hộp thoại **Gắn ổ đĩa** chỉ liệt kê các VM cùng cluster với volume. Nếu gọi API với VM ở cluster khác, bạn nhận lỗi `VOLUME_CLUSTER_MISMATCH`.

## Template theo cluster

Mỗi cluster có danh sách template riêng. Một template có ở cluster này có thể chưa có ở cluster khác. Nếu bạn tạo VM với template chưa có ở cluster đã chọn, bạn nhận lỗi `TEMPLATE_NOT_SYNCED`. Hãy chọn template khác trong danh sách của cluster đó.

Xem thêm: [Cấu hình VM và volume](/vi/docs/concepts/sizes/) · [Mã lỗi](/vi/docs/concepts/error-codes/)
