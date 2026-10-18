(function () {
  "use strict";

  const script = document.currentScript;
  const measurementId = script?.dataset.measurementId || "";
  const preferenceKey = "ham_analytics_consent";
  const allowedValues = new Set(["granted", "denied"]);
  const language = (document.documentElement.lang || "ko").toLowerCase();
  const copy = language.startsWith("en") ? {
    label: "Analytics preference",
    message: "Visit analytics load only if you allow them. ",
    policy: "Privacy policy",
    allow: "Allow analytics",
    deny: "Do not allow",
  } : language.startsWith("ja") ? {
    label: "アクセス解析の選択",
    message: "許可した場合のみ、訪問の統計を収集します。",
    policy: "プライバシーポリシー",
    allow: "アクセス解析を許可",
    deny: "許可しない",
  } : {
    label: "방문 통계 선택",
    message: "허용한 경우에만 방문 통계를 수집합니다. ",
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
    try {
      localStorage.setItem(preferenceKey, value);
      return true;
    } catch {
      // A failed write must not leave an old grant behind when storage is full.
      try { localStorage.removeItem(preferenceKey); } catch {}
      return false;
    }
  }

  function loadAnalytics() {
    if (measurementId) window[`ga-disable-${measurementId}`] = false;
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

  let returnFocus = null;

  function closeBanner(banner) {
    const hadFocus = banner.contains(document.activeElement);
    banner.remove();
    if (!hadFocus) return;
    const returningToOpener = Boolean(returnFocus?.isConnected);
    const target = returningToOpener ? returnFocus : document.querySelector("main");
    returnFocus = null;
    if (!target) return;
    const temporaryTabindex = !target.hasAttribute("tabindex") && target.tagName === "MAIN";
    if (temporaryTabindex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: !returningToOpener });
    if (temporaryTabindex) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }

  function showBanner(moveFocus = false) {
    const existing = document.getElementById("ham-analytics-consent");
    if (existing) {
      if (moveFocus) existing.focus();
      return;
    }

    if (!document.getElementById("ham-consent-style")) {
      const style = document.createElement("style");
      style.id = "ham-consent-style";
      style.textContent = `
        #ham-analytics-consent{position:relative;box-sizing:border-box;width:100%;margin:0;padding:.5rem max(1rem,calc((100% - 1280px)/2));border:0;border-bottom:1px solid #c9c3b6;background:#fffefb;color:#1c1814;font:.875rem/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;letter-spacing:normal;word-break:keep-all;overflow-wrap:anywhere;scroll-margin-top:1rem}
        #ham-analytics-consent .ham-consent-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;max-width:1280px;margin:0 auto}
        #ham-analytics-consent p{flex:1;min-width:0;margin:0;color:#1c1814;font:inherit}
        #ham-analytics-consent a{color:#285c85;text-decoration:underline;text-underline-offset:3px}
        #ham-analytics-consent .ham-consent-actions{display:flex;flex-wrap:wrap;flex-shrink:0;min-width:20rem;gap:.5rem}
        #ham-analytics-consent button{box-sizing:border-box;flex:1;min-height:44px;max-width:100%;padding:.45rem .875rem;border:1px solid #1c1814;border-radius:4px;background:#fffefb;color:#1c1814;font:inherit;font-weight:650;line-height:1.5;white-space:normal;cursor:pointer}
        #ham-analytics-consent button:hover{background:#eeeae2}
        #ham-analytics-consent:focus-visible,#ham-analytics-consent button:focus-visible,#ham-analytics-consent a:focus-visible{outline:3px solid #174a92;outline-offset:3px}
        @media(max-width:60rem){#ham-analytics-consent .ham-consent-inner{display:block}#ham-analytics-consent .ham-consent-actions{min-width:0;margin-top:.5rem}#ham-analytics-consent button{flex:1 1 0;min-width:0}}
      `;
      document.head.append(style);
    }

    const banner = document.createElement("section");
    banner.id = "ham-analytics-consent";
    banner.setAttribute("aria-label", copy.label);
    banner.setAttribute("aria-describedby", "ham-consent-message");
    banner.tabIndex = -1;

    const message = document.createElement("p");
    message.id = "ham-consent-message";
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
    actions.append(denyButton, allowButton);
    const inner = document.createElement("div");
    inner.className = "ham-consent-inner";
    inner.append(message, actions);
    banner.append(inner);
    const skipLink = document.body.querySelector(":scope > a.skip-link, :scope > a.skip");
    if (skipLink) skipLink.after(banner);
    else document.body.prepend(banner);

    actions.addEventListener("click", (event) => {
      const choice = event.target.closest("button")?.dataset.choice;
      if (!allowedValues.has(choice)) return;
      const saved = savePreference(choice);
      const analyticsWasLoaded = Boolean(document.querySelector("script[data-ham-analytics]"));
      if (choice === "denied" && measurementId) window[`ga-disable-${measurementId}`] = true;
      closeBanner(banner);
      if (choice === "granted") loadAnalytics();
      // A saved refusal starts clean; a blocked store keeps this page opted out.
      if (choice === "denied" && analyticsWasLoaded && saved) location.reload();
    });
    if (moveFocus) banner.focus();
  }

  window.HAMPrivacy = {
    tracksContactClicks: true,
    openAnalyticsChoice() {
      returnFocus = document.activeElement;
      showBanner(true);
    },
  };

  // Count intent separately from a form accepted by the server. Never send
  // mail subjects, inquiry text, contact details, or destination query strings.
  function trackConversion(name, params) {
    if (!document.querySelector("script[data-ham-analytics]") ||
        window[`ga-disable-${measurementId}`] || window.gtag.hamPlaceholder) return;
    try {
      window.gtag("event", name, {
        transport_type: "beacon",
        source_page: location.pathname,
        ...params,
      });
    } catch {
      // Measurement must not interrupt a visitor's inquiry or navigation.
    }
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.protocol === "mailto:") {
      trackConversion("contact_click", { contact_type: "email" });
    } else if (url.hostname === "tally.so" && url.pathname === "/r/vGK44d") {
      trackConversion("contact_click", { contact_type: "form", form_id: "academy_interest" });
    } else if (url.hostname === "hammedia-payment.vercel.app" && url.pathname.replace(/\/$/, "") === "/book") {
      trackConversion("book_purchase_click", {
        purchase_type: url.searchParams.get("gift") === "1" ? "gift" : "self",
      });
    }
  });

  // quote-submitted is dispatched only after a successful quote_requests POST.
  document.addEventListener("quote-submitted", (event) => {
    if (event.target.id !== "quote-request-form") return;
    trackConversion("generate_lead", { form_id: "quote_request", contact_type: "quote" });
  }, true);

  const preference = readPreference();
  if (preference === "granted") {
    loadAnalytics();
  } else if (!preference) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => showBanner(), { once: true });
    } else {
      showBanner();
    }
  }
})();
