---
title: Tạo và xoá network
description: Tạo network riêng cho VM trên portal, chọn tên, zone, dải CIDR, và xoá network khi không dùng nữa.
---

Network là mạng riêng nối các VM của bạn với nhau. Mỗi VM cần một network, nên bạn tạo network trước rồi mới [tạo VM](/vi/docs/guides/vm/).

## Tạo network

1. Mở trang **Mạng** ở thanh bên trái.
2. Bấm **Tạo mạng**.
3. Điền **Tên**. Tên dài tối đa 100 ký tự, chỉ gồm chữ, số, dấu gạch ngang (`-`) và gạch dưới (`_`), và phải bắt đầu bằng chữ hoặc số.
4. Chọn **Zone**. Nếu bỏ trống, portal báo "Chọn một zone" và không gửi gì.
5. Điền **CIDR** nếu bạn muốn chọn dải địa chỉ, ví dụ `10.0.0.0/24`. Ô này không bắt buộc. Nếu để trống, hệ thống tự chọn một dải và hiện nó ở cột **CIDR** khi network tạo xong.
6. Đánh dấu **Bật IPv6 công khai** nếu bạn muốn VM trên network này truy cập được từ Internet qua IPv6. Đọc [IPv6 công khai](/vi/docs/guides/public-ipv6/) trước khi đánh dấu.
7. Bấm **Tạo mạng**.

Network mới hiện trong bảng với trạng thái **Creating**. Bảng poll lại mỗi 5 giây khi còn dòng nào đang thay đổi, rồi dừng. Khi trạng thái thành **Created**, bạn tạo được VM và firewall rule trên network đó. Nếu tạo không thành, dòng đó hiện **Failed**, **Errored**, **Unavailable** hoặc **Not found**.

## Tên network

Tên phải khác nhau trong tài khoản của bạn. Trùng tên, portal báo "Đã có mạng trùng tên này" (mã `NETWORK_NAME_TAKEN`). Tên của một network đang xoá vẫn bị giữ. Khi xoá xong, bạn dùng lại được tên đó.

Bạn có thể đổi tên bằng nút **Đổi tên** trên dòng của network. Tên mới theo cùng luật như trên. Nếu bạn chọn một tên đã dùng, portal báo "Đã có mạng tên "<tên mới>"" (mã `NETWORK_NAME_TAKEN`). Nút **Đổi tên** bị tắt khi network đã bị yêu cầu xoá.

## Dải CIDR

Nếu bạn tự chọn CIDR, dải đó không được chồng lên dải của một network khác đã tạo xong trong tài khoản, kể cả network đang xoá. Nếu chồng, portal báo "CIDR này trùng với một mạng đã có" (mã `NETWORK_CIDR_OVERLAP`). Luật này chỉ xét các network của bạn. Tài khoản khác dùng cùng dải không ảnh hưởng tới bạn.

Địa chỉ IPv4 trong network chỉ để các VM trên cùng network nói chuyện với nhau. Network không có đường ra Internet qua IPv4. Xem [giới hạn hiện tại](/vi/docs/known-limitations/).

## Zone

Network nằm trong zone bạn chọn lúc tạo. Khi tạo VM, portal chỉ liệt kê các network đã **Created** trong zone của VM.

## Hạn mức

Mặc định, một tài khoản mới được tạo 1 network. Khi đã đủ, portal báo "Đã vượt hạn mức mạng" (mã `NETWORK_QUOTA_EXCEEDED`). Hạn mức này có thể được điều chỉnh riêng cho tài khoản của bạn. Network đang xoá không còn tính vào hạn mức.

## Xoá network

1. Xoá hết các VM đang dùng network. Khi còn VM, nút **Xoá** bị tắt và hiện gợi ý "Xoá hết máy ảo trong mạng trước".
2. Bấm **Xoá** trên dòng của network.
3. Bấm **Xác nhận** trong hộp thoại.

Khi network còn VM hoặc còn [load balancer](/vi/docs/guides/load-balancer/) chưa xoá xong, nút **Xoá** bị tắt; nếu lý do là load balancer, rê chuột lên nút sẽ thấy "Xoá các load balancer của mạng này trước". Nếu server vẫn từ chối, portal báo "Không xoá được: mạng vẫn còn máy ảo hoặc load balancer" (mã `NETWORK_NOT_EMPTY`). Thứ tự xoá: load balancer, rồi VM, rồi network.

Sau khi xác nhận, portal báo "Đã xoá mạng", nhưng network vẫn nằm trong bảng với trạng thái **Deleting** cho tới khi xoá xong, rồi mới biến mất. Các firewall rule của network bị xoá cùng network. Nếu OpenViCloud không xoá được network, dòng đó trở về trạng thái trước và hiện lý do bằng chữ đỏ dưới dòng zone; bấm **Xoá** lần nữa để thử lại.

Nút **Xoá** cũng tắt khi network còn đang **Creating** hoặc **Deleting**. Network có trạng thái **Failed** hoặc **Not found** vẫn xoá được.
