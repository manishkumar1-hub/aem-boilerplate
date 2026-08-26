/*
 * Search / Listing Block
 * ------------------------------------------------------------------
 * Fetches a query index (built by helix-query.yaml) and renders a
 * searchable list of pages. No external dependencies.
 *
 * Authoring (a table on the page):
 *   | Search      |                        |
 *   | source      | /blog/query-index.json |
 *   | placeholder | Search the blog…       |
 *   | limit       | 500                    |
 * ------------------------------------------------------------------
 */
/* eslint-disable */

// Fetch every row from a sheet-style index JSON, paging if needed.
async function fetchIndex(source, pageSize) {
  const rows = [];
  let offset = 0;
  // For a small index this is a single request; large ones loop.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await fetch(`${source}?limit=${pageSize}&offset=${offset}`);
    if (!resp.ok) break;
    const json = await resp.json();
    const batch = json.data || [];
    rows.push(...batch);
    const total = json.total != null ? json.total : rows.length;
    offset += pageSize;
    if (!batch.length || offset >= total) break;
  }
  return rows;
}

function buildCard(item) {
  const a = document.createElement('a');
  a.className = 'search-card';
  a.href = item.path || '#';

  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title || '';
    img.loading = 'lazy';
    a.append(img);
  }

  const body = document.createElement('div');
  body.className = 'search-card-body';

  const h = document.createElement('h3');
  h.textContent = item.title || item.path;
  body.append(h);

  if (item.description) {
    const p = document.createElement('p');
    p.textContent = item.description;
    body.append(p);
  }
  if (item.author || item.publishDate) {
    const meta = document.createElement('span');
    meta.className = 'search-card-meta';
    meta.textContent = [item.author, item.publishDate].filter(Boolean).join(' · ');
    body.append(meta);
  }

  a.append(body);
  return a;
}

// Read the config table into an object with sensible defaults.
function readConfig(block) {
  const cfg = { source: '/query-index.json', placeholder: 'Search…', limit: '500' };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const val = cells[1].textContent.trim();
    if (key && val) cfg[key] = val;
  });
  return cfg;
}

export default async function decorate(block) {
  const cfg = readConfig(block);
  block.textContent = '';

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'search-input';
  input.placeholder = cfg.placeholder;

  const count = document.createElement('p');
  count.className = 'search-count';

  const results = document.createElement('div');
  results.className = 'search-results';

  block.append(input, count, results);

  let data = [];
  try {
    data = await fetchIndex(cfg.source, Number(cfg.limit) || 500);
  } catch (e) {
    results.textContent = 'Could not load the index. Is it published?';
    return;
  }

  const render = (items) => {
    results.textContent = '';
    count.textContent = `${items.length} result${items.length === 1 ? '' : 's'}`;
    if (!items.length) {
      results.textContent = 'No results.';
      return;
    }
    items.forEach((it) => results.append(buildCard(it)));
  };

  const applyFilter = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { render(data); return; }
    const filtered = data.filter((it) => `${it.title || ''} ${it.description || ''} ${it.author || ''} ${it.tags || ''}`
      .toLowerCase()
      .includes(q));
    render(filtered);
  };

  input.addEventListener('input', applyFilter);
  render(data);
}
