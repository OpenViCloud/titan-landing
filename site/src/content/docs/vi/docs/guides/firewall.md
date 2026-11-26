---
title: Dùng firewall rule
description: Thêm và xoá firewall rule trên một network, các trường và giới hạn của nó, và network làm gì với traffic không rule nào cho phép.
---

## Một rule làm gì

Mọi firewall rule bạn thêm đều là rule **cho phép (allow)**. Traffic không rule nào cho phép đi về đâu là chính sách mặc định của network, hiện ở đầu bảng tường lửa:

- Network mới hiện "Chiều vào từ ngoài mạng: bị chặn trừ khi có quy tắc cho phép" và "Chiều ra: cho phép". Traffic từ Internet chỉ tới được VM có [IPv6 công khai](/vi/docs/guides/public-ipv6/) ở những cổng rule Ingress của bạn mở. Điều này không chặn traffic giữa các VM cùng network.
- Network tạo trước khi có mặc định này mà không đặt chính sách — mọi network tạo từ portal trước đó — hiện "Chiều vào từ ngoài mạng: cho phép" và "Chiều ra: cho phép": mọi cổng đều mở, và rule không đóng được cổng nào.
- Network tạo qua API hay [Terraform](/vi/docs/guides/terraform/) với chính sách chiều ra Deny hiện "Chiều ra: bị chặn trừ khi có quy tắc cho phép": VM chỉ ra ngoài, và tới các VM khác, ở chỗ rule Egress cho phép.

Network `default` của tài khoản bạn, nếu có (xem [network mặc định của bạn](/vi/docs/guides/network/#network-mặc-định-của-bạn)), thường đã mở sẵn sáu rule Ingress khi đã sẵn sàng: TCP cổng 22 (SSH), 80 (HTTP) và 443 (HTTPS), mỗi cổng từ `::/0` và từ `0.0.0.0/0`. Network bạn tự tạo thì chưa có rule nào — tự thêm rule như hướng dẫn bên dưới.

Không đổi được chính sách mặc định sau khi đã tạo network. Xem [giới hạn hiện tại](/vi/docs/known-limitations/).

## Mở bảng firewall

Bấm **Tường lửa** trên dòng của một network ở trang [Mạng](/vi/docs/guides/network/). Thao tác này mở bảng **Quy tắc tường lửa** của network đó.

## Thêm rule

1. Bấm **Thêm quy tắc**.
2. Chọn **Chiều**: Ingress hoặc Egress.
3. Chọn **Giao thức**: TCP, UDP, ICMP hoặc **Tất cả**.
4. Điền **CIDR**. Với Ingress đây là nguồn; với Egress đây là đích. Cả CIDR IPv4 lẫn IPv6 đều được chấp nhận; CIDR IPv6 phải viết từ địa chỉ đầu của dải. Nút **Thêm quy tắc** vẫn tắt tới khi ô này có giá trị; nếu để trống rồi gửi bằng cách khác, portal báo "Vui lòng nhập CIDR."
5. Nếu giao thức là TCP hoặc UDP, điền **Cổng đầu**, từ 1 tới 65535; thiếu ô này portal báo "TCP và UDP cần Cổng đầu." **Cổng cuối** không bắt buộc: để trống là chỉ cho phép đúng cổng đầu. Hai ô này không hiện với ICMP hoặc Tất cả.
6. Bấm **Thêm quy tắc**.

Nếu yêu cầu bị từ chối, portal nói lý do khi biết: "Mạng này đã đủ số firewall rule tối đa." (`FIREWALL_QUOTA_EXCEEDED`), "Mạng chưa sẵn sàng để thêm quy tắc." (`FIREWALL_NETWORK_NOT_READY`), hoặc thông báo tài khoản bị tạm ngưng / đang chờ duyệt. Lý do khác hiện "Không tạo được quy tắc."

## Rule không sửa được

Không có cách nào đổi một rule sau khi đã tạo. Hãy xoá rồi thêm rule mới thay vào.

## Xoá rule

Bấm **Xoá** trên dòng của rule. Không có hộp thoại xác nhận. Portal báo "Đã gửi yêu cầu xoá quy tắc", dòng đó hiện **Deleting**, rồi rule biến mất khỏi danh sách khi xoá xong. Nếu OpenViCloud không xoá được rule, dòng đó hiện trạng thái OpenViCloud đọc được gần nhất của rule — **Unknown** nếu chưa có — và lý do bằng chữ đỏ sau trạng thái.

Các rule của một network bị xoá cùng network khi bạn xoá network đó.

## Trạng thái

Một rule có thể ở **Creating**, **enabled**, **Deleting**, **Not found**, **Failed** hoặc **Unknown**. **disabled** hoặc **logged** chỉ xuất hiện khi rule bị đổi bên ngoài OpenViCloud.

## Hạn mức

Mặc định, một network có tối đa 20 firewall rule. Đây là hạn mức theo network, không theo tài khoản.
