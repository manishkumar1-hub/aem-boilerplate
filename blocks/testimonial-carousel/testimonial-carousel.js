export default function decorate(block) {
  const slides = [...block.children]; // each child = one testimonial row

  slides.forEach((row, i) => {
    row.classList.add('testimonial-slide');
    const cells = [...row.children]; // [0] = text cell, [1] = image cell
    cells[0]?.classList.add('testimonial-content');
    cells[1]?.classList.add('testimonial-avatar');
    if (i !== 0) row.style.display = 'none';
  });

  const nav = document.createElement('div');
  nav.className = 'testimonial-carousel-nav';
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  prevBtn.setAttribute('aria-label', 'Previous testimonial');
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.setAttribute('aria-label', 'Next testimonial');
  nav.append(prevBtn, nextBtn);
  block.appendChild(nav);

  let current = 0;
  const showSlide = (index) => {
    const total = slides.length;
    current = (index + total) % total;
    slides.forEach((slide, i) => {
      slide.style.display = i === current ? '' : 'none';
    });
  };

  prevBtn.addEventListener('click', () => showSlide(current - 1));
  nextBtn.addEventListener('click', () => showSlide(current + 1));
}
