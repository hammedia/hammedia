export const PUBLIC_DISCLOSURE = "선택한 강·화면 단계·질문과 최근 도우미 대화는 답변 생성을 위해 Anthropic Claude에 전송됩니다. 실명·개인정보·비밀번호는 입력하지 마세요.";

function resolveEndpoint(endpoint) {
  const configured = endpoint ?? globalThis.ACADEMY_HELPER_ENDPOINT;
  if (typeof configured !== "string" || !configured.trim()) {
    throw new Error("수업 도우미 연결 주소가 아직 설정되지 않았어요.");
  }
  let url;
  try {
    url = new URL(configured, globalThis.location?.href ?? "http://127.0.0.1/");
  } catch {
    throw new Error("수업 도우미 연결 주소를 확인해 주세요.");
  }
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !localHttp) throw new Error("보안 연결 주소만 사용할 수 있어요.");
  return url.href;
}

export function createAcademyHelperClient({ endpoint, fetchImpl = globalThis.fetch } = {}) {
  const target = resolveEndpoint(endpoint);
  if (typeof fetchImpl !== "function") throw new Error("이 브라우저에서는 도우미를 연결할 수 없어요.");

  return async function askAcademyHelper({ messages, stage = "", lesson = 1 }) {
    let response;
    try {
      response = await fetchImpl(target, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, stage, lesson })
      });
    } catch {
      throw new Error("도우미에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    }

    let data;
    try { data = await response.json(); }
    catch { throw new Error("도우미 답을 읽지 못했어요. 잠시 뒤 다시 시도해 주세요."); }
    if (!response.ok || typeof data.answer !== "string" || !data.answer.trim()) {
      throw new Error(typeof data.error === "string" ? data.error : "지금은 답을 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    }
    return data;
  };
}
