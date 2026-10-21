---
title: Zone
description: Zone là nơi VM, network và volume của bạn chạy; tài nguyên muốn dùng chung phải cùng một zone.
---

Zone là một cụm máy chủ của OpenViCloud. Mỗi VM, network và volume bạn tạo đều nằm trong đúng một zone.

## Danh sách zone

Danh sách zone bạn chọn được hiện trong ô **Zone** của các form tạo VM, network và volume. Portal lấy danh sách này từ API `GET /v1/zones`. API này không cần đăng nhập.

Nếu bạn gửi một zone không có trong danh sách, OpenViCloud từ chối với lỗi `ZONE_NOT_FOUND`. Trong form tạo VM, portal báo: *Zone đã chọn không còn khả dụng — chọn zone khác*. Khi đó, hãy chọn một zone khác trong danh sách.

## Chọn zone khi tạo tài nguyên

Bạn chọn zone một lần, lúc tạo tài nguyên. Sau khi tạo, bạn không đổi được zone của VM, network hay volume.

Trong form **Tạo VM**:

1. Chọn **Zone** trước.
2. Ô **Mạng** chỉ liệt kê các network đang hoạt động trong zone đó.
3. Ô **Template** chỉ liệt kê các template có sẵn ở zone đó. Nếu zone chưa có template nào, ô này báo *Zone này chưa có template*.

## Tài nguyên phải cùng zone

- **VM và network**: VM phải ở cùng zone với network nó gắn vào. Nếu khác zone, OpenViCloud từ chối với lỗi `NETWORK_ZONE_MISMATCH`. Portal báo: *Mạng này ở zone khác — chọn một mạng trong zone này*.
- **Volume và VM**: bạn chỉ gắn được volume vào VM cùng zone. Hộp thoại **Gắn ổ đĩa** chỉ liệt kê các VM cùng zone với volume. Nếu gọi API với VM ở zone khác, bạn nhận lỗi `VOLUME_ZONE_MISMATCH`.

## Template theo zone

Mỗi zone có danh sách template riêng. Một template có ở zone này có thể chưa có ở zone khác. Nếu bạn tạo VM với template chưa có ở zone đã chọn, bạn nhận lỗi `TEMPLATE_NOT_SYNCED`. Hãy chọn template khác trong danh sách của zone đó.

Xem thêm: [Cấu hình VM và volume](/vi/docs/concepts/sizes/) · [Mã lỗi](/vi/docs/concepts/error-codes/)
