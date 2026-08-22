// Marca automaticamente sections com imagens com a tag 'imagens'
(function () {
	function marcarSectionsImagens() {
		document.querySelectorAll("section").forEach(function (section) {
			// Procura img que NÃO tenha classe 'banner' e está visível
			var hasImg = Array.from(section.querySelectorAll("img")).some(function (img) {
				var isBanner = img.classList.contains("banner");
				var isVisible = img.offsetParent !== null;
				return !isBanner && isVisible;
			});
			if (hasImg) {
				let tags = section.getAttribute("data-tags") || "";
				if (!tags.split(",").map((t) => t.trim()).includes("imagens")) {
					tags = tags ? tags + ", imagens" : "imagens";
					section.setAttribute("data-tags", tags.trim().replace(/\s*,\s*/g, ", "));
					console.log("[section-auto-imagens] Adicionada tag 'imagens' à section:", section);
				}
			}
		});
	}
	document.addEventListener("DOMContentLoaded", marcarSectionsImagens);
	window.addEventListener("load", marcarSectionsImagens);
})();
