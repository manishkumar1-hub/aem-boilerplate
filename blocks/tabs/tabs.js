export default function decorate(block) {
  const rows = [...block.children];
  const tabList = document.createElement('div');
  tabList.className = 'tabs-list';
  tabList.setAttribute('role', 'tablist');

  rows.forEach((row, i) => {
    const [labelDiv, contentDiv] = row.children;
    const label = labelDiv.textContent.trim();

    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.textContent = label;
    button.type = 'button';
    button.id = `tab-${i}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `panel-${i}`);
    button.setAttribute('aria-selected', i === 0);
    tabList.append(button);

    contentDiv.className = 'tabs-panel';
    contentDiv.id = `panel-${i}`;
    contentDiv.setAttribute('role', 'tabpanel');
    contentDiv.setAttribute('aria-labelledby', `tab-${i}`);
    if (i !== 0) contentDiv.hidden = true;

    row.replaceWith(contentDiv);

    button.addEventListener('click', () => {
      block.querySelectorAll('.tabs-tab').forEach((b) => b.setAttribute('aria-selected', 'false'));
      block.querySelectorAll('.tabs-panel').forEach((p) => { p.hidden = true; });
      button.setAttribute('aria-selected', 'true');
      contentDiv.hidden = false;
    });
  });

  block.prepend(tabList);
}