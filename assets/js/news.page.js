import { loadJSON } from "./components.js";

const newsMount = document.querySelector("[data-news]");
const featuredMount = document.querySelector("[data-featured-news]");
const loadMoreMount = document.querySelector("[data-news-load-more]");
const errorMount = document.querySelector("[data-error]");
const filterEl = document.getElementById("newsFilter");
const searchEl = document.getElementById("newsSearch");
const hintEl = document.getElementById("newsFilterHint");

let allItems = [];
let filteredItems = [];
let visibleCount = 6;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function articleHref(id) {
  return `/news-article.html?id=${encodeURIComponent(id)}`;
}

function getNewsGlowClass(category) {
  const t = (category || "").toLowerCase();
  if (t.includes("project") || t.includes("engineering"))
    return "svc-engineering";
  if (t.includes("health") || t.includes("medical")) return "svc-medical";
  if (t.includes("energy") || t.includes("oil")) return "svc-energy";
  return "svc-default";
}

function renderFeatured(item) {
  if (!featuredMount || !item) return;

  featuredMount.innerHTML = `
    <article class="featured-news-card premium-service-card premium-content-card ${getNewsGlowClass(item.category)}">
      <div class="featured-news-media">
        <img src="${item.image}" class="featured-news-image" />
      </div>
      <div class="featured-news-content">
        <span class="section-eyebrow">Featured Story</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="news-card-date">
          ${formatDate(item.date)} • ${item.readTime || ""}
        </p>
        <p>${escapeHtml(item.summary)}</p>
        <a class="btn premium-btn" href="${articleHref(item.id)}">Read Featured Story</a>
      </div>
    </article>
  `;
}

function renderCard(item) {
  return `
    <article class="service-card premium-service-card premium-content-card news-card ${getNewsGlowClass(item.category)}">
      <div class="news-card-image-wrap">
        <img src="${item.image}" class="news-card-image" />
      </div>

      <div class="service-card-top">
        <div class="service-heading">
          <h3>${escapeHtml(item.title)}</h3>
          <span class="service-kicker">${escapeHtml(item.category)}</span>
        </div>
      </div>

      <p class="news-card-date">
        ${formatDate(item.date)} • ${item.readTime || ""}
      </p>

      <p>${escapeHtml(item.summary)}</p>

      <a class="btn premium-btn" href="${articleHref(item.id)}">Read More</a>
    </article>
  `;
}

function render() {
  const visible = filteredItems.slice(0, visibleCount);
  newsMount.innerHTML = visible.map(renderCard).join("");

  if (visibleCount < filteredItems.length) {
    loadMoreMount.innerHTML = `
      <button class="btn premium-btn" id="loadMoreBtn">Load More</button>
    `;

    document.getElementById("loadMoreBtn").onclick = () => {
      visibleCount += 6;
      render();
    };
  } else {
    loadMoreMount.innerHTML = "";
  }
}

function applyFilters() {
  const category = filterEl.value;
  const search = searchEl.value.toLowerCase();

  filteredItems = allItems.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const matchesSearch =
      item.title.toLowerCase().includes(search) ||
      item.summary.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  visibleCount = 6;
  render();
}

async function init() {
  try {
    const data = await loadJSON("/data/news.json");
    allItems = data.items.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderFeatured(allItems.find((i) => i.featured) || allItems[0]);

    // populate filter
    const cats = [...new Set(allItems.map((i) => i.category))];
    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      filterEl.appendChild(opt);
    });

    filteredItems = [...allItems];
    render();

    filterEl.onchange = applyFilters;
    searchEl.oninput = applyFilters;
  } catch (e) {
    errorMount.textContent = "Unable to load news.";
    console.error(e);
  }
}

init();
