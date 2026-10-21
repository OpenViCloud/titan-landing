---
title: Tài khoản của bạn
description: Menu tài khoản, trang Thành viên và Hồ sơ, trang Tổng quan, và cách ngôn ngữ, giao diện được ghi nhớ.
---

Trang này nói về phần portal liên quan tới tài khoản của bạn, không phải một tài nguyên cụ thể: menu tài khoản, trang **Thành viên**, trang **Hồ sơ**, và trang **Tổng quan**.

## Menu tài khoản

Bấm vào nút mang tên tài khoản của bạn ở góc trên bên phải portal. Menu có:

- **Hồ sơ** — mở trang Hồ sơ, mô tả bên dưới.
- **Đăng xuất**.
- **Giao diện** — **Theo hệ thống**, **Sáng** hoặc **Tối**. Xem mục Giao diện bên dưới.
- **Ngôn ngữ** — **English** hoặc **Tiếng Việt**. Xem mục Ngôn ngữ bên dưới.

## Thành viên

Mở mục **Thành viên**, trong nhóm **Tài khoản** ở thanh điều hướng bên trái. Trang liệt kê những người có quyền truy cập tài khoản của bạn, với **Mã thành viên** và **Ngày tham gia**.

Bạn không mời, thêm hay xoá thành viên từ trang này được. Tài khoản của bạn có một thành viên duy nhất, chính bạn, có từ lúc đăng ký, và hôm nay không có gì thêm thành viên khác, nên danh sách chỉ có một hàng.

## SSH key

Mở mục **SSH key**, trong nhóm **Tài khoản** ở thanh điều hướng bên trái, để quản lý các key bạn có thể chọn khi tạo VM. Xem [SSH key](/vi/docs/guides/ssh-keys/).

## Hồ sơ

Mở **Hồ sơ** từ menu tài khoản. Trang hiện:

- **Tên tenant** — tên người dùng từ lúc bạn đăng nhập.
- **Mã tenant**.
- **Trạng thái** — `Active` hoặc `Suspended`. Xem [đăng ký và được duyệt](/vi/docs/guides/sign-up/).
- **Hạn mức**: **Giới hạn VM** và **Giới hạn mạng**. Xem [giới hạn](/vi/docs/concepts/quotas/).

Không có gì trên trang này sửa được.

## Tổng quan

Trang **Tổng quan** (mục đầu tiên trong thanh điều hướng) hiện:

- Các thẻ **Tài nguyên**: **Máy ảo**, **Mạng**, **Ổ đĩa dữ liệu** và **Tháng này** (chi phí từ đầu tháng tới giờ).
- **Hoạt động gần đây**, danh sách các yêu cầu gần đây trên tài khoản của bạn và kết quả của chúng.
- Thẻ **Hạn mức** với thanh đã dùng/giới hạn cho **VM**, **Mạng**, **Ổ đĩa** và **IPv6 công khai**. Xem [giới hạn](/vi/docs/concepts/quotas/).

## Tìm kiếm

Từ màn hình rộng ít nhất 900 pixel, phần đầu trang có ô tìm kiếm. Bấm `/` để đưa con trỏ vào ô, hoặc bấm trực tiếp vào ô. Gõ ít nhất hai ký tự để tìm VM theo tên, địa chỉ IPv4 riêng hoặc IPv6 công khai, tìm network theo tên hoặc CIDR, và tìm volume theo tên. Chọn một VM sẽ mở trang chi tiết của nó; chọn một network hoặc volume sẽ mở danh sách tương ứng, lọc theo tên đó.

## Ngôn ngữ

Chọn **English** hoặc **Tiếng Việt** trong menu tài khoản. Màn hình chờ duyệt và màn hình điều khoản dịch vụ mỗi cái đều có nút chuyển ngôn ngữ riêng ở góc, vì bạn gặp hai màn hình này trước khi có menu tài khoản.

Lựa chọn của bạn được ghi nhớ trên trình duyệt này. Lần đầu vào, khi chưa có gì được ghi nhớ, portal hiện Tiếng Việt nếu bạn ở Việt Nam, còn lại hiện English. Trang đăng nhập theo lựa chọn đã ghi nhớ của bạn; nếu chưa có gì được ghi nhớ, nó theo ngôn ngữ của trình duyệt.

Tiền và ngày tháng theo ngôn ngữ đã chọn — ví dụ `900,000 ₫` ở bản English và `900.000 ₫` ở bản Tiếng Việt. Các chữ trạng thái (như `Running` hay `Failed`) giữ nguyên tiếng Anh ở cả hai ngôn ngữ. Chữ mà server trả về nguyên văn, như lý do một VM tạo hỏng, cũng giữ nguyên ngôn ngữ mà server dùng.

## Giao diện

Chọn **Theo hệ thống**, **Sáng** hoặc **Tối** trong menu tài khoản. **Theo hệ thống** (mặc định) theo cài đặt của thiết bị bạn. Lựa chọn của bạn được ghi nhớ trên trình duyệt này.
