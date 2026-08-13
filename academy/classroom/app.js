const ROUTES = new Map([
  ["home", { mode: "home", title: "바른생활 일곱 강 과정" }],
  ["lesson-1", { mode: "lesson", title: "1강 · 프롬프트는 버려라" }]
]);

const routeViews = Array.from(document.querySelectorAll("[data-route]"));
const toast = document.querySelector(".toast");
const LESSON1_SCENES = [
  { title: "AI보다 먼저, 우리끼리 대화합니다", time: "00:00–10:00" },
  { title: "어느 답이 더 위험할까요?", time: "10:00–12:00" },
  { title: "딱 보기에는 완벽했습니다", time: "12:00–15:00" },
  { title: "링크를 눌렀더니 아무것도 없었습니다", time: "15:00–17:00" },
  { title: "화면을 보여주고, 묻고, 고치고, 다시 보여줬습니다", time: "17:00–20:00" },
  { title: "반쯤 떠오른 생각도 대화하며 선명해집니다", time: "20:00–24:00" },
  { title: "어떤 AI든 좋아요. 쓰던 곳에서 시작하세요", time: "24:00–39:00" },
  { title: "이번에는 일을 내려놓고 시시콜콜 말합니다", time: "39:00–46:00" },
  { title: "원하는 사람만 한 문장을 나눕니다", time: "46:00–50:00" }
];
const lesson1SceneButtons = Array.from(document.querySelectorAll("[data-lesson1-scene]"));
const lesson1Panels = Array.from(document.querySelectorAll("[data-lesson1-panel]"));
const lesson1Position = document.querySelector("[data-lesson1-position]");
const lesson1Title = document.querySelector("[data-lesson1-title]");
const lesson1Time = document.querySelector("[data-lesson1-time]");
const lesson1Prev = document.querySelector("[data-lesson1-prev]");
const lesson1Next = document.querySelector("[data-lesson1-next]");
let currentLesson1Scene = 0;
let toastTimer;
let lastDialogTrigger = null;

function routeFromHash() {
  const candidate = window.location.hash.slice(1);
  return ROUTES.has(candidate) ? candidate : "home";
}

function focusWithoutScroll(element) {
  if (!element) return;
  element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
  element.addEventListener(
    "blur",
    () => {
      element.removeAttribute("tabindex");
    },
    { once: true }
  );
}

function renderRoute({ focusHeading = false } = {}) {
  const routeName = routeFromHash();
  const route = ROUTES.get(routeName);

  for (const view of routeViews) {
    view.hidden = view.dataset.route !== routeName;
  }

  document.body.dataset.mode = route.mode;
  document.title = `${route.title} | HAM MEDIA ACADEMY`;

  for (const navLink of document.querySelectorAll("[data-nav-route]")) {
    const isCurrent = navLink.dataset.navRoute === routeName;
    if (isCurrent) navLink.setAttribute("aria-current", "page");
    else navLink.removeAttribute("aria-current");
  }

  if (focusHeading) {
    const currentView = routeViews.find((view) => view.dataset.route === routeName);
    const heading = currentView?.querySelector("h1");
    window.scrollTo({ top: 0, behavior: "auto" });
    focusWithoutScroll(heading);
  }
}

function showToast(message) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
    toast.textContent = "";
  }, 2600);
}

async function copyText(text) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(text);
    showToast("문장을 복사했습니다. 내 AI 화면에 붙여넣으세요.");
    return true;
  } catch {
    let helper;
    try {
      helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      const copied = document.execCommand("copy");
      if (!copied) throw new Error("Copy command failed");
      showToast("문장을 복사했습니다. 내 AI 화면에 붙여넣으세요.");
      return true;
    } catch {
      showToast("복사하지 못했습니다. 화면의 문장을 직접 선택해 주세요.");
      return false;
    } finally {
      helper?.remove();
    }
  }
}

function renderLesson1Scene(index, { focusHeading = false } = {}) {
  const nextIndex = Math.max(0, Math.min(index, LESSON1_SCENES.length - 1));
  const scene = LESSON1_SCENES[nextIndex];
  currentLesson1Scene = nextIndex;

  for (const button of lesson1SceneButtons) {
    const isCurrent = Number(button.dataset.lesson1Scene) === nextIndex;
    if (isCurrent) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  }

  for (const panel of lesson1Panels) {
    panel.hidden = Number(panel.dataset.lesson1Panel) !== nextIndex;
  }

  if (lesson1Position) lesson1Position.textContent = `장면 ${nextIndex + 1} / ${LESSON1_SCENES.length}`;
  if (lesson1Title) lesson1Title.textContent = scene.title;
  if (lesson1Time) lesson1Time.textContent = scene.time;
  if (lesson1Prev) lesson1Prev.disabled = nextIndex === 0;
  if (lesson1Next) {
    lesson1Next.disabled = nextIndex === LESSON1_SCENES.length - 1;
    lesson1Next.textContent = nextIndex === LESSON1_SCENES.length - 1 ? "1강 흐름 끝" : "다음 장면";
  }

  if (focusHeading) {
    const panel = lesson1Panels[nextIndex];
    panel?.scrollIntoView({ behavior: "auto", block: "start" });
    focusWithoutScroll(panel?.querySelector("h2"));
  }
}

function setPressedChoice(button, selector) {
  for (const peer of document.querySelectorAll(selector)) {
    peer.setAttribute("aria-pressed", String(peer === button));
    peer.classList.toggle("is-chosen", peer === button);
  }
}

function handleDangerChoice(button) {
  const activity = button.closest("[data-danger-activity]");
  if (!activity || activity.dataset.done === "true") return;
  const feedback = activity.querySelector("#danger-feedback");
  const choice = button.dataset.dangerChoice;
  const triedOnce = activity.dataset.tries === "1";

  if (choice === "rough" && !triedOnce) {
    activity.dataset.tries = "1";
    button.disabled = true;
    button.classList.add("is-tried");
    if (feedback) {
      feedback.textContent = "힌트: 위험한 답은 틀린 티가 잘 나는 답보다, 매끈해서 확인을 멈추게 만드는 답일 수 있습니다. 남은 답을 다시 골라보세요.";
      feedback.classList.add("is-hint");
    }
    return;
  }

  if (choice === "polished") {
    activity.dataset.done = "true";
    setPressedChoice(button, "[data-danger-choice]");
    for (const peer of activity.querySelectorAll("[data-danger-choice]")) peer.disabled = true;
    if (feedback) {
      feedback.textContent = triedOnce
        ? "다시 보고 찾았습니다. 그럴듯한 답일수록 사실·숫자·출처를 직접 확인해야 합니다."
        : "그럴듯한 답이 더 위험할 수 있습니다. 자연스러운 문장이 사실이라는 보장은 없기 때문입니다.";
      feedback.classList.remove("is-hint");
      feedback.classList.add("is-success");
    }
  }
}

function inspectRecreatedDocument(button) {
  const warning = document.querySelector("[data-doc-warning]");
  if (warning) warning.hidden = false;
  button.disabled = true;
  button.textContent = "사실·숫자·출처를 확인했습니다";
}

function inspectRecreatedLinks(button) {
  const labels = ["페이지 없음", "출처와 내용 불일치", "원문 확인 불가"];
  const rows = Array.from(document.querySelectorAll("[data-link-row]"));
  rows.forEach((row, index) => {
    row.classList.add("is-broken");
    const state = row.querySelector("span");
    if (state) state.textContent = labels[index];
  });
  const feedback = document.querySelector("[data-link-feedback]");
  if (feedback) feedback.textContent = "햄PD의 현재 회고를 바탕으로 재구성: ‘또 구라친다. 링크 안 열린다. 모르면 모른다고 해.’ 직접 확인하고 다시 말하게 한 것이 대화의 시작이었습니다.";
  button.disabled = true;
  button.textContent = "세 출처를 직접 확인했습니다";
}

function selectEvidenceStep(button) {
  setPressedChoice(button, "[data-evidence]");
  const messages = [
    "말로 설명하기 어려우면 현재 화면을 보여줍니다. 이름·계정·고객정보는 먼저 가립니다.",
    "한꺼번에 맡기지 않고 ‘지금 어디를 조정하면 되는지 한 단계만’ 묻습니다.",
    "AI가 대신 누른 것이 아닙니다. 햄이 자기 화면에서 직접 조정합니다.",
    "바뀐 화면을 다시 보여주며 전후가 맞는지 비교합니다. 첫 답은 끝이 아니라 다음 대화입니다."
  ];
  const note = document.querySelector("[data-evidence-note]");
  if (note) note.textContent = messages[Number(button.dataset.evidence)] ?? messages[0];
}

function openDemoCorrection(button) {
  const after = document.querySelector("[data-demo-after]");
  if (after) after.hidden = false;
  button.disabled = true;
  button.textContent = "정정 뒤 달라진 답을 확인했습니다";
}

function selectUnderstood(button) {
  setPressedChoice(button, "[data-understood]");
  const feedback = document.querySelector("[data-understood-feedback]");
  const messages = {
    yes: "잘 알아들었다면 왜 그랬는지 한 문장만 더 말해보세요. 대화가 더 구체적으로 바뀝니다.",
    half: "반쯤 맞았다면 ‘맞는 부분은 여기고, 다른 부분은 이거야’라고 나눠서 말해보세요.",
    no: "엉뚱해도 괜찮습니다. ‘그건 내 이야기와 달라’라고 멈추고 자기 말로 다시 설명해보세요."
  };
  if (feedback) feedback.textContent = messages[button.dataset.understood] ?? messages.no;
}

function selectLifeTopic(button) {
  setPressedChoice(button, "[data-topic]");
  const topic = button.dataset.topic;
  const feedback = document.querySelector("[data-topic-feedback]");
  const starter = document.getElementById("lesson1-life-starter");
  if (!feedback || !topic) return;
  const extra = topic === "가족" ? " 말하고 싶지 않은 내용은 넘기고, 이름과 개인 정보는 빼도 됩니다." : "";
  const sentence = `오늘은 일 말고 ${topic}를 이야기하고 싶어. 네가 궁금한 것을 한 번에 하나씩 물어봐.`;
  if (starter) starter.textContent = sentence;
  feedback.textContent = `새 채팅에서 아래 문장으로 시작해보세요.${extra}`;
}

function revealLesson1Bridge(message) {
  const light = document.querySelector("[data-light]");
  const feedback = document.querySelector("[data-reflection-feedback]");
  const bridge = document.querySelector("[data-lesson1-bridge]");
  light?.classList.add("is-on");
  if (feedback) feedback.textContent = message;
  if (bridge) bridge.hidden = false;
}

function selectReflection(button) {
  const kind = button.dataset.reflectionKind;
  if (!kind) return;
  setPressedChoice(button, `[data-reflection-kind="${kind}"]`);
  const before = document.querySelector('[data-reflection-kind="before"][aria-pressed="true"]');
  const after = document.querySelector('[data-reflection-kind="after"][aria-pressed="true"]');
  if (before && after) {
    revealLesson1Bridge(`원하면 이렇게 나눌 수 있습니다. “예전에는 ${before.dataset.reflectionWord}, 지금은 ${after.dataset.reflectionWord}.” 말하지 않고 마음속으로만 확인해도 됩니다.`);
  }
}

function selectChoice(button) {
  const groupName = button.dataset.choiceGroup;
  if (groupName) {
    for (const peer of document.querySelectorAll(`[data-choice-group="${groupName}"]`)) {
      peer.classList.toggle("is-chosen", peer === button);
      peer.setAttribute("aria-pressed", String(peer === button));
    }
  }

  const responseTarget = button.dataset.responseTarget;
  const response = button.dataset.response;
  if (responseTarget && response) {
    const output = document.getElementById(responseTarget);
    if (output) output.textContent = response;
  }
}

function selectMaterial(button) {
  const label = button.dataset.materialChoice;
  if (!label) return;

  for (const peer of document.querySelectorAll("[data-material-choice]")) {
    const isCurrent = peer === button;
    peer.classList.toggle("is-chosen", isCurrent);
    peer.setAttribute("aria-pressed", String(isCurrent));
  }

  for (const output of document.querySelectorAll("[data-material-current]")) {
    output.textContent = label;
  }

  showToast("이 업무 재료는 2강에서 이어 씁니다.");
}

function openDialog(id, trigger) {
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement)) return;
  lastDialogTrigger = trigger;
  dialog.showModal();
  const closeButton = dialog.querySelector("[data-dialog-close]");
  closeButton?.focus();
}

function closeDialog(dialog) {
  if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
  dialog.close();
}

function safetyButtons(activity) {
  return Array.from(activity.querySelectorAll("[data-safety-choice]"));
}

function lockSafetyButtons(activity, highlightedButton) {
  for (const button of safetyButtons(activity)) {
    if (button === highlightedButton) {
      button.disabled = false;
      button.setAttribute("aria-disabled", "true");
      button.tabIndex = -1;
      button.style.setProperty("background-color", "#7EB5E8", "important");
    } else {
      button.disabled = true;
    }
  }
}

function finishSafetyActivity(activity, selectedButton, { foundAfterHint = false } = {}) {
  const feedback = activity.querySelector(".safety-feedback");
  const reset = activity.querySelector("[data-safety-reset]");
  activity.dataset.done = "true";

  selectedButton.classList.add("is-right");
  lockSafetyButtons(activity, selectedButton);
  if (feedback) {
    feedback.hidden = false;
    feedback.className = "safety-feedback safety-feedback--success";
    feedback.innerHTML = foundAfterHint
      ? "<strong>다시 보고 찾았어요.</strong><span>이름·메일·고객정보를 가린 뒤 막힌 화면만 캡처합니다. 고쳐 찾은 것도 중요한 실습입니다.</span>"
      : "<strong>바로 찾았어요.</strong><span>이름·메일·고객정보를 가린 뒤 막힌 화면만 캡처합니다. 비밀번호와 인증번호는 보여주지 않습니다.</span>";
  }
  if (reset) reset.hidden = false;
}

function handleSafetyChoice(button) {
  const activity = button.closest("[data-safety-activity]");
  if (!activity || activity.dataset.done === "true") return;

  const feedback = activity.querySelector(".safety-feedback");
  const reset = activity.querySelector("[data-safety-reset]");
  const tries = Number(activity.dataset.tries ?? "0") + 1;
  const isSafe = button.dataset.safetyChoice === "safe";
  activity.dataset.tries = String(tries);

  if (isSafe) {
    finishSafetyActivity(activity, button, { foundAfterHint: tries > 1 });
    return;
  }

  button.disabled = true;
  button.classList.add("is-tried");

  if (tries === 1) {
    if (feedback) {
      feedback.hidden = false;
      feedback.className = "safety-feedback safety-feedback--hint";
      feedback.innerHTML =
        "<strong>잠깐, 정답은 아직 보여주지 않을게요.</strong><span>비밀번호·인증번호·계정 연결 승인은 AI에게 보여주거나 맡기지 않아도 됩니다. 민감정보를 가린 뒤 남은 답에서 한 번 더 골라보세요.</span>";
    }
    if (reset) reset.hidden = true;
    return;
  }

  activity.dataset.done = "true";
  const safeOption = safetyButtons(activity).find((option) => option.dataset.safetyChoice === "safe");
  if (safeOption) safeOption.classList.add("is-answer");
  lockSafetyButtons(activity, safeOption);
  if (feedback) {
    feedback.hidden = false;
    feedback.className = "safety-feedback safety-feedback--review";
    feedback.innerHTML =
      "<strong>여기는 함께 한 번 더 봐요.</strong><span>먼저 이름·메일·고객정보를 가린 뒤 화면을 캡처합니다. 비밀번호·인증번호·복구코드·API 키는 캡처하지 않습니다.</span>";
  }
  if (reset) reset.hidden = false;
}

function resetSafetyActivity(button) {
  const activity = button.closest("[data-safety-activity]");
  if (!activity) return;
  delete activity.dataset.tries;
  delete activity.dataset.done;
  for (const option of safetyButtons(activity)) {
    option.disabled = false;
    option.removeAttribute("aria-disabled");
    option.removeAttribute("tabindex");
    option.style.removeProperty("background-color");
    option.classList.remove("is-tried", "is-right", "is-answer");
  }
  const feedback = activity.querySelector(".safety-feedback");
  if (feedback) {
    feedback.hidden = true;
    feedback.className = "safety-feedback";
    feedback.textContent = "";
  }
  button.hidden = true;
  safetyButtons(activity)[0]?.focus();
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const lesson1SceneButton = target.closest("[data-lesson1-scene]");
  if (lesson1SceneButton) {
    renderLesson1Scene(Number(lesson1SceneButton.dataset.lesson1Scene), { focusHeading: true });
    return;
  }

  const lesson1Previous = target.closest("[data-lesson1-prev]");
  if (lesson1Previous) {
    renderLesson1Scene(currentLesson1Scene - 1, { focusHeading: true });
    return;
  }

  const lesson1Following = target.closest("[data-lesson1-next]");
  if (lesson1Following) {
    renderLesson1Scene(currentLesson1Scene + 1, { focusHeading: true });
    return;
  }

  const dangerChoice = target.closest("[data-danger-choice]");
  if (dangerChoice) {
    handleDangerChoice(dangerChoice);
    return;
  }

  const documentInspector = target.closest("[data-inspect-doc]");
  if (documentInspector) {
    inspectRecreatedDocument(documentInspector);
    return;
  }

  const linkInspector = target.closest("[data-open-links]");
  if (linkInspector) {
    inspectRecreatedLinks(linkInspector);
    return;
  }

  const evidenceStep = target.closest("[data-evidence]");
  if (evidenceStep) {
    selectEvidenceStep(evidenceStep);
    return;
  }

  const demoCorrection = target.closest("[data-demo-correction]");
  if (demoCorrection) {
    openDemoCorrection(demoCorrection);
    return;
  }

  const understoodChoice = target.closest("[data-understood]");
  if (understoodChoice) {
    selectUnderstood(understoodChoice);
    return;
  }

  const topicChoice = target.closest("[data-topic]");
  if (topicChoice) {
    selectLifeTopic(topicChoice);
    return;
  }

  const reflectionChoice = target.closest("[data-reflection-kind]");
  if (reflectionChoice) {
    selectReflection(reflectionChoice);
    return;
  }

  const reflectionSkip = target.closest("[data-reflection-skip]");
  if (reflectionSkip) {
    revealLesson1Bridge("오늘은 듣기만 해도 됩니다. 자기 AI와 대화가 이어졌다면 이미 성공입니다.");
    reflectionSkip.disabled = true;
    reflectionSkip.textContent = "듣기만 하기로 했습니다";
    return;
  }

  const skipLink = target.closest("[data-skip-link]");
  if (skipLink) {
    event.preventDefault();
    document.getElementById("main-content")?.focus({ preventScroll: false });
    return;
  }

  const scrollButton = target.closest("[data-scroll-target]");
  if (scrollButton) {
    const section = document.getElementById(scrollButton.dataset.scrollTarget);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      focusWithoutScroll(section.querySelector("h2"));
    }
    return;
  }

  const materialChoice = target.closest("[data-material-choice]");
  if (materialChoice) {
    selectMaterial(materialChoice);
    return;
  }

  const copyTargetButton = target.closest("[data-copy-target]");
  if (copyTargetButton) {
    const source = document.getElementById(copyTargetButton.dataset.copyTarget);
    if (source) {
      void copyText(source.textContent.trim()).then((copied) => {
        const feedback = document.querySelector("[data-course-pack-feedback]");
        if (!feedback) return;
        if (copied && copyTargetButton.dataset.copyTarget === "lesson1-course-pack") {
          feedback.textContent = "수업문을 실제로 복사했습니다. 자기 AI에 붙여넣고, 한 번에 질문 하나씩 대화하세요.";
        } else if (copied && copyTargetButton.dataset.copyTarget === "lesson1-summary-request") {
          feedback.textContent = "마지막 확인문을 실제로 복사했습니다. AI가 정리한 내용에서 사실과 추측을 직접 확인하세요.";
        } else if (!copied && copyTargetButton.closest(".course-pack")) {
          feedback.textContent = "자동 복사가 되지 않았습니다. 위에 보이는 수업문을 직접 선택해 복사해 주세요.";
        }
      });
    }
    return;
  }

  const copyChoice = target.closest("[data-copy-text]");
  if (copyChoice) {
    selectChoice(copyChoice);
    void copyText(copyChoice.dataset.copyText);
    return;
  }

  const statusChoice = target.closest("[data-status-choice]");
  if (statusChoice) {
    selectChoice(statusChoice);
    return;
  }

  const safetyChoice = target.closest("[data-safety-choice]");
  if (safetyChoice) {
    handleSafetyChoice(safetyChoice);
    return;
  }

  const safetyReset = target.closest("[data-safety-reset]");
  if (safetyReset) {
    resetSafetyActivity(safetyReset);
    return;
  }

  const checkButton = target.closest("[data-check]");
  if (checkButton) {
    const nextState = checkButton.getAttribute("aria-pressed") !== "true";
    checkButton.setAttribute("aria-pressed", String(nextState));
    return;
  }

  const dialogOpener = target.closest("[data-dialog-open]");
  if (dialogOpener) {
    openDialog(dialogOpener.dataset.dialogOpen, dialogOpener);
    return;
  }

  const dialogCloser = target.closest("[data-dialog-close]");
  if (dialogCloser) {
    closeDialog(dialogCloser.closest("dialog"));
    return;
  }

  if (target instanceof HTMLDialogElement) {
    const bounds = target.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) closeDialog(target);
  }
});

for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("close", () => {
    if (lastDialogTrigger instanceof HTMLElement && lastDialogTrigger.isConnected) {
      lastDialogTrigger.focus();
    }
    lastDialogTrigger = null;
  });
}

window.addEventListener("hashchange", () => {
  if (window.location.hash === "#main-content") {
    document.getElementById("main-content")?.focus({ preventScroll: false });
    return;
  }
  if (!ROUTES.has(window.location.hash.slice(1))) {
    window.history.replaceState(null, "", "#home");
  }
  renderRoute({ focusHeading: true });
});

if (!window.location.hash || !ROUTES.has(window.location.hash.slice(1))) {
  window.history.replaceState(null, "", "#home");
}

renderRoute({ focusHeading: false });
renderLesson1Scene(0, { focusHeading: false });
