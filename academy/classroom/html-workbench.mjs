// User code is never inserted into the parent document or executed.
// An inert template is parsed, rebuilt from an allowlist, and rendered in an
// opaque, scriptless sandbox. CSP is placed before any user-controlled markup.
export const HTML_WORK_KEY = 'ham-academy-html-workbench-v1';
export const PREVIEW_CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; child-src 'none'; worker-src 'none'; form-action 'none'; base-uri 'none'";
const MAX_CODE = 500000;
const htmlTags = new Set('a abbr address article aside b bdi bdo blockquote br button caption cite code col colgroup data dd del details dfn div dl dt em fieldset figcaption figure footer h1 h2 h3 h4 h5 h6 header hgroup hr i img input ins kbd label legend li main mark menu meter nav ol optgroup option output p picture pre progress q rp rt ruby s samp section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time tr u ul var wbr'.split(' '));
const omitContents = new Set('script iframe frame frameset object embed portal base meta title link svg math noscript template audio video'.split(' '));
const attributes = new Set('id class title lang dir style role alt width height colspan rowspan scope headers type value checked disabled readonly multiple selected placeholder min max step pattern required maxlength minlength size rows cols open for low high optimum datetime start reversed hidden tabindex'.split(' '));
const node = (tag, value, cls) => {
  const result = document.createElement(tag);
  if (value) result.textContent = value;
  if (cls) result.className = cls;
  return result;
};

export function unwrapHtml(input) {
  const text = input.trim();
  const fenced = text.match(/^```(?:html)?\s*\n([\s\S]*?)\n```$/i);
  return fenced ? fenced[1] : input;
}

export function safePreview(input) {
  // template contents are inert; resource fetches must not start during parsing.
  const template = document.createElement('template');
  template.innerHTML = unwrapHtml(input);
  let removed = 0;
  function clean(source) {
    if (source.nodeType === Node.TEXT_NODE) return document.createTextNode(source.textContent);
    if (source.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
    const tag = source.localName;
    if (source.namespaceURI !== 'http://www.w3.org/1999/xhtml' || omitContents.has(tag)) {
      removed += 1;
      return document.createDocumentFragment();
    }
    // HTML/body/head wrappers may be discarded by fragment parsing; unwrap all
    // unknown tags (including forms) while retaining their safe visible content.
    const result = htmlTags.has(tag) ? document.createElement(tag) : document.createDocumentFragment();
    if (result.nodeType === Node.ELEMENT_NODE) {
      for (const attr of source.attributes) {
        const name = attr.name.toLowerCase();
        if (attributes.has(name) || /^aria-[a-z-]+$/.test(name)) {
          result.setAttribute(name, attr.value);
        } else if (tag === 'a' && name === 'href' && /^#[^\s]*$/.test(attr.value)) {
          result.setAttribute('href', attr.value);
        } else if (tag === 'img' && name === 'src' && /^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(attr.value)) {
          result.setAttribute('src', attr.value);
        } else {
          removed += 1;
        }
      }
      // Prevent submit defaults even in the downloaded static HTML.
      if (tag === 'button') result.setAttribute('type', 'button');
      if (tag === 'input' && ['submit','image','file'].includes(result.getAttribute('type'))) result.setAttribute('type', 'button');
      if (tag === 'a' && !result.hasAttribute('href')) {
        result.setAttribute('aria-disabled', 'true');
        result.setAttribute('title', '외부 연결은 이 미리보기에서 열지 않습니다');
      }
    } else {
      removed += 1;
    }
    for (const child of source.childNodes) result.append(clean(child));
    return result;
  }
  const safe = document.createElement('template');
  for (const child of template.content.childNodes) safe.content.append(clean(child));
  const html = '<!doctype html><html lang="ko"><head><meta charset="utf-8">' +
    '<meta http-equiv="Content-Security-Policy" content="' + PREVIEW_CSP + '">' +
    '<meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>내 HTML · 제한된 화면 미리보기</title><style>html{overflow-wrap:anywhere}body{margin:16px;font:16px/1.6 system-ui,sans-serif}img{max-width:100%;height:auto}a[aria-disabled]{cursor:default}</style></head><body>' + safe.innerHTML + '</body></html>';
  return { html, removed };
}

function download(name, contents, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = node('a'); a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createHtmlWorkbench(container) {
  const section = node('section', '', 'html-workbench');
  section.id = 'html-workbench';
  section.setAttribute('aria-labelledby', 'html-workbench-title');
  section.append(node('p', '5·6강에서 같은 결과 이어쓰기', 'eyebrow'));
  const title = node('h3', '코드만 받았다면, 여기서 화면을 열어보세요');
  title.id = 'html-workbench-title'; section.append(title);
  section.append(node('p', '자기 AI가 실제로 준 HTML을 붙여넣으세요. 이 작업대는 AI를 대신해 결과를 만들지 않습니다. 원본 코드는 이 기기에 따로 저장되어 6강에서도 이어집니다.'));
  section.append(node('p', 'HTML/CSS와 체크박스·접기 같은 기본 동작만 확인합니다. 스크립트, 외부 이미지·링크·폼 전송은 실행하지 않아요. 자바스크립트 버튼이나 실제 저장·전송은 자기 AI 미리보기에서 확인하세요.', 'html-workbench-limit'));
  const label = node('label', '내 AI에게 받은 HTML 코드'); label.htmlFor = 'html-source';
  const source = node('textarea'); source.id = 'html-source'; source.rows = 9; source.spellcheck = false;
  source.placeholder = 'AI에서 받은 HTML 전체를 붙여넣으세요. 안내 문장이나 가상 답을 자동으로 채우지 않습니다.';
  source.setAttribute('aria-describedby', 'html-workbench-save');
  const saveState = node('p', '이 기기에만 저장됩니다. 개인정보·비밀번호·키는 넣지 마세요.', 'html-workbench-status'); saveState.id = 'html-workbench-save'; saveState.setAttribute('role', 'status');
  section.append(label, source, saveState);
  const actions = node('div', '', 'html-workbench-actions');
  const preview = node('button', '화면 미리보기', 'primary-button');
  const exportHtml = node('button', '미리본 HTML 저장', 'secondary-button');
  const exportSource = node('button', '원본 코드 TXT 보관', 'secondary-button');
  const clear = node('button', '이 작업대만 비우기', 'text-button');
  for (const button of [preview, exportHtml, exportSource, clear]) { button.type = 'button'; actions.append(button); }
  exportHtml.disabled = true; exportSource.disabled = true;
  const status = node('p', '아직 미리보기를 열지 않았습니다.', 'html-workbench-status'); status.setAttribute('role', 'status');
  const frame = node('iframe'); frame.title = '내 HTML의 제한된 화면 미리보기'; frame.setAttribute('sandbox', ''); frame.referrerPolicy = 'no-referrer'; frame.hidden = true;
  section.append(actions, status, frame);
  section.append(node('p', 'HTML 저장은 이곳에서 미리본 제한된 화면입니다. 미리보기에서 누른 체크 상태는 저장하지 않습니다. 원본은 TXT로 그대로 보관합니다. 외부 자원과 스크립트가 빠진 미리보기만 보고 실제 기능까지 완료로 표시하지 마세요.', 'html-workbench-note'));
  let renderedSource = null, renderedHtml = '';
  function persist() {
    if (source.value.length > MAX_CODE) {
      saveState.textContent = '코드가 너무 큽니다(500,000자 초과). 지금 입력은 저장하지 않았고 이전 저장본은 유지됩니다. 원본 TXT로 보관하거나 자기 AI에게 간단한 한 페이지로 줄여 달라고 하세요.';
      return false;
    }
    try {
      if (source.value) localStorage.setItem(HTML_WORK_KEY, JSON.stringify({ source: source.value }));
      else localStorage.removeItem(HTML_WORK_KEY);
      saveState.textContent = source.value ? '원본 코드를 이 기기에 저장했습니다. 5·6강에서 이어 쓸 수 있습니다.' : '작업대가 비어 있습니다. 기존 강의 메모는 그대로입니다.';
      return true;
    } catch {
      saveState.textContent = '기기 저장에 실패했습니다. 원본 코드 TXT를 받아 보관하세요. 이 화면에서는 계속 미리볼 수 있습니다.';
      return false;
    }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(HTML_WORK_KEY));
    if (typeof saved?.source === 'string' && saved.source.length <= MAX_CODE) {
      source.value = saved.source;
      saveState.textContent = '이 기기에 저장한 원본을 불러왔습니다. 화면 미리보기를 눌러 다시 여세요.';
      exportSource.disabled = !source.value.trim();
    }
  } catch { saveState.textContent = '이전 작업대 코드를 읽지 못했습니다. 원본 TXT가 있다면 다시 붙여넣으세요. 기존 강의 메모는 바꾸지 않았습니다.'; }
  source.addEventListener('input', () => {
    persist();
    exportSource.disabled = !source.value.trim();
    exportHtml.disabled = true;
    if (renderedSource !== null) status.textContent = '코드가 바뀌었습니다. 아래는 이전 화면입니다. 화면 미리보기를 다시 눌러 주세요.';
  });
  preview.addEventListener('click', () => {
    if (!source.value.trim()) { status.textContent = '먼저 자기 AI에서 받은 HTML을 붙여넣어 주세요.'; source.focus(); return; }
    if (source.value.length > MAX_CODE) { persist(); return; }
    persist();
    const result = safePreview(source.value);
    renderedSource = source.value; renderedHtml = result.html;
    frame.srcdoc = renderedHtml; frame.hidden = false; exportHtml.disabled = false;
    status.textContent = '미리보기를 열었습니다. 글과 화면 순서를 보고 체크박스·접기를 직접 눌러 보세요.' + (result.removed ? ' 외부 연결이나 실행 요소 등은 미리보기에서 제외했습니다. 원본은 그대로 보관됩니다.' : '');
  });
  exportHtml.addEventListener('click', () => {
    if (renderedSource !== source.value || !renderedHtml) return;
    download('내-화면-미리보기.html', renderedHtml, 'text/html;charset=utf-8');
    status.textContent = '미리본 제한된 HTML의 다운로드를 시작했습니다. 저장한 파일을 열어 같은 화면인지 확인하세요.';
  });
  exportSource.addEventListener('click', () => {
    if (!source.value.trim()) return;
    download('내-AI-원본코드.txt', source.value, 'text/plain;charset=utf-8');
    status.textContent = '원본 코드 TXT 다운로드를 시작했습니다. 다른 기기에서도 그대로 다시 붙여넣을 수 있습니다.';
  });
  clear.addEventListener('click', () => {
    if (source.value && !confirm('이 작업대의 원본 코드만 지울까요? 기존 일곱 강 메모와 받은 파일은 그대로 남습니다.')) return;
    reset();
  });
  function reset() {
    source.value = ''; renderedSource = null; renderedHtml = '';
    try { localStorage.removeItem(HTML_WORK_KEY); saveState.textContent = '작업대의 저장 코드를 지웠습니다.'; }
    catch { saveState.textContent = '화면은 비웠지만 기기 저장을 지우지 못했습니다. 브라우저 저장 설정을 확인해 주세요.'; }
    frame.removeAttribute('srcdoc'); frame.hidden = true;
    exportHtml.disabled = true; exportSource.disabled = true;
    status.textContent = '작업대를 비웠습니다.';
  }
  container.append(section);
  return {
    show(lessonNumber) { section.hidden = ![5, 6].includes(lessonNumber); },
    reset
  };
}
