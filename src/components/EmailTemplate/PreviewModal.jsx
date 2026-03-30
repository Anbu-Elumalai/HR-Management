import React from 'react';
import DOMPurify from 'dompurify';
import { DUMMY_VALUES } from '../../constants/crmFields';

const replacePlaceholders = (html) => {
  let result = html;
  Object.entries(DUMMY_VALUES).forEach(([key, val]) => {
    result = result.replaceAll(key, val);
  });
  return result;
};

const PreviewModal = ({ open, onClose, subject, body }) => {
  if (!open) return null;

  const previewSubject = replacePlaceholders(subject || '');
  const previewBody = DOMPurify.sanitize(replacePlaceholders(body || ''));

  return (
    <div className="preview-overlay">
      <div className="preview-modal">
        <div className="preview-header">
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e3a3a' }}>📧 Email Preview</h3>
          <span className="preview-note">
            Placeholders replaced with sample data
          </span>
          <button onClick={onClose} className="preview-close">✕</button>
        </div>

        <div className="preview-body" style={{ background: '#f1f5f9' }}>
          {/* Email Client Style Preview */}
          <div className="preview-email-wrap" style={{ background: 'white' }}>
            <div className="preview-meta">
              <div className="preview-meta-row">
                <span className="preview-meta-label">Subject:</span>
                <span className="preview-meta-value" style={{ fontWeight: 600 }}>{previewSubject}</span>
              </div>
              <div className="preview-meta-row">
                <span className="preview-meta-label">To:</span>
                <span className="preview-meta-value">john.smith@email.com</span>
              </div>
              <div className="preview-meta-row">
                <span className="preview-meta-label">From:</span>
                <span className="preview-meta-value">hr@syncraze.com</span>
              </div>
            </div>

            <div
              className="preview-email-body"
              dangerouslySetInnerHTML={{ __html: previewBody }}
            />
          </div>
        </div>

        <div className="preview-footer">
          <button onClick={onClose} className="btn-cancel">Close</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
