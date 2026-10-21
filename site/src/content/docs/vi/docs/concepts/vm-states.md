---
title: Trạng thái VM
description: Ý nghĩa từng trạng thái VM trong portal và những thao tác bạn làm được ở mỗi trạng thái.
---

Trang **Máy ảo** hiện trạng thái của mỗi VM bằng một badge cạnh tên VM. Trang này giải thích từng trạng thái và các nút bạn bấm được.

## Trạng thái của VM

| Status | Ý nghĩa |
|--------|---------|
| `Running` | VM đang chạy. |
| `Ready` | VM đang chạy, và hệ điều hành bên trong đã báo sẵn sàng. |
| `Stopped` | VM đã tắt. |
| `Frozen` | VM đang bị tạm dừng. |
| `Error` | VM đang gặp lỗi. |
| `Not found` | OpenViCloud không còn tìm thấy VM này trên hệ thống. |
| `Failed` | Yêu cầu tạo VM bị từ chối. Lý do hiện ngay cạnh badge, trên cùng một dòng. |
| `Unknown` | Portal chưa có thông tin về trạng thái của VM. |

## Đang chuyển trạng thái

Khi bạn vừa bấm một nút, VM hiện trạng thái đang chuyển cho tới khi việc đó xong:

| Status | Nghĩa là |
|--------|----------|
| `Creating` | VM đang được tạo. |
| `Starting` | VM đang được bật. |
| `Stopping` | VM đang được tắt. |
| `Deleting` | VM đang được xoá. |

Trong lúc đó, ở cột thao tác có một nút mờ, ví dụ `Stopping…`, và bạn không bấm được **Tắt** hay **Bật**. Danh sách tự làm mới cho tới khi VM tới trạng thái mới.

## Thao tác được phép

| Thao tác | Bấm được khi VM ở |
|----------|-------------------|
| **Tắt** | `Running`, `Ready`, `Frozen`, `Error` |
| **Bật** | `Stopped` |
| **Tiếp tục** | `Frozen` (nút **Bật** đổi tên thành **Tiếp tục**) |
| Tạo snapshot, gắn volume | `Running`, `Ready`, `Stopped`, `Frozen` |
| Phiên SSH ([đăng nhập vào VM](/vi/docs/guides/ssh-keys/)) | `Running` hoặc `Ready`, và không có lệnh stop hay xoá đang chờ |
| **Xoá** | Mọi trạng thái, trừ khi đang `Deleting` |

Một số lưu ý:

- Nút **Tắt** tắt VM ngay lập tức, giống như rút điện. Hãy tắt các ứng dụng quan trọng bên trong VM trước khi bấm.
- Bạn không tạo snapshot hay gắn volume được khi VM đang `Stopping` hoặc `Deleting`, hoặc khi VM ở `Error`.
- Khi VM còn đang `Creating` và chưa tồn tại, nút **Xoá** bị tắt. Nếu danh sách đã cũ vài giây và bạn vẫn bấm được, portal báo *Chưa xoá được: VM vẫn đang được khởi tạo. Thử lại sau một phút.* Hãy thử lại sau khoảng một phút.
- Bấm **Xoá** khi một snapshot của VM đang được tạo hoặc đang khôi phục sẽ bị từ chối với lỗi `VM_SNAPSHOT_IN_PROGRESS`.
- Nếu bạn bấm Tắt, Bật hoặc Tiếp tục ở trạng thái không hợp lệ, portal báo *VM không ở trạng thái phù hợp cho thao tác này* (mã lỗi `VM_INVALID_STATUS`).

## Khi VM không ở trạng thái bạn yêu cầu

Đôi khi VM nằm ở một trạng thái khác với yêu cầu cuối cùng của bạn. Ví dụ: bạn tắt hệ điều hành từ bên trong VM. Khi đó, badge hiện `Stopped`, và bên cạnh có dòng `yêu cầu: Running`. Bạn bấm **Bật** để bật lại VM.

## Trạng thái và chi phí

VM ở `Running`, `Ready`, `Frozen` hoặc `Error` được tính phí theo giờ của size VM. VM ở `Stopped` thì không bị tính phí này. Tuy vậy, volume gắn vào VM và snapshot của VM vẫn được tính phí khi VM ở `Stopped`. Giá theo giờ của từng size VM xem ở [bảng giá](/vi/#pricing).

Xem thêm: [Mã lỗi](/vi/docs/concepts/error-codes/) · [Giới hạn tài khoản](/vi/docs/concepts/quotas/)
