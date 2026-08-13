export default async function decorate(block) {
  const resp = await fetch('/query-index.json');
  const { data } = await resp.json();

  // Keep the filtered + sorted list in memory so we can re-filter on each keystroke
  const pages = data
    .filter((page) => page.path !== '/')
    .sort((a, b) => Number(b.lastModified) - Number(a.lastModified));

  // --- build the UI shell: a search box + a container for the cards ---
  block.textContent = '';

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search pages...';
  search.className = 'card-index-search';

  const grid = document.createElement('div');
  grid.className = 'card-index-grid';

  block.append(search, grid);

  // --- one reusable function that builds a single card ---
  function buildCard(page) {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = page.path;

    if (page.image && !page.image.includes('default-meta-image')) {
      const img = document.createElement('img');
      img.src = page.image;
      img.alt = page.title || '';
      card.append(img);
    }

    const h3 = document.createElement('h3');
    h3.textContent = page.title || page.path;
    card.append(h3);

    const p = document.createElement('p');
    p.textContent = page.description || '';
    card.append(p);

    return card;
  }

  // --- render function: clears the grid, then shows matching cards ---
  function render(query) {
    const q = query.trim().toLowerCase();
    grid.textContent = '';
    pages
      .filter((page) => {
        if (!q) return true; // empty box = show all
        const haystack = `${page.title} ${page.description}`.toLowerCase();
        return haystack.includes(q);
      })
      .forEach((page) => grid.append(buildCard(page)));
  }

  // --- wire it up: re-render every time the user types ---
  search.addEventListener('input', () => render(search.value));

  // initial paint (empty query = all cards)
  render('');
}
