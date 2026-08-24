const PREVIEW_SIZES = [
	{ size: 32, status: "online" },
	{ size: 40, status: "busy" },
	{ size: 80, status: null },
	{ size: 40, status: "away" },
	{ size: 32, status: "offline" },
];

const dropzone = document.getElementById("avatar-dropzone");
const canvasWrap = document.getElementById("avatar-canvas-wrap");
const imageEl = document.getElementById("avatar-image");
const fileInput = document.getElementById("avatar-file-input");
const urlInput = document.getElementById("avatar-url-input");
const urlButton = document.getElementById("avatar-url-button");
const errorEl = document.getElementById("avatar-error");
const previewsEl = document.getElementById("avatar-previews");
const toolbar = document.getElementById("avatar-toolbar");
const openButton = document.getElementById("avatar-open-btn");
const downloadButton = document.getElementById("avatar-download-btn");

let cropper = null;
let objectUrl = null;
let currentFileName = "avatar";
let flipX = 1;
let flipY = 1;
let previewFrame = null;

function showError(message) {
	errorEl.textContent = message;
}

function clearError() {
	errorEl.textContent = "";
}

function buildPreviews() {
	previewsEl.innerHTML = "";

	PREVIEW_SIZES.forEach(({ size, status }) => {
		const wrapper = document.createElement("div");
		wrapper.className = "avatar-preview-item";
		wrapper.style.width = `${size}px`;
		wrapper.style.height = `${size}px`;

		const canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		canvas.dataset.size = String(size);
		wrapper.appendChild(canvas);

		if (status) {
			const dot = document.createElement("span");
			dot.className = `status-dot ${status}`;
			wrapper.appendChild(dot);
		}

		previewsEl.appendChild(wrapper);
	});
}

function updatePreviews() {
	if (previewFrame) return;

	previewFrame = requestAnimationFrame(() => {
		previewFrame = null;

		if (!cropper) return;

		previewsEl.querySelectorAll("canvas").forEach((canvas) => {
			const size = Number(canvas.dataset.size);
			const cropped = cropper.getCroppedCanvas({ width: size, height: size });
			const ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, size, size);
			if (cropped) ctx.drawImage(cropped, 0, 0, size, size);
		});
	});
}

function setLoadedState(loaded) {
	dropzone.classList.toggle("hidden", loaded);
	previewsEl.classList.toggle("hidden", !loaded);
	toolbar.classList.toggle("disabled", !loaded);
}

function initCropper(url) {
	clearError();

	if (cropper) {
		cropper.destroy();
		cropper = null;
	}

	imageEl.src = url;
	imageEl.style.display = "block";
	flipX = 1;
	flipY = 1;

	cropper = new Cropper(imageEl, {
		aspectRatio: 1,
		viewMode: 1,
		dragMode: "move",
		autoCropArea: 0.85,
		background: false,
		responsive: true,
		restore: false,
		movable: true,
		rotatable: true,
		scalable: true,
		zoomable: true,
		ready() {
			setLoadedState(true);
			updatePreviews();
		},
		crop() {
			updatePreviews();
		},
	});
}

function loadFromFile(file) {
	if (!file || !file.type || !file.type.startsWith("image/")) {
		showError("Isso não parece ser uma imagem.");
		return;
	}

	if (objectUrl) URL.revokeObjectURL(objectUrl);

	objectUrl = URL.createObjectURL(file);
	currentFileName = file.name ? file.name.replace(/\.[^.]+$/, "") : "avatar";
	initCropper(objectUrl);
}

async function loadFromUrl(url) {
	if (!url) return;

	clearError();

	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("network");

		const blob = await response.blob();
		if (!blob.type.startsWith("image/")) throw new Error("not-image");

		const name = new URL(url).pathname.split("/").pop() || "avatar";
		loadFromFile(new File([blob], name, { type: blob.type }));
	} catch (err) {
		showError(
			"Não consegui carregar essa URL. Pode ser bloqueio de CORS do servidor — tenta copiar a imagem e colar (Ctrl+V) em vez disso."
		);
	}
}

function download() {
	if (!cropper) return;

	const canvas = cropper.getCroppedCanvas();
	if (!canvas) return;

	// Usa toDataURL (síncrono) em vez de toBlob (assíncrono): o Chrome exige que
	// o clique no link de download aconteça dentro da mesma ativação do usuário,
	// e o callback assíncrono do toBlob pode perder essa janela e virar navegação
	// em vez de download (erro ERR_FILE_NOT_FOUND).
	const a = document.createElement("a");
	a.href = canvas.toDataURL("image/png");
	a.download = `${currentFileName}-cropped.png`;
	document.body.appendChild(a);
	a.click();
	a.remove();
}

function positionMaximize() {
	if (!cropper) return;

	const canvasData = cropper.getCanvasData();
	const size = Math.min(canvasData.width, canvasData.height);

	cropper.setCropBoxData({
		width: size,
		height: size,
		left: canvasData.left + (canvasData.width - size) / 2,
		top: canvasData.top + (canvasData.height - size) / 2,
	});
}

function positionCenter() {
	if (!cropper) return;

	const canvasData = cropper.getCanvasData();
	const cropBoxData = cropper.getCropBoxData();

	cropper.setCropBoxData({
		left: canvasData.left + (canvasData.width - cropBoxData.width) / 2,
		top: canvasData.top + (canvasData.height - cropBoxData.height) / 2,
	});
}

// --- Wiring ---

buildPreviews();

fileInput.addEventListener("change", (e) => {
	const file = e.target.files && e.target.files[0];
	loadFromFile(file);
	fileInput.value = "";
});

urlButton.addEventListener("click", () => loadFromUrl(urlInput.value.trim()));
urlInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter") loadFromUrl(urlInput.value.trim());
});

["dragenter", "dragover"].forEach((evt) => {
	canvasWrap.addEventListener(evt, (e) => {
		e.preventDefault();
		dropzone.classList.add("dragover");
	});
});

["dragleave", "drop"].forEach((evt) => {
	canvasWrap.addEventListener(evt, (e) => {
		e.preventDefault();
		dropzone.classList.remove("dragover");
	});
});

canvasWrap.addEventListener("drop", (e) => {
	const file = e.dataTransfer.files && e.dataTransfer.files[0];
	if (file) loadFromFile(file);
});

// Impede que o scroll do mouse sobre a área de corte (usado pelo Cropper.js
// pra dar zoom) seja capturado pelo smooth-scroll global do site, que rola
// a página inteira em cima do zoom. Precisa ser na fase de bubble (depois
// do próprio Cropper.js já ter recebido o evento), não na de capture.
canvasWrap.addEventListener("wheel", (e) => {
	e.stopPropagation();
});

window.addEventListener("paste", (e) => {
	const items = e.clipboardData && e.clipboardData.items;
	if (!items) return;

	for (const item of items) {
		if (item.type && item.type.startsWith("image/")) {
			loadFromFile(item.getAsFile());
			return;
		}
	}
});

openButton.addEventListener("click", () => fileInput.click());
downloadButton.addEventListener("click", download);

document.querySelectorAll("[data-action]").forEach((button) => {
	button.addEventListener("click", () => {
		if (!cropper) return;
		const action = button.dataset.action;

		switch (action) {
			case "rotate-left":
				cropper.rotate(-90);
				break;
			case "rotate-right":
				cropper.rotate(90);
				break;
			case "flip-horizontal":
				flipX *= -1;
				cropper.scaleX(flipX);
				break;
			case "flip-vertical":
				flipY *= -1;
				cropper.scaleY(flipY);
				break;
			case "zoom-in":
				cropper.zoom(0.1);
				break;
			case "zoom-out":
				cropper.zoom(-0.1);
				break;
			case "maximize":
				positionMaximize();
				break;
			case "center":
				positionCenter();
				break;
			case "reset":
				flipX = 1;
				flipY = 1;
				cropper.reset();
				break;
		}

		updatePreviews();
	});
});
