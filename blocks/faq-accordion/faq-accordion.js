/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */
import './faq-accordion.css';

export default function decorate(block) {
  const rows = [...block.children];
  const list = document.createElement('div');
  list.className = 'faq-accordion-list';

  rows.forEach((row, index) => {
    const cells = [...row.children];
    const question = cells[0]?.textContent.trim() || '';
    const answer = cells[1]?.textContent.trim() || '';

    if (!question) return;

    const item = document.createElement('section');
    item.className = 'faq-accordion-item';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'faq-accordion-question';
    button.textContent = question;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `faq-panel-${index}`);

    const panel = document.createElement('div');
    panel.id = `faq-panel-${index}`;
    panel.className = 'faq-accordion-answer';
    panel.hidden = true;

    const paragraph = document.createElement('p');
    paragraph.textContent = answer;
    panel.append(paragraph);

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });

    item.append(button, panel);
    list.append(item);
  });

  block.replaceChildren(list);
}
