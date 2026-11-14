(() => {
  'use strict';
  const finalField = document.getElementById('final-version');
  if (!finalField) return;
  const preview = document.getElementById('final-preview');
  const previewText = document.getElementById('final-preview-text');
  const status = document.getElementById('delivery-status');
  const example = document.getElementById('example-final');
  const exampleStatus = document.getElementById('example-status');
  const sampleLabel = '가상 예시 · 실제 고객 사례나 검증된 교육 성과가 아닙니다.';
  const printPage = document.createElement('section');
  printPage.id = 'final-print-page';
  const printText = document.createElement('div');
  printText.className = 'paper-text';
  printPage.append(printText);
  document.body.append(printPage);

  function refresh() {
    const text = finalField.value.trim();
    preview.hidden = !text;
    previewText.textContent = text;
    document.getElementById('delivery-next').hidden = !text;
  }
  function finalText() {
    const text = finalField.value.trim();
    if (!text) {
      status.textContent = '먼저 최종본을 적거나 AI 답을 최종 편집 칸에 가져오세요.';
      finalField.focus();
    }
    return text;
  }
  function escapeHTML(text) {
    return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function documentHTML(text, isExample) {
    const title = isExample ? '신입 첫날 안내문 · 가상 예시' : '내 최종 문서';
    return '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' +
      '<title>' + title + '</title><style>' +
      '*{box-sizing:border-box}body{margin:0;background:#f6f4ef;color:#201e1a;font-family:"Apple SD Gothic Neo","Malgun Gothic",sans-serif}' +
      'main{max-width:760px;margin:36px auto;padding:40px;background:white;border:1px solid #e4dfd5}' +
      '.text{white-space:pre-wrap;overflow-wrap:anywhere;font-size:17px;line-height:1.8}' +
      '.sample{padding:12px;background:#fff4cc;font-size:13px;margin:0 0 24px}' +
      '@media(max-width:600px){main{margin:0;padding:24px 18px;border:0}}' +
      '@media print{body{background:white}main{max-width:none;margin:0;padding:0;border:0}.text{font-size:11pt;line-height:1.65}@page{margin:18mm}}' +
      '</style></head><body><main>' +
      (isExample ? '<p class="sample">' + sampleLabel + '</p>' : '') +
      '<div class="text">' + escapeHTML(text) + '</div></main></body></html>';
  }
  function download(text, format, isExample, feedback) {
    if (!text.trim()) { feedback.textContent = '문서에 담을 내용을 먼저 적어주세요.'; return; }
    let url;
    try {
      const content = format === 'html' ? documentHTML(text, isExample) : text;
      const blob = new Blob([content], {type:format === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8'});
      url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = (isExample ? 'hammedia-example_' : 'hammedia-final_') + stamp + '.' + format;
      document.body.append(link);link.click();link.remove();
      feedback.textContent = (isExample ? '가상 예시' : '최종본만 담은 문서') + ' 다운로드를 시작했습니다. 저장한 파일을 열어 확인하세요.';
      // Track the requested file type only; never include text, titles, or personal inputs.
      if (!isExample) window.HAMPrivacy?.trackToolOutput('download_request', format);
    } catch (_) {
      feedback.textContent = '다운로드를 시작하지 못했습니다. 내용을 복사하거나 인쇄·PDF를 사용하세요.';
    } finally {
      if (url) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  document.getElementById('download-final-html').addEventListener('click', () => {
    const text = finalText();if (text) download(text, 'html', false, status);
  });
  document.getElementById('download-final-txt').addEventListener('click', () => {
    const text = finalText();if (text) download(text, 'txt', false, status);
  });
  document.getElementById('download-example').addEventListener('click', () => download(example.value.trim(), 'html', true, exampleStatus));
  document.getElementById('print-final').addEventListener('click', () => {
    const text = finalText();if (!text) return;
    printText.textContent = text;
    document.body.setAttribute('data-print-final', '');
    try {
      window.print();
      status.textContent = '인쇄 창에서 프린터 또는 PDF 저장을 선택하세요. 실제 저장·인쇄는 브라우저에서 확인해주세요.';
    } catch (_) {
      document.body.removeAttribute('data-print-final');
      status.textContent = '인쇄 창을 열지 못했습니다. 최종본 HTML을 저장해 브라우저에서 인쇄해주세요.';
    }
  });
  window.addEventListener('afterprint', () => document.body.removeAttribute('data-print-final'));
  document.getElementById('print').addEventListener('click', () => document.body.removeAttribute('data-print-final'), true);
  // The editor emits after input, answer transfer, clear, and asynchronous file restore.
  document.addEventListener('ham-experience-updated', refresh);
  refresh();
})();
