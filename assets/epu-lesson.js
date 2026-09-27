/* ==========================================================================
   EPU V2 — dựng trang bài học từ dữ liệu LESSON
   Lý thuyết (tô màu theo ÂM) + 5 bài tập cố định:
     X.1 👂 Nghe câu, chọn nghĩa   X.2 🔍 Đoán trước, nghe sau
     X.3 🗣️ Nói & so sánh          X.4 💬 Tình huống   X.5 🔁 Ôn xen kẽ
   Markup trong dữ liệu:
     [ea|e]        chữ "ea" đọc là âm key "e"  → tô màu theo âm
     [a|ae@us]     chỉ tô khi đang chọn giọng US
     [ea]          (X.2) chữ cần đoán, tô vàng
     X.4: [word|e] từ đích · [word|ae,e] nhiều âm · [word|!ghi chú] bẫy · [word|~] không chấm
   ========================================================================== */
(function () {
  "use strict";
  const E = window.EPU, esc = E.esc, acc = E.acc;
  let L = null, app = null, bar = null;

  E.renderLesson = function (lesson) {
    L = lesson;
    app = document.getElementById("app");
    injectStyle();
    bar = E.accentBar();
    render();
    E.on("accent", render);
    E.markDone(L.id);
  };

  // ---------------------------------------------------------------- utils
  const S = k => L.sounds[k];
  const keysOf = spec => spec.split(",").map(s => s.trim()).filter(Boolean).map(s => { const [k, a] = s.split("@"); return { k, a }; });
  const active = spec => keysOf(spec).filter(o => !o.a || o.a === E.accent).map(o => o.k);
  const ipa = x => { const v = acc(x); return v ? `/${esc(v)}/` : ""; };
  const tag = k => `<span class="ipa-tag bg-${k} tx-${k}">${S(k).ipa}</span>`;

  function hl(text) {
    return esc(text)
      .replace(/\[([^\]|]+)\|([^\]]*)\]/g, (m, l, spec) => {
        const ks = active(spec).filter(k => L.sounds[k]);
        return ks.length ? `<span class="hl hl-${ks[0]}">${l}</span>` : l;
      })
      .replace(/\[([^\]]+)\]/g, `<span class="focus">$1</span>`);
  }
  function firstKey(text) {
    const re = /\[[^\]|]+\|([^\]]*)\]/g;
    let m;
    while ((m = re.exec(text))) { const ks = active(m[1]).filter(k => L.sounds[k]); if (ks.length) return ks[0]; }
    return Object.keys(L.sounds)[0];
  }
  function node(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function sec(title, badge, body, cls) {
    return node(`<section class="sec ${cls || ""}"><div class="sec-t">${title}${badge ? ` <span class="badge">${badge}</span>` : ""}</div>${body}</section>`);
  }
  const clickWords = list => String(list).split(",").map(w => w.trim()).filter(Boolean)
    .map(w => `<span class="cw" data-say="${esc(w)}">${esc(w)}</span>`).join(", ");

  function findRule(code) { return (L.rules || []).concat(L.traps || []).find(r => r.code === code); }
  function ruleText(code) {
    const r = findRule(code);
    if (!r) return "";
    const snd = r.key ? S(r.key).ipa : esc(r.sound || "");
    return `<b>${esc(r.code)}</b> · ${esc(r.spell)} → ${snd}${r.ex ? ` · ví dụ: <i>${esc(r.ex)}</i>` : ""}`;
  }

  function injectStyle() {
    let css = `:root{--c1:${L.theme[0]};--c2:${L.theme[1]}}`;
    for (const [k, s] of Object.entries(L.sounds)) {
      css += `.hl-${k}{background:${s.color};color:#fff}.tx-${k}{color:${s.color}}.bg-${k}{background:${s.bg}}` +
        `.bd-${k}{border-color:${s.color}!important}.bl-${k}{border-left:4px solid ${s.color}}` +
        `.sel-${k}{background:${s.color}!important;color:#fff!important;border-color:${s.color}!important}` +
        `.ln-${k}{box-shadow:inset 0 -3px 0 ${s.color}}`;
    }
    const st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ---------------------------------------------------------------- page
  function render() {
    E.stop();
    app.innerHTML = "";
    app.appendChild(node(header()));
    app.appendChild(bar);
    let n = 0;
    const letter = () => String.fromCharCode(65 + n++);
    L.soundCards.forEach(c => app.appendChild(soundCard(c, letter())));
    if (L.pairs) app.appendChild(pairsSec(letter()));
    app.appendChild(rulesSec(letter()));
    Object.keys(L.sounds).forEach(k => { if (L.words[k]) app.appendChild(vocabSec(k, letter())); });
    if (L.tips) app.appendChild(tipsSec());
    app.appendChild(node(`<div class="loop"><b>🧭 Vòng luyện tập:</b> 👂 Nghe → 🔍 Đoán → 🗣️ Nói → 💬 Dùng → 🔁 Ôn.` +
      ` Bài tập dùng <b>từ và câu MỚI</b>, không có ở phần trên, để bạn luyện <b>vận dụng quy tắc</b> chứ không phải nhớ lại.</div>`));
    if (L.x1) app.appendChild(X1(L.x1, 1));
    if (L.x2) app.appendChild(X2(L.x2, 2));
    if (L.x3) app.appendChild(X3(L.x3, 3));
    if (L.x4) app.appendChild(X4(L.x4, 4));
    if (L.x5) app.appendChild(X5(L.x5, 5));
    if (L.summary) app.appendChild(summarySec());
    app.appendChild(node(`<footer class="foot">${L.footer || ""}<p><a href="../index.html">← Về trang chủ</a></p></footer>`));
  }

  function header() {
    return `<header class="hdr"><div class="hdr-top"><span class="pill">📚 Bài ${L.id}</span><span>${esc(L.section)}</span></div>` +
      `<h1>${L.emoji || ""} <span>${esc(L.title)}</span></h1>` +
      `<div class="phon">${Object.values(L.sounds).map(s => s.ipa).join(" và ")}</div>` +
      `<div class="hdr-sub">${L.sub}</div><a class="nav" href="../index.html">← Về trang chủ</a></header>`;
  }

  function soundCard(c, letter) {
    const s = S(c.key), demo = esc(s.ex.join(", "));
    return sec(`${letter}. Cách phát âm ${tag(c.key)}`, esc(s.name),
      `<div class="diag"><div class="diag-card bd-${c.key} bg-${c.key}">` +
      `<div class="phoneme tx-${c.key}">${s.ipa}</div><div class="diag-ex">${esc(s.ex.join(" · "))}</div>` +
      `<ol>${c.how.map(x => `<li>${x}</li>`).join("")}</ol></div><div class="diag-side">` +
      (c.vn ? `<div class="note vn">🇻🇳 ${c.vn}</div>` : "") +
      (c.ukus ? `<div class="note ukus">🇬🇧 🇺🇸 ${c.ukus}</div>` : "") +
      (c.mistake ? `<div class="note warn">⚠️ ${c.mistake}</div>` : "") +
      `</div></div><div class="btns"><button class="btn sel-${c.key}" data-say="${demo}">🔊 Nghe ${s.ipa}</button>` +
      `<button class="btn btn-ghost" data-say="${demo}" data-rate="slow">🐢 Chậm</button></div>`);
  }

  function pairsSec(letter) {
    const ks = Object.keys(L.sounds);
    const items = L.pairs.map(p => `<button class="pair" data-say="${esc(p[0])}. ${esc(p[2])}.">` +
      `<span class="tx-${ks[0]}">${esc(p[0])} <small>${ipa(p[1])}</small></span> · ` +
      `<span class="tx-${ks[1]}">${esc(p[2])} <small>${ipa(p[3])}</small></span></button>`).join("");
    const all = esc(L.pairs.map(p => `${p[0]}. ${p[2]}.`).join(" "));
    return sec(`${letter}. So sánh cặp tối thiểu`, "Minimal pairs",
      `<p class="muted">Bấm từng cặp: 2 từ chỉ khác nhau đúng 1 âm. Nghe kỹ sự khác biệt trước khi làm bài tập.</p>` +
      `<div class="pairs">${items}</div><div class="btns"><button class="btn btn-model" data-say="${all}">🔊 Nghe tất cả</button></div>`);
  }

  function rulesSec(letter) {
    const row = r => {
      const off = r.accent && r.accent !== E.accent;
      return `<tr class="${off ? "off" : ""}"><td class="code">${esc(r.code)}</td><td class="spl">${esc(r.spell)}</td>` +
        `<td>${r.key ? tag(r.key) : `<span class="ipa-tag other">${esc(r.sound)}</span>`}</td>` +
        `<td>${clickWords(r.ex)}</td><td>${r.accent ? (r.accent === "uk" ? "🇬🇧 " : "🇺🇸 ") : ""}${r.note || ""}` +
        `${off ? ` <i>(giọng đang chọn không áp dụng)</i>` : ""}</td></tr>`;
    };
    const head = `<tr><th>Mã</th><th>Chính tả</th><th>Âm</th><th>Ví dụ (bấm để nghe)</th><th>Ghi chú</th></tr>`;
    return sec(`${letter}. Quy tắc chính tả: công cụ đọc TỪ MỚI`, "Rules",
      `<p class="muted">Học quy tắc, đừng học thuộc danh sách. Bài tập 🔍 sẽ hỏi lại các mã quy tắc này với từ bạn chưa gặp.</p>` +
      `<div class="tbl"><table class="rt">${head}${L.rules.map(row).join("")}</table></div>` +
      (L.traps ? `<p class="trap-h">⚠️ BẪY: chữ giống nhưng <b>KHÔNG</b> đọc là âm của bài</p>` +
        `<div class="tbl"><table class="rt trap">${head}${L.traps.map(row).join("")}</table></div>` : ""));
  }

  function vocabSec(k, letter) {
    const words = L.words[k].map(w => `<div class="wc bd-${k}" data-say="${esc(E.plain(w.w))}">` +
      `<div class="w">${hl(w.w)}</div><div class="ipa">${ipa(w.ipa)}</div><div class="vi">🇻🇳 ${esc(w.vi)}</div></div>`).join("");
    const sents = (L.sentences[k] || []).map(s => `<li class="bl-${k}" data-say="${esc(E.plain(s.t))}">` +
      `<div class="st">${hl(s.t)}<button class="btn xs btn-ghost" data-say="${esc(E.plain(s.t))}" data-rate="slow">🐢</button></div>` +
      `<span class="ipa-s">${ipa(s.ipa)}</span><span class="vi-s">🇻🇳 ${esc(s.vi)}${s.geo ? " <em>(địa kỹ thuật)</em>" : ""}</span></li>`).join("");
    return sec(`${letter}. Từ &amp; câu có âm ${tag(k)}`, "Bấm để nghe",
      `<p class="muted">Chỉ phần chữ <b>thật sự đọc là ${S(k).ipa}</b> mới được tô màu. Chữ câm, âm /ə/ hoặc âm khác thì không tô.</p>` +
      `<div class="wg">${words}</div>` + (sents ? `<ul class="sl">${sents}</ul>` : ""));
  }

  function tipsSec() {
    return sec("💡 Bí quyết", "", `<div class="tips">${L.tips.map(t => `<div class="tip">${t}</div>`).join("")}</div>`, "sec-tip");
  }

  function summarySec() {
    return sec("📌 Tổng kết", "Checklist", `<div class="sum">${L.summary.map(s => `<div>✅ ${s}</div>`).join("")}</div>`, "sec-sum");
  }

  // ---------------------------------------------------------------- exercise shell
  function shell(num, icon, step, title, goal) {
    const el = node(`<section class="sec ex"><div class="sec-t">📝 Bài tập ${L.id}.${num} · ${icon} ${title}` +
      ` <span class="step">${step}</span></div><div class="ex-goal">${goal}</div><div class="ex-body"></div>` +
      `<div class="btns ex-btns"></div><div class="score"></div></section>`);
    return { el, body: el.querySelector(".ex-body"), btns: el.querySelector(".ex-btns"), score: el.querySelector(".score") };
  }
  function button(parent, label, cls, fn) {
    const b = node(`<button class="btn ${cls}">${label}</button>`);
    b.onclick = fn;
    parent.appendChild(b);
    return b;
  }

  // ================================================================ X.1 NGHE CÂU, CHỌN NGHĨA
  function X1(cfg, num) {
    const x = shell(num, "👂", "NGHE", "Nghe câu, chọn nghĩa",
      "Mỗi câu chỉ khác nhau <b>đúng 1 âm</b>. Nghe cả câu rồi chọn nghĩa bạn nghe được. " +
      "Khi nói sai âm, người nghe sẽ hiểu sai nghĩa: đây là lý do phải phát âm đúng.");
    let items = [];
    function build() {
      items = E.pick(cfg.bank, cfg.n || 6).map(p => ({ p, side: Math.random() < 0.5 ? "a" : "b", order: E.shuffle(["a", "b"]), sel: null, done: false }));
      x.body.innerHTML = items.map((it, i) => {
        const say = esc(E.plain(it.p[it.side].t));
        return `<div class="q" data-i="${i}"><span class="qn">${i + 1}</span>` +
          `<button class="btn sm btn-model" data-say="${say}">▶</button>` +
          `<button class="btn sm btn-ghost" data-say="${say}" data-rate="slow">🐢</button>` +
          `<div class="opts">${it.order.map(s => `<button class="opt" data-s="${s}">${esc(it.p[s].m)}</button>`).join("")}</div>` +
          `<div class="fb"></div></div>`;
      }).join("");
      x.score.className = "score";
    }
    x.body.addEventListener("click", e => {
      const pr = e.target.closest("[data-pair]");
      if (pr) {
        const p = items[pr.dataset.pair].p;
        E.seq([() => E.speak(p.a.t, { queue: true }), () => E.speak(p.b.t, { queue: true })], 600);
        return;
      }
      const b = e.target.closest(".opt");
      if (!b) return;
      const q = b.closest(".q"), it = items[q.dataset.i];
      if (it.done) return;
      it.sel = b.dataset.s;
      q.querySelectorAll(".opt").forEach(o => o.classList.toggle("sel", o === b));
    });
    button(x.btns, "✅ Chấm bài", "btn-warn", () => {
      if (!items.some(it => it.sel)) { E.toast("Hãy nghe và chọn đáp án trước!"); return; }
      let c = 0;
      items.forEach((it, i) => {
        const q = x.body.querySelector(`.q[data-i="${i}"]`), ok = it.sel === it.side;
        it.done = true;
        if (ok) c++;
        q.querySelectorAll(".opt").forEach(o => {
          o.classList.remove("sel");
          if (o.dataset.s === it.side) o.classList.add("ok");
          else if (o.dataset.s === it.sel) o.classList.add("bad");
        });
        q.querySelector(".fb").innerHTML = `${ok ? "✅" : "❌"} Bạn nghe: <b>${hl(it.p[it.side].t)}</b>` +
          `<span class="muted"> · cặp: ${hl(it.p.a.t)} / ${hl(it.p.b.t)}</span> ` +
          `<button class="btn xs btn-ghost" data-pair="${i}">🔁 Nghe cặp</button>`;
      });
      E.score(x.score, c, items.length, cfg.after ? `<div class="rule">💡 ${cfg.after}</div>` : "");
    });
    button(x.btns, "🔀 Bộ câu mới", "btn-model", () => { build(); E.toast("Bộ câu mới!"); });
    build();
    return x.el;
  }

  // ================================================================ X.2 ĐOÁN TRƯỚC, NGHE SAU
  function X2(cfg, num) {
    const x = shell(num, "🔍", "ĐOÁN", "Từ lạ: đoán trước, nghe sau",
      "Các từ này <b>chưa xuất hiện</b> ở phần lý thuyết. Nhìn phần chữ <span class=\"focus\">tô vàng</span>, " +
      "dùng quy tắc để <b>đoán âm TRƯỚC</b>. Chọn xong máy mới đọc để bạn kiểm chứng. Có vài từ <b>bẫy</b>!");
    const opts = Object.keys(L.sounds).map(k => ({ v: k, label: `${S(k).ipa} như “${S(k).ex[0]}”` }))
      .concat([{ v: "other", label: cfg.otherLabel || "Âm khác" }]);
    let items = [], answered = 0, correct = 0;
    const prog = node(`<div class="prog"></div>`);
    function build() {
      items = E.shuffle(cfg.items);
      answered = correct = 0;
      x.body.innerHTML = `<div class="pcs">${items.map((it, i) => `<div class="pc" data-i="${i}">` +
        `<div class="pc-word">${hl(it.w)}</div><div class="pc-q">Phần tô vàng đọc là…?</div>` +
        `<div class="opts col">${opts.map(o => `<button class="opt" data-v="${o.v}">${o.label}</button>`).join("")}</div>` +
        `<div class="fb"></div></div>`).join("")}</div>`;
      x.body.prepend(prog);
      updProg();
      x.score.className = "score";
    }
    function updProg() { prog.textContent = `Đã làm ${answered}/${items.length} · đúng ${correct}`; }
    x.body.addEventListener("click", e => {
      const b = e.target.closest(".opt");
      if (!b) return;
      const card = b.closest(".pc"), it = items[card.dataset.i];
      if (card.classList.contains("done")) return;
      card.classList.add("done");
      const ans = acc(it.s), ok = b.dataset.v === ans;
      answered++;
      if (ok) correct++;
      card.querySelectorAll(".opt").forEach(o => {
        if (o.dataset.v === ans) o.classList.add("ok");
        else if (o === b) o.classList.add("bad");
      });
      card.classList.add(ok ? "is-ok" : "is-bad");
      E.speak(it.w, { rate: E.RATE.word });
      const real = ans === "other" ? (it.real ? ipa(it.real) : "âm khác") : S(ans).ipa;
      card.querySelector(".fb").innerHTML = `${ok ? "✅ Đúng" : "❌ Chưa đúng"}: <b>${esc(E.plain(it.w))}</b> ${ipa(it.ipa)} → ${real}` +
        ` <button class="btn xs btn-ghost" data-say="${esc(E.plain(it.w))}">🔊</button>` +
        `<div class="rule">📐 ${ruleText(acc(it.rule))}${it.note ? `<br>${it.note}` : ""}</div>`;
      updProg();
      if (answered === items.length) E.score(x.score, correct, items.length,
        `<div class="rule">💡 Sai ở đâu, hãy đọc lại mã quy tắc tương ứng trong bảng chính tả. Mục tiêu là gặp từ mới vẫn tự đoán đúng.</div>`);
    });
    button(x.btns, "🔄 Làm lại (đảo thứ tự)", "btn-danger", build);
    build();
    return x.el;
  }

  // ================================================================ X.3 NÓI & SO SÁNH
  function X3(cfg, num) {
    const x = shell(num, "🗣️", "NÓI", "Nói &amp; so sánh",
      "Nghe <b>Mẫu</b> → bấm <b>🎙️ Ghi âm</b> và nói theo → nghe <b>⇄ So sánh</b> (máy trước, giọng bạn sau). " +
      "Nghe lại chính giọng mình là cách nhanh nhất để tự sửa. Giọng ghi âm chỉ nằm trên máy bạn, không gửi đi đâu.");
    if (!E.canRecord()) x.body.appendChild(node(`<div class="note warn">⚠️ Trình duyệt này chưa cho ghi âm. Hãy mở trang qua https (GitHub Pages) bằng Chrome, Edge hoặc Safari.</div>`));
    cfg.items.forEach((it, i) => {
      const row = node(`<div class="say-row"><div class="say-t"><span class="qn">${i + 1}</span> ${hl(it.t)}` +
        `${it.tip ? `<div class="muted small">🎯 ${it.tip}</div>` : ""}</div></div>`);
      row.appendChild(E.recorder(it.t));
      x.body.appendChild(row);
    });
    if (cfg.checklist) x.body.appendChild(node(`<div class="check"><b>✔️ Tự kiểm tra khi nghe lại giọng mình:</b>` +
      cfg.checklist.map(c => `<label><input type="checkbox"> ${c}</label>`).join("") + `</div>`));
    if (cfg.asr) {
      const box = node(`<div class="asr"><b>🤖 Máy có hiểu bạn không?</b> <span class="muted small">(tham khảo, không tính điểm. ` +
        `Chỉ chạy trên Chrome/Edge; âm thanh được gửi tới dịch vụ nhận dạng của trình duyệt)</span></div>`);
      if (!E.canASR()) box.appendChild(node(`<div class="muted small">Trình duyệt này không hỗ trợ nhận dạng giọng. Hãy dùng Chrome hoặc Edge.</div>`));
      else cfg.asr.forEach(pair => {
        const r = node(`<div class="asr-row">${pair.map(w => `<button class="btn sm btn-ghost" data-w="${esc(w)}">🎙️ Nói “${esc(w)}”</button>`).join("")}<span class="asr-out"></span></div>`);
        r.querySelectorAll("[data-w]").forEach(b => {
          b.onclick = async () => {
            const target = b.dataset.w, other = pair.find(w => w !== target), out = r.querySelector(".asr-out");
            out.innerHTML = "🎧 Đang nghe… hãy nói 1 từ";
            let alts = [];
            try { alts = await E.listen(); } catch (err) { out.innerHTML = `⚠️ Không nghe được (${esc(err)}). Kiểm tra quyền micro.`; return; }
            const top = alts[0] || "", has = (s, w) => s.split(/[^a-z']+/).includes(w.toLowerCase());
            if (!top) out.innerHTML = "❔ Không nghe thấy gì, thử lại.";
            else if (has(top, target)) out.innerHTML = `✅ Máy nghe: “<b>${esc(top)}</b>”. Chuẩn!`;
            else if (has(top, other)) out.innerHTML = `❌ Máy nghe thành “<b>${esc(top)}</b>”. Âm của bạn đang giống từ kia.`;
            else if (alts.some(a => has(a, target))) out.innerHTML = `🟡 Máy phân vân (nghe: “${esc(top)}”). Gần đúng, nói rõ hơn.`;
            else out.innerHTML = `❔ Máy nghe: “${esc(top)}”. Thử lại, nói rõ từng âm.`;
          };
        });
        box.appendChild(r);
      });
      x.body.appendChild(box);
    }
    x.btns.remove();
    x.score.remove();
    return x.el;
  }

  // ================================================================ X.4 TÌNH HUỐNG
  function tokenize(text) {
    const out = [], re = /\[([^\]|]+)\|([^\]]*)\]|([A-Za-z][A-Za-z'’]*)|([^A-Za-z[]+|\[)/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[1]) out.push({ w: m[1], spec: m[2] });
      else if (m[3]) out.push({ w: m[3], spec: "" });
      else out.push({ p: m[4] });
    }
    return out;
  }
  function tokenInfo(tk) {
    const spec = tk.spec;
    if (spec === "~") return { ignore: true, keys: [] };
    if (spec.startsWith("!")) return { keys: [], note: spec.slice(1) };
    if (!spec) return { keys: [] };
    const ks = active(spec).filter(k => L.sounds[k]);
    if (!ks.length) return { keys: [], note: `Giọng ${E.accent === "uk" ? "🇬🇧 UK" : "🇺🇸 US"} đọc từ này khác, ở đây không có âm của bài.` };
    return { keys: ks };
  }

  function X4(cfg, num) {
    const keys = Object.keys(L.sounds);
    const x = shell(num, "💬", "DÙNG", `Tình huống: ${esc(cfg.title)}`,
      "<b>Bước 1 🔍</b> Click vào các từ có âm của bài: " +
      keys.map((k, i) => `click ${i + 1} lần = ${tag(k)}`).join(", ") + `, click ${keys.length + 1} lần = bỏ chọn. ` +
      "Cẩn thận <b>bẫy chính tả</b> (chữ giống nhưng âm khác).<br><b>Bước 2 🔊</b> Nghe cả đoạn. " +
      `<b>Bước 3 🎭</b> Đóng vai <b>${esc(cfg.roles[cfg.userRole])}</b> và ghi âm.`);
    const lines = cfg.lines.map(([role, t, vi]) => ({ role, t, vi, toks: tokenize(t) }));
    let sel = {}, checked = false;
    const scene = node(`<div class="scene"></div>`);
    const fb = node(`<div class="scene-fb"></div>`);
    function build() {
      sel = {};
      checked = false;
      scene.innerHTML = (cfg.place ? `<div class="place">📍 ${cfg.place}</div>` : "") + lines.map((ln, li) => {
        const txt = ln.toks.map((tk, ti) => tk.p !== undefined ? esc(tk.p) : `<span class="tk" data-id="${li}_${ti}">${esc(tk.w)}</span>`).join("");
        return `<div class="line"><span class="who who-${ln.role}">${esc(cfg.roles[ln.role])}</span>` +
          `<div class="txt">${txt}${ln.vi ? `<div class="vi-l">🇻🇳 ${esc(ln.vi)}</div>` : ""}</div>` +
          `<button class="btn xs btn-ghost" data-say="${esc(E.plain(ln.t))}" data-voice="${ln.role === "A" ? 0 : 1}">▶</button></div>`;
      }).join("");
      fb.innerHTML = "";
      x.score.className = "score";
    }
    scene.addEventListener("click", e => {
      const t = e.target.closest(".tk");
      if (!t || checked) return;
      const cur = sel[t.dataset.id] === undefined ? -1 : sel[t.dataset.id];
      const nx = cur + 1 >= keys.length ? -1 : cur + 1;
      keys.forEach(k => t.classList.remove("sel-" + k));
      if (nx < 0) delete sel[t.dataset.id];
      else { sel[t.dataset.id] = nx; t.classList.add("sel-" + keys[nx]); }
    });
    function evaluate(reveal) {
      checked = true;
      let targets = 0, ok = 0, fp = 0;
      const miss = [], wrong = [], traps = [];
      lines.forEach((ln, li) => ln.toks.forEach((tk, ti) => {
        if (tk.p !== undefined) return;
        const id = `${li}_${ti}`, el = scene.querySelector(`[data-id="${id}"]`), info = tokenInfo(tk);
        if (info.ignore) return;
        const s = sel[id] === undefined ? null : keys[sel[id]];
        keys.forEach(k => el.classList.remove("sel-" + k));
        if (info.keys.length) {
          targets++;
          if (reveal || (s && info.keys.includes(s))) { if (!reveal) ok++; el.classList.add("sel-" + (s && info.keys.includes(s) ? s : info.keys[0]), "ok"); }
          else if (s) { el.classList.add("bad"); wrong.push(`<b>${esc(tk.w)}</b> là ${info.keys.map(tag).join(" + ")}, không phải ${tag(s)}`); }
          else { el.classList.add("ln-" + info.keys[0], "miss"); miss.push(`<b>${esc(tk.w)}</b> ${info.keys.map(tag).join(" + ")}`); }
        } else if (s) {
          fp++;
          el.classList.add("bad");
          traps.push(`<b>${esc(tk.w)}</b>: ${info.note || "không có âm của bài."}`);
        } else if (info.note && reveal) {
          el.classList.add("trap");
          traps.push(`<b>${esc(tk.w)}</b>: ${info.note}`);
        }
      }));
      if (reveal) {
        fb.innerHTML = traps.length ? `<div class="rule">⚠️ <b>Các bẫy trong đoạn:</b><br>${traps.join("<br>")}</div>` : "";
        return;
      }
      fb.innerHTML =
        (miss.length ? `<div class="rule">🔎 <b>Bỏ sót</b> (gạch chân màu): ${miss.join(" · ")}</div>` : "") +
        (wrong.length ? `<div class="rule">🔁 <b>Nhầm âm:</b> ${wrong.join(" · ")}</div>` : "") +
        (traps.length ? `<div class="rule">⚠️ <b>Dính bẫy:</b><br>${traps.join("<br>")}</div>` : "");
      E.score(x.score, ok, targets + fp, `<div class="muted small">Điểm = từ đúng / (số từ đích + số từ chọn nhầm).</div>`);
    }
    x.body.appendChild(scene);
    x.body.appendChild(fb);
    button(x.btns, "✅ Chấm bài", "btn-warn", () => { if (!checked) evaluate(false); });
    button(x.btns, "👁️ Xem đáp án", "btn-teal", () => { build(); evaluate(true); });
    button(x.btns, "🔄 Làm lại", "btn-danger", build);
    button(x.btns, "🔊 Nghe cả đoạn", "btn-model", () => E.seq(lines.map(ln => () => E.speak(ln.t, { queue: true, voice: ln.role === "A" ? 0 : 1 })), 450));
    build();

    // ---- Bước 3: đóng vai
    const recs = {};
    const role = node(`<div class="role"><div class="role-h">🎭 Bước 3: Bạn đóng vai <b>${esc(cfg.roles[cfg.userRole])}</b>. Ghi âm từng câu của bạn, rồi phát cả hội thoại.</div></div>`);
    lines.forEach((ln, li) => {
      if (ln.role !== cfg.userRole) return;
      const r = node(`<div class="say-row"><div class="say-t">${hl(ln.t)}</div></div>`);
      r.appendChild(E.recorder(ln.t, { voice: 1, noSlow: true, onRecord: url => { recs[li] = url; } }));
      role.appendChild(r);
    });
    const play = node(`<button class="btn btn-model">▶ Phát hội thoại: máy đọc ${esc(cfg.roles[cfg.userRole === "A" ? "B" : "A"])}, bạn đọc ${esc(cfg.roles[cfg.userRole])}</button>`);
    play.onclick = () => E.seq(lines.map((ln, li) => () => recs[li] ? E.playUrl(recs[li]) : E.speak(ln.t, { queue: true, voice: ln.role === "A" ? 0 : 1 })), 400);
    role.appendChild(node(`<div class="btns"></div>`)).appendChild(play);
    x.el.appendChild(role);
    return x.el;
  }

  // ================================================================ X.5 ÔN XEN KẼ
  function X5(cfg, num) {
    const x = shell(num, "🔁", "ÔN", "Ôn xen kẽ các âm dễ nhầm",
      cfg.goal || "Âm của bài này được <b>trộn lẫn với các âm dễ nhầm</b> từ bài khác. Không ai báo trước đang luyện âm nào, " +
      "giống như khi nghe người thật nói. Nghe và chọn từ đúng.");
    let rounds = [], answered = 0, correct = 0;
    function build() {
      const n = cfg.rounds || 8;
      const groups = [];
      while (groups.length < n) groups.push(...E.shuffle(cfg.groups));
      rounds = groups.slice(0, n).map(g => ({ g: E.shuffle(g), target: g[Math.floor(Math.random() * g.length)] }));
      answered = correct = 0;
      x.body.innerHTML = rounds.map((r, i) => `<div class="q" data-i="${i}"><span class="qn">${i + 1}</span>` +
        `<button class="btn sm btn-model" data-say="${esc(r.target.w)}">▶</button>` +
        `<button class="btn sm btn-ghost" data-say="${esc(r.target.w)}" data-rate="slow">🐢</button>` +
        `<div class="opts">${r.g.map(o => `<button class="opt" data-w="${esc(o.w)}">${esc(o.w)}</button>`).join("")}</div>` +
        `<div class="fb"></div></div>`).join("");
      x.score.className = "score";
    }
    x.body.addEventListener("click", e => {
      const b = e.target.closest(".opt");
      if (!b) return;
      const q = b.closest(".q"), r = rounds[q.dataset.i];
      if (q.classList.contains("done")) return;
      q.classList.add("done");
      const ok = b.dataset.w === r.target.w;
      answered++;
      if (ok) correct++;
      q.querySelectorAll(".opt").forEach(o => {
        if (o.dataset.w === r.target.w) o.classList.add("ok");
        else if (o === b) o.classList.add("bad");
      });
      q.querySelector(".fb").innerHTML = `${ok ? "✅" : "❌"} ` + r.g.map(o =>
        `<span class="cw ${o.w === r.target.w ? "strong" : ""}" data-say="${esc(o.w)}">${esc(o.w)} ${ipa(o.ipa)}</span>`).join(" · ");
      if (answered === rounds.length) E.score(x.score, correct, rounds.length);
    });
    button(x.btns, "🔀 Bộ mới", "btn-model", () => { build(); E.toast("Bộ câu hỏi mới!"); });
    build();
    return x.el;
  }
})();
