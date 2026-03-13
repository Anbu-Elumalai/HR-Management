import React, { useState } from 'react';
import {
    Plus, Search, Eye, Edit, Trash2, X, RotateCcw
} from 'lucide-react';
import './Recruitment.css';

const Candidate = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // Mock Data
    const [candidates] = useState([
        { id: 1, candidateId: 'CAND001', name: 'John Doe', role: 'Senior React Developer', email: 'john@example.com', phone: '+91 9876543210', status: 'Interview', date: '2024-02-14', experience: '5.5 Years', noticePeriod: '30 Days' },
        { id: 2, candidateId: 'CAND002', name: 'Sarah Smith', role: 'HR Manager', email: 'sarah@example.com', phone: '+91 9876543211', status: 'New', date: '2024-02-15', experience: '8 Years', noticePeriod: '15 Days' },
        { id: 3, candidateId: 'CAND003', name: 'Mike Johnson', role: 'Senior React Developer', email: 'mike@example.com', phone: '+91 9876543212', status: 'Rejected', date: '2024-02-13', experience: '4 Years', noticePeriod: 'Immediate' },
    ]);

    const renderCandidateForm = () => {
        const isEdit = viewMode === 'edit';
        const c = selectedCandidate || {};
        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Candidate' : 'Add New Candidate'}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Candidate Name</label>
                                    <input type="text" defaultValue={c.name} placeholder="Full Name" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" defaultValue={c.email} placeholder="john@example.com" />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="text" defaultValue={c.phone} placeholder="+91 9876543210" />
                                </div>
                                <div className="form-group">
                                    <label>Applying For</label>
                                    <select defaultValue={c.role || ''}>
                                        <option value="" disabled>Select Role</option>
                                        <option>Senior React Developer</option>
                                        <option>HR Manager</option>
                                        <option>UI Designer</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Experience</label>
                                    <input type="text" defaultValue={c.experience} placeholder="e.g. 5 Years" />
                                </div>
                                <div className="form-group">
                                    <label>Notice Period</label>
                                    <select defaultValue={c.noticePeriod || 'Immediate'}>
                                        <option>Immediate</option>
                                        <option>15 Days</option>
                                        <option>30 Days</option>
                                        <option>60 Days</option>
                                        <option>90 Days</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Current Status</label>
                                    <select defaultValue={c.status || 'New'}>
                                        <option>New</option>
                                        <option>Screening</option>
                                        <option>Interview</option>
                                        <option>Offer Sent</option>
                                        <option>Hired</option>
                                        <option>Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-card">
                            <div className="form-card-title">Resume & Documents</div>
                            <div className="modal-info-grid">
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Resume Upload</label>
                                    <input type="file" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-primary" onClick={() => setViewMode('list')}>
                            {isEdit ? 'Save Changes' : 'Add Candidate'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCandidateDetail = () => {
        const c = selectedCandidate || {};
        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">Candidate Details - {c.name}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <label>Candidate ID</label>
                                    <div>{c.candidateId}</div>
                                </div>
                                <div className="info-item">
                                    <label>Experience</label>
                                    <div>{c.experience}</div>
                                </div>
                                <div className="info-item">
                                    <label>Notice Period</label>
                                    <div>{c.noticePeriod}</div>
                                </div>
                                <div className="info-item">
                                    <label>Email</label>
                                    <div>{c.email}</div>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <div className={`status-badge ${c.status === 'New' ? 'status-new' : 'status-interview'}`}>{c.status}</div>
                                </div>
                                <div className="info-item">
                                    <label>Applied For</label>
                                    <div>{c.role}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Close</button>
                        <button className="btn-primary" onClick={() => setViewMode('edit')}>Edit Candidate</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="employees-page">
            {viewMode === 'create' || viewMode === 'edit' ? renderCandidateForm() : null}
            {viewMode === 'view' ? renderCandidateDetail() : null}

            <div className="page-header">
                <h1 className="page-title">Candidate Management</h1>
                <button className="btn-primary" onClick={() => { setSelectedCandidate(null); setViewMode('create'); }}>
                    <Plus size={20} />
                    <span>Add Candidate</span>
                </button>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th style={{ width: '150px' }} className="text-center">Candidate ID</th>
                                <th style={{ width: '130px' }}>Experience</th>
                                <th>Candidate Name</th>
                                <th>Email</th>
                                <th>Applied For</th>
                                <th style={{ width: '150px' }} className="text-center">Status</th>
                                <th style={{ width: '160px' }}>Notice Period</th>
                                <th className="text-center" style={{ width: '150px' }}>Actions</th>
                            </tr>
                            <tr className="filter-row">
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="ID" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Exp" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Name" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Email" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Role" /></th>
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="Status" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Notice" /></th>
                                <th className="text-center">
                                    <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map(candidate => (
                                <tr key={candidate.id}>
                                    <td className="text-center font-mono text-blue-600 font-medium">{candidate.candidateId}</td>
                                    <td className="font-mono text-sm">{candidate.experience}</td>
                                    <td>
                                        <div className="emp-profile">
                                            <div className="emp-avatar">
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <span className="emp-name">{candidate.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-gray-600">{candidate.email}</td>
                                    <td className="text-sm">{candidate.role}</td>
                                    <td className="text-center">
                                        <span className={`status-badge ${candidate.status === 'New' ? 'status-new' :
                                            candidate.status === 'Interview' ? 'status-interview' :
                                                candidate.status === 'Rejected' ? 'status-rejected' :
                                                    'status-passed'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="text-sm font-medium text-gray-700 font-mono">{candidate.noticePeriod}</td>
                                    <td>
                                        <div className="actions-wrapper" style={{ justifyContent: 'center' }}>
                                            <button className="action-btn view" title="View" onClick={() => { setSelectedCandidate(candidate); setViewMode('view'); }}>
                                                <Eye size={18} />
                                            </button>
                                            <button className="action-btn edit" title="Edit" onClick={() => { setSelectedCandidate(candidate); setViewMode('edit'); }}>
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
                .text-gray-700 { color: #374151; }
                .text-sm { font-size: 0.875rem; }
            `}</style>
        </div>
    );
};

export default Candidate;
