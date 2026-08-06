// ─── Modal Specs Reveal Animation & Price Display ──────────────────────────
// Separate from product.js on purpose: this file only watches the specs
// list for changes and staggers a fade/slide-in reveal on each item. It
// also updates the CTA button to display the product price instead of "Request Quote".

(function () {
  const specsContainer = document.getElementById('jhModalSpecs');
  const modalTitle = document.getElementById('jhModalTitle');
  const modalCTA = document.querySelector('.jh-modal-cta');
  
  if (!specsContainer) return;

  // Product price mapping (in Philippine Pesos)
  const productPrices = {
    'Practical Home': '₱165,000',
    'Woodhouse Unit -01': '₱175,000',
    'Prestige Home': '₱205,000'
  };

  const STAGGER_MS = 60; // delay between each spec item's reveal

  function revealSpecItems() {
    const items = specsContainer.querySelectorAll('.jh-modal-spec-item');

    items.forEach((item, index) => {
      // Reset to the hidden state first in case this item is being
      // re-revealed (e.g. user closes and reopens the modal quickly).
      item.classList.remove('jh-reveal-in');
      item.style.transitionDelay = `${index * STAGGER_MS}ms`;
    });

    // Force a reflow so the browser registers the "hidden" state above
    // before we flip the class, otherwise the transition can get skipped.
    void specsContainer.offsetHeight;

    requestAnimationFrame(() => {
      items.forEach(item => item.classList.add('jh-reveal-in'));
    });
  }

  function updateModalPrice() {
    const productName = modalTitle.textContent.trim();
    const price = productPrices[productName];

    if (price && modalCTA) {
      modalCTA.textContent = price;
      // Style the price to match your design
      modalCTA.style.fontSize = '1.125rem';
      modalCTA.style.fontWeight = '600';
      modalCTA.style.letterSpacing = '0.5px';
      // Optional: change color to highlight price
      // modalCTA.style.color = '#FF6B35'; // adjust to your brand color
    }
  }

  // Specs are injected via innerHTML by product.js each time a card is
  // clicked, so watch for that instead of coupling to product.js directly.
  const observer = new MutationObserver(() => {
    revealSpecItems();
    // Update price when modal content changes
    setTimeout(updateModalPrice, 50);
  });

  observer.observe(specsContainer, { childList: true });

  // Also watch for title changes in case the price needs updating
  const titleObserver = new MutationObserver(() => {
    updateModalPrice();
  });

  if (modalTitle) {
    titleObserver.observe(modalTitle, { childList: true, characterData: true, subtree: true });
  }
})();

/* ─── Villa/Products Outro — scroll reveal ─────────────────────────────
   Watches every .products-outro element on the page and adds .reveal-in
   once it scrolls into view. Safe to include even if the element doesn't
   exist on a given page (querySelectorAll just returns an empty list). */

(function () {
  const targets = document.querySelectorAll('.products-outro');
  if (!targets.length) return;

  // Respect users who've asked for reduced motion — show immediately,
  // no observer needed.
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('reveal-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          obs.unobserve(entry.target); // reveal once, don't re-toggle on re-scroll
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -60px 0px', // triggers slightly before it's fully in view
      threshold: 0.15,
    }
  );

  targets.forEach((el) => observer.observe(el));
})();