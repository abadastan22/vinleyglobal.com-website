// assets/js/leadership.page.js

const leadershipData = {
  management: [
    {
      name: "Stan Abada",
      title: "CEO / Managing Director",
      img: "assets/img/leadership/stan-abada.png",
      href: "leadership/stan-abada.html",
      summary:
        "Leads Vinley Global with a focus on execution discipline, strategic growth, and delivery across engineering, infrastructure, and business operations.",
      strengths: [
        "Strategic leadership",
        "Project delivery oversight",
        "Stakeholder management",
      ],
    },
    {
      name: "Kelvin Esemomoh",
      title: "Exec Director, Medical Equipment/Operations",
      img: "assets/img/leadership/kelvin-esemomoh.png",
      href: "leadership/kelvin-esemomoh.html",
      summary:
        "Provides operational leadership across medical equipment supply, implementation readiness, and institutional coordination.",
      strengths: [
        "Medical equipment operations",
        "Execution coordination",
        "Institutional delivery support",
      ],
    },
    {
      name: "Rita Ifidon",
      title: "Exec Director, Accounting/Finance",
      img: "assets/img/leadership/rita-ifidon.png",
      href: "leadership/rita-ifidon.html",
      summary:
        "Provides accounting and finance leadership across financial planning, reporting, and operational oversight.",
      strengths: [
        "Corporate finance",
        "Commercial strategy",
        "Operational optimization",
      ],
    },
  ],
  board: [
    {
      name: "Edith Unuigbe",
      title: "Non-Executive Director/Advisor",
      img: "assets/img/leadership/edith-unuigbe.jpg",
      href: "leadership/edith-unuigbe.html",
      summary:
        "Provides strategic guidance, governance oversight, and institutional credibility to support sustainable business growth.",
      strengths: [
        "Board governance",
        "Strategic oversight",
        "Institutional leadership",
      ],
    },
  ],
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getGlowClass(group) {
  if (group === "management") return "svc-engineering";
  if (group === "board") return "svc-energy";
  return "svc-default";
}

function renderLeadershipCard(person, glowClass = "svc-engineering") {
  const strengths = Array.isArray(person.strengths)
    ? person.strengths.slice(0, 3)
    : [];

  const profileLink = person.href
    ? `<div class="premium-cta-row" style="margin-top: auto">
         <a class="btn premium-btn" href="${escapeHtml(person.href)}">View Profile</a>
       </div>`
    : "";

  const imageBlock = person.img
    ? `
      <div class="leadership-card-image-wrap">
        <img
          class="leadership-card-image"
          src="${escapeHtml(person.img)}"
          alt="${escapeHtml(person.name)}"
          loading="lazy"
        />
      </div>
    `
    : "";

  return `
    <article class="service-card premium-service-card premium-content-card leadership-premium-card ${glowClass}">
      ${imageBlock}

      <div class="service-card-top">
        <div class="service-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"></path>
          </svg>
        </div>
        <div class="service-heading">
          <h3>${escapeHtml(person.name)}</h3>
          <span class="service-kicker">${escapeHtml(person.title)}</span>
        </div>
      </div>

      <p>${escapeHtml(person.summary || "")}</p>

      ${
        strengths.length
          ? `
        <ul class="bullets premium-bullets">
          ${strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      `
          : ""
      }

      ${profileLink}
    </article>
  `;
}

function renderTeam(selector, people, groupName) {
  const el = document.querySelector(selector);
  if (!el) return;

  if (!people || people.length === 0) {
    el.innerHTML = `<p class="muted small mb-0">Updates coming soon.</p>`;
    return;
  }

  const glowClass = getGlowClass(groupName);
  el.innerHTML = people
    .map((person) => renderLeadershipCard(person, glowClass))
    .join("");
}

function init() {
  try {
    renderTeam(
      '[data-team="management"]',
      leadershipData.management,
      "management",
    );
    renderTeam('[data-team="board"]', leadershipData.board, "board");
  } catch (e) {
    const err = document.querySelector("[data-error]");
    if (err) err.textContent = "Unable to load leadership content.";
    console.error(e);
  }
}

init();
