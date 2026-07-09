export default function decorate(block) {
  const items = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'stats-grid';

  items.forEach((row) => {
    const [numberDiv, labelDiv] = row.children;
    const targetValue = parseInt(numberDiv.textContent.trim(), 10) || 0;
    const label = labelDiv.textContent.trim();

    const item = document.createElement('div');
    item.className = 'stats-item';

    const numberEl = document.createElement('div');
    numberEl.className = 'stats-number';
    numberEl.textContent = '0';

    const labelEl = document.createElement('div');
    labelEl.className = 'stats-label';
    labelEl.textContent = label;

    item.append(numberEl, labelEl);
    wrapper.append(item);
    row.remove();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(numberEl, targetValue);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(item);
  });

  block.append(wrapper);
}

function animateCount(el, target) {
  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
