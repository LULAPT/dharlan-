(function () {
	var css = `
  :root {
    --tabs-left: 0px;
  }

  /* Make the wrapper participate in document flow so parent (.conteudo-inner)
     can control spacing with flex/gap. Default to relative so absolute children
     (if any) still work, but not absolutely positioning the wrapper itself. */
  .tabs-wrapper {
    position: relative;
    left: var(--tabs-left);
    z-index: 40;
    display: flex;
    justify-content: flex-start;
    max-width: 100%;
    overflow: visible;
  }

  .tab-buttons {
    display: flex;
    gap: 8px;
    background: var(--clr-black-a10);
    padding: 0.5em;
    border-radius: 0;
    border-width: 1px 1px 0 1px;
    border-style: solid;
    border-color: var(--clr-gray-a10);
    flex-direction: row;
    flex-wrap: wrap;
  }

  div.tabs-wrapper div.tab-buttons button {
    background: transparent;
    color: var(--clr-white);
    padding: 0.5em 1em;
    border-radius: 0;
    border-width: 1px;
    border-style: solid;
    border-color: var(--clr-gray-a30);
    transition: background 0.2s ease, border-color 0.2s ease;
    cursor: pointer;
	  font-family: inherit;
    text-transform: lowercase;
    font-size: 0.9rem;
  }

  div.tabs-wrapper div.tab-buttons button:hover {
    background: var(--clr-gray-a10);
    border-color: var(--clr-gray-a20);
  }

  div.tabs-wrapper div.tab-buttons button[aria-selected="true"] {
    background: var(--clr-main-a30);
    border-color: var(--clr-gray-a30);
  }

  /* When .conteudo-inner is a flex container you can use gap:0 to control
     spacing; tabs-wrapper now participates in flow so no sibling margin is needed. */

  @media (max-width: 770px) {
    .tab-buttons button { padding: 4px 8px }
    .tabs-placeholder { height: calc(var(--tabs-placeholder-height) * 0.8); }
    .tab-buttons {
      padding: 4px 8px;
      gap: 6px;
      overflow-x: scroll;
      overflow-y: hidden;
      flex-wrap: nowrap;
      scrollbar-width: none;
    }
  }

  `;

	var style = document.createElement("style");
	style.appendChild(document.createTextNode(css));
	document.head.appendChild(style);

	// Helper: debounce
	function debounce(fn, wait) {
		let t;
		return function () {
			clearTimeout(t);
			t = setTimeout(function () {
				try {
					fn();
				} catch (e) {
					/* swallow */
				}
			}, wait);
		};
	}

	// Placeholder/top calculation removed — the wrapper now participates in flow
	// and spacing is controlled by the page's layout (e.g., .conteudo-inner flex/gap).

	function activateTab(button) {
		if (!button) return;
		const tablist = button.closest(".tab-buttons");
		if (!tablist) return;

		const buttons = tablist.querySelectorAll('[role="tab"]');
		buttons.forEach((b) => b.setAttribute("aria-selected", "false"));

		const panels = document.querySelectorAll(".tab-panel");
		panels.forEach((p) => (p.style.display = "none"));

		button.setAttribute("aria-selected", "true");
		const target = button.dataset.tab;
		const panel = document.getElementById(target);
		if (panel) panel.style.display = "block";

		if (history && history.replaceState)
			history.replaceState(null, "", "#" + target);
	}

	function init() {
		// If the page doesn't include a .tabs-wrapper, allow dynamic creation via
		// a JSON config in a <script id="tabs-config" type="application/json">...</script>
		if (!document.querySelector(".tabs-wrapper")) {
			const cfgScript = document.getElementById("tabs-config");
			if (cfgScript) {
				try {
					const conf = JSON.parse(cfgScript.textContent);
					if (conf && Array.isArray(conf.tabs) && conf.tabs.length) {
						const wrapper = document.createElement("div");
						wrapper.className = "tabs-wrapper";
						if (conf.default)
							wrapper.setAttribute("data-default", conf.default);

						const tablist = document.createElement("div");
						tablist.className = "tab-buttons";
						tablist.setAttribute("role", "tablist");
						if (conf.label) tablist.setAttribute("aria-label", conf.label);

						conf.tabs.forEach((t) => {
							const btn = document.createElement("button");
							btn.type = "button";
							btn.setAttribute("role", "tab");
							const isDefault = conf.default && conf.default === t.id;
							btn.setAttribute("aria-selected", isDefault ? "true" : "false");
							btn.setAttribute("aria-controls", t.id);
							btn.dataset.tab = t.id;
							btn.textContent = t.label;
							tablist.appendChild(btn);
						});

						wrapper.appendChild(tablist);
						// insert before #col-centro if possible to match previous layout
						const colCentro = document.getElementById("col-centro");
						if (colCentro && colCentro.parentNode)
							colCentro.parentNode.insertBefore(wrapper, colCentro);
						else {
							const conteudo =
								document.getElementById("conteudo") || document.body;
							conteudo.insertBefore(wrapper, conteudo.firstChild);
						}
					}
				} catch (e) {
					// invalid JSON — fail silently
					console.error("tabs.js: invalid JSON in #tabs-config", e);
				}
			}
		}

		const tabButtons = document.querySelectorAll('.tab-buttons [role="tab"]');
		if (!tabButtons || tabButtons.length === 0) return;

		// No placeholder or automatic margin computation — layout is controlled
		// by `.conteudo-inner` (e.g., display:flex; gap:0). We leave the rest of
		// initialization (event handlers, activation) intact.

		tabButtons.forEach((btn) => {
			btn.addEventListener("click", function () {
				activateTab(btn);
			});
			btn.addEventListener("keydown", function (e) {
				if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
					e.preventDefault();
					const list = Array.from(tabButtons);
					const idx = list.indexOf(btn);
					const next =
						e.key === "ArrowRight"
							? (idx + 1) % list.length
							: (idx - 1 + list.length) % list.length;
					list[next].focus();
				}
			});
		});

		// activation order: hash -> container data-default -> first tab
		const hash = location.hash.replace("#", "");
		if (hash) {
			const b = document.querySelector(`.tab-buttons [data-tab="${hash}"]`);
			if (b) {
				activateTab(b);
				return;
			}
		}

		// look for a tab container with data-default attribute (points to data-tab value)
		const tabContainers = document.querySelectorAll(".tabs-wrapper");
		for (const wrapper of tabContainers) {
			const defaultName = wrapper.getAttribute("data-default");
			if (defaultName) {
				const b = wrapper.querySelector(
					`.tab-buttons [data-tab="${defaultName}"]`,
				);
				if (b) {
					activateTab(b);
					return;
				}
			}
		}

		// fallback: first tab
		const first = document.querySelector('.tab-buttons [role="tab"]');
		if (first) activateTab(first);
	}

	if (document.readyState === "loading")
		document.addEventListener("DOMContentLoaded", init);
	else init();
})();
