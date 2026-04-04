import React from 'react';

export const generateHeaderHTML = (headerBgColor, companyName, logoUrl) => `
  <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 0;">
    <tr>
      <td align="center">
        <div style="
          background-color: ${headerBgColor || '#0d5f68'};
          padding: 24px 32px;
          text-align: center;
          color: #fff;
          border-radius: 16px 16px 0 0;
        ">
          ${logoUrl
            ? `<img src="${logoUrl}" alt="${companyName}" style="max-height: 50px; margin-bottom: 12px;"/>`
            : `<div style="width: 48px; height: 48px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"><span style="color: ${headerBgColor || '#0d5f68'}; font-size: 22px; font-weight: 900;">${companyName.charAt(0)}</span></div>`
          }
          <h1 style="color: #ffffff; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800;">
            {{companyName}}
          </h1>
        </div>
        <div style="height: 4px; background-color: #27ae60; border-radius: 0;"></div>
      </td>
    </tr>
  </table>
`;

export const generateFooterHTML = (footerBgColor) => `
  <div style="height: 16px;"></div>
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <div style="
          background-color: ${footerBgColor || '#f8fafb'};
          border-radius: 0 0 12px 12px;
          border-top: 1px solid #edf2f7;
          padding: 30px 40px;
          text-align: center;
        ">
          <p style="color: #1a202c; font-size: 14px; font-weight: 700; margin: 0 0 6px; font-family: sans-serif;">{{companyName}}</p>
          <p style="color: #718096; font-size: 12px; margin: 0 0 20px; font-family: sans-serif;">{{companyAddress}}</p>
          <div style="margin-bottom: 20px;">
            <a href="{{companyWebsite}}" style="color: #0d5f68; text-decoration: none; font-size: 12px; font-weight: 600; margin: 0 8px;">Website</a>
            <span style="color: #cbd5e1;">&bull;</span>
            <a href="mailto:{{hrEmail}}" style="color: #0d5f68; text-decoration: none; font-size: 12px; font-weight: 600; margin: 0 8px;">Support</a>
          </div>
          <p style="color: #a0aec0; font-size: 10px; margin: 0; font-family: sans-serif;">© 2026 {{companyName}}. Powered by HRM System.</p>
        </div>
      </td>
    </tr>
  </table>
`;

const InsertHeaderFooter = ({ onInsertHeader, onInsertFooter }) => {
  return (
    <div className="header-footer-btns" style={{ display: 'flex', gap: '8px' }}>
      <button
        type="button"
        className="insert-btn"
        onClick={onInsertHeader}
      >
        <span>🖼</span> Insert Header
      </button>
      <button
        type="button"
        className="insert-btn"
        onClick={onInsertFooter}
      >
        <span>📋</span> Insert Footer
      </button>
    </div>
  );
};

export default InsertHeaderFooter;
