export default function decorate(block) {
  const slides = [...block.children];
  let current = 0;

  const track = document.createElement('div');
  track.className = 'carousel-track';

  slides.forEach((row, i) => {
    const [imageDiv, captionDiv] = row.children;
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.hidden = i !== 0;

    const img = imageDiv ? imageDiv.querySelector('img') : null;
    if (img) slide.append(img);

    if (captionDiv) {
      const caption = document.createElement('p');
      caption.className = 'carousel-caption';
      caption.textContent = captionDiv.textContent.trim();
      slide.append(caption);
    }

    track.append(slide);
    row.remove();
  });

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-prev';
  prevBtn.type = 'button';
  prevBtn.textContent = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-next';
  nextBtn.type = 'button';
  nextBtn.textContent = '›';

  function showSlide(index) {
    track.querySelectorAll('.carousel-slide').forEach((s, i) => { s.hidden = i !== index; });
  }

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  });

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  });

  block.append(track, prevBtn, nextBtn);
}
