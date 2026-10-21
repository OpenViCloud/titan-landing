---
title: Dùng volume
description: Tạo volume, gắn vào VM và gỡ ra, xoá volume, dùng snapshot volume, và cách tính tiền volume.
---

Volume là ổ đĩa dữ liệu riêng, tách khỏi VM. Mọi thao tác nằm ở mục **Ổ đĩa** trên thanh bên trái. Trang này có tiêu đề **Ổ đĩa dữ liệu**.

## Tạo volume

1. Bấm **Tạo ổ đĩa**.
2. Điền **Tên**, tối đa 100 ký tự.
3. Chọn **Zone**. Volume chỉ gắn được vào VM cùng zone.
4. Chọn **Cấu hình ổ đĩa**. Hiện chỉ có một loại: **Standard — Dung lượng tuỳ chọn**.
5. Điền **Dung lượng (GB)**, lớn hơn 0.
6. Bấm **Tạo ổ đĩa**.

Volume mới hiện **Creating**, rồi **Available** khi đã có trên hạ tầng. Nếu tạo không thành công, volume hiện **Failed**; bạn bấm **Xoá** để bỏ nó đi.

Mỗi tài khoản có tối đa 10 volume theo mặc định. Khi đã đủ, portal báo "Đã vượt hạn mức ổ đĩa (tối đa 10)." (mã `VOLUME_QUOTA_EXCEEDED`). Volume bạn đã bấm xoá, volume **Failed** và volume **Not found** thì không tính.

## Gắn volume vào VM

1. Bấm **Gắn** trên hàng của volume. Nút này có khi volume ở trạng thái **Available**.
2. Chọn VM trong hộp thoại **Gắn ổ đĩa**. Danh sách chỉ có VM cùng zone, ở trạng thái Running, Ready, Stopped hoặc Frozen, và không đang stop hay đang xoá.
3. Bấm **Gắn**.

Volume chuyển sang **Attaching**, rồi **Attached**. Cột **Gắn vào** hiện tên VM. Mỗi volume chỉ gắn vào một VM tại một thời điểm.

## Gỡ volume khỏi VM

Bấm **Gỡ** trên hàng của volume đang ở trạng thái **Attached**. Volume chuyển sang **Detaching**, rồi về **Available**.

Nếu volume hiện **Attached outside OpenViCloud**, nghĩa là một máy không do portal quản lý đang dùng nó. Khi đó portal không cho gắn, gỡ hay xoá volume này.

## Xoá volume

1. Gỡ volume khỏi VM nếu đang gắn.
2. Xoá hết snapshot của volume.
3. Bấm **Xoá**, rồi bấm **Xác nhận**.

Nếu volume còn snapshot, portal báo "Ổ đĩa này vẫn còn snapshot. Xoá các snapshot trước, rồi mới xoá ổ đĩa." (mã `VOLUME_HAS_SNAPSHOTS`). Nếu volume còn gắn hoặc đang có thao tác chưa xong, portal báo "Chưa xoá được: ổ đĩa đang được gắn hoặc còn một yêu cầu đang chờ trên nó." Volume **Not found** (không còn trên hạ tầng) vẫn xoá được.

Khi bạn [xoá một VM](/vi/docs/guides/vm/), volume đang gắn vào VM đó được gỡ ra và giữ lại, không bị xoá.

## Snapshot volume

Bấm **Snapshot** trên hàng của volume để mở danh sách snapshot.

**Tạo snapshot.** Bấm **Tạo snapshot**, điền tên (tối đa 100 ký tự), rồi bấm **Tạo**. Nút này có khi volume ở trạng thái **Available** hoặc **Attached** và không có thao tác nào đang chạy. Snapshot mới ở trạng thái **Creating**, rồi chuyển sang **Available**.

Mỗi volume có tối đa 3 snapshot theo mặc định. Khi đã đủ, portal báo "Đã vượt hạn mức snapshot (tối đa 3 mỗi ổ đĩa)." (mã `VOLUME_SNAPSHOT_QUOTA_EXCEEDED`). Snapshot bạn đã bấm xoá thì không tính.

**Restore.** Restore không ghi đè volume gốc. Nó tạo một volume **mới** từ snapshot:

1. Bấm **Khôi phục** trên snapshot ở trạng thái **Available**.
2. Điền tên cho volume mới.
3. Bấm **Khôi phục**.

Volume mới có cùng zone, cùng offering và cùng dung lượng với volume gốc. Volume gốc và snapshot giữ nguyên. Volume mới tính vào giới hạn số volume. Khi bạn đã đủ giới hạn, restore bị từ chối và portal báo "Không khôi phục được snapshot."

**Xoá snapshot.** Bấm **Xoá** trên snapshot, rồi bấm **Xác nhận**. Khi snapshot đang có thao tác chưa xong, portal báo "Chưa xoá được: còn một yêu cầu đang chờ trên snapshot này. Vui lòng thử lại sau một phút."

## Volume được tính tiền thế nào

- Volume tính tiền theo GB theo giờ, khi volume có trên hạ tầng (**Available** hoặc **Attached**). Volume đã gỡ khỏi VM vẫn bị tính. Volume gắn vào VM đang Stopped cũng vẫn bị tính.
- Volume thôi bị tính khi việc xoá xong, không phải lúc bạn bấm xoá. Volume **Not found** không bị tính.
- Mỗi snapshot có trên hạ tầng bị tính một mức giá cố định theo giờ, không phụ thuộc dung lượng, cũng tới khi việc xoá xong.

Giá volume theo GB có ở [bảng giá](/vi/#pricing).
