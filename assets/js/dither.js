(function injectDither() {
	const css = `
.dither-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
  height: inherit;
  width: inherit;
  border-radius: inherit;
}
.dither-wrap.no-position {
  /* for special cases where the wrapper should not create a positioning context */
  position: unset !important;
}
.dither-wrap img.dither {
  display: inline-block;
  vertical-align: middle;
  border-radius: inherit;
}
.dither-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("/assets/img/bayer.png");
  background-size: .5em;
  opacity: .7;
  mix-blend-mode: multiply;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: -o-pixelated;
  image-rendering: pixelated;
  z-index: 2;
  filter: brightness(55%) contrast(2.75);
  mix-blend-mode: color-dodge;
  image-rendering: pixelated;
  border-radius: inherit !important;
}
.dither-contrast {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-color: transparent;
  z-index: 3;
  filter: brightness(85%) contrast(120%) saturate(120%);
  border-radius: inherit;
}
`.trim();

	const BAYER_8X8 = [
		[0, 32, 8, 40, 2, 34, 10, 42],
		[48, 16, 56, 24, 50, 18, 58, 26],
		[12, 44, 4, 36, 14, 46, 6, 38],
		[60, 28, 52, 20, 62, 30, 54, 22],
		[3, 35, 11, 43, 1, 33, 9, 41],
		[51, 19, 59, 27, 49, 17, 57, 25],
		[15, 47, 7, 39, 13, 45, 5, 37],
		[63, 31, 55, 23, 61, 29, 53, 21],
	];

	const DUOTONE_PALETTE = [
		{ r: 0xdc, g: 0xd6, b: 0xa8 },
		{ r: 0x1e, g: 0x1b, b: 0x21 },
	];

	function getLuminosity(r, g, b) {
		return 0.299 * r + 0.587 * g + 0.114 * b;
	}

	function applyBayerDither2Colors(imageData) {
		const pixels = imageData.data;
		const width = imageData.width;
		const height = imageData.height;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = (y * width + x) * 4;

				const r = pixels[i];
				const g = pixels[i + 1];
				const b = pixels[i + 2];

				const luminosity = getLuminosity(r, g, b);
				const threshold = BAYER_8X8[y % 8][x % 8];
				const normalizedThreshold = (threshold / 64) * 255;
				const color =
					luminosity > normalizedThreshold
						? DUOTONE_PALETTE[0]
						: DUOTONE_PALETTE[1];

				pixels[i] = color.r;
				pixels[i + 1] = color.g;
				pixels[i + 2] = color.b;
			}
		}

		return imageData;
	}

	function resizeImage(img) {
		let targetWidth = 317;

		try {
			const imgWidth = img.clientWidth || img.offsetWidth;
			if (imgWidth > 0) {
				targetWidth = Math.round(imgWidth);
			} else if (img.naturalWidth > 0) {
				targetWidth = img.naturalWidth;
			}
		} catch (e) {
			if (img.naturalWidth > 0) {
				targetWidth = img.naturalWidth;
			}
		}

		const aspectRatio = img.height / img.width;
		const targetHeight = Math.round(targetWidth * aspectRatio);

		const canvas = document.createElement("canvas");
		canvas.width = targetWidth;
		canvas.height = targetHeight;

		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

		return canvas;
	}

	async function processDuotoneDitheredImage(img) {
		return new Promise((resolve, reject) => {
			try {
				const canvas = resizeImage(img);
				const ctx = canvas.getContext("2d", { willReadFrequently: true });
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

				applyBayerDither2Colors(imageData);
				ctx.putImageData(imageData, 0, 0);

				canvas.toBlob((blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error("Falha ao criar blob"));
					}
				}, "image/png");
			} catch (error) {
				reject(error);
			}
		});
	}

	async function processDuotoneImages() {
		const images = document.querySelectorAll(
			"img.dither.duotone:not([data-duotone-processed])"
		);

		for (const img of images) {
			try {
				if (!img.complete) {
					await new Promise((resolve, reject) => {
						img.onload = resolve;
						img.onerror = () => reject(new Error("Falha ao carregar imagem"));
						setTimeout(
							() => reject(new Error("Timeout ao carregar imagem")),
							10000
						);
					});
				}

				if (img.naturalWidth === 0 || img.naturalHeight === 0) {
					throw new Error("Imagem sem dimensões válidas");
				}

				const ditherBlob = await processDuotoneDitheredImage(img);
				const ditherUrl = URL.createObjectURL(ditherBlob);

				img.src = ditherUrl;
				img.setAttribute("data-duotone-processed", "true");

				if (!img.style.width && !img.hasAttribute("width")) {
					img.style.width = "100%";
				}
				img.style.height = "auto";
			} catch (error) {
				console.error("Erro ao processar imagem duotone:", error);
				img.setAttribute("data-duotone-processed", "error");
				img.title = error.message;
			}
		}
	}

	function run() {
		const style = document.createElement("style");
		style.type = "text/css";
		style.appendChild(document.createTextNode(css));
		(document.head || document.documentElement).appendChild(style);

		const body = document.body || document.getElementsByTagName("body")[0];

		function wrapImage(img) {
			if (!img || img.closest(".dither-wrap")) return;
			const wrap = document.createElement("span");
			wrap.className = "dither-wrap";
			img.parentNode.insertBefore(wrap, img);
			wrap.appendChild(img);

			try {
				if (img.classList && img.classList.contains("dither-no-position")) {
					wrap.classList.add("no-position");
				}
				if (img.dataset && img.dataset.ditherNoPosition !== undefined) {
					wrap.classList.add("no-position");
				}
			} catch (e) {}

			try {
				const cs = window.getComputedStyle(img);
				const mt = cs.marginTop || "0px";
				const mr = cs.marginRight || "0px";
				const mb = cs.marginBottom || "0px";
				const ml = cs.marginLeft || "0px";
				if (mt !== "0px" || mr !== "0px" || mb !== "0px" || ml !== "0px") {
					wrap.style.margin = `${mt} ${mr} ${mb} ${ml}`;
					img.style.margin = "0";
				}
				const imgDisplay = cs.display || "";
				if (imgDisplay)
					wrap.style.display =
						imgDisplay === "block"
							? "block"
							: imgDisplay === "inline"
							? "inline"
							: "inline-block";
			} catch (e) {}

			const overlay = document.createElement("div");
			overlay.className = "dither-overlay";
			wrap.appendChild(overlay);

			const contrast = document.createElement("div");
			contrast.className = "dither-contrast";
			wrap.appendChild(contrast);

			function updateOverlay() {
				try {
					const cs = window.getComputedStyle(img);
					const bt = parseFloat(cs.borderTopWidth) || 0;
					const bl = parseFloat(cs.borderLeftWidth) || 0;
					const bb = parseFloat(cs.borderBottomWidth) || 0;
					const br = parseFloat(cs.borderRightWidth) || 0;

					const imgTop = img.offsetTop || 0;
					const imgLeft = img.offsetLeft || 0;

					overlay.style.top = imgTop + bt + "px";
					overlay.style.left = imgLeft + bl + "px";
					overlay.style.width = img.clientWidth + "px";
					overlay.style.height = img.clientHeight + "px";

					contrast.style.top = imgTop + bt + "px";
					contrast.style.left = imgLeft + bl + "px";
					contrast.style.width = img.clientWidth + "px";
					contrast.style.height = img.clientHeight + "px";

					overlay.style.borderRadius = cs.borderRadius || "";
					contrast.style.borderRadius = cs.borderRadius || "";

					overlay.style.inset = "";
					contrast.style.inset = "";
				} catch (e) {}
			}

			if (!img.complete) {
				img.addEventListener("load", updateOverlay, { once: true });
			}
			updateOverlay();

			let ro;
			if (window.ResizeObserver) {
				ro = new ResizeObserver(updateOverlay);
				try {
					ro.observe(img);
				} catch (e) {}
			}

			overlay._resizeObserver = ro;
			contrast._resizeObserver = ro;
			window.addEventListener("resize", updateOverlay);
		}

		Array.from(document.querySelectorAll("img.dither:not(.duotone)")).forEach(
			wrapImage
		);
		processDuotoneImages();
		const mo = new MutationObserver((records) => {
			let hasDuotoneChanges = false;
			for (const r of records) {
				if (r.type === "childList") {
					r.addedNodes.forEach((n) => {
						if (n.nodeType === 1) {
							if (n.matches && n.matches("img.dither:not(.duotone)"))
								wrapImage(n);
							if (n.querySelectorAll)
								n.querySelectorAll("img.dither:not(.duotone)").forEach(
									wrapImage
								);

							if (n.matches && n.matches("img.dither.duotone"))
								hasDuotoneChanges = true;
							if (
								n.querySelectorAll &&
								n.querySelectorAll("img.dither.duotone").length > 0
							)
								hasDuotoneChanges = true;
						}
					});
				} else if (
					r.type === "attributes" &&
					r.attributeName === "class" &&
					r.target.matches
				) {
					if (r.target.matches("img.dither:not(.duotone)")) {
						wrapImage(r.target);
					}
					if (r.target.matches("img.dither.duotone")) {
						hasDuotoneChanges = true;
					}
				}
			}

			if (hasDuotoneChanges) {
				processDuotoneImages();
			}
		});
		mo.observe(document.documentElement || document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["class"],
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run);
	} else {
		run();
	}
})();
