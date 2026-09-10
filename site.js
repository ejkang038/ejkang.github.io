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

/* Lazy video: nothing downloads until the clip scrolls into view */
(function(){
  var vids = document.querySelectorAll('video.lazy-video');
  if (!vids.length) return;
  if (!('IntersectionObserver' in window)) {
    vids.forEach(function(v){ v.setAttribute('preload','metadata'); v.play().catch(function(){}); });
    return;
  }
  var obs = new IntersectionObserver(function(items){
    items.forEach(function(e){
      var v = e.target;
      if (e.isIntersecting) {
        v.preload = 'auto';
        v.play().catch(function(){});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, { threshold: 0.25 });
  vids.forEach(function(v){ obs.observe(v); });
})();
