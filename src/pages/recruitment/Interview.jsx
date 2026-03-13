import React, { useState } from 'react';
import {
    Plus, Search, Eye, Edit, Trash2, X, RotateCcw,
    Users, MapPin, Monitor
} from 'lucide-react';
import './Recruitment.css';

const Interview = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedInterview, setSelectedInterview] = useState(null);

    // Mock Data
    const [interviews] = useState([
        { id: 1, candidate: 'John Doe', role: 'Senior React Developer', interviewer: 'Anbu', date: '2024-02-16', time: '10:00 AM', type: 'Video', status: 'Scheduled', round: 'Technical', duration: 60, timezone: '(GMT+05:30) India Standard Time', location: 'https://meet.google.com/abc-defg-hij', level: 'L2' },
        { id: 2, candidate: 'Sarah Smith', role: 'HR Manager', interviewer: 'Priya', date: '2024-02-17', time: '02:00 PM', type: 'In-person', status: 'Pending', round: 'HR', duration: 30, timezone: '(GMT+05:30) India Standard Time', location: 'Conference Room A', level: 'L1' },
    ]);

    // Mock candidates for dropdown
    const mockCandidates = [
        { id: 1, name: 'John Doe', candidateId: 'CAND001', role: 'Senior React Developer' },
        { id: 2, name: 'Sarah Smith', candidateId: 'CAND002', role: 'HR Manager' },
        { id: 3, name: 'Mike Johnson', candidateId: 'CAND003', role: 'Senior React Developer' }
    ];

    const renderInterviewForm = () => {
        const isEdit = viewMode === 'edit';
        const i = selectedInterview || {};

        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Interview Schedule' : 'Schedule New Interview'}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        {/* 1. Basic Information */}
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Interview ID</label>
                                    <input type="text" placeholder="Auto-generated (INT001)" readOnly defaultValue={i.id ? `INT00${i.id}` : 'INT004'} className="bg-gray-50" />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Candidate</label>
                                    <select defaultValue={i.candidate || ""}>
                                        <option value="" disabled>Select Candidate</option>
                                        {mockCandidates.map(c => <option key={c.id} value={c.name}>{c.candidateId} - {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Vacancy</label>
                                    <input type="text" placeholder="Auto-fill from candidate" readOnly defaultValue={i.role || ""} />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Interview Round</label>
                                    <select defaultValue={i.round || "Technical"}>
                                        <option>HR</option>
                                        <option>Technical</option>
                                        <option>Final</option>
                                        <option>Client</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Interview Level</label>
                                    <select defaultValue={i.level || "L1"}>
                                        <option>L1</option>
                                        <option>L2</option>
                                        <option>L3</option>
                                        <option>L4</option>
                                        <option>L5</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Interview Type</label>
                                    <select defaultValue={i.type || "Online"}>
                                        <option>Online</option>
                                        <option>Offline</option>
                                        <option>Telephonic</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Interview Mode</label>
                                    <select defaultValue={i.mode || "Video"}>
                                        <option>Video</option>
                                        <option>In-person</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Interview Status</label>
                                    <select defaultValue={i.status || "Scheduled"}>
                                        <option>Scheduled</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                        <option>Rescheduled</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Scheduled Date</label>
                                    <input type="date" defaultValue={i.date || ""} />
                                </div>
                                <div className="form-group">
                                    <label>Scheduled Time</label>
                                    <input type="time" defaultValue={i.time || ""} />
                                </div>
                                <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input type="number" placeholder="e.g. 60" defaultValue={i.duration || 60} />
                                </div>
                                <div className="form-group">
                                    <label>Time Zone</label>
                                    <select defaultValue={i.timezone || "(GMT+05:30) India Standard Time"}>
                                        <option>(GMT+05:30) India Standard Time</option>
                                        <option>(GMT+00:00) UTC</option>
                                        <option>(GMT-05:00) Eastern Time</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Location / Meeting Link</label>
                                    <input type="text" placeholder="Google Meet / Office Address" defaultValue={i.location || ""} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Panel Details */}
                        <div className="form-card">
                            <div className="form-card-title">Panel Details</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Interviewer Name</label>
                                    <input type="text" placeholder="Enter name" defaultValue={i.interviewer || ""} />
                                </div>
                                <div className="form-group">
                                    <label>Interviewer ID / Code</label>
                                    <input type="text" placeholder="e.g. EMP001" />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select defaultValue={i.department || "Engineering"}>
                                        <option>Engineering</option>
                                        <option>Human Resources</option>
                                        <option>Management</option>
                                        <option>Design</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Panel Role</label>
                                    <select><option>Primary</option><option>Secondary</option><option>Observer</option></select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Panel Member Notes / Remarks</label>
                                    <textarea rows="3" placeholder="Enter any specific instructions for the panel"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-primary" onClick={() => setViewMode('list')}>Save Schedule</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderInterviewDetail = () => {
        const i = selectedInterview || {};
        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">Interview Details - {i.id ? `INT00${i.id}` : 'N/A'}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <label>Candidate</label>
                                    <div>{i.candidate}</div>
                                </div>
                                <div className="info-item">
                                    <label>Role</label>
                                    <div>{i.role}</div>
                                </div>
                                <div className="info-item">
                                    <label>Interview Round</label>
                                    <div>{i.round}</div>
                                </div>
                                <div className="info-item">
                                    <label>Interview Level</label>
                                    <div>{i.level}</div>
                                </div>
                                <div className="info-item">
                                    <label>Interview Type</label>
                                    <div>{i.type}</div>
                                </div>
                                <div className="info-item">
                                    <label>Interview Mode</label>
                                    <div>{i.mode}</div>
                                </div>
                                <div className="info-item">
                                    <label>Interview Status</label>
                                    <div className={`status-badge ${i.status === 'Scheduled' ? 'status-new' : 'status-passed'}`}>{i.status}</div>
                                </div>
                                <div className="info-item">
                                    <label>Scheduled Date & Time</label>
                                    <div>{i.date} at {i.time}</div>
                                </div>
                                <div className="info-item">
                                    <label>Duration</label>
                                    <div>{i.duration} Minutes</div>
                                </div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Location / Meeting Link</label>
                                    <div className="text-blue-600 underline cursor-pointer">{i.location}</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Panel Details</div>
                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <label>Interviewer Name</label>
                                    <div>{i.interviewer}</div>
                                </div>
                                <div className="info-item">
                                    <label>Department</label>
                                    <div>{i.department || "Engineering"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Close</button>
                        <button className="btn-primary" onClick={() => setViewMode('edit')}>Edit Schedule</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="employees-page">
            {viewMode === 'create' || viewMode === 'edit' ? renderInterviewForm() : null}
            {viewMode === 'view' ? renderInterviewDetail() : null}

            <div className="page-header">
                <h1 className="page-title">Interview Management</h1>
                <button className="btn-primary" onClick={() => { setSelectedInterview(null); setViewMode('create'); }}>
                    <Plus size={20} />
                    <span>Schedule Interview</span>
                </button>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Role</th>
                                <th>Interviewer</th>
                                <th style={{ width: '150px' }}>Date & Time</th>
                                <th style={{ width: '100px' }} className="text-center">Level</th>
                                <th style={{ width: '130px' }} className="text-center">Type</th>
                                <th style={{ width: '150px' }} className="text-center">Status</th>
                                <th className="text-center" style={{ width: '150px' }}>Actions</th>
                            </tr>
                            <tr className="filter-row">
                                <th><input type="text" className="inline-filter" placeholder="Candidate" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Role" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Interviewer" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Date" /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Level" /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Type" /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Status" /></th>
                                <th className="text-center">
                                    <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {interviews.map(interview => (
                                <tr key={interview.id}>
                                    <td>
                                        <div className="emp-profile">
                                            <div className="emp-avatar">
                                                {interview.candidate.charAt(0)}
                                            </div>
                                            <span className="emp-name">{interview.candidate}</span>
                                        </div>
                                    </td>
                                    <td>{interview.role}</td>
                                    <td>
                                        <div className="flex items-center gap-1 text-gray-600 text-sm font-medium">
                                            <Users size={14} /> {interview.interviewer}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col text-xs font-mono">
                                            <span className="font-medium text-gray-700">{interview.date}</span>
                                            <span className="text-gray-500">{interview.time}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="font-semibold text-teal-700">{interview.level}</span>
                                    </td>
                                    <td className="text-center">
                                        <span className="flex items-center justify-center gap-1 text-xs px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-gray-600 mx-auto" style={{ width: 'fit-content' }}>
                                            {interview.type === 'Video' ? <Monitor size={12} /> : <MapPin size={12} />}
                                            {interview.type}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-badge ${interview.status === 'Scheduled' ? 'status-new' : 'status-passed'}`}>
                                            {interview.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-wrapper" style={{ justifyContent: 'center' }}>
                                            <button className="action-btn view" title="View" onClick={() => { setSelectedInterview(interview); setViewMode('view'); }}>
                                                <Eye size={18} />
                                            </button>
                                            <button className="action-btn edit" title="Edit" onClick={() => { setSelectedInterview(interview); setViewMode('edit'); }}>
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
                    <span className="pagination-info">Showing 1 to 2 of 2 entries</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled">Previous</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn disabled">Next</button>
                    </div>
                </div>
            </div>
            {/* Same CSS as others, can be refactored later */}
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

export default Interview;
