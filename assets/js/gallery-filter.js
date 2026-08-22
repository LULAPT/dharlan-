// Créditos do ícone da câmera: https://www.svgrepo.com/svg/478422/camera-9

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  :root {
    --padding-tag: 10px;
  }

  #modal-media video {
	: block;
	-width: 100%;
	-height: 70vh;
	: #000;
	: 0 auto;
	-index: 10;
  }

  .filter-gallery-content {
    position: relative;
	border-radius: inherit;
  }

  .filter-gallery-thumb {
    position: relative;
	border-radius: inherit;
  }

  .filter-gallery-thumb img {
    display: block;
    width: 100%;
	border-radius: inherit;
  }

  .media-count {
    position: absolute;
    top: var(--padding-tag);
    right: var(--padding-tag);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: calc(var(--b-radius) - var(--padding-tag));
    font-size: 0.8em;
    cursor: pointer;
    user-select: none;
    pointer-events: none;
  }

  .video-play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3em;
    cursor: pointer;
    user-select: none;
    pointer-events: none;
  }

  
#filter-gallery-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 6px; /* 10px vertical, 12px horizontal */
  align-items: center;
}

#filter-gallery-galeria {
  column-count: 3;
  column-gap: 10px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 0;
}

.filter-gallery-item {
  display: inline-block;
  width: 100%;
  margin: 0;
  background: transparent;
  box-sizing: border-box;
  break-inside: avoid;
  /* box-shadow: 0 2px 8px #0002; */
  border-radius: var(--b-radius);
}

.filter-gallery-item img {
  width: 100%;
  display: block;
  object-fit: cover;
  background: var(--clr-black-a0);
  margin-bottom: 4px;
}

.filter-gallery-tags {
  opacity: 0;
  transition: opacity 0.25s;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 0 0;
  position: absolute;
  bottom: 0;
  left: 0;
  padding: var(--padding-tag);
  width: 100%;
  background-image: linear-gradient(to top,
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0));
  pointer-events: none;
  border-radius: 0 0 var(--b-radius) var(--b-radius);
}

.filter-gallery-tags > * {
  pointer-events: auto;
}

.filter-gallery-item:hover .filter-gallery-tags {
  opacity: 1;
}

.filter-gallery-tag {
  background: var(--clr-gray-a10);
  color: var(--clr-white);
  border: 1px solid var(--clr-gray-a20);
  padding: 0.5em 0.75em;
  font-size: 0.9em;
  cursor: pointer;
  transition: background 0.25s, color 0.25s, opacity 0.25s;
  user-select: none;
  border-radius: calc(var(--b-radius) - var(--padding-tag));
}

.filter-gallery-tags .filter-gallery-tag {
  font-size: 0.84em;
  padding: 0.25em 0.6em;
}

.filter-gallery-tag.selected,
.filter-gallery-tag:hover {
  background: var(--clr-white);
  color: var(--clr-gray-a10);
  /* font-weight: 650; */
  opacity: 1;
}

#filter-gallery-galeria.col2 {
  column-count: 2 !important;
}
#filter-gallery-galeria.col1 {
  column-count: 1 !important;
}

.filter-gallery-item img {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.3s ease;
  z-index: 0;
  image-rendering: auto;
  border-radius: var(--b-radius);
}

.filter-gallery-item img:hover {
  z-index: 10;
  filter: saturate(0.6) brightness(0.8);
}

.image-info {
  width: 92%;
  margin-top: 16px;
  margin-left: 4px;
  background-color: transparent;
  color: var(--clr-white);
  font-size: 0.93em;
  word-break: break-word;
  text-align: left;
  display: none;
}

.image-info b {
  font-weight: 650;
  text-transform: uppercase;
}

/* Animações */
@keyframes modal-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes modal-fade-out-down {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes modal-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Estado inicial */
.modal {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s;
}

/* Modal visível */
.modal.modal-open {
  display: flex;
  opacity: 1;
  pointer-events: auto;
  animation: modal-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fade-out */
.modal.modal-closing {
  opacity: 0;
  pointer-events: none;
  animation: modal-fade-out 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Imagem do modal */
.modal.modal-open #modal-img {
  opacity: 0;
  animation: modal-fade-in-up 0.4s forwards;
}
.modal.modal-open #modal-sidebar {
  opacity: 0;
  animation: modal-fade-in-up 0.4s forwards;
  animation-delay: 0.14s;
}
.modal.modal-closing #modal-img,
.modal.modal-closing #modal-sidebar {
  opacity: 0;
  animation: modal-fade-out-down 0.4s forwards;
}

/* Imagem aberta */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  z-index: 999;
  flex-direction: row;
  margin: 0;
  box-sizing: border-box;
  font-size: 0.94rem;
}

.modal img {
  image-rendering: auto;
}

#modal-content {
  display: flex;
  gap: 21px;
  padding: 21px;
  justify-content: center;
  align-items: stretch; /* filhos ocupam toda altura disponível */
  max-width: 90vw;
  max-height: 78vh; /* limite total do modal */
  box-sizing: border-box;
  overflow: hidden;
}

/* Media ocupa 2/3 */
#modal-media {
  flex: 0 0 auto;
  max-width: 66.666%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: var(--b-radius);
}

#modal-media,
#modal-info,
.filter-gallery-content img {
  background-color: var(--clr-black-a0);
  border: var(--borda-padrao);
}

#modal-media img,
#modal-media iframe {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

#modal-media:has(.modal-media-caption) img,
#modal-media:has(.modal-media-caption) iframe {
  max-height: calc(100% - 2.7em);
}

#modal-media img {
  width: auto;
  height: auto;
}

/* Sidebar ocupa 1/3 */
#modal-sidebar {
  flex: 1 1 0;
  /* max-width: 33.333%; */
  max-width: 387px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  max-height: 78vh; /* limitar altura da sidebar */
  overflow-y: auto; /* permitir scroll interno se necessário */
}

/* Info e thumbs ocupam 100% da sidebar */
#modal-info,
#modal-thumbs {
  width: 100%;
  box-sizing: border-box;
}

#modal-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--clr-white);
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.4);
  padding: 20px 24px;
  font-size: 1.1em;
  cursor: default !important;
  overflow-y: auto;
  border-radius: var(--b-radius);
}

#modal-title {
  font-weight: normal;
  text-transform: uppercase;
  font-size: 1.25em;
}

.modal-type,
.modal-client {
  font-size: 0.9em;
  color: var(--clr-gray-a50);
}

#modal-desc:empty {
  display: none;
}

#modal-desc:empty ~ #modal-title {
  margin-bottom: 0;
}

#modal-desc {
  word-break: break-word;
  white-space: pre-line;
  background-color: transparent;
  border-top: 1px solid var(--clr-gray-a20);
  padding-top: 1em;
  margin-top: 4px;
  font-size: 1em;
  line-height: 1.45em;
  letter-spacing: 0.08em;
}

/* Thumbs */
#modal-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  justify-content: center;
  align-items: flex-start;
  flex-shrink: 0; /* não encolhe */
  max-height: none;
}

#modal-thumbs .modal-thumb {
  width: clamp(40px, 20%, 64px); /* se quiser responsivo */
  height: auto;
  aspect-ratio: 1 / 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  flex-shrink: 1; /* permite encolher se necessário */
  flex-grow: 0; /* não cresce além do tamanho definido */
  image-rendering: auto;
  user-select: none;
  overflow: hidden;
  background-color: var(--clr-gray-a10);
  box-shadow: inset 0 0 0 1px var(--clr-gray-a30);
  transition: border-color 0.2s ease;
  border-radius: var(--b-radius);
}

#modal-thumbs .modal-thumb:hover {
  box-shadow: inset 0 0 0 2px var(--clr-gray-a30);
}

#modal-thumbs .modal-thumb.selected {
  box-shadow: inset 0 0 0 2px var(--clr-main-a30);
}

.modal-media-caption {
  font-size: 0.85em;
  color: var(--clr-gray-a50);
  text-align: center;
  margin: 1em 0;
  cursor: default;
}

#modal-info:has(#modal-desc) .modal-camera,
#modal-info:has(.modal-type) .modal-camera,
#modal-info:has(#modal-desc) .modal-programs,
#modal-info:has(.modal-type) .modal-programs {
  margin-top: 0.5em;
}

.modal-camera {
  display: flex;
  align-items: center;
  font-size: 0.95em;
  color: var(--clr-gray-a50);
  gap: 0.7em;
}

.modal-camera > span {
  align-self: center;
}

.modal-programs {
  display: flex;
  gap: 0.7em;
  align-items: center;
  padding: 1em 0 0 0;
  border-top: 1px solid var(--clr-gray-a20);
}

.program-icon {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  background-color: currentColor;
  mask-repeat: no-repeat;
  mask-size: contain;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
  user-select: none;
  /* pointer-events: none; */
}

/* aplica o arquivo SVG usando o atributo data-icon-file */
.program-icon::before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  mask-image: attr(data-icon-file url);
  -webkit-mask-image: attr(data-icon-file url);
}

@media (max-width: 1240px) {
  #filter-gallery-galeria {
    column-count: 3 !important;
  }
}

@media (max-width: 1024px) {
  #filter-gallery-galeria {
    column-count: 2 !important;
  }
}

@media (max-width: 770px) {
  #filter-gallery-galeria {
    column-count: 1 !important;
  }

  #modal-content {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-height: 100vh;
    max-width: 100vh;
  }

  #modal-info {
    max-height: 280px;
  }

  #modal-media {
    max-width: 100vh;
    max-height: 50vh;
    width: 100%;
    aspect-ratio: 3/2;
  }

  #modal-sidebar {
    max-width: 100vh;
    width: 100%;
    max-height: none;
    overflow: visible;
  }

  #modal-thumbs .modal-thumb {
    width: 42px;
    height: 42px;
  }

  .modal {
    flex-direction: column;
    align-items: center;
    padding: 0 0 24px 0;
  }
  .modal img {
    /* max-width: 96vw;
    max-height: 40vh; */
    max-width: 100%;
    max-height: 100%;
    margin-right: 0;
    /* margin-bottom: 18px; */
  }
  #modal-info {
    max-width: 96vw;
    min-width: 0;
  }
}
`;
document.head.appendChild(styleSheet);

function applyTooltips(container) {
	container.querySelectorAll("[title]").forEach((el) => {
		const title = el.getAttribute("title");
		if (title) {
			el.dataset.smtTitle = title;
			el.removeAttribute("title");

			let tooltipTimeout;

			el.addEventListener("mouseenter", (e) => {
				tooltipTimeout = setTimeout(() => {
					const tooltip = document.getElementById("s-m-t-tooltip");
					if (tooltip) {
						const inner = tooltip.querySelector("div");
						if (inner) {
							inner.textContent = el.dataset.smtTitle;
							tooltip.style.display = "block";

							const updatePosition = (event) => {
								tooltip.style.left = `${event.pageX + 10}px`;
								tooltip.style.top = `${event.pageY + 10}px`;
							};

							updatePosition(e);
							el.addEventListener("mousemove", updatePosition);
							el._updatePosition = updatePosition;
						}
					}
				}, 0);
			});

			el.addEventListener("mouseleave", () => {
				clearTimeout(tooltipTimeout);
				const tooltip = document.getElementById("s-m-t-tooltip");
				if (tooltip) {
					tooltip.style.display = "none";
				}
				if (el._updatePosition) {
					el.removeEventListener("mousemove", el._updatePosition);
					delete el._updatePosition;
				}
			});
		}
	});
}

function setupGalleryFilter({
	items = [],
	filtrosId = "filter-gallery-filtros",
	galeriaId = "filter-gallery-galeria",
	modalId = "modal",
	getMedias = (d) => (d && d.medias) || [],
	getTitle = (d) => d && d.title,
	getYear = (d) => d && d.year,
	getType = (d) => d && d.type,
	getClient = (d) => d && d.client,
	getDesc = (d) => d && d.desc,
	getPrograms = (d) => d && d.programs,
	getTags = (d) => (d && d.tags) || [],
	getCamera = (d) => d && d.camera,
} = {}) {
	if (!Array.isArray(items)) items = [];

	// Combina tags originais com câmera e ano
	function getAllTagsForItem(item) {
		const tags = getTags(item) || [];
		const camera = getCamera(item);
		const year = getYear(item);

		const allItemTags = [...tags];
		if (camera) allItemTags.push(camera.toLowerCase());
		if (year) allItemTags.push(year.toString().toLowerCase());

		return allItemTags;
	}

	const allTags = Array.from(new Set(items.flatMap(getAllTagsForItem))).sort();
	let selectedTags = [];

	function renderFiltros() {
		const filtrosEl = document.getElementById(filtrosId);
		if (!filtrosEl) return;

		const iconeFiltro = false;
		let filtroIcone = "";

		if (iconeFiltro) {
			filtroIcone =
				'<div class="icone filter-icone" title="Tags" style="background-color: var(--clr-gray-a40)"></div>';
		}

		filtrosEl.innerHTML =
			filtroIcone +
			allTags
				.map(
					(tag) =>
						`<span class="filter-gallery-tag${
							selectedTags.includes(tag) ? " selected" : ""
						}" data-tag="${tag}">#${tag}</span>`
				)
				.join(" ");
		filtrosEl.querySelectorAll(".filter-gallery-tag").forEach((el) => {
			el.onclick = () => {
				const tag = el.getAttribute("data-tag");
				if (selectedTags.includes(tag))
					selectedTags = selectedTags.filter((t) => t !== tag);
				else selectedTags.push(tag);
				renderFiltros();
				renderGaleria();
			};
		});
	}

	function ajustarThumbs() {
		const info = modal.querySelector("#modal-info");
		const thumbs = modal.querySelector("#modal-thumbs");
		if (info && thumbs) {
			thumbs.style.maxWidth = `${info.offsetWidth}px`;
		}
	}

	function renderGaleria() {
		let filtered = items;
		if (selectedTags.length) {
			filtered = items.filter((d) => {
				const allItemTags = getAllTagsForItem(d);
				return selectedTags.every((tag) => allItemTags.includes(tag));
			});
		}

		const galeriaEl = document.getElementById(galeriaId);
		if (!galeriaEl) return;

		galeriaEl.innerHTML = filtered
			.map((d) => {
				const allItemTags = getAllTagsForItem(d);

				const tags = allItemTags
					.map(
						(tag) =>
							`<span class="filter-gallery-tag${
								selectedTags.includes(tag) ? " selected" : ""
							}" data-tag="${tag}">#${tag}</span>`
					)
					.join(" ");

				const medias = getMedias(d);
				// pega a primeira imagem, mesmo que seja thumbOnly
				const thumb = medias.find((m) => m.type === "image") || null;
				const thumbSrc = thumb ? thumb.src : "";
				const totalMedias = medias.filter((m) => !m.thumbOnly).length;

				// Mostra o botão de play se tiver uma thumbnail (primeira mídia como thumbOnly)
				// seguida de um vídeo na segunda posição
				const hasVideoWithThumb =
					medias[0]?.thumbOnly && medias[1]?.type === "video";

				let overlays = "";
				if (totalMedias > 1) {
					overlays += `<div class="media-count">${totalMedias} itens</div>`;
				}
				if (hasVideoWithThumb) {
					overlays += `<div class="video-play-icon">▶</div>`;
				}

				return `
          <div class="filter-gallery-item" tabindex="0">
            <div class="filter-gallery-content">
              <div class="filter-gallery-thumb">
                <img src="${thumbSrc}" alt="${getTitle(d) || ""}">
                ${overlays}
              </div>
              <div class="filter-gallery-tags">${tags}</div>
            </div>
          </div>`;
			})
			.join("");

		galeriaEl
			.querySelectorAll(".filter-gallery-item .filter-gallery-tag")
			.forEach((el) => {
				el.onclick = (e) => {
					e.stopPropagation();
					const tag = el.getAttribute("data-tag");
					if (selectedTags.includes(tag))
						selectedTags = selectedTags.filter((t) => t !== tag);
					else selectedTags.push(tag);
					renderFiltros();
					renderGaleria();
				};
			});

		galeriaEl.querySelectorAll(".filter-gallery-item").forEach((item, idx) => {
			item.onclick = () => {
				const d = filtered[idx];
				const modal = document.getElementById(modalId);
				if (!modal) return;

				const modalContent = modal.querySelector("#modal-content");
				const modalWrapper = modal.querySelector("#modal-wrapper");
				const modalInfo = modal.querySelector("#modal-info");
				const modalThumbs = modal.querySelector("#modal-thumbs");
				const modalMedia = modal.querySelector("#modal-media");

				function renderModalInfo(d) {
					modalInfo.innerHTML = "";

					const title = d.title && d.title.trim() ? d.title : "Sem título";
					const titleEl = document.createElement("div");
					titleEl.id = "modal-title";
					titleEl.className = "modal-title";
					titleEl.textContent = d.year ? `${title} / ${d.year}` : title;
					modalInfo.appendChild(titleEl);

					if (d.type) {
						const typeEl = document.createElement("div");
						typeEl.className = "modal-type";
						typeEl.textContent = d.type;
						modalInfo.appendChild(typeEl);
					}

					if (d.client) {
						const clientEl = document.createElement("div");
						clientEl.className = "modal-client";
						clientEl.textContent = `Cliente: ${d.client}`;
						modalInfo.appendChild(clientEl);
					}

					if (d.desc) {
						const descEl = document.createElement("div");
						descEl.id = "modal-desc";
						descEl.className = "modal-desc";
						descEl.innerHTML = d.desc.replace(/\n/g, "<br>");
						modalInfo.appendChild(descEl);
					}

					if (getCamera(d)) {
						const cameraEl = document.createElement("div");
						cameraEl.className = "modal-camera";

						const icon = document.createElement("span");
						icon.className = "icone camera-icone";
						icon.title = "Câmera utilizada";

						const text = document.createElement("span");
						text.textContent = getCamera(d);

						cameraEl.appendChild(icon);
						cameraEl.appendChild(text);
						modalInfo.appendChild(cameraEl);
					}

					if (d.programs && d.programs.length) {
						const programMap = {
							photoshop: {
								aliases: ["photoshop", "ps", "adobe photoshop"],
								cssClass: "icon-photoshop",
								title: "Adobe Photoshop",
							},
							illustrator: {
								aliases: ["illustrator", "ai", "adobe illustrator"],
								cssClass: "icon-illustrator",
								title: "Adobe Illustrator",
							},
							indesign: {
								aliases: ["indesign", "id", "adobe indesign"],
								cssClass: "icon-indesign",
								title: "Adobe InDesign",
							},
							"after-effects": {
								aliases: [
									"after",
									"after effects",
									"after-effects",
									"ae",
									"adobe after effects",
								],
								cssClass: "icon-after-effects",
								title: "Adobe After Effects",
							},
							premiere: {
								aliases: ["premiere", "premiere pro", "adobe premiere"],
								cssClass: "icon-premiere",
								title: "Adobe Premiere",
							},
							aseprite: {
								aliases: ["aseprite", "ap"],
								cssClass: "icon-aseprite",
								title: "Aseprite",
							},
							python: {
								aliases: ["python", "py"],
								cssClass: "icon-python",
								title: "Python",
							},
							javascript: {
								aliases: ["javascript", "js"],
								cssClass: "icon-javascript",
								title: "JavaScript",
							},
							css: {
								aliases: ["css"],
								cssClass: "icon-css",
								title: "CSS",
							},
						};

						const programsEl = document.createElement("div");
						programsEl.className = "modal-programs";

						d.programs.forEach((p) => {
							const key = Object.keys(programMap).find((k) =>
								programMap[k].aliases.includes(p.toLowerCase())
							);
							if (!key) return;

							const prog = programMap[key];
							const span = document.createElement("span");
							span.className = `program-icon ${prog.cssClass}`;
							span.title = prog.title;

							programsEl.appendChild(span);
						});

						modalInfo.appendChild(programsEl);
					}

					applyTooltips(modalInfo);
				}

				const medias = getMedias(d);
				const firstIdx = medias.findIndex((m) => !m.thumbOnly);
				const defaultIdx = firstIdx !== -1 ? firstIdx : 0;

				function renderModalMedia(idx) {
					modalMedia.innerHTML = "";
					const m = medias[idx];
					if (!m) return;

					if (m.type === "image") {
						const img = document.createElement("img");
						img.src = m.src;
						modalMedia.appendChild(img);
					} else if (m.type === "video") {
						if (m.src.endsWith(".mp4")) {
							const video = document.createElement("video");
							video.controls = true;
							video.style.maxWidth = "100%";
							video.style.maxHeight = "70vh";
							video.setAttribute("playsinline", "");
							video.setAttribute("muted", "");
							video.setAttribute("loop", "");
							video.volume = 0.25;
							const source = document.createElement("source");
							source.src = m.src;
							source.type = "video/mp4";
							video.appendChild(source);
							modalMedia.appendChild(video);
						} else {
							const embedUrl = getVideoEmbedUrl(m.src);
							if (embedUrl) {
								const iframe = document.createElement("iframe");
								iframe.width = 681;
								iframe.height = 512;
								iframe.style.border = "none";
								iframe.allow = "autoplay; encrypted-media";
								iframe.src = embedUrl;
								modalMedia.appendChild(iframe);
							}
						}
					}

					if (m.caption) {
						const captionEl = document.createElement("div");
						captionEl.className = "modal-media-caption";
						captionEl.textContent = m.caption;
						modalMedia.appendChild(captionEl);
					}
				}

				function renderModalThumbs(initialIdx = 0) {
					modalThumbs.innerHTML = "";

					const videoIdx = medias.findIndex((m) => m.type === "video");

					medias.forEach((m, i) => {
						if (m.type === "image" && !m.thumbOnly) {
							const thumb = document.createElement("div");
							thumb.className = "modal-thumb";
							thumb.style.backgroundImage = `url("${m.src}")`;

							thumb.onclick = (ev) => {
								ev.stopPropagation();
								renderModalMedia(i);
								modalThumbs
									.querySelectorAll(".modal-thumb")
									.forEach((el) => el.classList.remove("selected"));
								thumb.classList.add("selected");
							};

							if (i === initialIdx) thumb.classList.add("selected");
							modalThumbs.appendChild(thumb);
						}

						if (m.thumbOnly && videoIdx !== -1) {
							const thumb = document.createElement("div");
							thumb.className = "modal-thumb video-thumb";
							thumb.style.backgroundImage = `url("${m.src}")`;

							thumb.onclick = (ev) => {
								ev.stopPropagation();
								renderModalMedia(videoIdx);
								modalThumbs
									.querySelectorAll(".modal-thumb")
									.forEach((el) => el.classList.remove("selected"));
								thumb.classList.add("selected");
							};

							if (initialIdx === 0) thumb.classList.add("selected");
							modalThumbs.appendChild(thumb);
						}
					});

					ajustarThumbs();
				}

				renderModalInfo(d);
				renderModalMedia(defaultIdx);
				renderModalThumbs();

				modal.classList.remove("modal-closing");
				modal.style.display = "flex";
				void modal.offsetWidth;
				modal.classList.add("modal-open");
				document.body.style.overflow = "hidden";
			};
		});
	}

	renderFiltros();
	renderGaleria();

	const galeriaEl = document.getElementById(galeriaId);
	if (galeriaEl) applyTooltips(galeriaEl);

	function closeModal(modalId) {
		const modal = document.getElementById(modalId);
		if (!modal) return;

		const iframes = modal.querySelectorAll("iframe");
		iframes.forEach((iframe) => (iframe.src = ""));

		modal.classList.remove("modal-open");
		modal.classList.add("modal-closing");

		setTimeout(() => {
			modal.style.display = "none";
			modal.classList.remove("modal-closing");
			document.body.style.overflow = "";
			const crtBtn = document.getElementById("toggleClassBtn");
			if (crtBtn) crtBtn.style.display = "";
		}, 300);
	}

	function getVideoEmbedUrl(url) {
		try {
			if (url.includes("youtube.com") || url.includes("youtu.be")) {
				const match = url.match(/(?:v=|\.be\/)([^&?/]+)/);
				if (match && match[1])
					return `https://www.youtube.com/embed/${match[1]}`;
			}
			if (url.includes("drive.google.com")) {
				const match = url.match(/\/d\/([^/]+)\//);
				if (match && match[1])
					return `https://drive.google.com/file/d/${match[1]}/preview`;
			}
			return null;
		} catch (e) {
			return null;
		}
	}

	const modal = document.getElementById(modalId);
	if (modal) {
		modal.addEventListener("click", (e) => {
			const info = modal.querySelector("#modal-info");
			const thumbs = modal.querySelectorAll(".modal-thumb");
			const clicouThumb = Array.from(thumbs).some((t) => t.contains(e.target));
			if (!info.contains(e.target) && !clicouThumb) {
				closeModal(modalId);
			}
		});
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && modal.classList.contains("modal-open"))
				closeModal(modalId);
		});
	}

	modal.addEventListener("transitionend", () => {
		ajustarThumbs();
	});

	window.addEventListener("resize", () => {
		if (modal.classList.contains("modal-open")) {
			ajustarThumbs();
		}
	});
}
