---
title: IPv6 công khai
description: Cho VM của một network địa chỉ IPv6 công khai, mở các cổng cần dùng bằng firewall rule, và cách tính hạn mức.
---

Mỗi network đều có thể có một dải địa chỉ IPv6 công khai riêng. VM trên network đó khi ấy có địa chỉ trên Internet qua IPv6, và ra được Internet qua nó.

Network `default` của tài khoản bạn (xem [network mặc định của bạn](/vi/docs/guides/network/#network-mặc-định-của-bạn)) đã bật sẵn IPv6 công khai, nếu tài khoản bạn có network này — nên có thể bạn đã có sẵn một network bật IPv6 công khai mà không cần tự tạo.

**Network mới chặn chiều vào cho tới khi bạn mở cổng.** Traffic từ Internet đi vào bị bỏ, còn VM vẫn ra ngoài được. Hãy thêm [firewall rule](/vi/docs/guides/firewall/) cho mỗi cổng bạn muốn vào được từ Internet — ví dụ Ingress TCP 22 từ `::/0` để SSH. Network tạo từ portal trước khi có mặc định này giữ mọi cổng của mọi VM mở cho cả Internet, và rule không đóng được cổng nào ở đó (xem [giới hạn hiện tại](/vi/docs/known-limitations/)); trên network như vậy, hãy tự bảo vệ từng VM, ví dụ bằng tường lửa bên trong hệ điều hành guest.

## Bật lúc tạo network

**Bật IPv6 công khai** là ô đánh dấu trong hộp thoại [tạo network](/vi/docs/guides/network/), mặc định tắt. Bạn không bật hay tắt lại được sau khi network đã tạo — quyết định ngay lúc tạo.

Nếu bạn cũng điền **CIDR** trong khi ô này đang được đánh dấu, CIDR đó phải nằm trong `10.0.0.0/8`, `172.16.0.0/12` hoặc `192.168.0.0/16`. Nếu không, portal báo "Khi bật IPv6 công khai, CIDR phải nằm trong 10.0.0.0/8, 172.16.0.0/12 hoặc 192.168.0.0/16".

## Bạn nhận được gì

Dải địa chỉ `/64` của network được giữ ngay khi bạn gửi form, và dòng của network hiện nó ở một dòng dưới cột **CIDR** ngay khi dòng đó tải xong. Mỗi VM trên network nhận một địa chỉ IPv6 công khai riêng trong dải `/64` ấy. Địa chỉ này hiện ở cột **IPv6 công khai** trong danh sách VM và trên trang của VM đó; có thể mất vài phút để hiện ra sau khi VM khởi động.

VM ra được Internet qua IPv6. IPv4 vẫn không có đường ra Internet, kể cả trên network đã bật IPv6 công khai.

## Hạn mức

Mặc định, một tài khoản có thể bật IPv6 công khai cho tối đa 10 network cùng lúc. Hạn mức này hiện ở thẻ Hạn mức trên trang Tổng quan dưới tên **IPv6 công khai**. Một network thôi tính vào hạn mức này ngay khi bạn bấm xoá, không phải khi việc xoá xong.

Hạn mức network mặc định là 2, nên trên thực tế bạn sẽ chạm hạn mức network trước khi chạm hạn mức IPv6 công khai.

## Khi bị từ chối

| Thông báo trên portal | Mã lỗi | Ý nghĩa |
|---|---|---|
| Đã vượt hạn mức IPv6 công khai — xoá bớt một mạng có IPv6 công khai trước | `IPV6_QUOTA_EXCEEDED` | Bạn đã có đủ số network bật IPv6 công khai mà tài khoản được phép (mặc định 10). |
| Cluster này chưa có IPv6 công khai | `IPV6_NOT_AVAILABLE` | Cluster chưa cấu hình IPv6 công khai, hoặc mọi dải `/64` của cluster (255 dải) đã dùng hết. |

Dải `/64` của một network được giữ tới khi việc xoá network đó xong, không phải ngay khi bạn bấm xoá. Network hiện trạng thái **Failed** là network chưa kịp tạo trên hạ tầng, và `/64` của nó đã được trả ngay.

## Chi phí

IPv6 công khai không tính thêm vào hoá đơn của bạn.
