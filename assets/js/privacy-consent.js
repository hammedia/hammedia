(function () {
  "use strict";

  const script = document.currentScript;
  const measurementId = script?.dataset.measurementId || "";
  const preferenceKey = "ham_analytics_consent";
  const allowedValues = new Set(["granted", "denied"]);
  const language = (document.documentElement.lang || "ko").toLowerCase();
  const copy = language.startsWith("en") ? {
    label: "Analytics preference",
    message: "We use optional Google Analytics statistics to improve this site. Google Analytics is not loaded until you allow it. ",
    policy: "Privacy policy",
    allow: "Allow analytics",
    deny: "Do not allow",
  } : language.startsWith("ja") ? {
    label: "アクセス解析の選択",
    message: "サイト改善のため、任意のGoogle Analyticsを使用します。許可するまでGoogleの解析コードは読み込みません。",
    policy: "プライバシーポリシー",
    allow: "アクセス解析を許可",
    deny: "許可しない",
  } : {
    label: "방문 통계 선택",
    message: "사이트를 고치기 위한 방문 통계에 Google Analytics를 사용합니다. 허용하기 전에는 Google 분석 코드를 불러오지 않습니다. ",
    policy: "개인정보처리방침",
    allow: "방문 통계 허용",
    deny: "허용하지 않음",
  };

  if (typeof window.gtag !== "function") {
    window.gtag = function () {};
    window.gtag.hamPlaceholder = true;
  }

  function readPreference() {
    try {
      const value = localStorage.getItem(preferenceKey);
      return allowedValues.has(value) ? value : null;
    } catch {
      return null;
    }
  }

  function savePreference(value) {
    try { localStorage.setItem(preferenceKey, value); } catch {}
  }

  function loadAnalytics() {
    if (!measurementId || document.querySelector("script[data-ham-analytics]")) return;

    window.dataLayer = window.dataLayer || [];
    if (window.gtag.hamPlaceholder) {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    analyticsScript.dataset.hamAnalytics = "true";
    document.head.append(analyticsScript);
  }

  function closeBanner(banner) {
    banner.remove();
  }

  function showBanner() {
    if (document.getElementById("ham-analytics-consent")) return;

    const style = document.createElement("style");
    style.textContent = `
      #ham-analytics-consent{position:fixed;z-index:2147483647;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;padding:18px;border:1px solid rgba(28,24,20,.2);border-radius:14px;background:#fffefb;color:#1c1814;box-shadow:0 12px 40px rgba(28,24,20,.2);font:14px/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}
      #ham-analytics-consent p{margin:0 0 12px}
      #ham-analytics-consent a{color:#285c85;text-underline-offset:3px}
      #ham-analytics-consent .ham-consent-actions{display:flex;flex-wrap:wrap;gap:8px}
      #ham-analytics-consent button{min-height:42px;padding:9px 14px;border:1px solid #1c1814;border-radius:999px;background:#fffefb;color:#1c1814;font:inherit;font-weight:800;cursor:pointer}
      #ham-analytics-consent button[data-choice="granted"]{background:#1c1814;color:#fff}
      #ham-analytics-consent button:focus-visible,#ham-analytics-consent a:focus-visible{outline:3px solid #7eb5e8;outline-offset:3px}
    `;
    document.head.append(style);

    const banner = document.createElement("section");
    banner.id = "ham-analytics-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", copy.label);

    const message = document.createElement("p");
    message.append(copy.message);
    const policyLink = document.createElement("a");
    policyLink.href = "/privacy/";
    policyLink.textContent = copy.policy;
    message.append(policyLink);

    const actions = document.createElement("div");
    actions.className = "ham-consent-actions";
    const allowButton = document.createElement("button");
    allowButton.type = "button";
    allowButton.dataset.choice = "granted";
    allowButton.textContent = copy.allow;
    const denyButton = document.createElement("button");
    denyButton.type = "button";
    denyButton.dataset.choice = "denied";
    denyButton.textContent = copy.deny;
    actions.append(allowButton, denyButton);
    banner.append(message, actions);
    document.body.append(banner);

    actions.addEventListener("click", (event) => {
      const choice = event.target.closest("button")?.dataset.choice;
      if (!allowedValues.has(choice)) return;
      savePreference(choice);
      const analyticsWasLoaded = Boolean(document.querySelector("script[data-ham-analytics]"));
      closeBanner(banner);
      if (choice === "granted") loadAnalytics();
      if (choice === "denied" && analyticsWasLoaded) location.reload();
    });
    allowButton.focus();
  }

  window.HAMPrivacy = {
    openAnalyticsChoice() {
      savePreference("");
      showBanner();
    },
  };

  const preference = readPreference();
  if (preference === "granted") {
    loadAnalytics();
  } else if (!preference) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showBanner, { once: true });
    } else {
      showBanner();
    }
  }
})();
