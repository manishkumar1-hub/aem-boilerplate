export default async function decorate(block) {
  const sheetPath = block.textContent.trim() || '/faq.json';
  block.textContent = '';

  const loading = document.createElement('p');
  loading.className = 'faq-sheet-loading';
  loading.textContent = 'Loading FAQs...';
  block.append(loading);

  try {
    const response = await fetch(sheetPath);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const json = await response.json();
    const items = json.data;

    loading.remove();

    const list = document.createElement('div');
    list.className = 'faq-sheet-list';

    items.forEach((item) => {
      const entry = document.createElement('div');
      entry.className = 'faq-sheet-item';

      const q = document.createElement('h3');
      q.className = 'faq-sheet-question';
      q.textContent = item.question;

      const a = document.createElement('p');
      a.className = 'faq-sheet-answer';
      a.textContent = item.answer;

      entry.append(q, a);
      list.append(entry);
    });

    block.append(list);
  } catch (error) {
    loading.textContent = 'Unable to load FAQs right now.';
    console.error('faq-sheet block error:', error);
  }
}
