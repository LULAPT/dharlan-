export function halloweenEffect() {
	const styleId = "halloween-style-js";
	// Remove old style if present
	const old = document.getElementById(styleId);
	if (old) old.remove();

	const style = document.createElement("style");
	style.id = styleId;
	// CSS inspired by the user's snippet — simplified and using emoji for the spider
	style.textContent = `
    /* Spider web images fixed to screen corners */
    .halloween-spider-web-01 {
      position: fixed;
      top: 0;
      right: 0;
      width: 380px;
      height: 300px;
      mask-image: url('/assets/img/halloween/spider_web_01.svg');
      -webkit-mask-image: url('/assets/img/halloween/spider_web_01.svg');
      mask-size: contain;
      -webkit-mask-size: contain;
      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;
      mask-position: top right;
      -webkit-mask-position: top right;
      pointer-events: none;
      z-index: 0;
    }
    
    .halloween-spider-web-02 {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 570px;
      height: 320px;
      mask-image: url('/assets/img/halloween/spider_web_02.svg');
      -webkit-mask-image: url('/assets/img/halloween/spider_web_02.svg');
      mask-size: contain;
      -webkit-mask-size: contain;
      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;
      mask-position: bottom left;
      -webkit-mask-position: bottom left;
      pointer-events: none;
      z-index: 0;
    }

    .halloween-web .web, .halloween-spider-web-01, .halloween-spider-web-02 {
      background-color: var(--clr-white);
      opacity: 0.7;
    }

    /* Simple spider-on-web effect (CSS-only animation) */
    .halloween-web {
      position: absolute;
      pointer-events: none;
      cursor: default;
      top: 0%;
      right: 6vw; /* align toward the right */
      width: 120px;
      height: 100vh;
      animation: spider-ride 6s linear infinite;
      animation-timing-function: cubic-bezier(.65,.30,.05,.90);
      z-index: 998;
    }
    .halloween-web .web {
      position: inherit;
      top: 0;
      left: 50%;
      width: 1px;
      height: 50%;
      transform: translateX(-50%);
      pointer-events: inherit;
    }
    /* the spider is a real element inside .web so it can be clicked and appears attached */
    .halloween-web .web .spider {
      position: inherit;
      top: 95%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 2.5rem;
      display: block;
      z-index: 2;
      user-select: none;
      cursor: default;
      pointer-events: inherit;
    }
    @keyframes spider-ride {
      0% { top: -40%; }
      50% { top: 0%; }
      100% { top: -40%; }
    }

    @media (max-width: 1024px) {
      .halloween-spider-web-01,
      .halloween-spider-web-02 {
        width: 400px;
        height: 170px;
      }
      
      .halloween-web {
        right: 4vw;
        width: 100px;
      }
      .halloween-web .web {
        width: 2px;
        height: 40%;
      }
      .halloween-web .web .spider {
        font-size: 2rem;
      }
    }

    @media (max-width: 770px) {
      .halloween-spider-web-01,
      .halloween-spider-web-02 {
        width: 100px;
        height: 100px;
      }
      
      .halloween-web {
        right: 2vw;
    }
  `;

	document.head.appendChild(style);

	// Create spider web images
	const spiderWeb01 = document.createElement("div");
	spiderWeb01.className = "halloween-spider-web-01";
	spiderWeb01.id = "halloween-spider-web-01";

	const spiderWeb02 = document.createElement("div");
	spiderWeb02.className = "halloween-spider-web-02";
	spiderWeb02.id = "halloween-spider-web-02";

	// Create container and web element (JS only adds elements)
	const container = document.createElement("div");
	container.className = "halloween-web";
	container.id = "halloween-container";

	const web = document.createElement("div");
	web.className = "web";
	// create a real spider element so it can receive events and animate with the web
	const spiderEl = document.createElement("div");
	spiderEl.className = "spider";
	spiderEl.textContent = "🕷️";
	web.appendChild(spiderEl);
	container.appendChild(web);

	// Add all elements to the page
	document.body.appendChild(spiderWeb01);
	document.body.appendChild(spiderWeb02);
	document.body.appendChild(container); // attach click handler directly to the spider element
	function onSpiderClick(e) {
		// small visual feedback: scale briefly
		spiderEl.animate([{ transform: "translateX(-50%) scale(1)" }, { transform: "translateX(-50%) scale(1.25)" }, { transform: "translateX(-50%) scale(1)" }], {
			duration: 450,
			easing: "ease-out",
		});
	}
	spiderEl.addEventListener("click", onSpiderClick);

	return function cleanupHalloween() {
		if (spiderWeb01.parentNode) spiderWeb01.parentNode.removeChild(spiderWeb01);
		if (spiderWeb02.parentNode) spiderWeb02.parentNode.removeChild(spiderWeb02);
		if (container.parentNode) container.parentNode.removeChild(container);
		const s = document.getElementById(styleId);
		if (s && s.parentNode) s.parentNode.removeChild(s);
	};
}
