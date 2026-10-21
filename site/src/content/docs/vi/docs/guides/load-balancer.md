---
title: Dùng load balancer
description: Tạo load balancer đứng trước nhiều VM của một network, listener và VM của nó, cách chọn địa chỉ, sửa và xoá, và cách nó hoạt động.
---

Load balancer đặt một địa chỉ IPv6 công khai trước nhiều VM của một network. Đây là load balancer lớp 4 (TCP/UDP pass-through): nó chuyển tiếp nguyên gói tin của mỗi kết nối, không đọc hay sửa chúng.

## Trước khi tạo

Load balancer gắn vào một network đã bật [IPv6 công khai](/vi/docs/guides/public-ipv6/) và đã sẵn sàng. Nếu chưa network nào của bạn có IPv6 công khai, portal báo "Chưa có mạng nào có IPv6 công khai. Đánh dấu "Bật IPv6 công khai" khi tạo mạng." và form không gửi được.

## Tạo load balancer

1. Mở trang **Cân bằng tải** ở thanh bên trái.
2. Bấm **Tạo load balancer**.
3. Điền **Tên**, tối đa 100 chữ cái, chữ số, gạch ngang và gạch dưới, bắt đầu bằng chữ cái hoặc chữ số.
4. Chọn một **Mạng** — chỉ hiện các network đã có IPv6 công khai và đã sẵn sàng.
5. Thêm một hoặc nhiều **Listener**: mỗi listener có **Giao thức** (TCP hoặc UDP), một **Cổng** và một **Target port**. Listener mới mặc định TCP, cổng 80 tới target port 80. Dùng **Thêm listener** để thêm, hoặc nút **×** cạnh một listener để bỏ nó.
6. Đánh dấu các **Máy ảo** sẽ nhận traffic. Chỉ các VM trên network đã chọn, có trên hạ tầng và không đang bị xoá mới được hiện ra — VM đang tắt vẫn chọn được. Khi chưa chọn mạng, portal báo "Chọn mạng để chọn máy ảo của nó"; nếu mạng chưa có VM phù hợp, portal báo "Mạng này chưa có máy ảo nào nhận được traffic".
7. Bấm **Tạo load balancer**.

### Giới hạn

- 1 tới 10 listener ("Thêm từ 1 tới 10 listener").
- Cổng từ 1 tới 65535 ("Cổng phải trong khoảng 1 tới 65535").
- Mỗi cặp giao thức và cổng chỉ dùng cho một listener ("Mỗi cặp giao thức và cổng chỉ dùng cho một listener").
- 1 tới 20 VM ("Chọn từ 1 tới 20 máy ảo").

### Khi bị từ chối

| Thông báo trên portal | Mã lỗi | Ý nghĩa |
|---|---|---|
| Đã có load balancer trùng tên | `LOAD_BALANCER_NAME_TAKEN` | Bạn đã có một load balancer khác trùng tên này. |
| Đã đạt giới hạn số load balancer | `LOAD_BALANCER_QUOTA_EXCEEDED` | Bạn đã đạt số load balancer được phép. |
| Mạng này chưa có IPv6 công khai | `LOAD_BALANCER_NEEDS_PUBLIC_IPV6` | Mạng đã chọn chưa bật IPv6 công khai. |
| Mạng này chưa sẵn sàng — thử lại sau giây lát | `NETWORK_INVALID_STATE` | Mạng chưa dùng được. |
| Một máy ảo đã chọn không còn nhận được traffic — tải lại và chọn lại | `LOAD_BALANCER_BACKEND_INVALID` | Một VM bạn chọn không ở trên mạng đó, không có trên hạ tầng, hoặc thuộc tài khoản khác. |
| Mạng này đã hết địa chỉ cho load balancer | `LOAD_BALANCER_INVALID_STATE` (lúc tạo) | Mạng đã hết địa chỉ trống cho một load balancer mới. |
| Load balancer đang bận với một thay đổi khác — thử lại sau giây lát | `LOAD_BALANCER_INVALID_STATE` (lúc sửa) | Một thay đổi khác đang chờ trên load balancer này. |
| Một load balancer khác vừa lấy cùng địa chỉ — gửi lại | `LOAD_BALANCER_VIP_CONFLICT` | Hai load balancer trên cùng mạng được tạo cùng lúc và nhận trùng địa chỉ. Gửi lại. |

## Địa chỉ

OpenViCloud tự chọn địa chỉ cho bạn — bạn không chọn được. Địa chỉ là dải `/64` của mạng cộng `::1:n`, với `n` là số nhỏ nhất còn trống trên mạng đó. Ví dụ, load balancer đầu tiên trên `2001:db8:0:d401::/64` nhận `2001:db8:0:d401::1:1`.

Địa chỉ chỉ có IPv6; load balancer không có địa chỉ IPv4. Mỗi dòng trong danh sách hiện địa chỉ với nhãn **Chỉ IPv6**, mạng nó thuộc về, các listener (ví dụ "TCP 80 → 8080", nối bằng " · " khi có nhiều hơn một), và số VM nó gửi tới.

## Sửa load balancer

Bấm **Sửa** trên dòng của load balancer, rồi bấm **Lưu**. Sửa sẽ thay toàn bộ cấu hình — mọi listener và mọi VM — trong một yêu cầu. Mạng không đổi được; tạo load balancer mới nếu bạn cần một cái khác. Portal chưa đổi tên load balancer được; API thì được (`PATCH /v1/tenant/load-balancers/{id}` với `{ "name": "…" }`, dùng [token API](/vi/docs/guides/api-tokens/); `GET /v1/tenant/load-balancers` liệt kê `id` của từng cái), và địa chỉ giữ nguyên. **Sửa** chỉ dùng được khi load balancer đang **Active** — không dùng được khi còn đang tạo, cập nhật hay xoá, và không dùng được ở dòng **Not found** hoặc **Failed**.

## Trạng thái

Load balancer có thể ở **Creating**, **Updating**, **Deleting**, **Active**, **Not found** hoặc **Failed**. Danh sách poll lại mỗi 5 giây khi còn load balancer nào đang thay đổi, rồi dừng.

## Xoá load balancer

Bấm **Xoá** trên dòng, rồi bấm **Xác nhận** trong hộp thoại. Nút **Xoá** bị tắt khi load balancer đang **Creating** hoặc **Deleting**.

Xoá một VM mà một load balancer vẫn còn gửi traffic tới sẽ bị từ chối: "Chưa xoá được: một load balancer đang gửi traffic tới máy ảo này — gỡ nó khỏi load balancer trước" (mã `VM_IS_LOAD_BALANCER_BACKEND`).

## Cách hoạt động

- Load balancer chuyển tiếp nguyên gói TCP hoặc UDP tới các VM bạn đã chọn; nó không terminate TLS, không đọc HTTP.
- Backend thấy địa chỉ nguồn thật của client, không phải địa chỉ của load balancer.
- Health check luôn bật và không tắt được. Một VM ngừng trả lời sẽ sớm ngừng nhận traffic mới; OpenViCloud không hiện trạng thái sức khoẻ của từng backend.
- Mỗi backend nhận traffic trên địa chỉ dựng từ card mạng của nó (địa chỉ EUI-64 trên dải `/64` của network). Giữ nguyên cách đặt địa chỉ IPv6 mặc định của VM trên card mạng đó — đổi sang kiểu địa chỉ khác có thể khiến VM ngừng nhận traffic từ load balancer.

## Hạn mức và chi phí

Mặc định, một tài khoản có tối đa 5 load balancer. Hạn mức này không hiện trên thẻ Hạn mức ở trang Tổng quan. Load balancer không tính thêm vào hoá đơn của bạn.
