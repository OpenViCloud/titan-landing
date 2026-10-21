---
title: Mã lỗi
description: Các mã lỗi bạn có thể gặp khi dùng portal hoặc API của OpenViCloud, ý nghĩa và cách xử lý.
---

Khi một yêu cầu bị từ chối, OpenViCloud trả về nội dung JSON có trường `code`, ví dụ `VM_QUOTA_EXCEEDED`. Bảng dưới liệt kê các mã bạn có thể gặp, nhóm theo chủ đề.

## Tài khoản và yêu cầu

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `VALIDATION_ERROR` | 400 | Dữ liệu gửi lên không hợp lệ, ví dụ tên quá dài hoặc thiếu trường bắt buộc. | Đọc trường `title` để biết trường nào sai, sửa rồi gửi lại. |
| `IDEMPOTENCY_KEY_REQUIRED` | 400 | Yêu cầu tạo tài nguyên qua API thiếu header `Idempotency-Key`. | Thêm header `Idempotency-Key` với một giá trị mới cho mỗi lần tạo. |
| `IDEMPOTENCY_KEY_REUSED` | 422 | Bạn dùng lại một `Idempotency-Key` cũ cho một yêu cầu có nội dung khác. | Dùng một key mới. |
| `IDEMPOTENCY_IN_PROGRESS` | 409 | Một yêu cầu cùng `Idempotency-Key` đang được xử lý. | Chờ một chút rồi gửi lại đúng yêu cầu đó, với cùng key. |
| `REQUEST_IN_PROGRESS` | 409 | Hai yêu cầu giống hệt nhau tới cùng lúc, ví dụ bấm đúp nút xoá. Yêu cầu đầu tiên vẫn được thực hiện. | Không cần làm gì. Tải lại trang để xem kết quả. |
| `TENANT_PENDING_APPROVAL` | 403 | Tài khoản của bạn đang chờ duyệt. Bạn chưa tạo hay thay đổi được gì. | Chờ OpenViCloud duyệt. |
| `TENANT_SUSPENDED` | 403 | Tài khoản của bạn đang bị tạm khoá. Bạn không thay đổi được gì. | — |
| `NOT_A_MEMBER` | 403 | Bạn không thuộc tài khoản nào. | Đăng nhập bằng tài khoản đã có, hoặc [đăng ký](/vi/docs/guides/sign-up/). |
| `INTERNAL_ERROR` | 500 | Lỗi phía hệ thống. | Thử lại sau ít phút. |

Hai mã trạng thái tài khoản này (`TENANT_PENDING_APPROVAL`, `TENANT_SUSPENDED`) trả về nội dung chỉ có `code` và `message`; khác các mã còn lại trên trang này, không có trường `title` để đọc.

## Zone, size và template

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `ZONE_NOT_FOUND` | 404 | Zone bạn chọn không tồn tại. | Chọn một zone trong danh sách. |
| `VM_OFFERING_NOT_FOUND` | 404 | Size VM bạn chọn không tồn tại. | Chọn một size khác. |
| `TEMPLATE_NOT_FOUND` | 404 | Template bạn chọn không tồn tại. | Chọn một template khác. |
| `TEMPLATE_NOT_SYNCED` | 422 | Template chưa có ở zone của VM. | Chọn template khác trong danh sách của zone đó. |
| `TEMPLATE_UNAVAILABLE` | 422 | Template tạm thời không dùng được ở zone này. | Chọn template khác, hoặc thử lại sau. |

## VM, snapshot VM và phiên SSH

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `VM_QUOTA_EXCEEDED` | 422 | Bạn đã dùng hết số VM được phép. | Xoá bớt VM, xem [giới hạn](/vi/docs/concepts/quotas/). |
| `VM_NAME_TAKEN` | 409 | Bạn đã có một VM khác cùng tên. | Chọn tên khác. |
| `VM_NOT_FOUND` | 404 | VM không tồn tại, hoặc không thuộc tài khoản của bạn. | Tải lại danh sách VM. |
| `VM_INVALID_STATUS` | 422 | VM đang ở trạng thái không cho phép thao tác này. Mã này cũng xuất hiện khi bạn mở phiên SSH tới một VM không ở trạng thái Running hoặc Ready, hoặc VM đang có yêu cầu dừng/xoá chờ xử lý. | Xem [trạng thái VM](/vi/docs/concepts/vm-states/), chờ VM tới trạng thái phù hợp. |
| `VM_AGENT_NOT_READY` | 422 | Bạn mở phiên SSH trong lúc VM còn đang khởi động. | Chờ một phút rồi thử lại. |
| `VM_SESSION_LIMIT_REACHED` | 422 | Tài khoản của bạn đã mở đủ 5 phiên SSH. | Đóng bớt một phiên rồi thử lại. |
| `VM_IS_LOAD_BALANCER_BACKEND` | 422 | Bạn xoá một VM mà một load balancer chưa xoá vẫn đang gửi traffic tới. | Gỡ VM khỏi load balancer trước. |
| `VM_SNAPSHOT_QUOTA_EXCEEDED` | 422 | VM đã có đủ số snapshot tối đa. | Xoá bớt snapshot của VM đó. |
| `VM_SNAPSHOT_NOT_FOUND` | 404 | Snapshot không tồn tại, hoặc không thuộc VM này. | Tải lại danh sách snapshot. |
| `VM_SNAPSHOT_INVALID_STATE` | 422 | Snapshot chưa sẵn sàng để khôi phục hoặc xoá. | Chờ thao tác đang chạy trên snapshot xong rồi thử lại. |
| `VM_SNAPSHOT_IN_PROGRESS` | 422 | Không xoá được VM vì một snapshot của nó đang được tạo hoặc đang khôi phục. | Chờ việc đó xong rồi xoá lại. |

## Network, firewall và IPv6

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `NETWORK_QUOTA_EXCEEDED` | 422 | Bạn đã dùng hết số network được phép. | Xoá bớt network, xem [giới hạn](/vi/docs/concepts/quotas/). |
| `NETWORK_NAME_TAKEN` | 409 | Bạn đã có một network khác cùng tên. | Chọn tên khác. |
| `NETWORK_CIDR_OVERLAP` | 422 | Dải CIDR bạn nhập trùng với một network bạn đang có. | Chọn dải CIDR khác. |
| `NETWORK_NOT_FOUND` | 404 | Network không tồn tại, hoặc không thuộc tài khoản của bạn. | Tải lại danh sách network. |
| `NETWORK_NOT_ACTIVE` | 422 | Network chưa tạo xong nên chưa gắn VM vào được. | Chờ network tạo xong rồi tạo VM. |
| `NETWORK_ZONE_MISMATCH` | 422 | Network nằm ở zone khác với zone của VM. | Chọn network cùng [zone](/vi/docs/concepts/zone/). |
| `NETWORK_NOT_EMPTY` | 422 | Network vẫn còn VM, hoặc còn load balancer chưa xoá xong, nên chưa xoá được. | Xoá các VM và load balancer trên network trước. |
| `NETWORK_INVALID_STATE` | 422 | Network đang ở trạng thái không cho phép thao tác này, ví dụ chưa tạo xong. | Chờ network tạo xong rồi thử lại. |
| `FIREWALL_QUOTA_EXCEEDED` | 422 | Network đã có đủ số firewall rule tối đa. | Xoá bớt rule trên network đó. |
| `FIREWALL_NETWORK_NOT_READY` | 422 | Network chưa tạo xong nên chưa thêm firewall rule được. | Chờ network tạo xong rồi thêm rule. |
| `FIREWALL_RULE_NOT_READY` | 422 | Rule còn đang được tạo nên chưa xoá được. | Chờ rule tạo xong rồi xoá. |
| `FIREWALL_RULE_INVALID_STATE` | 422 | Rule đang ở trạng thái không xoá được. | Tải lại trang để xem trạng thái mới của rule. |
| `FIREWALL_RULE_NOT_FOUND` | 404 | Rule không tồn tại, hoặc thuộc network khác. | Tải lại danh sách rule. |
| `IPV6_QUOTA_EXCEEDED` | 422 | Bạn đã dùng hết số network được bật IPv6 công khai. | Xoá một network đang bật IPv6, hoặc tạo network này không bật IPv6. |
| `IPV6_NOT_AVAILABLE` | 422 | Zone không có IPv6 công khai, hoặc đã hết dải địa chỉ trống ở zone đó. | Chọn zone khác, hoặc tạo network không bật IPv6 công khai. |
| `IPV6_ALLOCATION_CONFLICT` | 409 | Hai network cùng zone xin IPv6 công khai cùng lúc và được cấp trùng một dải địa chỉ. | Thử tạo network lại. |

## Volume và snapshot volume

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `VOLUME_OFFERING_NOT_FOUND` | 404 | Loại volume bạn chọn không tồn tại. | Chọn một loại volume trong danh sách. |
| `VOLUME_QUOTA_EXCEEDED` | 422 | Bạn đã dùng hết số volume được phép. | Xoá bớt volume, xem [giới hạn](/vi/docs/concepts/quotas/). |
| `VOLUME_NOT_FOUND` | 404 | Volume không tồn tại, hoặc không thuộc tài khoản của bạn. | Tải lại danh sách volume. |
| `VOLUME_INVALID_STATE` | 422 | Volume đang ở trạng thái không cho phép thao tác này, ví dụ xoá một volume còn gắn vào VM, hoặc gắn, gỡ, xoá một volume mà máy ngoài portal đang dùng. | Chờ volume xong việc đang làm, hoặc tháo volume khỏi VM trước. |
| `VOLUME_HAS_SNAPSHOTS` | 422 | Volume còn snapshot nên chưa xoá được. | Xoá các snapshot của volume trước. |
| `VOLUME_ZONE_MISMATCH` | 422 | Volume và VM nằm ở hai zone khác nhau. | Chọn VM cùng [zone](/vi/docs/concepts/zone/) với volume. |
| `VOLUME_SNAPSHOT_QUOTA_EXCEEDED` | 422 | Volume đã có đủ số snapshot tối đa. | Xoá bớt snapshot của volume đó. |
| `VOLUME_SNAPSHOT_NOT_FOUND` | 404 | Snapshot không tồn tại, hoặc không thuộc volume này. | Tải lại danh sách snapshot. |
| `VOLUME_SNAPSHOT_INVALID_STATE` | 422 | Snapshot chưa sẵn sàng để khôi phục hoặc xoá. | Chờ snapshot tạo xong rồi thử lại. |

## SSH key

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `SSH_KEY_EXISTS` | 409 | Bạn đã lưu đúng key này rồi. | Dùng key đã có, hoặc tạo một key mới. |
| `SSH_KEY_NAME_TAKEN` | 409 | Bạn đã có một SSH key khác cùng tên. | Chọn tên khác. |
| `SSH_KEY_NOT_FOUND` | 404 | Key không tồn tại, hoặc không thuộc tài khoản của bạn. Mã này cũng xuất hiện khi bạn tạo VM với một id SSH key như vậy. | Tải lại danh sách SSH key, xem [SSH key](/vi/docs/guides/ssh-keys/). |
| `SSH_KEY_QUOTA_EXCEEDED` | 422 | Bạn đã dùng hết số SSH key được phép. | Xoá một key không cần dùng nữa, xem [giới hạn](/vi/docs/concepts/quotas/). |

## Token API

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `API_TOKEN_NAME_TAKEN` | 409 | Bạn đã có một token API khác cùng tên. | Chọn tên khác. |
| `API_TOKEN_NOT_FOUND` | 404 | Token không tồn tại, hoặc không thuộc tài khoản của bạn. Xoá một token hai lần cũng ra mã này. | Tải lại danh sách token, xem [Token API](/vi/docs/guides/api-tokens/). |
| `API_TOKEN_QUOTA_EXCEEDED` | 422 | Bạn đã có 20 token API; token hết hạn vẫn tính cho tới khi xoá. | Xoá một token không cần dùng nữa. |

## Load balancer

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `LOAD_BALANCER_NOT_FOUND` | 404 | Load balancer không tồn tại, hoặc không thuộc tài khoản của bạn. | Tải lại danh sách load balancer. |
| `LOAD_BALANCER_NAME_TAKEN` | 409 | Bạn đã có một load balancer khác cùng tên. | Chọn tên khác. |
| `LOAD_BALANCER_QUOTA_EXCEEDED` | 422 | Bạn đã dùng hết số load balancer được phép. | Xoá một load balancer không cần dùng nữa, xem [giới hạn](/vi/docs/concepts/quotas/). |
| `LOAD_BALANCER_NEEDS_PUBLIC_IPV6` | 422 | Network bạn chọn chưa bật IPv6 công khai. | Chọn network đã bật IPv6 công khai, xem [IPv6 công khai](/vi/docs/guides/public-ipv6/). |
| `LOAD_BALANCER_BACKEND_INVALID` | 422 | Một trong các VM bạn chọn làm backend không phải VM của bạn trên network đó. | Chọn VM của bạn trên cùng network. |
| `LOAD_BALANCER_INVALID_STATE` | 422 | Load balancer đang ở trạng thái không cho phép thao tác này, hoặc network đã hết địa chỉ trống cho load balancer mới. | Tải lại trang để xem trạng thái hiện tại. |
| `LOAD_BALANCER_VIP_CONFLICT` | 409 | Hai load balancer cùng network xin địa chỉ cùng lúc và được cấp trùng một địa chỉ. | Thử lại. |

## Hoá đơn

| Mã | HTTP | Ý nghĩa | Bạn nên làm gì |
|----|------|---------|----------------|
| `INVOICE_NOT_FOUND` | 404 | Hoá đơn không tồn tại, hoặc không thuộc tài khoản của bạn. | Tải lại danh sách hoá đơn. |
| `INVOICE_INVALID_STATE` | 422 | Hoá đơn đã được thanh toán, nên không trả từ ví được nữa. | Không cần làm gì. |
| `INVOICE_WALLET_INSUFFICIENT` | 422 | Số dư ví không đủ trả trọn hoá đơn. Không đồng nào bị trừ. Trường `title` cho biết còn thiếu bao nhiêu. | — |
| `INVOICE_PAYMENT_CONFLICT` | 409 | Lần trả này không bắt đầu được, hoặc đã có một lần trả khác đang xử lý. Lần bấm này không trừ tiền. | Tải lại hoá đơn để xem trạng thái mới trước khi bấm lại. |
