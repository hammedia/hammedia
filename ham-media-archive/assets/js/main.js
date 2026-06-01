const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll(".world-door, .contact-link, .back-link").forEach((target) => {
  target.addEventListener("pointerdown", () => {
    target.classList.remove("is-rippling");
    window.requestAnimationFrame(() => {
      target.classList.add("is-rippling");
    });
  });

  target.addEventListener("transitionend", (event) => {
    if (event.propertyName === "opacity") {
      target.classList.remove("is-rippling");
    }
  });
});

const constellationData = {
  fountain: {
    code: "LPH-B613-01",
    kind: "사람",
    name: "살아남은 이야기",
    teaser: "마음에 쌓인 걸 몸 밖으로 꺼내던 도구",
    result: "글이 좋아서가 아니었다. 마음에 쌓인 걸 몸 밖으로 빼내려 펜을 잡았고, 그렇게 겨우 살아났다. 무거운 날이면, 손이 결국 펜으로 간다.",
    invite: "손으로 뭔가를 꺼내며 버텨본 사람이라면, 우린 말이 통한다.",
    asset: "실제 사진 준비 중: 실제 만년필, 손글씨, 노트, 잉크 흔적 사진",
    previewImage: "fountain-pens/hero-window-table.jpg",
    previewAlt: "창가 테이블 위의 만년필과 노트",
    previewCaption: "만년필별 대표 이미지",
    stampImage: "fountain-pens/stamps/lph-b613-01-fountain-pen-stamp.png",
    stampAlt: "LPH-B613-01 만년필별 도착 스탬프",
    roomHref: "pages/fountain-pens.html",
    roomLabel: "입장권 발권"
  },
  motorcycle: {
    code: "LPH B-613-02",
    kind: "사람",
    name: "살아 있음을 확인한 별",
    teaser: "살아 있다는 감각을 확인한 일",
    result: "더 빨리, 더 멀리, 그리고 더 위험하게. 마흔, 병상에서 정했다. 죽기 전에 하고 싶은 건 하자. 면허도 없이 두카티를 계약했다. 그때 살아 있다는 감각은 아직 내 안에 남았다.",
    invite: "미루지 않는 사람들끼리는 안다. (HAM MEDIA의 빨강이 두카티에서 온 건, 그래서다.)",
    asset: "실제 사진 준비 중: 실제 바이크, 두카티 관련 사진, 장비, 라이딩 흔적 사진",
    previewImage: "motorcycles/hero-ducati-red-front.jpg",
    previewAlt: "붉은 두카티 바이크",
    previewCaption: "바이크별 대표 이미지",
    roomHref: "pages/motorcycles.html",
    roomLabel: "바이크별로 들어가기"
  },
  travel: {
    code: "LPH B-613-03",
    kind: "일",
    name: "자리를 옮겨 보는 별",
    teaser: "자리를 바꾸면 생각도 바뀐다는 믿음",
    result: "서 있는 자리가 바뀌면 보이는 게 달라진다. 모르는 곳에서 다른 생각을 하면, 거기서 뜻이 생긴다. 자리를 옮겨 보는 그 버릇이, 내 번역의 방식이 됐다.",
    invite: "전문가의 자리에서 보던 걸 청중의 자리로 옮겨 보는 일. 그게 내가 하는 번역이다.",
    asset: "실제 사진 준비 중: 실제 여행 사진, 이동 중 메모, 장소 디테일 사진",
    previewImage: "travel/hero-station-suitcase-waiting.jpg",
    previewAlt: "기차역에서 캐리어와 함께 기다리는 순간",
    previewCaption: "여행별 대표 이미지",
    roomHref: "pages/travel.html",
    roomLabel: "여행별로 들어가기"
  },
  bike: {
    code: "LPH B-613-04",
    kind: "사람",
    name: "비워낸 별",
    teaser: "몸을 비워 머리를 비운 일",
    result: "두 발로 가는 건 딴생각하면 큰일 난다. 머리가 복잡한 날엔 다리를 믿고 그냥 전진했다. 그렇게 몸을 비우는 법이, 지금도 나를 재운다.",
    invite: "비워야 채워진다는 걸 아는 사람이라면.",
    asset: "실제 사진 준비 중: 실제 자전거, 라이딩 장비, 길 위의 흔적 사진",
    previewImage: "bicycles/hero-city-ride.jpg",
    previewAlt: "길 위의 자전거",
    previewCaption: "자전거별 대표 이미지",
    roomHref: "pages/bicycles.html",
    roomLabel: "자전거별로 들어가기"
  },
  space: {
    code: "LPH B-613-05",
    kind: "사람",
    name: "머무는 방식을 배운 별",
    teaser: "머무는 곳을 그냥 두지 못하는 마음",
    result: "책상이건 차 안이건 공원 벤치건, 나는 내가 머무는 곳을 그냥 두지 못했다. 작은 물건 하나, 빛의 방향 하나가 사람의 기분을 바꾼다는 걸 아니까.",
    invite: "나만의 공간과, 함께 하는 공간. 그 디테일을 아는 사람이라면.",
    asset: "실제 사진 준비 중: 실제 책상, 차 안, 작업실, 공간 디테일 사진",
    roomHref: "pages/spaces.html",
    roomLabel: "공간별로 들어가기"
  },
  car: {
    code: "LPH B-613-06",
    kind: "일",
    name: "길을 찾는 별",
    teaser: "길을 잘 찾는 사람이라는 발견",
    result: "차를 좋아해 멀리 다녔고, 많은 사람을 만났다. 그러다 알았다. 나는 길을 잘 찾는 사람이라는 걸. 길 찾던 그 버릇이, 일이 되어 돌아왔다.",
    invite: "막막한 사람에게 방향을 찾아주는 일. 지금 내가 하는 게 그거다.",
    asset: "실제 사진 준비 중: 실제 자동차, 운전석, 길, 지도, 이동 기록 사진",
    previewImage: "cars/hero-night-direction.jpg",
    previewAlt: "밤길 위 자동차의 방향",
    previewCaption: "자동차별 대표 이미지",
    roomHref: "pages/cars.html",
    roomLabel: "자동차별로 들어가기"
  },
  food: {
    code: "LPH B-613-07",
    kind: "일",
    name: "감각을 익힌 별",
    teaser: "입으로 들어가 마음에 담기는 일",
    result: "일본에서, 미국에서, 한국에서. 평생 사람 입으로 들어가 마음에 담기는 일을 했다. 커피로 맛과 향을 훈련하며 세상의 맛을 익혔다. 혀로 익힌 그 감각이, 콘텐츠를 보는 눈으로 이어졌다.",
    invite: "감각은 타고나는 게 아니라 훈련된다. 보는 눈도 그렇게 길렀다.",
    asset: "실제 사진 준비 중: 실제 커피, 음식, 매장 운영 시절, 메뉴와 도구 사진",
    previewImage: "food/hero-cafe-table-coffee.jpg",
    previewAlt: "카페 테이블 위 커피",
    previewCaption: "음식별 대표 이미지",
    roomHref: "pages/food.html",
    roomLabel: "음식별로 들어가기"
  },
  audio: {
    code: "LPH B-613-08",
    kind: "일",
    name: "고르고 빼는 별",
    teaser: "무엇을 틀고 뺄지 고르는 감각",
    result: "나는 늘 내 인생의 OST를 생각한다. 좋은 오디오일수록 더 깊이 빠져든다. 그래서 오디오 유튜브를 했고, 오디오 업체에서 일했다. 무엇을 틀고 무엇을 뺄지 고르던 그 귀가, 지금 내 편집의 본질이다.",
    invite: "음악은 결국 선곡이다. 내 콘텐츠도 똑같다.",
    asset: "실제 사진 준비 중: 실제 오디오 기기, 음반, 작업 장면, 오디오 콘텐츠 관련 사진",
    previewImage: "music-audio/hero-listening-space.jpg",
    previewAlt: "스피커와 청취 공간",
    previewCaption: "음악·오디오별 대표 이미지",
    roomHref: "pages/music-audio.html",
    roomLabel: "음악·오디오별로 들어가기"
  },
  camera: {
    code: "LPH B-613-09",
    kind: "일",
    name: "무엇을 담을지 보는 별",
    teaser: "찍기보다 무엇을 담을지 고르는 눈",
    result: "찍는 것보다, 무엇을 찍을지 고르는 순간이 좋았다. 그 눈이 카메라를 들게 했고, 지금도 그 눈으로 화면을 고른다.",
    invite: "무엇을 담을지 아는 게 먼저다. 영상은 거기서 시작된다.",
    asset: "실제 사진 준비 중: 실제 카메라, 렌즈, 촬영 현장, 프레임 선택 장면 사진",
    previewImage: "cameras/hero-camera-notebook.jpg",
    previewAlt: "노트와 함께 놓인 카메라",
    previewCaption: "카메라별 대표 이미지",
    roomHref: "pages/cameras.html",
    roomLabel: "카메라별로 들어가기"
  }
};

const constellationStars = Array.from(document.querySelectorAll(".constellation-star"));
const constellationPath = document.querySelector(".constellation-path-line");
const detailKind = document.querySelector("#constellation-kind");
const detailCode = document.querySelector("#constellation-code");
const detailArrivalStamp = document.querySelector("#constellation-arrival-stamp");
const detailName = document.querySelector("#constellation-name");
const detailTeaser = document.querySelector("#constellation-teaser");
const detailResult = document.querySelector("#constellation-result");
const detailInvite = document.querySelector("#constellation-invite");
const detailPreview = document.querySelector("#constellation-preview");
const detailPreviewImage = document.querySelector("#constellation-preview-image");
const detailPreviewCaption = document.querySelector("#constellation-preview-caption");
const detailTicketHint = document.querySelector("#constellation-ticket-hint");
const detailAsset = document.querySelector("#constellation-asset");
const detailRoomLink = document.querySelector("#constellation-room-link");
const detailRoomStatus = document.querySelector("#constellation-room-status");
const constellationEntry = document.querySelector(".constellation-entry");
const constellationDetail = document.querySelector(".constellation-detail");
const constellationWindow = document.querySelector(".constellation-window");
const constellationGuide = document.querySelector(".constellation-guide");
const fineHoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const visitedStars = [];
let activeStar = null;

const scriptAssetRoot = new URL("../images/", document.currentScript?.src || window.location.href);

function getAssetImageUrl(path) {
  return new URL(path, scriptAssetRoot).href;
}

function syncConstellationGuide() {
  if (!constellationGuide) return;

  constellationGuide.textContent = fineHoverQuery.matches
    ? "별에 마우스를 올리면 입장권이 열립니다. 입장은 입장권 버튼으로 합니다."
    : "별을 누르면 입장권이 열립니다. 입장권 버튼으로 들어갑니다.";
}

function createBackgroundStars() {
  if (!constellationWindow || constellationWindow.querySelector(".bg-star")) return;

  const clusters = [
    { x: 22, y: 24, spread: 16 },
    { x: 74, y: 20, spread: 20 },
    { x: 38, y: 74, spread: 18 },
    { x: 82, y: 72, spread: 14 }
  ];

  for (let i = 0; i < 112; i += 1) {
    const star = document.createElement("span");
    const cluster = Math.random() < 0.58
      ? clusters[Math.floor(Math.random() * clusters.length)]
      : null;
    const left = cluster
      ? cluster.x + (Math.random() - 0.5) * cluster.spread
      : Math.random() * 100;
    const top = cluster
      ? cluster.y + (Math.random() - 0.5) * cluster.spread
      : Math.random() * 100;
    const size = 1 + Math.random() * 1.5;

    star.className = "bg-star";
    star.style.left = `${Math.max(0, Math.min(100, left))}%`;
    star.style.top = `${Math.max(0, Math.min(100, top))}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.opacity = `${0.12 + Math.random() * 0.33}`;
    constellationWindow.appendChild(star);
  }
}

function updateConstellationPath() {
  if (!constellationPath) return;

  const pathStars = visitedStars.length > 1 ? visitedStars : [];
  const points = pathStars
    .map((star) => `${star.dataset.x},${star.dataset.y}`)
    .join(" ");

  constellationPath.setAttribute("points", points);
  constellationPath.setAttribute("pathLength", "100");
}

function updateDetailPreview(starData) {
  if (!detailPreview || !detailPreviewImage || !detailPreviewCaption) return;

  if (!starData.previewImage) {
    detailPreview.hidden = true;
    detailPreviewImage.removeAttribute("src");
    detailPreviewImage.alt = "";
    detailPreviewCaption.textContent = "";
    return;
  }

  detailPreview.hidden = false;
  detailPreviewImage.src = getAssetImageUrl(starData.previewImage);
  detailPreviewImage.alt = starData.previewAlt || `${starData.name} 대표 이미지`;
  detailPreviewCaption.textContent = starData.previewCaption || "대표 이미지";
}

function updateArrivalStamp(starData) {
  if (!detailArrivalStamp) return;

  if (!starData.stampImage) {
    detailArrivalStamp.hidden = true;
    detailArrivalStamp.removeAttribute("src");
    detailArrivalStamp.alt = "";
    return;
  }

  detailArrivalStamp.hidden = false;
  detailArrivalStamp.src = getAssetImageUrl(starData.stampImage);
  detailArrivalStamp.alt = starData.stampAlt || `${starData.name} 도착 스탬프`;
}

function positionConstellationTicket(star) {
  if (!constellationDetail) return;

  constellationDetail.classList.remove("is-floating-ticket");
  constellationDetail.style.removeProperty("--ticket-left");
  constellationDetail.style.removeProperty("--ticket-top");
}

function selectConstellationStar(star) {
  const starData = constellationData[star.dataset.star];
  if (!starData) return;

  activeStar = star;
  if (constellationEntry) {
    constellationEntry.classList.add("is-invitation-open");
  }
  if (detailName && detailName.closest("[hidden]")) {
    detailName.closest("[hidden]").hidden = false;
  }

  constellationStars.forEach((item) => {
    const isSelected = item === star;
    item.classList.toggle("is-selected", isSelected);
    if (isSelected) {
      item.setAttribute("aria-current", "true");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  if (!visitedStars.includes(star)) {
    visitedStars.push(star);
  }

  star.classList.add("is-visited");
  detailKind.textContent = starData.kind;
  if (detailCode) {
    detailCode.textContent = starData.code || "LPH-B613";
  }
  detailName.textContent = starData.name;
  detailTeaser.textContent = starData.teaser;
  detailResult.textContent = starData.result;
  detailInvite.textContent = starData.invite;
  updateDetailPreview(starData);
  updateArrivalStamp(starData);
  if (detailTicketHint) {
    detailTicketHint.hidden = !starData.ticketHint;
    detailTicketHint.textContent = starData.ticketHint || "";
  }
  detailAsset.textContent = starData.asset;

  if (starData.roomHref) {
    detailRoomLink.hidden = false;
    detailRoomLink.href = star.href || starData.roomHref;
    detailRoomLink.textContent = starData.roomLabel;
    detailRoomStatus.hidden = true;
  } else {
    detailRoomLink.hidden = true;
    detailRoomStatus.hidden = false;
    detailRoomStatus.textContent = starData.roomStatus;
  }

  updateConstellationPath();

  if (constellationDetail) {
    constellationDetail.classList.remove("is-opening");
    void constellationDetail.offsetWidth;
    constellationDetail.classList.add("is-opening");
    positionConstellationTicket(star);
  }
}

function enterStarRoom(href) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.location.href = href;
    return;
  }

  const veil = document.createElement("div");
  veil.className = "star-enter-veil";
  document.body.appendChild(veil);

  requestAnimationFrame(() => {
    veil.classList.add("is-active");
  });

  setTimeout(() => {
    window.location.href = href;
  }, 460);
}

syncConstellationGuide();
fineHoverQuery.addEventListener?.("change", () => {
  syncConstellationGuide();
  if (activeStar) {
    positionConstellationTicket(activeStar);
  }
});

window.addEventListener("resize", () => {
  if (activeStar) {
    positionConstellationTicket(activeStar);
  }
});

if (constellationStars.length) {
  createBackgroundStars();

  constellationStars.forEach((star) => {
    star.addEventListener("pointerenter", () => {
      if (!fineHoverQuery.matches) return;
      selectConstellationStar(star);
    });

    star.addEventListener("click", (event) => {
      event.preventDefault();
      selectConstellationStar(star);
      if (!fineHoverQuery.matches) {
        detailName?.closest(".constellation-detail")?.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    });

    star.addEventListener("focus", () => selectConstellationStar(star));
  });
  updateConstellationPath();
}

if (detailRoomLink) {
  detailRoomLink.addEventListener("click", (event) => {
    if (detailRoomLink.hidden || !detailRoomLink.href) return;

    event.preventDefault();
    enterStarRoom(detailRoomLink.href);
  });
}

function findRoomGallerySection(roomPage) {
  return Array.from(roomPage.querySelectorAll("section")).find((section) =>
    Array.from(section.classList).some((className) => className.endsWith("-gallery"))
  );
}

function findRoomGalleryGrid(gallerySection) {
  return Array.from(gallerySection.querySelectorAll("div")).find((element) =>
    Array.from(element.classList).some((className) => className.endsWith("-gallery-grid"))
  );
}

function buildRoomEntryNavigation() {
  const roomPage = document.querySelector(".room-page:not(.memory-room)");
  if (!roomPage || roomPage.classList.contains("room-house-page") || roomPage.querySelector(".room-entry-nav")) return;

  const roomHero = roomPage.querySelector(".room-hero");
  const roomPosts = roomPage.querySelector(".room-posts");
  const roomGallery = findRoomGallerySection(roomPage);

  if (!roomHero || (!roomPosts && !roomGallery)) return;

  const nav = document.createElement("nav");
  nav.className = "room-entry-nav";
  nav.setAttribute("aria-label", "방 안 보기");

  if (roomPosts) {
    roomPosts.id = roomPosts.id || "room-writing";
    const postCount = roomPosts.querySelectorAll(".room-post").length;
    const writingLink = document.createElement("a");
    writingLink.className = "room-entry-link";
    writingLink.href = `#${roomPosts.id}`;
    writingLink.innerHTML = `<strong>글</strong><span>${postCount}개 기록 보기</span>`;
    nav.appendChild(writingLink);
  }

  if (roomGallery) {
    roomGallery.id = roomGallery.id || "room-photos";
    const photoCount = roomGallery.querySelectorAll("figure").length;
    const photoLink = document.createElement("a");
    photoLink.className = "room-entry-link";
    photoLink.href = `#${roomGallery.id}`;
    photoLink.innerHTML = `<strong>사진</strong><span>${photoCount}장 보기</span>`;
    nav.appendChild(photoLink);
  }

  roomHero.insertAdjacentElement("afterend", nav);
}

function openGalleryDetail(detail, figure, image, captionText) {
  detail.replaceChildren();

  const detailImage = image.cloneNode(false);
  detailImage.className = "room-gallery-detail-photo";

  const detailCopy = document.createElement("p");
  detailCopy.className = "room-gallery-detail-copy";
  detailCopy.textContent = captionText || image.alt || "아직 기록할 기억을 기다리는 사진입니다.";

  detail.append(detailImage, detailCopy);
  detail.hidden = false;

  figure.parentElement
    ?.querySelectorAll(".room-memory-clickable.is-active")
    .forEach((activeFigure) => activeFigure.classList.remove("is-active"));
  figure.classList.add("is-active");

  detail.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "nearest"
  });
}

function buildRoomGalleryDetails() {
  const roomPage = document.querySelector(".room-page:not(.memory-room)");
  if (!roomPage || roomPage.classList.contains("room-house-page")) return;

  const roomGallery = findRoomGallerySection(roomPage);
  if (!roomGallery || roomGallery.querySelector(".room-gallery-detail")) return;

  const galleryGrid = findRoomGalleryGrid(roomGallery);
  if (!galleryGrid) return;

  const detail = document.createElement("aside");
  detail.className = "room-gallery-detail";
  detail.hidden = true;
  detail.setAttribute("aria-live", "polite");
  galleryGrid.insertAdjacentElement("afterend", detail);

  galleryGrid.querySelectorAll("figure").forEach((figure, index) => {
    const image = figure.querySelector("img");
    if (!image) return;

    const caption = figure.querySelector("figcaption");
    const captionText = caption?.textContent.trim() || "";

    figure.classList.add("room-memory-clickable");
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `${image.alt || `사진 ${index + 1}`} 크게 보기`);

    const open = () => openGalleryDetail(detail, figure, image, captionText);

    figure.addEventListener("click", open);
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

buildRoomEntryNavigation();
buildRoomGalleryDetails();

function buildRoomHouse() {
  const housePage = document.querySelector(".room-house-page");
  if (!housePage) return;

  const doors = Array.from(housePage.querySelectorAll(".room-house-door[data-house-target]"));
  const panels = Array.from(housePage.querySelectorAll(".room-house-panel"));
  const houseNav = housePage.querySelector(".room-house-nav");
  const articleList = housePage.querySelector(".room-article-list");
  const articleLinks = Array.from(housePage.querySelectorAll(".room-article-link[data-article-target]"));
  const articlePanels = Array.from(housePage.querySelectorAll(".room-article-panel"));
  const articleBackButtons = Array.from(housePage.querySelectorAll(".room-article-back"));
  const photoDetail = housePage.querySelector(".room-house-photo-detail");
  const photoPanel = housePage.querySelector("[id$='photo-room']");
  const photoGrid = photoPanel?.querySelector(".room-house-photo-grid");
  const photoFigures = Array.from(photoGrid?.querySelectorAll("figure") || housePage.querySelectorAll(".room-house-photo"));

  function closeArticles() {
    articlePanels.forEach((panel) => {
      panel.hidden = true;
      panel.closest(".room-house-panel")?.classList.remove("is-detail-mode");
    });
    if (!photoPanel?.classList.contains("is-photo-detail-mode")) {
      housePage.classList.remove("is-reading-mode");
    }
    if (articleList) articleList.hidden = false;
    articleLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.setAttribute("aria-expanded", "false");
    });
  }

  function closePhotoDetail() {
    if (photoDetail) {
      photoDetail.hidden = true;
      photoDetail.replaceChildren();
    }
    photoPanel?.classList.remove("is-photo-detail-mode");
    if (!articlePanels.some((panel) => !panel.hidden)) {
      housePage.classList.remove("is-reading-mode");
    }
    if (photoGrid) photoGrid.hidden = false;
    photoFigures.forEach((figure) => figure.classList.remove("is-active"));
  }

  function closePanels() {
    panels.forEach((panel) => {
      panel.hidden = true;
    });
    closeArticles();
    closePhotoDetail();
    doors.forEach((door) => {
      door.classList.remove("is-active");
      door.setAttribute("aria-expanded", "false");
    });
  }

  doors.forEach((door) => {
    const target = housePage.querySelector(`#${door.dataset.houseTarget}`);
    if (!target) return;

    door.setAttribute("aria-expanded", "false");
    door.addEventListener("click", () => {
      const isOpen = !target.hidden;
      closePanels();

      if (!isOpen) {
        target.hidden = false;
        door.classList.add("is-active");
        door.setAttribute("aria-expanded", "true");
        target.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start"
        });
      }
    });
  });

  housePage.querySelectorAll(".room-house-back").forEach((button) => {
    button.addEventListener("click", () => {
      closePanels();
      houseNav?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center"
      });
    });
  });

  function returnToArticleList() {
    closeArticles();
    articleList?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }

  function openArticleAt(index) {
    const link = articleLinks[index];
    const target = link ? housePage.querySelector(`#${link.dataset.articleTarget}`) : null;
    if (!target) return;

    closePhotoDetail();
    closeArticles();
    if (articleList) articleList.hidden = true;
    target.hidden = false;
    target.closest(".room-house-panel")?.classList.add("is-detail-mode");
    housePage.classList.add("is-reading-mode");
    link.classList.add("is-active");
    link.setAttribute("aria-expanded", "true");
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }

  articlePanels.forEach((panel, index) => {
    if (panel.querySelector(":scope > .room-article-bottom-nav")) return;

    const nav = document.createElement("nav");
    nav.className = "room-article-bottom-nav";
    nav.setAttribute("aria-label", "글 이동");

    const listButton = document.createElement("button");
    listButton.type = "button";
    listButton.textContent = "글 목록";
    listButton.addEventListener("click", returnToArticleList);

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.textContent = "이전 글";
    previousButton.disabled = index === 0;
    previousButton.addEventListener("click", () => openArticleAt(index - 1));

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.textContent = "다음 글";
    nextButton.disabled = index === articlePanels.length - 1;
    nextButton.addEventListener("click", () => openArticleAt(index + 1));

    nav.append(listButton, previousButton, nextButton);
    panel.append(nav);
  });

  articleLinks.forEach((link, index) => {
    const target = housePage.querySelector(`#${link.dataset.articleTarget}`);
    if (!target) return;

    link.setAttribute("aria-expanded", "false");
    link.addEventListener("click", () => {
      openArticleAt(index);
    });
  });

  articleBackButtons.forEach((button) => {
    button.addEventListener("click", returnToArticleList);
  });

  function openHousePhoto(index) {
    const figure = photoFigures[index];
    const image = figure?.querySelector("img");
    if (!figure || !image || !photoDetail) return;

    const captionText = figure.dataset.memory || figure.querySelector("figcaption")?.textContent.trim() || image.alt || "아직 기록할 기억을 기다리는 사진입니다.";

    photoDetail.replaceChildren();

    const actions = document.createElement("div");
    actions.className = "room-gallery-detail-actions";

    const backButton = document.createElement("button");
    backButton.className = "room-gallery-detail-button";
    backButton.type = "button";
    backButton.textContent = "사진 목록";
    backButton.addEventListener("click", () => {
      closePhotoDetail();
      photoGrid?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    });

    const indexLabel = document.createElement("span");
    indexLabel.className = "room-gallery-detail-index";
    indexLabel.textContent = `${index + 1} / ${photoFigures.length}`;
    actions.append(backButton, indexLabel);

    const detailImage = image.cloneNode(false);
    detailImage.className = "room-gallery-detail-photo";

    const detailCopy = document.createElement("p");
    detailCopy.className = "room-gallery-detail-copy";
    detailCopy.textContent = captionText;

    const nav = document.createElement("div");
    nav.className = "room-gallery-detail-nav";

    const previousButton = document.createElement("button");
    previousButton.className = "room-gallery-detail-button";
    previousButton.type = "button";
    previousButton.textContent = "이전";
    previousButton.disabled = index === 0;
    previousButton.addEventListener("click", () => openHousePhoto(index - 1));

    const nextButton = document.createElement("button");
    nextButton.className = "room-gallery-detail-button";
    nextButton.type = "button";
    nextButton.textContent = "다음";
    nextButton.disabled = index === photoFigures.length - 1;
    nextButton.addEventListener("click", () => openHousePhoto(index + 1));

    nav.append(previousButton, nextButton);
    photoDetail.append(actions, detailImage, detailCopy, nav);
    photoDetail.hidden = false;
    photoPanel?.classList.add("is-photo-detail-mode");
    housePage.classList.add("is-reading-mode");
    if (photoGrid) photoGrid.hidden = true;

    photoFigures.forEach((activeFigure) => activeFigure.classList.remove("is-active"));
    figure.classList.add("is-active");

    photoDetail.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }

  photoFigures.forEach((figure, index) => {
    const image = figure.querySelector("img");
    if (!image || !photoDetail) return;

    figure.classList.add("room-house-photo", "room-memory-clickable");
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `${image.alt || `사진 ${index + 1}`} 크게 보기`);

    const open = () => openHousePhoto(index);

    figure.addEventListener("click", open);
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

buildRoomHouse();
