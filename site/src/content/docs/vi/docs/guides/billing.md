---
title: Hoá đơn và trả tiền từ ví
description: Cách OpenViCloud tính phí theo giờ, khi nào hoá đơn được phát hành, và cách trả hoá đơn bằng số dư ví.
---

OpenViCloud tính phí sau khi dùng. Mức dùng được ghi nhận trong tháng, rồi gom thành một hoá đơn tháng. Bạn trả hoá đơn bằng số dư ví. Đơn giá VM và volume xem ở [bảng giá](/vi/#pricing).

## Cái gì được tính phí

Đơn giá tính theo giờ. Mức dùng được ghi lại mỗi 10 phút.

- **VM**: tính theo đơn giá của cấu hình VM, khi VM ở trạng thái `Running`, `Ready`, `Frozen` hoặc `Error`. VM `Stopped` không bị tính phí VM.
- **Volume**: tính theo dung lượng (GB), từ khi volume tạo xong tới khi việc xoá xong, không phải lúc bạn bấm xoá. Volume vẫn bị tính khi không gắn vào VM nào.
- **Snapshot**: mỗi snapshot của VM hoặc volume tính một đơn giá theo giờ cố định, không phụ thuộc dung lượng, từ khi snapshot tạo xong tới khi việc xoá xong, không phải lúc bạn bấm xoá.

Load balancer và IPv6 công khai được miễn phí: không có dòng mức dùng và không bị tính phí.

## Xem chi phí trong tháng

Mở mục **Mức sử dụng** trong thanh điều hướng, nằm trong nhóm **Thanh toán**. Tiêu đề trang là **Thanh toán**. Dùng hai mũi tên để chuyển tháng. Bạn không chuyển được quá tháng hiện tại.

- **Tổng tháng này** là tổng chi phí của tháng, gồm VM, volume và snapshot. Hoá đơn tháng gom đúng các loại chi phí này.
- Bảng bên dưới chỉ liệt kê chi phí của từng VM. Chi phí volume và snapshot không nằm trong bảng, nên các dòng cộng lại có thể nhỏ hơn tổng.

## Khi nào có hoá đơn

Hoá đơn của một tháng được phát hành vào ngày 1 của tháng sau, lúc 02:00 UTC. Tháng tính theo giờ UTC. Bạn chỉ có hoá đơn cho tháng có ghi nhận mức dùng.

Hạn trả là 7 ngày sau ngày phát hành. Hoá đơn tổng bằng 0 tự đóng với trạng thái `Paid`, bạn không cần làm gì.

Mở trang **Hoá đơn** để xem danh sách. Mỗi hàng có các cột **Kỳ**, **Ngày phát hành**, **Hạn thanh toán**, **Tổng**, **Trạng thái** và cột **Thao tác** với nút **Trả từ ví** khi áp dụng được. Bấm vào một hàng để xem chi tiết từng tài nguyên. Cột **Loại** ghi `COMPUTE` (VM), `DISK` (volume) hoặc `SNAPSHOT`.

## Trạng thái hoá đơn

| Trạng thái | Ý nghĩa |
|---|---|
| `New` | Chưa trả, chưa tới hạn. |
| `Overdue` | Chưa trả và đã quá hạn. |
| `Processing` | Bạn vừa bấm trả, tiền đang được trừ khỏi ví. |
| `Settled` | Đã trả bằng ví. |
| `Paid` | Đã thanh toán ngoài ví, hoặc hoá đơn tổng bằng 0. |
| `Payment failed` | Lần trả từ ví không thành công. Ví không bị trừ. Nạp thêm nếu cần rồi bấm **Trả từ ví** lại. |

## Trả hoá đơn từ ví

1. Trên trang **Hoá đơn** hoặc trang chi tiết hoá đơn, bấm **Trả từ ví**. Nút hiện với hoá đơn `New` và `Overdue`.
2. Hộp thoại **Trả hoá đơn từ ví** hiện **Số tiền phải trả**, **Số dư hiện tại** và số dư **Sau khi thanh toán**.
3. Bấm nút **Trả** kèm số tiền để xác nhận.
4. Hộp thoại báo **Đã nhận thanh toán — đang xử lý.** Hoá đơn chuyển sang `Processing`, rồi sang `Settled` khi tiền đã trừ xong. Trang tự cập nhật. Dòng **Chi tiêu** xuất hiện trong sao kê ví.

Ví phải đủ tiền trả **trọn** hoá đơn. OpenViCloud không trả một phần. Nếu ví thiếu, nút **Trả từ ví** bị khoá: ở danh sách **Hoá đơn**, di chuột vào nút để xem số tiền còn thiếu; ở trang chi tiết hoá đơn, số tiền còn thiếu hiện ngay cạnh nút. Nếu ví hết đủ tiền ngay lúc bạn bấm, bạn nhận mã `INVOICE_WALLET_INSUFFICIENT` (portal báo **Ví không còn đủ tiền để trả hoá đơn này. Nạp tiền rồi thử lại.**) và không bị trừ đồng nào.

## Không có trừ tiền tự động

Tiền chỉ rời ví khi bạn bấm trả một hoá đơn cụ thể.

- Phát hành hoá đơn không trừ ví.
- Nạp ví không tự trả hoá đơn.
- Hoá đơn quá hạn chỉ là lời nhắc. Trang **Ví** hiện thông báo khi có hoá đơn quá hạn. Tài nguyên đang chạy không bị ảnh hưởng, và bạn vẫn tạo được tài nguyên mới.
