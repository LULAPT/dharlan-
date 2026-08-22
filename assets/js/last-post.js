(function () {
  async function getLatestPost() {
    try {
      const res = await fetch("/assets/json/pensamentosposts.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("Falha ao carregar pensamentosposts.json");
      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) return null;
      // assumir que o arquivo já está ordenado do mais recente para o mais antigo, ou tomar o primeiro
      return posts[0];
    } catch (e) {
      console.error("Erro ao buscar último post:", e);
      return null;
    }
  }

  function renderLatest(post) {
    if (!post) return "<div>Sem postagens.</div>";
    const tags = (post.tags || []).map((t) => `<span class="tag">${t}</span>`).join(" ");
    // render date in a span so we can append the novo icon later
    return `
      <div class="ultimo-post">
        <div class="post-data"><span class="post-date-text">${post.data}</span></div>
        <div class="post-titulo"><a href="${post.url}" class="ultimo-titulo">${post.titulo}</a></div>
      </div>
    `;
  }

  // minimal date parsing / recent check (similar to updates logic)
  function parseDateFromString(str) {
    if (!str) return null;
    str = String(str).trim();
    const m = str.match(/(\d{2})\/(\d{2})\/(\d{2})/);
    if (m) {
      const dia = m[1];
      const mes = m[2];
      const ano = "20" + m[3];
      return new Date(`${ano}-${mes}-${dia}`);
    }
    // try Month name formats like 'mai 22, 2023'
    const m2 = str.toLowerCase().match(/^([a-zç]{3,})\s+(\d{1,2}),?\s*(\d{4})$/i);
    if (m2) {
      const months = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
      const mon = m2[1].slice(0, 3);
      const monthIdx = months[mon];
      const day = parseInt(m2[2], 10);
      const year = parseInt(m2[3], 10);
      if (monthIdx !== undefined) return new Date(year, monthIdx, day);
    }
    const parsed = Date.parse(str);
    return isNaN(parsed) ? null : new Date(parsed);
  }

  function isRecentDateString(dateStr, periodo = 14) {
    const d = parseDateFromString(dateStr);
    if (!d) return false;
    const hoje = new Date();
    d.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    const diffDias = (hoje - d) / (1000 * 60 * 60 * 24);
    return diffDias <= periodo;
  }

  function appendNovoIconTo(el) {
    if (!el || !el.parentNode) return;
    if (el.nextElementSibling && el.nextElementSibling.classList && el.nextElementSibling.classList.contains("novo-icone")) return;
    const space = document.createTextNode(" ");
    const novoIcone = document.createElement("span");
    novoIcone.className = "novo-icone img-clr-main";
    if (el.nextSibling) {
      el.parentNode.insertBefore(space, el.nextSibling);
      el.parentNode.insertBefore(novoIcone, space.nextSibling);
    } else {
      el.parentNode.appendChild(space);
      el.parentNode.appendChild(novoIcone);
    }
  }

  async function init() {
    const container = document.querySelector(".box.status .box-inner");
    if (!container) return;
    container.innerHTML = "Carregando...";
    const latest = await getLatestPost();
    container.innerHTML = renderLatest(latest);
    // after inserting, check if date is recent and append novo icon next to title/date
    try {
      const dateSpan = container.querySelector(".post-date-text");
      const titleLink = container.querySelector(".ultimo-titulo");
      if (dateSpan && isRecentDateString(dateSpan.textContent, 14)) {
        // only append the novo icon next to the date (not the title)
        appendNovoIconTo(dateSpan);
      }
    } catch (e) {
      /* ignore */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
