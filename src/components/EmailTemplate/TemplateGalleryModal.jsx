import React, { useState } from 'react';
import { EMAIL_TEMPLATES, TEMPLATE_CATEGORIES } from '../../constants/templateList';

const categoryColors = {
  HR: '#0d9e8a',
  Onboarding: '#27ae60',
  Security: '#e74c3c',
  Finance: '#3a3aad',
  Marketing: '#9b59b6',
  System: '#6c757d',
  Internal: '#2c3e50',
  'E-Commerce': '#0d5f68',
  Events: '#f39c12',
  Engagement: '#e91e8c',
};

const TemplateGalleryModal = ({ open, onClose, onApply }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(null);

  if (!open) return null;

  const filtered = EMAIL_TEMPLATES.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === 'All' || t.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const selectedTemplate = EMAIL_TEMPLATES.find((t) => t.id === selectedId);

  const handleApply = () => {
    if (selectedTemplate) {
      onApply(selectedTemplate);
      onClose();
    }
  };

  return (
    <div className="gallery-overlay">
      <div className="gallery-modal">
        {/* Header */}
        <div className="gallery-header">
          <div className="gallery-header-left">
            <span className="gallery-icon">📧</span>
            <div>
              <h2 style={{ color: 'white' }}>Choose Email Template</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>{EMAIL_TEMPLATES.length} professionally designed templates</p>
            </div>
          </div>
          <button className="gallery-close" onClick={onClose}>✕</button>
        </div>

        {/* Search */}
        <div className="gallery-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gallery-search"
          />
        </div>

        {/* Category Tabs */}
        <div className="gallery-tabs">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`gallery-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="gallery-grid">
          {filtered.length === 0 ? (
            <div className="gallery-empty">No templates found</div>
          ) : (
            filtered.map((template) => (
              <div
                key={template.id}
                className={`gallery-card ${selectedId === template.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(template.id)}
              >
                <div className="gallery-card-top">
                  <span className="gallery-card-name">{template.name}</span>
                  <span
                    className="gallery-card-badge"
                    style={{
                      background: categoryColors[template.category] + '20',
                      color: categoryColors[template.category],
                      border: `1px solid ${categoryColors[template.category]}40`,
                    }}
                  >
                    {template.category.toUpperCase()}
                  </span>
                </div>
                <p className="gallery-card-desc">{template.description}</p>
                {selectedId === template.id && (
                  <div className="gallery-card-selected-badge">✓ Selected</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="gallery-footer">
          <span className="gallery-count">
            Showing {filtered.length} of {EMAIL_TEMPLATES.length} templates
          </span>
          <div className="gallery-footer-btns">
            <button className="btn-cancel" onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className="btn-apply"
              onClick={handleApply}
              disabled={!selectedId}
              type="button"
            >
              Apply Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGalleryModal;
