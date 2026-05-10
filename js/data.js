/* =========================================================
   data.js — Data loading utilities
   ========================================================= */

const DataLoader = {
  _cache: null,

  async load() {
    if (this._cache) return this._cache;
    try {
      const response = await fetch('data/content.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._cache = await response.json();
      return this._cache;
    } catch (err) {
      console.error('Failed to load content data:', err);
      return null;
    }
  },

  clearCache() {
    this._cache = null;
  },

  async loadFromJSON(json) {
    try {
      this._cache = typeof json === 'string' ? JSON.parse(json) : json;
      return this._cache;
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      return null;
    }
  }
};
