/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */
import './hero.css';

export default function decorate(block) {
  const rows = [...block.children];

  // Read the authored content from each row.
  const heading = rows[0]?.textContent.trim() || '';
  const description = rows[1]?.textContent.trim() || '';
  const link = rows[2]?.querySelector('a');
  const image = rows[3]?.querySelector('img');

  // Build the hero content.
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

  block.replaceChildren();

  if (image) {
    const visual = document.createElement('div');
    visual.className = 'hero-image';
    visual.append(image);
    block.append(content, visual);
  } else {
    block.append(content);
  }
}
