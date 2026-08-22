import sitemap from "./sitemap-data.js";

function createLink(item) {
  if (item.external) {
    return `<p><a href="${item.href}" target="_blank">${item.label}</a></p>`;
  }
  return `<p><a href="${item.href}">${item.label}</a></p>`;
}

function buildList(items, level) {
  if (!items || !items.length) return "";
  const cls = level === 1 ? "lvl1" : level === 2 ? "lvl2" : "lvl3";
  let html = `<ul class="${cls}">`;
  items.forEach((it) => {
    if (it.nopage) {
      html += `<li><span class="nopage">${it.label}</span></li>`;
      return;
    }

    if (it.items) {
      // group block (list of items without a parent link) — render each as li inside this level
      html += "";
      // render contained items as nested list at same level
      html += buildList(it.items, level + 1);
      return;
    }

    if (it.href && it.label) {
      html += `<li><a href="${it.href}">${it.label}</a></li>`;
      if (it.children) {
        html += buildList(it.children, level + 1);
      }
      return;
    }
  });
  html += `</ul>`;
  return html;
}

function renderSitemap() {
  const container = document.querySelector(".sitemap");
  if (!container) return;

  // clear existing content
  container.innerHTML = "";

  // top-level index
  const first = sitemap.find((s) => s.href && s.label && !s.group);
  if (first) container.innerHTML += createLink(first);

  // find the group with items
  const group = sitemap.find((s) => s.group && s.items);
  if (group) container.innerHTML += buildList(group.items, 1);

  // trailing external link (neocities)
  const ext = sitemap.find((s) => s.external);
  if (ext) container.innerHTML += createLink(ext);
}

// Run on DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderSitemap);
} else {
  renderSitemap();
}

export { renderSitemap };
