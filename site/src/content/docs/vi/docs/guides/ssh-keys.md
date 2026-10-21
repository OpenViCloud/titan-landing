---
title: SSH key và đăng nhập
description: Thêm SSH public key, chọn nó khi tạo VM, và đăng nhập bằng CLI hoặc qua SSH.
---

SSH key nằm ở mục **Tài khoản → SSH key** trên thanh bên trái.

## Thêm SSH key

1. Ở trang **SSH key**, bấm **Thêm SSH key**.
2. Điền **Tên**, tối đa 64 ký tự.
3. Dán public key vào ô **Public key** — một dòng public key, ví dụ nội dung của `~/.ssh/id_ed25519.pub`.
4. Bấm **Thêm SSH key**.

Portal báo "Đã thêm SSH key" và key xuất hiện trong bảng, với các cột **Tên**, **Loại**, **Fingerprint** và **Ngày thêm**. Fingerprint có dạng `SHA256:…`, giống giá trị `ssh-keygen -lf` in ra. Chỉ loại key và dữ liệu key được giữ lại; comment cuối dòng (nếu có) sẽ bị bỏ.

Loại key được chấp nhận: `ssh-ed25519`, `ecdsa-sha2-nistp256`, `ecdsa-sha2-nistp384`, `ecdsa-sha2-nistp521`, và `ssh-rsa` với kích thước từ 2048 đến 16384 bit.

### Khi thêm key bị từ chối

| Thông báo trên portal | Mã lỗi | Nghĩa là |
|---|---|---|
| Key này đã được lưu | `SSH_KEY_EXISTS` | Bạn đã có đúng key này rồi. |
| Đã có key trùng tên | `SSH_KEY_NAME_TAKEN` | Bạn đã có key khác cùng tên này. |
| Đã đạt giới hạn số SSH key — hãy xoá bớt một key | `SSH_KEY_QUOTA_EXCEEDED` | Bạn đã đủ số SSH key được phép. Mặc định là 20 key mỗi tài khoản. |
| Không phải public key được chấp nhận. Dùng ed25519, ecdsa hoặc RSA từ 2048 bit. | `VALIDATION_ERROR` | Đoạn văn bản dán vào không phải loại hay kích thước key được chấp nhận. |

## Chọn key khi tạo VM

Hộp thoại [Tạo VM](/vi/docs/guides/vm/) có nhóm ô đánh dấu **SSH key**. Chọn tối đa 10 key cho mỗi VM. Key đã chọn chỉ được cài đúng một lần, lúc VM khởi động lần đầu, vào `authorized_keys` của user `ubuntu`. Bạn không thêm được key vào một VM đã tạo từ portal, và xoá một key không gỡ nó khỏi các VM đã có key đó — muốn gỡ thì xoá trong chính VM.

Template duy nhất đang cho khách chọn hôm nay là **Ubuntu-22.04-Standard**.

## Đăng nhập vào VM

### Bằng CLI

```
openvicloud vm ssh <tên hoặc id VM>
```

Cách này dùng được trên mọi network — VM không cần địa chỉ công khai. Control plane chuyển tiếp phiên SSH. VM phải ở trạng thái `Running` hoặc `Ready`. Ngay sau khi VM khởi động, một phiên có thể kết thúc ngay; hãy thử lại sau ít phút.

Tối đa 5 phiên mỗi tài khoản được mở cùng lúc, và một phiên không hoạt động sẽ tự đóng sau 30 phút.

User đăng nhập mặc định là `ubuntu` (đổi bằng `--user`). Thêm tham số `ssh` hoặc lệnh cần chạy sau dấu `--`, ví dụ:

```
openvicloud vm ssh web-1 -- -i ~/.ssh/id_ed25519
```

Xem [trang hướng dẫn CLI](/vi/docs/guides/cli/) để cài `openvicloud` và đăng nhập.

### SSH trực tiếp qua IPv6 công khai

```
ssh ubuntu@<địa chỉ Public IPv6 của VM>
```

Cách này chỉ dùng được với VM trên network có bật IPv6 công khai (xem [IPv6 công khai](/vi/docs/guides/public-ipv6/)). Trên network như vậy, mọi cổng của VM đều mở ra Internet, và rule firewall tạo từ portal hiện chưa chặn được cổng nào — xem [giới hạn hiện tại](/vi/docs/known-limitations/) và [rule firewall](/vi/docs/guides/firewall/).

Bản thân portal không có nút mở shell và không có console web.
