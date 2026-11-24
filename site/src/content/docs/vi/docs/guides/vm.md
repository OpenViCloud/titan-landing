---
title: Tạo và quản lý VM
description: Tạo VM trên portal, stop và start, xoá VM, dùng snapshot, và VM được tính tiền khi nào.
---

Mọi thao tác với VM nằm ở trang **Máy ảo** trên thanh bên trái. Ý nghĩa từng trạng thái (Running, Ready, Stopped, Frozen, Error…) có ở trang [trạng thái VM](/vi/docs/concepts/vm-states/).

## Trước khi tạo VM

Mỗi VM cần một [network](/vi/docs/guides/network/) ở cùng cluster. Network đó phải ở trạng thái **Created**. Portal chỉ liệt kê network đã sẵn sàng của cluster bạn chọn. Tài khoản bạn đã có sẵn một network `default` để dùng, nếu tài khoản bạn có network này — xem [network mặc định của bạn](/vi/docs/guides/network/#network-mặc-định-của-bạn). VM chỉ có địa chỉ IPv6 công khai khi network của nó được tạo có bật IPv6 công khai — xem [IPv6 công khai](/vi/docs/guides/public-ipv6/).

## Tạo VM

1. Bấm **Tạo VM**.
2. Điền **Tên**. Tên dài tối đa 64 ký tự, chỉ gồm chữ, số và dấu gạch ngang (`-`), và phải bắt đầu bằng chữ hoặc số. Tên phải khác tên các VM bạn đang có. Tên của VM đã xoá thì dùng lại được.
3. Chọn **Cluster**.
4. Chọn **Mạng**. Ô này chỉ hiện network thuộc cluster vừa chọn. Nếu cluster đó chỉ có đúng một network dùng được, ô này đã chọn sẵn network đó — bạn vẫn chọn được network khác nếu có nhiều hơn một.
5. Chọn **Template**, tức hệ điều hành. Ô này chỉ hiện template đã có ở cluster đó.
6. Chọn **Cấu hình**: Small (1 vCPU, 2 GB RAM), Medium (2 vCPU, 4 GB), Large (4 vCPU, 8 GB) hoặc Extra Large (8 vCPU, 16 GB).
7. Ở mục **Truy cập (không bắt buộc)**, chọn cách bạn sẽ đăng nhập. Không ô nào ở đây là bắt buộc: không có SSH key thì bạn đăng nhập trên [console](#mở-console-của-vm) của VM bằng mật khẩu console, hoặc thêm key sau ở trang của VM ([thêm SSH key vào VM đang chạy](#thêm-ssh-key-vào-vm-đang-chạy)).
   - Ở mục **SSH key**, đánh dấu key muốn thêm vào VM này. Xem [SSH key và đăng nhập](/vi/docs/guides/ssh-keys/) để thêm key trước. Key đã chọn được thêm cho user `ubuntu`.
   - Điền **Mật khẩu console**: 12 đến 72 ký tự, để đăng nhập user `ubuntu` trên console của VM. OpenViCloud chỉ giữ hash của nó, nên không xem lại được. VM tạo không có mật khẩu này thì không có mật khẩu console, và không đặt thêm sau được.
8. Bấm **Nâng cao** để đổi thời gian dừng hay thêm cloud-init user data. Mục này đóng sẵn; đóng lại thì chữ đã gõ vẫn giữ.
   - **Thời gian dừng (giây)**: thời gian tối đa hệ thống chờ hệ điều hành của VM tự tắt trước khi ngắt nguồn ([Tắt](#stop-start-và-resume)). Từ 30 đến 1800 giây, mặc định 120. VM cần thời gian để tắt êm, như database, nên đặt dài hơn.
   - **Cloud-init user data**: một tài liệu cloud-init, ví dụ `#cloud-config`, chạy lúc VM khởi động lần đầu. Tối đa 32768 byte.
9. Bấm **Tạo VM**.

Hãy điền đủ các ô phía trên **Truy cập (không bắt buộc)**. Khi bạn bấm **Tạo VM**, portal kiểm tên, rồi phần còn lại theo thứ tự dưới đây, chỉ báo lỗi đầu tiên tìm thấy, và không gửi gì. Lỗi ở thời gian dừng hay cloud-init user data làm mục **Nâng cao** tự mở, để bạn thấy lỗi:

- Mật khẩu console ngắn hơn 12 hay dài hơn 72 ký tự: "Mật khẩu console phải từ 12 đến 72 ký tự."
- Thời gian dừng không phải số giây nguyên từ 30 đến 1800: "Thời gian dừng phải là số giây nguyên, từ 30 đến 1800."
- Cloud-init user data dài hơn 32768 byte: "Cloud-init user data dài *n* byte, vượt giới hạn 32768."
- **Cluster**, **Mạng**, **Template** hay **Cấu hình** còn trống: "Chọn cluster, mạng, template và cấu hình."

VM mới hiện trong danh sách với trạng thái **Creating**. Khi VM chạy, trạng thái chuyển sang **Running** hoặc **Ready**, và ô **IPv4 riêng** hiện địa chỉ của VM trong network. Cột **IPv6 công khai** hiện địa chỉ của VM nếu network của nó có IPv6 công khai, hoặc "—" nếu không; ở trang riêng của VM, ô này hiện "Chưa bật" thay vì "—" khi network không có IPv6 công khai. Nếu tạo không thành, trạng thái là **Failed** kèm một dòng giải thích.

## Khi tạo VM bị từ chối

| Thông báo trên portal | Mã lỗi | Nghĩa là |
|---|---|---|
| Đã có VM trùng tên này | `VM_NAME_TAKEN` | Bạn đã có VM khác cùng tên. |
| Đã vượt hạn mức VM | `VM_QUOTA_EXCEEDED` | Bạn đã đủ số VM được phép. Mặc định là 10 VM mỗi tài khoản. |
| Cluster đã chọn không còn khả dụng — chọn cluster khác | `CLUSTER_NOT_FOUND` | Cluster bạn chọn không còn tồn tại. |
| Mạng này ở cluster khác — chọn một mạng trong cluster này | `NETWORK_CLUSTER_MISMATCH` | Network và VM phải cùng cluster. |
| Cấu hình đã chọn không còn khả dụng — chọn cấu hình khác | `VM_OFFERING_NOT_FOUND` | Cấu hình bạn chọn không còn tồn tại. |
| Template đã chọn chưa có ở cluster này — chọn template khác | `TEMPLATE_NOT_SYNCED` | Template chưa có ở cluster này. |
| Template đã chọn hiện không khả dụng — chọn template khác | `TEMPLATE_UNAVAILABLE` | Template tạm thời không dùng được ở cluster này. |
| Một SSH key đã chọn không còn nữa — hãy chọn lại | `SSH_KEY_NOT_FOUND` | Một key bạn chọn đã bị xoá trong lúc đó. |
| Tài khoản đang bị tạm ngưng — liên hệ hỗ trợ để tạo tài nguyên | `TENANT_SUSPENDED` | Tài khoản của bạn đang bị tạm ngưng. |
| Tài khoản đang chờ quản trị viên duyệt — bạn có thể xem nhưng chưa tạo được tài nguyên | `TENANT_PENDING_APPROVAL` | Tài khoản của bạn chưa được duyệt. |

VM bạn đã bấm xoá thì không còn tính vào giới hạn số VM.

## Đăng nhập vào VM

Xem [SSH key và đăng nhập](/vi/docs/guides/ssh-keys/) — thêm một key, chọn nó khi tạo VM hoặc thêm sau đó, rồi dùng CLI hoặc kết nối SSH trực tiếp. Để vào VM mà không cần SSH, mở [console](#mở-console-của-vm) của nó.

## Thêm SSH key vào VM đang chạy

Trên trang của VM, bấm **Thêm SSH key**. Nút chỉ bật khi VM đang **Running**. Bắt đầu một lần thêm thứ hai trong khi lần trước còn đang chạy sẽ bị từ chối sau khi bạn bấm **Thêm**, kèm câu "VM phải đang Running, và không có lần thêm key nào khác đang chạy." trong hộp thoại.

1. Trong hộp thoại **Thêm SSH key**, chọn 1 đến 10 SSH key đã lưu — xem [SSH key và đăng nhập](/vi/docs/guides/ssh-keys/) để thêm key trước.
2. Bấm **Thêm**.

Portal hiện **Đang thêm…**, rồi **Đang thêm key vào VM…** trong lúc chờ VM. Khi key đã vào, portal hiện **Đã thêm key** — và với một VM tạo từ trước mà chưa có SSH key nào, thêm câu "Key có hiệu lực sau khi bạn Tắt VM rồi Bật lại." (xem [Stop, Start và Resume](#stop-start-và-resume)): portal và CLI báo cho bạn biết khi nào cần vậy. Nếu không thêm được, portal hiện **Không thêm được key** kèm lý do: một key đã chọn bị xoá trong lúc đó ("Một SSH key đã chọn không còn tồn tại — chọn lại."), hoặc, ngay sau khi VM vừa lên **Running**, "The VM is still starting, so the key could not be added yet. Try again in a few minutes." trong lúc guest agent của nó chưa chạy xong.

## Mở console của VM

Bấm **Quản lý** trên hàng của VM, rồi mở tab **Console**. Tab này hiện console serial của VM: một console dạng chữ với các dòng khởi động của VM và lời nhắc đăng nhập. Dùng nó khi không vào được VM bằng SSH, ví dụ sau khi cấu hình network hay SSH của VM bị sai.

- Tab không tự kết nối: hãy bấm **Kết nối**. Mỗi phiên console tính vào 5 phiên SSH hoặc console mà tài khoản của bạn được mở cùng lúc.
- Đăng nhập bằng user `ubuntu` và mật khẩu console đặt lúc tạo VM: ô **Mật khẩu console** của hộp thoại **Tạo VM**, `--console-password-stdin` của [CLI](/vi/docs/guides/cli/), `console_password` trong [Terraform](/vi/docs/guides/terraform/), hay `consolePassword` của API. VM tạo không có mật khẩu này thì không đăng nhập bằng mật khẩu ở đây được.
- Console chỉ mở được khi VM ở trạng thái Running hoặc Ready và không có lệnh tắt, xoá hay snapshot nào đang chờ. Mỗi VM chỉ có một console tại một thời điểm: phiên thứ hai bị từ chối với câu "VM này đang có một phiên console khác. Đóng phiên đó rồi kết nối lại."
- **Ngắt kết nối**, hoặc rời tab, sẽ kết thúc phiên. Phiên không có hoạt động trong 30 phút sẽ bị đóng. Khi phiên kết thúc trong lúc bạn vẫn ở tab, tab giữ lại những gì đã hiện, và có nút **Kết nối lại** khi VM đang chạy.

## Stop, Start và Resume

- **Tắt** có khi VM ở trạng thái Running, Ready, Frozen hoặc Error. Nút này yêu cầu hệ điều hành của VM tự tắt, như khi bấm nút nguồn của máy tính, và chờ tối đa thời gian dừng của VM (120 giây nếu bạn chưa đổi). Quá thời gian đó mà VM chưa tắt thì VM bị ngắt nguồn, giống như rút điện, và dữ liệu chưa lưu bên trong VM có thể mất. VM ở Error không tắt êm được, nên bị ngắt nguồn ngay.
- **Bật** có khi VM ở trạng thái Stopped.
- **Tiếp tục** thay cho Bật khi VM ở trạng thái Frozen. Nút này cho VM chạy tiếp.

Trong lúc lệnh đang chạy, ô thao tác hiện **Creating…**, **Stopping…**, **Starting…**, **Deleting…** hoặc **Snapshotting…**, và các nút Tắt/Bật tạm ẩn. VM ở **Stopping** cho tới khi hệ điều hành tự tắt xong, hoặc tới khi hết thời gian dừng và VM bị ngắt nguồn.

### Đổi thời gian dừng

Trên trang của VM, tab **Tổng quan** có mục **Thời gian dừng**. Gõ số giây mới, từ 30 đến 1800, rồi bấm **Lưu**; portal báo "Đã lưu thời gian dừng". Giá trị mới áp dụng từ lần dừng kế tiếp: lần dừng đã yêu cầu trước đó vẫn dùng giá trị cũ. Số ngoài 30–1800 thì portal báo "Thời gian dừng phải là số giây nguyên, từ 30 đến 1800." Không đổi được thời gian dừng của VM đã xoá: "VM này đã bị xoá — không đổi được thời gian dừng nữa." VM tạo trước khi có thời gian dừng nhận 120 giây. Qua API, field là `stopTimeoutSeconds`, ở `POST /v1/tenant/vms` và `PATCH /v1/tenant/vms/{vmId}`; giá trị ngoài 30–1800 trả `400 VALIDATION_ERROR`.

## Xoá VM

1. Bấm **Xoá** trên hàng của VM.
2. Bấm **Xác nhận** trong hộp thoại "Xoá *tên VM*?".

Xoá không chờ hệ điều hành: VM bị ngắt nguồn rồi bị xoá. Xoá VM thì xoá luôn mọi snapshot của VM đó. Volume đang gắn vào VM được gỡ ra và giữ lại; volume vẫn tính tiền cho tới khi xoá xong ([volume](/vi/docs/guides/volume/)).

Bạn chưa xoá được VM trong ba trường hợp:

- VM còn đang được tạo. Nút **Xoá** bị tắt khi VM đang **Creating**; chờ VM rời **Creating** rồi hãy xoá.
- Một snapshot của VM đang được tạo hoặc đang quay về. VM hiện **Snapshotting** và nút **Xoá** bị tắt. Chờ snapshot xong rồi xoá lại.
- Một load balancer đang gửi traffic tới VM này: "Chưa xoá được: một load balancer đang gửi traffic tới máy ảo này — gỡ nó khỏi load balancer trước" (mã `VM_IS_LOAD_BALANCER_BACKEND`). Xem [load balancer](/vi/docs/guides/load-balancer/).

## Snapshot VM

Bấm **Quản lý** trên hàng của VM, rồi mở tab **Snapshot**.

**Tạo snapshot.** Bấm **Tạo snapshot**, điền tên (tối đa 100 ký tự), rồi bấm **Tạo**. Nút này có khi VM ở trạng thái Running, Ready, Stopped hoặc Frozen. Mỗi VM có tối đa 3 snapshot theo mặc định. Khi đã đủ, portal báo "Đã vượt hạn mức snapshot (tối đa 3 mỗi VM)." (mã `VM_SNAPSHOT_QUOTA_EXCEEDED`). Snapshot bạn đã bấm xoá thì không tính.

**Revert.** Nút **Quay về** có trên snapshot ở trạng thái **Available** khi không có thao tác nào đang chạy trên nó. Snapshot hiện **Reverting** tới khi xong. Revert đưa ổ đĩa của VM về lúc chụp snapshot và chỉ đụng tới ổ đĩa — size của VM và các volume đang gắn không đổi. Revert không tự tắt hay bật VM. Việc này chỉ chạy được khi VM ở trạng thái Running, Ready, Stopped hoặc Frozen; nếu không, portal báo "Không quay về được snapshot."

**Xoá snapshot.** Bấm **Xoá** trên snapshot, rồi bấm **Xác nhận**. Nút này có khi không có thao tác nào đang chạy trên snapshot; snapshot **Failed** hoặc **Not found** cũng xoá được. Nếu quay về hay xoá không thành công, snapshot giữ như trước, kèm một dòng nói lý do.

## Mức sử dụng của VM

Bấm **Quản lý** trên hàng của VM, rồi mở tab **Giám sát**. Tab này cho thấy VM dùng bao nhiêu CPU, bộ nhớ và ổ đĩa theo thời gian.

Chọn **1 giờ**, **24 giờ** hoặc **7 ngày**; tab mở ở **1 giờ**. Số liệu được giữ 7 ngày. Ở **1 giờ** mỗi điểm là một lần đo, khoảng mỗi phút một lần; **24 giờ** lấy trung bình các lần đo của mỗi 5 phút, **7 ngày** của mỗi 30 phút. Khi tab đang mở, portal đọc lại mỗi phút.

Tab có ba thẻ:

- **CPU**: phần vCPU của VM đang dùng, tính theo phần trăm. VM có nhiều vCPU thì 100% là mọi vCPU đều bận.
- **Bộ nhớ**: bộ nhớ đã dùng trên tổng bộ nhớ của VM, ví dụ "1,2 GiB trên 3,8 GiB".
- **Ổ đĩa**: dung lượng đã dùng trên filesystem gốc (`/`) của VM so với cỡ của nó, kèm biểu đồ tốc độ VM đọc và ghi ổ đĩa.

Tiêu đề mỗi thẻ hiện giá trị mới nhất. Khoảng nào không có lần đo thì đường đứt ở đó, không nối thẳng qua.

Khi chưa có gì để hiện:

- VM vừa khởi động, hay VM đã dừng suốt khoảng đã chọn, không có lần đo nào: "Chưa có số liệu. Mức sử dụng hiện ra vài phút sau khi VM khởi động."
- Dung lượng ổ đĩa cần guest agent chạy trong VM; không có agent, bộ nhớ hiện ở VM này mà không ở VM khác. Thẻ nào không có số đó suốt khoảng đã chọn thì hiện "Cần guest agent chạy bên trong VM."; CPU và tốc độ đọc, ghi ổ đĩa vẫn hiện khi không có agent.

Các số này chỉ để bạn xem: chúng không đổi hoá đơn hay hạn mức của bạn.

## VM được tính tiền khi nào

- Tiền compute tính theo giờ, theo giá của size. VM bị tính khi ở trạng thái Running, Ready, Frozen hoặc Error, và trong lúc Stopping, cho tới khi dừng xong.
- VM ở trạng thái **Stopped** không bị tính tiền compute.
- Mỗi snapshot có trên hạ tầng bị tính một mức giá cố định theo giờ, không phụ thuộc dung lượng, tới khi việc xoá xong. Snapshot đang quay về vẫn bị tính.
- Volume tính tiền riêng, xem trang [volume](/vi/docs/guides/volume/).

Giá theo giờ của từng size VM có ở [bảng giá](/vi/#pricing).
