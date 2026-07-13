export default function decorate(block) {
  const slides = [...block.children];

  const track = document.createElement('div');
  track.className = 'testimonial-carousel-track';

  slides.forEach((row, i) => {
    row.classList.add('testimonial-slide');
    if (i !== 0) row.setAttribute('aria-hidden', 'true');
    track.appendChild(row);
  });

  block.textContent = '';
  block.appendChild(track);

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

  let current = 0;
  const showSlide = (index) => {
    const total = slides.length;
    current = (index + total) % total;
    slides.forEach((slide, i) => {
      slide.style.display = i === current ? '' : 'none';
      slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
  };

  prevBtn.addEventListener('click', () => showSlide(current - 1));
  nextBtn.addEventListener('click', () => showSlide(current + 1));

  showSlide(0);
}
