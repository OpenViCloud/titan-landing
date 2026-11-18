---
title: Giới hạn hiện tại
description: Những gì OpenViCloud chưa làm được hôm nay — đọc trước khi tạo VM.
---

OpenViCloud đang hoàn thiện. Trang này liệt kê những gì **chưa** dùng được, để bạn không mất công thử.

## VM chưa ra được Internet qua IPv4

VM của bạn nhận một địa chỉ IPv4 trong [network](/vi/docs/guides/network/) mà nó gắn vào. Địa chỉ này chỉ dùng để nói chuyện với các VM khác trên cùng network: không có NAT, không có đường ra Internet qua IPv4, và network cũng không nhận kết nối từ Internet vào qua IPv4.

VM chỉ ra được Internet qua IPv6, và chỉ trên network được tạo có bật IPv6 công khai. Xem [IPv6 công khai](/vi/docs/guides/public-ipv6/) để biết cách tạo.

## Rule firewall chưa chặn gì, trừ khi bạn đặt chính sách deny

Portal có nút **Tường lửa** trên mỗi network để thêm rule, và mỗi rule là một rule **cho phép** (allow). Chính sách mặc định của network quyết định traffic không khớp rule nào đi về đâu.

Network tạo từ portal có chính sách mặc định là Allow cho cả hai chiều, và portal chưa có ô để đổi. Trên network như vậy, mọi traffic vào và ra đều được cho phép — trên network có bật IPv6 công khai, mọi cổng của mọi VM trên đó đều mở ra Internet.

Network tạo với chính sách mặc định deny (qua API, hay trong [Terraform](/vi/docs/guides/terraform/)) sẽ bỏ mọi traffic vào và ra, trừ những gì rule cho phép.

## Chưa nạp tiền được trên portal

Trong giai đoạn beta, portal chưa có cách nạp tiền vào ví. OpenViCloud cộng tiền vào ví của bạn. Cần thêm thì [mở issue](https://github.com/OpenViCloud/titan-support/issues/new/choose) ở `OpenViCloud/titan-support` trên GitHub và ghi **Mã tenant** ở trang **Hồ sơ**. Issue là công khai: đừng ghi email hay dữ liệu cá nhân nào khác.
