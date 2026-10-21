---
title: IPv6 công khai
description: Cho VM của một network địa chỉ IPv6 công khai truy cập được từ Internet, cách tính hạn mức, và vì sao bạn vẫn phải tự bảo vệ từng VM.
---

Mỗi network đều có thể có một dải địa chỉ IPv6 công khai riêng. VM trên network đó khi ấy truy cập được từ Internet qua IPv6.

**Mọi cổng đều mở theo mặc định.** Network tạo từ portal mặc định cho qua mọi traffic, và portal không có ô nào để đổi điều này. Nghĩa là mọi cổng của mọi VM trên một network có IPv6 công khai đều mở cho cả Internet, và [firewall rule](/vi/docs/guides/firewall/) tạo từ portal không chặn được cổng nào — chúng chỉ thêm traffic được phép. Hãy tự bảo vệ từng VM trước khi dựa vào tính năng này: ví dụ, chạy một tường lửa bên trong hệ điều hành guest chỉ cho phép đúng những cổng bạn muốn mở ra ngoài.

## Bật lúc tạo network

**Bật IPv6 công khai** là ô đánh dấu trong hộp thoại [tạo network](/vi/docs/guides/network/), mặc định tắt. Bạn không bật hay tắt lại được sau khi network đã tạo — quyết định ngay lúc tạo.

Nếu bạn cũng điền **CIDR** trong khi ô này đang được đánh dấu, CIDR đó phải nằm trong `10.0.0.0/8`, `172.16.0.0/12` hoặc `192.168.0.0/16`. Nếu không, portal báo "Khi bật IPv6 công khai, CIDR phải nằm trong 10.0.0.0/8, 172.16.0.0/12 hoặc 192.168.0.0/16".

## Bạn nhận được gì

Dải địa chỉ `/64` của network được giữ ngay khi bạn gửi form, và dòng của network hiện nó ở một dòng dưới cột **CIDR** ngay khi dòng đó tải xong. Mỗi VM trên network nhận một địa chỉ IPv6 công khai riêng trong dải `/64` ấy. Địa chỉ này hiện ở cột **IPv6 công khai** trong danh sách VM và trên trang của VM đó; có thể mất vài phút để hiện ra sau khi VM khởi động.

VM truy cập được từ Internet qua IPv6. IPv4 vẫn không có đường ra Internet, kể cả trên network đã bật IPv6 công khai.

## Hạn mức

Mặc định, một tài khoản có thể bật IPv6 công khai cho tối đa 10 network cùng lúc. Hạn mức này hiện ở thẻ Hạn mức trên trang Tổng quan dưới tên **IPv6 công khai**. Một network thôi tính vào hạn mức này ngay khi bạn bấm xoá, không phải khi việc xoá xong.

Hạn mức network mặc định chỉ là 1, nên trên thực tế bạn sẽ chạm hạn mức network trước khi chạm hạn mức IPv6 công khai.

## Khi bị từ chối

| Thông báo trên portal | Mã lỗi | Ý nghĩa |
|---|---|---|
| Đã vượt hạn mức IPv6 công khai — xoá bớt một mạng có IPv6 công khai trước | `IPV6_QUOTA_EXCEEDED` | Bạn đã có đủ số network bật IPv6 công khai mà tài khoản được phép (mặc định 10). |
| Zone này chưa có IPv6 công khai | `IPV6_NOT_AVAILABLE` | Zone chưa cấu hình IPv6 công khai, hoặc mọi dải `/64` của zone (255 dải) đã dùng hết. |
| Một mạng khác vừa lấy cùng dải IPv6 — hãy gửi lại | `IPV6_ALLOCATION_CONFLICT` | Hai network cùng xin IPv6 công khai trong cùng zone tại cùng thời điểm và chọn trùng dải `/64`. Gửi lại form. |

Dải `/64` của một network được giữ tới khi việc xoá network đó xong, không chỉ khi bạn bấm xoá.

## Chi phí

IPv6 công khai không tính thêm vào hoá đơn của bạn.
