// theme-loader.js — Carrega o tema antes da renderização para evitar flash
// Este código deve ser executado no <head> para evitar flash de tema padrão

(function () {
	const themeId = localStorage.getItem("current-theme");
	if (themeId && themeId !== "dark") {
		document.documentElement.setAttribute("data-theme", themeId);
	}
})();
