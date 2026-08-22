(function () {
	const themeId = localStorage.getItem("current-theme");
	if (themeId && themeId !== "dark") {
		document.documentElement.setAttribute("data-theme", themeId);
	}
})();
