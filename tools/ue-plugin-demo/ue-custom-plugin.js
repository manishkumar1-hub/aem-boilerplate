import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class UECustomPlugin extends LitElement {
  static properties = {
    selectedColor: { type: String },
    searchQuery: { type: String },
    selectedSku: { type: Object },
    selectedTagline: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      width: 320px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    h3 { margin: 0 0 12px 0; font-size: 15px; color: #111; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    h4 { margin: 14px 0 6px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Theme Color Swatches */
    .palette { display: flex; gap: 8px; }
    .swatch {
      width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.15s;
    }
    .swatch:hover { transform: scale(1.1); }
    .swatch.active { border-color: #111; }

    /* SKU Search Input & List */
    input[type="text"] {
      width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; margin-bottom: 6px;
    }
    .sku-list { list-style: none; padding: 0; margin: 0; max-height: 110px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; }
    .sku-item {
      padding: 8px 10px; font-size: 12px; cursor: pointer; border-bottom: 1px solid #f5f5f5; display: flex; justify-content: space-between;
    }
    .sku-item:hover { background: #f0f7ff; }
    .sku-item.selected { background: #e6f0ff; font-weight: bold; }

    /* AI Tagline Generator Button */
    .tagline-btn {
      width: 100%; padding: 9px; background: #0066cc; color: white; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 600;
    }
    .tagline-btn:hover { background: #0052a3; }
  `;

  constructor() {
    super();
    this.selectedColor = '#0066cc';
    this.searchQuery = '';
    this.selectedSku = null;
    this.selectedTagline = '';

    // Mock Commerce Product Database
    this.products = [
      { sku: 'PROD-101', name: 'Wireless Headphones', price: '$199.99' },
      { sku: 'PROD-102', name: 'Smart Fitness Watch', price: '$149.50' },
      { sku: 'PROD-103', name: 'Ergonomic Chair', price: '$299.00' },
      { sku: 'PROD-104', name: 'Mechanical Keyboard', price: '$89.99' },
    ];

    // AI Tagline Presets
    this.taglines = [
      "⚡ Unmatched Performance & Sleek Design",
      "🌟 Premium Everyday Quality You Can Trust",
      "🚀 Built for Speed, Reliability, and Comfort",
      "💡 Smart Innovation Meets Everyday Simplicity"
    ];
  }

  // Helper function to dispatch event to Universal Editor Host Window
  emitUEUpdate(propertyName, value) {
    window.parent.postMessage({
      type: 'ue:update-property',
      detail: { propertyName, value },
    }, '*');
  }

  selectColor(hex) {
    this.selectedColor = hex;
    this.emitUEUpdate('backgroundColor', hex);
  }

  selectProduct(prod) {
    this.selectedSku = prod;
    this.emitUEUpdate('productTitle', prod.name);
    this.emitUEUpdate('productPrice', prod.price);
    this.emitUEUpdate('productSku', prod.sku);
  }

  generateTagline() {
    const randomTagline = this.taglines[Math.floor(Math.random() * this.taglines.length)];
    this.selectedTagline = randomTagline;
    this.emitUEUpdate('productTagline', randomTagline);
  }

  render() {
    const filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    const brandColors = [
      { name: 'Blue', hex: '#0066cc' },
      { name: 'Dark', hex: '#111111' },
      { name: 'Red', hex: '#e63946' },
      { name: 'Green', hex: '#2a9d8f' },
    ];

    return html`
      <h3>🛠️ Universal Editor Plugin Panel</h3>

      <!-- 1. Theme Color Selector -->
      <h4>1. Brand Theme Color</h4>
      <div class="palette">
        ${brandColors.map(c => html`
          <div
            class="swatch ${this.selectedColor === c.hex ? 'active' : ''}"
            style="background-color: ${c.hex};"
            title="${c.name}"
            @click="${() => this.selectColor(c.hex)}"
          ></div>
        `)}
      </div>

      <!-- 2. Commerce SKU Search -->
      <h4>2. Commerce SKU Lookup</h4>
      <input
        type="text"
        placeholder="Search SKU or Name..."
        .value="${this.searchQuery}"
        @input="${(e) => this.searchQuery = e.target.value}"
      />
      <ul class="sku-list">
        ${filteredProducts.map(prod => html`
          <li
            class="sku-item ${this.selectedSku?.sku === prod.sku ? 'selected' : ''}"
            @click="${() => this.selectProduct(prod)}"
          >
            <span>${prod.name}</span>
            <strong>${prod.price}</strong>
          </li>
        `)}
      </ul>

      <!-- 3. AI Content Assistant -->
      <h4>3. AI Tagline Generator</h4>
      <button class="tagline-btn" @click="${this.generateTagline}">
        ✨ Generate Catchy Tagline
      </button>
    `;
  }
}


customElements.define('ue-custom-plugin', UECustomPlugin);
