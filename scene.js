// A small, progressive 2D spatial field. The page works without canvas or motion.
export function spatialField(canvas) {
  const ctx = canvas?.getContext("2d");
  if (!ctx) return { setPaused() {} };
  let width = 0,
    height = 0,
    raf = 0,
    lastFrame = 0,
    phase = 0,
    paused = false,
    visible = false;
  const pointer = { x: 0.78, y: 0.48, targetX: 0.78, targetY: 0.48 };
  const host = canvas.parentElement;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const step = width < 600 ? 32 : 42;
    const cx = width * pointer.x,
      cy = height * pointer.y;
    const radius = Math.min(width * 0.4, height * 0.75);
    function point(x, y) {
      const dx = x - cx,
        dy = y - cy,
        dist = Math.hypot(dx, dy),
        field = Math.exp((-dist * dist) / (radius * radius));
      return [
        x + Math.sin(y / 110 + phase) * 20 + dx * field * 0.12,
        y +
          Math.cos(x / 140 - phase * 0.4) * 19 +
          Math.sin(dist / 80 - phase) * 22 * field,
      ];
    }
    ctx.strokeStyle = "rgba(185,180,194,.52)";
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    for (let x = -step * 2; x <= width + step * 2; x += step) {
      for (let y = -40; y <= height + 40; y += 13) {
        const p = point(x, y);
        if (y === -40) ctx.moveTo(...p);
        else ctx.lineTo(...p);
      }
    }
    for (let y = -step * 2; y <= height + step * 2; y += step) {
      for (let x = -40; x <= width + 40; x += 13) {
        const p = point(x, y);
        if (x === -40) ctx.moveTo(...p);
        else ctx.lineTo(...p);
      }
    }
    ctx.stroke();
  }
  function frame(time) {
    raf = 0;
    if (!visible || paused || document.hidden) return;
    if (time - lastFrame > 32) {
      phase += 0.004;
      pointer.x += (pointer.targetX - pointer.x) * 0.025;
      pointer.y += (pointer.targetY - pointer.y) * 0.025;
      lastFrame = time;
      draw();
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!raf && !paused && visible && !document.hidden)
      raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function resize() {
    const box = host.getBoundingClientRect();
    width = box.width;
    height = box.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    },
    { rootMargin: "60px" },
  ).observe(host);
  host.addEventListener("pointermove", (e) => {
    const b = host.getBoundingClientRect();
    pointer.targetX = (e.clientX - b.left) / b.width;
    pointer.targetY = (e.clientY - b.top) / b.height;
  });
  host.addEventListener("pointerleave", () => {
    pointer.targetX = 0.78;
    pointer.targetY = 0.48;
  });
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );
  resize();
  return {
    setPaused(value) {
      paused = value;
      if (paused) {
        stop();
        draw();
      } else start();
    },
  };
}
