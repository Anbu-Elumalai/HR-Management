import React, { useState } from 'react';
import {
    Plus, Search, Eye, Edit, Trash2, X, RotateCcw
} from 'lucide-react';
import './Recruitment.css';
import SearchableSelect from '../../components/common/SearchableSelect';
import { departmentService } from '../../services/departmentService';
import { positionService } from '../../services/positionService';
import { employeeService } from '../../services/employeeService';

const Vacancy = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedVacancy, setSelectedVacancy] = useState(null);

    // Master Data State
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({});

    // Fetch Master Data
    React.useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [deps, pos, emps] = await Promise.all([
                    departmentService.getAllDepartments(),
                    positionService.getAllPositions(),
                    employeeService.getAllEmployees()
                ]);
                setDepartments(deps.map(d => ({ label: d.name, value: d.name })));
                setPositions(pos.map(p => ({ label: p.name, value: p.name })));
                setEmployees(emps.map(e => ({ label: e.name, value: e.id, ...e }))); // Keep full object for auto-fill
            } catch (error) {
                console.error("Error fetching master data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMasterData();
    }, []);

    // Initialize Form Data when opening modal
    React.useEffect(() => {
        if (viewMode === 'create') {
            setFormData({
                reqNo: 'REQ-2026-001', // Should ideally be auto-generated from backend
                dateOfReq: new Date().toISOString().split('T')[0],
                employmentType: 'Permanent',
                gender: 'Male',
                noOfVacancies: 1,
                qualification: 'Degree Holder'
            });
        } else if (viewMode === 'edit' && selectedVacancy) {
            setFormData({ ...selectedVacancy });
        }
    }, [viewMode, selectedVacancy]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleReportingManagerChange = (employeeId) => {
        const selectedEmployee = employees.find(e => e.value === employeeId);
        if (selectedEmployee) {
            setFormData(prev => ({
                ...prev,
                reportingManager: selectedEmployee.label,
                reportingCode: selectedEmployee.id
            }));
        }
    };

    // Mock Data
    const [vacancies] = useState([
        {
            id: 1,
            reqNo: 'VC001',
            position: 'Senior React Developer',
            department: 'Engineering',
            project: 'E-commerce Platform',
            noOfVacancies: 3,
            filledPositions: 1,
            remainingVacancies: 2,
            hiringType: 'New Position',
            targetJoiningDate: '2024-04-01',
            status: 'Open',
            approvalStatus: 'Approved',
            jd: 'Build pixel-perfect UIs with React...',
            employmentType: 'Full-Time',
            reportingManager: 'Sarah Director',
            salaryRange: '₹15L - ₹25L'
        },
        {
            id: 2,
            reqNo: 'VC002',
            position: 'UI/UX Designer',
            department: 'Design',
            project: 'Mobile App Refactor',
            noOfVacancies: 1,
            filledPositions: 0,
            remainingVacancies: 1,
            hiringType: 'Replacement',
            targetJoiningDate: '2024-03-15',
            status: 'On Hold',
            approvalStatus: 'Pending',
            jd: 'Create stunning user experiences...',
            employmentType: 'Full-Time',
            reportingManager: 'Bob Lead',
            salaryRange: '₹10L - ₹18L'
        }
    ]);

    const renderVacancyForm = () => {
        const isEdit = viewMode === 'edit';
        const v = selectedVacancy || {};
        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Vacancy Request' : 'Create Vacancy Request'}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Request Number</label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated"
                                        value={formData.reqNo || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Requisition</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfReq || ''}
                                        onChange={(e) => handleInputChange('dateOfReq', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <SearchableSelect
                                        options={departments}
                                        value={formData.department}
                                        onChange={(val) => handleInputChange('department', val)}
                                        placeholder="Select Department"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Position</label>
                                    <SearchableSelect
                                        options={positions}
                                        value={formData.position}
                                        onChange={(val) => handleInputChange('position', val)}
                                        placeholder="Select Position"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Reporting to Name</label>
                                    <SearchableSelect
                                        options={employees.map(e => ({ label: e.label, value: e.value }))}
                                        value={formData.reportingCode} // Use ID as value
                                        onChange={handleReportingManagerChange}
                                        placeholder="Select Manager"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Reporting Code</label>
                                    <input
                                        type="text"
                                        placeholder="Auto-filled"
                                        value={formData.reportingCode || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Employee Type</label>
                                    <select
                                        value={formData.employmentType || 'Permanent'}
                                        onChange={(e) => handleInputChange('employmentType', e.target.value)}
                                    >
                                        <option>Permanent</option>
                                        <option>Contract</option>
                                        <option>Temporary</option>
                                        <option>Intern</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        value={formData.gender || 'Male'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Any</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Vacancy & Requirements</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Number of Vacancy</label>
                                    <input type="number" defaultValue={v.noOfVacancies || 1} min="1" />
                                </div>
                                <div className="form-group">
                                    <label>Required Date</label>
                                    <input type="date" defaultValue="2026-01-12" />
                                </div>
                                <div className="form-group">
                                    <label>Preferred Qualification</label>
                                    <select defaultValue="Degree Holder">
                                        <option>Degree Holder</option>
                                        <option>Diploma</option>
                                        <option>Post Graduate</option>
                                        <option>Doctorate</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Reason for Requisition</label>
                                    <input type="text" placeholder="e.g. New Position / Replacement" />
                                </div>

                                <div className="form-group">
                                    <label>Salary Range (From)</label>
                                    <input type="number" placeholder="Min Amount" />
                                </div>
                                <div className="form-group">
                                    <label>Salary Range (To)</label>
                                    <input type="number" placeholder="Max Amount" />
                                </div>
                                <div className="form-group">
                                    <label>File Upload</label>
                                    <input type="file" />
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Project Details & Description</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Project Code</label>
                                    <input type="text" placeholder="e.g. HO-001" />
                                </div>
                                <div className="form-group">
                                    <label>Project Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter project name"
                                        value={formData.project || ''}
                                        onChange={(e) => handleInputChange('project', e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Job Description</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Detailed job description and key responsibilities..."
                                        defaultValue={v.jd}
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-primary" onClick={() => setViewMode('list')}>
                            {isEdit ? 'Save Changes' : 'Create Vacancy'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderVacancyDetail = () => {
        if (!selectedVacancy) return null;
        const v = selectedVacancy;
        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">Vacancy Request Details</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Request Number</label><div>{v.reqNo || 'REQ-2026-001'}</div></div>
                                <div className="info-item"><label>Date of Requisition</label><div>{v.dateOfReq || '12-01-2026'}</div></div>
                                <div className="info-item"><label>Department</label><div>{v.department || 'Management'}</div></div>
                                <div className="info-item"><label>Position</label><div>{v.position}</div></div>

                                <div className="info-item"><label>Reporting to Name</label><div>{v.reportingManager || '-'}</div></div>
                                <div className="info-item"><label>Reporting Code</label><div>{v.reportingCode || 'EMP807'}</div></div>
                                <div className="info-item"><label>Employee Type</label><div>{v.employmentType || 'Permanent'}</div></div>
                                <div className="info-item"><label>Gender</label><div>{v.gender || 'Male'}</div></div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Vacancy Requirements</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Number of Vacancy</label><div>{v.noOfVacancies || 1}</div></div>
                                <div className="info-item"><label>Required Date</label><div>{v.requiredBy || '12-01-2026'}</div></div>
                                <div className="info-item"><label>Preferred Education</label><div>{v.qualification || 'Degree Holder'}</div></div>
                                <div className="info-item"><label>Reason for Req.</label><div>{v.hiringType || 'New Position'}</div></div>

                                <div className="info-item"><label>Salary Range (From)</label><div>{v.salaryRange?.split('-')[0] || '₹10L'}</div></div>
                                <div className="info-item"><label>Salary Range (To)</label><div>{v.salaryRange?.split('-')[1] || '₹20L'}</div></div>
                                <div className="info-item"><label>Uploaded File</label><div className="text-blue-600 cursor-pointer">View File</div></div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Project Details & Job Description</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Project Code</label><div>{v.projectCode || 'HO-001'}</div></div>
                                <div className="info-item"><label>Project Name</label><div>{v.project || '-'}</div></div>
                                <div className="info-item" style={{ gridColumn: 'span 4' }}>
                                    <label>Job Description</label>
                                    <div className="jd-content bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
                                        {v.jd || 'No job description provided.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Close</button>
                        <button className="btn-primary" onClick={() => setViewMode('edit')}>Edit Vacancy</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="employees-page">
            {viewMode === 'create' || viewMode === 'edit' ? renderVacancyForm() : null}
            {viewMode === 'view' ? renderVacancyDetail() : null}
            <div className="page-header">
                <h1 className="page-title">Vacancy Management</h1>
                <button className="btn-primary" onClick={() => { setSelectedVacancy(null); setViewMode('create'); }}>
                    <Plus size={20} />
                    <span>Add Vacancy</span>
                </button>
            </div>

            {/* Table Section */}
            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table" style={{ minWidth: '1400px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '120px' }}>Vacancy Code</th>
                                <th style={{ width: '220px' }}>Position</th>
                                <th style={{ width: '150px' }}>Department</th>
                                <th style={{ width: '180px' }}>Project / Location</th>
                                <th style={{ width: '100px' }} className="text-center">Vacancies</th>
                                <th style={{ width: '100px' }} className="text-center">Filled</th>
                                <th style={{ width: '110px' }} className="text-center">Remaining</th>
                                <th style={{ width: '140px' }}>Hiring Type</th>
                                <th style={{ width: '120px' }}>Target Date</th>
                                <th style={{ width: '110px' }}>Status</th>
                                <th style={{ width: '110px' }}>Approval</th>
                                <th className="text-center" style={{ width: '100px' }}>Actions</th>
                            </tr>
                            {/* Inline Filter Row */}
                            <tr className="filter-row">
                                <th><input type="text" className="inline-filter" placeholder="Code" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Position" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Department" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Project" /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Vac" /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Fill" /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Rem" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Type" /></th>
                                <th><input type="date" className="inline-filter" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Status" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Approval" /></th>
                                <th className="text-center">
                                    <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {vacancies.map((v) => (
                                <tr key={v.id}>
                                    <td className="font-mono text-blue-600 font-medium text-xs" title={v.reqNo}>{v.reqNo}</td>
                                    <td className="font-semibold text-gray-800 text-sm overflow-hidden text-ellipsis">{v.position}</td>
                                    <td className="text-sm overflow-hidden text-ellipsis">{v.department}</td>
                                    <td className="text-sm overflow-hidden text-ellipsis">{v.project}</td>
                                    <td className="text-center font-mono">{v.noOfVacancies}</td>
                                    <td className="text-center font-mono">{v.filledPositions}</td>
                                    <td className="text-center font-mono">{v.noOfVacancies - v.filledPositions}</td>
                                    <td className="text-sm">{v.hiringType}</td>
                                    <td className="font-mono text-xs">{v.targetJoiningDate}</td>
                                    <td className="text-center">
                                        <span className={`status-badge ${v.status === 'Open' ? 'status-open' :
                                            v.status === 'On Hold' ? 'status-on-hold' : 'status-closed'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-badge ${v.approvalStatus === 'Approved' ? 'status-approved' :
                                            v.approvalStatus === 'Pending' ? 'status-pending' : 'status-rejected'}`}>
                                            {v.approvalStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-wrapper" style={{ justifyContent: 'center' }}>
                                            <button className="action-btn view" title="View" onClick={() => { setSelectedVacancy(v); setViewMode('view'); }}><Eye size={18} /></button>
                                            <button className="action-btn edit" title="Edit" onClick={() => { setSelectedVacancy(v); setViewMode('edit'); }}><Edit size={18} /></button>
                                            <button className="action-btn delete" title="Delete"><Trash2 size={18} /></button>
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
                .inline-filter::placeholder {
                    color: #9ca3af;
                    font-weight: 400;
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
                .text-xs { font-size: 0.75rem; }

            `}</style>
        </div>
    );
};

export default Vacancy;
