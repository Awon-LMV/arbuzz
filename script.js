import { spatialField } from "./scene.js";
import { setupExperiments } from "./experiments.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const field = spatialField($("#spatial-grid"));
let paused = reduced.matches;
function setMotion(value) {
  paused = value;
  document.body.classList.toggle("motion-paused", paused);
  field.setPaused(paused);
  const button = $(".motion-toggle");
  button.setAttribute("aria-pressed", String(paused));
  button.setAttribute(
    "aria-label",
    paused ? "Включить движение" : "Приостановить движение",
  );
  button.querySelector("use").setAttribute("href", paused ? "#play" : "#pause");
}
setMotion(paused);
$(".motion-toggle").addEventListener("click", () => setMotion(!paused));
reduced.addEventListener("change", (e) => setMotion(e.matches));

const heroObjects = {
  cup: { alt: "Фиолетовая банка — пример виртуального продукта" },
  camera: {
    alt: "Фиолетовая объёмная камера — образ интерактивного впечатления",
  },
  pin: { alt: "Фиолетовая стрелка — указатель виртуальной точки" },
};
$$("[data-object]").forEach((button) =>
  button.addEventListener("click", () => {
    if (button.getAttribute("aria-pressed") === "true") return;
    $$("[data-object]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
    const kind = button.dataset.object;
    $("#hero-object image").setAttribute("href", `./assets/${kind}.webp`);
    if (kind === "cup")
      $("#hero-object image").setAttribute("filter", "url(#hero-cup-edge)");
    else $("#hero-object image").removeAttribute("filter");
    $(".hero-product").setAttribute("aria-label", heroObjects[kind].alt);
  }),
);
const experiments = setupExperiments();
const scenarios = {
  city: {
    premise: "А что, если продукт станет выше дома?",
    title: "Привычный объект. Непривычный масштаб.",
    copy: "Виртуальному объекту не нужен пьедестал. Через камеру он появляется рядом с привычными зданиями — и меняет ощущение места. Сравните три размера одной банки.",
    action: "Действие зрителя: рассмотреть со всех сторон",
    index: "01 / 03",
    context: "Объект в городе",
  },
  package: {
    premise: "А что, если этикетке станет тесно в печати?",
    title: "История выходит за края упаковки.",
    copy: "Снаружи — знакомая этикетка. Через камеру — анимация, персонаж или целая сцена. Упаковка становится входом в историю. Нажмите на этикетку и откройте её продолжение.",
    action: "Действие зрителя: открыть цифровое продолжение",
    index: "02 / 03",
    context: "Живая упаковка",
  },
  quest: {
    premise: "А что, если у прогулки появится сюжет?",
    title: "Ещё одна точка. Ещё одна находка.",
    copy: "Локации становятся главами одной игры. В каждой ждёт предмет или задание, а коллекция даёт повод идти дальше. Здесь можно собрать три части названия ARBUZZ.",
    action: "Действие зрителя: пройти маршрут и собрать коллекцию",
    index: "03 / 03",
    context: "Городская игра",
  },
};
function selectScenario(kind, focus = false) {
  const data = scenarios[kind];
  const tabs = $$("[data-scenario]");
  tabs.forEach((tab) => {
    const active = tab.dataset.scenario === kind;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  $("#scenario-title").textContent = data.title;
  $("#scenario-premise").textContent = data.premise;
  $("#scenario-copy").textContent = data.copy;
  $("#experience-action").textContent = data.action;
  $("#experience-index").textContent = data.index;
  $("#scenario-panel").setAttribute("aria-labelledby", `tab-${kind}`);
  $("#scenario-panel [data-brief]").dataset.format = data.context;
  experiments.select(kind);
}
$$("[data-scenario]").forEach((tab) => {
  tab.addEventListener("click", () => selectScenario(tab.dataset.scenario));
  tab.addEventListener("keydown", (e) => {
    const tabs = $$("[data-scenario]"),
      index = tabs.indexOf(tab);
    let next = index;
    if (["ArrowRight", "ArrowDown"].includes(e.key))
      next = (index + 1) % tabs.length;
    else if (["ArrowLeft", "ArrowUp"].includes(e.key))
      next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    selectScenario(tabs[next].dataset.scenario, true);
  });
});
const menu = $("#mobile-menu"),
  menuButton = $(".menu-toggle");
function closeMenu() {
  menu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Открыть меню");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menu.hidden = open;
  menuButton.setAttribute("aria-expanded", String(!open));
  menuButton.setAttribute("aria-label", open ? "Открыть меню" : "Закрыть меню");
});
menu
  .querySelectorAll("a,button")
  .forEach((el) => el.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
matchMedia("(min-width:561px)").addEventListener("change", (e) => {
  if (e.matches) closeMenu();
});

const brief = $(".brief-dialog"),
  privacy = $(".privacy-dialog"),
  form = $("#brief-form"),
  preview = $(".brief-preview");
let context = "",
  lastTrigger = null;
function openDialog(dialog, trigger) {
  lastTrigger = trigger;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}
function closeDialog(dialog) {
  dialog.close();
}
[brief, privacy].forEach((dialog) => {
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    lastTrigger?.focus();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (
        e.clientX < box.left ||
        e.clientX > box.right ||
        e.clientY < box.top ||
        e.clientY > box.bottom
      )
        closeDialog(dialog);
    }
  });
  dialog
    .querySelector(".close-dialog")
    .addEventListener("click", () => closeDialog(dialog));
});
$$("[data-brief]").forEach((button) =>
  button.addEventListener("click", () => {
    context = button.dataset.format || "";
    if (context) {
      const match = $$("input[name=format]").find((r) => r.value === context);
      const suggested =
        {
          "Объект в городе": "Одна AR-сцена",
          "Живая упаковка": "Одна AR-сцена",
          "Городская игра": "Кампания",
        }[context] || "Пока ищу идею";
      const mapped =
        match || $$("input[name=format]").find((r) => r.value === suggested);
      mapped.checked = true;
    }
    form.hidden = false;
    preview.hidden = true;
    openDialog(brief, button);
  }),
);
$("[data-privacy]").addEventListener("click", (e) =>
  openDialog(privacy, e.currentTarget),
);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const brand = String(data.get("brand")).trim(),
    idea = String(data.get("idea")).trim();
  if (!brand || !idea) {
    showToast("Добавьте название проекта и пару слов об идее.");
    return;
  }
  const text = `Здравствуйте! Хочу обсудить AR-проект с ARBUZZ.\n\nПроект: ${brand}\nФормат: ${data.get("format")}${context && context !== data.get("format") ? `\nИнтересует: ${context}` : ""}\n\nИдея:\n${idea}`;
  $("#brief-message").textContent = text;
  $("#brief-telegram").href =
    `https://t.me/awonk?text=${encodeURIComponent(text)}`;
  form.hidden = true;
  preview.hidden = false;
  $("#brief-telegram").focus();
});
$(".brief-edit").addEventListener("click", () => {
  preview.hidden = true;
  form.hidden = false;
  form.querySelector("input[name=brand]").focus();
});
let toastTimer;
function showToast(text) {
  const t = $(".site-toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}
$(".brief-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#brief-message").textContent);
    showToast("Бриф скопирован. До встречи в Telegram.");
  } catch {
    const selection = getSelection(),
      range = document.createRange();
    range.selectNodeContents($("#brief-message"));
    selection.removeAllRanges();
    selection.addRange(range);
    showToast("Выделили бриф — его можно скопировать вручную.");
  }
});
