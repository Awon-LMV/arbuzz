export function setupStudio() {
  const figure = document.querySelector('.build-figure');
  const process = document.querySelector('.process');
  const choices = [...document.querySelectorAll('[data-build-choice]')];
  const steps = [...document.querySelectorAll('[data-build-step]')];
  const gallery = document.querySelector('.formats');
  const arts = [...document.querySelectorAll('.format-art')];
  let paused = false;

  function selectStage(stage) {
    figure.dataset.buildStage = stage;
    const index = ['idea', 'prototype', 'launch'].indexOf(stage);
    figure.querySelector('.build-number').textContent = `0${index + 1}`;
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.buildChoice === stage)));
    steps.forEach(step => step.classList.toggle('is-current', step.dataset.buildStep === stage));
  }
  choices.forEach(button => button.addEventListener('click', () => selectStage(button.dataset.buildChoice)));
  selectStage('idea');

  // On larger screens the illustration stays beside the text being read.
  const ratios = new Map();
  const desktop = matchMedia('(min-width: 801px)');
  const stepObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => ratios.set(entry.target, entry.intersectionRatio));
    if (!desktop.matches) return;
    if (process.getBoundingClientRect().top >= -90) {
      selectStage('idea');
      return;
    }
    const visible = steps.filter(step => (ratios.get(step) || 0) > 0);
    visible.sort((a, b) => (ratios.get(b) || 0) - (ratios.get(a) || 0));
    if (visible[0]) selectStage(visible[0].dataset.buildStep);
  }, { rootMargin: '-22% 0px -22% 0px', threshold: [0, .2, .5, .8, 1] });
  steps.forEach(step => stepObserver.observe(step));

  // Float only when the service illustrations are on screen.
  new IntersectionObserver(([entry]) => {
    gallery.classList.toggle('is-visible', entry.isIntersecting && !document.hidden);
  }, { threshold: .05 }).observe(gallery);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) gallery.classList.remove('is-visible');
    else {
      const box = gallery.getBoundingClientRect();
      gallery.classList.toggle('is-visible', box.bottom > 0 && box.top < innerHeight);
    }
  });

  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  function resetTilt(art) {
    art.style.setProperty('--tilt-x', '0deg');
    art.style.setProperty('--tilt-y', '0deg');
  }
  arts.forEach(art => {
    art.addEventListener('pointermove', event => {
      if (paused || !finePointer.matches) return;
      const box = art.getBoundingClientRect();
      art.style.setProperty('--tilt-x', `${-(event.clientY - box.top - box.height / 2) / box.height * 6}deg`);
      art.style.setProperty('--tilt-y', `${(event.clientX - box.left - box.width / 2) / box.width * 8}deg`);
    });
    art.addEventListener('pointerleave', () => resetTilt(art));
  });

  const scale = document.querySelector('.scale-toy');
  scale.addEventListener('click', () => {
    const expanded = scale.getAttribute('aria-pressed') !== 'true';
    scale.setAttribute('aria-pressed', String(expanded));
    scale.querySelector('.toy-instruction').firstChild.textContent = expanded ? 'Уменьшить объект ' : 'Увеличить объект ';
  });
  const route = document.querySelector('.route-toy');
  route.addEventListener('click', () => {
    const open = route.getAttribute('aria-pressed') !== 'true';
    route.setAttribute('aria-pressed', String(open));
    route.setAttribute('aria-label', open ? 'Скрыть маршрут между AR-точками' : 'Показать маршрут между AR-точками');
    route.querySelector('.toy-instruction').firstChild.textContent = open ? 'Скрыть маршрут ' : 'Соединить точки ';
  });

  const toys = [...document.querySelectorAll('[data-toy-collect]')];
  const reset = document.querySelector('.toy-reset');
  function updateCollection() {
    const count = toys.filter(toy => toy.getAttribute('aria-pressed') === 'true').length;
    document.querySelector('.toy-count').textContent = count ? `Собрано ${count} из 3` : 'Соберите 3 предмета';
    reset.disabled = count === 0;
  }
  toys.forEach(toy => toy.addEventListener('click', () => {
    toy.setAttribute('aria-pressed', 'true');
    toy.disabled = true;
    updateCollection();
    (toys.find(next => !next.disabled) || reset).focus({ preventScroll: true });
  }));
  reset.addEventListener('click', () => {
    toys.forEach(toy => {
      toy.disabled = false;
      toy.setAttribute('aria-pressed', 'false');
    });
    updateCollection();
    toys[0].focus({ preventScroll: true });
  });

  return { setPaused(value) {
    paused = value;
    arts.forEach(resetTilt);
  } };
}
