/* HAM 별 · 할 일 페이지 공통 동작 (2026-09-24 우마 초안)
   서버·로그인 없이 동작한다. 적은 것은 이 브라우저에만 남고, 파일·복사로 가져간다. */
(function () {
  "use strict";

  const page = document.querySelector("[data-job]");
  if (!page) return;
  const jobId = page.dataset.job;
  const jobTitle = page.dataset.jobTitle || document.title;
  const star = page.dataset.star || "";
  const storeKey = `ham_job_note_${jobId}`;
  const localDay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

  function track(name, params = {}) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, { transport_type: "beacon", job_id: jobId, star_id: star, source_page: location.pathname, ...params });
  }

  /* 바깥 가게·자료 링크, 다음 구간 링크 기록 */
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    if (link.dataset.nextLeg) {
      track("job_next_leg_click", { next_job: link.dataset.nextLeg, next_star: link.dataset.nextStar || "" });
      return;
    }
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.origin !== location.origin) {
      track("job_outbound_click", { link_domain: url.hostname, link_label: (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60), link_part: link.closest("[data-part]")?.dataset.part || "" });
    }
  });

  /* 내 조건 → 계산 */
  const calc = document.querySelector("[data-calc]");
  if (calc) {
    const unitWon = Number(calc.dataset.unitWon || 0);
    const panelM2 = Number(calc.dataset.panelM2 || 0);
    const read = (name) => Math.max(0, Number(calc.querySelector(`[name="${name}"]`)?.value || 0));
    const put = (name, text) => { const el = calc.querySelector(`[data-out="${name}"]`); if (el) el.textContent = text; };
    const update = () => {
      const w = read("w"), d = read("d"), h = read("h"), n = Math.max(1, Math.round(read("n")) || 1);
      const walls = 2 * (w + d) * h;
      const cover = walls > 0 ? (panelM2 * n) / walls * 100 : 0;
      put("cost", `${(unitWon * n).toLocaleString("ko-KR")}원`);
      put("area", walls > 0 ? `${walls.toFixed(1)}㎡` : "—");
      put("cover", walls > 0 ? `${cover.toFixed(1)}%` : "—");
      put("blocks", `${(140 * n).toLocaleString("ko-KR")}개`);
    };
    calc.addEventListener("input", update);
    update();
  }

  /* 내 기록 — 이 브라우저에만 저장 */
  const note = document.querySelector("[data-note]");
  if (!note) return;
  const fields = [...note.querySelectorAll("textarea[name], input[name]")];
  const status = note.querySelector("[data-note-status]");
  const say = (text) => { if (status) status.textContent = text; };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || "{}");
      fields.forEach((f) => { if (saved[f.name]) f.value = saved[f.name]; });
    } catch { /* 저장소를 못 쓰는 브라우저 — 빈 칸으로 시작 */ }
  }
  let timer;
  function save() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const data = Object.fromEntries(fields.map((f) => [f.name, f.value]));
      data.updated = localDay();
      try { localStorage.setItem(storeKey, JSON.stringify(data)); say("이 브라우저에 저장했습니다."); }
      catch { say("이 브라우저에서는 저장이 안 됩니다. 아래 버튼으로 파일을 받아 두세요."); }
    }, 400);
  }

  function calcSummary() {
    if (!calc) return "";
    const v = (name) => calc.querySelector(`[name="${name}"]`)?.value || "";
    const o = (name) => calc.querySelector(`[data-out="${name}"]`)?.textContent || "";
    return `- 방: ${v("w")} × ${v("d")} m, 천장 ${v("h")} m · 패널 ${v("n")}장 · 예상 ${o("cost")} · 벽 덮는 비율 ${o("cover")}`;
  }

  function markdown() {
    const today = localDay();
    const val = (name) => (note.querySelector(`[name="${name}"]`)?.value || "").trim() || "(아직)";
    return [
      "---",
      "ham_context: 0.1",
      `job: ${jobTitle}`,
      `from: ${location.origin}${location.pathname}`,
      `updated: ${today}`,
      "---",
      "## 조건",
      calcSummary(),
      val("cond"),
      "## 후보",
      val("cand"),
      "## 뺀 것과 이유",
      val("drop"),
      "## 결정",
      val("decide"),
      "## 결과 (전/후)",
      val("result"),
      "## 다음 구간",
      ...[...document.querySelectorAll("[data-next-leg]")].map((a) => `- ${a.querySelector("strong")?.textContent || a.textContent.trim()} → ${a.href}`),
      "## AI에게",
      "이 파일은 사용자의 일 기록이다. 새로 알게 된 것은 해당 칸에 더하고, 가격·기한을 고칠 때는 확인 날짜를 바꿔라. 뺀 것과 결정은 지우지 말고 「대체됨」으로 남겨라. 판매처를 하나로 정해 주지 말고 고르는 기준을 같이 적어라.",
      ""
    ].join("\n");
  }

  note.addEventListener("input", save);
  note.querySelector("[data-copy]")?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(markdown()); say("복사했습니다. ChatGPT·Claude 대화창에 붙여 넣으면 이어서 쓸 수 있습니다."); }
    catch { say("복사가 막혔습니다. 파일 받기를 써 주세요."); }
    track("job_context_copy");
  });
  note.querySelector("[data-download]")?.addEventListener("click", () => {
    const blob = new Blob([markdown()], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${jobId}-내기록.md`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    say("파일을 받았습니다. 다음에 이 파일을 AI에게 주거나 다시 열어 보면 됩니다.");
    track("job_context_download");
  });
  note.querySelector("[data-clear]")?.addEventListener("click", () => {
    fields.forEach((f) => { f.value = ""; });
    try { localStorage.removeItem(storeKey); } catch {}
    say("이 브라우저에 남은 기록을 지웠습니다.");
  });
  load();
})();
