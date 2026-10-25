// 강의장에 끼워 넣는 수업 도우미 창 — 지금 보고 있는 강을 서버에 알린다.
import { createAcademyHelperClient, PUBLIC_DISCLOSURE } from "./client.mjs";

const STORE = "ham-class-helper-session-v3";
const START = "수업 도우미예요. 실습은 평소 쓰는 AI에서 하고, 저는 옆에서 막힌 곳을 같이 봐요. 막힌 곳을 물어보고 자기 AI에서 계속해 보세요. 함께 볼 필요가 있을 때만 개인정보를 지운 답의 해당 부분을 가져오세요.";
// 강의장이 body에 적어 둔 강 번호(심화 강 포함)를 먼저 읽고, 없으면 제목의 「N강」을 읽는다.
const currentLesson = () => Number(document.body.dataset.lessonNumber || document.title.match(/(\d)강/)?.[1] || 1);
const endpoint = globalThis.ACADEMY_HELPER_ENDPOINT;
const publicMode = typeof endpoint === "string" && endpoint.trim().length > 0;
let publicAsk = null;
let endpointError = null;
if (publicMode) {
  try { publicAsk = createAcademyHelperClient({ endpoint }); }
  catch (error) { endpointError = error; }
}
const STARTERS = [
  "AI 앱이 없어요. 어디서 시작해요?",
  "뭐라고 첫 말을 보내야 할지 모르겠어요",
  "AI 답이 이미 괜찮은데 뭘 더 해야 해요?",
  "AI가 확인했다고 하면 믿어도 되나요?"
];

let busy = false;
let activeLesson = currentLesson();
const load = (lesson) => { try { const value = JSON.parse(sessionStorage.getItem(`${STORE}-${lesson}`) ?? "[]"); return Array.isArray(value) ? value.filter(m => ["user", "assistant"].includes(m?.role) && typeof m.content === "string").slice(-16) : []; } catch { return []; } };
let messages = load(activeLesson);
const save = (conversation = messages, lesson = activeLesson) => { try { sessionStorage.setItem(`${STORE}-${lesson}`, JSON.stringify(conversation.slice(-16))); } catch {} };

const root = document.createElement("div");
root.className = "ch-root";
root.innerHTML = `
  <button type="button" class="ch-open" aria-expanded="false" aria-controls="ch-panel">막히면 도우미에게</button>
  <section id="ch-panel" class="ch-panel" hidden aria-label="수업 도우미">
    <header class="ch-head">
      <div><strong>수업 도우미</strong><span>${publicMode ? "연결 모드 · Anthropic Claude" : "지금 강의 질문만 도와요 · 시험판"}</span></div>
      <button type="button" class="ch-close" aria-label="닫기">닫기</button>
    </header>
    <p class="ch-disclosure"${publicMode ? "" : " hidden"} role="note">${publicMode ? PUBLIC_DISCLOSURE : ""}</p>
    <ol class="ch-list" aria-live="polite"></ol>
    <div class="ch-starters"></div>
    <form class="ch-form">
      <label class="ch-sr" for="ch-input">도우미에게 묻기</label>
      <textarea id="ch-input" rows="2" maxlength="1500" placeholder="예: 첫 답이 너무 길어요. 뭐라고 다시 말하죠?"></textarea>
      <button type="submit">묻기</button>
    </form>
    <p class="ch-note">개인정보·실명은 넣지 마세요. 도우미 대화는 이 탭에 강별로 잠시 보관되며 탭을 닫으면 사라집니다. 실습은 자기 AI에서 계속하세요. <button type="button" class="ch-reset">대화 지우기</button></p>
  </section>`;
document.body.append(root);

const openBtn = root.querySelector(".ch-open");
const panel = root.querySelector(".ch-panel");
const list = root.querySelector(".ch-list");
const starters = root.querySelector(".ch-starters");
const form = root.querySelector(".ch-form");
const input = root.querySelector("#ch-input");

// 실습 준비 자료(setup-guide.mjs)의 공식 주소만 눌러서 새 탭으로 연다. 다른 주소는 글자로만 둔다.
const OFFICIAL_HOSTS = new Set(["chatgpt.com", "gemini.google.com", "claude.ai"]);
function appendText(el, text) {
  text.split(/(https:\/\/[^\s」)\]<>"']+)/).forEach((part) => {
    if (!part) return;
    const [, raw = "", tail = ""] = part.match(/^(https:\/\/.*?)([.,!?。]*)$/) ?? [];
    let url = null;
    try { url = raw ? new URL(raw) : null; } catch { url = null; }
    if (!url || !OFFICIAL_HOSTS.has(url.hostname)) { el.append(document.createTextNode(part)); return; }
    const a = document.createElement("a");
    a.href = url.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "ch-link";
    a.textContent = `${url.hostname} 열기 ↗`;
    a.title = `${url.href} · 새 탭에서 열려요. 다 하면 이 강의장 탭으로 돌아오세요.`;
    el.append(a);
    if (tail) el.append(document.createTextNode(tail));
  });
}

// 모델이 가끔 붙이는 **강조**·# 제목 기호를 글자 그대로 보이지 않게 한다(HTML은 만들지 않는다).
function fill(el, text) {
  el.replaceChildren();
  const clean = String(text).replace(/^#{1,6}\s+/gm, "").replace(/__(.+?)__/g, "**$1**");
  clean.split(/(\*\*[^*\n]+\*\*)/).forEach((part) => {
    if (/^\*\*[^*\n]+\*\*$/.test(part)) {
      const strong = document.createElement("strong");
      strong.textContent = part.slice(2, -2);
      el.append(strong);
    } else if (part) appendText(el, part.replace(/\*\*/g, ""));
  });
}
function bubble(role, text) {
  const li = document.createElement("li");
  li.className = `ch-msg ch-${role}`;
  fill(li, text);
  list.append(li);
  li.scrollIntoView({ block: "end" });
  return li;
}
function draw() {
  list.replaceChildren();
  bubble("assistant", START);
  for (const m of messages) bubble(m.role, m.content);
  starters.hidden = messages.length > 0;
}
for (const s of STARTERS) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = s;
  b.addEventListener("click", () => { if (!busy) { input.value = s; input.focus(); } });
  starters.append(b);
}
function toggle(open) {
  panel.hidden = !open;
  openBtn.setAttribute("aria-expanded", String(open));
  root.classList.toggle("is-open", open);
  if (open) { draw(); input.focus(); }
}
openBtn.addEventListener("click", () => toggle(panel.hidden));
root.querySelector(".ch-close").addEventListener("click", () => toggle(false));
root.querySelector(".ch-reset").addEventListener("click", () => { if (!busy) { messages = []; save(); draw(); } });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  const text = input.value.trim();
  if (!text) return;
  busy = true;
  form.querySelector("button").disabled = true;
  root.querySelector(".ch-reset").disabled = true;
  input.disabled = true;
  input.value = "";
  const requestLesson = activeLesson;
  const requestMessages = messages;
  requestMessages.push({ role: "user", content: text });
  save(requestMessages, requestLesson);
  starters.hidden = true;
  bubble("user", text);
  const pending = bubble("assistant", "수업 내용에서 찾아보는 중…");
  const stage = document.querySelector("[data-stage-title]")?.textContent?.trim() ?? "";
  try {
    const payload = { messages: requestMessages.slice(-16), stage, lesson: requestLesson };
    let data;
    if (publicMode) {
      if (!publicAsk) throw endpointError || new Error("수업 도우미 연결 주소를 확인해 주세요.");
      data = await publicAsk(payload);
    } else {
      const res = await fetch("/__helper/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      data = await res.json();
      if (!res.ok || !data.answer) throw new Error(data.error);
    }
    fill(pending, data.answer);
    requestMessages.push({ role: "assistant", content: data.answer });
    save(requestMessages, requestLesson);
  } catch (error) {
    pending.textContent = error?.message || "지금은 답을 만들지 못했어요. 잠시 뒤 다시 물어봐 주세요.";
    requestMessages.pop();
    save(requestMessages, requestLesson);
  } finally {
    busy = false;
    form.querySelector("button").disabled = false;
    root.querySelector(".ch-reset").disabled = false;
    input.disabled = false;
    if (!panel.hidden) input.focus();
  }
});

root.addEventListener("keydown", (event) => { if (event.key === "Escape") { toggle(false); openBtn.focus(); } });

new MutationObserver(() => { const nextLesson = currentLesson(); if (nextLesson !== activeLesson) { activeLesson = nextLesson; messages = load(activeLesson); if (!panel.hidden) draw(); } }).observe(document.querySelector("title"), { childList: true, subtree: true });
