export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const [questionDiv, answerDiv] = row.children;

    const wrapper = document.createElement('div');
    wrapper.className = 'accordion-item';

    const button = document.createElement('button');
    button.className = 'accordion-question';
    button.type = 'button';
    button.textContent = questionDiv.textContent.trim();
    button.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('div');
    panel.className = 'accordion-answer';
    panel.append(...answerDiv.childNodes);
    panel.hidden = true;

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });

    wrapper.append(button, panel);
    row.replaceWith(wrapper);
  });
}
