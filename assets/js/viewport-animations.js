// Para funcionar, adicionar:
// class="animate-on-scroll" data-animate="fade-in"

// Controle global das animações - mude para false para desativar
const ANIMATIONS_ENABLED = false;

export function setupViewportAnimations(options = {}) {
	if (!document) return;

	// Se as animações estão desabilitadas, aplica imediatamente todas as classes in-view
	if (!ANIMATIONS_ENABLED) {
		const elements = document.querySelectorAll(".animate-on-scroll");
		elements.forEach((el) => {
			el.style.opacity = "1";
			el.style.transform = "none";
			el.classList.add("in-view");
		});
		return;
	}

	// injeta CSS base + animações
	if (!document.getElementById("viewport-animations-style")) {
		const style = document.createElement("style");
		style.id = "viewport-animations-style";
		style.textContent = `
/* base: todos começam invisíveis */
.animate-on-scroll {
  opacity: 0;
  transition-property: opacity, transform;
  transition-duration: 0.8s;
  transition-timing-function: cubic-bezier(0.6, -0.28, 0.735, 0.045);
}

/* transform inicial por tipo */
.animate-on-scroll[data-animate="fade-in"] { transform: none; }
.animate-on-scroll[data-animate="slide-left"] { transform: translateX(-10px); }
.animate-on-scroll[data-animate="slide-right"] { transform: translateX(10px); }
.animate-on-scroll[data-animate="pop"] { transform: scale(0.85); opacity: 0; }

/* estado final */
.animate-on-scroll.in-view { opacity: 1; }

.animate-on-scroll.in-view[data-animate="fade-in"] { transform: none; }
.animate-on-scroll.in-view[data-animate="slide-left"] { transform: translateX(0); }
.animate-on-scroll.in-view[data-animate="slide-right"] { transform: translateX(0); }
.animate-on-scroll.in-view[data-animate="pop"] { transform: scale(1); opacity: 1; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s; }

/* remove transições para elementos já visíveis no load */
.animate-on-scroll.no-transition { transition: none !important; }

.animate-on-scroll[data-animate="fade-in-up"] { transform: translateY(8px); }
.animate-on-scroll.in-view[data-animate="fade-in-up"] { animation: fade-in-up-overshoot 0.8s ease-out forwards; }
@keyframes fade-in-up-overshoot {
  0% { opacity: 0; transform: translateY(12px); }
  70% { opacity: 1; transform: translateY(-2px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-on-scroll.in-view[data-animate="zoom-in"] { animation: zoom-in 1s forwards; }
@keyframes zoom-in {
  0% { opacity: 0; transform: scale(0.9); }
  70% { transform: scale(1.01); }
  100% { opacity: 1; transform: scale(1); }
}

.animate-on-scroll.in-view[data-animate="static"] { animation: static-noise 1s steps(6) forwards; }
@keyframes static-noise {
  0%   { opacity: 0; filter: blur(6px) contrast(150%); }
  30%  { opacity: 0.6; filter: blur(3px) contrast(200%); }
  60%  { opacity: 0.8; filter: blur(1px) contrast(120%); }
  100% { opacity: 1; filter: none; }
}

.animate-on-scroll.in-view[data-animate="desync"] { animation: desync-slide 0.7s ease-out forwards; }
@keyframes desync-slide {
  0%   { transform: translateX(-20px) skewX(5deg); opacity: 0; }
  40%  { transform: translateX(10px) skewX(-3deg); opacity: 0.8; }
  100% { transform: translateX(0) skewX(0); opacity: 1; }
}

.animate-on-scroll[data-animate="pixelate"] { opacity: 0; filter: url(#pixelate); transform: translateY(4px); }
.animate-on-scroll.in-view[data-animate="pixelate"] { animation: pixelate-in 0.9s forwards; }
@keyframes pixelate-in {
  0%   { filter: url(#pixelate); opacity: 0.5; transform: translateY(4px); }
  70% { transform: scale(1.01) translateY(-2px); }
  100% { filter: none; opacity: 1; transform: scale(1) translateY(0); }
}
`;
		document.head.appendChild(style);
	}

	// injeta filtro SVG de pixelate
	if (!document.getElementById("viewport-animations-svg")) {
		const svgNS = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(svgNS, "svg");
		svg.setAttribute("xmlns", svgNS);
		svg.setAttribute("style", "position:absolute; width:0; height:0; overflow:hidden;");
		svg.setAttribute("id", "viewport-animations-svg");

		svg.innerHTML = `
      <filter id="pixelate" x="0" y="0">
        <feFlood x="4" y="4" height="2" width="2"/>
        <feComposite width="10" height="10"/>
        <feTile/>
        <feComposite in="SourceGraphic" operator="in"/>
        <feMorphology operator="dilate" radius="2"/>
      </filter>
    `;

		document.body.appendChild(svg);
	}

	const defaults = {
		selector: ".animate-on-scroll",
		root: null,
		rootMargin: "0px",
		threshold: 0.1,
		cascade: false,
		cascadeDelay: 200,
		stagger: 115,
		once: true,
		defaultDuration: 1000,
	};

	const cfg = { ...defaults, ...options };

	const setTransitionDuration = (el, ms) => {
		if (!el) return;
		el.style.transitionDuration = (ms || cfg.defaultDuration) + "ms";
	};

	const applyInView = (el) => {
		if (!el || el.classList.contains("in-view")) return;
		el.style.willChange = "opacity, transform";
		requestAnimationFrame(() => el.classList.add("in-view"));
		const onEnd = (e) => {
			if (e && e.target !== el) return;
			el.style.willChange = "auto";
			el.removeEventListener("transitionend", onEnd);
		};
		el.addEventListener("transitionend", onEnd, { passive: true });
	};

	const clearTimer = (el) => {
		if (!el) return;
		if (el._va_timer) {
			clearTimeout(el._va_timer);
			delete el._va_timer;
		}
	};

	if ("IntersectionObserver" in window) {
		const observer = new IntersectionObserver(
			(entries) => {
				const entered = entries.filter((e) => e.isIntersecting).map((e) => e.target);
				if (entered.length === 0) {
					entries.forEach((entry) => {
						if (!entry.isIntersecting) {
							clearTimer(entry.target);
							if (cfg.cascade)
								Array.from(entry.target.children || []).forEach((c) => {
									if (c._va_timer) {
										clearTimeout(c._va_timer);
										delete c._va_timer;
									}
								});
						}
					});
					return;
				}

				entered.sort((a, b) => {
					if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING) return 1;
					return -1;
				});

				entered.forEach((el, idx) => {
					if (el.classList.contains("in-view")) return;

					clearTimer(el);

					const baseDelay = parseInt(el.dataset.delay, 10) || 0;
					const duration = parseInt(el.dataset.duration, 10) || cfg.defaultDuration + Math.random() * 200;
					setTransitionDuration(el, duration);

					const elementStagger = idx * cfg.stagger;
					if (cfg.cascade) {
						const children = Array.from(el.children);
						children.forEach((child, i) => {
							clearTimer(child);
							const childDelay = parseInt(child.dataset.delay, 10) || 0;
							const childDuration = parseInt(child.dataset.duration, 10) || duration;
							setTransitionDuration(child, childDuration);
							child._va_timer = setTimeout(() => {
								delete child._va_timer;
								applyInView(child);
							}, elementStagger + baseDelay + i * cfg.cascadeDelay + childDelay);
						});
					} else {
						el._va_timer = setTimeout(() => {
							delete el._va_timer;
							applyInView(el);
						}, elementStagger + baseDelay);
					}
				});

				if (cfg.once) {
					entered.forEach((el) => observer.unobserve(el));
				}
			},
			{ root: cfg.root, rootMargin: cfg.rootMargin, threshold: cfg.threshold }
		);

		const observeAll = () => {
			document.querySelectorAll(cfg.selector).forEach((n) => {
				if (n.classList.contains("in-view")) return;
				const rect = n.getBoundingClientRect();
				const alreadyVisible = rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
				if (alreadyVisible) {
					n.classList.add("no-transition");
				}
				observer.observe(n);
			});

			const already = Array.from(document.querySelectorAll(cfg.selector)).filter((n) => n.classList.contains("no-transition"));
			if (already.length) {
				already.sort((a, b) => {
					if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING) return 1;
					return -1;
				});
				already.forEach((el, idx) => {
					const delay = parseInt(el.dataset.delay, 10) || 0;
					const duration = parseInt(el.dataset.duration, 10) || cfg.defaultDuration;
					setTransitionDuration(el, duration);
					setTimeout(() => {
						el.classList.add("in-view");
						el.classList.remove("no-transition");
						if (cfg.once) observer.unobserve(el);
					}, idx * cfg.stagger + delay);
				});
			}
		};

		observeAll();

		let pending = false;
		const mo = new MutationObserver(() => {
			if (pending) return;
			pending = true;
			requestAnimationFrame(() => {
				observeAll();
				pending = false;
			});
		});
		mo.observe(document.documentElement, { childList: true, subtree: true });

		return;
	}

	const nodes = Array.from(document.querySelectorAll(cfg.selector));
	nodes.forEach((el, idx) => {
		const delay = parseInt(el.dataset.delay, 10) || 0;
		const duration = parseInt(el.dataset.duration, 10) || cfg.defaultDuration;
		setTransitionDuration(el, duration);
		setTimeout(() => applyInView(el), idx * cfg.stagger + delay + 60);
	});
}
