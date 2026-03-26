import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Eye, Pencil, Trash2, Calendar,
    User, Mail, Phone, MapPin, Briefcase, CreditCard, FileText,
    CheckCircle, X, ChevronDown, Upload, Shield
} from 'lucide-react';
import { candidateService } from '../services/candidateService';
import { employeeService } from '../services/employeeService';
import SearchableSelect from '../components/common/SearchableSelect';
import PhoneInput from '../components/common/PhoneInput';

const Employees = () => {
    // State
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [activeTab, setActiveTab] = useState('essential');
    const [employees, setEmployees] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial Form State
    const initialFormState = {
        // Essential HR
        candidateId: '', // For auto-fetch
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        reportingManager: '',
        workLocation: '',
        employmentCategory: 'Permanent', // Permanent, Probation, Temporary
        workMode: 'On-site', // Remote, Hybrid, On-site
        shift: 'General',
        systemRole: 'Employee', // Admin, HR, Manager, Employee
        salaryType: 'Monthly',

        // Personal Details
        dob: '',
        gender: '',
        maritalStatus: '',
        bloodGroup: '',
        nationality: '',
        currentAddress: '',
        permanentAddress: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        aadhaar: '',
        pan: '',

        // Employment Details
        doj: '',
        dateOfConfirmation: '',
        probationEndDate: '',
        contractStartDate: '',
        contractEndDate: '',
        noticePeriod: '',
        employeeGrade: '',
        employeeCategory: 'Technical', // Technical, Non-Technical, Support

        // Payroll
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        uan: '',
        esi: '',
        ctc: '',
        basicPay: '',
        allowances: '',

        // Documents (Using booleans or strings for now)
        offerLetter: false,
        appointmentLetter: false,
        idProof: false,
        addressProof: false,
        resume: false,
        ndaSigned: false,
        experienceLetter: false
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        // Fetch candidates for dropdown
        const fetchCandidates = async () => {
            const data = await candidateService.getAllCandidates();
            setCandidates(data || []);
        };
        fetchCandidates();

        // Fetch employees (mock for now, replace with actual call if ready)
        // setEmployees(mockData); 
    }, []);

    const handleCandidateSelect = (candidateName) => {
        // Logic to find selected candidate and auto-fill
        const candidate = candidates.find(c => c.name === candidateName);
        if (candidate) {
            setFormData(prev => ({
                ...prev,
                candidateId: candidate.id,
                firstName: candidate.name.split(' ')[0] || '',
                lastName: candidate.name.split(' ').slice(1).join(' ') || '',
                email: candidate.email || '',
                phone: candidate.phone || '',
                workLocation: candidate.location || '',
                // Add other mappings as needed
            }));
        }
    };

    // Validations & Handlers placeholder
    const handleSave = (e) => {
        e.preventDefault();
        console.log("Saving Employee:", formData);
        // Add save logic
        setViewMode('list');
    };

    // Mock Data for List View (Preserving existing for now)
    const [mockEmployees] = useState([
        { id: 'EMP001', name: 'John Doe', dept: 'Engineering', designation: 'Senior Dev', status: 'Active', type: 'Full Time', doj: '2023-01-15' },
        { id: 'EMP002', name: 'Jane Smith', dept: 'HR', designation: 'Recruiter', status: 'Active', type: 'Full Time', doj: '2023-02-10' },
        { id: 'EMP003', name: 'Robert Johnson', dept: 'Design', designation: 'UI Designer', status: 'On Leave', type: 'Contract', doj: '2023-03-05' },
        { id: 'EMP004', name: 'Emily Davis', dept: 'Marketing', designation: 'Marketing Lead', status: 'Active', type: 'Full Time', doj: '2022-11-20' },
        { id: 'EMP005', name: 'Michael Wilson', dept: 'Engineering', designation: 'DevOps', status: 'Inactive', type: 'Full Time', doj: '2021-06-15' },
    ]);

    const renderList = () => (
        <>
            <div className="page-header">
                <h1 className="page-title">Employees Management</h1>
                <button className="btn-primary" onClick={() => { setFormData(initialFormState); setViewMode('create'); setActiveTab('essential'); }}>
                    <Plus size={20} />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Table Section */}
            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Employee ID</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Status</th>
                                <th>Type</th>
                                <th>Date of Joining</th>
                                <th>Actions</th>
                            </tr>
                            {/* Inline Filter Row */}
                            <tr className="filter-row">
                                <th>
                                    <input type="text" className="inline-filter" placeholder="Filter Name" />
                                </th>
                                <th>
                                    <input type="text" className="inline-filter" placeholder="Filter ID" />
                                </th>
                                <th>
                                    <input type="text" className="inline-filter" placeholder="Filter Dept" />
                                </th>
                                <th>
                                    <input type="text" className="inline-filter" placeholder="Filter Role" />
                                </th>
                                <th>
                                    <select className="inline-filter">
                                        <option value="">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                </th>
                                <th>
                                    <input type="text" className="inline-filter" placeholder="Filter Type" />
                                </th>
                                <th>
                                    <input type="date" className="inline-filter" />
                                </th>
                                <th className="text-center">
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockEmployees.map((emp) => (
                                <tr key={emp.id}>
                                    <td>
                                        <div className="emp-profile">
                                            <div className="emp-avatar">{emp.name.charAt(0)}</div>
                                            <span className="emp-name">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary">{emp.id}</td>
                                    <td>{emp.dept}</td>
                                    <td>{emp.designation}</td>
                                    <td>
                                        <span className={`status-badge ${emp.status.toLowerCase().replace(' ', '-')}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td>{emp.type}</td>
                                    <td className="text-secondary">{emp.doj}</td>
                                    <td>
                                        <div className="actions-wrapper">
                                            <button className="action-btn view" title="View"><Eye size={18} /></button>
                                            <button className="action-btn edit" title="Edit"><Pencil size={18} /></button>
                                            <button className="action-btn delete" title="Delete"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="pagination-info">Showing 1 to 5 of 5 entries</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled">Previous</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn disabled">Next</button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderForm = () => (
        <div className="modal-overlay">
            <div className="modal-content large-modal">
                <div className="form-header">
                    <h2 className="form-title">{viewMode === 'create' ? 'Add New Employee' : 'Edit Employee'}</h2>
                    <button className="close-btn" onClick={() => setViewMode('list')}><X size={24} /></button>
                </div>

                <div className="form-container">
                    {/* Sidebar Tabs */}
                    <div className="form-sidebar">
                        <button className={`tab-btn ${activeTab === 'essential' ? 'active' : ''}`} onClick={() => setActiveTab('essential')}>
                            <User size={18} /> Essential HR
                        </button>
                        <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                            <CheckCircle size={18} /> Personal Details
                        </button>
                        <button className={`tab-btn ${activeTab === 'employment' ? 'active' : ''}`} onClick={() => setActiveTab('employment')}>
                            <Briefcase size={18} /> Employment Details
                        </button>
                        <button className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>
                            <CreditCard size={18} /> Payroll & Bank
                        </button>
                        <button className={`tab-btn ${activeTab === 'compliance' ? 'active' : ''}`} onClick={() => setActiveTab('compliance')}>
                            <FileText size={18} /> Compliance
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="form-content-area">
                        <form onSubmit={handleSave}>
                            {/* Essential HR Section */}
                            {activeTab === 'essential' && (
                                <div className="form-card">
                                    <h3 className="card-title">Essential HR Information</h3>
                                    <div className="form-grid">
                                        <div className="form-group span-2">
                                            <label>Select Candidate (Auto-fill)</label>
                                            <SearchableSelect
                                                options={candidates.map(c => ({ value: c.name, label: c.name }))}
                                                value={formData.candidateId ? candidates.find(c => c.id === formData.candidateId)?.name : ''}
                                                onChange={handleCandidateSelect}
                                                placeholder="Select a candidate..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>First Name <span className="required">*</span></label>
                                            <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name <span className="required">*</span></label>
                                            <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address <span className="required">*</span></label>
                                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number <span className="required">*</span></label>
                                            <PhoneInput 
                                                value={formData.phone} 
                                                onChange={val => setFormData({ ...formData, phone: val })} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Reporting Manager</label>
                                            <input type="text" value={formData.reportingManager} onChange={e => setFormData({ ...formData, reportingManager: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Work Location</label>
                                            <input type="text" value={formData.workLocation} onChange={e => setFormData({ ...formData, workLocation: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Employment Category</label>
                                            <select value={formData.employmentCategory} onChange={e => setFormData({ ...formData, employmentCategory: e.target.value })}>
                                                <option>Permanent</option>
                                                <option>Probation</option>
                                                <option>Temporary</option>
                                                <option>Contract</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Work Mode</label>
                                            <select value={formData.workMode} onChange={e => setFormData({ ...formData, workMode: e.target.value })}>
                                                <option>On-site</option>
                                                <option>Remote</option>
                                                <option>Hybrid</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Shift / Working Hours</label>
                                            <input type="text" value={formData.shift} onChange={e => setFormData({ ...formData, shift: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>System Role</label>
                                            <select value={formData.systemRole} onChange={e => setFormData({ ...formData, systemRole: e.target.value })}>
                                                <option>Employee</option>
                                                <option>Manager</option>
                                                <option>HR</option>
                                                <option>Admin</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Salary Type</label>
                                            <select value={formData.salaryType} onChange={e => setFormData({ ...formData, salaryType: e.target.value })}>
                                                <option>Monthly</option>
                                                <option>Hourly</option>
                                                <option>Contract Based</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Personal Details Section */}
                            {activeTab === 'personal' && (
                                <div className="form-card">
                                    <h3 className="card-title">Personal Details</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                                <option value="">Select...</option>
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Marital Status</label>
                                            <select value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}>
                                                <option value="">Select...</option>
                                                <option>Single</option>
                                                <option>Married</option>
                                                <option>Divorced</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Blood Group</label>
                                            <input type="text" value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Nationality</label>
                                            <input type="text" value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} />
                                        </div>
                                        <div className="form-group span-2">
                                            <label>Current Address</label>
                                            <textarea rows="2" value={formData.currentAddress} onChange={e => setFormData({ ...formData, currentAddress: e.target.value })} />
                                        </div>
                                        <div className="form-group span-2">
                                            <label>Permanent Address</label>
                                            <textarea rows="2" value={formData.permanentAddress} onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Emergency Contact Name</label>
                                            <input type="text" value={formData.emergencyContactName} onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Emergency Contact Phone</label>
                                            <PhoneInput 
                                                value={formData.emergencyContactPhone} 
                                                onChange={val => setFormData({ ...formData, emergencyContactPhone: val })} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Aadhaar / Nat. ID</label>
                                            <input type="text" value={formData.aadhaar} onChange={e => setFormData({ ...formData, aadhaar: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>PAN / Tax ID</label>
                                            <input type="text" value={formData.pan} onChange={e => setFormData({ ...formData, pan: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Employment Details Section */}
                            {activeTab === 'employment' && (
                                <div className="form-card">
                                    <h3 className="card-title">Employment Details</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Date of Joining</label>
                                            <input type="date" value={formData.doj} onChange={e => setFormData({ ...formData, doj: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Date of Confirmation</label>
                                            <input type="date" value={formData.dateOfConfirmation} onChange={e => setFormData({ ...formData, dateOfConfirmation: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Probation End Date</label>
                                            <input type="date" value={formData.probationEndDate} onChange={e => setFormData({ ...formData, probationEndDate: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Contract Start Date</label>
                                            <input type="date" value={formData.contractStartDate} onChange={e => setFormData({ ...formData, contractStartDate: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Contract End Date</label>
                                            <input type="date" value={formData.contractEndDate} onChange={e => setFormData({ ...formData, contractEndDate: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Notice Period (Days)</label>
                                            <input type="number" value={formData.noticePeriod} onChange={e => setFormData({ ...formData, noticePeriod: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Employee Grade/Level</label>
                                            <input type="text" value={formData.employeeGrade} onChange={e => setFormData({ ...formData, employeeGrade: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Employee Category</label>
                                            <select value={formData.employeeCategory} onChange={e => setFormData({ ...formData, employeeCategory: e.target.value })}>
                                                <option>Technical</option>
                                                <option>Non-Technical</option>
                                                <option>Support</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payroll Section */}
                            {activeTab === 'payroll' && (
                                <div className="form-card">
                                    <h3 className="card-title">Payroll & Bank Details</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Bank Name</label>
                                            <input type="text" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Account Number</label>
                                            <input type="text" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>IFSC Code</label>
                                            <input type="text" value={formData.ifscCode} onChange={e => setFormData({ ...formData, ifscCode: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>UAN / PF Number</label>
                                            <input type="text" value={formData.uan} onChange={e => setFormData({ ...formData, uan: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>ESI Number</label>
                                            <input type="text" value={formData.esi} onChange={e => setFormData({ ...formData, esi: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>CTC (Annual)</label>
                                            <input type="number" value={formData.ctc} onChange={e => setFormData({ ...formData, ctc: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Basic Pay</label>
                                            <input type="number" value={formData.basicPay} onChange={e => setFormData({ ...formData, basicPay: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Allowances</label>
                                            <input type="number" value={formData.allowances} onChange={e => setFormData({ ...formData, allowances: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Compliance Section */}
                            {activeTab === 'compliance' && (
                                <div className="form-card">
                                    <h3 className="card-title">Compliance & Documents</h3>
                                    <div className="documents-grid">
                                        {['Offer Letter', 'Appointment Letter', 'ID Proof', 'Address Proof', 'Resume', 'NDA Signed', 'Experience Letter'].map((doc) => (
                                            <div key={doc} className="document-item">
                                                <div className="doc-icon"><FileText size={20} /></div>
                                                <span className="doc-name">{doc}</span>
                                                <button type="button" className="upload-btn">
                                                    <Upload size={14} /> Upload
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="employees-page">
            {viewMode === 'list' ? renderList() : renderForm()}

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
                
                .clear-filters-mini {
                    background: none;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto; /* Center the button */
                }
                .clear-filters-mini:hover {
                    background-color: #fef2f2;
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
                .status-badge.active { background-color: #ecfdf5; color: #059669; }
                .status-badge.inactive { background-color: #fef2f2; color: #dc2626; }
                .status-badge.on-leave { background-color: #fffbeb; color: #d97706; }

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
                /* Modal & Form Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 50;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .modal-content.large-modal {
                    width: 90%;
                    max-width: 1200px;
                    height: 85vh;
                    background: #fff;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .form-header {
                    padding: 1.5rem;
                    background: #0d4d4d;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .form-title { font-size: 1.25rem; font-weight: 600; }
                .close-btn { background: transparent; border: none; color: white; cursor: pointer; }
                
                .form-container {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                
                /* Sidebar Tabs */
                .form-sidebar {
                    width: 250px;
                    background: white;
                    border-right: 1px solid #e2e8f0;
                    padding: 1.5rem 0;
                    display: flex;
                    flex-direction: column;
                }
                .tab-btn {
                    padding: 1rem 1.5rem;
                    text-align: left;
                    background: transparent;
                    border: none;
                    border-left: 3px solid transparent;
                    color: #64748b;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }
                .tab-btn:hover { background: #f8fafc; color: #334155; }
                .tab-btn.active {
                    background: #f0fdfa;
                    color: #0d9488;
                    border-left-color: #0d9488;
                }
                
                /* Form Content Area */
                .form-content-area {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                    background: #f1f5f9; /* Gray background for content area */
                }

                /* Form Card - The white container */
                .form-card {
                    background: white;
                    border-radius: 8px;
                    padding: 2rem;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }

                .card-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 2rem;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                    row-gap: 2rem;
                }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }
                .required { color: #ef4444; }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 0.6rem 0.8rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    color: #111827;
                    background: white;
                    transition: all 0.2s;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: #0d9488;
                    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
                }
                .span-2 { grid-column: span 2; }
                
                /* Documents Grid */
                .documents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                }
                .document-item {
                    border: 1px solid #e2e8f0;
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: #f8fafc;
                    transition: all 0.2s;
                }
                .document-item:hover {
                    border-color: #cbd5e1;
                    background: white;
                }
                
                .doc-icon {
                    width: 40px; height: 40px;
                    background: #e0f2f1;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    color: #0d9488;
                }
                .doc-name { flex: 1; font-size: 0.9rem; font-weight: 500; color: #334155; }
                .upload-btn {
                    padding: 0.5rem 0.8rem;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.8rem;
                    cursor: pointer;
                    font-weight: 500;
                    color: #4b5563;
                }
                .upload-btn:hover { background: #f1f5f9; }
                
                .form-actions {
                    padding: 1.5rem 2rem;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    background: white;
                }
                .btn-secondary {
                    background: white;
                    border: 1px solid #d1d5db;
                    color: #4b5563;
                    padding: 0.7rem 1.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover { background: #f8fafc; border-color: #9ca3af; }
            `}</style>
        </div>
    );
};


export default Employees;
