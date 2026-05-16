async function loadPartial(selector, url) {
  const target = document.querySelector(selector);
  if (!target) return;

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  target.innerHTML = await res.text();
}

async function loadJSON(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

function setActiveNav() {
  const current = location.pathname.replace(/\/+$/, ""); // strip trailing slash
  document.querySelectorAll("nav a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    // normalize to path-only (ignore query/hash)
    const linkPath = new URL(href, location.origin).pathname.replace(
      /\/+$/,
      "",
    );
    if (linkPath === current) a.classList.add("active");
  });
}

function initNavToggle() {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  if (!nav || !toggle) return;

  const closeNav = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close only when the click is a REAL navigation (not dropdown toggle / not "#")
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    // 1) If it's the bootstrap dropdown toggle, DO NOT close
    if (a.matches("[data-bs-toggle='dropdown']")) {
      // For mobile: ensure click doesn't instantly navigate to "#"
      e.preventDefault();
      return;
    }

    // 2) If href is missing or "#", DO NOT close
    const href = (a.getAttribute("href") || "").trim();
    if (!href || href === "#") return;

    // Otherwise: normal link navigation -> close the panel
    closeNav();
  });
}

function initYear() {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initHeaderShadow() {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const onScroll = () => {
    header.style.boxShadow =
      window.scrollY > 8 ? "0 10px 30px rgba(0,0,0,.25)" : "none";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

export {
  loadPartial,
  loadJSON,
  setActiveNav,
  initNavToggle,
  initYear,
  initHeaderShadow,
};
