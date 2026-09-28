# Prompt mẫu: dùng AI soạn nháp bài V2

AI soạn nháp nhanh nhưng **hay sai IPA, hay tô màu theo chữ, hay dùng lại từ đã học**. Luôn chạy `?check` và tra Cambridge trước khi gửi PR.

---

## Cách 1: Claude Code (khuyên dùng)

Repo có sẵn [CLAUDE.md](../CLAUDE.md) nên Claude Code tự đọc luật. Mở Claude Code trong thư mục repo, đang ở nhánh `bai-XX`, gõ:

```
Làm bài 7 theo workflow V2 trong CLAUDE.md. Âm: /ɜː/, đối chiếu /ɔː/. Chủ đề X.4: đi lại/hỏi đường.
Sau khi xong, chạy ?check và báo cho tôi các lỗi/cảnh báo còn lại.
```

---

## Cách 2: Claude.ai / ChatGPT (chat thường)

**Đính kèm 3 file:** `docs/EPU_BUILD_RULES_V2.md`, `sectionA/06-e-ae-sound.html` (mẫu), và **file bài cũ** cần làm. Dán prompt sau, sửa phần trong `<< >>`:

```
Bạn là giáo viên phát âm tiếng Anh cho người Việt, soạn bài theo bộ luật EPU V2 đính kèm.

Nhiệm vụ: viết khối `const LESSON = {...}` cho Bài <<7>>, âm <</ɜː/ đối chiếu /ɔː/>>,
dùng đúng cấu trúc file mẫu 06-e-ae-sound.html. Lấy chất liệu (âm, từ, câu) từ file bài cũ đính kèm,
nhưng viết lại theo luật V2.

Bắt buộc:
1. Tô màu theo ÂM: [chữ|key] chỉ bọc đúng phần chữ đọc thành âm đó. Không tô chữ câm, schwa, từ chức năng đọc yếu.
2. IPA theo Cambridge Dictionary, không kèm dấu /. Dùng {uk:"…", us:"…"} khi hai giọng khác nhau.
3. rules và traps có mã. Ví dụ trong bảng quy tắc không được trùng với từ X.2.
4. 10–11 từ/âm, 6 câu/âm (1 câu địa kỹ thuật, geo:true).
5. X.1: 8 cặp câu giống hệt nhau trừ 1 từ, nghĩa khác nhau thật, ngữ pháp không lộ đáp án.
6. X.2: 12–13 từ HOÀN TOÀN MỚI (không xuất hiện ở bất kỳ đâu phía trên), 3–4 bẫy s:"other", mỗi từ có mã rule.
7. X.3: 5 cụm ngắn hằng ngày + tip; 4 mục checklist; 3 cặp asr.
8. X.4: chủ đề <<đi lại/hỏi đường>>, 6–8 lượt thoại có dịch tiếng Việt, ≥ 12 từ đích, ≥ 4 bẫy [từ|!ghi chú],
   từ mơ hồ dùng [từ|~]. userRole là vai có nhiều từ đích hơn.
9. X.5: 7–9 nhóm, trộn với ≥ 2 âm dễ nhầm của bài khác, toàn từ mới.
10. Câu tự nhiên, người bản xứ thật sự nói. Tiếng Việt ngắn gọn, dễ hiểu.

Chỉ trả về khối JavaScript `const LESSON = { ... };`, không giải thích.
Cuối cùng liệt kê riêng những từ bạn KHÔNG chắc IPA hoặc cách tô màu để tôi tra lại.
```

Dán kết quả thay khối `LESSON` trong file bài, chạy `?check`.

---

## Prompt sửa lỗi sau khi chạy `?check`

```
Trang ?check báo các lỗi và cảnh báo sau cho khối LESSON bạn vừa viết:
<<dán nội dung hộp 🧪 Kiểm tra bài>>
Sửa đúng những chỗ đó, giữ nguyên phần khác. Trả về khối LESSON đầy đủ.
```

## Prompt tự rà (phần máy không kiểm được)

```
Rà lại khối LESSON này, chỉ liệt kê vấn đề, không viết lại:
1. Từ nào tô màu sai (tô chữ câm, schwa, chữ đọc thành âm khác, hoặc bỏ sót)?
2. IPA nào khác Cambridge Dictionary (UK và US)?
3. Trong X.4, từ nào KHÔNG đánh dấu nhưng thực ra có chứa âm của bài?
4. Cặp X.1 nào nghĩa không khác thật, hoặc ngữ pháp để lộ đáp án?
5. Câu nào không tự nhiên?
```
