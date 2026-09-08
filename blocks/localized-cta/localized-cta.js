function getLocale() {
  const seg = window.location.pathname.split('/')[1];
  return ['en', 'fr', 'de'].includes(seg) ? seg : 'en';
}

// Read /<locale>/placeholders.json ourselves and turn its rows into { key: text }
async function loadPlaceholders(locale) {
  const ph = {};
  try {
    const resp = await fetch(`/${locale}/placeholders.json`);
    const json = await resp.json();
    (json.data || []).forEach((row) => {
      if (row.Key) ph[row.Key] = row.Text;
    });
  } catch (e) {
    console.error('placeholders failed:', e);
  }
  return ph;
}

export default async function decorate(block) {
  const locale = getLocale();
  const ph = await loadPlaceholders(locale);
  console.log('locale:', locale, 'placeholders:', ph);

  block.textContent = '';

  const title = document.createElement('h2');
  title.textContent = ph.ctaTitle || 'Special offer';

  const button = document.createElement('a');
  button.className = 'button';
  button.href = '#';
  button.textContent = ph.addToCart || 'Add to cart';

  block.append(title, button);
}