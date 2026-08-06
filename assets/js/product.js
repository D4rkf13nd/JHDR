// ─── Product Bento Card → Modal ────────────────────────────
const jhModalOverlay = document.getElementById('jhModalOverlay');
const jhModalImage = document.getElementById('jhModalImage');
const jhModalTitle = document.getElementById('jhModalTitle');
const jhModalDesc = document.getElementById('jhModalDesc');
const jhModalSpecs = document.getElementById('jhModalSpecs');
const jhModalClose = document.getElementById('jhModalClose');
const jhModalCta = document.getElementById('jhModalCta');
const jhModalGallery = document.getElementById('jhModalGallery');
const jhModalGallerySection = jhModalGallery ? jhModalGallery.closest('.jh-modal-gallery') : null;

// ─── Photo carousel: plain scrollable strip, no JS-driven animation ──
// #jhModalImage is a horizontally-scrolling container (native browser
// scroll + CSS scroll-snap does all the work). Each photo is a full-width
// slide inside it. No transform/drag code — just scroll it like a list.
let jhCarouselTrack = null;
let jhCarouselDots = null;
let jhCarouselObserver = null;

function ensureCarouselDom() {
  if (!jhModalImage || jhCarouselTrack) return;

  jhModalImage.classList.add('jh-carousel-viewport');

  jhCarouselTrack = document.createElement('div');
  jhCarouselTrack.className = 'jh-carousel-track';
  jhModalImage.appendChild(jhCarouselTrack);

  jhCarouselDots = document.createElement('div');
  jhCarouselDots.className = 'jh-carousel-dots';
  jhModalImage.appendChild(jhCarouselDots);
}

// Current gallery state for the open card.
let jhGalleryImages = [];

function formatPeso(amount) {
  const num = Number(amount);
  if (!amount || Number.isNaN(num)) return null;
  return '₱' + num.toLocaleString('en-PH');
}

function scrollToSlide(index) {
  const slides = jhCarouselTrack.querySelectorAll('.jh-carousel-slide');
  const target = slides[index];
  if (!target) return;
  jhModalImage.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });

  if (jhModalGallery) {
    jhModalGallery.querySelectorAll('.jh-modal-gallery-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === index);
    });
  }
  if (jhCarouselDots) {
    jhCarouselDots.querySelectorAll('.jh-carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }
}

function buildTrackSlides(card) {
  jhCarouselTrack.innerHTML = '';

  jhGalleryImages.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'jh-carousel-slide';

    const imgEl = document.createElement('img');
    imgEl.src = src;
    imgEl.alt = `${card.dataset.title || 'Product'} photo ${i + 1}`;
    imgEl.loading = 'lazy';

    slide.appendChild(imgEl);
    jhCarouselTrack.appendChild(slide);
  });

  buildCarouselDots(jhGalleryImages.length);
  observeCarouselSlides();
}

// Builds one dot per photo, overlaid at the bottom of the modal image.
// Hidden entirely when there's only one photo (nothing to paginate).
function buildCarouselDots(count) {
  if (!jhCarouselDots) return;
  jhCarouselDots.innerHTML = '';

  if (count <= 1) {
    jhCarouselDots.style.display = 'none';
    return;
  }
  jhCarouselDots.style.display = '';

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'jh-carousel-dot';
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Go to photo ${i + 1} of ${count}`);
    dot.addEventListener('click', () => scrollToSlide(i));
    jhCarouselDots.appendChild(dot);
  }
}

// Keeps the dots (and gallery thumbnails) in sync when the photo is
// swiped/dragged directly, not just when a dot or thumbnail is clicked.
function observeCarouselSlides() {
  if (jhCarouselObserver) jhCarouselObserver.disconnect();

  const slides = Array.from(jhCarouselTrack.querySelectorAll('.jh-carousel-slide'));
  if (!slides.length) return;

  jhCarouselObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = slides.indexOf(entry.target);
      if (idx === -1) return;

      if (jhCarouselDots) {
        jhCarouselDots.querySelectorAll('.jh-carousel-dot').forEach((d, i) => {
          d.classList.toggle('active', i === idx);
        });
      }
      if (jhModalGallery) {
        jhModalGallery.querySelectorAll('.jh-modal-gallery-thumb').forEach((t, i) => {
          t.classList.toggle('active', i === idx);
        });
      }
    });
  }, { root: jhModalImage, threshold: 0.6 });

  slides.forEach(s => jhCarouselObserver.observe(s));
}

function renderGallery(card, mainImg) {
  if (!jhModalGallery) return;

  const raw = card.dataset.galleryImgs || '';
  const extra = raw.split('|').map(s => s.trim()).filter(Boolean);

  // Main card photo is always the first slide; gallery photos follow.
  // Duplicate paths (if the main photo is repeated in gallery-imgs) are
  // dropped so the same photo doesn't show twice in a row.
  jhGalleryImages = [mainImg, ...extra].filter((v, i, arr) => v && arr.indexOf(v) === i);

  buildTrackSlides(card);
  jhModalImage.scrollLeft = 0;

  jhModalGallery.innerHTML = '';

  // Only the main photo, nothing to browse → hide the whole "Gallery" block.
  if (jhGalleryImages.length <= 1) {
    if (jhModalGallerySection) jhModalGallerySection.style.display = 'none';
    return;
  }

  if (jhModalGallerySection) jhModalGallerySection.style.display = '';

  jhGalleryImages.forEach((src, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'jh-modal-gallery-thumb';
    if (i === 0) thumb.classList.add('active');

    const imgEl = document.createElement('img');
    imgEl.src = src;
    imgEl.alt = `${card.dataset.title || 'Product'} photo ${i + 1}`;
    imgEl.loading = 'lazy';

    thumb.appendChild(imgEl);
    thumb.addEventListener('click', () => scrollToSlide(i));

    jhModalGallery.appendChild(thumb);
  });
}

function openProductModal(card) {
  ensureCarouselDom();

  const img = card.dataset.img || '';
  const title = card.dataset.title || '';
  const desc = card.dataset.desc || '';
  const price = formatPeso(card.dataset.price);
  const specs = (card.dataset.specs || '')
    .split('|')
    .filter(Boolean)
    .map(pair => {
      // Fixed: pair.split(':') would silently drop everything after a
      // second colon (e.g. a spec value that itself contains ":"). Splitting
      // only on the first colon keeps the rest of the value intact.
      const sep = pair.indexOf(':');
      const label = sep === -1 ? pair : pair.slice(0, sep);
      const value = sep === -1 ? '' : pair.slice(sep + 1);
      return { label: label.trim(), value: value.trim() };
    });

  jhModalTitle.textContent = title;
  jhModalDesc.textContent = desc;
  if (jhModalCta) {
    jhModalCta.textContent = price || 'Request Quote';
  }
  jhModalSpecs.innerHTML = specs.map(s =>
    `<div class="jh-modal-spec-item">
       <span class="jh-modal-spec-label">${s.label}</span>
       <span class="jh-modal-spec-value">${s.value}</span>
     </div>`
  ).join('');

  renderGallery(card, img);

  jhModalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  jhModalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (jhModalOverlay) {
  document.querySelectorAll('.bento-card').forEach(card => {
    const badge = card.querySelector('.card-badge');
    if (badge) {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        openProductModal(card);
      });
    }
    card.addEventListener('click', () => openProductModal(card));
  });

  jhModalClose.addEventListener('click', closeProductModal);
  jhModalOverlay.addEventListener('click', (e) => {
    if (e.target === jhModalOverlay) closeProductModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
  });
}

// ─── Carousel dot indicators (replaces the native scrollbar) ──────
// Runs for every .bento-track-container on the page (Products row +
// Signature Villas row), building one dot per photo card. Clicking a dot
// scrolls to that card; scrolling the row updates which dot is active.
function initBentoDots() {
  document.querySelectorAll('.bento-track-container').forEach(trackContainer => {
    const grid = trackContainer.querySelector('.bento-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.bento-card'));
    if (cards.length <= 1) return; // nothing to paginate

    // Only show dots when the row can actually scroll (mobile one-by-one
    // mode). On desktop the cards wrap instead of scrolling, so there's
    // nothing to paginate and dots would just sit there doing nothing.
    if (grid.scrollWidth <= grid.clientWidth + 4) return;

    const dots = document.createElement('div');
    dots.className = 'bento-dots';

    cards.forEach((card, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'bento-dot';
      dot.setAttribute('aria-label', `Go to photo ${i + 1} of ${cards.length}`);
      if (i === 0) dot.classList.add('active');

      dot.addEventListener('click', () => {
        card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      });

      dots.appendChild(dot);
    });

    trackContainer.insertAdjacentElement('afterend', dots);

    // Keep dots in sync with whichever card is currently in view,
    // whether the row was scrolled by drag, wheel, or the dots themselves.
    const dotEls = dots.querySelectorAll('.bento-dot');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = cards.indexOf(entry.target);
        if (idx === -1) return;
        dotEls.forEach((d, i) => d.classList.toggle('active', i === idx));
      });
    }, {
      root: grid,
      threshold: 0.6
    });

    cards.forEach(card => observer.observe(card));
  });
}

initBentoDots();