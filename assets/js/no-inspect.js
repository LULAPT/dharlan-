// Bloqueia o menu de contexto e atalhos comuns de inspeção/visualização de
// código-fonte. Isso não impede de fato o acesso ao código: basta digitar
// view-source: na barra de endereço, desativar o JS ou abrir o DevTools
// pelo menu do navegador. Serve só como obstáculo pro usuário casual.
(function () {
	document.addEventListener(
		"contextmenu",
		function (e) {
			e.preventDefault();
			return false;
		},
		{ passive: false }
	);

	document.addEventListener(
		"keydown",
		function (event) {
			const key = event.key ? event.key.toUpperCase() : "";
			const isCtrlOrCmd = event.ctrlKey || event.metaKey;

			// F12: abre o DevTools
			const isF12 = event.keyCode === 123;
			// Ctrl/Cmd+Shift+I/J/C: DevTools (inspecionar, console, elementos)
			const isDevtoolsCombo =
				isCtrlOrCmd && event.shiftKey && ["I", "J", "C", "U"].includes(key);
			// Ctrl/Cmd+U: ver código-fonte da página
			const isViewSource = isCtrlOrCmd && !event.shiftKey && key === "U";

			if (isF12 || isDevtoolsCombo || isViewSource) {
				event.preventDefault();
				return false;
			}
		},
		{ passive: false, capture: false }
	);
})();
