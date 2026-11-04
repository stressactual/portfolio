// Contact bubble: toggles on click, closes on outside click or Esc, copies the email.
// Fading and floating are handled in style.css via the "is-open" class.
(() => {
  const trigger = document.querySelector('[aria-controls="contact-pop"]');
  const pop = document.getElementById('contact-pop');
  if (!trigger || !pop) return;

  const emailEl = pop.querySelector('.email');
  const copyBtn = pop.querySelector('[data-copy]');
  const isOpen = () => pop.classList.contains('is-open');

  // Keep the bubble inside the screen on narrow viewports.
  const place = () => {
    pop.style.left = '0px';
    const over = pop.getBoundingClientRect().right - (window.innerWidth - 12);
    if (over > 0) pop.style.left = -over + 'px';
  };

  const open = () => {
    place();
    pop.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  };

  const close = (returnFocus) => {
    pop.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  };

  trigger.addEventListener('click', () => (isOpen() ? close() : open()));

  document.addEventListener('click', (e) => {
    if (isOpen() && !pop.contains(e.target) && !trigger.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close(true);
  });

  window.addEventListener('resize', () => { if (isOpen()) place(); });

  copyBtn.addEventListener('click', async () => {
    const email = emailEl.textContent.trim();
    let label = 'copied';
    try {
      await navigator.clipboard.writeText(email);
    } catch (_) {
      // Fallback: select the address so it can be copied by hand.
      const range = document.createRange();
      range.selectNodeContents(emailEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      label = 'selected';
    }
    copyBtn.textContent = label;
    setTimeout(() => { copyBtn.textContent = 'copy'; }, 1800);
  });
})();

// Page fade-out: when an on-site link is clicked, fade the content out, then go.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Coming back via the back button can restore the page mid-fade; reset it.
  window.addEventListener('pageshow', (e) => { if (e.persisted) root.classList.remove('leaving'); });

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download')) return;
    if (a.protocol !== location.protocol || a.host !== location.host) return; // external or mailto
    if (a.pathname === location.pathname && a.hash) return;                   // same-page anchor
    if (reduce.matches) return;

    e.preventDefault();
    root.classList.add('leaving');
    setTimeout(() => { location.href = a.href; }, 250);
  });
})();
