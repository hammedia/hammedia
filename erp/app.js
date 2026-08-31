import { filterRecords, formatWon, normalizeRecord, remainingAmount, summarize, validateBackup } from "./erp-core.mjs";

const STORAGE_KEY = "ham-small-erp-v1";
const sampleRecords = [
  { id:"sample-1", customer:"새봄책방", product:"홈페이지와 온라인 매대", contractState:"계약완료", totalAmount:1800000, paidAmount:900000, invoiceState:"세금계산서 발행", deliveryState:"진행 중", dueDate:"2026-09-08", nextAction:"대표 사진과 영업시간 확인", nextDate:"2026-09-01", owner:"제작 담당", evidence:"견적서와 작업 폴더", updatedAt:"2026-09-01T09:00:00+09:00" },
  { id:"sample-2", customer:"온결공방", product:"한 달 콘텐츠 운영", contractState:"견적", totalAmount:800000, paidAmount:0, invoiceState:"미발행", deliveryState:"시작 전", dueDate:"", nextAction:"월 제작 범위 답변 받기", nextDate:"2026-09-03", owner:"상담 담당", evidence:"상담 메모", updatedAt:"2026-09-01T09:10:00+09:00" },
  { id:"sample-3", customer:"한빛연구소", product:"반복 보고 작은 ERP", contractState:"계약완료", totalAmount:2500000, paidAmount:2500000, invoiceState:"세금계산서 발행", deliveryState:"납품 대기", dueDate:"2026-09-05", nextAction:"실사용 화면 확인받기", nextDate:"2026-09-02", owner:"도구 담당", evidence:"계약서와 납품 확인표", updatedAt:"2026-09-01T09:20:00+09:00" },
];

const $ = (id) => document.getElementById(id);
const refs = {
  list: $("recordList"), template: $("recordTemplate"), empty: $("emptyState"), count: $("recordCount"),
  search: $("searchInput"), contractFilter: $("contractFilter"), deliveryFilter: $("deliveryFilter"),
  dialog: $("recordDialog"), form: $("recordForm"), toast: $("toast"), deleteButton: $("deleteButton"),
};

let records = loadRecords();
let toastTimer;

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleRecords.map(normalizeRecord);
    return validateBackup(JSON.parse(raw));
  } catch {
    return sampleRecords.map(normalizeRecord);
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records }));
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => refs.toast.classList.remove("show"), 2400);
}

function todayText() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 10);
}

function displayDate(value) {
  if (!value) return "정하지 않음";
  return new Intl.DateTimeFormat("ko-KR", { year:"numeric", month:"short", day:"numeric" }).format(new Date(`${value}T00:00:00`));
}

function renderSummary() {
  const result = summarize(records, todayText());
  $("contractedAmount").textContent = formatWon(result.contractedAmount);
  $("paidAmount").textContent = formatWon(result.paidAmount);
  $("receivableAmount").textContent = formatWon(result.receivableAmount);
  $("dueSoon").textContent = `${result.dueSoon}건`;
  $("attention").textContent = `${result.attention}건`;
  $("todayText").textContent = `${displayDate(todayText())} · 진행 고객 ${result.activeCustomers}건${result.overdue ? ` · 지연 ${result.overdue}건` : ""}`;
}

function renderRecords() {
  const visible = filterRecords(records, { query:refs.search.value, contractState:refs.contractFilter.value, deliveryState:refs.deliveryFilter.value });
  refs.list.replaceChildren();
  refs.count.textContent = String(visible.length);
  refs.empty.hidden = visible.length > 0;
  visible.sort((a,b) => (a.nextDate || "9999").localeCompare(b.nextDate || "9999")).forEach((row) => {
    const card = refs.template.content.firstElementChild.cloneNode(true);
    card.dataset.id = row.id;
    if (row.dueDate && row.dueDate < todayText() && row.deliveryState !== "고객 수락") card.classList.add("is-overdue");
    card.querySelector(".record-product").textContent = row.product;
    card.querySelector(".record-customer").textContent = row.customer;
    card.querySelector(".contract-chip").textContent = row.contractState;
    card.querySelector(".delivery-chip").textContent = row.deliveryState;
    card.querySelector(".invoice-chip").textContent = row.invoiceState;
    card.querySelector(".total-value").textContent = formatWon(row.totalAmount);
    card.querySelector(".paid-value").textContent = formatWon(row.paidAmount);
    card.querySelector(".remaining-value").textContent = formatWon(remainingAmount(row));
    card.querySelector(".due-value").textContent = displayDate(row.dueDate);
    card.querySelector(".next-value").textContent = `${row.nextAction || "정하지 않음"}${row.nextDate ? ` · ${displayDate(row.nextDate)}` : ""}`;
    card.querySelector(".owner-value").textContent = row.owner || "정하지 않음";
    card.querySelector(".evidence-value").textContent = row.evidence || "연결 안 됨";
    card.querySelector(".edit-button").addEventListener("click", () => openForm(row));
    refs.list.append(card);
  });
}

function render() { renderSummary(); renderRecords(); }

function openForm(row = null) {
  $("dialogTitle").textContent = row ? "수정하기" : "추가하기";
  $("recordId").value = row?.id || "";
  $("customerInput").value = row?.customer || "";
  $("productInput").value = row?.product || "";
  $("contractStateInput").value = row?.contractState || "문의";
  $("deliveryStateInput").value = row?.deliveryState || "시작 전";
  $("totalAmountInput").value = row?.totalAmount || 0;
  $("paidAmountInput").value = row?.paidAmount || 0;
  $("invoiceStateInput").value = row?.invoiceState || "미발행";
  $("dueDateInput").value = row?.dueDate || "";
  $("nextActionInput").value = row?.nextAction || "";
  $("nextDateInput").value = row?.nextDate || "";
  $("ownerInput").value = row?.owner || "";
  $("evidenceInput").value = row?.evidence || "";
  refs.deleteButton.hidden = !row;
  refs.dialog.showModal();
  setTimeout(() => $("customerInput").focus(), 30);
}

function closeForm() { refs.dialog.close(); }

refs.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!refs.form.reportValidity()) return;
  const id = $("recordId").value || `erp-${Date.now()}`;
  const row = normalizeRecord({
    id, customer:$("customerInput").value, product:$("productInput").value,
    contractState:$("contractStateInput").value, deliveryState:$("deliveryStateInput").value,
    totalAmount:$("totalAmountInput").value, paidAmount:$("paidAmountInput").value,
    invoiceState:$("invoiceStateInput").value, dueDate:$("dueDateInput").value,
    nextAction:$("nextActionInput").value, nextDate:$("nextDateInput").value,
    owner:$("ownerInput").value, evidence:$("evidenceInput").value, updatedAt:new Date().toISOString(),
  });
  const index = records.findIndex((item) => item.id === id);
  if (index >= 0) records[index] = row; else records.unshift(row);
  saveRecords(); render(); closeForm(); showToast(index >= 0 ? "수정했습니다." : "고객 업무를 추가했습니다.");
});

refs.deleteButton.addEventListener("click", () => {
  const id = $("recordId").value;
  const row = records.find((item) => item.id === id);
  if (!row || !confirm(`‘${row.customer}’ 업무를 이 브라우저에서 삭제할까요?`)) return;
  records = records.filter((item) => item.id !== id);
  saveRecords(); render(); closeForm(); showToast("삭제했습니다.");
});

$("openFormButton").addEventListener("click", () => openForm());
$("closeFormButton").addEventListener("click", closeForm);
$("cancelButton").addEventListener("click", closeForm);
[refs.search, refs.contractFilter, refs.deliveryFilter].forEach((element) => element.addEventListener("input", renderRecords));

$("backupButton").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ version:1, exportedAt:new Date().toISOString(), records }, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = `ham-small-erp-${todayText()}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); showToast("백업 파일을 만들었습니다.");
});

$("restoreInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
  try {
    const restored = validateBackup(JSON.parse(await file.text()));
    if (!confirm(`현재 ${records.length}건을 바꾸고 백업 ${restored.length}건을 열까요?`)) return;
    records = restored; saveRecords(); render(); showToast("백업을 열었습니다.");
  } catch (error) { showToast(error.message || "백업 파일을 열 수 없습니다."); }
});

render();
