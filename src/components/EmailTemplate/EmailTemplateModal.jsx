import React, { useState, useRef, useEffect } from 'react';
import QuillEditor from './QuillEditor';
import CRMFieldsDropdown from './CRMFieldsDropdown';
import InsertHeaderFooter, {
  generateHeaderHTML,
  generateFooterHTML,
} from './InsertHeaderFooter';
import TemplateGalleryModal from './TemplateGalleryModal';
import PreviewModal from './PreviewModal';

const MODEL_OPTIONS = [
  'candidates', 'employees', 'interviews',
  'offers', 'onboarding', 'payroll',
];

const TYPE_OPTIONS = [
  'Interview Invite', 'Offer Letter', 'Rejection',
  'Onboarding', 'Follow-up', 'System Alert', 'Custom',
];

const EmailTemplateModal = ({ open, onClose, onSave, isEditing, editData, companiesList = [] }) => {
  const quillRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    modelName: 'candidates',
    subject: '',
    headerBgColor: '#1e3a3a',
    footerBgColor: '#f5f7f7',
    body: '',
    companyId: '',
    type: '',
    language: 'English',
    status: 'Active',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [showGallery, setShowGallery] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with editData
  useEffect(() => {
    if (open && editData) {
      setForm({
        name: editData.name || '',
        modelName: editData.modelName || 'candidates',
        subject: editData.subject || '',
        headerBgColor: editData.headerBgColor || '#1e3a3a',
        footerBgColor: editData.footerBgColor || '#f5f7f7',
        body: editData.body || '',
        companyId: editData.companyId || '',
        type: editData.type || '',
        language: editData.language || 'English',
        status: editData.status || 'Active',
        isDefault: editData.isDefault || false,
      });
    } else if (open) {
      setForm({
        name: '',
        modelName: 'candidates',
        subject: '',
        headerBgColor: '#1e3a3a',
        footerBgColor: '#f5f7f7',
        body: '',
        companyId: '',
        type: '',
        language: 'English',
        status: 'Active',
        isDefault: false,
      });
    }
  }, [open, editData]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Insert CRM placeholder at cursor
  const handleInsertCRMField = (placeholder) => {
    quillRef.current?.insertAtCursor(placeholder);
  };

  // Insert Header HTML
  const handleInsertHeader = () => {
    const selectedCompany = companiesList.find(c => c.id === form.companyId);
    const html = generateHeaderHTML(
      form.headerBgColor,
      selectedCompany?.name || 'Your Company',
      ''
    );
    quillRef.current?.insertHTML(html);
  };

  // Insert Footer HTML
  const handleInsertFooter = () => {
    const html = generateFooterHTML(form.footerBgColor);
    quillRef.current?.insertHTML(html);
  };

  // Apply selected template from gallery
  const handleApplyTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      subject: template.subject,
      body: template.body,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Template name is required';
    if (!form.modelName) newErrors.modelName = 'Model name is required';
    if (!form.subject) newErrors.subject = 'Subject is required';
    if (!form.body || form.body === '<p><br></p>')
      newErrors.body = 'Email body is required';
    if (!form.companyId) newErrors.companyId = 'Company is required';
    if (!form.type)
      newErrors.type = 'Template type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    setIsSending(true);
    // Mimic testing logic from Settings.jsx
    console.log('Test email content:', form.body);
    setTimeout(() => {
        setIsSending(false);
        alert('Test email simulation successful! View console for HTML.');
    }, 800);
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="template-modal">

          {/* Modal Header */}
          <div className="modal-header">
            <div className="modal-header-left">
              <span className="modal-header-icon">✉️</span>
              <div>
                <h2 style={{ color: 'white' }}>
                  {isEditing ? 'Edit Email Template' : 'Add New Email Template'}
                </h2>
                <p>Design professional templates for company communications</p>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">

            {/* Row 1 — Model Name + Subject */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Model Name <span className="required">*</span></label>
                <select
                  value={form.modelName}
                  onChange={(e) => handleChange('modelName', e.target.value)}
                  className={errors.modelName ? 'input-error' : ''}
                >
                  <option value="">Select Model</option>
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.modelName && (
                  <span className="error-msg">{errors.modelName}</span>
                )}
              </div>

               <div className="form-group">
                <label>Template Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Interview Invite"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && (
                  <span className="error-msg">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Subject <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Enter email subject..."
                  value={form.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className={errors.subject ? 'input-error' : ''}
                />
                {errors.subject && (
                  <span className="error-msg">{errors.subject}</span>
                )}
              </div>
            </div>

            {/* Row 2 — Color Pickers + Choose Template */}
            <div className="color-row">
              <div className="color-group">
                <label>Header Color</label>
                <input
                  type="color"
                  value={form.headerBgColor}
                  onChange={(e) => handleChange('headerBgColor', e.target.value)}
                />
              </div>
              <div className="color-group">
                <label>Footer Color</label>
                <input
                  type="color"
                  value={form.footerBgColor}
                  onChange={(e) => handleChange('footerBgColor', e.target.value)}
                />
              </div>
              <div className="color-row-right">
                <button
                  className="btn-choose-template"
                  onClick={() => setShowGallery(true)}
                  type="button"
                >
                  🎨 Choose Design
                </button>
                <button
                  className="btn-preview"
                  onClick={() => setShowPreview(true)}
                  type="button"
                >
                  👁 Preview
                </button>
              </div>
            </div>

            {/* Row 3 — Email Body */}
            <div className="form-group">
              <label>
                Email Body <span className="required">*</span>
              </label>

              {/* Insert Header/Footer + CRM Fields toolbar */}
              <div className="editor-toolbar-row">
                <InsertHeaderFooter
                  onInsertHeader={handleInsertHeader}
                  onInsertFooter={handleInsertFooter}
                />
                <CRMFieldsDropdown onInsert={handleInsertCRMField} />
              </div>

              {/* Quill Editor */}
              <QuillEditor
                ref={quillRef}
                value={form.body}
                onChange={(val) => handleChange('body', val)}
                placeholder="Write your email content here..."
              />
              {errors.body && (
                <span className="error-msg">{errors.body}</span>
              )}
            </div>

            {/* Row 4 — Company + Template Type + Language + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr 0.8fr', gap: '1rem' }}>
              <div className="form-group">
                <label>
                  Company <span className="required">*</span>
                </label>
                <select
                  value={form.companyId}
                  onChange={(e) => handleChange('companyId', e.target.value)}
                  className={errors.companyId ? 'input-error' : ''}
                >
                  <option value="">Select Company</option>
                  {companiesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.companyId && (
                  <span className="error-msg">{errors.companyId}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Type <span className="required">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className={errors.type ? 'input-error' : ''}
                >
                  <option value="">Select Type</option>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.type && (
                  <span className="error-msg">{errors.type}</span>
                )}
              </div>

              <div className="form-group">
                <label>Language</label>
                <select
                  value={form.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option>English</option>
                  <option>Tamil</option>
                  <option>Hindi</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            {/* Default Template Checkbox */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="default-checkbox-row">
                <input
                    type="checkbox"
                    id="isDefault"
                    checked={form.isDefault}
                    onChange={(e) => handleChange('isDefault', e.target.checked)}
                />
                <label htmlFor="isDefault">Set as Default Template</label>
                <span className="default-hint">
                    Only one default per company per type
                </span>
                </div>

                {/* Warning if default exists */}
                {form.isDefault && form.companyId && form.type && (
                <div className="default-warning">
                    ⚠ This will replace the existing default template for{' '}
                    <strong>{companiesList.find(c=>c.id===form.companyId)?.name || '[Company]'}</strong> – <strong>{form.type}</strong>
                </div>
                )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              className="btn-cancel"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn-send-test"
              onClick={handleSendTest}
              disabled={isSending}
              type="button"
            >
              {isSending ? 'Sending...' : '✈ Send Test'}
            </button>
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={isSaving}
              type="button"
            >
              {isSaving ? 'Saving...' : (isEditing ? 'Update Template' : 'Save Template')}
            </button>
          </div>
        </div>
      </div>

      {/* Template Gallery Modal */}
      <TemplateGalleryModal
        open={showGallery}
        onClose={() => setShowGallery(false)}
        onApply={handleApplyTemplate}
      />

      {/* Preview Modal */}
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        subject={form.subject}
        body={form.body}
      />
    </>
  );
};

export default EmailTemplateModal;
