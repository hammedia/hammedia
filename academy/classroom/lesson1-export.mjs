const RECORD_FIELDS = ["firstAttempt", "correctionNote", "retry", "questionReply", "sourceCheck", "restart"];

export function hasLesson1Record(work = {}) {
  return RECORD_FIELDS.some((key) => typeof work[key] === "string" && work[key].trim().length > 0);
}

export function lesson1RecordText({ lesson, work, courseVersion, artifactId }) {
  if (!hasLesson1Record(work)) return "";
  const labels = {
    firstAttempt: lesson.workLabels?.first || "내가 보낸 첫 말과 AI의 첫 답",
    correctionNote: lesson.workLabels?.correction || "내가 더 말하거나 바로잡은 이유",
    retry: lesson.workLabels?.retry || "다시 받은 답과 달라진 점",
    ...Object.fromEntries((lesson.conversationFields || []).map((field) => [field.id, field.label]))
  };
  const defaults = {
    questionReply: "AI의 질문과 내가 답한 사실",
    sourceCheck: "직접 확인한 원출처와 아직 모르는 것",
    restart: "새 대화에서 다시 시작할 내 말"
  };
  const record = (key) => typeof work[key] === "string" && work[key].trim() ? work[key] : "미작성";
  const checked = (work.checks || []).filter(Boolean).length;
  const total = (lesson.correctionCriteria || []).length;
  // 실습 확인은 확인표(실제로 해 본 것)로 정한다. 메모칸을 다 채웠는지는 따지지 않는다.
  const savedComplete = Boolean(work.completed) && total > 0
    && (work.checks || []).length === total && (work.checks || []).every((value) => value === true);
  return [
    `# 1강 · ${lesson.title}`,
    "메모칸에 쓴 내용을 다른 기기나 다음 AI 대화에서 다시 읽기 위한 선택 파일입니다.",
    `실습 확인: ${savedComplete ? "1강 실습 확인 완료" : "실습 확인 전"}`,
    `내가 체크한 확인표: ${checked} / ${total}`,
    "파일을 받았다는 것만으로 실제 대화 실습이나 사실확인이 끝난 것은 아닙니다.",
    `결과 ID: ${artifactId}`,
    `과정 버전: ${courseVersion}`,
    "",
    ...RECORD_FIELDS.flatMap((key) => [`## ${labels[key] || defaults[key]}`, record(key), ""]),
    "## 다음 AI 대화로 이어가기",
    "이 기록은 정답이 아니라 내가 남긴 말입니다. 위 기록을 함께 읽고, 내가 적은 ‘새 대화에서 다시 시작할 내 말’에서 이어가 주세요. 그 칸이 미작성이면 내 고민부터 하나씩 물어봐 주세요. 확인한 사실과 아직 모르는 것은 구분해 주세요. 필요한 사실은 나에게 물어봐 주세요.",
    "",
    "다른 사람이나 AI에게 보내기 전에 개인정보·고객정보가 들어 있지 않은지 확인하세요.",
    ""
  ].join("\n");
}
