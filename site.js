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
