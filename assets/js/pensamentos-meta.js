// Adiciona dinamicamente meta tags e title em páginas de /pensamentos/
(function () {
	if (!location.pathname.includes("/pensamentos/")) return;
	var postTitle = document.querySelector(".post-titulo");
	var postText = document.querySelector(".post-texto p");
	var postImg = document.querySelector(".post-texto img");
	var postDate = document.querySelector(".post-data");
	if (!postTitle) return;

	// Atualiza o <title>
	document.title = postTitle.textContent.trim() + " · mozartsempiano";

	function setMeta(name, content, property) {
		var selector = property ? `meta[property='${property}']` : `meta[name='${name}']`;
		var meta = document.head.querySelector(selector);
		if (!meta) {
			meta = document.createElement("meta");
			if (property) meta.setAttribute("property", property);
			else meta.setAttribute("name", name);
			document.head.appendChild(meta);
		}
		meta.setAttribute("content", content);
	}

	// Descrição: primeiro parágrafo ou título
	var desc = postText ? postText.textContent.trim() : postTitle.textContent.trim();
	var url = location.origin + location.pathname;
	var siteName = "mozartsempiano";
	var img = postImg ? postImg.src : "/assets/img/favicon.png";
	var imgAlt = postImg ? postImg.alt || postTitle.textContent.trim() : siteName;
	var ogLocale = "pt_BR";
	var ogType = "article";
	var twitterCard = "summary_large_image";
	// Tenta pegar data ISO para article:published_time
	function parseDateToISO(dateStr) {
		if (!dateStr) return null;
		// Exemplo: "mai 22, 2023" ou "jul 4, 2020"
		var meses = { jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12" };
		var m = dateStr.match(/([a-zç]{3})\s(\d{1,2}),\s(\d{4})/i);
		if (!m) return null;
		var mes = meses[m[1].toLowerCase()] || "01";
		var dia = m[2].padStart(2, "0");
		var ano = m[3];
		return ano + "-" + mes + "-" + dia + "T00:00:00+00:00";
	}
	var publishedTime = postDate ? parseDateToISO(postDate.textContent.trim()) : null;

	// Open Graph
	setMeta(null, ogType, "og:type");
	setMeta(null, postTitle.textContent.trim(), "og:title");
	setMeta(null, url, "og:url");
	setMeta(null, desc, "og:description");
	setMeta(null, siteName, "og:site_name");
	setMeta(null, img, "og:image");
	setMeta(null, ogLocale, "og:locale");
	setMeta(null, imgAlt, "og:image:alt");
	// Tenta pegar dimensões da imagem
	if (postImg && postImg.naturalWidth && postImg.naturalHeight) {
		setMeta(null, postImg.naturalWidth, "og:image:width");
		setMeta(null, postImg.naturalHeight, "og:image:height");
	}
	if (publishedTime) setMeta(null, publishedTime, "article:published_time");
	// Twitter
	setMeta("twitter:text:title", postTitle.textContent.trim());
	setMeta("twitter:image", img);
	setMeta("twitter:card", twitterCard);
})();
