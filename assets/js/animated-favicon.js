// Navegadores baseados em Chromium (e a maioria dos outros) só mostram o
// primeiro frame de um favicon .gif. Pra animar de verdade, desenhamos o
// próprio <img> (que anima normalmente na página) num canvas em intervalos
// e trocamos o href do <link rel="icon"> pelo snapshot atual.
export function animateFavicon(interval = 400) {
	const link = document.querySelector("link[rel='icon']");
	if (!link || !/\.gif($|\?)/i.test(link.href)) return;

	const originalSrc = link.href;
	const img = new Image();
	img.src = originalSrc;

	img.onload = () => {
		const canvas = document.createElement("canvas");
		canvas.width = img.naturalWidth || 32;
		canvas.height = img.naturalHeight || 32;
		const ctx = canvas.getContext("2d");

		let timer = null;
		const tick = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			link.href = canvas.toDataURL("image/png");
		};
		const start = () => {
			if (!timer) timer = setInterval(tick, interval);
		};
		const stop = () => {
			clearInterval(timer);
			timer = null;
		};

		document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				stop();
			} else {
				start();
			}
		});

		start();
	};
}
