"use strict";
(() => {
const result = document.getElementById("case-result");
document.getElementById("case-backup").addEventListener("click", e => { result.hidden = !result.hidden; e.currentTarget.setAttribute("aria-expanded", String(!result.hidden)); });
document.getElementById("case-backup").setAttribute("aria-expanded", "false");
document.getElementById("case-backup").setAttribute("aria-controls", "case-result");
const checks = Array.from(document.querySelectorAll(".case-checks input"));
checks.forEach(el => el.addEventListener("change", () => { document.getElementById("case-verdict").textContent = checks.every(c => c.checked) ? "세 기준을 확인했습니다. 실제 사용자의 반응을 보고, 최종 공개 여부는 사람이 결정하세요." : "아직 확인하지 않은 항목이 있습니다. 고치거나 근거를 확인한 뒤 다시 판단하세요."; }));
let prompt = "";
document.getElementById("case-form").addEventListener("submit", event => {
event.preventDefault(); const f = new FormData(event.currentTarget);
const values = ["customer","problem","deliverable","scope","test"].map(k => String(f.get(k)).trim());
if(values.some(v => !v)) return;
prompt = `고객: ${values[0]}\n문제: ${values[1]}\n건넬 결과: ${values[2]}\n작업 범위: ${values[3]}\n확인 기준: ${values[4]}\n\n이 다섯 가지를 바탕으로 서비스 제안 초안 한 장을 만들어 주세요. 확인하지 못한 사실은 미확인으로 남기고, 가격·매출·공개 약속을 임의로 만들지 마세요. 사람이 판단할 질문을 함께 남겨 주세요.`;
document.getElementById("case-prompt").textContent = prompt;
document.getElementById("case-output").hidden = false;
});
document.getElementById("case-download").addEventListener("click", () => { if(!prompt) return; const url=URL.createObjectURL(new Blob([prompt],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="내-서비스-제안-요청문.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); });
})();
