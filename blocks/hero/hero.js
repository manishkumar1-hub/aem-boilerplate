/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */

export default function decorate(block) {
  const rows = [...block.children];

  // Find the authored style row
  const styleRow = rows.find((row) => {
    const cells = [...row.children];

    return cells[0]?.textContent.trim().toLowerCase() === 'style';
  });

  // Read the variant name from the second cell
  const styleCells = styleRow ? [...styleRow.children] : [];

  const variant = styleCells[1]?.textContent.trim().toLowerCase()
    || 'default';

  // Remove the style row from content processing
  const contentRows = rows.filter((row) => row !== styleRow);

  // Read Hero content
  const heading = contentRows[0]?.textContent.trim() || '';
  const description = contentRows[1]?.textContent.trim() || '';
  const link = contentRows[2]?.querySelector('a');
  const image = contentRows[3]?.querySelector('img');

  // Apply variant class
  block.classList.remove('hero-default', 'hero-dark', 'hero-center');
  block.classList.add(`hero-${variant}`);

  // Create content container
  const content = document.createElement('div');
  content.className = 'hero-content';

  // Create heading
  const title = document.createElement('h1');
  title.textContent = heading;
  content.append(title);

  // Create description
  if (description) {
    const paragraph = document.createElement('p');
    paragraph.textContent = description;
    content.append(paragraph);
  }

  // Create CTA button
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

  // Replace original block content
  block.replaceChildren(content, visual);
}
