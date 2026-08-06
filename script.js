// ─── Scroll Reveal (continuous) ────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    } else {
      e.target.classList.remove('visible');
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => io.observe(el));

// ─── Count-Up Numbers ───────────────────────────────────────
const countEls = document.querySelectorAll('.count-up');

function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1200; // ms
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;

    if (progress < 1) {
      el.dataset.raf = requestAnimationFrame(tick);
    } else {
      el.textContent = target + suffix;
    }
  }

  if (el.dataset.raf) cancelAnimationFrame(Number(el.dataset.raf));
  el.dataset.raf = requestAnimationFrame(tick);
}

const countIo = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
    }
  });
}, { threshold: 0.4 });

countEls.forEach(el => countIo.observe(el));

// ─── Polaroid Carousel ─────────────────────────────────────
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselDotsContainer = document.getElementById('carouselDots');

if (carouselTrack) {
  const cards = carouselTrack.querySelectorAll('.polaroid-card');
  const cardWidth = 280 + 32;
  let currentIndex = 0;
  const cardsPerView = 4;
  const totalCards = cards.length;

  function createDots() {
    carouselDotsContainer.innerHTML = '';
    const dotCount = Math.ceil((totalCards - cardsPerView) + 1);
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      carouselDotsContainer.appendChild(dot);
    }
  }

  function moveCarousel() {
    const offset = -currentIndex * cardWidth;
    carouselTrack.style.transform = `translateX(${offset}px)`;
    updateDots();
  }

  function updateDots() {
    const dots = carouselDotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function goToSlide(index) {
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    currentIndex = Math.min(index, maxIndex);
    moveCarousel();
  }

  function nextSlide() {
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    currentIndex = (currentIndex + 1) > maxIndex ? 0 : currentIndex + 1;
    moveCarousel();
  }

  function prevSlide() {
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    currentIndex = (currentIndex - 1) < 0 ? maxIndex : currentIndex - 1;
    moveCarousel();
  }

  carouselNext.addEventListener('click', nextSlide);
  carouselPrev.addEventListener('click', prevSlide);

  function adjustCarousel() {
    const width = window.innerWidth;
    let newCardsPerView = 4;
    if (width < 1200) newCardsPerView = 3;
    if (width < 768) newCardsPerView = 2;
    if (width < 480) newCardsPerView = 1;

    if (newCardsPerView !== cardsPerView) {
      currentIndex = 0;
      moveCarousel();
      createDots();
    }
  }

  createDots();
  window.addEventListener('resize', adjustCarousel);
}