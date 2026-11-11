/* 表示の仕組み。基本は触らなくてOK。内容の更新は data.js で行います */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (d) => { const [y, m, day] = d.split("-"); return `${y}年${+m}月${+day}日`; };
const STATUS_CLASS = { "確認中": "s2", "対応中": "s3", "回答済み": "s4", "対応完了": "s5" };

function card(a) {
  return `<article class="answer">
    <div class="answer-head">
      <span class="pill ${STATUS_CLASS[a.status] || "s1"}">${esc(a.status)}</span>
      <span class="cat">${esc(a.category)}</span>
      <time datetime="${esc(a.updated)}">更新 ${fmt(a.updated)}</time>
    </div>
    <h3>${esc(a.title)}</h3>
    <p class="q">${esc(a.summary)}</p>
    <div class="reply"><b>生徒会からの回答</b><p>${esc(a.reply)}${a.staff ? `<span class="staff">（${esc(a.staff)}）</span>` : ""}</p></div>
  </article>`;
}
const list = (items) => items.map((i) => `<li><time datetime="${esc(i.date)}">${fmt(i.date)}</time><span>${esc(i.text)}</span></li>`).join("");

// 共通：学校名・フォームリンク
$$("[data-school]").forEach((e) => (e.textContent = SITE.schoolName));
$$("[data-council]").forEach((e) => (e.textContent = SITE.councilName));
$$("[data-form]").forEach((e) => { e.href = SITE.formUrl; e.target = "_blank"; e.rel = "noopener"; });

// ホーム
const recent = $("#recent-answers");
if (recent) recent.innerHTML = ANSWERS.slice(0, 3).map(card).join("");
const news = $("#news-list"); if (news) news.innerHTML = list(NEWS);
const upd = $("#update-list"); if (upd) upd.innerHTML = list(UPDATES);

// 回答状況（検索・絞り込み）
const box = $("#answer-list");
if (box) {
  const q = $("#f-q"), c = $("#f-cat"), s = $("#f-status"), n = $("#f-count");
  [...new Set(ANSWERS.map((a) => a.category))].forEach((v) => c.insertAdjacentHTML("beforeend", `<option>${esc(v)}</option>`));
  const sorted = [...ANSWERS].sort((a, b) => b.updated.localeCompare(a.updated));
  const run = () => {
    const w = q.value.trim().toLowerCase();
    const r = sorted.filter((a) =>
      (!c.value || a.category === c.value) && (!s.value || a.status === s.value) &&
      (!w || [a.title, a.summary, a.reply, a.category].join(" ").toLowerCase().includes(w)));
    box.innerHTML = r.length ? r.map(card).join("") : `<p class="empty">条件に合う回答がありません。キーワードや絞り込みを変えてみてください。</p>`;
    n.textContent = `${r.length}件 / 全${ANSWERS.length}件`;
  };
  [q, c, s].forEach((e) => e.addEventListener("input", run));
  $("#f-reset").addEventListener("click", () => { q.value = c.value = s.value = ""; run(); });
  run();
}

// スマホのメニュー開閉
const mb = $(".menu-btn");
if (mb) mb.addEventListener("click", () => {
  const open = $("#nav").classList.toggle("open");
  mb.setAttribute("aria-expanded", open);
  mb.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
});

