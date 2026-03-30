import React, { useState, useRef, useEffect } from 'react';
import { CRM_FIELDS } from '../../constants/crmFields';

const CRMFieldsDropdown = ({ onInsert }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Candidate');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInsert = (value) => {
    onInsert(value);
    setOpen(false);
  };

  return (
    <div className="crm-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="crm-fields-btn"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="crm-icon">👤</span>
        CRM Fields
        <span className="crm-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="crm-dropdown-panel">
          {/* Category Tabs */}
          <div className="crm-category-tabs">
            {Object.keys(CRM_FIELDS).map((cat) => (
              <button
                key={cat}
                className={`crm-cat-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Fields List */}
          <div className="crm-fields-list">
            {CRM_FIELDS[activeCategory].map((field) => (
              <div
                key={field.value}
                className="crm-field-item"
                onClick={() => handleInsert(field.value)}
              >
                <span className="field-label">{field.label}</span>
                <span className="field-value">{field.value}</span>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="crm-dropdown-footer">
            Click a field to insert at cursor position
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMFieldsDropdown;
