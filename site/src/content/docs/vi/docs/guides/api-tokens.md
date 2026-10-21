---
title: Token API
description: Tạo token trên portal để CI, script và CLI gọi API thay bạn, không cần đăng nhập trình duyệt.
---

Token API nằm ở mục **Tài khoản → Token API** trên thanh bên trái. Token thay mặt bạn trong tài khoản: việc gì bạn làm được bằng portal hay CLI thì request mang token cũng làm được — trừ chức năng quản trị, token không bao giờ chạm tới.

## Tạo token

1. Ở trang **Token API**, bấm **Tạo token**.
2. Điền **Tên**, tối đa 64 ký tự — đặt theo nơi sẽ dùng, ví dụ `ci-deploy`.
3. Chọn **Hết hạn sau**: 30 ngày, 90 ngày (mặc định), 1 năm, hoặc Không hết hạn.
4. Bấm **Tạo token**.

Portal hiện token đúng một lần, bắt đầu bằng `ovc_`. Portal nhắc: **Bạn sẽ không xem lại được token này. Hãy sao chép ngay.** Bấm **Sao chép** rồi cất ở nơi an toàn, ví dụ kho secret của CI — OpenViCloud chỉ giữ dấu vân tay của nó. Lỡ mất thì xoá đi và tạo token mới.

Bảng liệt kê mỗi token với **Tên**, vài ký tự đầu của **Token**, **Ngày tạo** và **Hết hạn** (`Không hết hạn`, một ngày, hoặc `Đã hết hạn <ngày>`).

### Khi tạo token bị từ chối

| Thông báo trên portal | Mã lỗi | Ý nghĩa |
|---|---|---|
| Đã có token trùng tên | `API_TOKEN_NAME_TAKEN` | Bạn đã có một token khác cùng tên. |
| Đã đạt giới hạn 20 token — hãy xoá bớt một token | `API_TOKEN_QUOTA_EXCEEDED` | Bạn đã có 20 token; token hết hạn vẫn tính cho tới khi bạn xoá. |

## Dùng token

Với CLI, đặt token vào biến môi trường thay cho `openvicloud auth login`:

```bash
export OPENVICLOUD_TOKEN=ovc_...
openvicloud vm list
```

Gọi thẳng API thì gửi token làm bearer token:

```bash
curl -H "Authorization: Bearer $OPENVICLOUD_TOKEN" https://api-titan-staging.openvicloud.com/v1/tenant/vms
```

Request mang token bị từ chối với HTTP `401` khi token đã bị xoá, đã hết hạn, hoặc gõ sai. Nếu tài khoản bị suspend hoặc còn chờ duyệt, token chỉ đọc được, không thay đổi được gì — y như khi đăng nhập trình duyệt.

## Xoá token

Bấm biểu tượng thùng rác ở hàng của token rồi xác nhận. Token ngừng chạy ngay: request kế tiếp mang nó nhận `401`. Không hoàn tác được.
