import { spatialField } from "./scene.js";
import { setupStudio } from "./studio.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const field = spatialField($("#spatial-grid"));
const studio = setupStudio();
let paused = reduced.matches;
function setMotion(value) {
  paused = value;
  document.body.classList.toggle("motion-paused", paused);
  field.setPaused(paused);
  studio.setPaused(paused);
  const button = $(".motion-toggle");
  button.setAttribute("aria-pressed", String(paused));
  button.setAttribute(
    "aria-label",
    paused ? "Включить движение" : "Приостановить движение",
  );
  button.querySelector("use").setAttribute("href", paused ? "#play" : "#pause");
  button.querySelector("span").textContent = paused ? "Продолжить" : "Пауза";
}
setMotion(paused);
$(".motion-toggle").addEventListener("click", () => setMotion(!paused));
reduced.addEventListener("change", (e) => setMotion(e.matches));

const heroObjects = {
  cup: { alt: "Фиолетовая 3D-банка" },
  camera: {
    alt: "Фиолетовая 3D-камера",
  },
  pin: { alt: "Фиолетовый 3D-указатель" },
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
      const mapped = match || $("input[name=format][value='Нужна помощь с идеей']");
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
    showToast("Текст скопирован.");
  } catch {
    const selection = getSelection(),
      range = document.createRange();
    range.selectNodeContents($("#brief-message"));
    selection.removeAllRanges();
    selection.addRange(range);
    showToast("Выделили текст — скопируйте его вручную.");
  }
});
