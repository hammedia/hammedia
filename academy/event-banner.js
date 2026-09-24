const eventEndsForRegistration = Date.parse("2026-10-03T13:00:00+09:00");
if (Date.now() < eventEndsForRegistration) {
  for (const banner of document.querySelectorAll("[data-academy-event-banner]")) banner.hidden = false;
}
