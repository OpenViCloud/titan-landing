---
title: Đăng ký và được duyệt
description: Tạo tài khoản OpenViCloud bằng GitHub hoặc email, đồng ý điều khoản, và hiểu các trạng thái tài khoản.
---

Bạn cần một tài khoản để dùng OpenViCloud. Trang này giải thích cách đăng ký, khi nào tài khoản dùng được, và các trạng thái bạn có thể gặp.

## Đăng ký

1. Mở customer portal. Nếu chưa đăng nhập, portal chuyển bạn sang trang đăng nhập.
2. Chọn một trong hai cách:
   - **Đăng nhập bằng GitHub.** OpenViCloud dùng email từ tài khoản GitHub của bạn.
   - **Đăng ký bằng email và mật khẩu** qua form đăng ký trên trang đăng nhập.
3. Lần đầu bạn vào portal, OpenViCloud tự tạo tài khoản cho bạn.

Mỗi người dùng chỉ thuộc một tài khoản.

## Khi nào tài khoản được duyệt

Mọi tài khoản mới bắt đầu ở trạng thái `PendingApproval` (chờ duyệt).

- **Đăng nhập bằng GitHub:** tài khoản được duyệt ngay, chuyển sang `Active`, vì OpenViCloud tin email do GitHub cung cấp.
- **Đăng ký bằng email và mật khẩu:** tài khoản ở lại `PendingApproval` cho tới khi quản trị viên duyệt.

Khi tài khoản được duyệt, ví của bạn được mở cùng lúc.

## Khi tài khoản đang chờ duyệt

Trong lúc chờ, portal chỉ hiện màn hình **Tài khoản đang chờ duyệt** kèm nút **Đăng xuất**. Bạn chưa vào được các trang khác của portal. Màn hình này cũng có nút chuyển ngôn ngữ ở góc, nên bạn đọc được bằng tiếng Anh hoặc Tiếng Việt ngay cả khi chưa được duyệt.

Mọi thao tác tạo, sửa hoặc xoá đều bị từ chối với mã `TENANT_PENDING_APPROVAL`.

Portal đọc trạng thái tài khoản mỗi khi trang được tải. Sau khi được duyệt, hãy tải lại trang để vào portal.

## Đồng ý điều khoản dịch vụ

Sau khi tài khoản đã `Active`, portal hiện màn hình **Điều khoản dịch vụ** nếu bạn chưa đồng ý bản điều khoản hiện hành. Tài khoản `Suspended` mà vẫn còn nợ việc đồng ý cũng thấy màn hình này.

1. Bấm link **Điều khoản dịch vụ** để đọc. Link mở trong tab mới.
2. Tick ô **Tôi đã đọc và đồng ý với Điều khoản dịch vụ.** Ô này không được tick sẵn.
3. Bấm **Đồng ý & tiếp tục**. Nút chỉ bấm được sau khi bạn đã tick.

Nếu bấm **Không đồng ý**, bạn sẽ bị đăng xuất.

Việc đồng ý được ghi cho từng người dùng, không phải cho cả tài khoản. Khi điều khoản có phiên bản mới, bạn phải đồng ý lại ở lần vào portal tiếp theo. Bạn luôn đọc được điều khoản qua link **Điều khoản dịch vụ** ở cuối thanh điều hướng bên trái, mở trong tab mới và không cần đăng nhập.

## Khi tài khoản bị tạm ngưng

Quản trị viên có thể chuyển tài khoản sang `Suspended`. Một đăng ký bị từ chối cũng có trạng thái này.

Khi bị tạm ngưng, mọi thao tác thay đổi đều bị từ chối với mã `TENANT_SUSPENDED`. Điều này gồm cả tạo, xoá, bật, tắt tài nguyên, **nạp ví** và **trả hoá đơn**. Nếu bạn vẫn còn nợ việc đồng ý điều khoản, việc đồng ý cũng bị chặn trong lúc tạm ngưng.

Tạm ngưng không tự tắt tài nguyên của bạn. VM đang chạy vẫn chạy và vẫn được tính phí như bình thường.

Bạn xem trạng thái hiện tại của tài khoản ở trang **Hồ sơ**, dòng **Trạng thái**. Xem [tài khoản của bạn](/vi/docs/guides/account/).
