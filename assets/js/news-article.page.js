import { loadJSON } from "./components.js";

const errorMount = document.querySelector("[data-error]");
const titleEl = document.querySelector("[data-article-title]");
const categoryEl = document.querySelector("[data-article-category]");
const dateEl = document.querySelector("[data-article-date]");
const imageEl = document.querySelector("[data-article-image]");
const bodyEl = document.querySelector("[data-article-body]");
const relatedMount = document.querySelector("[data-related-news]");

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
  if (Number.isNaN(date.getTime())) return dateString || "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getArticleId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getNewsGlowClass(category) {
  const type = String(category || "").toLowerCase();

  if (
    type.includes("project") ||
    type.includes("engineering") ||
    type.includes("infrastructure")
  ) {
    return "svc-engineering";
  }

  if (
    type.includes("health") ||
    type.includes("medical") ||
    type.includes("compliance")
  ) {
    return "svc-medical";
  }

  if (
    type.includes("energy") ||
    type.includes("oil") ||
    type.includes("gas") ||
    type.includes("marine")
  ) {
    return "svc-energy";
  }

  return "svc-default";
}

function articleHref(id) {
  return `/news-article.html?id=${encodeURIComponent(id)}`;
}

function renderRelatedCard(item) {
  const glowClass = getNewsGlowClass(item.category);

  return `
    <article class="service-card premium-service-card premium-content-card news-card ${glowClass}">
      ${
        item.image
          ? `
        <div class="news-card-image-wrap">
          <img
            src="${escapeHtml(item.image)}"
            alt="${escapeHtml(item.title)}"
            class="news-card-image"
            loading="lazy"
          />
        </div>
      `
          : ""
      }

      <div class="service-card-top">
        <div class="service-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3h9l4 4v14H6z"></path>
            <path d="M15 3v5h5"></path>
            <path d="M9 13h6"></path>
            <path d="M9 17h4"></path>
          </svg>
        </div>
        <div class="service-heading">
          <h3>${escapeHtml(item.title)}</h3>
          <span class="service-kicker">${escapeHtml(item.category || "News")}</span>
        </div>
      </div>

      <p class="news-card-date">${escapeHtml(formatDate(item.date))}</p>
      <p>${escapeHtml(item.summary || "")}</p>

      <div class="premium-cta-row" style="margin-top: auto">
        <a class="btn premium-btn" href="${articleHref(item.id)}">Read More</a>
      </div>
    </article>
  `;
}

function renderArticle(article) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(article.title);

  document.getElementById("shareLinkedIn").href =
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;

  document.getElementById("shareTwitter").href =
    `https://twitter.com/intent/tweet?url=${url}&text=${title}`;

  document.getElementById("shareWhatsapp").href =
    `https://api.whatsapp.com/send?text=${title}%20${url}`;

  // SEO
  document.title = article.title;
  document.title = `${article.title} | Vinley Global Ltd`;

  if (titleEl) titleEl.textContent = article.title || "News Article";
  if (categoryEl) categoryEl.textContent = article.category || "News";
  if (dateEl) dateEl.textContent = formatDate(article.date);

  if (imageEl) {
    imageEl.src = article.image || "";
    imageEl.alt = article.title || "News article image";
  }

  if (bodyEl) {
    const paragraphs = Array.isArray(article.body) ? article.body : [];
    bodyEl.innerHTML = paragraphs
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
  }
}

function renderRelatedArticles(currentArticle, allItems) {
  if (!relatedMount) return;

  const related = allItems
    .filter((item) => item.id !== currentArticle.id)
    .sort((a, b) => {
      const sameCategoryA = a.category === currentArticle.category ? 1 : 0;
      const sameCategoryB = b.category === currentArticle.category ? 1 : 0;
      if (sameCategoryA !== sameCategoryB) return sameCategoryB - sameCategoryA;
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, 3);

  relatedMount.innerHTML = related.map(renderRelatedCard).join("");
}

async function initNewsArticlePage() {
  const articleId = getArticleId();

  if (!articleId) {
    if (errorMount) {
      errorMount.textContent = "Article not found.";
    }
    return;
  }

  try {
    const data = await loadJSON("/data/news.json");
    const items = Array.isArray(data?.items) ? data.items : [];
    const article = items.find((item) => item.id === articleId);

    if (!article) {
      if (errorMount) {
        errorMount.textContent = "Article not found.";
      }
      return;
    }

    renderArticle(article);
    renderRelatedArticles(article, items);
  } catch (error) {
    console.error("[VINLEY] News article load error:", error);
    if (errorMount) {
      errorMount.textContent =
        "Unable to load this article right now. Please try again later.";
    }
  }
}

initNewsArticlePage();
