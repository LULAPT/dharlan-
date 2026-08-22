(function () {
	// carregar dados de /assets/json/pensamentosposts.json e renderizar a lista
	async function loadPosts() {
		try {
			const resp = await fetch("/assets/json/pensamentosposts.json", {
				cache: "no-cache",
			});
			if (!resp.ok) throw new Error("Falha ao carregar posts");
			const posts = await resp.json();
			return posts;
		} catch (e) {
			console.error("Erro ao buscar pensamentos:", e);
			return [];
		}
	}

	function tagLinks(selectedTags) {
		return (tag) =>
			` <a href="#" class="tag-link${
				selectedTags.includes(tag) ? " tag-selected" : ""
			}" data-tag="${tag}">#${tag}</a>`;
	}

	// parse several date formats and determine if a date string is within `periodo` days
	function parseDateFromString(str) {
		if (!str) return null;
		str = String(str).trim();
		// YYYY-MM-DD
		if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str);
		// DD/MM/YY or DD/MM/YYYY
		const m1 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
		if (m1) {
			const day = parseInt(m1[1], 10);
			const month = parseInt(m1[2], 10);
			let year = parseInt(m1[3], 10);
			if (year < 100) year = 2000 + year;
			return new Date(year, month - 1, day);
		}
		// Month name formats like 'mai 22, 2023' (pt-BR short month names)
		const months = {
			jan: 0,
			fev: 1,
			mar: 2,
			abr: 3,
			mai: 4,
			jun: 5,
			jul: 6,
			ago: 7,
			set: 8,
			out: 9,
			nov: 10,
			dez: 11,
			// english abbreviations just in case
			jan_: 0,
			feb: 1,
			mar_: 2,
			apr: 3,
			may: 4,
			jun_: 5,
			jul_: 6,
			aug: 7,
			sep: 8,
			oct: 9,
			nov_: 10,
			dec: 11,
		};
		const m2 = str
			.toLowerCase()
			.match(/^([a-zç]{3,})\s+(\d{1,2}),?\s*(\d{4})$/i);
		if (m2) {
			const mon = m2[1].slice(0, 3);
			const monthIdx =
				months[mon] !== undefined ? months[mon] : months[mon + "_"];
			const day = parseInt(m2[2], 10);
			const year = parseInt(m2[3], 10);
			if (monthIdx !== undefined) return new Date(year, monthIdx, day);
		}
		// fallback to Date.parse
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

	function appendNovoIconAfter(el) {
		if (!el || !el.parentNode) return;
		// avoid duplicates: if next element sibling is already the novo icon, bail out
		if (
			el.nextElementSibling &&
			el.nextElementSibling.classList &&
			el.nextElementSibling.classList.contains("novo-icone")
		)
			return;
		const space = document.createTextNode(" ");
		const novoIcone = document.createElement("span");
		novoIcone.className = "novo-icone img-clr-main";
		// insert space and icon after the element
		if (el.nextSibling) {
			el.parentNode.insertBefore(space, el.nextSibling);
			el.parentNode.insertBefore(novoIcone, space.nextSibling);
		} else {
			el.parentNode.appendChild(space);
			el.parentNode.appendChild(novoIcone);
		}
	}

	function renderPensamentosTable(posts, selectedTags) {
		const linkFor = tagLinks(selectedTags);
		return `
      <div class="pensamentos">
        ${posts
					.map(
						(post) => `
            <div class="pensamento-item">
              <div class="postlist-content">
                <div class="postlist-t">
                  <a href="${post.url}" class="postlist-titulo">${
							post.titulo
						}</a>
                  <div class="postlist-data">${post.data}</div>
                </div>
                <div class="postlist-tags">
                  ${post.tags.map(linkFor).join(", ")}
                </div>
              </div>
            </div>
          `
					)
					.join("")}
      </div>
    `;
	}

	async function init() {
		const container = document.getElementById("pensamentos-list");
		if (container)
			container.innerHTML =
				'<div class="pensamentos-loading">Carregando postagens...</div>';

		const posts = await loadPosts();
		let selectedTags = [];

		function filterPosts() {
			if (selectedTags.length === 0) return posts;
			return posts.filter((post) =>
				selectedTags.every((tag) => post.tags.includes(tag))
			);
		}

		function render() {
			document.getElementById("pensamentos-list").innerHTML =
				renderPensamentosTable(filterPosts(), selectedTags);
			try {
				document.querySelectorAll(".pensamento-item").forEach((item) => {
					const dataEl = item.querySelector(".postlist-data");
					const titleEl = item.querySelector(".postlist-titulo");
					if (!dataEl || !titleEl) return;
					const dateText = dataEl.textContent.trim();
					if (isRecentDateString(dateText, 14)) {
						appendNovoIconAfter(titleEl);
					}
				});
			} catch (e) {
				/* ignore */
			}
			document.querySelectorAll(".tag-link").forEach((link) => {
				link.onclick = function (e) {
					e.preventDefault();
					const tag = this.getAttribute("data-tag");
					if (selectedTags.includes(tag)) {
						selectedTags = selectedTags.filter((t) => t !== tag);
					} else {
						selectedTags.push(tag);
					}
					render();
				};
			});
		}

		render();
	}

	// iniciar quando DOM estiver pronto
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
