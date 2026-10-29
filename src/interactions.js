import gsap from 'gsap';
import { setEquipmentSystem } from './equipment.js';

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const svgNS = 'http://www.w3.org/2000/svg';

// A continuous engineering pipe alternates gutters, crossing at section boundaries.
const flow = document.createElementNS(svgNS, 'svg');
flow.classList.add('page-flow');
flow.setAttribute('aria-hidden', 'true');
flow.setAttribute('focusable', 'false');
flow.setAttribute('preserveAspectRatio', 'none');
flow.innerHTML = '<path class="flow-track"/><path class="flow-progress" pathLength="1000"/><path class="flow-current" pathLength="1000"/><g class="flow-junctions"/>';
document.body.prepend(flow);
let measureFrame;
function measureFlow() {
  cancelAnimationFrame(measureFrame);
  measureFrame = requestAnimationFrame(() => {
    const width = document.documentElement.clientWidth;
    const height = Math.ceil(document.querySelector('footer').getBoundingClientRect().bottom + scrollY);
    const left = width < 760 ? 8 : Math.max(16, (width - Math.min(width, 1600)) / 2 + 22);
    const right = width - left;
    const bend = width < 760 ? 5 : 14;
    const radius = width < 760 ? 10 : 18;
    const headerRect = document.querySelector('.header').getBoundingClientRect();
    const logo = document.querySelector('.header .brand svg');
    const tip = logo.createSVGPoint();
    tip.x = 9;
    tip.y = 40;
    const logoTip = tip.matrixTransform(logo.getScreenCTM());
    const startX = logoTip.x + scrollX;
    const startY = logoTip.y + scrollY;
    const elbowY = headerRect.bottom + scrollY - 12;
    const elbowRadius = Math.min(8, (elbowY - startY) / 2, (startX - left) / 3);
    const anchors = [...document.querySelectorAll('.standards, #expertise, #about, #approach, .faq, .contact-band, footer')];
    const junctions = [];
    let x = left;
    let d = `M ${startX} ${startY} V ${elbowY - elbowRadius} Q ${startX} ${elbowY} ${startX - elbowRadius} ${elbowY} H ${left + elbowRadius} Q ${left} ${elbowY} ${left} ${elbowY + elbowRadius}`;
    anchors.forEach(section => {
      const top = Math.round(section.getBoundingClientRect().top + scrollY);
      if (section.matches('.standards, #approach, .contact-band')) {
        // Lift the final crossing into the light gap above the orange contact section.
        const crossingY = section.matches('.contact-band') ? top - 28 : top;
        const nextX = x === left ? right : left;
        const direction = nextX > x ? 1 : -1;
        d += ` V ${crossingY - radius} Q ${x} ${crossingY} ${x + direction * radius} ${crossingY} H ${nextX - direction * radius} Q ${nextX} ${crossingY} ${nextX} ${crossingY + radius}`;
        junctions.push([x + direction * (radius + 10), crossingY], [nextX - direction * (radius + 10), crossingY]);
        x = nextX;
      } else {
        // Smaller mirrored fittings keep the vertical risers connected visually.
        const y = top + 16;
        const direction = x === left ? 1 : -1;
        const inset = x + direction * bend;
        d += ` V ${y - 16} Q ${x} ${y - 10} ${x + direction * bend / 2} ${y - 10} H ${inset - direction * 3} Q ${inset} ${y - 10} ${inset} ${y - 6} V ${y + 6} Q ${inset} ${y + 10} ${inset - direction * 3} ${y + 10} H ${x + direction * 3} Q ${x} ${y + 10} ${x} ${y + 16}`;
        junctions.push([inset, y]);
      }
    });
    const port = document.querySelector('.machine-port').getBoundingClientRect();
    const portX = port.left + scrollX;
    const portY = port.top + scrollY;
    // After the third crossing, the right-hand riser feeds the equipment inlet.
    const direction = portX > x ? 1 : -1;
    d += ` V ${portY - radius} Q ${x} ${portY} ${x + direction * radius} ${portY} H ${portX}`;
    flow.setAttribute('viewBox', `0 0 ${width} ${height}`);
    flow.style.height = `${height}px`;
    flow.querySelectorAll('path').forEach(path => path.setAttribute('d', d));
    flow.querySelector('g').innerHTML = junctions.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="3.5"/>`).join('');
    updateFlowProgress();
  });
}
function updateFlowProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const progress = max > 0 ? Math.min(1, scrollY / max) : 0;
  flow.querySelector('.flow-progress').style.strokeDashoffset = String(1000 - progress * 1000);
}
new ResizeObserver(measureFlow).observe(document.body);
addEventListener('resize', measureFlow, { passive: true });
addEventListener('scroll', updateFlowProgress, { passive: true });
document.fonts.ready.then(measureFlow);
measureFlow();

export function setFlowSystem(key, color) {
  setEquipmentSystem(key);
  document.documentElement.dataset.engineeringSystem = key;
  gsap.to(document.documentElement, {
    '--flow-color': `#${color.toString(16).padStart(6, '0')}`,
    duration: motionPreference.matches ? 0 : .65,
    overwrite: true,
    ease: 'power2.inOut'
  });
}

// CSS handles both directions of the menu animation. Inert prevents hidden links
// from receiving focus while retaining the closing transition.
const header = document.querySelector('.header');
const menu = document.querySelector('.menu-toggle');
const nav = header.querySelector('nav');
const mobile = matchMedia('(max-width: 760px)');
nav.id = 'main-navigation';
menu.setAttribute('aria-controls', nav.id);
menu.innerHTML = '<span></span><span></span><span></span>';
function setMenu(open, returnFocus = false) {
  header.classList.toggle('nav-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.inert = mobile.matches && !open;
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.querySelectorAll('a').forEach(item => {
    if (item === link) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  });
  setMenu(false, mobile.matches);
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('nav-open')) setMenu(false, true);
});
document.addEventListener('click', event => {
  if (header.classList.contains('nav-open') && !header.contains(event.target)) setMenu(false);
});
mobile.addEventListener('change', () => setMenu(false));
setMenu(false);

// Each process card gets its own circuit diagram; touch selection and keyboard
// focus use the same animation as hover.
const routes = [
  'M4 56 H30 Q38 56 38 48 V23 Q38 15 46 15 H105 M38 35 H70 V57 H105',
  'M4 35 H28 Q36 35 36 27 V12 H62 V56 H88 V35 H112 M62 35 H88',
  'M4 58 H26 V16 H49 V58 H72 V16 H95 V58 H115 M26 36 H95',
  'M4 57 H27 V42 H49 V28 H73 V12 H111 M91 5 L111 12 L100 29'
];
document.querySelectorAll('.process-step').forEach((card, index) => {
  const circuit = document.createElementNS(svgNS, 'svg');
  circuit.classList.add('card-circuit');
  circuit.setAttribute('viewBox', '0 0 120 72');
  circuit.setAttribute('aria-hidden', 'true');
  circuit.innerHTML = `<path class="circuit-track" d="${routes[index]}"/><path class="circuit-draw" pathLength="100" d="${routes[index]}"/><path class="circuit-current" pathLength="100" d="${routes[index]}"/><circle cx="4" cy="${index === 1 ? 35 : index === 2 ? 58 : index === 3 ? 57 : 56}" r="3"/><circle cx="${index === 0 ? 105 : index === 1 ? 112 : index === 2 ? 115 : 111}" cy="${index === 0 ? 15 : index === 1 ? 35 : index === 2 ? 58 : 12}" r="3"/>`;
  card.append(circuit);
});

// Animate measured heights so the native details element closes only after its
// answer has folded away. Retargeting from the current height handles rapid taps.
const accordions = [];
document.querySelectorAll('.faq details').forEach((details, index) => {
  const summary = details.querySelector('summary');
  const answer = document.createElement('div');
  answer.className = 'faq-answer';
  answer.id = `faq-answer-${index}`;
  [...details.children].filter(child => child !== summary).forEach(child => answer.append(child));
  details.append(answer);
  summary.setAttribute('aria-controls', answer.id);
  let targetOpen = details.open;
  let animation;
  function settle() {
    animation?.cancel();
    animation = null;
    details.open = targetOpen;
    details.style.height = '';
    details.style.overflow = '';
    answer.inert = !targetOpen;
    details.dataset.expanded = String(targetOpen);
    summary.setAttribute('aria-expanded', String(targetOpen));
    measureFlow();
  }
  function toggle() {
    const from = details.getBoundingClientRect().height;
    targetOpen = !targetOpen;
    animation?.cancel();
    details.open = true;
    details.style.height = '';
    const style = getComputedStyle(details);
    const closedHeight = summary.getBoundingClientRect().height + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth);
    const to = targetOpen ? details.getBoundingClientRect().height : closedHeight;
    summary.setAttribute('aria-expanded', String(targetOpen));
    details.dataset.expanded = String(targetOpen);
    answer.inert = !targetOpen;
    if (motionPreference.matches) { settle(); return; }
    details.style.overflow = 'hidden';
    animation = details.animate([{height:`${from}px`},{height:`${to}px`}], {
      duration: 420, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards'
    });
    animation.onfinish = settle;
  }
  summary.addEventListener('click', event => { event.preventDefault(); toggle(); });
  settle();
  accordions.push(settle);
});
addEventListener('resize', () => accordions.forEach(settle => settle()), { passive: true });
motionPreference.addEventListener('change', () => accordions.forEach(settle => settle()));
