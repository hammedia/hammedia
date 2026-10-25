const penExperience = document.querySelector("[data-pen-experience]");

if (penExperience) {
  const penCanvas = penExperience.querySelector("[data-pen-canvas]") || penExperience.querySelector("canvas.pen-writing-canvas");
  const penContext = penCanvas?.getContext("2d", { alpha: false });
  const penStatus = penExperience.querySelector("[data-pen-status]");
  const penPromptCopy = penExperience.querySelector("[data-pen-prompt-copy]");
  const penPromptPhoto = penExperience.querySelector("[data-pen-prompt-photo]");
  const penPromptCaption = penExperience.querySelector("[data-pen-prompt-caption]");
  const penPromptButtons = [...penExperience.querySelectorAll("[data-pen-prompt]")];
  const penPalette = penExperience.querySelector(".pen-color-palette");
  const penTextInput = penExperience.querySelector("[data-pen-text]");
  const penWriteTextButton = penExperience.querySelector("[data-pen-write-text]");
  const penUndoButton = penExperience.querySelector('[data-pen-action="undo"]');
  const penClearButton = penExperience.querySelector('[data-pen-action="clear"]');
  const penDownloadButton = penExperience.querySelector('[data-pen-action="download"]');

  const penPrompts = {
    walking: {
      quote: "오늘 실패했다면, 그건 아직 걷는 중이라는 뜻이다.",
      image: "../assets/images/fountain-pens/still-walking.webp",
      alt: "아직 걷는 중이라는 문장을 플래티넘 프레피 만년필과 이로시주쿠 코스모스로 쓴 실제 손글씨",
      caption: "플래티넘 프레피 M · 이로시주쿠 코스모스"
    },
    human: {
      quote: "사람은 사람이 만든 것에 약하다.",
      image: "../assets/images/fountain-pens/handmade-gift-letter.webp",
      alt: "사람은 사람이 만든 것에 약하다는 문장과 펜, 잉크 정보를 적은 실제 손글씨",
      caption: "사람은 사람이 만든 것에 약하다."
    }
  };

  if (!penCanvas || !penContext) {
    if (penStatus) penStatus.textContent = "종이 도구를 열 수 없습니다. 원문과 실제 손글씨 사진은 그대로 볼 수 있습니다.";
  } else {
    const penActions = [];
    let penColor = penExperience.querySelector('input[name="pen-screen-color"]:checked')?.value || "#2f4652";
    let penPromptKey = "walking";
    let activePenStroke = null;

    const penSetStatus = (message) => {
      if (penStatus) penStatus.textContent = `${message} 입력은 서버로 전송되지 않습니다.`;
    };

    const penCompactPreview = () => window.matchMedia("(max-width: 520px)").matches;

    const penWrapText = (context, value, maxWidth) => {
      const lines = [];
      let line = "";
      for (const character of Array.from(value)) {
        const candidate = line + character;
        if (line && context.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = character;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const penDrawPrompt = () => {
      const prompt = penPrompts[penPromptKey];
      if (!prompt) return;

      const compact = penCompactPreview();
      const promptFontSize = compact ? 56 : 32;
      const promptStartY = compact ? 132 : 87;
      const promptLineHeight = compact ? 64 : 42;

      penContext.fillStyle = "#f8f2e8";
      penContext.fillRect(0, 0, penCanvas.width, penCanvas.height);
      penContext.fillStyle = "rgba(47, 70, 82, 0.7)";
      penContext.font = `700 ${compact ? 28 : 20}px "Pretendard", sans-serif`;
      penContext.fillText("곁에 둔 원문", 56, compact ? 44 : 43);
      penContext.fillStyle = "#2f4652";
      penContext.font = `700 ${promptFontSize}px "Pretendard", sans-serif`;
      const promptLines = penWrapText(penContext, prompt.quote, penCanvas.width - 112).slice(0, 2);
      promptLines.forEach((line, index) => penContext.fillText(line, 56, promptStartY + index * promptLineHeight));

      penContext.strokeStyle = "rgba(47, 70, 82, 0.17)";
      penContext.lineWidth = 1;
      const lineYs = compact ? [276, 330, 384] : [176, 268, 360];
      for (const y of lineYs) {
        penContext.beginPath();
        penContext.moveTo(52, y);
        penContext.lineTo(penCanvas.width - 52, y);
        penContext.stroke();
      }
    };

    const penDrawStroke = (stroke) => {
      const points = stroke.points;
      if (!points.length) return;
      penContext.strokeStyle = stroke.color;
      penContext.fillStyle = stroke.color;
      penContext.lineCap = "round";
      penContext.lineJoin = "round";

      if (points.length === 1) {
        const point = points[0];
        penContext.beginPath();
        penContext.arc(point.x, point.y, 2 + point.pressure * 2.8, 0, Math.PI * 2);
        penContext.fill();
        return;
      }

      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const pressure = (previous.pressure + current.pressure) / 2;
        penContext.beginPath();
        penContext.moveTo(previous.x, previous.y);
        penContext.lineTo(current.x, current.y);
        penContext.lineWidth = 2.5 + pressure * 5.2;
        penContext.stroke();
      }

      const last = points[points.length - 1];
      penContext.beginPath();
      penContext.arc(last.x, last.y, 1.2 + last.pressure * 1.2, 0, Math.PI * 2);
      penContext.fill();
    };

    const penDrawText = (action, rowIndex) => {
      penContext.fillStyle = action.color;
      const compact = penCompactPreview();
      let fontSize = compact ? 68 : 44;
      let lines;
      do {
        penContext.font = `${fontSize}px "Pretendard", sans-serif`;
        lines = penWrapText(penContext, action.text, penCanvas.width - 132);
        if (!compact || lines.length <= 3 || fontSize <= 44) break;
        fontSize -= 4;
      } while (fontSize >= 44);
      penContext.textBaseline = "alphabetic";
      const startY = (compact ? 242 : 228) + rowIndex * (compact ? 64 : 56);
      const lineHeight = compact ? Math.max(48, fontSize * 0.86) : 48;
      penContext.fillStyle = action.color;
      penContext.font = `${fontSize}px "Pretendard", sans-serif`;
      lines.slice(0, 3).forEach((line, index) => {
        penContext.fillText(line, 68, startY + index * lineHeight, penCanvas.width - 136);
      });
      penContext.save();
      penContext.fillStyle = "rgba(47, 70, 82, 0.66)";
      penContext.font = `${compact ? 30 : 16}px "Pretendard", sans-serif`;
      penContext.textAlign = "right";
      penContext.fillText("글자로 입력", penCanvas.width - 56, startY + (Math.min(2, lines.length - 1) * lineHeight) + (compact ? 42 : 25));
      penContext.restore();
    };

    const penRedraw = () => {
      penDrawPrompt();
      penActions.forEach((action) => {
        if (action.type === "stroke") penDrawStroke(action);
      });
      const latestTextAction = [...penActions].reverse().find((action) => action.type === "text");
      if (latestTextAction) penDrawText(latestTextAction, 0);
      penUndoButton.disabled = penActions.length === 0;
      penClearButton.disabled = penActions.length === 0;
      penDownloadButton.disabled = penActions.length === 0;
    };

    const penSetPrompt = (key) => {
      if (!penPrompts[key]) return;
      penPromptKey = key;
      const prompt = penPrompts[key];
      penPromptCopy.textContent = prompt.quote;
      penPromptPhoto.src = prompt.image;
      penPromptPhoto.alt = prompt.alt;
      penPromptCaption.textContent = prompt.caption;
      penPromptButtons.forEach((button) => {
        const selected = button.dataset.penPrompt === key;
        button.setAttribute("aria-pressed", String(selected));
      });
      penRedraw();
      penSetStatus("곁에 둘 원문을 바꿨습니다.");
    };

    const penColorInputs = [...penExperience.querySelectorAll('input[name="pen-screen-color"]')];
    penPromptButtons.forEach((button) => {
      button.disabled = false;
      button.addEventListener("click", () => penSetPrompt(button.dataset.penPrompt));
    });
    if (penPalette) penPalette.disabled = false;
    penColorInputs.forEach((input) => {
      input.addEventListener("change", () => {
        penColor = input.value;
        penSetStatus("화면에 그릴 색을 바꿨습니다.");
      });
    });

    penTextInput.addEventListener("input", () => {
      penWriteTextButton.disabled = penTextInput.value.trim().length === 0;
    });
    penWriteTextButton.disabled = true;
    penWriteTextButton.addEventListener("click", () => {
      const text = penTextInput.value.trim();
      if (!text) return;
      penActions.push({ type: "text", text, color: penColor });
      penTextInput.value = "";
      penWriteTextButton.disabled = true;
      penRedraw();
      penSetStatus("입력한 글자를 종이에 옮겼습니다.");
    });

    penCanvas.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      const bounds = penCanvas.getBoundingClientRect();
      const pressure = event.pointerType === "mouse" ? 0.48 : Math.max(0.12, event.pressure || 0.38);
      activePenStroke = { type: "stroke", color: penColor, points: [{
        x: ((event.clientX - bounds.left) / bounds.width) * penCanvas.width,
        y: ((event.clientY - bounds.top) / bounds.height) * penCanvas.height,
        pressure
      }] };
      penActions.push(activePenStroke);
      try { penCanvas.setPointerCapture(event.pointerId); } catch {}
      penRedraw();
      penSetStatus("손으로 한 줄을 쓰고 있습니다.");
    });

    penCanvas.addEventListener("pointermove", (event) => {
      if (!activePenStroke) return;
      event.preventDefault();
      const bounds = penCanvas.getBoundingClientRect();
      const pressure = event.pointerType === "mouse" ? 0.48 : Math.max(0.12, event.pressure || 0.38);
      activePenStroke.points.push({
        x: ((event.clientX - bounds.left) / bounds.width) * penCanvas.width,
        y: ((event.clientY - bounds.top) / bounds.height) * penCanvas.height,
        pressure
      });
      penRedraw();
    });

    const penFinishStroke = () => {
      if (!activePenStroke) return;
      activePenStroke = null;
      penRedraw();
      penSetStatus("한 줄을 종이에 남겼습니다.");
    };
    penCanvas.addEventListener("pointerup", penFinishStroke);
    penCanvas.addEventListener("pointercancel", penFinishStroke);
    penCanvas.addEventListener("lostpointercapture", penFinishStroke);

    penUndoButton.addEventListener("click", () => {
      penActions.pop();
      penRedraw();
      penSetStatus("마지막 획이나 글자를 되돌렸습니다.");
    });
    penClearButton.addEventListener("click", () => {
      penActions.length = 0;
      penRedraw();
      penSetStatus("종이를 다시 비웠습니다.");
    });

    penDownloadButton.addEventListener("click", () => {
      const exportCanvas = document.createElement("canvas");
      const exportContext = exportCanvas.getContext("2d");
      if (!exportContext) {
        penSetStatus("PNG를 만들지 못했습니다. 종이 내용은 현재 화면에 남아 있습니다.");
        return;
      }
      const exportScale = 2;
      const footerHeight = 116;
      exportCanvas.width = penCanvas.width * exportScale;
      exportCanvas.height = penCanvas.height * exportScale + footerHeight * exportScale;
      exportContext.fillStyle = "#f8f2e8";
      exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      exportContext.drawImage(penCanvas, 0, 0, penCanvas.width * exportScale, penCanvas.height * exportScale);
      exportContext.fillStyle = "rgba(47, 70, 82, 0.2)";
      exportContext.fillRect(0, penCanvas.height * exportScale, exportCanvas.width, 2);
      exportContext.fillStyle = "#2f4652";
      exportContext.font = `${30 * exportScale}px Pretendard, sans-serif`;
      exportContext.fillText("펜 ______ / 잉크 ______ / 종이 ______", 64 * exportScale, (penCanvas.height + 74) * exportScale);
      exportContext.fillStyle = "rgba(47, 70, 82, 0.68)";
      exportContext.font = `${14 * exportScale}px Pretendard, sans-serif`;
      exportContext.textAlign = "right";
      exportContext.fillText("HAM MEDIA · 만년필별 · hammedia.co.kr/ham-media-archive/pages/fountain-pens.html", exportCanvas.width - 64 * exportScale, (penCanvas.height + 98) * exportScale, exportCanvas.width - 128 * exportScale);

      exportCanvas.toBlob((blob) => {
        if (!blob) {
          penSetStatus("PNG를 만들지 못했습니다. 종이 내용은 현재 화면에 남아 있습니다.");
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = objectUrl;
        downloadLink.download = "내-한-줄.png";
        document.body.append(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
        penSetStatus("내-한-줄.png를 이 기기에서 만들었습니다.");
      }, "image/png");
    });

    penRedraw();
    if (typeof ResizeObserver !== "undefined") {
      const penCanvasResizeObserver = new ResizeObserver(() => penRedraw());
      penCanvasResizeObserver.observe(penCanvas);
    }
    penPromptButtons.forEach((button) => { button.disabled = false; });
    penPalette.disabled = false;
    penSetStatus("입력한 내용은 서버로 보내지지 않습니다. PNG 저장은 기기 안에서 만듭니다.");
    if (document.fonts?.load) document.fonts.load('44px "NanumPenLocal"').then(penRedraw).catch(() => {});
  }
}
