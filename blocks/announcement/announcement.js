/**
 * Decorates the Announcement Banner block.
 * @param {Element} block The announcement block element
 */
export default function decorate(block) {
  // Extract all rows created by the auto-blocker or authoring table
  const rows = [...block.children];

  rows.forEach((row) => {
    row.classList.add('announcement-row');
    const cells = [...row.children];

    cells.forEach((cell) => {
      cell.classList.add('announcement-cell');

      // Wrap paragraph contents in a dedicated text container for flex alignment
      const wrapper = document.createElement('div');
      wrapper.className = 'announcement-content';

      while (cell.firstChild) {
        wrapper.appendChild(cell.firstChild);
      }

      cell.appendChild(wrapper);
    });
  });
}