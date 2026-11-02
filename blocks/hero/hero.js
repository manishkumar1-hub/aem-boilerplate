/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Read the authored content
  const heading = rows[0]?.textContent.trim() || '';
  const description = rows[1]?.textContent.trim() || '';
  const link = rows[2]?.querySelector('a');
  const image = rows[3]?.querySelector('img');

  // Read the block variant
  const variant = [...block.classList]
    .find((className) => ['dark', 'center'].includes(className)) || 'default';

  // Add the variant class
  block.classList.add(`hero-${variant}`);

  // Create content container
  const content = document.createElement('div');
  content.className = 'hero-content';

  const title = document.createElement('h1');
  title.textContent = heading;
  content.append(title);

  if (description) {
    const paragraph = document.createElement('p');
    paragraph.textContent = description;
    content.append(paragraph);
  }

  if (link) {
    const button = document.createElement('a');
    button.className = 'hero-button';
    button.href = link.href;
    button.textContent = link.textContent.trim();
    content.append(button);
  }

  // Create image container
  const visual = document.createElement('div');
  visual.className = 'hero-image';

  if (image) {
    visual.append(image);
  }

  // Replace original content
  block.replaceChildren(content, visual);
}
