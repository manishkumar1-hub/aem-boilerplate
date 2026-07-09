export default function decorate(block) {
  const [quoteRow, authorRow] = [...block.children];

  const quoteText = quoteRow.textContent.trim();
  const authorText = authorRow ? authorRow.textContent.trim() : '';

  block.textContent = '';

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-text';
  blockquote.textContent = quoteText;
  block.append(blockquote);

  if (authorText) {
    const cite = document.createElement('cite');
    cite.className = 'quote-author';
    cite.textContent = authorText;
    block.append(cite);
  }
}
