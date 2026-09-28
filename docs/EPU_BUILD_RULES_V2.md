# EPU V2: Quy tắc xây dựng bài

> **Bài mẫu chuẩn:** [Bài 2](../sectionA/02-i-i-sound.html) (/iː/ /ɪ/) và [Bài 6](../sectionA/06-e-ae-sound.html) (/e/ /æ/).
> **Nguyên tắc:** một bộ máy chung, mỗi bài chỉ là dữ liệu. Muốn sửa giao diện, âm thanh hay cách chấm thì chỉ sửa `assets/`, cả 49 bài cùng được cập nhật.
> Quy trình làm việc nhóm (nhận bài, nhánh, PR): xem [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## 0. MỤC TIÊU SƯ PHẠM (lý do của mọi luật bên dưới)

Sau mỗi bài, người học phải:
1. **Nhận ra** âm trong **từ chưa từng gặp**, không phải nhớ lại danh sách đã học.
2. **Tự đoán** cách đọc từ chính tả nhờ **quy tắc có mã** (E1, A1…) và biết các **bẫy**.
3. **Nói ra** được âm đó (ghi âm, nghe lại giọng mình).
4. Dùng âm trong **câu và tình huống hằng ngày**, không học từ đơn.

Ít mà chất: 10–11 từ/âm, 6 câu/âm, đúng 5 bài tập.

---

## 1. CẤU TRÚC

```
English-Pronunciation-in-Use-main/
├── assets/            # BỘ MÁY CHUNG. Chỉ người phụ trách engine được sửa
│   ├── epu-core.js    #   giọng đọc UK/US, ghi âm, nhận dạng giọng, chấm điểm, lưu tiến độ
│   ├── epu-lesson.js  #   dựng trang từ LESSON + 5 bài tập + chế độ kiểm tra ?check
│   └── epu-core.css   #   giao diện chung
├── docs/              # luật, tiến độ, prompt AI
├── tools/serve.bat    # nhấp đúp để xem thử trên máy
└── sectionA/06-e-ae-sound.html   # ~220 dòng: chỉ có khối LESSON = {…}
```

File bài học luôn có dạng:
```html
<title>Bài 6 - /e/ và /æ/ | Bread and jam</title>
<link rel="stylesheet" href="../assets/epu-core.css">
<div id="app"></div>
<script src="../assets/epu-core.js"></script>
<script src="../assets/epu-lesson.js"></script>
<script> const LESSON = { … }; EPU.renderLesson(LESSON); </script>
```
- Giữ nguyên **tên file cũ** để `index.html` vẫn liên kết đúng.
- Làm bài mới: **copy `sectionA/06-e-ae-sound.html`** rồi thay dữ liệu.

---

## 2. MARKUP (quan trọng nhất: tô màu theo ÂM, không theo CHỮ)

| Cú pháp | Nghĩa | Ví dụ |
|---------|-------|-------|
| `[ea\|e]` | chữ **ea** đọc là âm có key `e` | `br[ea\|e]d` |
| `[a\|ae@us]` | chỉ tô khi đang chọn giọng 🇺🇸 (`@uk` tương tự) | `s[a\|ae@us]mples` (🇬🇧 đọc /ɑː/) |
| `[ea]` | (X.2) phần chữ người học phải đoán, tô vàng | `m[ea]dow` |
| `[word\|e]` | (X.1, X.3, X.4) từ đích | `[bread\|e]` |
| `[word\|ae,e]` | (X.4) từ chứa cả 2 âm | `[flatbread\|ae,e]` |
| `[word\|!ghi chú]` | (X.4) **bẫy**: chọn nhầm sẽ hiện ghi chú | `[card\|!a + r đọc /ɑː/ (B4).]` |
| `[word\|~]` | (X.4) không chấm (từ mơ hồ, đọc mạnh/yếu tuỳ ngữ cảnh) | `[be\|~]` |

**Luật tô màu:**
- Chỉ tô phần chữ **thật sự** đọc thành âm đó.
- Không tô chữ câm (twelv**e**), schwa (sev**e**n, âm tiết thứ 2), chữ đọc thành âm khác (th**e**se là /iː/).
- Không tô từ chức năng khi chúng đọc yếu (can, and, at, was).
- Từ đọc khác nhau giữa UK và US: dùng `@us` / `@uk`.

**IPA:** viết `"bred"` (không kèm dấu `/`, engine tự thêm) nếu 2 giọng giống nhau; viết `{uk:"ˈweð.ə", us:"ˈweð.ɚ"}` nếu khác nhau. **Luôn tra Cambridge Dictionary** (dictionary.cambridge.org), không lấy IPA từ AI.

---

## 3. SCHEMA DỮ LIỆU `LESSON`

| Trường | Bắt buộc | Nội dung |
|--------|:-:|----------|
| `id, section, title, emoji, sub, theme[2], footer` | ✅ | Header. `theme` = 2 màu gradient, mỗi bài một màu |
| `sounds{key:{ipa,name,color,bg,ex[]}}` | ✅ | 2–3 âm (xem mục 5 với bài 1 âm). `ex[0]` làm nhãn đáp án trong X.2. Key chỉ dùng chữ thường không dấu: `ii`, `i`, `th`, `dh`… |
| `soundCards[{key,how[],vn,ukus,mistake}]` | ✅ | Cách phát âm · so với tiếng Việt · 🇬🇧/🇺🇸 · lỗi hay gặp |
| `pairs[[w1,ipa1,w2,ipa2]]` | ✅ | 6–8 cặp tối thiểu (không dùng lại ở X.1, X.5) |
| `rules[{code,key,spell,ex,note,accent?}]` | ✅ | Quy tắc chính tả **có mã** (E1, A1…) |
| `traps[{code,sound,spell,ex,note,accent?}]` | ✅ | Bẫy: chữ giống nhưng âm khác (B1…, T1…) |
| `words{key:[{w,ipa,vi}]}` | ✅ | **10–11 từ/âm** |
| `sentences{key:[{t,ipa,vi,geo?}]}` | ✅ | **6 câu/âm**, có ít nhất 1 câu địa kỹ thuật (`geo:true`) |
| `tips[]` | | 3–4 mẹo |
| `x1{n,after,bank[{a:{t,m},b:{t,m}}]}` | ✅ | xem mục 4 |
| `x2{items[{w,s,ipa,rule,real?,note?}]}` | ✅ | `s` = key âm hoặc `"other"`; có thể là `{uk,us}` |
| `x3{items[{t,tip}],checklist[],asr[[w1,w2]]}` | ✅ | |
| `x4{title,place,roles{A,B},userRole,lines[[role,text,vi]]}` | ✅ | |
| `x5{rounds,goal,groups[[{w,ipa}]]}` | ✅ | |
| `summary[]` | ✅ | 6 ý chốt |

---

## 4. 5 BÀI TẬP CỐ ĐỊNH (vòng lặp NGHE → ĐOÁN → NÓI → DÙNG → ÔN)

| # | Tên | Luật nội dung |
|---|-----|---------------|
| **X.1 👂** | Nghe câu, chọn nghĩa | Ngân hàng **8 cặp câu**, mỗi lần lấy ngẫu nhiên 6. Hai câu **giống hệt nhau trừ 1 từ**, cả hai đều hợp nghĩa và nghĩa phải khác nhau thật. Đáp án là nghĩa (emoji + tiếng Việt). Không đạt: *The men **are** / The man **is*** (ngữ pháp để lộ đáp án), *Where's the team / Where's Tim* (mạo từ để lộ đáp án) |
| **X.2 🔍** | Từ lạ: đoán trước, nghe sau | **12–13 từ, 100% không có ở phần lý thuyết** (kể cả cột ví dụ, ghi chú, mẹo). Có **3–4 bẫy** (`s:"other"`) và ≥ 1 từ khác nhau UK/US nếu âm có khác biệt. Mỗi từ có `rule` là mã quy tắc |
| **X.3 🗣️** | Nói & so sánh | 5 cụm/câu ngắn hằng ngày, mỗi cụm có `tip` khẩu hình · 4 mục tự kiểm tra · 3 cặp minimal pair cho nhận dạng giọng |
| **X.4 💬** | Tình huống | Cảnh đời thường 6–8 lượt thoại, có dịch tiếng Việt. **≥ 12 từ đích, ≥ 4 bẫy**. Mọi từ **không** đánh dấu phải chắc chắn không chứa âm của bài; từ mơ hồ dùng `~`. `userRole` là vai có **nhiều từ đích hơn** |
| **X.5 🔁** | Ôn xen kẽ | 7–9 nhóm, mỗi lần 8 câu hỏi. Từ bài 3 trở đi trộn **≥ 2 âm dễ nhầm từ bài khác** (ví dụ *tack / tuck / tech / tick*). Toàn bộ là từ mới (không có ở lý thuyết và X.2) |

**Chủ đề X.4 (xoay vòng, không lặp lại với bài liền trước):** quán ăn/cà phê · mua sắm · phòng khám · đi lại/hỏi đường · khách sạn/điện thoại · công sở · công trường/phòng thí nghiệm. Xem cột "Chủ đề X.4" trong [TIEN_DO.md](TIEN_DO.md) để tránh trùng.

---

## 5. CÁC LOẠI BÀI ĐẶC BIỆT (engine hiện tại đã chạy được)

| Loại | Bài | Cách khai báo `sounds` |
|------|-----|------------------------|
| **Bài 1 âm** | 7, 20, 21, 22 | Thêm **1 âm đối chiếu** người Việt hay nhầm làm key thứ 2. Đề xuất: 7 → /ɜː/ đối chiếu /ɔː/ (*work/walk*) · 20 → /h/ đối chiếu "không có h" (`ipa:"(không h)"`, *hear/ear, hold/old*) · 21 → /l/ đối chiếu /n/ (*light/night*) · 22 → /r/ đối chiếu /l/ (*right/light*). Âm đối chiếu vẫn cần soundCard, 10–11 từ, 6 câu, nhưng có thể ngắn hơn |
| **Bài 3 âm** | 9, 19 | 3 key. X.4 click 1/2/3 lần tương ứng 3 âm. X.1 vẫn là cặp 2 câu |
| **Bài quy tắc đuôi** | 42 (-s), 43 (-ed) | Coi 3 cách đọc là 3 "âm": 42 → `s` /s/, `z` /z/, `iz` /ɪz/ · 43 → `t` /t/, `d` /d/, `id` /ɪd/. Markup tô phần đuôi: `walk[ed\|t]`, `play[ed\|d]`, `want[ed\|id]`. `rules` = quy tắc theo **âm cuối** của động từ (vô thanh, hữu thanh, t/d). X.1 = hiện tại hay quá khứ (*I walk / walked to work*) |

**Chưa làm được bằng engine hiện tại** (cần mở rộng engine trước, thành viên chưa nhận): cụm phụ âm 24–27, trọng âm và âm yếu 28–41, ngữ điệu 44–50. Xem Đợt 4 trong [TIEN_DO.md](TIEN_DO.md).

---

## 6. AUDIO (đã nằm trong `epu-core.js`, không viết lại ở từng bài)

- Giọng **🇬🇧 UK mặc định**, nút chuyển 🇬🇧/🇺🇸 trên cùng (lựa chọn được lưu lại).
- Chỉ nhận giọng đúng `en-GB` / `en-US`. Ưu tiên: **Microsoft Natural (Edge)** → Google → Apple → Windows. **Không** dùng en-AU, en-IE.
- `pitch = 1.0` · rate từ/câu 0.9 · chậm 0.7 · **không bao giờ dưới 0.7**.
- Hội thoại X.4: vai A giọng 1, vai B giọng 2 (nếu máy có).
- **Nghe thử bằng Edge** (có giọng Natural). Chrome/Firefox trên Windows có thể chỉ có giọng Mỹ kém.
- **Giai đoạn 2 (MP3):** nếu có `window.EPU_AUDIO = {uk:{slug:"../audio/uk/slug.mp3"}, us:{…}}` thì phát MP3, không có thì dùng TTS.

---

## 7. KIỂM TRA TỰ ĐỘNG: `?check`

Mở bài với đuôi `?check`, ví dụ `http://localhost:8765/sectionA/07-er-sound.html?check`. Đầu trang hiện hộp **🧪 Kiểm tra bài**:

| Máy tự kiểm | Máy KHÔNG kiểm được (phải tự rà) |
|-------------|----------------------------------|
| Đủ trường bắt buộc, `id` khớp tên file | Tô màu có đúng âm không |
| Markup dùng key âm có thật, hậu tố `@uk/@us` | IPA có đúng Cambridge không |
| Số lượng: từ, câu, cặp, X.1–X.5, summary | Câu có tự nhiên không, nghĩa X.1 có khác thật không |
| X.2 và X.5 **không trùng** phần lý thuyết | Từ không đánh dấu trong X.4 có thật sự không chứa âm |
| Mã quy tắc trong X.2 có trong bảng | Nghe thử bằng giọng UK và US |
| X.1 hai câu chỉ khác 1 từ · X.4 đủ đích/bẫy, `userRole` đúng | |

- ❌ **Lỗi**: phải về 0 trước khi gửi PR.
- ⚠️ **Cảnh báo**: sửa nếu được; nếu cố ý giữ thì ghi lý do trong PR (ví dụ Bài 2 không có từ khác UK/US vì /iː/ /ɪ/ giống nhau ở hai giọng).

---

## 8. CHECKLIST MỖI BÀI

```
[ ] Copy 06-e-ae-sound.html, giữ tên file cũ; sửa <title> và id
[ ] theme màu mới · sounds (màu các âm tương phản nhau)
[ ] Tô màu theo ÂM: rà từng từ và câu (chữ câm, schwa, từ đọc yếu thì không tô)
[ ] IPA tra Cambridge; dùng {uk,us} khi 2 giọng khác nhau
[ ] rules + traps có mã; ví dụ trong bảng KHÔNG trùng từ ở X.2
[ ] 10–11 từ/âm · 6 câu/âm (≥ 1 câu địa kỹ thuật)
[ ] X.1: 8 cặp câu, đổi nghĩa thật, không lộ đáp án qua ngữ pháp
[ ] X.2: 12–13 từ mới, 3–4 bẫy, đủ mã quy tắc
[ ] X.3: 5 cụm + 4 checklist + 3 cặp nhận dạng giọng
[ ] X.4: ≥ 12 từ đích, ≥ 4 bẫy, chủ đề không trùng bài liền trước
[ ] X.5: trộn ≥ 2 âm của bài khác, toàn từ mới
[ ] ?check: 0 lỗi, cảnh báo đã xử lý hoặc có lý do
[ ] Mở bằng Edge: nghe UK và US, chuyển giọng được, console không lỗi đỏ, xem khổ điện thoại 375px
```
