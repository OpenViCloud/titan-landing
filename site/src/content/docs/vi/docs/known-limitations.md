---
title: Giới hạn hiện tại
description: Những gì OpenViCloud chưa làm được hôm nay — đọc trước khi tạo VM.
---

OpenViCloud đang hoàn thiện. Trang này liệt kê những gì **chưa** dùng được, để bạn không mất công thử.

## VM chưa ra được Internet qua IPv4

VM của bạn nhận một địa chỉ IPv4 trong [network](/vi/docs/guides/network/) mà nó gắn vào. Địa chỉ này chỉ dùng để nói chuyện với các VM khác trên cùng network: không có NAT, không có đường ra Internet qua IPv4, và network cũng không nhận kết nối từ Internet vào qua IPv4.

VM chỉ ra được Internet qua IPv6, và chỉ trên network được tạo có bật IPv6 công khai. Xem [IPv6 công khai](/vi/docs/guides/public-ipv6/) để biết cách tạo.

## Portal chưa có nút SSH hay console

Bản thân portal không có nút mở shell và không có console web cho VM. Để đăng nhập vào VM, hãy dùng CLI hoặc kết nối SSH trực tiếp — xem [SSH key và đăng nhập](/vi/docs/guides/ssh-keys/). Hộp thoại **Tạo VM** không có ô nhập mật khẩu hay script cloud-init; SSH key chỉ chọn được lúc tạo VM, không thêm được vào VM đã có từ portal.

## Rule firewall chưa chặn thêm traffic

Portal có nút **Tường lửa** trên mỗi network để thêm rule. Mỗi rule là một rule **cho phép** (allow), và traffic không khớp rule nào đi theo chính sách mặc định của network. Network tạo từ portal có chính sách mặc định là cho phép mọi traffic, và portal chưa có ô để đổi chính sách này. Vì vậy, thêm rule hiện chưa chặn thêm traffic nào.

Điều này cũng có nghĩa là trên một network có bật IPv6 công khai, mọi cổng của mọi VM trên network đó đều mở ra Internet.

## Nạp ví qua chuyển khoản chưa dùng được

Mã QR và số tài khoản trong hộp thoại **Nạp tiền** hiện chưa trỏ tới tài khoản ngân hàng thật của OpenViCloud. Đừng chuyển tiền theo mã QR hay số tài khoản này.
