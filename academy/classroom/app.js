import { hasLessonRecord, lessonRecordFilename, lessonRecordText } from "./lesson1-export.mjs?v=20261023-lessons2to7";

const STORAGE_KEY = "ham-academy-barunsaenghwal-seven-hour-v1";

const eul = (w) => { const c = w.charCodeAt(w.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 === 0 ? "를" : "을"; };

const elements = {
  overallProgress: document.querySelector("[data-overall-progress]"),
  completionCount: document.querySelector("[data-completion-count]"),
  progressBar: document.querySelector("[data-progress-bar]"),
  lessonNav: document.querySelector("[data-lesson-nav]"),
  stageNav: document.querySelector("[data-stage-nav]"),
  lessonKicker: document.querySelector("[data-lesson-kicker]"),
  lessonTitle: document.querySelector("[data-lesson-title]"),
  lessonQuestion: document.querySelector("[data-lesson-question]"),
  lessonAlone: document.querySelector("[data-lesson-alone]"),
  stage: document.querySelector("#lesson-stage"),
  stageKicker: document.querySelector("[data-stage-kicker]"),
  stageTitle: document.querySelector("[data-stage-title]"),
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
  correctionEyebrow: document.querySelector("[data-correction-eyebrow]"),
  correctionHeading: document.querySelector("[data-correction-heading]"),
  firstAttempt: document.querySelector("[data-first-attempt]"),
  correctionNote: document.querySelector("[data-correction-note]"),
  retry: document.querySelector("[data-retry]"),
  firstCount: document.querySelector("[data-first-count]"),
  correctionCount: document.querySelector("[data-correction-count]"),
  retryCount: document.querySelector("[data-retry-count]"),
  autosaveState: document.querySelector("[data-autosave-state]"),
  resultStage: document.querySelector("[data-result-stage]"),
  nextDoor: document.querySelector("[data-lesson-next-door]"),
  cohortNext: document.querySelector("[data-cohort-next]"),
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
  downloadLesson1: document.querySelector("[data-download-lesson1]"),
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
const lastOpenLessonIndex = () => course.lessons.reduce((last, lesson, index) => lesson.locked ? last : index, 0);

// 강별 확인 기준(문구·순서·개수)의 식별값. courseVersion이 같아도 확인표가 바뀌면 달라진다.
const criteriaId = (lesson) => JSON.stringify(lesson.correctionCriteria);

// 같은 courseVersion(2026.09.03-v1) 안에서 확인표 문구가 바뀐 적이 있는 강.
// 기준 이력(최초 a423707 → 보완 7e6875c, criteria-history.json) 대조 결과이며,
// 저장에 기준 식별값이 없는 옛 기록을 이행할 때만 이 근거를 쓴다. lesson-3~7은 2026-10-23 공개 전 확인 기준을 새로 적용했다. lesson-2의 확인표 문구는 유지했다. 과거 모든 판본의 동일성을 보증하는 것은 아니다.
const CRITERIA_ONCE_REWRITTEN = new Set(["lesson-1", "lesson-3", "lesson-4", "lesson-5", "lesson-6", "lesson-7"]);

// 옛 체크를 현재 확인 기준에 맞춘다. 작성 내용(첫 답·고칠 이유 메모·다시 쓴 결과)은 어떤 경우에도 지킨다.
const alignCriteriaState = (lesson, work, savedWork) => {
  const currentId = criteriaId(lesson);
  const savedId = typeof savedWork.criteriaId === "string" ? savedWork.criteriaId : null;
  const validChecks = Array.isArray(work.checks)
    && work.checks.length === lesson.correctionCriteria.length
    && work.checks.every((value) => typeof value === "boolean");
  // ① 저장이 현재 기준을 가리키면: 같은 기준에서 체크한 것이므로 체크·완료를 그대로 믿는다(길이가 깨진 저장만 체크를 바로잡는다).
  if (savedId === currentId) {
    if (!validChecks) {
      work.checks = lesson.correctionCriteria.map(() => false);
      work.completed = false;
      work.verifiedAt = null;
    }
    work.criteriaId = currentId;
    return;
  }
  // ② 식별값 없는 옛 저장이고 기준 이력상 이 강의 확인표가 한 번도 바뀌지 않았으면: 어느 판본에서 저장했어도 같은 기준이므로 체크·완료를 지킨다.
  if (savedId === null && !CRITERIA_ONCE_REWRITTEN.has(lesson.id) && validChecks) {
    work.criteriaId = currentId;
    return;
  }
  // ③ 그 외(기준이 바뀌었거나, 바뀐 적이 있는 강의 식별값 없는 저장이라 어느 문구 기준인지 알 방법이 없으면):
  //    확인 상태만 새 기준으로 다시 쓰게 한다. 체크를 지우고 완료·verifiedAt도 새로 남기게 한다.
  work.checks = lesson.correctionCriteria.map(() => false);
  work.completed = false;
  work.verifiedAt = null;
  work.criteriaId = currentId;
  if (lesson.useStageScript && (savedWork.firstAttempt || savedWork.retry || savedWork.completed)) work.recheckRequired = true;
};

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
    verifiedAt: null,
    criteriaId: criteriaId(lesson)
  }]))
});

const loadState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.courseVersion !== course.courseVersion || !saved.artifactId) return freshState();
    const baseline = freshState();
    for (const lesson of course.lessons) {
      const savedWork = saved.lessons?.[lesson.id] ?? {};
      const work = { ...baseline.lessons[lesson.id], ...savedWork };
      alignCriteriaState(lesson, work, savedWork);
      baseline.lessons[lesson.id] = work;
    }
    baseline.artifactId = saved.artifactId;
    baseline.currentLesson = Math.min(Math.max(Number(saved.currentLesson) || 0, 0), lastOpenLessonIndex());
    baseline.currentStage = Math.min(Math.max(Number(saved.currentStage) || 0, 0), 5);
    return baseline;
  } catch {
    return freshState();
  }
};

const AUTOSAVE_IDLE = "쓰는 대로 이 기기에 자동저장";

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
  elements.autosaveState.textContent = "작성 내용 자동저장됨";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { elements.autosaveState.textContent = AUTOSAVE_IDLE; }, 1200);
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
    button.className = "stage-nav-button";
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
  if (lesson.useStageScript) {
    (lesson.stageBlocks?.[lesson.flow[stageIndex].id] ?? []).forEach((block) => fragment.append(stageBlock(block)));
    return fragment;
  }
  if (stageIndex === 0) {
    fragment.append(text("p", "읽고 아래 ‘다음’을 누르세요.", "stage-guide"));
    const keep = document.createElement("div");
    keep.append(truthLine("오늘 끝나면 남는 것", lesson.output.label));
    if (lesson.learningGoal) keep.append(truthLine("오늘 배울 것", lesson.learningGoal));
    fragment.append(keep);
    fragment.append(text("p", lesson.teacherStory));
    const lines = document.createElement("div");
    lines.append(
      truthLine("많은 분이 처음에 믿는 것", lesson.misbelief),
      truthLine("다음 강에서 할 일", lesson.nextLesson)
    );
    fragment.append(lines);
    if (lesson.number === 2) {
      const carryover = truthLine(
        "1강에서 적어 둔 내 이야기",
        lessonOutput(0) || "1강 ‘다시 받은 답’ 메모칸에 적어 둔 내용이 있으면 이 자리에 이어집니다. 비어 있으면 AI 대화창에 남은 1강 대화를 보며 이어가면 됩니다."
      );
      carryover.classList.add("carryover-source");
      carryover.dataset.previousLessonOutput = "lesson-1";
      fragment.append(carryover);
    }
  } else if (stageIndex === 1) {
    fragment.append(text("p", lesson.demonstration));
  } else if (stageIndex === 2) {
    fragment.append(text("p", "AI는 몇 번을 물어봐도 화내지 않습니다.", "hook-line"));
    fragment.append(text("p", lesson.attemptPrompt));
  } else if (stageIndex === 3) {
    fragment.append(text("p", lesson.correctionGuidance ?? "‘왜 이 결과를 그대로 쓸 수 없나요?’ 먼저 스스로 묻고, 그 이유를 고칠 이유 메모에 남기세요. 정해진 정답을 적는 칸이 아닙니다."));
  } else if (stageIndex === 4) {
    fragment.append(text("p", lesson.retryPrompt));
  } else {
    fragment.append(text("p", `첫 시도와 다시 쓴 결과를 나란히 봅니다. ${lesson.output.label}${eul(lesson.output.label)} 저장해 다음 강에서 그대로 씁니다.`));
  }
  (lesson.stageBlocks?.[lesson.flow[stageIndex].id] ?? []).forEach((block) => fragment.append(stageBlock(block)));
  return fragment;
}

// 강 데이터의 단계별 보조 블록: 그대로 쓰는 문장(prompt)·실제 발화 인용(quote)·짧은 목록(list).
function stageBlock(block) {
  if (block.kind === "details") {
    // 선택해서 읽는 긴 기록·해설. 안의 실제 인용과 가상 예시 표기는 그대로 보존한다.
    const details = document.createElement("details");
    details.className = "stage-block stage-block-details";
    details.append(text("summary", block.label));
    block.blocks.forEach((child) => details.append(stageBlock(child)));
    return details;
  }
  if (block.kind === "jump") {
    const section = document.createElement("section");
    section.className = "stage-block stage-block-jump";
    const button = text("button", block.label, "primary-button stage-jump-button");
    button.type = "button";
    button.addEventListener("click", () => {
      saveInputs();
      state.currentStage = block.target;
      persist();
      render();
      elements.stage.focus({ preventScroll: true });
      globalThis.scrollTo({ top: 0, behavior: "auto" });
      announce(`${currentLesson().flow[block.target].label} 단계로 왔습니다.`);
    });
    section.append(button);
    if (block.note) section.append(text("p", block.note, "stage-block-note"));
    return section;
  }
  const section = document.createElement("section");
  section.className = `stage-block stage-block-${block.kind}`;
  if (block.kind === "heading") {
    section.append(text("h3", block.label, "dialogue-section-title"));
  } else if (block.label) {
    section.append(text("strong", block.label, "stage-block-label"));
  }
  if (block.kind === "heading") {
    // The heading is the whole block.
  } else if (block.kind === "paragraph") {
    section.append(text("p", block.text));
  } else if (block.kind === "links") {
    block.links.forEach((source) => {
      if (!/^https:\/\//.test(source.href) && !/^\/(?!\/)/.test(source.href)) return;
      const link = text("a", source.label, "dialogue-source-link");
      link.href = source.href;
      link.target = "_blank";
      link.rel = "noopener";
      section.append(link);
    });
  } else if (block.kind === "table") {
    const table = document.createElement("table");
    block.rows.forEach((row, index) => {
      const tr = document.createElement("tr");
      row.forEach((value) => tr.append(text(index === 0 ? "th" : "td", value)));
      table.append(tr);
    });
    section.classList.add("dialogue-table");
    section.append(table);
  } else if (block.kind === "prompt") {
    section.append(text("pre", block.text, "stage-block-prompt"));
  } else if (block.kind === "quote") {
    section.append(text("p", block.text, "stage-block-quote"));
  } else if (block.kind === "steps") {
    const list = document.createElement("ol");
    list.className = "stage-block-steps";
    block.items.forEach((item) => list.append(text("li", item)));
    section.append(list);
  } else {
    const list = document.createElement("ul");
    block.items.forEach((item) => list.append(text("li", item)));
    section.append(list);
  }
  if (block.note) section.append(text("p", block.note, "stage-block-note"));
  return section;
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
      if (evidence.captions) {
        const track = document.createElement("track");
        track.kind = "captions";
        track.srclang = "ko";
        track.label = "한국어";
        track.src = evidence.captions;
        track.setAttribute("default", "");
        video.append(track);
      }
      video.src = evidence.src;
      video.poster = evidence.poster;
      video.setAttribute("aria-label", evidence.alt);
      figure.append(video);
      if (Array.isArray(evidence.transcript)) {
        const transcript = document.createElement("div");
        transcript.className = "video-transcript";
        transcript.append(text("strong", "영상에 나오는 글"));
        evidence.transcript.forEach((line) => transcript.append(text("p", line)));
        figure.append(transcript);
      }
      const caption = document.createElement("figcaption");
      caption.className = "media-caption";
      caption.append(text("strong", evidence.label), text("span", evidence.status === "reconstructed" ? "실제 사례를 가려 다시 만든 수업용 자료" : evidence.status === "internal-candidate" ? "HAM MEDIA 작업 기록에서 고른 자료" : "HAM MEDIA 실제 작업에서 가져온 자료"));
      figure.append(caption);
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
    // 공개 화면에는 내부 파일명·작업 번호·사용선 메모를 내보내지 않는다(2026-09-28 교정).
    source.append(text("strong", evidence.label), text("span", evidence.status === "reconstructed" ? "실제 사례를 가려 다시 만든 수업용 자료" : evidence.status === "internal-candidate" ? "HAM MEDIA 작업 기록에서 고른 자료" : "HAM MEDIA 실제 작업 기록에서 확인한 자료"));
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
  caption.append(text("strong", label), text("span", status === "reconstructed" ? "실제 사례를 가려 다시 만든 수업용 자료" : status === "internal-candidate" ? "HAM MEDIA 작업 기록에서 고른 자료" : "HAM MEDIA 실제 작업에서 가져온 자료"));
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
  elements.firstField.querySelector("span").textContent = lesson.workLabels?.first ?? "첫 시도";
  elements.correctionNote.closest("label").querySelector("span").textContent = lesson.workLabels?.correction ?? "고칠 이유 메모";
  elements.retryField.querySelector("span").textContent = lesson.workLabels?.retry ?? "같은 결과 다시 해보기";
  elements.correctionEyebrow.textContent = lesson.correctionEyebrow ?? "혼자서 먼저 짚는 자리";
  elements.correctionHeading.textContent = lesson.correctionHeading ?? "왜 고칠지 내가 먼저 찾습니다";
  elements.correctionNote.placeholder = lesson.correctionPlaceholder ?? "어떤 문장을 왜 고치는지 적으세요. 고친 뒤에도 이 메모가 내 기준으로 남습니다.";
  studentWorkTitle.textContent = lesson.workHeading ?? STUDENT_WORK_TITLE;
  studentWorkNote.textContent = lesson.workNote ?? "";
  studentWorkNote.hidden = !lesson.workNote;
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
  renderEditGuidance(elements.firstAttempt, 2, "첫 말과 첫 답");
  renderEditGuidance(elements.correctionNote, 3, "더 말하거나 바로잡은 이유");
  renderEditGuidance(elements.retry, 4, "다시 받은 답");
}

const studentWorkTitle = document.querySelector("#student-work-title");
const STUDENT_WORK_TITLE = studentWorkTitle.textContent;
const studentWorkNote = text("p", "", "student-work-note");
studentWorkNote.hidden = true;
elements.studentWork.querySelector(".section-heading-row").after(studentWorkNote);

function renderEditGuidance(input, stageIndex, label) {
  const field = input.closest("label");
  let guidance = field.nextElementSibling;
  if (!guidance?.classList.contains("dialogue-edit-guidance")) {
    guidance = document.createElement("div");
    guidance.className = "dialogue-edit-guidance";
    field.after(guidance);
  }
  guidance.replaceChildren();
  guidance.hidden = !currentLesson().useStageScript || !input.readOnly;
  if (guidance.hidden) return;
  const stageLabel = currentLesson().flow[stageIndex].label;
  const button = text("button", `${stageLabel}에서 수정`, "dialogue-edit-button");
  button.type = "button";
  button.addEventListener("click", () => {
    saveInputs();
    state.currentStage = stageIndex;
    persist();
    render();
    input.focus({ preventScroll: true });
    input.scrollIntoView({ block: "center", behavior: "instant" });
    announce(`${stageLabel}로 돌아왔습니다. 앞서 쓴 내용은 그대로이며 ${label}${eul(label)} 수정할 수 있습니다.`);
  });
  guidance.append(text("p", `${label}${label.endsWith("이유") ? "는" : "은"} 앞 단계에서 쓴 기록이라 지금은 읽기 전용입니다. 늦게 가져온 AI 답이나 바꿀 내용은 아래에서 해당 단계로 돌아가 수정하세요.`), button);
}

const extraWorkFields = document.createElement("div");
extraWorkFields.className = "dialogue-work-fields";
elements.studentWork.querySelector(".work-fields").append(extraWorkFields);

function renderConversationFields() {
  const fields = currentLesson().conversationFields ?? [];
  const fragment = document.createDocumentFragment();
  fields.forEach((field) => {
    const label = document.createElement("label");
    label.className = "work-field";
    label.hidden = state.currentStage < field.stage;
    const input = document.createElement("textarea");
    input.rows = 5;
    input.maxLength = 6000;
    input.dataset.conversationField = field.id;
    input.placeholder = field.placeholder;
    input.value = currentWork()[field.id] ?? "";
    input.readOnly = state.currentStage > field.stage;
    input.addEventListener("input", () => {
      saveInputs();
      updateCompletionState();
    });
    label.append(text("span", field.label), input);
    fragment.append(label);
    if (input.readOnly) {
      const guidance = document.createElement("div");
      guidance.className = "dialogue-edit-guidance";
      const button = text("button", `${currentLesson().flow[field.stage].label}에서 수정`, "dialogue-edit-button");
      button.type = "button";
      button.addEventListener("click", () => {
        saveInputs();
        state.currentStage = field.stage;
        persist();
        render();
        const editable = extraWorkFields.querySelector(`[data-conversation-field="${field.id}"]`);
        editable?.focus({ preventScroll: true });
        editable?.scrollIntoView({ block: "center", behavior: "instant" });
      });
      guidance.append(text("p", "앞 단계에서 쓴 기록을 읽는 자리입니다. 내용은 보존되어 있으며 해당 단계에서 수정할 수 있습니다."), button);
      fragment.append(guidance);
    }
  });
  extraWorkFields.replaceChildren(fragment);
  extraWorkFields.hidden = fields.length === 0;
}

const missingConversationField = (lesson, work) => (lesson.conversationFields ?? []).find((field) => !String(work[field.id] ?? "").trim());

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
  elements.resultTemplate.textContent = lesson.verificationIntro ?? `결과 형식: ${lesson.resultTemplate}`;
  elements.nextLesson.textContent = lesson.nextLesson;
  updateCompletionState();
}

function updateCompletionState() {
  const lesson = currentLesson();
  const work = currentWork();
  const checksDone = work.checks.every(Boolean);
  if (lesson.recordOptional) {
    const checked = work.checks.filter(Boolean).length;
    elements.resultState.textContent = checksDone ? "실습 확인 완료" : `실습 확인 ${checked} / ${work.checks.length}`;
    return;
  }
  const correctionDone = !lesson.requiresCorrectionNote || work.correctionNote.trim().length > 0;
  const missing = missingConversationField(lesson, work);
  const firstDone = !lesson.requiresFirstAttempt || work.firstAttempt.trim().length > 0;
  const ready = firstDone && work.retry.trim().length > 0 && checksDone && correctionDone && !missing;
  elements.resultState.textContent = ready ? "저장 가능" : missing ? `${missing.label} 남음` : !correctionDone ? "고칠 이유 메모 남음" : work.retry.trim() ? "확인표 남음" : "작성 중";
}

function renderArtifact() {
  const outputs = course.lessons.map((lesson) => state.lessons[lesson.id].retry.trim());
  const completed = course.lessons.filter((lesson) => state.lessons[lesson.id].completed).length;
  const latestIndex = outputs.reduce((last, value, index) => value ? index : last, -1);
  const promise = outputs[1];
  const latest = latestIndex >= 0 ? outputs[latestIndex] : "";
  const titleCandidate = (promise || outputs[0] || "").split(/\n|\.|。/)[0].trim();

  elements.artifactState.textContent = latestIndex < 0 ? "초안 전" : `${latestIndex + 1}강 결과 반영`;
  elements.paperKicker.textContent = "내가 만든 한 장";
  elements.paperTitle.textContent = titleCandidate || "아직 제목이 없습니다";
  elements.paperPromise.textContent = promise || "2강에서 오늘 끝낼 한 장을 정하면 이곳에 그 내용이 생깁니다.";
  elements.paperBody.replaceChildren(text("p", latest || "1강부터 저장한 결과가 이 종이에 차례로 반영됩니다."));
  elements.paperProof.textContent = outputs[5] ? "사람 확인 기록 있음" : "확인 전";
  elements.paperNext.textContent = outputs[6] ? "사용 확인·다음에 할 일 있음" : "다음 행동 미정";

  const history = document.createDocumentFragment();
  course.resultStates.forEach((result, index) => {
    const item = document.createElement("li");
    const isComplete = Boolean(outputs[index]) || state.lessons[course.lessons[index].id].completed;
    item.className = `${isComplete ? "is-complete" : ""}${index === state.currentLesson ? " is-current" : ""}`.trim();
    item.append(text("span", isComplete ? "✓" : String(index + 1), "history-dot"), text("span", result.label), text("small", isComplete ? "남김" : "대기"));
    history.append(item);
  });
  elements.artifactHistory.replaceChildren(history);

  updateLesson1ExportState();
  elements.downloadHtml.disabled = !outputs[4];
  elements.downloadHandoff.disabled = !outputs[6];
  const openLessons = course.lessons.filter((lesson) => !lesson.locked).length;
  elements.overallProgress.textContent = `${state.currentLesson + 1} / ${openLessons}강`;
  elements.completionCount.textContent = `${completed} / ${openLessons}강 실습 확인`;
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
    elements.nextKicker.textContent = "다음 단계";
    elements.nextLabel.textContent = nextStage.label;
    elements.nextDescription.textContent = "이 단계를 마치고 다음 단계로 갑니다.";
    elements.saveNext.textContent = `다음: ${nextStage.label}`;
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
    elements.nextKicker.textContent = "마지막 확인";
    elements.nextLabel.textContent = "사용 확인·첫 완성본·다음에 할 일 저장";
    elements.nextDescription.textContent = "처음 보는 사람의 반응과 새 대화에서 이어갈 말을 확인합니다. 파일 받기는 선택입니다.";
    elements.saveNext.textContent = "일곱 강 저장하기";
  }
}

function render() {
  const lesson = currentLesson();
  document.body.classList.toggle("is-dialogue-lesson", Boolean(lesson.useStageScript));
  const stage = lesson.flow[state.currentStage];
  document.title = `바른생활 ${lesson.number}강 · ${stage.label}`;
  elements.lessonKicker.textContent = `${lesson.number}강 · ${lesson.shortTitle}`;
  elements.lessonTitle.textContent = lesson.title;
  elements.lessonQuestion.textContent = lesson.question;
  if (elements.lessonAlone) elements.lessonAlone.textContent = lesson.aloneNote || "혼자 해도 됩니다";
  elements.stageKicker.textContent = stage.label;
  elements.stageTitle.textContent = stageTitle(lesson, state.currentStage);
  elements.stageCopy.replaceChildren(stageCopyNodes(lesson, state.currentStage));
  if (currentWork().recheckRequired) {
    elements.stageCopy.prepend(text("p", `${lesson.number}강의 실습 확인 기준이 바뀌었습니다. 전에 쓴 첫 답·메모·다시 쓴 답은 그대로 두었습니다. 새 확인표만 다시 살펴보세요.`, "dialogue-recheck-notice"));
  }

  elements.evidencePanel.hidden = state.currentStage !== 1;
  elements.studentWork.hidden = state.currentStage < 2;
  elements.resultStage.hidden = state.currentStage !== 5;
  elements.nextDoor.hidden = true;
  if (elements.cohortNext) elements.cohortNext.hidden = lesson.number !== 1;
  elements.sourceList.hidden = true;
  elements.toggleSources.setAttribute("aria-expanded", "false");
  elements.toggleSources.textContent = "자료 어디서 왔나 보기";

  renderLessonNavigation();
  renderStageNavigation();
  renderEvidence();
  renderWorkFields();
  renderConversationFields();
  renderVerification();
  renderArtifact();
  renderDock();
}

function stageTitle(lesson, index) {
  if (lesson.stageTitles?.[index]) return lesson.stageTitles[index];
  return [
    `많은 분이 ‘${lesson.misbelief.replace(/\.$/, "")}’라고 생각합니다. 오늘은 그렇지 않다는 걸 직접 해 봅니다`,
    "완성된 결과만 보지 않고, 만들어진 과정을 봅니다",
    "내 결과의 첫 판을 직접 남깁니다",
    "왜 고칠지, 내가 먼저 찾습니다",
    "같은 결과를 내 사실과 판단으로 다시 만듭니다",
    `${lesson.output.label}${eul(lesson.output.label)} 저장하고 다음 강으로 넘깁니다`
  ][index];
}

function saveInputs() {
  const work = currentWork();
  work.firstAttempt = elements.firstAttempt.value;
  work.correctionNote = elements.correctionNote.value;
  work.retry = elements.retry.value;
  extraWorkFields.querySelectorAll("[data-conversation-field]").forEach((input) => {
    work[input.dataset.conversationField] = input.value;
  });
  updateLesson1ExportState();
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
    const correctionDone = !lesson.requiresCorrectionNote || work.correctionNote.trim();
    const missing = missingConversationField(lesson, work);
    const firstDone = !lesson.requiresFirstAttempt || work.firstAttempt.trim();
    const ready = lesson.recordOptional
      ? work.checks.every(Boolean)
      : firstDone && work.retry.trim() && work.checks.every(Boolean) && correctionDone && !missing;
    if (!ready && lesson.recordOptional) {
      announce("오늘 실제로 해 본 것을 확인표에서 체크해 주세요. 아직 못 한 것은 AI에서 해 본 뒤 체크하면 됩니다. 메모칸은 비워 둬도 됩니다.");
      elements.verificationList.querySelector("input:not(:checked)")?.focus();
      return;
    }
    if (!ready) {
      announce(missing ? `${missing.label}을 먼저 남겨 주세요. 확인하지 못한 것은 미확인이라고 적어도 됩니다.` : "고칠 이유 메모, 다시 쓴 결과와 확인표를 먼저 남겨 주세요.");
      if (!firstDone) {
        state.currentStage = 2;
        persist();
        render();
        elements.firstAttempt.focus();
      } else if (missing) {
        state.currentStage = missing.stage;
        persist();
        render();
        extraWorkFields.querySelector(`[data-conversation-field="${missing.id}"]`)?.focus();
      } else if (!correctionDone) {
        state.currentStage = 3;
        persist();
        render();
        elements.correctionNote.focus();
      } else if (!work.retry.trim()) {
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
    delete work.recheckRequired;
    work.verifiedAt = new Date().toISOString();
    const nextLesson = course.lessons[state.currentLesson + 1];
    if (nextLesson && !nextLesson.locked) {
      state.currentLesson += 1;
      state.currentStage = 0;
    } else if (nextLesson && nextLesson.locked) {
      announce(`${lesson.number}강을 저장했습니다. ${nextLesson.number}강은 준비 중입니다 — 열리면 알려드립니다.`);
    } else {
      announce("사용 확인을 거친 첫 완성본과 다음에 할 일을 저장했습니다.");
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

// 메모 파일 단추는 지금 보고 있는 강의 메모를 받는다.
function updateLesson1ExportState() {
  if (!elements.downloadLesson1) return;
  const lesson = currentLesson();
  elements.downloadLesson1.textContent = `${lesson.number}강 메모 파일로 받기 · 선택`;
  elements.downloadLesson1.disabled = !hasLessonRecord(lesson, state.lessons[lesson.id]);
}

function downloadLesson1() {
  saveInputs();
  const lesson = currentLesson();
  const content = lessonRecordText({
    lesson,
    work: state.lessons[lesson.id],
    courseVersion: state.courseVersion,
    artifactId: state.artifactId
  });
  if (!content) {
    announce(`${lesson.number}강에서 남긴 말이 없습니다. 먼저 실제 실습 기록을 적어 주세요.`);
    return;
  }
  download(lessonRecordFilename(lesson), "text/plain;charset=utf-8", content);
  announce(`${lesson.number}강 메모를 파일로 받았습니다. 다른 사람이나 AI에게 보내기 전에 개인정보·고객정보를 확인하세요.`);
}

function downloadResultHtml() {
  saveInputs();
  const outputs = course.lessons.map((lesson) => state.lessons[lesson.id].retry.trim());
  const title = (outputs[1] || outputs[0] || "나의 첫 한 페이지").split(/\n|\.|。/)[0].trim();
  const body = outputs[4] || outputs[3] || outputs[2] || outputs[0];
  const proof = outputs[5] || "아직 확인 증거를 남기지 않았습니다.";
  const next = outputs[6] || "아직 다음에 할 일을 남기지 않았습니다.";
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root{--paper:#f9f7f3;--ink:#1c1814;--muted:#4a423c;--accent:#7eb5e8;--accent-deep:#326b98;--line:#e6e1d9}
    *{box-sizing:border-box}body{margin:0;color:var(--ink);background:#f5f3ee;font-family:Pretendard,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;line-height:1.7;word-break:keep-all;overflow-wrap:anywhere}
    main{width:min(760px,calc(100% - 32px));margin:48px auto;padding:clamp(28px,6vw,64px);background:var(--paper);border:1px solid var(--line)}
    .label{color:var(--accent-deep);font-size:12px;font-weight:800;letter-spacing:.08em}h1{max-width:16ch;margin:12px 0 0;font-size:clamp(32px,7vw,56px);line-height:1.15}
    .promise{margin:24px 0;padding-bottom:18px;border-bottom:2px solid var(--accent);font-size:20px;white-space:pre-wrap}.body,.proof,.next{white-space:pre-wrap}.body{font-size:16px}.proof,.next{margin-top:36px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted)}
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
    "# 다음에 할 일 카드",
    "",
    `결과 ID: ${state.artifactId}`,
    `과정 버전: ${state.courseVersion}`,
    "",
    ...course.lessons.flatMap((lesson) => [`## ${lesson.number}강 · ${lesson.output.label}`, state.lessons[lesson.id].retry.trim() || "미작성", ""]),
    "## 다음 AI에게 할 말",
    "위 원본과 마지막 결정을 먼저 읽고, 7강에 적은 다음 행동 하나만 실행하세요. 확인하지 않은 사실을 보태지 말고, 결과를 만든 뒤 내가 직접 열어볼 수 있게 알려주세요."
  ];
  download("다음에-할-일-카드.txt", "text/plain;charset=utf-8", lines.join("\n"));
  announce("다음에 할 일 카드를 내려받았습니다.");
}

elements.toggleSources.addEventListener("click", () => {
  const open = elements.toggleSources.getAttribute("aria-expanded") === "true";
  elements.toggleSources.setAttribute("aria-expanded", String(!open));
  elements.toggleSources.textContent = open ? "자료 어디서 왔나 보기" : "접기";
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
elements.downloadLesson1?.addEventListener("click", downloadLesson1);
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
    state.currentLesson = lastOpenLessonIndex();
    state.currentStage = 5;
    persist();
    render();
  }
});

render();
