export function setupStudio() {
  const figure = document.querySelector('.build-figure');
  const process = document.querySelector('.process');
  const stage = figure.querySelector('.build-stage');
  const object = figure.querySelector('.build-object');
  const choices = [...document.querySelectorAll('[data-build-choice]')];
  const steps = [...document.querySelectorAll('[data-build-step]')];
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const scrollLinked = matchMedia('(min-width:561px)');
  const stages = {idea: 0, prototype: .5, launch: 1};
  const clamp = value => Math.min(1, Math.max(0, value));
  let paused = false;
  let inView = false;
  let current = 0;
  let target = 0;
  let frame = 0;
  let stageName = '';

  function selectStage(value) {
    if (value === stageName) return;
    stageName = value;
    figure.dataset.buildStage = value;
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.buildChoice === value)));
    steps.forEach(step => step.classList.toggle('is-current', step.dataset.buildStep === value));
  }

  // One value drives everything: 0 is the sketch, .5 the prototype, 1 the launch.
  function paint(p) {
    const fill = clamp(p * 2);
    const style = figure.style;
    style.setProperty('--p', p.toFixed(4));
    style.setProperty('--fill', fill.toFixed(4));
    style.setProperty('--launch', clamp(p * 2 - 1).toFixed(4));
    style.setProperty('--scan', clamp(Math.min(fill, 1 - fill) * 12).toFixed(4));
  }

  function tick() {
    frame = 0;
    const gap = target - current;
    if (paused || reduced.matches || Math.abs(gap) < .0005) current = target;
    else current += gap * .14;
    paint(current);
    if (current !== target) frame = requestAnimationFrame(tick);
  }

  function setTarget(value) {
    target = value;
    selectStage(target < .25 ? 'idea' : target < .75 ? 'prototype' : 'launch');
    if (!frame) frame = requestAnimationFrame(tick);
  }

  choices.forEach(button => button.addEventListener('click', () => setTarget(stages[button.dataset.buildChoice])));

  // The sketch stays clean until the section is reached, then fills in as the page moves.
  function fromScroll() {
    if (!scrollLinked.matches) {
      // On phones the figure sits above the steps: fill it while it crosses the screen.
      const box = stage.getBoundingClientRect();
      setTarget(clamp((innerHeight * .8 - box.top) / (innerHeight * .6)));
      return;
    }
    const box = process.getBoundingClientRect();
    const start = -30;
    const end = -(box.height - innerHeight * .55);
    setTarget(clamp((start - box.top) / (start - end)));
  }
  let scrollQueued = false;
  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; fromScroll(); });
  }
  addEventListener('scroll', queueScroll, {passive: true});
  addEventListener('resize', queueScroll);
  paint(0);
  selectStage('idea');
  fromScroll();

  function updateVisibility() { process.classList.toggle('is-visible', inView && !document.hidden); }
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateVisibility(); }, {threshold:.05}).observe(figure);
  document.addEventListener('visibilitychange', updateVisibility);

  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  function resetTilt() {
    object.style.setProperty('--object-x','0deg');
    object.style.setProperty('--object-y','0deg');
  }
  stage.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches) return;
    const box = stage.getBoundingClientRect();
    object.style.setProperty('--object-x', `${-(event.clientY-box.top-box.height/2)/box.height*10}deg`);
    object.style.setProperty('--object-y', `${(event.clientX-box.left-box.width/2)/box.width*16}deg`);
  });
  stage.addEventListener('pointerleave', resetTilt);
  return {setPaused(value) { paused = value; resetTilt(); if (value) { current = target; paint(current); } }};
}
