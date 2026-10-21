export function setupExperiments() {
  const panels = [...document.querySelectorAll("[data-experiment]")];
  const scale = document.querySelector('[data-experiment="city"]');
  const sizes = {
    small: "Обычный размер",
    person: "Рост человека",
    building: "Высота здания",
  };
  const scaleButtons = [...scale.querySelectorAll("[data-scale-choice]")];
  scaleButtons.forEach((button) =>
    button.addEventListener("click", () => {
      const size = button.dataset.scaleChoice;
      scale.dataset.scale = size;
      scaleButtons.forEach((b) =>
        b.setAttribute("aria-pressed", String(b === button)),
      );
      document.querySelector("#scale-status").textContent =
        `Размер продукта: ${sizes[size].toLowerCase()}.`;
    }),
  );
  const label = document.querySelector('[data-experiment="package"]');
  const labelButton = label.querySelector(".label-trigger");
  labelButton.addEventListener("click", () => {
    const open = label.dataset.open !== "true";
    label.dataset.open = String(open);
    labelButton.setAttribute("aria-expanded", String(open));
    labelButton.querySelector(".label-toggle-icon").textContent = open
      ? "−"
      : "+";
    labelButton.querySelector(".label-action").firstChild.textContent = open
      ? "Вернуть этикетку "
      : "Открыть анимацию ";
    document.querySelector("#label-status").textContent = open
      ? "Анимация за границами этикетки. В AR она появляется через камеру."
      : "Этикетка в печати. Нажмите, чтобы открыть анимацию.";
  });
  const route = document.querySelector('[data-experiment="quest"]');
  const stops = [...route.querySelectorAll("[data-collect]")];
  const reset = route.querySelector(".route-reset");
  const collected = new Set();
  function updateRoute() {
    stops.forEach((button) => {
      const done = collected.has(button.dataset.collect);
      button.setAttribute("aria-pressed", String(done));
      button.disabled = done;
      route
        .querySelector(`[data-slot="${button.dataset.collect}"]`)
        .classList.toggle("collected", done);
    });
    document.querySelector("#route-count").textContent =
      collected.size === 3
        ? "Все 3 предмета собраны"
        : `Собрано ${collected.size} из 3`;
    document.querySelector("#route-hint").textContent =
      collected.size === 3
        ? "Название собрано. Можно пройти маршрут ещё раз."
        : "Нажмите на точки и соберите название ARBUZZ.";
    reset.disabled = collected.size === 0;
    route.classList.toggle("route-complete", collected.size === 3);
  }
  stops.forEach((button) =>
    button.addEventListener("click", () => {
      collected.add(button.dataset.collect);
      updateRoute();
      const next = stops.find((b) => !b.disabled);
      (next || reset).focus({ preventScroll: true });
    }),
  );
  reset.addEventListener("click", () => {
    collected.clear();
    updateRoute();
    stops[0].focus({ preventScroll: true });
  });
  return {
    select(kind) {
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.experiment !== kind;
      });
    },
  };
}
