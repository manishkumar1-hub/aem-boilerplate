/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */
import './faq-accordion.css';

export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length < 2) return;

    const questionDiv = cells[0];
    const answerDiv = cells[1];

    const wrapper = document.createElement('div');
    wrapper.className = 'accordion-item';

    const button = document.createElement('button');
    button.className = 'accordion-question';
    button.type = 'button';
    button.textContent = questionDiv.textContent.trim();
    button.setAttribute('aria-expanded', 'false');

    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '+';
    button.append(icon);

    const panel = document.createElement('div');
    panel.className = 'accordion-answer';
    panel.id = `accordion-panel-${Math.random().toString(36).slice(2, 9)}`;
    panel.append(...answerDiv.childNodes);
    panel.hidden = true;

    button.setAttribute('aria-controls', panel.id);

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
      icon.textContent = isOpen ? '+' : '−';
    });

    wrapper.append(button, panel);
    row.replaceWith(wrapper);
  });
}
