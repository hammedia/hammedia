(() => {
  'use strict';

  const work = {
    prep: {
      name: '준비와 정리',
      range: '가설·보양·공사 구간 정리·준공 청소',
      proof: '계약·최종 내역에서 이 현장의 수행 범위를 확인했습니다.',
      boundary: '해당 공정을 보여주는 실제 사진은 아직 준비되지 않았습니다. 다른 공정 사진으로 대신하지 않습니다.',
      media: [], target: 'scope', concern: '공정 범위와 현재 상태 상담'
    },
    structure: {
      name: '벽·천장 구조',
      range: '벽체틀·천장틀과 차음·흡음 구조',
      proof: '59.5초 무음 공정 기록에서 벽체 → 천장 → 흡음 → 바닥 → 마감 흐름을 볼 수 있습니다. 장면별 책임은 현장 내역과 구분해 확인합니다.',
      boundary: '도해는 내역의 품목·규격을 이해하기 위한 설명입니다. 실제 시공도면이나 방음 성능 측정값이 아니며, 일부 층의 배치와 순서는 시공사 확인 전입니다.',
      media: [{kind:'diagram', src:'assets/media/avid_dia_ceiling_section_1280.webp', alt:'천장 차음·흡음 구조를 설명하는 개념 단면', caption:'설명 도해 · 현장 사진이나 확정 시공도면이 아닙니다.'}],
      target: 'process-record', concern: '벽·천장·표면 마감'
    },
    finish: {
      name: '표면 마감',
      range: '패브릭·루버·도배·도장',
      proof: '같은 현장의 마감 기록을 볼 수 있습니다. 사진마다 부위와 장면의 성격을 구분해 두었습니다.',
      boundary: '클립 부품 사진은 설치 완료 장면이 아닙니다. 전실 사진에는 환기구 등 다른 업체 공정도 함께 보입니다.',
      media: [
        {kind:'photo', src:'assets/media/avid_img_sinchon_detail_03_1280.webp', alt:'신촌동 AV룸 전실의 패브릭 천장과 문틀 주변 마감 과정', caption:'실제 현장 과정 사진 · 전실 패브릭 천장과 문틀 주변 마감. 환기구 설비 등 다른 공정이 함께 보입니다.'},
        {kind:'photo', src:'assets/media/avid_img_sinchon_detail_02_1280.webp', alt:'루버 고정 클립 부품 사진', caption:'실제 현장 사진 · 루버 고정 클립 부품. 설치 완료 모습을 보여주는 장면은 아닙니다.'}
      ],
      target: 'finish-record', concern: '벽·천장·표면 마감'
    },
    door: {
      name: '문과 금속',
      range: '방음문·문틀·금속 프레임',
      proof: '계약·최종 내역에서 이 현장의 수행 범위를 확인했습니다.',
      boundary: '문 설치를 보여주는 실제 사진은 아직 준비되지 않았습니다. 다른 부품 사진을 문 설치 모습처럼 설명하지 않습니다.',
      media: [], target: 'scope', concern: '문과 문틀'
    },
    electrical: {
      name: '전기 연결',
      range: '전기 배관·배선. 조명 자재·제어는 별도 업체 범위',
      proof: '연결해 볼 수 있는 사진은 천장 마감과 간접 조명선의 접점입니다. 전기 배관·배선 자체를 보여주는 사진은 아닙니다.',
      boundary: '사진 속 조명 자재와 제어는 별도 업체 공정입니다.',
      media: [{kind:'photo', src:'assets/media/avid_img_sinchon_detail_01_1280.webp', alt:'실제 AV룸의 천장 마감과 간접 조명선이 만나는 부위', caption:'실제 현장 사진 · 천장 마감과 간접 조명선의 접점. 전기 배관·배선의 사진은 아니며 조명 자재·제어는 별도 공정입니다.'}],
      target: 'ceiling-finish', concern: '공정 범위와 현재 상태 상담'
    },
    bathroom: {
      name: '화장실 개조',
      range: '확대 공사·방수·타일·문 공정',
      proof: '계약·최종 내역에서 이 현장의 수행 범위를 확인했습니다.',
      boundary: '화장실 공사를 보여주는 실제 사진은 아직 준비되지 않았습니다. 다른 공간 사진을 대신하지 않습니다.',
      media: [], target: 'scope', concern: '화장실 개조'
    },
    floor: {
      name: '바닥 구조',
      range: '레벨링과 차음·흡음 바닥 구조. 원목마루 마감은 별도 업체 범위',
      proof: '바닥 구조를 설명하는 도해가 있습니다. 현장 사진은 아니며, 최종 바닥 마감은 별도 업체가 맡았습니다.',
      boundary: '도해는 내역서의 품목·규격을 설명하는 그림입니다. 실제 현장 사진, 확정 단면도나 성능 측정값이 아닙니다.',
      media: [{kind:'diagram', src:'assets/media/avid_dia_floor_section_1280.webp', alt:'바닥 차음·흡음 구조를 설명하는 개념 단면', caption:'설명 도해 · 실제 현장 사진이 아닙니다. 원목마루 최종 마감은 별도 공정입니다.'}],
      target: 'structure', concern: '공정 범위와 현재 상태 상담'
    }
  };

  const purposes = {
    living: { name: '생활 공간', form: '생활 공간' },
    office: { name: '사무 공간', form: '사무 공간' },
    listening: { name: '음악 감상', form: '음악 감상' },
    making: { name: '녹음·작업', form: '녹음·작업' },
    research: { name: '소리 테스트·연구', form: '소리 테스트·연구' },
    undecided: { name: '아직 정하지 못함', form: '용도 상담이 필요함' }
  };

  const query = new URLSearchParams(location.search);
  const requestedJourney = query.get('journey');
  const requestedPurpose = query.get('purpose');
  let currentId = Object.hasOwn(work, requestedJourney) ? requestedJourney : '';
  let currentPurpose = Object.hasOwn(purposes, requestedPurpose) ? requestedPurpose : '';
  let homeAutoText = '';
  let homeAutoUse = '';
  const current = () => currentId ? work[currentId] : null;
  const selectedPurpose = () => currentPurpose ? purposes[currentPurpose] : null;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const internalPageNames = new Set(['', 'index.html', 'project.html', 'experience.html', 'lighting.html']);

  function stateQuery() {
    const params = new URLSearchParams();
    if (current()) params.set('journey', currentId);
    if (selectedPurpose()) params.set('purpose', currentPurpose);
    return params.toString();
  }

  function projectUrl(id, anchor) {
    const params = new URLSearchParams();
    if (work[id]) params.set('journey', id);
    if (selectedPurpose()) params.set('purpose', currentPurpose);
    const queryString = params.toString();
    return `project.html${queryString ? `?${queryString}` : ''}${anchor ? `#${anchor}` : ''}`;
  }

  function carryJourneyToLinks() {
    if (!current() && !selectedPurpose()) return;
    document.querySelectorAll('a[href]').forEach(link => {
      try {
        const url = new URL(link.getAttribute('href'), location.href);
        if (url.origin !== location.origin) return;
        const pageName = url.pathname.split('/').filter(Boolean).pop() || '';
        if (!internalPageNames.has(pageName)) return;
        if (current()) url.searchParams.set('journey', currentId);
        else url.searchParams.delete('journey');
        if (selectedPurpose()) url.searchParams.set('purpose', currentPurpose);
        else url.searchParams.delete('purpose');
        link.href = url.href;
      } catch { /* Leave a malformed or non-navigation link untouched. */ }
    });
  }

  function updateStateUrl(hash) {
    const url = new URL(location.href);
    if (current()) url.searchParams.set('journey', currentId);
    else url.searchParams.delete('journey');
    if (selectedPurpose()) url.searchParams.set('purpose', currentPurpose);
    else url.searchParams.delete('purpose');
    if (hash) url.hash = hash;
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
    carryJourneyToLinks();
  }

  function mediaNodes(process) {
    const grid = make('div', 'journey-media-grid');
    if (!process.media.length) {
      const note = make('p', 'journey-proof-empty');
      note.append(make('strong', '', '이 공정을 보여주는 사진은 아직 없습니다.'));
      grid.append(note);
      return grid;
    }
    process.media.forEach(item => {
      const figure = make('figure', 'journey-media');
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = item.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      figure.append(image, make('figcaption', '', item.caption));
      grid.append(figure);
    });
    return grid;
  }

  function renderHome(id) {
    const panel = document.querySelector('#journey-panel');
    if (!panel) return;
    const process = work[id];
    panel.replaceChildren();
    panel.hidden = !process;
    document.querySelectorAll('[data-journey-pick]').forEach(button => {
      const selected = button.dataset.journeyPick === id;
      button.setAttribute('aria-expanded', String(selected));
    });
    if (!process) return;

    const head = make('div', 'journey-panel-head');
    const title = make('div');
    title.append(make('p', 'kicker', '현재 고른 공정'), make('h3', '', process.name));
    head.append(title, make('p', '', '이 현장에서 맡은 일과 관련 사진·기록을 함께 봅니다.'));
    const body = make('div', 'journey-panel-body');
    const facts = make('div', 'journey-facts');
    facts.append(
      make('p', '', `이 현장에서 맡은 범위: ${process.range}`),
      make('p', '', `범위 확인: ${process.proof}`),
      make('p', 'journey-boundary', process.boundary)
    );
    if (selectedPurpose()) {
      facts.append(make('p', 'journey-boundary', `상담 준비를 위해 고른 공간 용도: ${selectedPurpose().name}. 이 현장 실적의 분류가 아니라 방문자의 계획입니다.`));
    }
    const actions = make('div', 'journey-actions');
    const recordLink = make('a', '', '관련 현장 기록 보기 →');
    recordLink.href = projectUrl(id, process.target);
    const consultLink = make('a', '', '이 선택을 상담 준비에 가져가기 →');
    consultLink.href = projectUrl(id, 'prepare');
    const conceptLink = make('a', '', 'AI 생성 공간 체험 보기 · 실제 현장과 별도');
    const queryString = stateQuery();
    conceptLink.href = `experience.html${queryString ? `?${queryString}` : ''}`;
    actions.append(recordLink, consultLink, conceptLink);
    facts.append(actions);
    body.append(mediaNodes(process), facts);
    panel.append(head, body);
  }

  function prefillHomeContact(process = current()) {
    const field = document.querySelector('#company-work');
    const useField = document.querySelector('#company-use');
    if (useField && selectedPurpose() && (!useField.value.trim() || useField.value === homeAutoUse)) {
      homeAutoUse = selectedPurpose().name;
      useField.value = homeAutoUse;
    } else if (useField && !selectedPurpose() && homeAutoUse && useField.value === homeAutoUse) {
      useField.value = '';
      homeAutoUse = '';
    }
    if (!field) return;
    if (!process && !selectedPurpose()) {
      if (homeAutoText && field.value === homeAutoText) field.value = '';
      homeAutoText = '';
      return;
    }
    const lines = [];
    if (process) lines.push(`선택한 공정: ${process.name}`, `현재 현장에서 확인된 범위: ${process.range}`);
    else if (selectedPurpose()) lines.push(`상담을 위해 고른 공간 용도: ${selectedPurpose().name} (방문자의 계획)`);
    const next = `${lines.join('\n')}\n\n현재 공간의 상태와 함께 확인하고 싶은 점:`;
    if (!field.value.trim() || field.value === homeAutoText) {
      field.value = next;
      homeAutoText = next;
    }
  }

  function addPurposeChooser(scope) {
    const box = make('fieldset', 'journey-purpose');
    box.append(make('legend', '', '어떤 공간을 준비하고 계세요?'));
    const select = document.createElement('select');
    select.id = 'journey-purpose';
    select.setAttribute('aria-label', '상담 준비를 위한 공간 용도');
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '용도 선택';
    select.append(empty);
    Object.entries(purposes).forEach(([id, purpose]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = purpose.name;
      select.append(option);
    });
    select.value = currentPurpose;
    const note = make('p', '', '방문자의 계획을 공정 안내와 상담 준비에 이어줍니다. 이 선택은 이 현장의 실적 분류가 아닙니다.');
    box.append(select, note);
    scope.querySelector('.section-heading')?.after(box);
    select.addEventListener('change', () => {
      currentPurpose = purposes[select.value] ? select.value : '';
      updateStateUrl('scope');
      renderHome(currentId);
      prefillHomeContact();
    });
  }

  function addHomeChooser() {
    const scope = document.querySelector('#scope');
    const list = scope?.querySelector('.performed');
    if (!scope || !list) return;
    const byName = new Map(Object.entries(work).map(([id, item]) => [item.name, id]));
    const rows = [...list.querySelectorAll('li')];
    if (rows.length !== byName.size) return;
    for (const row of rows) {
      const id = byName.get(row.querySelector('h3')?.textContent.trim());
      const process = work[id];
      if (!process) return;
    }
    addPurposeChooser(scope);
    const hint = make('p', 'journey-hint', '궁금한 공정을 고르면, 맡은 범위와 연결할 수 있는 현장 기록을 함께 보여드립니다.');
    const purposeBox = scope.querySelector('.journey-purpose');
    if (purposeBox) purposeBox.after(hint);
    else scope.querySelector('.section-heading')?.after(hint);
    rows.forEach(row => {
      const id = byName.get(row.querySelector('h3').textContent.trim());
      const process = work[id];
      const button = make('button', 'journey-pick', '관련 기록 보기');
      button.type = 'button';
      button.dataset.journeyPick = id;
      button.setAttribute('aria-controls', 'journey-panel');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', `${process.name} 공정의 관련 기록 보기`);
      button.addEventListener('click', () => {
        currentId = id;
        updateStateUrl('journey-panel');
        renderHome(id);
        prefillHomeContact(process);
        panelAfterRender()?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
      });
      row.append(button);
    });
    const panel = make('section', 'journey-panel');
    panel.id = 'journey-panel';
    panel.hidden = true;
    panel.setAttribute('aria-live', 'polite');
    panel.setAttribute('aria-label', '선택한 공정과 관련 기록');
    const scopeNote = scope.querySelector('.scope-note');
    if (scopeNote) scopeNote.after(panel);
    else list.after(panel);

    const contactForm = document.querySelector('#company-form');
    if (contactForm) {
      contactForm.addEventListener('submit', () => { homeAutoText = ''; });
    }
    if (current()) {
      prefillHomeContact(current());
      renderHome(currentId);
    } else if (selectedPurpose()) prefillHomeContact();
  }

  function panelAfterRender() { return document.querySelector('#journey-panel'); }

  function buildContext(process, extraClass) {
    const box = make('aside', `journey-context ${extraClass || ''}`.trim());
    box.setAttribute('aria-label', `선택한 공정: ${process.name}`);
    box.append(
      make('p', 'kicker', '앞서 고른 공정을 이어봅니다'),
      make('h3', '', process.name),
      make('p', '', `이 현장에서 맡은 범위: ${process.range}`),
      make('p', 'journey-boundary', `기록의 성격: ${process.proof} ${process.boundary}`)
    );
    if (selectedPurpose()) {
      box.append(make('p', 'journey-boundary', `상담을 위해 고른 공간 용도: ${selectedPurpose().name}. 방문자의 계획으로, 이 현장 실적의 분류가 아닙니다.`));
    }
    const actions = make('div', 'journey-context-actions');
    const back = make('a', '', '선택한 공정 목록으로 돌아가기');
    back.href = `index.html${stateQuery() ? `?${stateQuery()}` : ''}#scope`;
    const consult = make('a', '', '이 공정을 상담 준비에 담기');
    consult.href = projectUrl(currentId, 'prepare');
    const concept = make('a', '', 'AI 생성 제안 체험 보기');
    concept.href = `experience.html${stateQuery() ? `?${stateQuery()}` : ''}`;
    actions.append(back, consult, concept);
    box.append(actions, make('small', '', '체험의 공간은 AI 생성 개념 예시입니다. 실제 현장 사진·시공 기록과 구분해 보세요.'));
    return box;
  }

  function buildSummaryContext(process, extraClass) {
    const box = make('aside', `journey-context journey-context-summary ${extraClass || ''}`.trim());
    box.setAttribute('aria-label', `상담 준비에 이어진 선택: ${process.name}`);
    const summary = selectedPurpose()
      ? `공간 계획: ${selectedPurpose().name} · 선택한 공정: ${process.name}`
      : `선택한 공정: ${process.name}`;
    box.append(make('p', 'kicker', '앞서 선택한 내용'), make('p', 'journey-summary-line', summary));
    const actions = make('div', 'journey-context-actions');
    const back = make('a', '', '공정 목록으로 돌아가기');
    back.href = `index.html${stateQuery() ? `?${stateQuery()}` : ''}#scope`;
    actions.append(back);
    box.append(actions);
    return box;
  }

  function buildPurposeContext(extraClass) {
    const purpose = selectedPurpose();
    if (!purpose) return null;
    const box = make('aside', `journey-context journey-purpose-context ${extraClass || ''}`.trim());
    box.setAttribute('aria-label', `상담 준비를 위해 고른 공간 용도: ${purpose.name}`);
    box.append(
      make('p', 'kicker', '방문자가 상담 준비로 고른 내용'),
      make('h3', '', purpose.name),
      make('p', 'journey-boundary', '이 용도 선택은 방문자의 계획입니다. 이 아비드 현장 실적의 분류나 같은 용도의 수행 사례를 뜻하지 않습니다.')
    );
    const actions = make('div', 'journey-context-actions');
    const back = make('a', '', '공정 선택 목록으로 돌아가기');
    back.href = `index.html${stateQuery() ? `?${stateQuery()}` : ''}#scope`;
    const consult = make('a', '', '상담 준비로 이동');
    consult.href = `project.html${stateQuery() ? `?${stateQuery()}` : ''}#prepare`;
    actions.append(back, consult);
    box.append(actions);
    return box;
  }

  function addProjectContext() {
    const process = current();
    const purpose = selectedPurpose();
    if (!process && !purpose) return;
    if (!process) {
      const prepare = document.querySelector('#prepare');
      const use = document.querySelector('#room-use');
      const option = use && [...use.options].find(item => item.textContent.trim() === purpose.form);
      if (option) use.value = option.value;
      const purposeContext = buildPurposeContext('journey-prepare-context');
      if (prepare && purposeContext) prepare.prepend(purposeContext);
      return;
    }
    const project = document.querySelector('#works');
    project?.querySelector('.process')?.setAttribute('id', 'process-record');
    const gallery = project?.querySelector('.gallery');
    const detail02 = gallery?.querySelector('img[src*="avid_img_sinchon_detail_02"]')?.closest('figure');
    const detail03 = gallery?.querySelector('img[src*="avid_img_sinchon_detail_03"]')?.closest('figure');
    if (detail02) detail02.id = 'clip-part-record';
    if (detail03) detail03.id = 'finish-record';
    const target = document.querySelector(`#${process.target}`);
    if (target) {
      const context = buildContext(process, '');
      if (target.matches('figure')) {
        context.id = process.target;
        target.removeAttribute('id');
        const gallery = target.closest('.gallery');
        if (gallery) gallery.before(context);
        else target.before(context);
      } else target.prepend(context);
      if (location.hash === `#${process.target}`) {
        const anchor = document.getElementById(process.target);
        anchor?.scrollIntoView({behavior: 'auto', block: 'start'});
      }
    }
    const prepare = document.querySelector('#prepare');
    const main = document.querySelector('main#main');
    if (main) main.prepend(buildSummaryContext(process, 'journey-main-context'));
    if (prepare) prepare.prepend(buildSummaryContext(process, 'journey-prepare-context'));
    const concern = document.querySelector('#room-concern');
    if (concern) {
      const option = [...concern.options].find(item => item.textContent.trim() === process.concern);
      if (option) concern.value = option.value;
    }
    const use = document.querySelector('#room-use');
    if (use && purpose) {
      const option = [...use.options].find(item => item.textContent.trim() === purpose.form);
      if (option) use.value = option.value;
    }
    window.avidJourneyLabel = process.name;

    const requestForm = document.querySelector('#request-form');
    const requestText = document.querySelector('#request-text');
    if (requestForm && requestText) {
      requestForm.addEventListener('submit', () => {
        const selected = `선택한 공정: ${process.name}`;
        if (requestText.value && !requestText.value.includes(selected)) {
          requestText.value = `${selected}\n\n${requestText.value}`;
        }
      });
    }
  }

  function addExperienceContext() {
    const process = current();
    const purpose = selectedPurpose();
    const main = document.querySelector('main#main');
    if (!main || !document.querySelector('.stage') || (!process && !purpose)) return;
    const box = process ? buildContext(process, 'journey-experience-context') : buildPurposeContext('journey-experience-context');
    if (process) box.querySelector('.journey-context-actions a:nth-child(2)')?.remove();
    main.prepend(box);
  }

  function refineProjectCaptions() {
    const updates = [
      ['실내 마감 세부 2 · 업체별 범위 확인 전', '루버 고정 클립 부품 사진. 설치 완료 장면은 아닙니다.'],
      ['실내 마감 세부 3 · 업체별 범위 확인 전', '전실 패브릭 천장과 문틀 주변 마감 과정. 환기구 설비 등 다른 공정도 함께 보입니다.']
    ];
    const gallery = document.querySelector('#works .gallery');
    if (!gallery) return;
    const images = [...gallery.querySelectorAll('img')];
    const byFile = new Map(images.map(image => [image.getAttribute('src')?.split('/').pop(), image]));
    const image2 = byFile.get('avid_img_sinchon_detail_02_1280.webp');
    const image3 = byFile.get('avid_img_sinchon_detail_03_1280.webp');
    if (image2) image2.alt = '루버 고정 클립 부품 사진. 설치 완료 장면이 아닙니다.';
    if (image3) image3.alt = '전실 패브릭 천장과 문틀 주변 마감 과정. 환기구 설비도 함께 보입니다.';
    for (const [before, after] of updates) {
      const caption = [...gallery.querySelectorAll('figcaption')].find(node => node.textContent.trim() === before);
      if (caption) caption.textContent = after;
    }
  }

  function addCaseOverview() {
    const host = document.querySelector('#project') || document.querySelector('#works');
    if (!host || host.querySelector('.journey-case-overview')) return;
    const overview = make('aside', 'journey-case-overview');
    overview.setAttribute('aria-label', '확인된 한 현장과 내 공간 비교');
    const record = make('div');
    record.append(make('p', 'kicker', '확인된 한 현장'), make('h3', '', '신촌동 AV룸·전실'));
    const facts = make('dl', 'journey-case-facts');
    [
      ['위치', '신촌동'],
      ['실제 용도', 'AV룸과 전실'],
      ['공사 기록 시기', '2024년 11–12월 본공사 · 2025년 1월 일부 추가공정'],
      ['맡은 범위', '벽·천장·바닥 구조, 표면 마감, 문·금속, 전기 배관·배선, 화장실 개조와 공사 준비·정리']
    ].forEach(([label, value]) => {
      const row = make('div');
      row.append(make('dt', '', label), make('dd', '', value));
      facts.append(row);
    });
    record.append(facts, make('p', 'journey-boundary', '원목마루 마감·창호·조명 자재와 제어 등은 별도 업체 공정입니다.'));
    const compare = make('div', 'journey-case-compare');
    compare.append(make('h3', '', '내 공간과 무엇이 다른가요?'));
    const questions = make('ul');
    ['실제 용도와 현재 공간의 상태', '필요한 공정과 유지할 부분', '다른 업체 공정과 맞물리는 지점'].forEach(text => questions.append(make('li', '', text)));
    const actions = make('div', 'journey-actions');
    const link = make('a', '', '이 현장을 참고해 내 공간 정리하기 →');
    link.href = `project.html${stateQuery() ? `?${stateQuery()}` : ''}#prepare`;
    actions.append(link);
    compare.append(questions, make('p', 'journey-boundary', '다른 용도의 수행 사례로 바꾸어 읽지 않고, 필요한 범위와 현장 조건을 비교합니다. 이 현장의 기록 시기가 새 공사의 기간을 뜻하지는 않습니다.'), actions);
    overview.append(record, compare);
    const heading = host.querySelector('.section-heading');
    if (heading) heading.after(overview);
    else host.querySelector('h2')?.after(overview);
  }

  function addEvidenceBadges() {
    const works = document.querySelector('#works');
    if (!works) return;
    const figures = [...works.querySelectorAll('.gallery figure')];
    const labels = ['실제 현장 사진', '실제 현장 사진', '실제 현장 사진'];
    figures.forEach((figure, index) => {
      if (figure.querySelector('.journey-source-badge')) return;
      figure.prepend(make('span', 'journey-source-badge', labels[index] || '실제 현장 사진'));
    });
  }

  function init() {
    addCaseOverview();
    addHomeChooser();
    refineProjectCaptions();
    addEvidenceBadges();
    addProjectContext();
    addExperienceContext();
    carryJourneyToLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
