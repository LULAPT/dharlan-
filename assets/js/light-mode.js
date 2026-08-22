export async function enableLightMode() {
	let themesConfig = [];
	try {
		const response = await fetch("/assets/json/themes.json");
		themesConfig = await response.json();
	} catch (e) {
		console.error("Erro ao carregar temas:", e);
	}

	const setThemeLogic = (themeName, config) => {
		const validThemes = config.map((t) => t.id);

		if (!validThemes.includes(themeName)) {
			console.warn(`Tema inválido: ${themeName}. Usando 'dark' como padrão.`);
			themeName = "dark";
		}

		if (themeName === "dark") {
			document.documentElement.removeAttribute("data-theme");
		} else {
			document.documentElement.setAttribute("data-theme", themeName);
		}
		localStorage.setItem("current-theme", themeName);
	};

	window.setTheme = (themeName) => setThemeLogic(themeName, themesConfig);
	window.toggleLightMode = (ligado) => {
		window.setTheme(ligado ? "light" : "dark");
	};
}
