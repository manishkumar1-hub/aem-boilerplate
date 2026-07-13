export default function decorate(block) {
  const slides = [...block.children];

  slides.forEach((slide, i) => {
    slide.classList.add('testimonial-slide');

    const [quoteEl, nameEl, roleEl, avatarEl] = slide.children;
    quoteEl?.classList.add('testimonial-quote');
    nameEl?.classList.add('testimonial-name');
    roleEl?.classList.add('testimonial-role');
    avatarEl?.classList.add('testimonial-avatar');

    // Only the first slide is visible at load
    slide.style.display = i === 0 ? '' : 'none';
  });

  // Build nav controls once, after the slides
  const nav = document.createElement('div');
  nav.className = 'testimonial-carousel-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'testimonial-carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous testimonial');
  prevBtn.textContent = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'testimonial-carousel-next';
  nextBtn.setAttribute('aria-label', 'Next testimonial');
  nextBtn.textContent = '›';

  nav.append(prevBtn, nextBtn);
  block.appendChild(nav);

  // Slide-switching logic
  let current = 0;
  const showSlide = (index) => {
    const total = slides.length;
    current = (index + total) % total; // wraps around at either end
    slides.forEach((slide, i) => {
      slide.style.display = i === current ? '' : 'none';
    });
  };

  prevBtn.addEventListener('click', () => showSlide(current - 1));
  nextBtn.addEventListener('click', () => showSlide(current + 1));
}
