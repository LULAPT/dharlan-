export function confettiEffect() {
  // injeta CSS mínimo
  const style = document.createElement("style");
  style.id = "confetti-style";
  style.textContent = `
    .confetti { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 998; }
    .confetti span { position: absolute; top: 0; left: 0; will-change: transform, opacity; pointer-events: none; display: block; }
  `;
  if (!document.getElementById("confetti-style")) {
    document.head.appendChild(style);
  }

  // container
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti";
  document.body.appendChild(confettiContainer);

  const root = document.documentElement;

  const corRosa = getComputedStyle(root).getPropertyValue("--clr-pink-a40").trim();
  const corRoxo = getComputedStyle(root).getPropertyValue("--clr-purple-a30").trim();
  const corVerde = getComputedStyle(root).getPropertyValue("--clr-green").trim();
  const corAzul = getComputedStyle(root).getPropertyValue("--clr-blue-a30").trim();
  const corAmarelo = getComputedStyle(root).getPropertyValue("--clr-yellow-a30").trim();
  const corVermelho = getComputedStyle(root).getPropertyValue("--clr-red-a40").trim();

  // parâmetros
  const TOTAL = 116;
  const MIN_SIZE = 8;
  const MAX_SIZE = 14;
  const MIN_SPEED = 82; // mais lento
  const MAX_SPEED = 210; // mais rápido
  const MIN_ROT = -2;
  const MAX_ROT = 2;
  // const COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#f06595"];
  const COLORS = [corRosa, corAmarelo, corVerde, corAzul, corVermelho];

  const vw = () => Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = () => Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  const pieces = [];

  function createConfetti() {
    const el = document.createElement("span");
    const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    const baseX = Math.random() * vw();
    const y = -20 - Math.random() * 100;
    const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
    const angle = Math.random() * Math.PI * 2;
    const rotVel = MIN_ROT + Math.random() * (MAX_ROT - MIN_ROT);
    const color = COLORS[(Math.random() * COLORS.length) | 0];

    el.style.width = size + "px";
    el.style.height = size * 1.4 + "px";
    el.style.background = color;
    el.style.transform = `translate3d(${baseX}px, ${y}px, 0) rotate(${angle}rad)`;

    confettiContainer.appendChild(el);

    return { el, baseX, y, size, speed, angle, rotVel };
  }

  for (let i = 0; i < TOTAL; i++) {
    pieces.push(createConfetti());
  }

  let last = performance.now();
  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;
    const H = vh();
    const W = vw();

    let allGone = true;

    for (let p of pieces) {
      p.y += p.speed * dt;
      p.angle += p.rotVel * dt;

      if (p.y < H + 40) allGone = false;

      p.el.style.transform = `translate3d(${p.baseX}px, ${p.y}px, 0) rotate(${p.angle}rad)`;
    }

    if (!allGone) {
      requestAnimationFrame(tick);
    } else {
      // remove tudo depois que saírem da tela
      confettiContainer.style.transition = "opacity .5s ease";
      confettiContainer.style.opacity = "0";
      setTimeout(() => confettiContainer.remove(), 600);
    }
  }

  requestAnimationFrame(tick);
}
