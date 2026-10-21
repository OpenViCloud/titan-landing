---
title: Giới hạn tài khoản
description: Số VM, network, volume, snapshot, firewall rule, SSH key, load balancer và network có IPv6 công khai tối đa mà một tài khoản OpenViCloud được dùng.
---

Mỗi tài khoản OpenViCloud có chín giới hạn. Khi bạn đã dùng hết một giới hạn, OpenViCloud từ chối tạo thêm và trả về mã lỗi tương ứng.

## Giới hạn mặc định

| Giới hạn | Mặc định | Tính theo | Mã lỗi khi vượt |
|----------|----------|-----------|-----------------|
| Số VM | 10 | tài khoản | `VM_QUOTA_EXCEEDED` |
| Số network | 1 | tài khoản | `NETWORK_QUOTA_EXCEEDED` |
| Số volume | 10 | tài khoản | `VOLUME_QUOTA_EXCEEDED` |
| Số network có IPv6 công khai | 10 | tài khoản | `IPV6_QUOTA_EXCEEDED` |
| Số SSH key | 20 | tài khoản | `SSH_KEY_QUOTA_EXCEEDED` |
| Số load balancer | 5 | tài khoản | `LOAD_BALANCER_QUOTA_EXCEEDED` |
| Snapshot của một VM | 3 | mỗi VM | `VM_SNAPSHOT_QUOTA_EXCEEDED` |
| Snapshot của một volume | 3 | mỗi volume | `VOLUME_SNAPSHOT_QUOTA_EXCEEDED` |
| Firewall rule của một network | 20 | mỗi network | `FIREWALL_QUOTA_EXCEEDED` |

Tất cả các mã lỗi trên đều trả về HTTP `422`.

Ba giới hạn tính theo từng tài nguyên (snapshot VM, snapshot volume, firewall rule) được tính riêng cho từng VM, từng volume, từng network. Ví dụ: bạn có 2 VM thì mỗi VM được giữ tối đa 3 snapshot.

Giới hạn IPv6 đếm **network**, không đếm VM: nó đếm bao nhiêu network của bạn được tạo với ô **Bật IPv6 công khai** đã tick, giống cách giới hạn network đếm số network.

## Cái gì được tính

- **VM, network, firewall rule, load balancer**: được tính khi đã tạo xong, hoặc đang trong lúc tạo. Không tính những cái bạn đã bấm xoá.
- **Volume**: được tính trừ khi bạn đã bấm xoá, nó đã bị xoá, hoặc nó đang ở trạng thái lỗi.
- **Snapshot**: được tính khi đang tạo hoặc đã sẵn sàng. Snapshot bạn đã bấm xoá thì không tính nữa.
- **SSH key**: được tính là mọi key bạn đã lưu. Xoá một key là xoá ngay và vĩnh viễn, nên key đã xoá không bao giờ còn tính.

Nghĩa là khi yêu cầu xoá được chấp nhận, chỗ đó được trả lại cho giới hạn ngay, không cần chờ xoá xong. Riêng SSH key, việc xoá là tức thì.

## Giới hạn bằng 0

Giới hạn bằng `0` nghĩa là **không được tạo cái nào**, không phải "không giới hạn".

## Xem giới hạn trong portal

Trang **Hồ sơ**, mục **Hạn mức**, hiện hai giới hạn: **Giới hạn VM** và **Giới hạn mạng**.

Trang **Tổng quan** có thẻ **Hạn mức** riêng, hiện thanh đã dùng/giới hạn cho bốn giới hạn: **VM**, **Mạng**, **Ổ đĩa** và **IPv6 công khai**.

Giới hạn SSH key và load balancer hiện chưa hiện ở trang Hồ sơ hay Tổng quan. Xem [tài khoản của bạn](/vi/docs/guides/account/) để biết vị trí các trang này.

## Thay đổi giới hạn

OpenViCloud có thể thay đổi bất kỳ giới hạn nào trong chín giới hạn cho tài khoản của bạn. Nếu giới hạn bị hạ xuống thấp hơn số bạn đang dùng, không tài nguyên nào bị xoá. Bạn chỉ không tạo thêm được cho tới khi số đang dùng thấp hơn giới hạn.

Xem thêm: [Mã lỗi](/vi/docs/concepts/error-codes/)
