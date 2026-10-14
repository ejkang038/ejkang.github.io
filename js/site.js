/* ==========================================================
   site.js — shared across every page
   Page-specific scripts stay inline in each HTML file.
   ========================================================== */

/* Page entry fade + scroll reveal */
(function(){
  var mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  var entries = document.querySelectorAll('.entry');
  if (!mql.matches) {
    requestAnimationFrame(function(){
      entries.forEach(function(el){ el.classList.add('play'); });
    });
  } else {
    entries.forEach(function(el){ el.classList.add('play'); });
  }
  var reveals = document.querySelectorAll('.reveal');
  if (!mql.matches && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(items){
      items.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    reveals.forEach(function(el){ obs.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }
})();

/* Mobile nav toggle (called from the button's inline onclick) */
function toggleMobileNav(){
  var menu = document.getElementById('navMobileMenu');
  var btn = document.getElementById('navMobileToggle');
  if (!menu || !btn) return;
  var isOpen = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  btn.textContent = isOpen ? '\u00d7' : '+';
}
document.addEventListener('click', function(e){
  var menu = document.getElementById('navMobileMenu');
  var btn = document.getElementById('navMobileToggle');
  if (!menu || !btn) return;
  if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== btn) {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '+';
  }
});

/* Video playback: autoplay handles startup, this only pauses off-screen clips */
(function(){
  var vids = document.querySelectorAll('video.lazy-video');
  if (!vids.length || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function(items){
    items.forEach(function(e){
      var v = e.target;
      if (e.isIntersecting) {
        if (v.paused) v.play().catch(function(){});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, { threshold: 0.1 });
  vids.forEach(function(v){ obs.observe(v); });
})();

/* Scroll depth tracking (Umami)
   Fires 'scroll-depth' at 25 / 50 / 75 / 100 percent, once per context.
   On the homepage the context switches with the Product / Graphic tabs. */
var setScrollContext;
(function(){
  var MARKS = [25, 50, 75, 100];
  var file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var context = (file === '' || file === 'index') ? 'home-product' : file;
  var reached = {};

  function check(){
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var pct = ((window.pageYOffset || doc.scrollTop) / scrollable) * 100;
    MARKS.forEach(function(m){
      if (pct >= m && !reached[m]) {
        reached[m] = true;
        if (window.umami) umami.track('scroll-depth', { page: context, depth: m });
      }
    });
  }

  setScrollContext = function(next){
    if (next === context) return;
    context = next;
    reached = {};
    check();
  };

  var ticking = false;
  window.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ ticking = false; check(); });
  }, { passive: true });
  window.addEventListener('resize', check, { passive: true });
})();

/* Gallery images: drop the skeleton once each image has actually loaded */
(function(){
  var imgs = document.querySelectorAll('.graphic-gallery img');
  if (!imgs.length) return;
  imgs.forEach(function(img){
    if (img.complete && img.naturalWidth) { img.classList.add('loaded'); return; }
    img.addEventListener('load', function(){ img.classList.add('loaded'); }, { once: true });
    img.addEventListener('error', function(){ img.classList.add('loaded'); }, { once: true });
  });
})();

/* Detail pages: the Open to Work pill shows the section in view; hover always rolls back to "Open to Work" */
(function () {
  var media = document.querySelector('.detail-media');
  var cta = document.querySelector('.nav-cta');
  var stack = cta && cta.querySelector('.cta-stack');
  if (!media || !stack) return;
  var DEFAULT = 'Open to Work';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // each [data-label] starts a section that runs until the next one
  var starts = Array.prototype.slice.call(media.querySelectorAll('[data-label]'));
  var shown = DEFAULT, wanted = DEFAULT, busy = false, ticking = false;
  function textW(text) {
    var probe = document.createElement('span');
    probe.textContent = text;
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    cta.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    cta.removeChild(probe);
    return w;
  }
  var pad = cta.offsetWidth - textW(DEFAULT);
  function widthFor(text) { return Math.ceil(textW(text) + pad); }
  function render(cur) {
    stack.innerHTML = '<span></span><span></span>';
    stack.firstChild.textContent = cur; stack.lastChild.textContent = DEFAULT;
  }
  cta.style.width = widthFor(DEFAULT) + 'px';
  requestAnimationFrame(function () { cta.classList.add('sized'); });
  function go(text) {
    if (busy || text === shown) return;
    cta.style.width = widthFor(text) + 'px';
    cta.setAttribute('aria-label', DEFAULT);
    if (reduce) { render(text); shown = text; return; }
    busy = true;
    stack.innerHTML = '<span></span><span></span>';
    stack.firstChild.textContent = shown; stack.lastChild.textContent = text;
    void stack.offsetWidth;
    stack.classList.add('swap');
    setTimeout(function () {
      stack.classList.add('reset'); stack.classList.remove('swap');
      render(text); shown = text;
      void stack.offsetWidth; stack.classList.remove('reset');
      busy = false;
      if (wanted !== shown) go(wanted);
    }, 420);
  }
  function update() {
    ticking = false;
    var line = cta.getBoundingClientRect().bottom + 40;
    var hit = 0;
    for (var i = 0; i < starts.length; i++) {
      if (starts[i].getBoundingClientRect().top <= line) hit = i; else break;
    }
    wanted = starts.length ? starts[hit].getAttribute('data-label') : DEFAULT;
    go(wanted);
  }
  cta.addEventListener('mouseenter', function () { cta.style.width = Math.max(widthFor(shown), widthFor(DEFAULT)) + 'px'; });
  cta.addEventListener('mouseleave', function () { cta.style.width = widthFor(shown) + 'px'; });
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* Detail pages: explain the pill with a tooltip for 3 seconds on entry */
(function () {
  if (!document.querySelector('.detail-media')) return;
  var right = document.querySelector('.nav-right');
  if (!right) return;
  // only once per visit (browser tab session)
  try {
    if (sessionStorage.getItem('ctaHintSeen')) return;
    sessionStorage.setItem('ctaHintSeen', '1');
  } catch (e) {}
  var hint = document.createElement('div');
  hint.className = 'cta-hint';
  hint.setAttribute('role', 'status');
  hint.innerHTML = 'This button shows<br>the section you are viewing';
  right.appendChild(hint);
  var cta = right.querySelector('.nav-cta');
  if (cta) {
    var rr = right.getBoundingClientRect(), cr = cta.getBoundingClientRect();
    hint.style.setProperty('--arrow-right', Math.round(rr.right - (cr.left + cr.width / 2) - 6) + 'px');
  }
  setTimeout(function () { hint.classList.add('show'); }, 600);
  setTimeout(function () { hint.classList.remove('show'); }, 3600);
  setTimeout(function () { hint.remove(); }, 4000);
})();

/* Homepage hero: click the name to spin it once in 3D */
(function () {
  var name = document.querySelector('.hero-name');
  if (!name) return;
  var inner = name.querySelector('.hero-name-inner');
  function spin() {
    name.classList.remove('spin');
    void inner.offsetWidth;
    name.classList.add('spin');
  }
  name.addEventListener('click', spin);
  name.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); spin(); }
  });
  inner.addEventListener('animationend', function () { name.classList.remove('spin'); });
  // spin once on its own right after the italic motion finishes
  name.addEventListener('italicdone', function () { setTimeout(spin, 150); });
})();

/* Detail pages: the floating prev/next pill stops just above the footer instead of covering it */
(function () {
  var pill = document.querySelector('.detail-nav');
  var footer = document.querySelector('.bottom-sheet');
  if (!pill || !footer) return;
  var GAP = 24, ticking = false;
  function update() {
    ticking = false;
    var overlap = window.innerHeight - footer.getBoundingClientRect().top;
    pill.style.bottom = Math.max(GAP, overlap + GAP) + 'px';
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* Italic motion: [data-italic-motion] groups turn italic bold letter by letter.
   Groups on a page play in order, each starting `gap` ms after the previous one.
   Per-group overrides: data-from, data-delay, data-dur, data-stagger, data-ease, data-lift,
   data-mode="blend" (weight and slant ease in together, the true italic takes over at the end),
   data-mode="weight" (bold only, no italic). */
(function () {
  var groups = document.querySelectorAll('[data-italic-motion]');
  if (!groups.length || !('animate' in Element.prototype)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var T = { dur: 400, stagger: 40, delay: 300, gap: 650, from: 600, to: 800, lift: 4, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' };
  function opt(el, key) { var v = el.getAttribute('data-' + key); return v === null ? T[key] : (isNaN(v) ? v : +v); }
  groups.forEach(function (group, g) {
    var from = opt(group, 'from'), lift = opt(group, 'lift');
    var mode = group.getAttribute('data-mode');
    var frames = mode === 'weight' ? [
      { offset: 0,   fontWeight: from, transform: 'translateY(0)' },
      { offset: 0.5, transform: 'translateY(' + (-lift) + 'px)' },
      { offset: 1,   fontWeight: T.to, transform: 'translateY(0)' }
    ] : mode === 'blend' ? [
      { offset: 0,    fontWeight: from, fontStyle: 'normal', transform: 'skewX(0deg)' },
      { offset: 0.94, fontWeight: T.to, fontStyle: 'normal', transform: 'skewX(-10deg)' },
      { offset: 0.95, fontWeight: T.to, fontStyle: 'italic', transform: 'skewX(0deg)' },
      { offset: 1,    fontWeight: T.to, fontStyle: 'italic', transform: 'skewX(0deg)' }
    ] : [
      { offset: 0,   fontWeight: from, fontStyle: 'normal', transform: 'translateY(0)' },
      { offset: 0.5, fontStyle: 'italic', transform: 'translateY(' + (-lift) + 'px)' },
      { offset: 1,   fontWeight: T.to, fontStyle: 'italic', transform: 'translateY(0)' }
    ];
    var start = opt(group, 'delay') + g * T.gap, dur = opt(group, 'dur'), stagger = opt(group, 'stagger'), ease = opt(group, 'ease');
    var last;
    group.querySelectorAll('.kw-l').forEach(function (letter, i) {
      last = letter.animate(frames, { duration: dur, delay: start + i * stagger, easing: ease, fill: 'both' });
    });
    if (last) last.finished.then(function () {
      group.dispatchEvent(new CustomEvent('italicdone', { bubbles: true }));
    });
  });
})();
