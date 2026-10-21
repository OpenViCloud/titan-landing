---
title: Công cụ dòng lệnh
description: Tải, kiểm tra và cài đặt CLI openvicloud, đăng nhập, tạo và quản lý VM và SSH key, và mở phiên SSH.
---

`openvicloud` là CLI (công cụ dòng lệnh) của OpenViCloud. CLI cho phép đăng nhập, xem [tài khoản](/vi/docs/guides/account/) của bạn (CLI gọi nó là "tenant"), xem zone, template và size để chọn, tạo và quản lý VM và SSH key, và mở phiên SSH tới một VM. Network, volume, snapshot, firewall rule và load balancer, cũng như trả hoá đơn hay nạp ví, vẫn làm trên portal.

## Cài bằng một lệnh

Trên macOS hoặc Linux, chạy:

```bash
curl -fsSL https://site-staging.openvicloud.com/install.sh | sh
```

Script chọn file theo hệ điều hành và kiến trúc máy của bạn, tải nó cùng `SHA256SUMS` từ bản phát hành mới nhất của CLI trên GitHub, và không cài gì nếu file không khớp dòng của nó trong `SHA256SUMS`. Script đặt `openvicloud` vào `/usr/local/bin` khi ghi được vào đó, nếu không thì vào `~/.local/bin`, và không bao giờ hỏi `sudo`. Sau đó script chạy `openvicloud version`, và nếu thư mục đã cài không nằm trong `PATH`, script in dòng cần thêm vào file cấu hình shell của bạn.

File tải bằng `curl` không mang cờ quarantine, nên macOS chạy được ngay, không cần bước `xattr` của [cài tay](#cài-đặt).

Trên Windows, hoặc khi muốn cài tay, làm theo các bước dưới.

## Tải về

CLI được phát hành trên GitHub: mọi file dưới đây lấy từ [bản phát hành mới nhất](https://github.com/OpenViCloud/cli/releases/latest) của [OpenViCloud/cli](https://github.com/OpenViCloud/cli), nơi có cả mã nguồn của CLI. Chọn file theo hệ điều hành và kiến trúc máy của bạn.

| Hệ điều hành | Kiến trúc | Tải về |
|---|---|---|
| macOS | Apple silicon | [openvicloud-darwin-arm64](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-darwin-arm64) |
| macOS | Intel | [openvicloud-darwin-amd64](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-darwin-amd64) |
| Linux | x86_64 | [openvicloud-linux-amd64](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-linux-amd64) |
| Linux | arm64 | [openvicloud-linux-arm64](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-linux-arm64) |
| Windows | x86_64 | [openvicloud-windows-amd64.exe](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-windows-amd64.exe) |
| Windows | arm64 | [openvicloud-windows-arm64.exe](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-windows-arm64.exe) |

Tải thêm [SHA256SUMS](https://github.com/OpenViCloud/cli/releases/latest/download/SHA256SUMS) vào cùng thư mục với file CLI, để kiểm tra ở bước sau.

## Kiểm tra file đã tải

Checksum giúp xác nhận file tải về đầy đủ và khớp với file được công bố cùng nó.

**macOS**, trong thư mục chứa cả hai file:

```bash
shasum -a 256 -c SHA256SUMS --ignore-missing
```

**Linux**, cùng thư mục đó:

```bash
sha256sum -c SHA256SUMS --ignore-missing
```

**Windows**, trong PowerShell:

```powershell
Get-FileHash .\openvicloud-windows-amd64.exe -Algorithm SHA256
```

(dùng đúng tên file bạn đã tải). PowerShell in hash bằng chữ hoa, còn `SHA256SUMS` ghi bằng chữ thường. So sánh hai chuỗi từng ký tự, bỏ qua phân biệt hoa/thường.

Trên macOS hoặc Linux, file tải đúng sẽ in ra một dòng kết thúc bằng `OK`, ví dụ `openvicloud-darwin-arm64: OK`. Cờ `--ignore-missing` bỏ qua các dòng của file bạn chưa tải, thay vì báo lỗi vì chúng.

### Kiểm tra chữ ký (không bắt buộc)

`SHA256SUMS` được ký bằng khoá phát hành của OpenViCloud, fingerprint `BB74 B8EC F2BA A232 1296  E3BA 6200 9A5A 7C77 9F46`. Nếu máy có GnuPG, tải chữ ký và khoá công khai vào cùng thư mục rồi kiểm tra:

```bash
curl -fsSLO https://github.com/OpenViCloud/cli/releases/latest/download/SHA256SUMS.sig
curl -fsSLO https://raw.githubusercontent.com/OpenViCloud/cli/main/openvicloud-release.asc
gpg --import openvicloud-release.asc
gpg --verify SHA256SUMS.sig SHA256SUMS
```

File đúng sẽ in `Good signature from "OpenViCloud Release <sysadmin@openvicloud.com>"`. GnuPG có thể cảnh báo thêm rằng khoá chưa được chứng nhận bởi một chữ ký tin cậy: khi đó hãy so fingerprint nó in ra với fingerprint ở trên.

## Cài đặt

**macOS và Linux**

1. Cấp quyền thực thi cho file rồi đổi tên:
   ```bash
   chmod +x openvicloud-darwin-arm64
   mv openvicloud-darwin-arm64 openvicloud
   ```
   (dùng đúng tên file bạn đã tải)
   File CLI không có chữ ký mã của Apple. Trên macOS, file tải bằng trình duyệt mang cờ quarantine, và macOS dừng file ngay khi nó chạy: terminal chỉ in `killed`. Gỡ cờ đó trước khi chuyển file đi:
   ```bash
   xattr -d com.apple.quarantine openvicloud
   ```
2. Chuyển file vào một thư mục nằm trong `PATH`, ví dụ:
   ```bash
   sudo mv openvicloud /usr/local/bin/
   ```

**Windows**

1. Đổi tên file đã tải thành `openvicloud.exe`.
2. Chuyển file vào một thư mục nằm trong `PATH`.

## Đăng nhập

```bash
openvicloud auth login
```

CLI in ra một trang để mở và một mã để kiểm tra, thử tự mở trình duyệt tới trang đó, rồi chờ (thông báo của CLI giữ nguyên tiếng Anh):

```
To log in, open this page and check that it shows the code <CODE>:
  <login page URL>
Waiting for you to confirm in the browser...
```

Đăng nhập vào OpenViCloud trên trang đó và xác nhận mã. CLI sau đó in ra:

```
Logged in to <api> as <username>
```

Nếu bạn từ chối mã trên trình duyệt, CLI báo đăng nhập bị từ chối và không lưu gì. Nếu bạn chờ quá lâu và mã hết hạn, CLI bảo bạn chạy lại `openvicloud auth login`.

Bạn phải đồng ý điều khoản sử dụng hiện hành trên portal trước khi các lệnh cần tới tài khoản (như `tenant get` và `vm ssh`) chạy được. Nếu chưa, lệnh sẽ dừng lại với:

```
you have not accepted the current terms of service: accept them at <portal>, then run the command again
```

Nếu bạn đăng nhập trước khi đồng ý điều khoản, `auth login` vẫn thành công, và CLI thêm một dòng nhắc:

```
Before you use the CLI, accept the current terms of service at <portal>
```

Xem [đăng ký và chờ duyệt](/vi/docs/guides/sign-up/) để biết bước đồng ý điều khoản.

Sau khi đăng nhập, phiên của bạn còn dùng được miễn là bạn chạy một lệnh có dùng tới tài khoản (như `tenant get` hoặc `vm ssh`) ít nhất một lần mỗi 30 ngày; CLI tự làm mới phiên khi cần, không bắt bạn đăng nhập lại. Phiên được lưu trong file `~/.config/openvicloud/session.json` (trên Windows, nằm dưới thư mục hồ sơ người dùng của bạn), hoặc dưới `$XDG_CONFIG_HOME/openvicloud/` thay vào đó nếu bạn có đặt biến này. Trên macOS và Linux, thư mục và file đó được đặt quyền để chỉ bạn đọc được.

Các lệnh khác về tài khoản:

- `openvicloud auth status` — hiện bạn đang đăng nhập với tên gì, dùng API và login server nào.
- `openvicloud auth logout` — thu hồi phiên và xoá nó khỏi máy. Nếu máy chủ không xác nhận thu hồi được, file vẫn bị xoá, và lệnh kết thúc bằng một lỗi nói rằng phiên có thể vẫn còn hiệu lực phía máy chủ tới khi hết hạn.

## Dùng token API thay cho đăng nhập

Với CI và script, không mở được trình duyệt, hãy tạo một [token API](/vi/docs/guides/api-tokens/) trên portal rồi đặt vào biến môi trường:

```bash
export OPENVICLOUD_TOKEN=ovc_...
openvicloud vm list
```

Khi `OPENVICLOUD_TOKEN` có giá trị, mọi lệnh — kể cả `vm ssh` — dùng token và bỏ qua phiên đăng nhập đã lưu (phiên vẫn còn trên máy). Nếu API từ chối token, lệnh báo token trong `OPENVICLOUD_TOKEN` bị từ chối (đã xoá, hết hạn, hoặc gõ sai) thay vì bảo bạn đăng nhập lại. Việc kiểm điều khoản sử dụng vẫn áp dụng.

## Các lệnh hiện có

- `openvicloud auth login` / `logout` / `status`
- `openvicloud tenant get` — hiện thông tin tenant của bạn: ID, tên, trạng thái, số VM tối đa, số network tối đa, và ngày tạo.
- `openvicloud zone list` / `template list [--zone <zone>]` / `size list` — những gì bạn chọn khi tạo VM. `size list` hiện số vCPU, bộ nhớ và giá mỗi giờ (VND) của từng size.
- `openvicloud vm list` / `get` / `create` / `rename` / `start` / `stop` / `delete` — xem [tạo và quản lý VM](#tạo-và-quản-lý-vm).
- `openvicloud ssh-key add` / `list` / `delete` — xem [SSH key](#ssh-key).
- `openvicloud vm ssh <tên hoặc id VM>` — mở phiên SSH tới một VM.
- `openvicloud version` — hiện phiên bản CLI và API, login server đang dùng.
- `openvicloud help` và `openvicloud completion` — trợ giúp có sẵn và script tự động hoàn thành (autocompletion) cho shell.

Mọi lệnh đều nhận cờ `-o, --output table` (mặc định) hoặc `-o, --output json`. Lệnh in kết quả (các lệnh `list`, `get`, `tenant get`, `auth status`, `version`, và ID mà lệnh tạo trả về) in theo định dạng đó; với `json` là nguyên đối tượng API trả về, giá giữ đủ mọi chữ số. Lệnh chỉ gửi yêu cầu (`start`, `stop`, `delete`, `rename`) in một dòng báo đã gửi, dòng này không thuộc kết quả; có `--wait` thì `start` và `stop` sau đó in VM theo định dạng đó.

Mọi việc khác — network, volume, snapshot, firewall rule, load balancer, trả hoá đơn hay nạp ví — vẫn làm trên portal.

## Tạo và quản lý VM

Xem những gì có để chọn, rồi tạo VM:

```bash
openvicloud zone list
openvicloud template list --zone <zone>
openvicloud size list
openvicloud vm create web-1 --zone <zone> --network <network> --template Ubuntu-22.04-Standard --size <size> --ssh-key laptop
```

Bắt buộc có `--zone`, `--network`, `--template` và `--size`. Network phải có sẵn (tạo trên portal). Network, template, size và SSH key cho theo tên hoặc ID. `--ssh-key` lặp được để thêm nhiều key; không có key thì bạn không đăng nhập được vào VM. `--disk-size <GB>` đặt dung lượng đĩa. Tên nào không khớp, CLI báo tên đó và không tạo gì.

Lệnh tạo in ID của VM mới. VM được tạo tiếp ở phía sau; thêm `--wait` để chờ tới khi VM Running hoặc Ready rồi in VM ra:

```bash
openvicloud vm create web-1 --zone <zone> --network <network> --template Ubuntu-22.04-Standard --size <size> --ssh-key laptop --wait
```

Nếu mạng rớt lúc đang gửi lệnh tạo, CLI gửi lại, tổng cộng tối đa ba lần gửi. Mọi lần gửi mang cùng một khoá yêu cầu, nên bạn vẫn chỉ có một VM.

Các lệnh VM khác nhận tên hoặc ID của VM:

- `openvicloud vm list` — các VM của bạn (trừ VM đã xoá): tên, ID, zone, trạng thái, yêu cầu đang chờ, địa chỉ IPv4.
- `openvicloud vm get <vm>` — chi tiết một VM, kể cả lý do nếu tạo VM thất bại.
- `openvicloud vm stop <vm>` / `vm start <vm>` — dừng một VM, hoặc bật VM đã dừng (`start` cũng tiếp tục một VM Frozen). VM đã dừng không bị tính tiền máy.
- `openvicloud vm rename <vm> <tên mới>`
- `openvicloud vm delete <vm>` — hỏi bạn gõ `y` trước khi xoá VM và đĩa của nó; `--yes` bỏ qua câu hỏi.

`create`, `start`, `stop` và `delete` nhận `--wait`, và `--timeout` (mặc định `10m`) để đổi thời gian chờ. CLI xem VM mỗi 5 giây tới khi yêu cầu xong:

- `create` và `start` thành công khi VM Running hoặc Ready, `stop` khi VM Stopped, `delete` khi VM đã xoá.
- Yêu cầu kết thúc kiểu khác — tạo thất bại, hoặc VM ở trạng thái khác — lệnh in lý do và kết thúc với mã thoát 1.
- Hết thời gian chờ, lệnh nói VM còn đang chờ gì và kết thúc với mã thoát 1; yêu cầu vẫn tiếp tục, `openvicloud vm get <vm>` cho bạn xem.

Không có `--wait`, lệnh trả về ngay khi yêu cầu được nhận. Ý nghĩa từng trạng thái ở [trạng thái VM](/vi/docs/concepts/vm-states/).

## SSH key

```bash
openvicloud ssh-key add laptop --public-key-file ~/.ssh/id_ed25519.pub
openvicloud ssh-key list
openvicloud ssh-key delete laptop
```

`add` đọc public key từ file và in ID của key mới. `list` hiện tên, ID, loại và fingerprint của từng key. `delete` hỏi bạn gõ `y` trước (`--yes` bỏ qua câu hỏi); VM đã có key vẫn giữ key đó. Loại key được nhận và giới hạn ở [SSH key](/vi/docs/guides/ssh-keys/).

## SSH vào một VM

```bash
openvicloud vm ssh <tên hoặc id VM>
```

Lệnh này dùng chương trình `ssh` có sẵn trên máy bạn, nên `ssh` phải được cài và nằm trong `PATH` — nếu không, CLI báo `ssh is not installed or not on PATH`. VM phải:

- có một trong các [SSH key](/vi/docs/guides/ssh-keys/) của bạn được chọn lúc tạo VM, và
- đang ở trạng thái **Running** hoặc **Ready**.

VM không cần địa chỉ công khai: OpenViCloud chuyển tiếp phiên làm việc, nên lệnh này dùng được trên mọi network.

Mặc định CLI đăng nhập với user `ubuntu`, chính là user mà SSH key bạn chọn được thêm vào. Dùng `--user <tên>` để đăng nhập với user khác.

Mọi tham số sau `--` được chuyển cho `ssh`, ví dụ để chọn key hoặc chạy một lệnh thay vì mở shell:

```bash
openvicloud vm ssh web-1 -- -i ~/.ssh/id_ed25519
openvicloud vm ssh web-1 -- uptime
```

Mã thoát của lệnh chính là mã thoát của `ssh`.

Lưu ý:

- Tài khoản của bạn mở được tối đa 5 phiên SSH cùng lúc (tính chung cho mọi người trong tài khoản). Một phiên không có hoạt động trong 30 phút sẽ bị đóng.
- Ngay sau khi VM vừa khởi động xong, một phiên có thể kết thúc gần như ngay lập tức. Nếu gặp vậy, chờ một chút rồi thử lại.
- Nếu tên hoặc id không khớp VM nào của bạn, CLI in `no VM named "<name>" in your tenant: see your VMs on the portal`.
- Nếu phiên bị từ chối vì lý do khác (ví dụ VM chưa ở trạng thái Running hoặc Ready), CLI in ra một lỗi. Hãy kiểm tra trạng thái VM trên portal rồi thử lại khi VM đã Running hoặc Ready.

## Hiểu các thông báo lỗi

Khi một lệnh thất bại, CLI diễn giải các mã lỗi thường gặp bằng câu của riêng nó — ví dụ tài khoản bạn không thuộc tenant nào, tenant của bạn đang bị suspend, hoặc đang chờ duyệt. Nếu phiên đăng nhập không còn được chấp nhận, CLI bảo bạn chạy lại `openvicloud auth login`; nếu bạn dùng `OPENVICLOUD_TOKEN`, CLI báo token bị từ chối.

Xem đầy đủ danh sách mã lỗi và ý nghĩa ở trang [mã lỗi](/vi/docs/concepts/error-codes/).
