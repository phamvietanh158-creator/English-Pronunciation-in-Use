# EPU: English Pronunciation in Use (online practice)

Trao đổi với người dùng bằng **tiếng Việt**.

## Kiến trúc V2
- `assets/epu-core.js`, `assets/epu-lesson.js`, `assets/epu-core.css`: engine dùng chung cho mọi bài. **Không sửa** khi đang làm một bài học; nếu engine thiếu tính năng, báo người dùng để mở Issue.
- Mỗi bài V2 là một file HTML chỉ chứa khối `const LESSON = {...}` + `EPU.renderLesson(LESSON)`. Bài mẫu: `sectionA/06-e-ae-sound.html`, `sectionA/02-i-i-sound.html`.
- Luật soạn bài: `docs/EPU_BUILD_RULES_V2.md` (đọc đầy đủ trước khi soạn). Tiến độ và đợt: `docs/TIEN_DO.md`. Quy trình nhóm: `CONTRIBUTING.md`.

## Khi được yêu cầu "làm bài N"
1. Kiểm tra `docs/TIEN_DO.md`: bài phải thuộc đợt đang mở; đang ở nhánh `bai-NN` (nếu chưa thì tạo từ `main`).
2. Đọc file bài cũ để lấy chất liệu, đọc bộ luật và 2 bài mẫu.
3. Copy `sectionA/06-e-ae-sound.html` đè lên file bài (giữ tên file), sửa `<title>`, `id`, viết lại toàn bộ `LESSON`.
4. Tô màu theo ÂM; IPA theo Cambridge Dictionary (nếu không chắc một từ, liệt kê cho người dùng tra lại, không đoán).
5. Chạy server `tools/serve.ps1` (cổng 8765), mở `http://localhost:8765/<file>?check`, đọc hộp `.lint` hoặc console `[EPU check]`. Sửa đến khi 0 lỗi; cảnh báo nào giữ lại phải nêu lý do.
6. Báo cho người dùng: kết quả `?check`, danh sách từ cần tra lại, những điểm máy không kiểm được (mục 7 bộ luật).
7. Chỉ commit file bài của mình. Không push, không tạo PR khi người dùng chưa yêu cầu.
