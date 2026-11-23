/**
 * Carousel Block - Accessible image & promotional slide carousel
 * @param {Element} block The carousel block element
 */
export default function decorate(block) {
  const rows = [...block.children].filter((row) => (
    row.querySelector('picture img, img')
  ));

  if (!rows.length) return;

  let current = 0;

  // Fixed class name typo ('carousel-container') so relative arrow positioning works
  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-roledescription', 'carousel');
  container.setAttribute('aria-label', 'Featured collections');

  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  const slides = [];

  rows.forEach((row, index) => {
    const [imageDiv, contentDiv] = row.children;

    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.hidden = index !== 0;

    const image = imageDiv?.querySelector('picture img, img');
    if (image) {
      const picture = image.closest('picture') || image;
      slide.append(picture);
      image.loading = index === 0 ? 'eager' : 'lazy';
      if (index === 0) {
        image.fetchPriority = 'high';
      }
    }

    if (contentDiv) {
      const content = document.createElement('div');
      content.className = 'carousel-content';

      const paragraphs = [...contentDiv.children].filter(
        (element) => element.textContent.trim(),
      );

      const heading = document.createElement('h2');
      heading.textContent = paragraphs[0]?.textContent.trim() || `Slide ${index + 1}`;
      content.append(heading);

      const link = contentDiv.querySelector('a');
      const descriptionText = paragraphs
        .slice(1)
        .filter((element) => !element.contains(link))
        .map((element) => element.textContent.trim())
        .filter(Boolean)
        .join(' ');

      if (descriptionText) {
        const description = document.createElement('p');
        description.textContent = descriptionText;
        content.append(description);
      }

      if (link) {
        const button = document.createElement('a');
        button.className = 'carousel-button';
        button.href = link.href;
        button.textContent = link.textContent.trim();
        content.append(button);
      }

      slide.append(content);
    }

    track.append(slide);
    slides.push(slide);
  });

  const previousButton = document.createElement('button');
  previousButton.className = 'carousel-prev';
  previousButton.type = 'button';
  previousButton.textContent = '‹';
  previousButton.setAttribute('aria-label', 'Previous slide');

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-next';
  nextButton.type = 'button';
  nextButton.textContent = '›';
  nextButton.setAttribute('aria-label', 'Next slide');

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';

  let showSlide;

  const dots = slides.map((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index));
    dotsContainer.append(dot);
    return dot;
  });

  showSlide = (index) => {
    current = index;

    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
    });

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });

    previousButton.disabled = current === 0;
    nextButton.disabled = current === slides.length - 1;
  };

  previousButton.addEventListener('click', () => {
    if (current > 0) showSlide(current - 1);
  });

  nextButton.addEventListener('click', () => {
    if (current < slides.length - 1) showSlide(current + 1);
  });

  viewport.append(track);
  container.append(viewport, previousButton, nextButton, dotsContainer);
  block.replaceChildren(container);

  showSlide(0);
}
