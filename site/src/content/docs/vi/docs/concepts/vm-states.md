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
| `Stopped` | VM đã tắt. VM mà bạn tắt hệ điều hành từ bên trong cũng hiện `Stopped`. |
| `Frozen` | VM đang bị tạm dừng. |
| `Error` | VM đang gặp lỗi. |
| `Not found` | OpenViCloud không còn tìm thấy VM này trên hạ tầng. |
| `Failed` | Không tạo được VM: yêu cầu dừng lại trước khi VM kịp tồn tại. Lý do hiện ngay cạnh badge, trên cùng một dòng. |
| `Unknown` | Một thao tác trên VM đã xong, nhưng chưa đọc được trạng thái của nó. Danh sách tự làm mới cho tới khi hiện được trạng thái. |

## Đang chuyển trạng thái

Khi bạn vừa bấm một nút, VM hiện trạng thái đang chuyển cho tới khi việc đó xong:

| Status | Nghĩa là |
|--------|----------|
| `Creating` | VM đang được tạo. |
| `Starting` | VM đang được bật. |
| `Stopping` | VM đang được tắt. |
| `Deleting` | VM đang được xoá. |
| `Snapshotting` | Một snapshot của VM đang được tạo hoặc đang quay về. |

Trong lúc đó, ở cột thao tác có một nút mờ, ví dụ `Stopping…`, và bạn không bấm được **Tắt** hay **Bật**. Danh sách tự làm mới cho tới khi VM tới trạng thái mới.

## Thao tác được phép

| Thao tác | Bấm được khi VM ở |
|----------|-------------------|
| **Tắt** | `Running`, `Ready`, `Frozen`, `Error` |
| **Bật** | `Stopped` |
| **Tiếp tục** | `Frozen` (nút **Bật** đổi tên thành **Tiếp tục**) |
| Tạo snapshot | `Running`, `Ready`, `Stopped`, `Frozen` |
| Gắn volume | `Running`, `Ready`, `Stopped`, `Frozen`, `Starting` |
| Phiên SSH ([đăng nhập vào VM](/vi/docs/guides/ssh-keys/)) | `Running` hoặc `Ready` |
| **Xoá** | Mọi trạng thái, trừ `Creating`, `Deleting` và `Snapshotting` |

Một số lưu ý:

- Nút **Tắt** tắt VM ngay lập tức, giống như rút điện. Hãy tắt các ứng dụng quan trọng bên trong VM trước khi bấm.
- Bạn không tạo snapshot hay gắn volume được khi VM đang `Stopping`, `Deleting` hoặc `Snapshotting`, hoặc khi VM ở `Error`. Bạn không tạo snapshot được khi VM đang `Starting`; chờ VM bật xong.
- Khi một snapshot của VM đang được tạo hoặc đang quay về, VM hiện `Snapshotting`. Bạn không bật, tắt, xoá hay mở phiên SSH tới VM được cho tới khi snapshot xong.
- Khi VM đang `Creating`, nút **Xoá** bị tắt. Chờ VM rời `Creating` rồi hãy xoá.
- Nếu bạn bấm Tắt, Bật hoặc Tiếp tục ở trạng thái không hợp lệ, portal báo *VM không ở trạng thái phù hợp cho thao tác này* (mã lỗi `VM_INVALID_STATUS`).

## Khi VM tự đổi trạng thái

Badge luôn hiện trạng thái VM đang ở. Ví dụ: nếu bạn tắt hệ điều hành từ bên trong VM, badge hiện `Stopped`. Bạn bấm **Bật** để bật lại VM.

## Trạng thái và chi phí

VM ở `Running`, `Ready`, `Frozen` hoặc `Error` được tính phí theo giờ của size VM. VM ở `Stopped` thì không bị tính phí này. Tuy vậy, volume gắn vào VM và snapshot của VM vẫn được tính phí khi VM ở `Stopped`. Giá theo giờ của từng size VM xem ở [bảng giá](/vi/#pricing).

Xem thêm: [Mã lỗi](/vi/docs/concepts/error-codes/) · [Giới hạn tài khoản](/vi/docs/concepts/quotas/)
