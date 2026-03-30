import React, { useRef, useEffect, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../styles/quill-custom.css';

// Register image resize module
import ImageResize from 'quill-image-resize-module-react';
Quill.register('modules/imageResize', ImageResize);

const QuillEditor = React.forwardRef(({ value, onChange, placeholder }, ref) => {
  const quillRef = useRef(null);

  // Expose insertText method to parent via ref
  const insertAtCursor = useCallback((text) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range ? range.index : editor.getLength();
    editor.insertText(index, text, 'user');
    editor.setSelection(index + text.length);
  }, []);

  // Expose insertHTML method
  const insertHTML = useCallback((html) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range ? range.index : 0;
    editor.clipboard.dangerouslyPasteHTML(index, html);
  }, []);

  // Attach methods to the forwarded ref for parent access
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref({ insertAtCursor, insertHTML, getEditor: () => quillRef.current?.getEditor() });
      } else {
        ref.current = { insertAtCursor, insertHTML, getEditor: () => quillRef.current?.getEditor() };
      }
    }
  }, [ref, insertAtCursor, insertHTML]);

  const modules = {
    toolbar: {
      container: '#quill-toolbar',
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize'],
    },
    clipboard: {
      matchVisual: false,
    },
    table: true,
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block',
    'width', 'height', 'style',
    'table', 'tr', 'td',
  ];

  return (
    <div className="quill-wrapper">
      {/* Custom Toolbar */}
      <div id="quill-toolbar" className="quill-toolbar-custom">
        {/* Font & Size */}
        <select className="ql-font" defaultValue="">
          <option value="">Font</option>
          <option value="arial">Arial</option>
          <option value="times-new-roman">Times New Roman</option>
          <option value="courier">Courier</option>
          <option value="verdana">Verdana</option>
        </select>
        <select className="ql-size" defaultValue="14px">
          <option value="10px">10</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="28px">28</option>
          <option value="36px">36</option>
        </select>

        <span className="ql-divider" />

        {/* Text Formatting */}
        <button className="ql-bold" title="Bold" />
        <button className="ql-italic" title="Italic" />
        <button className="ql-underline" title="Underline" />
        <button className="ql-strike" title="Strikethrough" />

        <span className="ql-divider" />

        {/* Colors */}
        <select className="ql-color" title="Text Color" />
        <select className="ql-background" title="Background Color" />

        <span className="ql-divider" />

        {/* Alignment */}
        <button className="ql-align" value="" title="Align Left" />
        <button className="ql-align" value="center" title="Center" />
        <button className="ql-align" value="right" title="Align Right" />
        <button className="ql-align" value="justify" title="Justify" />

        <span className="ql-divider" />

        {/* Lists */}
        <button className="ql-list" value="ordered" title="Numbered List" />
        <button className="ql-list" value="bullet" title="Bullet List" />
        <button className="ql-indent" value="-1" title="Decrease Indent" />
        <button className="ql-indent" value="+1" title="Increase Indent" />

        <span className="ql-divider" />

        {/* Insert */}
        <button className="ql-link" title="Insert Link" />
        <button className="ql-image" title="Insert Image" />
        <button className="ql-video" title="Insert Video" />
        <button className="ql-blockquote" title="Blockquote" />
        <button className="ql-code-block" title="Code Block" />

        <span className="ql-divider" />

        {/* Undo / Redo */}
        <button
          className="ql-undo-btn"
          title="Undo"
          type="button"
          onClick={() => quillRef.current?.getEditor()?.history.undo()}
        >↩</button>
        <button
          className="ql-redo-btn"
          title="Redo"
          type="button"
          onClick={() => quillRef.current?.getEditor()?.history.redo()}
        >↪</button>
      </div>

      {/* Quill Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write your email content here...'}
        style={{ minHeight: '320px' }}
      />
    </div>
  );
});

export default QuillEditor;
