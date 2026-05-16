const servicesMount = document.querySelector("[data-services]");
const errorMount = document.querySelector("[data-error]");

const serviceIcons = {
  "Engineering Services": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 17l-4 4v-4H1V3h16v14H9z"></path>
      <path d="M6 7h6"></path>
      <path d="M6 11h8"></path>
    </svg>
  `,
  "Medical Equipment Supply & Installations": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v18"></path>
      <path d="M7 8h10"></path>
      <path d="M7 16h10"></path>
      <path d="M9 12h6"></path>
    </svg>
  `,
  "Oil & Gas & Marine Logistics": `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 18h18"></path>
      <path d="M6 18l2-6h8l2 6"></path>
      <path d="M10 12V7h4v5"></path>
      <path d="M2 21c1.5-1 2.5-1 4 0s2.5 1 4 0s2.5-1 4 0s2.5 1 4 0s2.5-1 4 0"></path>
    </svg>
  `,
};

const serviceKickers = {
  "Engineering Services": "Integrated Delivery",
  "Medical Equipment Supply & Installations": "Healthcare Solutions",
  "Oil & Gas & Marine Logistics": "Energy & Transport",
};

const serviceTypeClasses = {
  "Engineering Services": "svc-engineering",
  "Medical Equipment Supply & Installations": "svc-medical",
  "Oil & Gas & Marine Logistics": "svc-energy",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderServices(data) {
  if (!servicesMount) return;

  servicesMount.innerHTML = data.services
    .map((service) => {
      const serviceTypeClass =
        serviceTypeClasses[service.title] || "svc-default";

      return `
        <article class="service-card services-premium-grid premium-service-card premium-content-card ${serviceTypeClass}">

          <div class="service-card-top">
            <div class="service-icon">
              ${serviceIcons[service.title]}
            </div>
            <div class="service-heading">
              <h3>${service.title}</h3>
              <span class="service-kicker">
                ${serviceKickers[service.title] || "Core Service"}
              </span>
            </div>
          </div>

          <p>${service.description}</p>

          <ul class="bullets premium-bullets">
            ${(service.tags || [])
              .slice(0, 3)
              .map((tag) => `<li>${tag}</li>`)
              .join("")}
          </ul>

          <div class="premium-cta-row" style="margin-top: auto">
            <a class="btn premium-btn" href="${service.page}">
              Learn More
            </a>
          </div>

        </article>
      `;
    })
    .join("");
}

async function loadServices() {
  if (!servicesMount) return;

  try {
    const response = await fetch("/assets/data/services.json", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load services: ${response.status}`);
    }

    const data = await response.json();
    renderServices(data);
  } catch (error) {
    console.error("Unable to load services.", error);
    servicesMount.innerHTML = "";
    if (errorMount) {
      errorMount.textContent =
        "Unable to load services right now. Please try again later.";
    }
  }
}

loadServices();
