/* ==========================================================================
   EPU V2 — CORE dùng chung cho mọi bài
   Audio UK/US · file MP3 (nếu có) · ghi âm · nhận dạng giọng · điểm · toast
   Sửa ở đây = sửa cho TẤT CẢ các bài.
   ========================================================================== */
(function () {
  "use strict";
  const EPU = (window.EPU = window.EPU || {});

  // ---------- storage (an toàn khi trình duyệt chặn) ----------
  EPU.store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } }
  };

  // ---------- event bus ----------
  const handlers = {};
  EPU.on = (ev, fn) => (handlers[ev] = handlers[ev] || []).push(fn);
  EPU.emit = (ev, arg) => (handlers[ev] || []).forEach(fn => fn(arg));

  // ---------- helpers ----------
  EPU.esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // Giá trị phụ thuộc accent: "x" hoặc {uk:"x", us:"y"}
  EPU.acc = x => (x && typeof x === "object" && !Array.isArray(x)) ? (x[EPU.accent] !== undefined ? x[EPU.accent] : x.uk) : x;
  // Bỏ markup [chữ|âm] và [chữ] để lấy câu thuần cho TTS
  EPU.plain = t => String(t == null ? "" : t)
    .replace(/\[([^\]|]+)\|[^\]]*\]/g, "$1").replace(/\[([^\]]+)\]/g, "$1")
    .replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  EPU.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  EPU.pick = (a, n) => EPU.shuffle(a).slice(0, n);
  EPU.slug = t => EPU.plain(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ==========================================================================
  // ACCENT
  // ==========================================================================
  EPU.LANG = { uk: "en-GB", us: "en-US" };
  EPU.accent = EPU.store.get("epu_accent", "uk") === "us" ? "us" : "uk";
  EPU.setAccent = a => {
    if (a === EPU.accent) return;
    EPU.stop();
    EPU.accent = a;
    EPU.store.set("epu_accent", a);
    EPU.emit("accent", a);
  };

  // ==========================================================================
  // VOICES — chỉ nhận đúng en-GB / en-US, ưu tiên giọng neural
  // Không bao giờ dùng en-AU (Karen), en-IE (Moira)…
  // ==========================================================================
  const PREFS = {
    uk: ["Microsoft Sonia Online", "Microsoft Libby Online", "Microsoft Ryan Online", "Microsoft Maisie Online",
         "Google UK English Female", "Google UK English Male", "Daniel", "Kate", "Serena",
         "Microsoft Hazel", "Microsoft Susan", "Microsoft George"],
    us: ["Microsoft Aria Online", "Microsoft Jenny Online", "Microsoft Guy Online", "Microsoft Ava Online",
         "Microsoft Andrew Online", "Google US English", "Samantha", "Alex", "Microsoft Zira", "Microsoft David"]
  };
  const NEURAL = /Online|Natural|Google|Neural|Premium|Enhanced/i;
  let allVoices = [];
  const normLang = l => (l || "").replace("_", "-").toLowerCase();

  function loadVoices() {
    if (!window.speechSynthesis) return;
    allVoices = speechSynthesis.getVoices();
    EPU.emit("voices");
  }
  EPU.voiceList = function () {
    const lang = EPU.LANG[EPU.accent].toLowerCase();
    const match = allVoices.filter(v => normLang(v.lang) === lang);
    const ranked = [];
    PREFS[EPU.accent].forEach(p => match.forEach(v => { if (v.name.includes(p) && !ranked.includes(v)) ranked.push(v); }));
    match.forEach(v => { if (!ranked.includes(v)) ranked.push(v); });
    return ranked;
  };
  // i = 0: giọng chính · i = 1: giọng thứ 2 (dùng cho vai B trong hội thoại)
  EPU.voice = i => { const l = EPU.voiceList(); return l.length ? l[Math.min(i || 0, l.length - 1)] : null; };
  EPU.voiceQuality = () => { const v = EPU.voice(0); return !v ? "none" : NEURAL.test(v.name) ? "good" : "basic"; };

  if (window.speechSynthesis) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    [300, 1000, 2500].forEach(t => setTimeout(loadVoices, t));
  }

  // ==========================================================================
  // SPEAK — pitch luôn 1.0, rate không dưới 0.7 (luật L10)
  // ==========================================================================
  EPU.RATE = { word: 0.9, sentence: 0.9, slow: 0.7, min: 0.7 };
  let token = 0, curAudio = null;

  EPU.stop = function () {
    token++;
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (curAudio) { curAudio.pause(); curAudio = null; }
  };

  function playFile(src, rate) {
    return new Promise(res => {
      const a = new Audio(src);
      curAudio = a;
      a.playbackRate = rate || 1;
      a.onended = () => res(true);
      a.onerror = () => res(false);
      a.play().catch(() => res(false));
    });
  }
  EPU.playUrl = url => playFile(url, 1);

  // Giai đoạn 2: window.EPU_AUDIO = {uk:{"slug":"../audio/uk/slug.mp3"}, us:{…}}
  EPU.audioFor = t => {
    const m = window.EPU_AUDIO && window.EPU_AUDIO[EPU.accent];
    return m ? (m[EPU.slug(t)] || null) : null;
  };

  function ttsSpeak(t, opt, my) {
    return new Promise(res => {
      if (!window.speechSynthesis || my !== token) return res();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = EPU.LANG[EPU.accent];
      const v = EPU.voice(opt.voice || 0);
      if (v) u.voice = v;
      const r = opt.slow ? EPU.RATE.slow : (opt.rate || (/\s/.test(t) ? EPU.RATE.sentence : EPU.RATE.word));
      u.rate = Math.max(EPU.RATE.min, r);
      u.pitch = 1;
      u.volume = 1;
      let done = false;
      const fin = () => { if (!done) { done = true; clearTimeout(tm); res(); } };
      u.onend = fin;
      u.onerror = fin;
      const tm = setTimeout(fin, 2500 + t.length * 120 / u.rate); // phòng khi onend không bắn
      setTimeout(() => { if (my === token) speechSynthesis.speak(u); else fin(); }, 40);
    });
  }

  // opt: {slow, rate, voice, queue}
  EPU.speak = function (text, opt) {
    opt = opt || {};
    const t = EPU.plain(text);
    if (!t) return Promise.resolve();
    if (!opt.queue) EPU.stop();
    const my = token;
    const file = EPU.audioFor(t);
    if (file) return playFile(file, opt.slow ? 0.75 : 1).then(ok => (ok || my !== token) ? null : ttsSpeak(t, opt, my));
    return ttsSpeak(t, opt, my);
  };

  // Chạy tuần tự các bước (mỗi bước trả về Promise), dừng nếu người dùng bấm cái khác
  EPU.seq = async function (steps, gap) {
    EPU.stop();
    const my = token;
    for (const s of steps) {
      if (my !== token) return;
      await s();
      await new Promise(r => setTimeout(r, gap == null ? 300 : gap));
    }
  };

  // Tương thích code cũ: onclick="speakText('…', 0.8)"
  window.speakText = (t, rate) => EPU.speak(t, { rate: rate });

  // Mọi phần tử có data-say="…" đều bấm được để nghe (data-rate="slow", data-voice="1")
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-say]");
    if (!el) return;
    EPU.speak(el.getAttribute("data-say"), { slow: el.dataset.rate === "slow", voice: +(el.dataset.voice || 0) });
  });

  // ==========================================================================
  // RECORDING (ghi âm giọng người học)
  // ==========================================================================
  EPU.canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  EPU.record = async function (maxMs) {
    EPU.stop();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream), chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise(res => {
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop()); // tắt micro ngay sau khi ghi
        res(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "audio/webm" })));
      };
    });
    rec.start();
    const tm = setTimeout(() => { if (rec.state === "recording") rec.stop(); }, maxMs || 8000);
    return { stop() { clearTimeout(tm); if (rec.state === "recording") rec.stop(); }, done };
  };

  // Widget: ▶ Mẫu · 🐢 · 🎙️ Ghi âm · ▶ Giọng tôi · ⇄ So sánh A/B
  EPU.recorder = function (text, opts) {
    opts = opts || {};
    const say = EPU.esc(EPU.plain(text));
    const box = document.createElement("div");
    box.className = "rec";
    box.innerHTML =
      `<button class="btn sm btn-model" data-say="${say}" data-voice="${opts.voice || 0}">▶ Mẫu</button>` +
      (opts.noSlow ? "" : `<button class="btn sm btn-ghost" data-say="${say}" data-rate="slow" data-voice="${opts.voice || 0}">🐢</button>`) +
      `<button class="btn sm btn-rec">🎙️ Ghi âm</button>` +
      `<button class="btn sm btn-ghost btn-mine" disabled>▶ Giọng tôi</button>` +
      `<button class="btn sm btn-ghost btn-ab" disabled>⇄ So sánh</button>`;
    const bRec = box.querySelector(".btn-rec"), bMine = box.querySelector(".btn-mine"), bAB = box.querySelector(".btn-ab");
    if (!EPU.canRecord()) { bRec.disabled = true; bRec.title = "Trình duyệt này không cho ghi âm"; }
    let ctl = null;
    bRec.onclick = async () => {
      if (ctl) { ctl.stop(); return; }
      try { ctl = await EPU.record(opts.maxMs); }
      catch (e) { EPU.toast("🎙️ Không mở được micro. Hãy cho phép quyền micro (trang cần chạy qua https hoặc localhost)."); return; }
      bRec.classList.add("recording");
      bRec.textContent = "⏹ Dừng";
      const url = await ctl.done;
      ctl = null;
      bRec.classList.remove("recording");
      bRec.textContent = "🎙️ Ghi lại";
      box.dataset.url = url;
      bMine.disabled = bAB.disabled = false;
      if (opts.onRecord) opts.onRecord(url);
      EPU.playUrl(url);
    };
    bMine.onclick = () => { EPU.stop(); EPU.playUrl(box.dataset.url); };
    bAB.onclick = () => EPU.seq([
      () => EPU.speak(text, { queue: true, voice: opts.voice || 0 }),
      () => EPU.playUrl(box.dataset.url)
    ], 500);
    return box;
  };

  // ==========================================================================
  // SPEECH RECOGNITION (tuỳ chọn, chỉ để tham khảo — Chrome/Edge)
  // ==========================================================================
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  EPU.canASR = () => !!SR;
  EPU.listen = () => new Promise((res, rej) => {
    EPU.stop();
    const r = new SR();
    r.lang = EPU.LANG[EPU.accent];
    r.maxAlternatives = 5;
    r.interimResults = false;
    let got = false;
    r.onresult = e => { got = true; res(Array.from(e.results[0]).map(a => a.transcript.trim().toLowerCase())); };
    r.onerror = e => rej(e.error);
    r.onend = () => { if (!got) res([]); };
    r.start();
  });

  // ==========================================================================
  // UI helpers
  // ==========================================================================
  EPU.toast = function (msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("show"), 3000);
  };

  EPU.score = function (el, c, t, extra) {
    const pct = t ? Math.round(c / t * 100) : 0;
    const [cls, emo, msg] = pct >= 90 ? ["great", "🎉", "Xuất sắc!"] : pct >= 65 ? ["good", "👍", "Khá tốt!"] : ["try", "😅", "Cần luyện thêm!"];
    el.className = "score show " + cls;
    el.innerHTML = `<div class="big">${emo} ${pct}%</div><b>${msg}</b> Đúng <b>${c}/${t}</b>.` +
      `<div class="meter"><div style="width:${pct}%"></div></div>${extra || ""}`;
    EPU.toast("Kết quả: " + pct + "%");
  };

  // Thanh chọn accent + trạng thái giọng đọc
  EPU.accentBar = function () {
    const bar = document.createElement("div");
    bar.className = "accent-bar";
    bar.innerHTML =
      `<div class="acc-toggle"><button data-acc="uk">🇬🇧 UK</button><button data-acc="us">🇺🇸 US</button></div>` +
      `<div class="voice-status"></div>`;
    bar.querySelectorAll("[data-acc]").forEach(b => { b.onclick = () => EPU.setAccent(b.dataset.acc); });
    const update = () => {
      bar.querySelectorAll("[data-acc]").forEach(b => b.classList.toggle("on", b.dataset.acc === EPU.accent));
      const v = EPU.voice(0), q = EPU.voiceQuality(), flag = EPU.accent === "uk" ? "🇬🇧 UK" : "🇺🇸 US";
      const st = bar.querySelector(".voice-status");
      if (!window.speechSynthesis) st.innerHTML = `<span class="warn">⚠️ Trình duyệt không hỗ trợ đọc. Hãy dùng Edge hoặc Chrome.</span>`;
      else if (q === "none") st.innerHTML = `<span class="warn">⚠️ Máy chưa có giọng ${flag}, đang đọc bằng giọng mặc định.</span> ` +
        `Mở bằng <b>Microsoft Edge</b> (giọng Natural tốt nhất) hoặc Chrome<span class="hint">, hoặc cài giọng trong Windows: ` +
        `<i>Cài đặt → Thời gian &amp; ngôn ngữ → Giọng nói → Thêm giọng</i></span>.`;
      else st.innerHTML = `🔊 Giọng: <b>${EPU.esc(v.name.replace(/ - English.*$/, ""))}</b>` +
        (q === "basic" ? ` <span class="warn">· chất lượng trung bình, Edge có giọng Natural rõ hơn</span>` : "");
    };
    update();
    EPU.on("voices", update);
    EPU.on("accent", update);
    return bar;
  };

  // Đánh dấu bài đã học (tương thích index.html: key "epu_completed")
  EPU.markDone = function (n) {
    setTimeout(() => {
      let c = [];
      try { c = JSON.parse(EPU.store.get("epu_completed", "[]")) || []; } catch (e) { c = []; }
      if (!c.includes(n)) { c.push(n); EPU.store.set("epu_completed", JSON.stringify(c)); }
    }, 1000);
  };
})();
