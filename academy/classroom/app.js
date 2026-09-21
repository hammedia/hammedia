const STORAGE_KEY = "ham-academy-barunsaenghwal-seven-hour-v1";
const STAGE_TIMES = ["00~07분", "07~20분", "20~28분", "28~39분", "39~47분", "47~50분"];

const elements = {
  overallProgress: document.querySelector("[data-overall-progress]"),
  completionCount: document.querySelector("[data-completion-count]"),
  progressBar: document.querySelector("[data-progress-bar]"),
  lessonNav: document.querySelector("[data-lesson-nav]"),
  stageNav: document.querySelector("[data-stage-nav]"),
  lessonKicker: document.querySelector("[data-lesson-kicker]"),
  lessonTitle: document.querySelector("[data-lesson-title]"),
  lessonQuestion: document.querySelector("[data-lesson-question]"),
  stage: document.querySelector("#lesson-stage"),
  stageKicker: document.querySelector("[data-stage-kicker]"),
  stageTitle: document.querySelector("[data-stage-title]"),
  stageTime: document.querySelector("[data-stage-time]"),
  stageCopy: document.querySelector("[data-stage-copy]"),
  evidencePanel: document.querySelector("[data-evidence-panel]"),
  evidenceViewer: document.querySelector("[data-evidence-viewer]"),
  toggleSources: document.querySelector("[data-toggle-sources]"),
  sourceList: document.querySelector("[data-source-list]"),
  studentWork: document.querySelector("[data-student-work]"),
  firstField: document.querySelector(".first-field"),
  correctionSheet: document.querySelector(".correction-sheet"),
  retryField: document.querySelector(".retry-field"),
  attemptPrompt: document.querySelector("[data-attempt-prompt]"),
  retryPrompt: document.querySelector("[data-retry-prompt]"),
  correctionCriteria: document.querySelector("[data-correction-criteria]"),
  firstAttempt: document.querySelector("[data-first-attempt]"),
  correctionNote: document.querySelector("[data-correction-note]"),
  retry: document.querySelector("[data-retry]"),
  firstCount: document.querySelector("[data-first-count]"),
  correctionCount: document.querySelector("[data-correction-count]"),
  retryCount: document.querySelector("[data-retry-count]"),
  autosaveState: document.querySelector("[data-autosave-state]"),
  resultStage: document.querySelector("[data-result-stage]"),
  outputLabel: document.querySelector("[data-output-label]"),
  resultState: document.querySelector("[data-result-state]"),
  resultTemplate: document.querySelector("[data-result-template]"),
  verificationList: document.querySelector("[data-verification-list]"),
  nextLesson: document.querySelector("[data-next-lesson]"),
  artifactState: document.querySelector("[data-artifact-state]"),
  paperKicker: document.querySelector("[data-paper-kicker]"),
  paperTitle: document.querySelector("[data-paper-title]"),
  paperPromise: document.querySelector("[data-paper-promise]"),
  paperBody: document.querySelector("[data-paper-body]"),
  paperProof: document.querySelector("[data-paper-proof]"),
  paperNext: document.querySelector("[data-paper-next]"),
  artifactHistory: document.querySelector("[data-artifact-history]"),
  downloadHtml: document.querySelector("[data-download-html]"),
  downloadHandoff: document.querySelector("[data-download-handoff]"),
  nextKicker: document.querySelector("[data-next-kicker]"),
  nextLabel: document.querySelector("[data-next-label]"),
  nextDescription: document.querySelector("[data-next-description]"),
  previousStep: document.querySelector("[data-previous-step]"),
  saveNext: document.querySelector("[data-save-next]"),
  resetCourse: document.querySelector("[data-reset-course]"),
  resetDialog: document.querySelector("[data-reset-dialog]"),
  announcement: document.querySelector("[data-announcement]")
};

const course = await fetch("data/course.json", { cache: "no-store" }).then((response) => {
  if (!response.ok) throw new Error(`강의 데이터를 열지 못했습니다: ${response.status}`);
  return response.json();
});

const freshState = () => ({
  courseVersion: course.courseVersion,
  artifactId: globalThis.crypto?.randomUUID?.() ?? `artifact-${Date.now()}`,
  currentLesson: 0,
  currentStage: 0,
  lessons: Object.fromEntries(course.lessons.map((lesson) => [lesson.id, {
    firstAttempt: "",
    correctionNote: "",
    retry: "",
    checks: lesson.correctionCriteria.map(() => false),
    completed: false,
    verifiedAt: null
  }]))
});

const loadState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.courseVersion !== course.courseVersion || !saved.artifactId) return freshState();
    const baseline = freshState();
    for (const lesson of course.lessons) {
      baseline.lessons[lesson.id] = { ...baseline.lessons[lesson.id], ...(saved.lessons?.[lesson.id] ?? {}) };
      if (!Array.isArray(baseline.lessons[lesson.id].checks) || baseline.lessons[lesson.id].checks.length !== lesson.correctionCriteria.length) {
        baseline.lessons[lesson.id].checks = lesson.correctionCriteria.map(() => false);
      }
    }
    baseline.artifactId = saved.artifactId;
    baseline.currentLesson = Math.min(Math.max(Number(saved.currentLesson) || 0, 0), course.lessons.length - 1);
    baseline.currentStage = Math.min(Math.max(Number(saved.currentStage) || 0, 0), 5);
    return baseline;
  } catch {
    return freshState();
  }
};

let state = loadState();
let saveTimer;

const currentLesson = () => course.lessons[state.currentLesson];
const currentWork = () => state.lessons[currentLesson().id];

const text = (tag, value, className) => {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
};

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  elements.autosaveState.textContent = "저장됨";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { elements.autosaveState.textContent = "이 기기에 자동 저장"; }, 1200);
};

const announce = (message) => {
  elements.announcement.textContent = "";
  requestAnimationFrame(() => { elements.announcement.textContent = message; });
};

const lessonOutput = (index) => state.lessons[course.lessons[index].id].retry.trim();

function renderLessonNavigation() {
  const fragment = document.createDocumentFragment();
  course.lessons.forEach((lesson, index) => {
    const work = state.lessons[lesson.id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lesson-nav-button${work.completed ? " is-complete" : ""}${lesson.locked ? " is-locked" : ""}`;
    if (lesson.locked) {
      button.disabled = true;
      button.title = "준비 중입니다. 1강을 먼저 열었습니다.";
    }
    button.dataset.lessonIndex = String(index);
    button.setAttribute("aria-current", index === state.currentLesson ? "true" : "false");
    button.append(text("span", `${lesson.number}강`, "lesson-number"));
    const copy = document.createElement("span");
    copy.className = "lesson-nav-copy";
    copy.append(text("strong", lesson.shortTitle), text("span", lesson.output.label));
    button.append(copy, text("span", lesson.locked ? "준비 중" : (work.completed ? "✓" : ""), "lesson-complete-mark"));
    button.addEventListener("click", () => {
      saveInputs();
      state.currentLesson = index;
      state.currentStage = 0;
      persist();
      render();
      elements.stage.focus({ preventScroll: true });
    });
    fragment.append(button);
  });
  elements.lessonNav.replaceChildren(fragment);
  requestAnimationFrame(() => elements.lessonNav.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center" }));
}

function renderStageNavigation() {
  const lesson = currentLesson();
  const fragment = document.createDocumentFragment();
  lesson.flow.forEach((stage, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `stage-nav-button${index < state.currentStage ? " is-done" : ""}`;
    button.textContent = stage.label;
    button.dataset.stageIndex = String(index);
    if (index === state.currentStage) button.setAttribute("aria-current", "step");
    button.addEventListener("click", () => {
      saveInputs();
      state.currentStage = index;
      persist();
      render();
      elements.stage.focus({ preventScroll: true });
    });
    fragment.append(button);
  });
  elements.stageNav.replaceChildren(fragment);
  requestAnimationFrame(() => elements.stageNav.querySelector('[aria-current="step"]')?.scrollIntoView({ block: "nearest", inline: "center" }));
}

function stageCopyNodes(lesson, stageIndex) {
  const fragment = document.createDocumentFragment();
  if (stageIndex === 0) {
    fragment.append(text("p", lesson.teacherStory));
    const lines = document.createElement("div");
    lines.append(
      truthLine("처음 믿은 것", lesson.misbelief),
      truthLine("오늘 할 일", lesson.output.label),
      truthLine("다음 강 입력", lesson.nextLesson)
    );
    fragment.append(lines);
  } else if (stageIndex === 1) {
    fragment.append(text("p", lesson.demonstration));
  } else if (stageIndex === 2) {
    fragment.append(text("p", lesson.attemptPrompt));
  } else if (stageIndex === 3) {
    fragment.append(text("p", "강사가 답을 대신 쓰지 않습니다. 수강생에게 ‘왜 이 결과를 그대로 쓸 수 없나요?’라고 먼저 묻고, 수강생이 말한 이유를 교정 메모에 남깁니다."));
  } else if (stageIndex === 4) {
    fragment.append(text("p", lesson.retryPrompt));
  } else {
    fragment.append(text("p", `첫 결과와 다시 한 결과를 나란히 봅니다. ${lesson.output.label}을 다음 강에 그대로 건넵니다.`));
  }
  return fragment;
}

function truthLine(label, value) {
  const row = document.createElement("div");
  row.className = "truth-line";
  row.append(text("strong", label), text("span", value));
  return row;
}

function renderEvidence() {
  const lesson = currentLesson();
  const mediaFragment = document.createDocumentFragment();
  const sourceFragment = document.createDocumentFragment();

  lesson.evidence.forEach((evidence) => {
    if (evidence.type === "video") {
      const figure = document.createElement("figure");
      figure.className = "media-frame";
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.src = evidence.src;
      video.poster = evidence.poster;
      video.setAttribute("aria-label", evidence.alt);
      const caption = document.createElement("figcaption");
      caption.className = "media-caption";
      caption.append(text("strong", evidence.label), text("span", evidence.status === "reconstructed" ? "재구성 표시" : "출처 확인"));
      figure.append(video, caption);
      mediaFragment.append(figure);
    } else if (evidence.type === "image") {
      mediaFragment.append(imageFigure(evidence.src, evidence.alt, evidence.label, evidence.status));
    } else if (evidence.type === "gallery") {
      const gallery = document.createElement("div");
      gallery.className = "gallery-grid";
      evidence.srcs.forEach((src, index) => gallery.append(imageFigure(src, evidence.alts[index], `${index + 1}. ${evidence.label}`, evidence.status)));
      mediaFragment.append(gallery);
    } else {
      const card = document.createElement("div");
      card.className = "text-evidence";
      card.append(text("strong", evidence.label));
      if (evidence.note) card.append(text("p", evidence.note));
      mediaFragment.append(card);
    }

    const source = document.createElement("div");
    source.className = "source-item";
    source.append(text("strong", evidence.label), text("span", `원본: ${evidence.source}`), text("span", `사용선: ${evidence.publication}`), text("span", `상태: ${evidence.status}`));
    sourceFragment.append(source);
  });

  elements.evidenceViewer.replaceChildren(mediaFragment);
  elements.sourceList.replaceChildren(sourceFragment);
}

function imageFigure(src, alt, label, status) {
  const figure = document.createElement("figure");
  figure.className = "media-frame";
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.loading = "eager";
  image.decoding = "async";
  const caption = document.createElement("figcaption");
  caption.className = "media-caption";
  caption.append(text("strong", label), text("span", status === "reconstructed" ? "비식별 재구성" : "실제 화면"));
  figure.append(image, caption);
  return figure;
}

function renderWorkFields() {
  const lesson = currentLesson();
  const work = currentWork();
  elements.firstAttempt.value = work.firstAttempt;
  elements.correctionNote.value = work.correctionNote;
  elements.retry.value = work.retry;
  elements.attemptPrompt.textContent = lesson.attemptPrompt;
  elements.retryPrompt.textContent = lesson.retryPrompt;
  updateCounts();

  const criteria = document.createDocumentFragment();
  lesson.correctionCriteria.forEach((criterion) => criteria.append(text("li", criterion)));
  elements.correctionCriteria.replaceChildren(criteria);

  const stageIndex = state.currentStage;
  elements.firstField.hidden = stageIndex < 2;
  elements.correctionSheet.hidden = stageIndex < 3;
  elements.retryField.hidden = stageIndex < 4;
  elements.firstAttempt.readOnly = stageIndex > 2;
  elements.correctionNote.readOnly = stageIndex > 3;
  elements.retry.readOnly = stageIndex > 4;
}

function renderVerification() {
  const lesson = currentLesson();
  const work = currentWork();
  const fragment = document.createDocumentFragment();
  lesson.correctionCriteria.forEach((criterion, index) => {
    const label = document.createElement("label");
    label.className = "verification-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(work.checks[index]);
    checkbox.addEventListener("change", () => {
      work.checks[index] = checkbox.checked;
      persist();
      updateCompletionState();
      renderArtifact();
    });
    label.append(checkbox, text("span", criterion));
    fragment.append(label);
  });
  elements.verificationList.replaceChildren(fragment);
  elements.outputLabel.textContent = lesson.output.label;
  elements.resultTemplate.textContent = `결과 형식: ${lesson.resultTemplate}`;
  elements.nextLesson.textContent = lesson.nextLesson;
  updateCompletionState();
}

function updateCompletionState() {
  const work = currentWork();
  const checksDone = work.checks.every(Boolean);
  const ready = work.retry.trim().length > 0 && checksDone;
  elements.resultState.textContent = ready ? "저장 가능" : work.retry.trim() ? "확인표 남음" : "작성 중";
}

function renderArtifact() {
  const outputs = course.lessons.map((lesson) => state.lessons[lesson.id].retry.trim());
  const completed = course.lessons.filter((lesson) => state.lessons[lesson.id].completed).length;
  const latestIndex = outputs.reduce((last, value, index) => value ? index : last, -1);
  const promise = outputs[1];
  const latest = latestIndex >= 0 ? outputs[latestIndex] : "";
  const titleCandidate = (promise || outputs[0] || "").split(/\n|\.|。/)[0].trim();

  elements.artifactState.textContent = latestIndex < 0 ? "초안 전" : `${latestIndex + 1}강 결과 반영`;
  elements.paperKicker.textContent = `결과 ID · ${state.artifactId.slice(0, 8)}`;
  elements.paperTitle.textContent = titleCandidate || "아직 제목이 없습니다";
  elements.paperPromise.textContent = promise || "2강에서 누구에게 어떤 도움을 줄지 정하면 이곳에 결과 약속이 생깁니다.";
  elements.paperBody.replaceChildren(text("p", latest || "1강부터 저장한 결과가 이 종이에 차례로 반영됩니다."));
  elements.paperProof.textContent = outputs[5] ? "사람 확인 기록 있음" : "확인 전";
  elements.paperNext.textContent = outputs[6] ? "사용 확인·다음 작업 카드 있음" : "다음 행동 미정";

  const history = document.createDocumentFragment();
  course.resultStates.forEach((result, index) => {
    const item = document.createElement("li");
    const isComplete = Boolean(outputs[index]) || state.lessons[course.lessons[index].id].completed;
    item.className = `${isComplete ? "is-complete" : ""}${index === state.currentLesson ? " is-current" : ""}`.trim();
    item.append(text("span", isComplete ? "✓" : String(index + 1), "history-dot"), text("span", result.label), text("small", isComplete ? "남김" : "대기"));
    history.append(item);
  });
  elements.artifactHistory.replaceChildren(history);

  elements.downloadHtml.disabled = !outputs[4];
  elements.downloadHandoff.disabled = !outputs[6];
  const openLessons = course.lessons.filter((lesson) => !lesson.locked).length;
  elements.overallProgress.textContent = `${state.currentLesson + 1} / ${openLessons}강`;
  elements.completionCount.textContent = `${completed} / ${openLessons}강 저장`;
  elements.progressBar.style.width = `${(completed / openLessons) * 100}%`;
}

function renderDock() {
  const lesson = currentLesson();
  const stage = lesson.flow[state.currentStage];
  const isLastStage = state.currentStage === lesson.flow.length - 1;
  const isLastLesson = state.currentLesson === course.lessons.length - 1;
  elements.previousStep.disabled = state.currentStage === 0 && state.currentLesson === 0;

  if (!isLastStage) {
    const nextStage = lesson.flow[state.currentStage + 1];
    elements.nextKicker.textContent = "계속 수업하기";
    elements.nextLabel.textContent = nextStage.label;
    elements.nextDescription.textContent = `${stage.label}을 마치고 같은 결과의 다음 단계로 갑니다.`;
    elements.saveNext.textContent = `${nextStage.label}로`;
  } else if (!isLastLesson && course.lessons[state.currentLesson + 1].locked) {
    const nextLesson = course.lessons[state.currentLesson + 1];
    elements.nextKicker.textContent = "오늘 여기까지 — 내 결과 저장하기";
    elements.nextLabel.textContent = `${nextLesson.number}강 · ${nextLesson.shortTitle} (준비 중)`;
    elements.nextDescription.textContent = "지금 연 강은 여기까지입니다. 남긴 결과는 이 기기에 저장되고, 다음 강이 열리면 그대로 이어서 씁니다.";
    elements.saveNext.textContent = `${lesson.number}강 저장하고 마치기`;
  } else if (!isLastLesson) {
    const nextLesson = course.lessons[state.currentLesson + 1];
    elements.nextKicker.textContent = "저장하고 다음 강으로";
    elements.nextLabel.textContent = `${nextLesson.number}강 · ${nextLesson.shortTitle}`;
    elements.nextDescription.textContent = lesson.nextLesson;
    elements.saveNext.textContent = `저장하고 ${nextLesson.number}강으로`;
  } else {
    elements.nextKicker.textContent = "일곱 시간의 마지막 확인";
    elements.nextLabel.textContent = "사용 확인·첫 최종본·다음 작업 카드 저장";
    elements.nextDescription.textContent = "새 대화에서 작은 수정 하나를 이어간 뒤 결과를 내려받습니다.";
    elements.saveNext.textContent = "일곱 강 저장하기";
  }
}

function render() {
  const lesson = currentLesson();
  const stage = lesson.flow[state.currentStage];
  document.title = `바른생활 ${lesson.number}강 · ${stage.label}`;
  elements.lessonKicker.textContent = `${lesson.number}강 · ${lesson.shortTitle}`;
  elements.lessonTitle.textContent = lesson.title;
  elements.lessonQuestion.textContent = lesson.question;
  elements.stageKicker.textContent = stage.label;
  elements.stageTitle.textContent = stageTitle(lesson, state.currentStage);
  elements.stageTime.textContent = STAGE_TIMES[state.currentStage];
  elements.stageCopy.replaceChildren(stageCopyNodes(lesson, state.currentStage));

  elements.evidencePanel.hidden = state.currentStage !== 1;
  elements.studentWork.hidden = state.currentStage < 2;
  elements.resultStage.hidden = state.currentStage !== 5;
  elements.sourceList.hidden = true;
  elements.toggleSources.setAttribute("aria-expanded", "false");
  elements.toggleSources.textContent = "출처 보기";

  renderLessonNavigation();
  renderStageNavigation();
  renderEvidence();
  renderWorkFields();
  renderVerification();
  renderArtifact();
  renderDock();
}

function stageTitle(lesson, index) {
  return [
    `오늘은 ‘${lesson.misbelief.replace(/\.$/, "")}’에서 출발합니다`,
    "성공한 결과만 보지 않고, 실제 과정과 출처를 봅니다",
    "내 결과의 첫 판을 직접 남깁니다",
    "햄PD가 한 사람을 깊게 보고, 모두의 기준을 짚습니다",
    "같은 결과를 내 사실과 판단으로 다시 만듭니다",
    `${lesson.output.label}을 다음 강 입력으로 저장합니다`
  ][index];
}

function saveInputs() {
  const work = currentWork();
  work.firstAttempt = elements.firstAttempt.value;
  work.correctionNote = elements.correctionNote.value;
  work.retry = elements.retry.value;
  persist();
}

function updateCounts() {
  elements.firstCount.textContent = `${elements.firstAttempt.value.length} / 6000`;
  elements.correctionCount.textContent = `${elements.correctionNote.value.length} / 3000`;
  elements.retryCount.textContent = `${elements.retry.value.length} / 8000`;
}

function moveNext() {
  saveInputs();
  const lesson = currentLesson();
  const work = currentWork();
  if (state.currentStage < lesson.flow.length - 1) {
    state.currentStage += 1;
  } else {
    const ready = work.retry.trim() && work.checks.every(Boolean);
    if (!ready) {
      announce("다시 한 결과와 확인표를 먼저 남겨 주세요.");
      if (!work.retry.trim()) {
        state.currentStage = 4;
        persist();
        render();
        elements.retry.focus();
      } else {
        elements.verificationList.querySelector("input:not(:checked)")?.focus();
      }
      return;
    }
    work.completed = true;
    work.verifiedAt = new Date().toISOString();
    const nextLesson = course.lessons[state.currentLesson + 1];
    if (nextLesson && !nextLesson.locked) {
      state.currentLesson += 1;
      state.currentStage = 0;
    } else if (nextLesson && nextLesson.locked) {
      announce("1강을 저장했습니다. 다음 강은 준비 중입니다 — 열리면 알려드립니다.");
    } else {
      announce("사용 확인을 거친 첫 최종본과 다음 작업 카드를 저장했습니다.");
    }
  }
  persist();
  render();
  elements.stage.focus({ preventScroll: true });
  globalThis.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function movePrevious() {
  saveInputs();
  if (state.currentStage > 0) {
    state.currentStage -= 1;
  } else if (state.currentLesson > 0) {
    state.currentLesson -= 1;
    state.currentStage = 5;
  }
  persist();
  render();
  elements.stage.focus({ preventScroll: true });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function download(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadResultHtml() {
  saveInputs();
  const outputs = course.lessons.map((lesson) => state.lessons[lesson.id].retry.trim());
  const title = (outputs[1] || outputs[0] || "나의 첫 한 페이지").split(/\n|\.|。/)[0].trim();
  const body = outputs[4] || outputs[3] || outputs[2] || outputs[0];
  const proof = outputs[5] || "아직 확인 증거를 남기지 않았습니다.";
  const next = outputs[6] || "아직 다음 작업 카드를 남기지 않았습니다.";
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root{--paper:#f9f7f3;--ink:#1c1814;--muted:#4a423c;--green:#00704a;--yellow:#f4dc59;--line:#d9d3ca}
    *{box-sizing:border-box}body{margin:0;color:var(--ink);background:#f5f3ee;font-family:system-ui,sans-serif;line-height:1.7}
    main{width:min(760px,calc(100% - 32px));margin:48px auto;padding:clamp(28px,6vw,64px);background:var(--paper);border:1px solid var(--line)}
    .label{color:var(--green);font-size:12px;font-weight:800;letter-spacing:.08em}h1{max-width:14ch;margin:12px 0 0;font-family:Georgia,serif;font-size:clamp(38px,8vw,70px);line-height:1.03;letter-spacing:-.04em}
    .promise{margin:24px 0;padding-bottom:18px;border-bottom:4px solid var(--yellow);font-family:Georgia,serif;font-size:20px;white-space:pre-wrap}.body,.proof,.next{white-space:pre-wrap}.body{font-size:16px}.proof,.next{margin-top:36px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted)}
  </style>
</head>
<body><main><p class="label">바른생활에서 만든 첫 한 페이지</p><h1>${escapeHtml(title)}</h1><p class="promise">${escapeHtml(outputs[1] || "")}</p><div class="body">${escapeHtml(body)}</div><div class="proof"><strong>내가 확인한 것</strong><br>${escapeHtml(proof)}</div><div class="next"><strong>다음 작업</strong><br>${escapeHtml(next)}</div></main></body>
</html>`;
  download("나의-첫-한페이지.html", "text/html;charset=utf-8", html);
  announce("한 페이지 HTML 파일을 내려받았습니다.");
}

function downloadHandoff() {
  saveInputs();
  const lines = [
    "# 다음 작업 카드",
    "",
    `결과 ID: ${state.artifactId}`,
    `과정 버전: ${state.courseVersion}`,
    "",
    ...course.lessons.flatMap((lesson) => [`## ${lesson.number}강 · ${lesson.output.label}`, state.lessons[lesson.id].retry.trim() || "미작성", ""]),
    "## 다음 AI에게 할 말",
    "위 원본과 마지막 결정을 먼저 읽고, 7강에 적은 다음 행동 하나만 실행하세요. 확인하지 않은 사실을 보태지 말고, 결과를 만든 뒤 내가 직접 열어볼 수 있게 알려주세요."
  ];
  download("다음-작업-카드.txt", "text/plain;charset=utf-8", lines.join("\n"));
  announce("다음 작업 카드를 내려받았습니다.");
}

elements.toggleSources.addEventListener("click", () => {
  const open = elements.toggleSources.getAttribute("aria-expanded") === "true";
  elements.toggleSources.setAttribute("aria-expanded", String(!open));
  elements.toggleSources.textContent = open ? "출처 보기" : "출처 닫기";
  elements.sourceList.hidden = open;
});

for (const input of [elements.firstAttempt, elements.correctionNote, elements.retry]) {
  input.addEventListener("input", () => {
    saveInputs();
    updateCounts();
    updateCompletionState();
    renderArtifact();
  });
}

elements.saveNext.addEventListener("click", moveNext);
elements.previousStep.addEventListener("click", movePrevious);
elements.downloadHtml.addEventListener("click", downloadResultHtml);
elements.downloadHandoff.addEventListener("click", downloadHandoff);
elements.resetCourse.addEventListener("click", () => elements.resetDialog.showModal());
elements.resetDialog.addEventListener("close", () => {
  if (elements.resetDialog.returnValue !== "confirm") return;
  localStorage.removeItem(STORAGE_KEY);
  state = freshState();
  render();
  announce("이 기기에 저장한 일곱 강 작업을 모두 지웠습니다.");
});

globalThis.addEventListener("keydown", (event) => {
  const editing = event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement;
  if (editing) return;
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    moveNext();
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    movePrevious();
  }
  if (event.key === "Home") {
    event.preventDefault();
    saveInputs();
    state.currentLesson = 0;
    state.currentStage = 0;
    persist();
    render();
  }
  if (event.key === "End") {
    event.preventDefault();
    saveInputs();
    state.currentLesson = course.lessons.length - 1;
    state.currentStage = 5;
    persist();
    render();
  }
});

render();
