---
title: Tạo và quản lý VM
description: Tạo VM trên portal, stop và start, xoá VM, dùng snapshot, và VM được tính tiền khi nào.
---

Mọi thao tác với VM nằm ở trang **Máy ảo** trên thanh bên trái. Ý nghĩa từng trạng thái (Running, Ready, Stopped, Frozen, Error…) có ở trang [trạng thái VM](/vi/docs/concepts/vm-states/).

## Trước khi tạo VM

Mỗi VM cần một [network](/vi/docs/guides/network/) ở cùng zone. Network đó phải ở trạng thái **Created**. Portal chỉ liệt kê network đã sẵn sàng của zone bạn chọn. VM chỉ có địa chỉ IPv6 công khai khi network của nó được tạo có bật IPv6 công khai — xem [IPv6 công khai](/vi/docs/guides/public-ipv6/).

## Tạo VM

1. Bấm **Tạo VM**.
2. Điền **Tên**. Tên dài tối đa 64 ký tự, chỉ gồm chữ, số và dấu gạch ngang (`-`), và phải bắt đầu bằng chữ hoặc số. Tên phải khác tên các VM bạn đang có. Tên của VM đã xoá thì dùng lại được.
3. Chọn **Zone**.
4. Chọn **Mạng**. Ô này chỉ hiện network thuộc zone vừa chọn.
5. Chọn **Template**, tức hệ điều hành. Ô này chỉ hiện template đã có ở zone đó.
6. Chọn **Cấu hình**: Small (1 vCPU, 2 GB RAM), Medium (2 vCPU, 4 GB), Large (4 vCPU, 8 GB) hoặc Extra Large (8 vCPU, 16 GB).
7. Ở mục **SSH key**, đánh dấu key muốn thêm vào VM này. Xem [SSH key và đăng nhập](/vi/docs/guides/ssh-keys/) để thêm key trước. Key đã chọn được thêm cho user `ubuntu`.
8. Bấm **Tạo VM**.

Hãy điền đủ các ô phía trên SSH key. Nếu **Zone**, **Mạng**, **Template** hay **Cấu hình** còn trống lúc bấm **Tạo VM**, portal báo "Chọn zone, mạng, template và cấu hình." và không gửi gì.

VM mới hiện trong danh sách với trạng thái **Creating**. Khi VM chạy, trạng thái chuyển sang **Running** hoặc **Ready**, và ô **IPv4 riêng** hiện địa chỉ của VM trong network. Cột **IPv6 công khai** hiện địa chỉ của VM nếu network của nó có IPv6 công khai, hoặc "—" nếu không; ở trang riêng của VM, ô này hiện "Chưa bật" thay vì "—" khi network không có IPv6 công khai. Nếu tạo không thành, trạng thái là **Failed** kèm một dòng giải thích.

## Khi tạo VM bị từ chối

| Thông báo trên portal | Mã lỗi | Nghĩa là |
|---|---|---|
| Đã có VM trùng tên này | `VM_NAME_TAKEN` | Bạn đã có VM khác cùng tên. |
| Đã vượt hạn mức VM | `VM_QUOTA_EXCEEDED` | Bạn đã đủ số VM được phép. Mặc định là 10 VM mỗi tài khoản. |
| Zone đã chọn không còn khả dụng — chọn zone khác | `ZONE_NOT_FOUND` | Zone bạn chọn không còn tồn tại. |
| Mạng này ở zone khác — chọn một mạng trong zone này | `NETWORK_ZONE_MISMATCH` | Network và VM phải cùng zone. |
| Cấu hình đã chọn không còn khả dụng — chọn cấu hình khác | `VM_OFFERING_NOT_FOUND` | Cấu hình bạn chọn không còn tồn tại. |
| Template đã chọn chưa có ở zone này — chọn template khác | `TEMPLATE_NOT_SYNCED` | Template chưa có ở zone này. |
| Template đã chọn hiện không khả dụng — chọn template khác | `TEMPLATE_UNAVAILABLE` | Template tạm thời không dùng được ở zone này. |
| Một SSH key đã chọn không còn nữa — hãy chọn lại | `SSH_KEY_NOT_FOUND` | Một key bạn chọn đã bị xoá trong lúc đó. |
| Tài khoản đang bị tạm ngưng — liên hệ hỗ trợ để tạo tài nguyên | `TENANT_SUSPENDED` | Tài khoản của bạn đang bị tạm ngưng. |
| Tài khoản đang chờ quản trị viên duyệt — bạn có thể xem nhưng chưa tạo được tài nguyên | `TENANT_PENDING_APPROVAL` | Tài khoản của bạn chưa được duyệt. |

VM bạn đã bấm xoá thì không còn tính vào giới hạn số VM.

## Đăng nhập vào VM

Xem [SSH key và đăng nhập](/vi/docs/guides/ssh-keys/) — thêm một key, chọn nó khi tạo VM, rồi dùng CLI hoặc kết nối SSH trực tiếp.

## Stop, Start và Resume

- **Tắt** có khi VM ở trạng thái Running, Ready, Frozen hoặc Error. Nút này tắt VM ngay, không chờ hệ điều hành tự tắt, giống như rút điện. Hãy lưu dữ liệu đang làm dở trước khi bấm.
- **Bật** có khi VM ở trạng thái Stopped.
- **Tiếp tục** thay cho Bật khi VM ở trạng thái Frozen. Nút này cho VM chạy tiếp.

Trong lúc lệnh đang chạy, ô thao tác hiện **Creating…**, **Stopping…**, **Starting…** hoặc **Deleting…**, và các nút Tắt/Bật tạm ẩn.

## Xoá VM

1. Bấm **Xoá** trên hàng của VM.
2. Bấm **Xác nhận** trong hộp thoại "Xoá *tên VM*?".

Xoá VM thì xoá luôn mọi snapshot của VM đó. Volume đang gắn vào VM được gỡ ra và giữ lại; volume vẫn tính tiền cho tới khi xoá xong ([volume](/vi/docs/guides/volume/)).

Bạn chưa xoá được VM trong ba trường hợp:

- VM vừa tạo và chưa sẵn sàng. Nút **Xoá** bị tắt khi VM đang **Creating** và chưa tồn tại; nếu danh sách đã cũ vài giây và bạn vẫn bấm được, portal báo "Chưa xoá được: VM vẫn đang được khởi tạo. Thử lại sau một phút."
- Một snapshot của VM đang được tạo hoặc revert: "Chưa xoá được: VM đang có thao tác snapshot" (mã `VM_SNAPSHOT_IN_PROGRESS`). Chờ snapshot xong rồi xoá lại.
- Một load balancer đang gửi traffic tới VM này: "Chưa xoá được: một load balancer đang gửi traffic tới máy ảo này — gỡ nó khỏi load balancer trước" (mã `VM_IS_LOAD_BALANCER_BACKEND`). Xem [load balancer](/vi/docs/guides/load-balancer/).

## Snapshot VM

Bấm **Quản lý** trên hàng của VM, rồi mở tab **Snapshot**.

**Tạo snapshot.** Bấm **Tạo snapshot**, điền tên (tối đa 100 ký tự), rồi bấm **Tạo**. Nút này có khi VM ở trạng thái Running, Ready, Stopped hoặc Frozen, và VM không đang stop hay đang xoá. Mỗi VM có tối đa 3 snapshot theo mặc định. Khi đã đủ, portal báo "Đã vượt hạn mức snapshot (tối đa 3 mỗi VM)." (mã `VM_SNAPSHOT_QUOTA_EXCEEDED`). Snapshot bạn đã bấm xoá thì không tính.

**Revert.** Nút **Quay về** có trên snapshot ở trạng thái **Available** khi không có thao tác nào đang chạy trên nó. Snapshot hiện **Reverting** tới khi xong. Revert đưa ổ đĩa của VM về lúc chụp snapshot và chỉ đụng tới ổ đĩa — size của VM và các volume đang gắn không đổi. Revert không tự tắt hay bật VM. Việc này chỉ chạy được khi VM ở trạng thái Running, Ready, Stopped hoặc Frozen, và không có lệnh stop hay xoá đang chờ; nếu không, portal báo "Không quay về được snapshot."

**Xoá snapshot.** Bấm **Xoá** trên snapshot, rồi bấm **Xác nhận**. Nút này có khi không có thao tác nào đang chạy trên snapshot; snapshot **Failed** hoặc **Not found** cũng xoá được.

## VM được tính tiền khi nào

- Tiền compute tính theo giờ, theo giá của size. VM bị tính khi ở trạng thái Running, Ready, Frozen hoặc Error.
- VM ở trạng thái **Stopped** không bị tính tiền compute.
- Mỗi snapshot có trên hạ tầng bị tính một mức giá cố định theo giờ, không phụ thuộc dung lượng, tới khi việc xoá xong. Snapshot đang revert vẫn bị tính.
- Volume tính tiền riêng, xem trang [volume](/vi/docs/guides/volume/).

Giá theo giờ của từng size VM có ở [bảng giá](/vi/#pricing).
