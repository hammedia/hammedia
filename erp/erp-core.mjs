export const CONTRACT_STATES = ["문의", "견적", "계약완료", "종료"];
export const DELIVERY_STATES = ["시작 전", "진행 중", "납품 대기", "납품 완료", "고객 수락"];

export function normalizeRecord(input = {}) {
  const totalAmount = Math.max(0, Number(input.totalAmount) || 0);
  const paidAmount = Math.min(totalAmount, Math.max(0, Number(input.paidAmount) || 0));
  return {
    id: String(input.id || `erp-${Date.now()}`),
    customer: String(input.customer || "").trim(),
    product: String(input.product || "").trim(),
    contractState: CONTRACT_STATES.includes(input.contractState) ? input.contractState : "문의",
    totalAmount,
    paidAmount,
    invoiceState: ["미발행", "청구서 발행", "세금계산서 발행", "해당 없음"].includes(input.invoiceState)
      ? input.invoiceState : "미발행",
    deliveryState: DELIVERY_STATES.includes(input.deliveryState) ? input.deliveryState : "시작 전",
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(input.dueDate || "")) ? input.dueDate : "",
    nextAction: String(input.nextAction || "").trim(),
    nextDate: /^\d{4}-\d{2}-\d{2}$/.test(String(input.nextDate || "")) ? input.nextDate : "",
    owner: String(input.owner || "").trim(),
    evidence: String(input.evidence || "").trim(),
    updatedAt: String(input.updatedAt || new Date().toISOString()),
  };
}

export function remainingAmount(record) {
  const row = normalizeRecord(record);
  return Math.max(0, row.totalAmount - row.paidAmount);
}

export function summarize(records, todayText = new Date().toISOString().slice(0, 10)) {
  const rows = records.map(normalizeRecord);
  const today = new Date(`${todayText}T00:00:00`);
  const inSevenDays = new Date(today);
  inSevenDays.setDate(inSevenDays.getDate() + 7);
  const active = rows.filter((row) => !["종료"].includes(row.contractState));
  const contracted = rows.filter((row) => row.contractState === "계약완료");
  return {
    activeCustomers: active.length,
    contractedAmount: contracted.reduce((sum, row) => sum + row.totalAmount, 0),
    paidAmount: contracted.reduce((sum, row) => sum + row.paidAmount, 0),
    receivableAmount: contracted.reduce((sum, row) => sum + remainingAmount(row), 0),
    dueSoon: active.filter((row) => {
      if (!row.dueDate || row.deliveryState === "고객 수락") return false;
      const due = new Date(`${row.dueDate}T00:00:00`);
      return due >= today && due <= inSevenDays;
    }).length,
    attention: active.filter((row) => row.nextDate && row.nextDate <= todayText).length,
    overdue: active.filter((row) => row.dueDate && row.dueDate < todayText && row.deliveryState !== "고객 수락").length,
  };
}

export function filterRecords(records, { query = "", contractState = "전체", deliveryState = "전체" } = {}) {
  const needle = query.trim().toLocaleLowerCase("ko-KR");
  return records.map(normalizeRecord).filter((row) => {
    const matchesQuery = !needle || [row.customer, row.product, row.nextAction, row.owner]
      .some((value) => value.toLocaleLowerCase("ko-KR").includes(needle));
    const matchesContract = contractState === "전체" || row.contractState === contractState;
    const matchesDelivery = deliveryState === "전체" || row.deliveryState === deliveryState;
    return matchesQuery && matchesContract && matchesDelivery;
  });
}

export function validateBackup(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.records)) {
    throw new Error("HAM 작은 ERP 백업 파일이 아닙니다.");
  }
  if (value.records.length > 500) throw new Error("한 번에 500건까지만 복원할 수 있습니다.");
  return value.records.map(normalizeRecord);
}

export function formatWon(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}
