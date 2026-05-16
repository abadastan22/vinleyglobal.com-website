import {
  loadPartial,
  loadJSON,
  setActiveNav,
  initNavToggle,
  initYear,
  initHeaderShadow,
} from "./components.js";

function showBootError(err) {
  console.error("[VINLEY] Boot error:", err);
  const el =
    document.querySelector("[data-error]") || document.createElement("p");
  el.setAttribute("data-error", "");
  el.className = "muted small";
  el.textContent =
    "Some site resources failed to load (header/footer/data). Check console for details.";
  if (!el.parentElement) document.body.appendChild(el);
}

async function boot() {
  try {
    await loadPartial("#header", "/partials/header.html");
  } catch (e) {
    console.error("[VINLEY] Failed to load header partial:", e);
  }

  try {
    await loadPartial("#footer", "/partials/footer.html");
  } catch (e) {
    console.error("[VINLEY] Failed to load footer partial:", e);
  }

  try {
    setActiveNav();
  } catch {}

  try {
    initNavToggle();
  } catch {}

  try {
    initYear();
  } catch {}

  try {
    initHeaderShadow();
  } catch {}

  const page = document.body.getAttribute("data-page");

  try {
    if (page === "home") {
      const site = await loadJSON("/data/site.json");
      const h1 = document.querySelector("[data-hero-title]");
      const p = document.querySelector("[data-hero-subtitle]");
      if (h1) h1.textContent = site.heroTitle;
      if (p) p.textContent = site.heroSubtitle;
    }

    if (page === "leadership") {
      const data = await loadJSON("/data/leadership.json");
      const wrap = document.querySelector("[data-leadership]");
      if (wrap) {
        wrap.innerHTML = (data.people || []).map(renderLeader).join("");
        initSeparatorAnimation();
      }
    }

    if (page === "services") {
      const data = await loadJSON("/data/services.json");
      const wrap = document.querySelector("[data-services]");
      if (wrap) {
        wrap.innerHTML = (data.services || []).map(renderService).join("");
      }
    }

    if (page === "projects") {
      const data = await loadJSON("/data/projects.json");

      const wrap = document.querySelector("[data-projects]");
      if (wrap) {
        wrap.innerHTML = (data.projects || []).map(renderProject).join("");
      }

      initProjectFilter(data.projects || []);
    }

    if (page === "contact") {
      const site = await loadJSON("/data/site.json");
      const emailEl = document.querySelector("[data-contact-email]");
      if (emailEl) emailEl.textContent = site.contactEmail;
    }
  } catch (e) {
    console.error("[VINLEY] Page data render error:", e);
  }
}

function initSeparatorAnimation() {
  const separators = document.querySelectorAll(".leader-separator");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  separators.forEach((sep) => observer.observe(sep));
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderLeader(person) {
  const strengths = (person.strengths || [])
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join("");
  const education = (person.education || [])
    .map((e) => `<li>${escapeHtml(e)}</li>`)
    .join("");
  const badges = (person.badges || [])
    .map((b) => `<span class="badge">${escapeHtml(b)}</span>`)
    .join("");

  const detailsSection = person.hideDetails
    ? ""
    : `
      <div class="leader-columns">
        <div>
          <h4>Core strengths</h4>
          <ul class="bullets">${strengths}</ul>
        </div>
        <div>
          <h4>Education</h4>
          <ul class="bullets">${education}</ul>
        </div>
      </div>
    `;

  return `
    <div class="leader-card ${person.hideDetails ? "leader-separator" : ""}">
      <div class="leader-avatar" aria-hidden="true">
        ${escapeHtml(person.initials || "")}
      </div>
      <div>
        <h3>${escapeHtml(person.name)}</h3>
        <p class="leader-title">${escapeHtml(person.title)}</p>
        <p class="leader-summary">${escapeHtml(person.summary)}</p>

        ${detailsSection}

        <div class="leader-badges">${badges}</div>
      </div>
    </div>
  `;
}

function renderService(p) {
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

  const title = p?.title || "Service";
  const description = p?.description || "";
  const page = p?.page ? `/${String(p.page).replace(/^\/+/, "")}` : "#";
  const tags = Array.isArray(p?.tags) ? p.tags.slice(0, 3) : [];

  const icon = serviceIcons[title] || serviceIcons["Engineering Services"];
  const kicker = serviceKickers[title] || "Core Service";
  const serviceTypeClass = serviceTypeClasses[title] || "svc-default";

  return `
    <article class="service-card premium-service-card premium-content-card ${serviceTypeClass}">
      <div class="service-card-top">
        <div class="service-icon" aria-hidden="true">
          ${icon}
        </div>
        <div class="service-heading">
          <h3>${escapeHtml(title)}</h3>
          <span class="service-kicker">${escapeHtml(kicker)}</span>
        </div>
      </div>

      <p>${escapeHtml(description)}</p>

      <ul class="bullets premium-bullets">
        ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
      </ul>

      <div class="premium-cta-row" style="margin-top: auto">
        <a class="btn premium-btn" href="${escapeHtml(page)}">Learn More</a>
      </div>
    </article>
  `;
}

function getProjectGlow(project) {
  const type = [
    project?.category || "",
    ...(Array.isArray(project?.tags) ? project.tags : []),
    project?.title || "",
    project?.description || "",
  ]
    .join(" ")
    .toLowerCase();

  if (
    type.includes("engineering") ||
    type.includes("infrastructure") ||
    type.includes("construction")
  ) {
    return "svc-engineering";
  }

  if (
    type.includes("medical") ||
    type.includes("health") ||
    type.includes("scanner")
  ) {
    return "svc-medical";
  }

  if (
    type.includes("energy") ||
    type.includes("renewable") ||
    type.includes("oil") ||
    type.includes("gas") ||
    type.includes("solar")
  ) {
    return "svc-energy";
  }

  return "svc-default";
}

function renderProject(p) {
  const glowClass = getProjectGlow(p);
  const tags = (p.tags || []).slice(0, 3);

  return `
    <article class="service-card premium-service-card premium-content-card ${glowClass}">
      <div class="service-card-top">
        <div class="service-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19h16"></path>
            <path d="M7 19V9"></path>
            <path d="M12 19V5"></path>
            <path d="M17 19v-7"></path>
          </svg>
        </div>
        <div class="service-heading">
          <h3>${escapeHtml(p.title)}</h3>
          <span class="service-kicker">${escapeHtml(p.short || "Project")}</span>
        </div>
      </div>

      <p>${escapeHtml(p.description || "")}</p>

      <ul class="bullets premium-bullets">
        ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function normalizeMediaItems(projects) {
  return (projects || []).map((p) => {
    const media =
      p.media ||
      (p.images || []).map((src) => ({
        src,
        alt: p.title || "Project image",
      })) ||
      [];
    return { ...p, media };
  });
}

function rebuildBootstrapCarousel() {
  const el = document.getElementById("vinleyProjectsCarousel");
  if (!el) return;

  const bs = window.bootstrap;
  if (!bs?.Carousel) return;

  const existing = bs.Carousel.getInstance(el);
  if (existing) existing.dispose();

  bs.Carousel.getOrCreateInstance(el, {
    interval: false,
    ride: false,
    touch: true,
  });
}

function attachCarouselVideoHandlers() {
  const carouselEl = document.getElementById("vinleyProjectsCarousel");
  if (!carouselEl) return;

  if (carouselEl.dataset.videoHandlersBound === "true") return;
  carouselEl.dataset.videoHandlersBound = "true";

  carouselEl.addEventListener("slide.bs.carousel", () => {
    carouselEl.querySelectorAll("video").forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  });

  carouselEl.addEventListener("slid.bs.carousel", () => {
    const activeVideo = carouselEl.querySelector(".carousel-item.active video");
    if (activeVideo) {
      activeVideo.play().catch(() => {});
    }
  });
}

function buildCarouselSlides(carouselInner, indicators, mediaItems) {
  carouselInner.innerHTML = "";
  indicators.innerHTML = "";

  if (!mediaItems.length) {
    carouselInner.innerHTML = `
      <div class="carousel-item active">
        <div class="media-frame" style="display:grid;place-items:center;">
          <div class="muted" style="padding:24px;text-align:center;">
            No media available for this project yet.
          </div>
        </div>
      </div>
    `;
    rebuildBootstrapCarousel();
    return;
  }

  mediaItems.forEach((m, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-bs-target", "#vinleyProjectsCarousel");
    btn.setAttribute("data-bs-slide-to", String(idx));
    btn.setAttribute("aria-label", `Slide ${idx + 1}`);

    if (idx === 0) {
      btn.classList.add("active");
      btn.setAttribute("aria-current", "true");
    }

    indicators.appendChild(btn);

    const slide = document.createElement("div");
    slide.className = `carousel-item${idx === 0 ? " active" : ""}`;
    slide.setAttribute("data-bs-interval", "7000");

    const alt = escapeHtml(m.alt || "Project media");
    const captionTitle = escapeHtml(m.title || "");
    const captionText = escapeHtml(m.caption || "");
    const src = String(m.src || "");
    const isVideo = src.toLowerCase().endsWith(".mp4");

    slide.innerHTML = `
      <div class="media-frame">
        ${
          isVideo
            ? `
          <video class="d-block w-100" muted loop playsinline preload="metadata">
            <source src="${escapeHtml(src)}" type="video/mp4" />
          </video>
        `
            : `
          <img
            src="${escapeHtml(src)}"
            alt="${alt}"
            loading="lazy"
            class="d-block w-100"
          />
        `
        }
      </div>

      ${
        captionTitle || captionText
          ? `
        <div class="carousel-caption d-none d-md-block">
          ${captionTitle ? `<h5>${captionTitle}</h5>` : ""}
          ${captionText ? `<p>${captionText}</p>` : ""}
        </div>
      `
          : ""
      }
    `;

    carouselInner.appendChild(slide);
  });

  rebuildBootstrapCarousel();
  attachCarouselVideoHandlers();

  const firstVideo = carouselInner.querySelector(".carousel-item.active video");
  if (firstVideo) {
    firstVideo.play().catch(() => {});
  }
}

function initProjectFilter(projects) {
  const filter = document.getElementById("projectFilter");
  const carouselInner = document.getElementById("carouselInner");
  const indicators = document.getElementById("carouselIndicators");
  const hint = document.getElementById("projectFilterHint");

  if (!filter || !carouselInner || !indicators) return;

  const normalized = normalizeMediaItems(projects);

  filter.innerHTML = `<option value="all">All projects</option>`;

  normalized.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id || p.title;
    opt.textContent = p.title || "Untitled Project";
    filter.appendChild(opt);
  });

  const allMedia = normalized
    .filter((p) => (p.media || []).length)
    .map((p) => {
      const first = p.media[0];
      return {
        src: first.src,
        alt: first.alt || p.title,
        title: p.title,
        caption: p.short || p.description || "",
      };
    });

  if (hint) {
    hint.textContent = "Showing highlights from all projects.";
  }

  buildCarouselSlides(carouselInner, indicators, allMedia);

  const scrollToCarousel = () => {
    document
      .getElementById("vinleyProjectsCarousel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  filter.addEventListener("change", () => {
    const val = filter.value;

    if (val === "all") {
      if (hint) {
        hint.textContent = "Showing highlights from all projects.";
      }
      buildCarouselSlides(carouselInner, indicators, allMedia);
      scrollToCarousel();
      return;
    }

    const project = normalized.find((p) => (p.id || p.title) === val);

    const media = (project?.media || []).map((m) => ({
      src: m.src,
      alt: m.alt || project.title,
      title: project.title,
      caption: m.caption || project.short || project.description || "",
    }));

    if (hint) {
      hint.textContent = project
        ? `Showing media for: ${project.title}`
        : "Showing selected project.";
    }

    buildCarouselSlides(carouselInner, indicators, media);
    scrollToCarousel();
  });
}

boot().catch(showBootError);
