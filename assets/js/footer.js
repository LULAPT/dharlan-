import { setupViewportAnimations } from "/assets/js/viewport-animations.js";

export function carregarFooter() {
	if (window.DISABLE_CRT_TOGGLE) return;

	// Inicializa animações de scroll
	setupViewportAnimations({
		cascade: true,
		selector: ".animate-on-scroll", // seletor dos elementos que vão animar
	});

	const footer = document.querySelector("footer");
	const footer_index = document.getElementById("footer-index");
	const anoAtual = new Date().getFullYear();

	if (footer_index) {
		footer_index.innerHTML = `
    <div class="footer-conteudo" data-animate="fade-in-up">
      <div class="footer-direitos">
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#fff"><path d="M373.23-325.23h213.54v-95.96h-47.96v48H421.19v-213.62h117.62v48h47.96v-95.96H373.23v309.54Zm107.14 201.15q-73.43 0-138.34-27.82-64.92-27.83-113.66-76.6-48.73-48.77-76.51-113.51-27.78-64.74-27.78-138.36 0-73.69 27.82-138.1 27.83-64.42 76.6-113.16 48.77-48.73 113.51-76.51 64.74-27.78 138.36-27.78 73.69 0 138.1 27.82 64.42 27.83 113.16 76.6 48.73 48.77 76.51 113.28 27.78 64.51 27.78 137.85 0 73.43-27.82 138.34-27.83 64.92-76.6 113.66-48.77 48.73-113.28 76.51-64.51 27.78-137.85 27.78Zm-.38-47.96q127.89 0 217.93-90.02 90.04-90.03 90.04-217.93 0-127.89-90.02-217.93-90.03-90.04-217.93-90.04-127.89 0-217.93 90.02-90.04 90.03-90.04 217.93 0 127.89 90.02 217.93 90.03 90.04 217.93 90.04ZM480-480Z"/></svg>
        <span>${anoAtual} dharlan. Hospedado em <a href="/">Neocities</a></span>
      </div>
    </div>
    `;
		if (!document.getElementById("footer-style")) {
			const style = document.createElement("style");
			style.id = "footer-style";
			style.textContent = `
      footer#footer-index {
        background: transparent;
      }
      `;
			document.head.appendChild(style);
		}
	} else if (footer) {
		footer.innerHTML = `
      <div class="footer-conteudo" data-animate="fade-in-up">
        <div class="footer-coluna">
          <h2>
            <svg class="spin-icon" width="1em" height="1em" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="var(--clr-white)">
              <circle cx="100" cy="20" r="20" />
              <circle cx="170" cy="60" r="20" />
              <circle cx="170" cy="140" r="20" />
              <circle cx="100" cy="180" r="20" />
              <circle cx="30" cy="140" r="20" />
              <circle cx="30" cy="60" r="20" />
            </svg>
            <a id="home-link" href="/home/">dharlan</a> <small><a href="https://x.com/isatekk/" target="_blank" style="text-decoration: none">me</a></small>
          </h2>
          <p>Brasil, Terra — <time id="hora-brasilia"></time></p>
          <a href="/sitemap/">Sitemap</a>
          <br>
          <p>while self.location != recife.self.apt<br>self.location.freeRoaming(recife.streets,0)</p>
          <pre id="status-bottom">if(self.status != online)<br>self.status.connect()</pre>
        </div>
        <div class="footer-coluna">
          <h1>Tem uma ideia legal?</h1><h1 style="margin-top: 7px">Vamos conversar! d(^‿^)b</h1>
          <div class="footer-icons">
            <a href="mailto:dharlan20203@outlook.com" aria-label="E-mail" style="text-decoration: none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 -960 960 960">
                <path d="M90-169v-622h780v622H90Zm390-274.5L165-641v397h630v-397L480-443.5Zm0-75.5 314-197H166l314 197ZM165-641v-75 472-397Z"/>
              </svg>
              <span>dharlan20203@outlook.com</span>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-direitos">
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#fff"><path d="M373.23-325.23h213.54v-95.96h-47.96v48H421.19v-213.62h117.62v48h47.96v-95.96H373.23v309.54Zm107.14 201.15q-73.43 0-138.34-27.82-64.92-27.83-113.66-76.6-48.73-48.77-76.51-113.51-27.78-64.74-27.78-138.36 0-73.69 27.82-138.1 27.83-64.42 76.6-113.16 48.77-48.73 113.51-76.51 64.74-27.78 138.36-27.78 73.69 0 138.1 27.82 64.42 27.83 113.16 76.6 48.73 48.77 76.51 113.28 27.78 64.51 27.78 137.85 0 73.43-27.82 138.34-27.83 64.92-76.6 113.66-48.77 48.73-113.28 76.51-64.51 27.78-137.85 27.78Zm-.38-47.96q127.89 0 217.93-90.02 90.04-90.03 90.04-217.93 0-127.89-90.02-217.93-90.03-90.04-217.93-90.04-127.89 0-217.93 90.02-90.04 90.03-90.04 217.93 0 127.89 90.02 217.93 90.03 90.04 217.93 90.04ZM480-480Z"/></svg>
        <span>${anoAtual} dharlan. Hospedado em <a href="/">Neocities</a></span>
      </div>
    `;

		if (!document.getElementById("footer-style")) {
			const style = document.createElement("style");
			style.id = "footer-style";
			style.textContent = `
      footer {
        margin-top: 42px;
        padding: 24px 48px 32px 48px;
        background-color: var(--clr-black-a10);
      }
      
      footer::before {
        content: "";
        position: absolute;
        top: -60px;
        right: 0;
        width: 320px;
        height: 200px;
        background: inherit;
        clip-path: polygon(0 60px, 140px 0, 320px 0, 320px 320px, 0 320px);
        z-index: -1;
      }
      
      footer h1, footer h2, footer h3 {
        text-transform: lowercase;
        margin-bottom: 0em;
        font-family: var(--fonte-corpo);
        color: var(--clr-white);
        font-weight: normal;
        margin-top: 10px;
      }

      footer a#home-link {
        text-decoration: none;
        color: var(--clr-white);
      }

      footer a#home-link:hover {
        color: var(--clr-main-a30);
      }

      footer p:first-of-type {
        margin: 0 0 1em 0;
      }

      footer p:last-of-type {
        margin: 1em 0 0 0;
      }

      footer p {
        font-size: 1em;
      }

      footer pre#status-bottom {
        font-size: 0.94em;
        font-family: inherit;
        color: inherit;
        line-height: 1.4em;
      }

      :root[data-theme="light"] footer,
      :root[data-theme="light"] footer a:link,
      :root[data-theme="light"] footer a:visited,
      :root[data-theme="light"] footer a:active,
      :root[data-theme="light"] footer .footer-direitos {
        color: var(--clr-gray-a50)
      }

      .footer-conteudo {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        align-items: flex-start;
        width: 950px;
        gap: 1.2em;
        margin: 0 auto;
        text-align: left;
      }

      footer .footer-coluna {
        flex: 1 1 auto;
      }

      footer h1:not(:first-of-type) {
        margin-bottom: 0.8em;
      }

      footer #hora-brasilia {
        display: inline-flex;
        flex-wrap: nowrap;
        align-items: center;
        flex-direction: row;
        gap:0.1em;
      }

      footer .footer-fullwidth-text {
        margin-top: 1em;
        text-align: center;
        font-size: 1em;
      }

      footer .footer-fullwidth-text p {
        font-size: 5vw;
        margin:0;
        text-align:center;
        white-space:nowrap;
      }

      @media (max-width: 1024px) {
          footer::before {
            /* display: none; */
            top: -30px;
            right: -90px;
            height: 30px;
            clip-path: polygon(0 60px, 140px 0, 280px 0, 280px 320px, 0 320px);
          }
      }

      @media (max-width: 770px) {
          footer {
            padding: 24px 32px;
          }
          .footer-conteudo {
            flex-direction: column;
            gap: 1em;
            max-width: 100%;
          }
          footer h1 {
            font-size: 1.2em;
            margin-bottom: 0em;
          }
      }
      `;
			document.head.appendChild(style);
		}
	}

	const style = document.createElement("style");
	style.id = "footer-geral-style";
	style.textContent = `
      html, body {
        height: 100%;
        margin: 0;
      }

      #container {
        min-height: 100%;
        display: flex;
        flex-direction: column;
      }

      #conteudo {
        padding-bottom: 46px;
        flex: 0;
      }

      footer {
        font-size: 0.9rem;
        width: 100%;
        color: var(--clr-gray-a50);
        z-index: 1;
        position: relative;
      }

      footer h1,
      footer h2 {
        font-family: var(--fonte-corpo);
        color: var(--clr-white);
      }

      footer h2 {
        font-size: 1.3em;
        margin-bottom: 0.4em;
      }

      footer h1 {
        font-size: 1.6em;
        margin-bottom: 0em;
      }

      footer a:link,
      footer a:visited,
      footer a:active {
        color: var(--clr-gray-a50);
        text-decoration: underline;
        transition: all 0.25s ease;
        padding: 0;
      }

      footer a:hover {
        color: var(--clr-white);
        background-color: transparent;
      }

      .footer-icons {
        display: flex;
        gap: 14px;
        margin-top: 6px;
        align-items: center;
      }

      .footer-icons a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--clr-gray-a50);
      }

      .footer-icons a svg {
        display: inline-block;
        flex-shrink: 0;
        fill: currentColor;
        width: 20px;
        height: 20px;
      }

      footer p {
        margin: 0;
        margin-top: 6px;
      }

      footer .footer-direitos {
        margin-top: 2.7em;
        text-align: center;
        font-size: 1em;
        opacity: 1;
        color: var(--clr-gray-a40);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;      
      }

      footer .footer-direitos svg {
        fill: currentColor;
        width: 1em;
        height: 1em;
        min-width: 20px;
        min-height: 20px;
      }

      .spin-icon {
        display: inline-block;
        vertical-align: middle;
        animation: spin 6s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }

      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }

      .blinking-colon {
        display: inline-block;
        animation: blink 1s infinite;
      }
  `;
	document.head.appendChild(style);

	function atualizarHoraBrasilia() {
		const agora = new Date().toLocaleTimeString("pt-BR", {
			timeZone: "America/Sao_Paulo",
			hour: "2-digit",
			minute: "2-digit",
		});
		const timeElement = document.getElementById("hora-brasilia");
		if (timeElement) {
			const horaComAnimacao = agora.replace(
				/(:)/,
				'<span class="blinking-colon">$1</span>'
			);
			timeElement.innerHTML = horaComAnimacao;
		}
	}

	setInterval(atualizarHoraBrasilia, 1000);
	atualizarHoraBrasilia();
}
