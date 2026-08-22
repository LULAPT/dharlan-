/* sketchbook-book.js
   Simple, robust viewer for sketchbook pages.
   - Pages in `window.paginasSketchbook` are objects: { img, title, desc, single }
   - `single: true` means a single-page spread (cover or back cover). These are shown
     as a single image on the right (cover) or on the left (back cover) depending on
     whether it's first or last item.
   - If `single` is omitted or false, the item is treated as a double-image (two pages
     scanned as a single image). We display that whole image on the right side so
     it looks like a spread without attempting to split it.
*/
(function () {
  function onDOMReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(fn, 0);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function waitForPaginas(timeout = 3000, interval = 50) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function check() {
        if (window.paginasSketchbook && Array.isArray(window.paginasSketchbook) && window.paginasSketchbook.length) {
          return resolve(window.paginasSketchbook);
        }
        if (Date.now() - start > timeout) return reject(new Error("timeout: paginasSketchbook não definida"));
        setTimeout(check, interval);
      })();
    });
  }

  onDOMReady(() => {
    waitForPaginas(3000, 50)
      .then((paginas) => initBook(paginas))
      .catch((err) => {
        console.error("O array paginasSketchbook não está definido!", err);
        const container = document.getElementById("book-container");
        if (container) container.innerHTML = '<p style="color:#777">Nenhuma página disponível.</p>';
      });
  });

  function initBook(paginas) {
    let paginaAtual = 0;

    const container = document.getElementById("book-container");
    if (!container) {
      console.error("Elemento #book-container não encontrado.");
      return;
    }
    const leftDiv = container.querySelector(".page-left");
    const rightDiv = container.querySelector(".page-right");
    const titleEl = document.getElementById("sketchbook-title");
    const descEl = document.getElementById("sketchbook-desc");
    const pageNumEl = document.getElementById("page-num");
    const btnPrev = document.getElementById("prev-page");
    const btnNext = document.getElementById("next-page");
    const bookEl = container.querySelector(".book");

    if (!leftDiv || !rightDiv || !pageNumEl || !btnPrev || !btnNext) {
      console.error("Estrutura do livro incompleta (page-left/page-right/controls). Use o markup esperado.");
      return;
    }

    function normalize(item) {
      if (!item) return { type: "empty" };
      // Pair: two singles for left/right
      if (item.left || item.right || item.type === "pair") {
        return {
          type: "pair",
          left: item.left || item.imgLeft || item.leftImg || "",
          right: item.right || item.imgRight || item.rightImg || item.right || "",
          title: item.title || "",
          desc: item.desc || "",
        };
      }
      // If explicitly marked as single (cover/back)
      if (item.single || item.type === "single") {
        return { type: "single", src: item.img || item.src || "", title: item.title || "", desc: item.desc || "" };
      }
      // Default: treat as double-image spread
      return { type: "double", src: item.img || item.src || "", title: item.title || "", desc: item.desc || "" };
    }

    function applyStyle(div, src, options = {}) {
      if (!div) return;
      if (!src) {
        div.style.backgroundImage = "";
        div.style.visibility = "hidden";
        return;
      }
      // Wrap URL and encode spaces
      try {
        const safe = encodeURI(src);
        div.style.backgroundImage = `url("${safe}")`;
      } catch (e) {
        div.style.backgroundImage = `url("${src}")`;
      }
      div.style.backgroundRepeat = options.repeat || "no-repeat";
      if (options.size) div.style.backgroundSize = options.size;
      else div.style.backgroundSize = "contain";
      div.style.backgroundPosition = options.position || "center";
      div.style.visibility = "visible";
    }

    function renderPage(index) {
      if (!Array.isArray(paginas) || paginas.length === 0) return;

      if (index < 0) index = 0;
      if (index > paginas.length - 1) index = paginas.length - 1;

      paginaAtual = index;
      const current = normalize(paginas[paginaAtual]);

      // Default: hide both and reset display/flex and classes
      applyStyle(leftDiv, "");
      applyStyle(rightDiv, "");
      leftDiv.style.display = "";
      rightDiv.style.display = "";
      leftDiv.style.flex = "1 1 50%";
      rightDiv.style.flex = "1 1 50%";
      leftDiv.classList.remove("single", "double", "empty", "side-left", "side-right");
      rightDiv.classList.remove("single", "double", "empty", "side-left", "side-right");
      // remove book-level markers (used as a JS fallback for browsers without :has)
      if (bookEl) bookEl.classList.remove("unaccompanied-left", "unaccompanied-right");

      // Handle by type
      if (current.type === "pair") {
        // Two single images: left and/or right
        const hasLeft = !!current.left;
        const hasRight = !!current.right;
        if (hasLeft && hasRight) {
          // normal two-page spread (each a single image)
          leftDiv.style.display = "";
          rightDiv.style.display = "";
          leftDiv.style.flex = "1 1 50%";
          rightDiv.style.flex = "1 1 50%";
          leftDiv.classList.add("single", "side-left");
          rightDiv.classList.add("single", "side-right");
          // both sides present -> clear empty markers and book flags
          leftDiv.classList.remove("empty");
          rightDiv.classList.remove("empty");
          if (bookEl) bookEl.classList.remove("unaccompanied-left", "unaccompanied-right");
          applyStyle(leftDiv, current.left, { size: "contain", position: "center" });
          applyStyle(rightDiv, current.right, { size: "contain", position: "center" });
        } else if (hasLeft && !hasRight) {
          // only left present -> show left full width
          rightDiv.style.display = "none";
          leftDiv.style.display = "block";
          leftDiv.style.flex = "1 1 100%";
          leftDiv.classList.add("single", "side-left");
          // mark the absent right side as empty and mark book as unaccompanied-left
          rightDiv.classList.add("empty");
          leftDiv.classList.remove("empty");
          if (bookEl) bookEl.classList.add("unaccompanied-left");
          applyStyle(leftDiv, current.left, { size: "contain", position: "center" });
        } else if (!hasLeft && hasRight) {
          // only right present -> show right full width
          leftDiv.style.display = "none";
          rightDiv.style.display = "block";
          rightDiv.style.flex = "1 1 100%";
          rightDiv.classList.add("single", "side-right");
          // mark the absent left side as empty and mark book as unaccompanied-right
          leftDiv.classList.add("empty");
          rightDiv.classList.remove("empty");
          if (bookEl) bookEl.classList.add("unaccompanied-right");
          applyStyle(rightDiv, current.right, { size: "contain", position: "center" });
        } else {
          // neither present
          applyStyle(leftDiv, "");
          applyStyle(rightDiv, "");
        }
      } else if (current.type === "single") {
        // Single page: determine if first (cover) -> right only, last (contracapa) -> left only
        if (paginaAtual === 0) {
          // cover: show only on right (full width)
          leftDiv.style.display = "none";
          rightDiv.style.display = "block";
          rightDiv.style.flex = "1 1 100%";
          rightDiv.classList.add("single", "side-right");
          // cover: left is absent
          leftDiv.classList.add("empty");
          rightDiv.classList.remove("empty");
          if (bookEl) bookEl.classList.add("unaccompanied-right");
          applyStyle(rightDiv, current.src, { size: "contain", position: "center" });
        } else if (paginaAtual === paginas.length - 1) {
          // contracapa: show only on left (full width)
          rightDiv.style.display = "none";
          leftDiv.style.display = "block";
          leftDiv.style.flex = "1 1 100%";
          leftDiv.classList.add("single", "side-left");
          // contracapa: right is absent
          rightDiv.classList.add("empty");
          leftDiv.classList.remove("empty");
          if (bookEl) bookEl.classList.add("unaccompanied-left");
          applyStyle(leftDiv, current.src, { size: "contain", position: "center" });
        } else {
          // Treat as right-only by default
          leftDiv.style.display = "none";
          rightDiv.style.display = "block";
          rightDiv.style.flex = "1 1 100%";
          rightDiv.classList.add("single", "side-right");
          // left absent in this middle single case
          leftDiv.classList.add("empty");
          rightDiv.classList.remove("empty");
          if (bookEl) bookEl.classList.add("unaccompanied-right");
          applyStyle(rightDiv, current.src, { size: "contain", position: "center" });
        }
      } else if (current.type === "double") {
        // Double-image spread: split the same image across left & right
        const size = "200% 100%";
        leftDiv.classList.add("double", "side-left");
        rightDiv.classList.add("double", "side-right");
        applyStyle(leftDiv, current.src, { size, position: "left center" });
        applyStyle(rightDiv, current.src, { size, position: "right center" });
      } else {
        // empty or unknown
        leftDiv.classList.add("empty");
        rightDiv.classList.add("empty");
        applyStyle(leftDiv, "");
        applyStyle(rightDiv, "");
      }

      if (titleEl) titleEl.textContent = current.title || "";
      if (descEl) descEl.textContent = current.desc || "";
      pageNumEl.textContent = `${paginaAtual + 1} / ${paginas.length}`;

      btnPrev.disabled = paginaAtual === 0;
      btnNext.disabled = paginaAtual >= paginas.length - 1;
    }

    function goTo(delta) {
      let target = paginaAtual + delta;
      if (target < 0) target = 0;
      if (target > paginas.length - 1) target = paginas.length - 1;
      if (target === paginaAtual) return;

      renderPage(target);
      preload(target - 1);
      preload(target + 1);
    }

    btnPrev.addEventListener("click", () => goTo(-1));
    btnNext.addEventListener("click", () => goTo(1));

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
      if (e.key === "Home") renderPage(0);
      if (e.key === "End") renderPage(paginas.length - 1);
    });

    let touchStartX = 0;
    const threshold = 40;
    container.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    container.addEventListener(
      "touchend",
      (e) => {
        const touchEndX = (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX) || 0;
        const dx = touchEndX - touchStartX;
        if (dx > threshold) goTo(-1);
        else if (dx < -threshold) goTo(1);
      },
      { passive: true }
    );

    function preload(idx) {
      if (idx == null) return;
      if (idx < 0 || idx > paginas.length - 1) return;
      const item = paginas[idx];
      if (!item) return;
      // handle pair, single, double
      if (item.type === "pair" || item.left || item.right) {
        const left = item.left || item.imgLeft || item.leftImg;
        const right = item.right || item.imgRight || item.rightImg;
        if (left) {
          const i1 = new Image();
          i1.src = left;
        }
        if (right) {
          const i2 = new Image();
          i2.src = right;
        }
        return;
      }
      if (item.single || item.type === "single") {
        const src = item.img || item.src;
        if (src) {
          const i = new Image();
          i.src = src;
        }
        return;
      }
      // default double
      const src = item.img || item.src || (typeof item === "string" ? item : null);
      if (!src) return;
      const i = new Image();
      i.src = src;
    }

    // Start at first page
    renderPage(0);
    preload(1);
    preload(2);
  }
})();
