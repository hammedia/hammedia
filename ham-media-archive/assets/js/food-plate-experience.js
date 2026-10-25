const foodPlateExperience = document.querySelector("[data-food-plate-experience]");

if (foodPlateExperience) {
  const foodPlateFigure = foodPlateExperience;
  const foodPlateStage = foodPlateFigure.querySelector("[data-food-plate-stage]");
  const foodPlateLift = foodPlateFigure.querySelector("[data-food-plate-lift]");
  const foodPlateShadow = foodPlateFigure.querySelector("[data-food-plate-contact-shadow]");
  const foodPlateCaption = foodPlateFigure.parentElement.querySelector("[data-plate-caption]");
  const foodPlateDetail = foodPlateFigure.parentElement.querySelector("[data-plate-detail]");
  const foodPlateDetailTitle = foodPlateFigure.parentElement.querySelector("[data-plate-detail-title]");
  const foodPlateZoomStage = foodPlateFigure.parentElement.querySelector("[data-plate-zoom-stage]");
  const foodPlateZoomImage = foodPlateFigure.parentElement.querySelector("[data-plate-zoom-image]");
  const foodPlateReturn = foodPlateFigure.parentElement.querySelector("[data-plate-return]");
  const foodPlateChoices = [...foodPlateFigure.parentElement.querySelectorAll("[data-plate-choice]")];
  const foodPlateHotspots = [...foodPlateFigure.querySelectorAll("[data-plate-hotspot]")];

  const foodPlateData = {
    "yellow-rim": { label: "노란 테두리", x: 0.222, y: 0.495, rx: 0.03, ry: 0.1, tilt: "3deg" },
    rose: { label: "장미 무늬", x: 0.52, y: 0.55, rx: 0.075, ry: 0.2, tilt: "8deg" },
    "red-branch": { label: "붉은 꽃가지", x: 0.38, y: 0.55, rx: 0.065, ry: 0.18, tilt: "-6deg" },
    "blue-vine": { label: "파란 넝쿨", x: 0.67, y: 0.53, rx: 0.08, ry: 0.2, tilt: "6deg" },
    "teal-band": { label: "청록 띠", x: 0.89, y: 0.61, rx: 0.08, ry: 0.22, tilt: "-6deg" }
  };

  const foodSetZoom = (dish) => {
    if (!foodPlateZoomStage || !foodPlateZoomImage || !dish) return;
    const stageWidth = foodPlateZoomStage.clientWidth;
    const stageHeight = foodPlateZoomStage.clientHeight;
    if (!stageWidth || !stageHeight) return;
    const scale = 6.5;
    const imageWidth = stageWidth * scale;
    const imageHeight = imageWidth / (1800 / 1074);
    foodPlateZoomImage.style.width = `${imageWidth}px`;
    foodPlateZoomImage.style.left = `${stageWidth / 2 - dish.x * imageWidth}px`;
    foodPlateZoomImage.style.top = `${stageHeight / 2 - dish.y * imageHeight}px`;
  };

  const foodPlateChoose = (key, { returnFocusToPhoto = false } = {}) => {
    const dish = foodPlateData[key];
    if (!dish) return;
    foodPlateFigure.classList.add("has-plate-selection");
    foodPlateFigure.dataset.selectedPlate = key;
    foodPlateLift.style.setProperty("--plate-x", `${dish.x * 100}%`);
    foodPlateLift.style.setProperty("--plate-y", `${dish.y * 100}%`);
    foodPlateLift.style.setProperty("--plate-rx", `${dish.rx * 100}%`);
    foodPlateLift.style.setProperty("--plate-ry", `${dish.ry * 100}%`);
    foodPlateLift.style.setProperty("--plate-tilt", dish.tilt);
    foodPlateShadow.style.setProperty("--plate-x", `${dish.x * 100}%`);
    foodPlateShadow.style.setProperty("--plate-y", `${dish.y * 100}%`);
    foodPlateShadow.style.setProperty("--plate-rx", `${dish.rx * 100}%`);
    foodPlateShadow.style.setProperty("--plate-ry", `${dish.ry * 100}%`);
    foodPlateHotspots.forEach((button) => {
      const selected = button.dataset.plateHotspot === key;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    foodPlateChoices.forEach((button) => {
      const selected = button.dataset.plateChoice === key;
      button.setAttribute("aria-pressed", String(selected));
    });
    foodPlateDetailTitle.textContent = dish.label;
    foodPlateCaption.textContent = `사진에서 고른 무늬: ${dish.label}. 이 선택은 지금 보는 방문자의 선택입니다.`;
    foodPlateDetail.hidden = false;
    foodPlateReturn.disabled = false;
    requestAnimationFrame(() => {
      foodSetZoom(dish);
      if (returnFocusToPhoto) {
        const hotspot = foodPlateHotspots.find((button) => button.dataset.plateHotspot === key);
        hotspot?.focus({ preventScroll: true });
        foodPlateFigure.scrollIntoView({ behavior: "instant", block: "center" });
      }
    });
  };

  const foodPlateReset = () => {
    foodPlateFigure.classList.remove("has-plate-selection");
    delete foodPlateFigure.dataset.selectedPlate;
    foodPlateDetail.hidden = true;
    foodPlateCaption.textContent = "사진은 전체로 둡니다. 접시를 누르면 고른 무늬가 앞으로 나옵니다.";
    foodPlateReturn.disabled = true;
    foodPlateHotspots.forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    foodPlateChoices.forEach((button) => button.setAttribute("aria-pressed", "false"));
  };

  foodPlateHotspots.forEach((button) => {
    const dish = foodPlateData[button.dataset.plateHotspot];
    if (!dish) return;
    button.style.setProperty("--plate-x", `${dish.x * 100}%`);
    button.style.setProperty("--plate-y", `${dish.y * 100}%`);
    button.disabled = false;
    button.addEventListener("click", () => foodPlateChoose(button.dataset.plateHotspot));
  });
  foodPlateChoices.forEach((button) => {
    button.disabled = false;
    button.addEventListener("click", () => foodPlateChoose(button.dataset.plateChoice, { returnFocusToPhoto: true }));
  });
  foodPlateReturn.addEventListener("click", foodPlateReset);

  const foodPlateResize = new ResizeObserver(() => {
    const selected = foodPlateFigure.dataset.selectedPlate;
    if (selected) foodSetZoom(foodPlateData[selected]);
  });
  foodPlateResize.observe(foodPlateZoomStage);
}
