# Hướng dẫn thành viên: làm bài EPU V2

Mỗi thành viên nhận bài, làm trên **nhánh riêng**, tự kiểm tra bằng `?check`, rồi gửi **Pull Request (PR)**. Trưởng nhóm duyệt và merge.

| Tài liệu | Dùng để |
|----------|---------|
| [docs/EPU_BUILD_RULES_V2.md](docs/EPU_BUILD_RULES_V2.md) | **Luật** soạn bài: markup, schema, 5 bài tập, checklist |
| [docs/TIEN_DO.md](docs/TIEN_DO.md) | **Nhận bài** và xem tiến độ, lộ trình |
| [docs/PROMPT_AI.md](docs/PROMPT_AI.md) | Prompt mẫu nếu dùng Claude/ChatGPT để soạn nháp |
| [sectionA/06-e-ae-sound.html](sectionA/06-e-ae-sound.html) | **File mẫu** để copy |

---

## Quy trình 1 bài (6 bước)

```
① Nhận bài → ② Tạo nhánh → ③ Soạn dữ liệu → ④ Tự kiểm tra → ⑤ Gửi PR → ⑥ Duyệt & merge
 TIEN_DO.md    bai-07       copy file mẫu     ?check + Edge    GitHub       trưởng nhóm
```

### ⓪ Chuẩn bị (làm 1 lần)

1. Có tài khoản GitHub, báo trưởng nhóm để được mời vào repo (Settings → Collaborators). Mở email và bấm **Accept invitation**.
2. Cài **Git** (git-scm.com) hoặc **GitHub Desktop** (desktop.github.com, dễ hơn nếu chưa quen dòng lệnh).
3. Tải repo về máy:
   ```bash
   git clone https://github.com/phamvietanh158-creator/English-Pronunciation-in-Use.git
   ```
   GitHub Desktop: File → Clone repository → dán link trên.
4. Dùng **Microsoft Edge** để nghe thử (có giọng Natural UK/US tốt nhất).

### ① Nhận bài

- Mở [docs/TIEN_DO.md](docs/TIEN_DO.md) trên GitHub → bấm ✏️ → ở dòng bài muốn làm: điền **tên bạn**, **chủ đề X.4**, đổi ⬜ thành 🟡 → **Commit changes** (thẳng vào `main`).
- Chỉ nhận bài ⬜ thuộc đợt **đang mở**. Tối đa 2 bài cùng lúc.

### ② Tạo nhánh

```bash
git checkout main
git pull
git checkout -b bai-07
```
Tên nhánh: `bai-` + số bài 2 chữ số. GitHub Desktop: Current branch → New branch → `bai-07`.

### ③ Soạn dữ liệu

1. **Đọc bài cũ trước** để lấy chất liệu (âm, từ, câu trong sách). Mở file bài cũ trong trình duyệt hoặc editor. Sau khi ghi đè vẫn xem lại được bằng `git show main:sectionA/07-er-sound.html`.
2. **Copy file mẫu đè lên file bài** (giữ nguyên tên file cũ):
   ```bash
   cp sectionA/06-e-ae-sound.html sectionA/07-er-sound.html
   ```
3. Sửa `<title>`, `id`, rồi thay **toàn bộ** khối `LESSON` theo [bộ luật](docs/EPU_BUILD_RULES_V2.md). Chỉ sửa trong file bài của mình.
4. IPA **phải tra Cambridge Dictionary**. Nếu dùng AI soạn nháp thì theo [PROMPT_AI.md](docs/PROMPT_AI.md) và tự kiểm lại từng từ.

> 🚫 **Không sửa** `assets/`, `index.html` hay bài của người khác trong PR bài học. Cần engine làm thêm gì thì mở **Issue** trên GitHub và mô tả.

### ④ Tự kiểm tra

1. Nhấp đúp `tools/serve.bat` (Windows). Mac/Linux: chạy `python3 -m http.server 8765` trong thư mục repo.
2. Mở bằng Edge: `http://localhost:8765/sectionA/07-er-sound.html?check`
3. Hộp **🧪 Kiểm tra bài** ở đầu trang phải có **0 lỗi ❌**. Cảnh báo ⚠️ thì sửa, hoặc ghi lý do vào PR.
4. Tự rà phần máy không kiểm được (mục 7 bộ luật): tô màu theo âm, IPA, câu tự nhiên, bẫy X.4.
5. Bỏ `?check`, làm thử cả 5 bài tập; bấm 🇬🇧/🇺🇸 để nghe hai giọng; F12 → Console không có lỗi đỏ; F12 → biểu tượng điện thoại → khổ 375px không bị tràn ngang.

### ⑤ Gửi PR

```bash
git add sectionA/07-er-sound.html
git commit -m "Bài 7 V2: /ɜː/ đối chiếu /ɔː/"
git push -u origin bai-07
```
Trên GitHub bấm **Compare & pull request**. Mẫu PR sẽ tự hiện checklist: tick đủ, ghi lý do các cảnh báo còn lại. Đổi trạng thái bài trong TIEN_DO.md thành 🔵.

GitHub Desktop: tick file → viết tóm tắt → Commit → Publish branch → Create Pull Request.

### ⑥ Duyệt & merge (trưởng nhóm hoặc người được phân công)

1. Tải nhánh: `git fetch && git checkout bai-07`, mở `?check`: 0 lỗi.
2. Rà nhanh 3 thứ máy không bắt được: **tô màu** 3–4 từ bất kỳ, **IPA** 3–4 từ tra Cambridge, **X.4** đọc lại xem từ không đánh dấu có lọt âm của bài không.
3. Góp ý bằng comment trong PR; người làm sửa và push tiếp lên cùng nhánh.
4. Đạt thì **Squash and merge**, xoá nhánh, cập nhật TIEN_DO.md thành ✅.

---

## Hỏi nhanh

| Tình huống | Cách xử lý |
|------------|-----------|
| `git pull` báo conflict ở TIEN_DO.md | Hai người sửa cùng lúc. Giữ cả hai dòng thay đổi, commit lại |
| Muốn cập nhật nhánh khi `main` có thay đổi mới | `git checkout bai-07` rồi `git merge main` |
| Không nghe được giọng UK | Dùng Edge; hoặc Windows Settings → Time & language → Speech → thêm giọng English (United Kingdom) |
| Ghi âm không chạy | Phải mở qua `http://localhost…` hoặc GitHub Pages, không nhấp đúp file .html |
| Bài 1 âm, bài 3 âm, bài đuôi -s/-ed | Xem mục 5 bộ luật |
| Engine thiếu tính năng / phát hiện lỗi engine | Mở Issue, không tự sửa `assets/` |
