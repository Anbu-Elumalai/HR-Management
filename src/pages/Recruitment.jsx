import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Briefcase, Users, Calendar, Award, Plus, Search, Filter, MoreVertical,
    CheckCircle, XCircle, Clock, FileText, MapPin, Mail, Phone, ExternalLink,
    Eye, Edit, Trash2, RefreshCw, RotateCcw, ChevronLeft, ChevronRight, Monitor, X, ChevronDown, Check, Upload
} from 'lucide-react';

const Recruitment = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || 'vacancy';
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedVacancy, setSelectedVacancy] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [offerFormData, setOfferFormData] = useState({
        basicSalary: 0,
        hra: 0,
        specialAllowance: 0,
        bonus: 0,
        pfApplicable: 'No',
        esiApplicable: 'No',
        taxPercentage: 0,
        otherDeductions: 0
    });

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
                                    <input type="text" placeholder="Auto-generated" defaultValue={v.reqNo || 'REQ-2026-001'} readOnly className="bg-gray-50" />
                                </div>
                                <div className="form-group">
                                    <label>Date of Requisition</label>
                                    <input type="date" defaultValue="2026-01-12" />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select defaultValue={v.department || 'Management'}>
                                        <option>Management</option>
                                        <option>Engineering</option>
                                        <option>Design</option>
                                        <option>HR</option>
                                        <option>Finance</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Position</label>
                                    <input type="text" placeholder="e.g. Director of Human Resources" defaultValue={v.position} />
                                </div>

                                <div className="form-group">
                                    <label>Reporting to Name</label>
                                    <input type="text" placeholder="Manager Name" defaultValue={v.reportingManager} />
                                </div>
                                <div className="form-group">
                                    <label>Reporting Code</label>
                                    <input type="text" placeholder="e.g. EMP807" />
                                </div>
                                <div className="form-group">
                                    <label>Employee Type</label>
                                    <select defaultValue={v.employmentType || 'Permanent'}>
                                        <option>Permanent</option>
                                        <option>Contract</option>
                                        <option>Temporary</option>
                                        <option>Intern</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select defaultValue="Male">
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
                                    <label>Preferred Education Qualification</label>
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
                                    <input type="text" placeholder="Enter project name" defaultValue={v.project} />
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

    useEffect(() => {
        if (!tab) {
            navigate('/app/recruitment/vacancy', { replace: true });
        }
    }, [tab, navigate]);

    const handleTabChange = (newTab) => {
        navigate(`/app/recruitment/${newTab}`);
    };
    // const [showModal, setShowModal] = useState(false); // Modal implementation pending

    // Mock Data
    const vacancies = [
        {
            id: 1,
            reqNo: 'VC001',
            position: 'Senior React Developer',
            department: 'Engineering',
            project: 'E-commerce Platform',
            noOfVacancies: 3,
            filledPositions: 1,
            remainingVacancies: 2,
            candidateCount: 15,
            hiringType: 'New Position',
            targetJoiningDate: '2024-04-01',
            status: 'Open',
            approvalStatus: 'Approved',
            priority: 'High',
            employmentType: 'Full-Time',
            location: 'Remote',
            requestedBy: 'John Manager',
            reportingManager: 'Sarah Director',
            hrAssigned: 'Priya HR',
            approver: 'Tech VP',
            jd: 'Build pixel-perfect UIs with React...',
            skills: 'React, TypeScript, TailwindCSS',
            experience: '5-8 years',
            qualification: 'B.E/B.Tech',
            salaryRange: '₹15L - ₹25L',
            currency: 'INR',
            shiftType: 'Day Shift',
            budgetApproved: 'Yes',
            jobType: 'Remote'
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
            candidateCount: 8,
            hiringType: 'Replacement',
            targetJoiningDate: '2024-03-15',
            status: 'On Hold',
            approvalStatus: 'Pending',
            priority: 'Medium',
            employmentType: 'Full-Time',
            location: 'Onsite',
            requestedBy: 'Alice Designer',
            reportingManager: 'Bob Lead',
            hrAssigned: 'Priya HR',
            approver: 'Design Head',
            jd: 'Create stunning user experiences...',
            skills: 'Figma, Adobe XD, Prototyping',
            experience: '3-5 years',
            qualification: 'B.Des/M.Des',
            salaryRange: '₹10L - ₹18L',
            currency: 'INR',
            shiftType: 'Day Shift',
            budgetApproved: 'No',
            jobType: 'Onsite'
        }
    ];

    const candidates = [
        { id: 1, candidateId: 'CAND001', name: 'John Doe', role: 'Senior React Developer', email: 'john@example.com', phone: '+91 9876543210', status: 'Interview', date: '2024-02-14', experience: '5.5 Years', noticePeriod: '30 Days' },
        { id: 2, candidateId: 'CAND002', name: 'Sarah Smith', role: 'HR Manager', email: 'sarah@example.com', phone: '+91 9876543211', status: 'New', date: '2024-02-15', experience: '8 Years', noticePeriod: '15 Days' },
        { id: 3, candidateId: 'CAND003', name: 'Mike Johnson', role: 'Senior React Developer', email: 'mike@example.com', phone: '+91 9876543212', status: 'Rejected', date: '2024-02-13', experience: '4 Years', noticePeriod: 'Immediate' },
    ];

    const interviews = [
        { id: 1, candidate: 'John Doe', role: 'Senior React Developer', interviewer: 'Anbu', date: '2024-02-16', time: '10:00 AM', type: 'Video', status: 'Scheduled', round: 'Technical', duration: 60, timezone: '(GMT+05:30) India Standard Time', location: 'https://meet.google.com/abc-defg-hij', level: 'L2' },
        { id: 2, candidate: 'Sarah Smith', role: 'HR Manager', interviewer: 'Priya', date: '2024-02-17', time: '02:00 PM', type: 'In-person', status: 'Pending', round: 'HR', duration: 30, timezone: '(GMT+05:30) India Standard Time', location: 'Conference Room A', level: 'L1' },
    ];

    const offers = [
        {
            id: 1,
            offerId: 'OFF001',
            candidate: 'Emily Davis',
            candidateId: 'CAND004',
            role: 'UI/UX Designer',
            department: 'Design',
            salary: '12,00,000',
            grossSalary: '1,00,000',
            netSalary: '92,000',
            ctc: '12,00,000',
            date: '2024-02-10',
            status: 'Sent',
            approvalStatus: 'Approved',
            joiningDate: '2024-03-01',
            expiryDate: '2024-02-20'
        },
        {
            id: 2,
            offerId: 'OFF002',
            candidate: 'Robert Brown',
            candidateId: 'CAND005',
            role: 'DevOps Engineer',
            department: 'Engineering',
            salary: '15,00,000',
            grossSalary: '1,25,000',
            netSalary: '1,15,000',
            ctc: '15,00,000',
            date: '2024-02-05',
            status: 'Accepted',
            approvalStatus: 'Approved',
            joiningDate: '2024-02-25',
            expiryDate: '2024-02-15'
        },
    ];

    const calculateSalary = () => {
        const grossVal = Number(offerFormData.basicSalary || 0) +
            Number(offerFormData.hra || 0) +
            Number(offerFormData.specialAllowance || 0) +
            Number(offerFormData.bonus || 0);

        const deductionsVal = Number(offerFormData.otherDeductions || 0) +
            (Number(grossVal) * (Number(offerFormData.taxPercentage || 0) / 100));

        const netVal = grossVal - deductionsVal;
        const ctcVal = grossVal * 12;

        return { grossVal, netVal, ctcVal, deductionsVal };
    };

    const { grossVal, netVal, ctcVal, deductionsVal } = calculateSalary();

    const renderHeaderActions = () => {
        if (viewMode !== 'list' && viewMode !== 'vacancy-list' && viewMode !== 'candidate-list' && viewMode !== 'interview-list' && viewMode !== 'offer-list') {
            // Check for list mode variants if they exist, or just check if viewMode is 'list'
            if (viewMode !== 'list') return null;
        }

        let buttonText = "Add New Vacancy";
        let onClickAction = () => { setViewMode('create'); setSelectedVacancy(null); };

        if (activeTab === 'candidate') {
            buttonText = "Add Candidate";
            onClickAction = () => { setViewMode('add-candidate'); setSelectedCandidate(null); };
        } else if (activeTab === 'interview') {
            buttonText = "Schedule Interview";
            onClickAction = () => { setViewMode('schedule-interview'); setSelectedInterview(null); };
        } else if (activeTab === 'offer') {
            buttonText = "Release Offer";
            onClickAction = () => { setViewMode('create-offer'); setSelectedOffer(null); };
        }

        return (
            <button className="btn-primary" onClick={onClickAction}>
                <Plus size={20} />
                <span>{buttonText}</span>
            </button>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'vacancy':
                if (viewMode === 'create' || viewMode === 'edit') return renderVacancyForm();
                if (viewMode === 'view') return renderVacancyDetail();
                return (
                    <div className="table-container-stabilized">
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr className="header-titles-row">
                                        <th style={{ width: '80px' }} className="text-center">Sl No.</th>
                                        <th style={{ width: '120px' }}>Vacancy Code</th>
                                        <th style={{ minWidth: '200px' }}>Position</th>
                                        <th>Department</th>
                                        <th style={{ minWidth: '180px' }}>Project / Location</th>
                                        <th style={{ width: '100px' }} className="text-center">Vacancies</th>
                                        <th style={{ width: '100px' }} className="text-center">Filled</th>
                                        <th style={{ width: '110px' }} className="text-center">Remaining</th>
                                        <th style={{ width: '150px' }}>Hiring Type</th>
                                        <th style={{ width: '140px' }}>Target Date</th>
                                        <th style={{ width: '130px' }}>Status</th>
                                        <th style={{ width: '140px' }}>Approval</th>
                                        <th className="text-center" style={{ width: '150px' }}>Actions</th>
                                    </tr>
                                    <tr className="filter-row">
                                        <th style={{ width: '80px' }} className="text-center"></th>
                                        <th style={{ width: '120px' }}><input type="text" className="inline-filter" placeholder="Code" /></th>
                                        <th style={{ minWidth: '200px' }}><input type="text" className="inline-filter" placeholder="Position" /></th>
                                        <th><input type="text" className="inline-filter" placeholder="Department" /></th>
                                        <th style={{ minWidth: '180px' }}><input type="text" className="inline-filter" placeholder="Project" /></th>
                                        <th style={{ width: '100px' }}><input type="text" className="inline-filter text-center" placeholder="Count" /></th>
                                        <th style={{ width: '80px' }} className="text-center"></th>
                                        <th style={{ width: '100px' }} className="text-center"></th>
                                        <th style={{ width: '150px' }}><input type="text" className="inline-filter" placeholder="Hiring" /></th>
                                        <th style={{ width: '140px' }}><input type="text" className="inline-filter" placeholder="Target" /></th>
                                        <th style={{ width: '130px' }}><input type="text" className="inline-filter" placeholder="Status" /></th>
                                        <th style={{ width: '140px' }}><input type="text" className="inline-filter" placeholder="Approval" /></th>
                                        <th className="text-center" style={{ width: '150px' }}>
                                            <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={false ? 'table-loading-fade' : ''}>
                                    {vacancies.map((v, index) => (
                                        <tr key={v.id}>
                                            <td className="text-center">{v.id}</td>
                                            <td className="font-mono text-blue-600 font-medium">{v.reqNo}</td>
                                            <td className="font-semibold text-gray-800">{v.position}</td>
                                            <td>{v.department}</td>
                                            <td>{v.project}</td>
                                            <td className="text-center font-mono">{v.noOfVacancies}</td>
                                            <td className="text-center font-mono">{v.filledPositions}</td>
                                            <td className="text-center font-mono">{v.noOfVacancies - v.filledPositions}</td>
                                            <td>{v.hiringType}</td>
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
                                            <td className="text-center">
                                                <div className="actions-flex">
                                                    <button className="action-btn view" title="View" onClick={() => { setSelectedVacancy(v); setViewMode('view'); }}>
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="action-btn edit" title="Edit" onClick={() => { setSelectedVacancy(v); setViewMode('edit'); }}>
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
                        <div className="pagination-premium">
                            <div className="footer-left">
                                <span className="pagination-info">Showing 1 to 2 of 2 entries</span>
                            </div>

                            <div className="pagination-controls-premium">
                                <button className="page-btn-premium disabled">Previous</button>
                                <button className="page-btn-premium active">1</button>
                                <button className="page-btn-premium disabled">Next</button>
                            </div>
                        </div>
                    </div>
                );
            case 'candidate':
                if (viewMode === 'add-candidate' || viewMode === 'candidate-edit') return renderCandidateForm();
                if (viewMode === 'candidate-view') return renderCandidateDetail();
                return (
                    <div className="table-container-stabilized">
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr className="header-titles-row">
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
                                        <th style={{ width: '150px' }}><input type="text" className="inline-filter text-center" placeholder="Search ID" /></th>
                                        <th style={{ width: '130px' }}><input type="text" className="inline-filter" placeholder="Experience" /></th>
                                        <th><input type="text" className="inline-filter" placeholder="Candidate Name" /></th>
                                        <th><input type="text" className="inline-filter" placeholder="Email" /></th>
                                        <th><input type="text" className="inline-filter" placeholder="Role" /></th>
                                        <th style={{ width: '150px' }}><input type="text" className="inline-filter" placeholder="Status" /></th>
                                        <th style={{ width: '160px' }}><input type="text" className="inline-filter" placeholder="Notice" /></th>
                                        <th className="text-center" style={{ width: '150px' }}>
                                            <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={false ? 'table-loading-fade' : ''}>
                                    {candidates.map(candidate => (
                                        <tr key={candidate.id}>
                                            <td className="text-center font-mono text-blue-600 font-medium">{candidate.candidateId}</td>
                                            <td className="font-mono text-sm">{candidate.experience}</td>
                                            <td>
                                                <div className="candidate-info-cell">
                                                    <div className="candidate-avatar">
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                    <div className="font-semibold text-sm text-gray-800">{candidate.name}</div>
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
                                            <td className="text-center">
                                                <div className="actions-flex">
                                                    <button className="action-btn view" title="View" onClick={() => { setSelectedCandidate(candidate); setViewMode('candidate-view'); }}>
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="action-btn edit" title="Edit" onClick={() => { setSelectedCandidate(candidate); setViewMode('candidate-edit'); }}>
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
                        <div className="pagination-premium">
                            <div className="footer-left">
                                <span className="pagination-info">Showing 1 to 3 of 3 entries</span>
                            </div>

                            <div className="pagination-controls-premium">
                                <button className="page-btn-premium disabled">Previous</button>
                                <button className="page-btn-premium active">1</button>
                                <button className="page-btn-premium disabled">Next</button>
                            </div>
                        </div>
                    </div>
                );
            case 'interview':
                if (viewMode === 'schedule-interview' || viewMode === 'interview-edit') return renderInterviewForm();
                if (viewMode === 'interview-view') return renderInterviewDetail();
                return (
                    <div className="table-container-stabilized">
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr className="header-titles-row">
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
                                        <th style={{ width: '150px' }}><input type="text" className="inline-filter" placeholder="Date" /></th>
                                        <th style={{ width: '100px' }}><input type="text" className="inline-filter text-center" placeholder="Level" /></th>
                                        <th style={{ width: '130px' }}><input type="text" className="inline-filter text-center" placeholder="Type" /></th>
                                        <th style={{ width: '150px' }}><input type="text" className="inline-filter text-center" placeholder="Status" /></th>
                                        <th className="text-center" style={{ width: '150px' }}>
                                            <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={false ? 'table-loading-fade' : ''}>                                {interviews.map(interview => (
                                    <tr key={interview.id}>
                                        <td>
                                            <div className="candidate-info-cell">
                                                <div className="candidate-avatar">
                                                    {interview.candidate.charAt(0)}
                                                </div>
                                                <div className="font-semibold text-sm text-gray-800">{interview.candidate}</div>
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
                                        <td className="text-center">
                                            <div className="actions-flex">
                                                <button className="action-btn view" title="View" onClick={() => { setSelectedInterview(interview); setViewMode('interview-view'); }}>
                                                    <Eye size={18} />
                                                </button>
                                                <button className="action-btn edit" title="Edit" onClick={() => { setSelectedInterview(interview); setViewMode('interview-edit'); }}>
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
                        <div className="pagination-premium">
                            <div className="footer-left">
                                <span className="pagination-info">Showing 1 to 2 of 2 entries</span>
                            </div>

                            <div className="pagination-controls-premium">
                                <button className="page-btn-premium disabled">Previous</button>
                                <button className="page-btn-premium active">1</button>
                                <button className="page-btn-premium disabled">Next</button>
                            </div>
                        </div>
                    </div>
                );
            case 'offer':
                if (viewMode === 'create-offer' || viewMode === 'offer-edit') return renderOfferForm();
                if (viewMode === 'offer-view') return renderOfferDetail();
                return (
                    <div className="table-container-stabilized">
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr className="header-titles-row">
                                        <th style={{ width: '120px' }} className="text-center">Offer ID</th>
                                        <th>Candidate</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th style={{ width: '150px' }} className="text-center">Salary (CTC)</th>
                                        <th style={{ width: '130px' }}>Joining Date</th>
                                        <th style={{ width: '130px' }}>Expiry Date</th>
                                        <th style={{ width: '150px' }} className="text-center">Offer Status</th>
                                        <th style={{ width: '150px' }} className="text-center">Approval Status</th>
                                        <th className="text-center" style={{ width: '150px' }}>Actions</th>
                                    </tr>
                                    <tr className="filter-row">
                                        <th style={{ width: '120px' }}><input type="text" className="inline-filter text-center" placeholder="ID" /></th>
                                        <th><input type="text" className="inline-filter" placeholder="Candidate" /></th>
                                        <th><input type="text" className="inline-filter" placeholder="Role" /></th>
                                        <th><input type="text" className="inline-filter" placeholder="Dept" /></th>
                                        <th style={{ width: '150px' }}><input type="text" className="inline-filter text-center" placeholder="Salary" /></th>
                                        <th style={{ width: '130px' }}><input type="text" className="inline-filter" placeholder="Joining" /></th>
                                        <th style={{ width: '130px' }}><input type="text" className="inline-filter" placeholder="Expiry" /></th>
                                        <th style={{ width: '150px' }}><input type="text" className="inline-filter text-center" placeholder="Offer" /></th>
                                        <th style={{ width: '150px' }}><input type="text" className="inline-filter text-center" placeholder="Approval" /></th>
                                        <th className="text-center" style={{ width: '150px' }}>
                                            <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={false ? 'table-loading-fade' : ''}>                                {offers.map(offer => (
                                    <tr key={offer.id}>
                                        <td className="text-center font-mono text-blue-600 font-medium">{offer.offerId}</td>
                                        <td>
                                            <div className="candidate-info-cell">
                                                <div className="candidate-avatar">
                                                    {offer.candidate.charAt(0)}
                                                </div>
                                                <div className="font-semibold text-sm text-gray-800">{offer.candidate}</div>
                                            </div>
                                        </td>
                                        <td className="text-sm">{offer.role}</td>
                                        <td className="text-sm">{offer.department}</td>
                                        <td className="text-center font-mono text-sm font-medium text-gray-700">₹{offer.salary}</td>
                                        <td className="font-mono text-xs">{offer.joiningDate}</td>
                                        <td className="font-mono text-xs">{offer.expiryDate}</td>
                                        <td className="text-center">
                                            <span className={`status-badge ${offer.status === 'Accepted' ? 'status-passed' :
                                                offer.status === 'Rejected' ? 'status-rejected' :
                                                    offer.status === 'Expired' ? 'status-closed' :
                                                        'status-new'
                                                }`}>
                                                {offer.status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`status-badge ${offer.approvalStatus === 'Approved' ? 'status-approved' :
                                                offer.approvalStatus === 'Rejected' ? 'status-rejected' :
                                                    'status-pending'
                                                }`}>
                                                {offer.approvalStatus}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="actions-flex">
                                                <button className="action-btn view" title="View" onClick={() => { setSelectedOffer(offer); setViewMode('offer-view'); }}>
                                                    <Eye size={18} />
                                                </button>
                                                <button className="action-btn edit" title="Edit" onClick={() => { setSelectedOffer(offer); setViewMode('offer-edit'); }}>
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
                        <div className="pagination-premium">
                            <div className="footer-left">
                                <span className="pagination-info">Showing 1 to 2 of 2 entries</span>
                            </div>
                            <div className="pagination-controls-premium">
                                <button className="page-btn-premium disabled">Previous</button>
                                <button className="page-btn-premium active">1</button>
                                <button className="page-btn-premium disabled">Next</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderInterviewForm = () => {
        const isEdit = viewMode === 'interview-edit';
        const i = selectedInterview || {};

        // Mock candidates for dropdown
        const mockCandidates = [
            { id: 1, name: 'John Doe', candidateId: 'CAND001', role: 'Senior React Developer' },
            { id: 2, name: 'Sarah Smith', candidateId: 'CAND002', role: 'HR Manager' },
            { id: 3, name: 'Mike Johnson', candidateId: 'CAND003', role: 'Senior React Developer' }
        ];

        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2>{isEdit ? 'Edit Interview Schedule' : 'Schedule New Interview'}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        {/* 1. Basic Information */}
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                    <label>Interview ID</label>
                                    <input type="text" placeholder="Auto-generated (INT001)" readOnly defaultValue={i.id ? `INT00${i.id}` : 'INT004'} />
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
                        <h2>Interview Details - {i.id ? `INT00${i.id}` : 'N/A'}</h2>
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
                                    <div className="text-blue-600 underline">{i.location}</div>
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
                        <button className="btn-primary" onClick={() => setViewMode('interview-edit')}>Edit Schedule</button>
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
                        <h2>Candidate Details - {c.name}</h2>
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
                        <button className="btn-primary" onClick={() => setViewMode('candidate-edit')}>Edit Candidate</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderOfferForm = () => {
        const isEdit = viewMode === 'offer-edit';
        const o = selectedOffer || {};

        // Mock candidates who have cleared interviews
        const selectedCandidates = [
            { id: 1, name: 'Emily Davis', candidateId: 'CAND004', role: 'UI/UX Designer', department: 'Design', email: 'emily@example.com', phone: '+91 9876543210' },
            { id: 2, name: 'Robert Brown', candidateId: 'CAND005', role: 'DevOps Engineer', department: 'Engineering', email: 'robert@example.com', phone: '+91 9876543211' }
        ];

        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2>{isEdit ? 'Edit Offer Letter' : 'Create Offer Letter'}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        {/* 1. Candidate Information (Auto-filled) */}
                        <div className="form-card">
                            <div className="form-card-title">Candidate Information (Auto-filled)</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Select Candidate</label>
                                    <select defaultValue={o.candidateId || ""}>
                                        <option value="" disabled>Select Candidate</option>
                                        {selectedCandidates.map(c => <option key={c.id} value={c.candidateId}>{c.candidateId} - {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Candidate ID</label><input type="text" readOnly defaultValue={o.candidateId || "CAND00X"} /></div>
                                <div className="form-group"><label>Vacancy / Position</label><input type="text" readOnly defaultValue={o.role || "Software Engineer"} /></div>
                                <div className="form-group"><label>Department</label><input type="text" readOnly defaultValue={o.department || "Engineering"} /></div>
                                <div className="form-group"><label>Interview Outcome</label><input type="text" readOnly defaultValue="Passed" /></div>
                                <div className="form-group"><label>HR Assigned</label><input type="text" readOnly defaultValue="Anbu HR" /></div>
                                <div className="form-group"><label>Email</label><input type="text" readOnly defaultValue={o.email || "candidate@example.com"} /></div>
                                <div className="form-group"><label>Contact Number</label><input type="text" readOnly defaultValue={o.phone || "+91 9999999999"} /></div>
                            </div>
                        </div>

                        {/* 2. Employment Details */}
                        <div className="form-card">
                            <div className="form-card-title">Employment Details</div>
                            <div className="modal-info-grid">
                                <div className="form-group"><label>Job Title</label><input type="text" defaultValue={o.role} /></div>
                                <div className="form-group">
                                    <label>Employment Type</label>
                                    <select defaultValue={o.employmentType || "Full-Time"}>
                                        <option>Full-Time</option><option>Contract</option><option>Temporary</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Work Location</label>
                                    <select><option>Remote</option><option>Onsite</option><option>Hybrid</option></select>
                                </div>
                                <div className="form-group">
                                    <label>Reporting Manager</label>
                                    <select><option>Sarah Director</option><option>John Manager</option></select>
                                </div>
                                <div className="form-group">
                                    <label>Grade / Level</label>
                                    <select><option>L1</option><option>L2</option><option>L3</option><option>L4</option></select>
                                </div>
                                <div className="form-group">
                                    <label>Shift Type</label>
                                    <select><option>Day Shift</option><option>Night Shift</option></select>
                                </div>
                                <div className="form-group"><label>Probation Period (Months)</label><input type="number" defaultValue={6} /></div>
                                <div className="form-group"><label>Expected Joining Date</label><input type="date" defaultValue={o.joiningDate} /></div>
                            </div>
                        </div>

                        {/* 3. Salary & Compensation Details */}
                        <div className="form-card">
                            <div className="form-card-title">Salary & Compensation Details</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Basic Salary</label>
                                    <input type="number" defaultValue={offerFormData.basicSalary} onChange={(e) => setOfferFormData({ ...offerFormData, basicSalary: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>HRA</label>
                                    <input type="number" defaultValue={offerFormData.hra} onChange={(e) => setOfferFormData({ ...offerFormData, hra: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Special Allowance</label>
                                    <input type="number" defaultValue={offerFormData.specialAllowance} onChange={(e) => setOfferFormData({ ...offerFormData, specialAllowance: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Bonus</label>
                                    <input type="number" defaultValue={offerFormData.bonus} onChange={(e) => setOfferFormData({ ...offerFormData, bonus: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>PF Applicable</label>
                                    <select defaultValue={offerFormData.pfApplicable} onChange={(e) => setOfferFormData({ ...offerFormData, pfApplicable: e.target.value })}>
                                        <option>Yes</option><option>No</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>ESI Applicable</label>
                                    <select defaultValue={offerFormData.esiApplicable} onChange={(e) => setOfferFormData({ ...offerFormData, esiApplicable: e.target.value })}>
                                        <option>Yes</option><option>No</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tax Percentage (%)</label>
                                    <input type="number" defaultValue={offerFormData.taxPercentage} onChange={(e) => setOfferFormData({ ...offerFormData, taxPercentage: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Other Deductions</label>
                                    <input type="number" defaultValue={offerFormData.otherDeductions} onChange={(e) => setOfferFormData({ ...offerFormData, otherDeductions: e.target.value })} />
                                </div>

                                {/* Calculated Fields */}
                                <div className="form-group"><label>Gross Salary (Monthly)</label><input type="text" readOnly value={`₹${grossVal.toLocaleString()}`} className="bg-blue-50 font-bold" /></div>
                                <div className="form-group"><label>Total Deductions</label><input type="text" readOnly value={`₹${deductionsVal.toLocaleString()}`} className="bg-red-50 text-red-600" /></div>
                                <div className="form-group"><label>Net Salary</label><input type="text" readOnly value={`₹${netVal.toLocaleString()}`} className="bg-green-50 text-green-700 font-bold" /></div>
                                <div className="form-group"><label>CTC (Annual)</label><input type="text" readOnly value={`₹${ctcVal.toLocaleString()}`} className="bg-teal-50 text-teal-700 font-bold" /></div>
                            </div>
                        </div>

                        {/* 4. Offer Timeline */}
                        <div className="form-card">
                            <div className="form-card-title">Offer Timeline</div>
                            <div className="modal-info-grid">
                                <div className="form-group"><label>Offer Letter Date</label><input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                                <div className="form-group"><label>Offer Expiry Date</label><input type="date" defaultValue={o.expiryDate} /></div>
                                <div className="form-group"><label>Joining Deadline</label><input type="date" defaultValue={o.joiningDate} /></div>
                                <div className="form-group"><label>Notice Buyout</label><select><option>No</option><option>Yes</option></select></div>
                                <div className="form-group"><label>Relocation Support</label><select><option>No</option><option>Yes</option></select></div>
                            </div>
                        </div>

                        {/* 5. Offer Status Tracking */}
                        <div className="form-card">
                            <div className="form-card-title">Offer Status Tracking</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Offer Status</label>
                                    <select defaultValue={o.status || "Draft"}>
                                        <option>Draft</option><option>Sent</option><option>Accepted</option><option>Rejected</option><option>Expired</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Candidate Response Date</label><input type="date" /></div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Rejection Reason</label><textarea rows="2"></textarea></div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Negotiation Remarks</label><textarea rows="2"></textarea></div>
                            </div>
                        </div>

                        {/* 6. Approval Workflow */}
                        <div className="form-card">
                            <div className="form-card-title">Approval Workflow</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Approved By</label>
                                    <select><option>CEO</option><option>HR Head</option><option>Department Manager</option></select>
                                </div>
                                <div className="form-group">
                                    <label>Approval Status</label>
                                    <select defaultValue={o.approvalStatus || "Pending"}>
                                        <option>Pending</option><option>Approved</option><option>Rejected</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Approval Date</label><input type="date" /></div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Approval Remarks</label><textarea rows="2"></textarea></div>
                            </div>
                        </div>

                        {/* 7. Documents */}
                        <div className="form-card">
                            <div className="form-card-title">Documents</div>
                            <div className="modal-info-grid">
                                <div className="form-group"><label>Offer Letter PDF</label><input type="file" /></div>
                                <div className="form-group"><label>NDA Attachment</label><input type="file" /></div>
                                <div className="form-group"><label>Other Documents</label><input type="file" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-primary" onClick={() => setViewMode('list')}>Save & Send Offer</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderOfferDetail = () => {
        const o = selectedOffer || {};
        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2>Offer Details - {o.offerId}</h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>
                    <div className="form-body">
                        {/* 1. Candidate Information */}
                        <div className="form-card">
                            <div className="form-card-title">Candidate Information</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Candidate Name</label><div>{o.candidate}</div></div>
                                <div className="info-item"><label>Candidate ID</label><div>{o.candidateId}</div></div>
                                <div className="info-item"><label>Vacancy / Position</label><div>{o.role}</div></div>
                                <div className="info-item"><label>Department</label><div>{o.department}</div></div>
                                <div className="info-item"><label>Interview Outcome</label><div>Passed</div></div>
                                <div className="info-item"><label>HR Assigned</label><div>Anbu HR</div></div>
                                <div className="info-item"><label>Email</label><div>{o.email || "candidate@example.com"}</div></div>
                                <div className="info-item"><label>Contact Number</label><div>{o.phone || "+91 9999999999"}</div></div>
                            </div>
                        </div>

                        {/* 2. Employment Details */}
                        <div className="form-card">
                            <div className="form-card-title">Employment Details</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Job Title</label><div>{o.role}</div></div>
                                <div className="info-item"><label>Employment Type</label><div>{o.employmentType || "Full-Time"}</div></div>
                                <div className="info-item"><label>Work Location</label><div>Remote</div></div>
                                <div className="info-item"><label>Reporting Manager</label><div>Sarah Director</div></div>
                                <div className="info-item"><label>Grade / Level</label><div>L2</div></div>
                                <div className="info-item"><label>Shift Type</label><div>Day Shift</div></div>
                                <div className="info-item"><label>Probation Period</label><div>6 Months</div></div>
                                <div className="info-item"><label>Joining Date</label><div>{o.joiningDate}</div></div>
                            </div>
                        </div>

                        {/* 3. Salary & Compensation Details */}
                        <div className="form-card">
                            <div className="form-card-title">Salary & Compensation Details</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Monthly Gross</label><div className="font-bold">₹{o.grossSalary || "0"}</div></div>
                                <div className="info-item"><label>Monthly Net</label><div className="font-bold text-green-700">₹{o.netSalary || "0"}</div></div>
                                <div className="info-item"><label>Annual CTC</label><div className="font-bold text-teal-700">₹{o.ctc || "0"}</div></div>
                                <div className="info-item"><label>PF Applicable</label><div>Yes</div></div>
                                <div className="info-item"><label>ESI Applicable</label><div>No</div></div>
                                <div className="info-item"><label>Tax Percentage</label><div>10%</div></div>
                            </div>
                        </div>

                        {/* 4. Offer Timeline */}
                        <div className="form-card">
                            <div className="form-card-title">Offer Timeline</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Offer Letter Date</label><div>{o.date}</div></div>
                                <div className="info-item"><label>Offer Expiry Date</label><div>{o.expiryDate}</div></div>
                                <div className="info-item"><label>Joining Deadline</label><div>{o.joiningDate}</div></div>
                                <div className="info-item"><label>Notice Buyout</label><div>No</div></div>
                                <div className="info-item"><label>Relocation Support</label><div>Yes</div></div>
                            </div>
                        </div>

                        {/* 5. Offer Status Tracking */}
                        <div className="form-card">
                            <div className="form-card-title">Offer Status Tracking</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Offer Status</label>
                                    <span className={`status-badge ${o.status === 'Accepted' ? 'status-passed' : 'status-new'}`}>{o.status}</span>
                                </div>
                                <div className="info-item"><label>Candidate Response Date</label><div>-</div></div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}><label>Rejection Reason</label><div>-</div></div>
                            </div>
                        </div>

                        {/* 6. Approval Workflow */}
                        <div className="form-card">
                            <div className="form-card-title">Approval Workflow</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Approved By</label><div>CEO</div></div>
                                <div className="info-item"><label>Approval Status</label>
                                    <span className={`status-badge ${o.approvalStatus === 'Approved' ? 'status-approved' : 'status-pending'}`}>{o.approvalStatus}</span>
                                </div>
                                <div className="info-item"><label>Approval Date</label><div>2024-02-01</div></div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}><label>Approval Remarks</label><div>Budget approved for senior role.</div></div>
                            </div>
                        </div>
                    </div>
                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Close</button>
                        <button className="btn-primary" onClick={() => setViewMode('offer-edit')}>Edit Offer</button>
                    </div>
                </div>
            </div>
        );
    };

    const Monitor = ({ size }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
    );

    return (
        <div className="recruitment-page">
            <style>{`
                /* Recruitment Page Layout */
                .recruitment-page {
                    padding: 1.5rem;
                    padding-bottom: 0.5rem; /* Reduced bottom padding */
                    padding-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    height: calc(100vh - 64px); /* Fixed height for flex container */
                    background: #0d4d4d;
                    overflow: hidden; /* Prevent body scroll */
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    min-height: 48px;
                }
                .page-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                    letter-spacing: -0.02em;
                    margin: 0;
                    display: flex;
                    align-items: center;
                }
                .btn-primary {
                    background: #0d5f68;
                    color: white;
                    border: none;
                    padding: 0.5rem 1.2rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    letter-spacing: -0.01em;
                }
                .btn-primary:hover {
                    background: #0b4e56;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
                }
                .tabs-container {
                    display: flex;
                    gap: 0.75rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 0.5rem;
                    margin-bottom: 0.5rem; /* Reduced spacing to remove gap */
                }
                .tab-btn {
                    padding: 0.45rem 1rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: all 0.2s;
                    background: transparent;
                    border: none;
                }
                .tab-btn:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                }
                .tab-btn.active {
                    background: white;
                    color: #0d4d4d;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                /* Table Container Standardized */
                .table-container-stabilized {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    flex: 1; /* Fill available vertical space */
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background-color: white;
                    margin-bottom: 0.5rem; /* Slight margin at bottom */
                }
                .table-wrapper {
                    overflow: auto;
                    width: 100%;
                    background: white;
                    padding-right: 2px;
                    flex: 1; /* Push pagination to bottom */
                }
                /* Custom Scrollbar */
                .table-wrapper::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .table-wrapper::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .table-wrapper::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }
                .table-wrapper::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                table { width: 100%; border-collapse: separate; border-spacing: 0; }
                
                /* Sticky Headers */
                .header-titles-row th {
                    background: #f8f9fb;
                    padding: 0.75rem 1.25rem;
                    text-align: left;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #374151;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    position: sticky;
                    top: 0;
                    z-index: 30;
                    border-bottom: 1px solid #e5e7eb;
                    white-space: nowrap;
                    height: 44px;
                    vertical-align: middle;
                }
                .filter-row th {
                    background: #f8f9fb;
                    padding: 0.5rem 1.25rem 1rem 1.25rem;
                    position: sticky;
                    top: 44px;
                    z-index: 25;
                    border-bottom: 1px solid #e5e7eb;
                    height: 54px;
                    vertical-align: middle;
                }
                .inline-filter {
                    width: 100%;
                    height: 38px;
                    padding: 0.4rem 0.8rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    outline: none;
                    background: white;
                    color: #4b5563;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .inline-filter:focus {
                    border-color: #0d5f68;
                    box-shadow: 0 0 0 3px rgba(13, 95, 104, 0.1);
                }

                .btn-reset-filters-roles {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-reset-filters-roles:hover {
                    background-color: #f8fafc;
                    border-color: #d1d5db;
                    color: #0d4d4d;
                }


                td {
                    padding: 0.85rem 1.25rem;
                    border-bottom: 1px solid #f3f4f6;
                    color: #1f2937;
                    font-size: 0.95rem;
                    vertical-align: middle;
                    white-space: nowrap;
                }
                tr:hover td { background-color: #f9fafb; }

                /* Action Buttons */
                .actions-flex {
                    display: flex;
                    justify-content: center;
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

                /* Status Badges */
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
                    background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; 
                }
                .status-rejected, .status-expired { 
                    background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; 
                }
                .status-closed { 
                    background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; 
                }
                .status-new { 
                    background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; 
                }

                /* Animations */
                .tab-content {
                    animation: fadeIn 0.3s ease-in-out;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
                .font-semibold { font-weight: 600; }
                .text-teal-700 { color: #0f766e; }
                .text-blue-600 { color: #2563eb; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-800 { color: #1f2937; }
                .text-gray-500 { color: #6b7280; }
                .text-gray-700 { color: #374151; }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .gap-1 { gap: 0.25rem; }


                @keyframes fadeIn {
                    from {opacity: 0; transform: translateY(5px); }
                to {opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .tabs-container { overflow-x: auto; }
                    .tab-btn { white-space: nowrap; }
                }

                /* Detail View Styles */
                .detail-container { padding: 1.5rem; background: white; border-radius: 8px; animation: fadeIn 0.3s ease; }
                .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 1rem; }
                .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
                .detail-section { background: #f9fafb; padding: 1.2rem; border-radius: 8px; border: 1px solid #f3f4f6; }
                .detail-section.full-width { grid-column: span 2; }


                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
                .info-item label { display: block; font-size: 0.7rem; color: #6b7280; margin-bottom: 0.2rem; text-transform: uppercase; letter-spacing: 0.025em; }
                .info-item div { font-size: 0.85rem; color: #111827; font-weight: 500; }
                .pipeline-stats { display: flex; justify-content: space-between; gap: 0.8rem; flex-wrap: wrap; }
                .stat-card { text-align: center; flex: 1; min-width: 100px; padding: 0.8rem; background: white; border-radius: 6px; border: 1px solid #f3f4f6; }
                .stat-card label { display: block; font-size: 0.65rem; color: #6b7280; margin-bottom: 0.4rem; }
                .stat-card .value { font-size: 1.1rem; font-weight: 700; color: #0d9488; }
                .jd-content { line-height: 1.6; }

                /* Form Styles */
                .form-container { background: white; border-radius: 8px; animation: fadeIn 0.3s ease; display: flex; flex-direction: column; max-height: 85vh; }
                .form-header { padding: 1.2rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
                .form-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
                .form-section { margin-bottom: 2rem; }
                .form-grid { display: grid; grid-template-columns: 1fr; gap: 1.2rem; }
                .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
                .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
                .form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.85rem; outline: none; transition: border-color 0.2s; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #0d9488; border-width: 2px; }
                .form-footer { padding: 1.2rem; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 1rem; background: white; border-radius: 0 0 8px 8px; }

                /* Modal Overlay */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem;
                    z-index: 1000;
                }
                .modal-content {
                    background: #f1f5f9; /* Light gray background for cards to pop */
                    width: 80%;
                    max-width: 1100px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    max-height: 90vh;
                    overflow: hidden;
                }
                .form-header {
                    padding: 1.25rem 1.75rem;
                    background: #0d4d4d; /* Dark teal background */
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                }
                .form-header h2 {
                    color: white !important;
                    font-size: 1.25rem;
                    font-weight: 700;
                }
                .form-header .icon-btn {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 0.4rem;
                    border-radius: 0.5rem;
                }
                .form-body {
                    padding: 2rem;
                    overflow-y: auto;
                    flex: 1;
                }
                .form-footer {
                    padding: 1.25rem 2rem;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    background: white;
                }
                .btn-primary {
                    background: #0d4d4d; /* Dark teal matched with header */
                    color: white;
                    padding: 0.75rem 2rem;
                    border-radius: 0.5rem;
                    font-weight: 700;
                    border: none;
                    transition: all 0.2s;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .btn-secondary {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    padding: 0.75rem 2rem;
                    border-radius: 0.5rem;
                    font-weight: 700;
                    transition: all 0.2s;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .btn-primary:hover {
                    background: #093737;
                    transform: translateY(-1px);
                }
                .btn-secondary:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                    transform: translateY(-1px);
                }
                .form-card {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                    margin-bottom: 1.5rem;
                }
                .form-card-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0d9488;
                    margin-bottom: 1.25rem;
                    border-bottom: 2px solid #0d9488;
                    padding-bottom: 0.5rem;
                    display: inline-block;
                }
                .modal-info-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                }
                .field-group {
                    position: relative;
                    margin-bottom: 0.5rem;
                }
                .field-group label {
                    position: absolute;
                    top: 0;
                    left: 12px;
                    transform: translateY(-50%);
                    background: white;
                    padding: 0 4px;
                    font-size: 11px;
                    color: #94a3b8;
                    font-weight: 500;
                    z-index: 1;
                    pointer-events: none;
                }
                .field-group input, .field-group select {
                    width: 100%;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 0.85rem;
                    background: transparent;
                    color: #334155;
                }
                .field-group select {
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 14px;
                }
                .file-card {
                    grid-column: span 4;
                    grid-row: span 3;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .file-card-header {
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }
                .file-card-header span {
                    font-weight: 600;
                    color: #475569;
                    font-size: 0.9rem;
                }
                .file-card-body {
                    flex: 1;
                    padding: 1rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .file-drop-zone {
                    width: 100%;
                    height: 100%;
                    border: 2px dashed #e2e8f0;
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 1.5rem;
                    text-align: center;
                }
                .file-drop-zone .upload-icon {
                    background: #f8fafc;
                    padding: 8px;
                    border-radius: 50%;
                    margin-bottom: 0.75rem;
                    color: #94a3b8;
                    border: 1px solid #f1f5f9;
                }
                .browse-btn {
                    margin-top: 0.75rem;
                    color: #4f46e5;
                    border: 1px solid #e2e8f0;
                    padding: 5px 14px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    background: white;
                }
                .salary-range-container {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    grid-column: span 12;
                    margin-top: 0.5rem;
                }
                .field-item-view {
                    width: 100%;
                    border: 1px solid #f1f5f9;
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 0.85rem;
                    background: #f8fafc;
                    color: #334155;
                    min-height: 40px;
                }
                .detail-section-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 1.5rem 0 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                .modal-info-grid .info-item label {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                }
                .modal-info-grid .info-item div {
                    font-size: 0.85rem;
                    color: #374151;
                    font-weight: 500;
                }

                .table-footer {
                    display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-top: 1px solid #f3f4f6;
                font-size: 0.85rem;
                color: #64748b;
                background: white;
                }
                .footer-left {
                    display: flex;
                align-items: center;
                gap: 1.5rem;
                }
                .footer-right {
                    display: flex;
                align-items: center;
                gap: 0.5rem;
                }
                .rows-per-page-container {
                    display: flex;
                align-items: center;
                gap: 0.5rem;
                }
                .footer-separator {
                    width: 1px;
                height: 1.25rem;
                background-color: #e2e8f0;
                }
                .footer-select {
                    padding: 0.2rem 0.5rem;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                outline: none;
                background: white;
                color: #334155;
                font-size: 0.85rem;
                }
                .pagination-btn:hover:not(:disabled) {
                    background-color: #f9fafb;
                    border-color: #d1d5db;
                }
                .pagination-btn.active {
                    background-color: #0d4d4d;
                    color: white;
                    border-color: #0d4d4d;
                    box-shadow: 0 2px 4px rgba(13, 77, 77, 0.2);
                }
                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .pagination-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #f3f4f6;
                    background: white;
                }
                .pagination-info {
                    font-size: 0.85rem;
                    color: #6b7280;
                    font-weight: 500;
                }
                .pagination-controls-premium {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .page-btn-premium {
                    min-width: 36px;
                    height: 36px;
                    padding: 0 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    color: #475569;
                    transition: all 0.2s;
                    font-weight: 600;
                }
                .page-btn-premium:hover:not(.disabled) {
                    background-color: #f8fafc;
                    border-color: #cbd5e1;
                    color: #0d4d4d;
                }
                .page-btn-premium.active {
                    background-color: #0d4d4d;
                    color: white;
                    border-color: #0d4d4d;
                    box-shadow: 0 2px 4px rgba(13, 77, 77, 0.2);
                }
                .page-btn-premium.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background-color: #f8fafc;
                    color: #94a3b8;
                }
                .candidate-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #eef2ff;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.9rem;
                }


            `}</style>

            <div className="page-header">
                <h1 className="page-title">Recruitment Management</h1>
                {renderHeaderActions()}
            </div>

            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === 'vacancy' ? 'active' : ''}`}
                    onClick={() => handleTabChange('vacancy')}
                >
                    <Briefcase size={16} /> Vacancy
                </button>
                <button
                    className={`tab-btn ${activeTab === 'candidate' ? 'active' : ''}`}
                    onClick={() => handleTabChange('candidate')}
                >
                    <Users size={16} /> Candidate
                </button>
                <button
                    className={`tab-btn ${activeTab === 'interview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('interview')}
                >
                    <Calendar size={16} /> Interview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'offer' ? 'active' : ''}`}
                    onClick={() => handleTabChange('offer')}
                >
                    <Award size={16} /> Offer
                </button>
            </div>

            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Recruitment;
