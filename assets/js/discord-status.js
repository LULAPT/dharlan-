// discord-status.js
// Busca o status atual do Discord (via discorduserstatus-2-0.onrender.com) e
// atualiza a bolinha #discord-status-indicator na home.

(function () {
	var DISCORD_USER_ID = "682694935631233203";
	var STATUS_URL = "https://discorduserstatus-2-0.onrender.com/status/" + DISCORD_USER_ID;
	var POLL_MS = 60000; // 1 min

	var STATUS_MAP = {
		online: { cls: "verde", label: "Online" },
		idle: { cls: "amarelo", label: "Ausente" },
		dnd: { cls: "vermelho", label: "Não perturbe" },
	};
	var OFFLINE = { cls: "bw", label: "Offline" };

	function applyStatus(el, statusKey) {
		var info = STATUS_MAP[statusKey] || OFFLINE;

		el.classList.remove("verde", "amarelo", "vermelho", "bw");
		el.classList.add(info.cls);

		// Não usar el.title aqui: o site já converte o title inicial num
		// tooltip customizado (jquery.style-my-tooltips.js), que move o texto
		// pra data-smt-title e remove o atributo title. Se a gente voltar a
		// setar el.title depois, o tooltip nativo do navegador reaparece por
		// cima do customizado. Atualiza direto o data-smt-title em vez disso.
		var text = "Status do Discord: " + info.label;
		if (typeof el.dataset.smtTitle !== "undefined") {
			el.dataset.smtTitle = text;
		} else {
			el.title = text;
		}
	}

	function updateDiscordStatus() {
		var el = document.getElementById("discord-status-indicator");
		if (!el) return;

		fetch(STATUS_URL)
			.then(function (r) {
				if (!r.ok) throw new Error("Network response was not ok");
				return r.json();
			})
			.then(function (data) {
				applyStatus(el, data && data.status);
			})
			.catch(function (err) {
				console.error("Falha ao buscar status do Discord:", err);
				applyStatus(el, null);
			});
	}

	updateDiscordStatus();
	setInterval(updateDiscordStatus, POLL_MS);
})();
