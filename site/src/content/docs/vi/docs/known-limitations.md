---
title: Giới hạn hiện tại
description: Những gì OpenViCloud chưa làm được hôm nay — đọc trước khi tạo VM.
---

OpenViCloud đang hoàn thiện. Trang này liệt kê những gì **chưa** dùng được, để bạn không mất công thử.

## VM chưa ra được Internet qua IPv4

VM của bạn nhận một địa chỉ IPv4 trong [network](/vi/docs/guides/network/) mà nó gắn vào. Địa chỉ này chỉ dùng để nói chuyện với các VM khác trên cùng network: không có NAT, không có đường ra Internet qua IPv4, và network cũng không nhận kết nối từ Internet vào qua IPv4.

VM chỉ ra được Internet qua IPv6, và chỉ trên network được tạo có bật IPv6 công khai. Xem [IPv6 công khai](/vi/docs/guides/public-ipv6/) để biết cách tạo.

## Không đổi được chính sách mặc định của network

Chính sách mặc định của network quyết định traffic không khớp [rule firewall](/vi/docs/guides/firewall/) nào đi về đâu. Nó được đặt lúc tạo network và không đổi được về sau.

- Network mới chặn traffic từ ngoài network đi vào và cho traffic đi ra. Muốn vào VM từ Internet, hãy thêm rule — ví dụ Ingress TCP 22 để SSH.
- Chặn chiều vào không chặn traffic giữa các VM cùng network.
- Network tạo trước khi có mặc định này mà không đặt chính sách — mọi network tạo từ portal trước đó — cho phép mọi traffic cả hai chiều. Trên network như vậy có bật IPv6 công khai, mọi cổng của mọi VM đều mở ra Internet, và rule không đóng được cổng nào. Muốn có mặc định mới, hãy tạo network mới và tạo VM mới trên đó.

## Chưa nạp tiền được trên portal

Trong giai đoạn beta, portal chưa có cách nạp tiền vào ví. OpenViCloud cộng tiền vào ví của bạn. Cần thêm thì [mở issue](https://github.com/OpenViCloud/titan-support/issues/new/choose) ở `OpenViCloud/titan-support` trên GitHub và ghi **Mã tenant** ở trang **Hồ sơ**. Issue là công khai: đừng ghi email hay dữ liệu cá nhân nào khác.
