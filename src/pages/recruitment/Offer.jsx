import React, { useState } from 'react';
import {
    Plus, Search, Eye, Edit, Trash2, X, RotateCcw,
    CheckCircle, XCircle
} from 'lucide-react';
import './Recruitment.css';

const Offer = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedOffer, setSelectedOffer] = useState(null);

    // Mock Data
    const [offers] = useState([
        { id: 1, candidate: 'John Doe', role: 'Senior React Developer', salary: '₹18,00,000', joiningDate: '2024-03-01', status: 'Accepted', issuedDate: '2024-02-18', expiryDate: '2024-02-25' },
        { id: 2, candidate: 'Mike Johnson', role: 'UI/UX Designer', salary: '₹12,00,000', joiningDate: '2024-03-15', status: 'Pending', issuedDate: '2024-02-19', expiryDate: '2024-02-26' },
        { id: 3, candidate: 'Emily Davis', role: 'Marketing Lead', salary: '₹15,00,000', joiningDate: '2024-04-01', status: 'Rejected', issuedDate: '2024-02-10', expiryDate: '2024-02-17' },
    ]);

    const renderOfferForm = () => {
        const isEdit = viewMode === 'edit';
        const o = selectedOffer || {};
        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Offer Letter' : 'Generate Offer Letter'}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        <div className="form-card">
                            <div className="form-card-title">Offer Details</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Candidate Name</label>
                                    <input type="text" defaultValue={o.candidate} placeholder="Select Candidate" />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <input type="text" defaultValue={o.role} placeholder="Role" readOnly className="bg-gray-50" />
                                </div>
                                <div className="form-group">
                                    <label>Annual Salary (CTC)</label>
                                    <input type="text" defaultValue={o.salary} placeholder="e.g. ₹18,00,000" />
                                </div>
                                <div className="form-group">
                                    <label>Designation</label>
                                    <input type="text" placeholder="Designation" defaultValue={o.role} />
                                </div>
                                <div className="form-group">
                                    <label>Expected Joining Date</label>
                                    <input type="date" defaultValue={o.joiningDate} />
                                </div>
                                <div className="form-group">
                                    <label>Offer Expiry Date</label>
                                    <input type="date" defaultValue={o.expiryDate} />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select defaultValue={o.status || 'Pending'}>
                                        <option>Draft</option>
                                        <option>Pending</option>
                                        <option>Accepted</option>
                                        <option>Rejected</option>
                                        <option>Expired</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-card">
                            <div className="form-card-title">Offer Letter Content</div>
                            <div className="modal-info-grid">
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Terms & Conditions</label>
                                    <textarea rows="4" placeholder="Enter specific terms..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-primary" onClick={() => setViewMode('list')}>
                            {isEdit ? 'Save Changes' : 'Generate Offer'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderOfferDetail = () => {
        const o = selectedOffer || {};
        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">Offer Details</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        <div className="form-card">
                            <div className="form-card-title">Offer Information</div>
                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <label>Candidate</label>
                                    <div>{o.candidate}</div>
                                </div>
                                <div className="info-item">
                                    <label>Role</label>
                                    <div>{o.role}</div>
                                </div>
                                <div className="info-item">
                                    <label>CTC</label>
                                    <div className="font-mono">{o.salary}</div>
                                </div>
                                <div className="info-item">
                                    <label>Joining Date</label>
                                    <div>{o.joiningDate}</div>
                                </div>
                                <div className="info-item">
                                    <label>Issued Date</label>
                                    <div>{o.issuedDate}</div>
                                </div>
                                <div className="info-item">
                                    <label>Expiry Date</label>
                                    <div>{o.expiryDate}</div>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <div className={`status-badge ${o.status === 'Accepted' ? 'status-approved' :
                                        o.status === 'Rejected' ? 'status-rejected' : 'status-pending'}`}>
                                        {o.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Close</button>
                        <button className="btn-secondary" onClick={() => { }}>Download PDF</button>
                        <button className="btn-primary" onClick={() => setViewMode('edit')}>Edit Offer</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="employees-page">
            {viewMode === 'create' || viewMode === 'edit' ? renderOfferForm() : null}
            {viewMode === 'view' ? renderOfferDetail() : null}

            <div className="page-header">
                <h1 className="page-title">Offer Management</h1>
                <button className="btn-primary" onClick={() => { setSelectedOffer(null); setViewMode('create'); }}>
                    <Plus size={20} />
                    <span>Create Offer</span>
                </button>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Candidate Name</th>
                                <th>Role</th>
                                <th>Salary (CTC)</th>
                                <th>Joining Date</th>
                                <th>Issued Date</th>
                                <th style={{ width: '150px' }} className="text-center">Status</th>
                                <th className="text-center" style={{ width: '150px' }}>Actions</th>
                            </tr>
                            <tr className="filter-row">
                                <th><input type="text" className="inline-filter" placeholder="Name" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Role" /></th>
                                <th><input type="text" className="inline-filter" placeholder="CTC" /></th>
                                <th><input type="date" className="inline-filter" /></th>
                                <th><input type="date" className="inline-filter" /></th>
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="Status" /></th>
                                <th className="text-center">
                                    <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map(offer => (
                                <tr key={offer.id}>
                                    <td>
                                        <div className="emp-profile">
                                            <div className="emp-avatar">
                                                {offer.candidate.charAt(0)}
                                            </div>
                                            <span className="emp-name">{offer.candidate}</span>
                                        </div>
                                    </td>
                                    <td>{offer.role}</td>
                                    <td className="font-mono">{offer.salary}</td>
                                    <td>{offer.joiningDate}</td>
                                    <td>{offer.issuedDate}</td>
                                    <td className="text-center">
                                        <span className={`status-badge ${offer.status === 'Accepted' ? 'status-approved' :
                                            offer.status === 'Rejected' ? 'status-rejected' : 'status-pending'}`}>
                                            {offer.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-wrapper" style={{ justifyContent: 'center' }}>
                                            <button className="action-btn view" title="View" onClick={() => { setSelectedOffer(offer); setViewMode('view'); }}>
                                                <Eye size={18} />
                                            </button>
                                            <button className="action-btn edit" title="Edit" onClick={() => { setSelectedOffer(offer); setViewMode('edit'); }}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="action-btn delete" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pagination">
                    <span className="pagination-info">Showing 1 to 3 of 3 entries</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled">Previous</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn disabled">Next</button>
                    </div>
                </div>
            </div>

            <style>{`
                .employees-page {
                    padding: 1.5rem;
                    padding-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    height: calc(100vh - 60px);
                    overflow: hidden;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                    letter-spacing: -0.02em;
                }

                .btn-primary {
                    background: #0d5f68;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .btn-primary:hover {
                    background: #0b4e56;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
                }

                /* Table Section */
                .table-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-height: 0;
                }
                .table-wrapper {
                    overflow-x: auto; /* Allow header scroll if needed */
                    overflow-y: auto;
                    flex: 1;
                    width: 100%;
                }
                .employee-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    white-space: nowrap; /* Keep rows nice, allow scroll if needed */
                }
                
                .employee-table thead {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background-color: #f8f9fb;
                }

                .employee-table th {
                    padding: 0.75rem 1.25rem; /* Compact padding */
                    color: #374151;
                    font-weight: 700;
                    font-size: 0.8rem;
                    border-bottom: 1px solid #e5e7eb;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    vertical-align: middle;
                }

                /* Filter Row Styling */
                .filter-row th {
                    padding: 0.5rem 1.25rem 1rem 1.25rem; /* Less top padding to sit close to label */
                    background-color: #f8f9fb;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .inline-filter {
                    width: 100%;
                    padding: 0.4rem 0.6rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    outline: none;
                    background: white;
                    color: #4b5563;
                    transition: border-color 0.2s;
                }
                .inline-filter:focus {
                    border-color: #0d5f68;
                    box-shadow: 0 0 0 2px rgba(13, 95, 104, 0.1);
                }
                  .btn-reset-filters-roles {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin: 0 auto;
                }


                .employee-table td {
                    padding: 0.85rem 1.25rem; /* Compact padding */
                    border-bottom: 1px solid #f3f4f6;
                    color: #1f2937;
                    font-size: 0.95rem;
                    vertical-align: middle;
                }
                .employee-table tr:hover td {
                    background-color: #f9fafb;
                }
                
                .text-secondary { color: #6b7280; }
                .text-center { text-align: center; }

                .emp-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .emp-avatar {
                    width: 36px;
                    height: 36px;
                    background-color: #e0e7ff;
                    color: #4f46e5;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                .emp-name {
                    font-weight: 600;
                    color: #111827;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 70px;
                }
                   .status-open, .status-approved, .status-passed, .status-accepted { 
                    background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; 
                }
                .status-on-hold, .status-pending, .status-interview { 
                    background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5;
                }
                .status-closed, .status-rejected, .status-expired { 
                    background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2;
                }
                .status-new {
                     background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; 
                }

                .actions-wrapper {
                    display: flex;
                    gap: 0.5rem;
                }
                .action-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: transparent;
                }
                .action-btn:hover { background-color: #f3f4f6; }
                .action-btn.view { color: #3b82f6; }
                .action-btn.edit { color: #10b981; }
                .action-btn.delete { color: #ef4444; }

                /* Pagination */
                .pagination {
                    padding: 0.75rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top: 1px solid #f3f4f6;
                    background: white;
                }
                .pagination-info {
                    font-size: 0.85rem;
                    color: #6b7280;
                    font-weight: 500;
                }
                .pagination-controls {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .page-btn {
                    min-width: 32px;
                    height: 32px;
                    padding: 0 0.4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    color: #4b5563;
                    transition: all 0.2s;
                }
                .page-btn:hover:not(.disabled) {
                    background-color: #f9fafb;
                    border-color: #d1d5db;
                }
                .page-btn.active {
                    background-color: #0d5f68;
                    color: white;
                    border-color: #0d5f68;
                    font-weight: 500;
                    box-shadow: 0 2px 4px rgba(13, 95, 104, 0.2);
                }
                .page-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background-color: #f9fafb;
                    color: #9ca3af;
                }
                
                .table-wrapper::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .table-wrapper::-webkit-scrollbar-track {
                    background: transparent;
                }
                .table-wrapper::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                }
                .table-wrapper::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                
                 /* Utility Classes for Fonts */
                .font-mono { font-family: monospace; }
                .font-semibold { font-weight: 600; }
                .text-blue-600 { color: #2563eb; }
                .text-gray-800 { color: #1f2937; }
                .text-gray-600 { color: #4b5563; }
                .text-teal-700 { color: #0d9488; }
                .text-sm { font-size: 0.875rem; }
            `}</style>
        </div>
    );
};

export default Offer;
