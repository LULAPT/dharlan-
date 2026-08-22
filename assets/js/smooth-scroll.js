export function smoothScroll() {
  const speed = 0.5; // menor = mais suave, maior = mais rápido
  const states = new WeakMap();

  function animate(el) {
    const s = states.get(el);
    if (!s) return;

    s.x += (s.tx - s.x) * speed;
    s.y += (s.ty - s.y) * speed;

    if (el === window) {
      window.scrollTo(s.x, s.y);
    } else {
      el.scrollLeft = s.x;
      el.scrollTop = s.y;
    }

    if (Math.abs(s.tx - s.x) > 0.5 || Math.abs(s.ty - s.y) > 0.5) {
      requestAnimationFrame(() => animate(el));
    } else {
      s.ticking = false;
    }
  }

  function getState(el) {
    if (!states.has(el)) {
      states.set(el, {
        x: el === window ? window.scrollX : el.scrollLeft,
        y: el === window ? window.scrollY : el.scrollTop,
        tx: el === window ? window.scrollX : el.scrollLeft,
        ty: el === window ? window.scrollY : el.scrollTop,
        ticking: false,
      });
    }
    return states.get(el);
  }

  function findScrollable(el) {
    while (el && el !== document.body) {
      const st = getComputedStyle(el);
      if (
        ((st.overflowY === "auto" || st.overflowY === "scroll") && el.scrollHeight > el.clientHeight) ||
        ((st.overflowX === "auto" || st.overflowX === "scroll") && el.scrollWidth > el.clientWidth)
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return window;
  }

  function onWheel(e) {
    if (e.ctrlKey) return; // deixa zoom funcionar

    const el = findScrollable(e.target);
    const s = getState(el);

    e.preventDefault();

    s.tx += e.deltaX;
    s.ty += e.deltaY;

    // limitar rolagem
    const maxY = el === window ? document.documentElement.scrollHeight - innerHeight : el.scrollHeight - el.clientHeight;
    const maxX = el === window ? document.documentElement.scrollWidth - innerWidth : el.scrollWidth - el.clientWidth;

    s.tx = Math.max(0, Math.min(maxX, s.tx));
    s.ty = Math.max(0, Math.min(maxY, s.ty));

    if (!s.ticking) {
      s.ticking = true;
      requestAnimationFrame(() => animate(el));
    }
  }

  window.addEventListener("wheel", onWheel, { passive: false });
}
