import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, Eye, Edit, Trash2, X, RotateCcw
} from 'lucide-react';
import './Recruitment.css';
import SearchableSelect from '../../components/common/SearchableSelect';
import { departmentService } from '../../services/departmentService';
import { positionService } from '../../services/positionService';
import { employeeService } from '../../services/employeeService';
import { projectService } from '../../services/projectService';
import api from '../../api/api';
import toast from 'react-hot-toast';
import MultiSelect from '../../components/common/MultiSelect';
import { MapPin, Briefcase } from 'lucide-react';

const Vacancy = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedVacancy, setSelectedVacancy] = useState(null);

    // Master Data State
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [projects, setProjects] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [vacancies, setVacancies] = useState([]);

    const [filterCode, setFilterCode] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [filterVacancies, setFilterVacancies] = useState('');
    const [filterFilled, setFilterFilled] = useState('');
    const [filterRemaining, setFilterRemaining] = useState('');
    const [filterHiringType, setFilterHiringType] = useState('');
    const [filterTargetDate, setFilterTargetDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterApproval, setFilterApproval] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vacancyToDelete, setVacancyToDelete] = useState(null);

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [vacancyForApproval, setVacancyForApproval] = useState(null);
    const [newApprovalStatus, setNewApprovalStatus] = useState('Pending');

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [vacancyForStatus, setVacancyForStatus] = useState(null);
    const [newStatus, setNewStatus] = useState('Draft');

    // Form State
    const [formData, setFormData] = useState({
        skills: [],
        location: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Integrated load function for master data
    const loadMasterData = useCallback(async (isInitial = true) => {
        if (isInitial) setLoading(true);
        try {
            console.log("Vacancy.jsx: Initializing master data fetch...");
            const [depsRes, posRes, empsRes, reasRes, projsRes, etypesRes, vacsRes, skillRes, locRes] = await Promise.all([
                departmentService.getAllDepartments().catch(e => { console.error("Dept error:", e); return []; }),
                positionService.getAllPositions().catch(e => { console.error("Pos error:", e); return []; }),
                employeeService.getAllEmployees().catch(e => { console.error("Emp error:", e); return []; }),
                api.get('/reason-requisition').catch(e => ({ data: [] })),
                projectService.getAllProjects(0, 100).catch(e => ({ data: [] })),
                api.get('/employment-types/').catch(e => ({ data: [] })),
                api.get('/vacancies').catch(e => ({ data: [] })),
                api.get('/skills').catch(e => ({ data: { data: [] } })),
                api.get('/locations').catch(e => ({ data: { data: [] } }))
            ]);

            const getArray = (res) => {
                if (Array.isArray(res)) return res;
                if (res?.data && Array.isArray(res.data)) return res.data;
                if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
                if (res?.result && Array.isArray(res.result)) return res.result;
                return [];
            };

            const deps = getArray(depsRes);
            const pos = getArray(posRes);
            const emps = getArray(empsRes);
            const reas = getArray(reasRes);
            const projs = getArray(projsRes);
            const etypes = getArray(etypesRes);
            const skillsData = getArray(skillRes);
            const locationsData = getArray(locRes);

            // Detailed mapping with fallbacks to ensure dropdowns are NOT empty
            setDepartments(deps.map(d => ({
                label: d.name || d.departmentName || d.label || String(d),
                value: d.id || d._id || d.value || String(d)
            })));

            setPositions(pos.map(p => ({
                label: p.name || p.positionName || p.label || String(p),
                value: p.id || p._id || p.value || String(p)
            })));

            setEmployees(emps.map(e => ({
                label: e.name || e.employeeName || e.label || String(e),
                value: e.id || e._id || e.value || String(e)
            })));

            setAllSkills(Array.isArray(skillsData) ? skillsData.map(s => ({ value: s.name || s, label: s.name || s })) : []);
            setAllLocations(Array.isArray(locationsData) ? locationsData.map(l => ({ value: l.name || l, label: l.name || l })) : []);

            setReasons(reas.map(r => ({
                label: r.name || r.label || String(r),
                value: r.id || r._id || r.value || String(r)
            })));

            setEmploymentTypes(etypes.map(et => ({
                label: et.name || et.value || et.label || String(et),
                value: et.id || et._id || et.value || String(et)
            })));

            setProjects(projs.map(p => ({
                label: `${p.projectCode || p.code} - ${p.projectName || p.name}`,
                value: p.projectCode || p.code,
                name: p.projectName || p.name
            })));

            setVacancies(getArray(vacsRes));
            console.log("Vacancy.jsx: Master data fully loaded and mapped.");
        } catch (error) {
            console.error("Vacancy.jsx: Critical fetch failure:", error);
        } finally {
            setLoading(false);
        }
    }, [departments.length, positions.length]); // Added dependency to check for empty data

    // Unified Effect for Data Loading
    useEffect(() => {
        // Initial Mount Fetch
        loadMasterData();
    }, []);

    // Form Initialization Logic - Simplified and direct
    useEffect(() => {
        if ((viewMode === 'create' || viewMode === 'edit')) {
            // If master data hasn't loaded (e.g. initial fetch failed), retry once
            if (departments.length === 0) {
                loadMasterData(false); // Silent fetch if somehow empty
            }

            const initForm = async () => {
                setFormErrors({});
                if (viewMode === 'create') {
                    let nextCode = 'REQ-2026-001';
                    try {
                        const codeRes = await api.get('/vacancies/code/generate');
                        if (codeRes.data && codeRes.data.data) nextCode = codeRes.data.data;
                    } catch (e) {
                        console.error("Code generation error:", e);
                    }

                    setFormData({
                        id: nextCode,
                        requisitionDate: new Date().toISOString().split('T')[0],
                        employeeTypeId: employmentTypes.length > 0 ? employmentTypes[0].value : '',
                        gender: 'Male',
                        numberOfVacancy: 1,
                        requiredDate: new Date().toISOString().split('T')[0],
                        qualification: 'Freshers allowed',
                        preferredEducation: '',
                        status: 'Draft',
                        approvalStatus: 'Pending',
                        skills: [],
                        location: ''
                    });
                } else if (viewMode === 'edit' && selectedVacancy) {
                    const editData = { ...selectedVacancy };
                    const safeDate = (val) => val && typeof val === 'string' ? val.split('T')[0].substring(0, 10) : '';
                    editData.requisitionDate = safeDate(editData.requisitionDate);
                    editData.requiredDate = safeDate(editData.requiredDate);
                    editData.scheduleDate = safeDate(editData.scheduleDate);
                    
                    // Ensure skills is an array for MultiSelect
                    if (typeof editData.skills === 'string') {
                        editData.skills = editData.skills.split(',').map(s => s.trim()).filter(s => s);
                    } else if (!Array.isArray(editData.skills)) {
                        editData.skills = [];
                    }
                    
                    setFormData(editData);
                }
            };
            initForm();
        }
    }, [viewMode, selectedVacancy, departments.length]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when field is edited
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleProjectChange = (projectCode) => {
        const selectedProj = projects.find(p => p.value === projectCode);
        if (selectedProj) {
            setFormData(prev => ({
                ...prev,
                projectCode: selectedProj.value,
                project: selectedProj.name
            }));
            // Clear errors for both fields
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.projectCode;
                delete newErrors.project;
                return newErrors;
            });
        }
    };

    const handleReportingManagerChange = (employeeId) => {
        const selectedEmployee = employees.find(e => e.value === employeeId);
        if (selectedEmployee) {
            setFormData(prev => ({
                ...prev,
                reportingToId: selectedEmployee.value,
                reportingManager: selectedEmployee.label // For display
            }));
            // Clear errors
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.reportingToId;
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        const requiredFields = [
            'requisitionDate', 'departmentId', 'positionId', 'employeeTypeId',
            'numberOfVacancy', 'requiredDate', 'qualification',
            'reasonForRequisition', 'preferredEducation', 'salaryRangeFrom', 'salaryRangeTo'
        ];
        requiredFields.forEach(field => {
            if (!formData[field] && formData[field] !== 0) {
                errors[field] = 'This field is required';
            }
        });
        
        if (Array.isArray(formData.skills) && formData.skills.length === 0) {
            errors.skills = 'Please select at least one skill';
        }
        
        if (!formData.location) {
            errors.location = 'Please select job location';
        }

        if (formData.numberOfVacancy <= 0) {
            errors.numberOfVacancy = 'Must be greater than 0';
        }

        if (Number(formData.salaryRangeFrom) > Number(formData.salaryRangeTo)) {
            errors.salaryRangeTo = 'To salary cannot be less than From salary';
        }

        if (formData.status === 'Scheduled' && !formData.scheduleDate) {
            errors.scheduleDate = 'Schedule date is required for Scheduled status';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = async () => {
        if (validateForm()) {
            setSubmitting(true);
            try {
                const payload = {
                    requisitionDate: formData.requisitionDate,
                    departmentId: formData.departmentId,
                    positionId: formData.positionId,
                    reportingToId: formData.reportingToId,
                    employeeTypeId: formData.employeeTypeId,
                    gender: formData.gender,
                    numberOfVacancy: formData.numberOfVacancy,
                    requiredDate: formData.requiredDate,
                    preferredEducation: formData.preferredEducation,
                    qualification: formData.qualification,
                    reasonForRequisition: formData.reasonForRequisition,
                    salaryRangeFrom: Number(formData.salaryRangeFrom) || 0,
                    salaryRangeTo: Number(formData.salaryRangeTo) || 0,
                    jobDescription: formData.jobDescription,
                    status: formData.status || 'Draft',
                    approvalStatus: formData.approvalStatus || 'Pending',
                    scheduleDate: formData.status === 'Scheduled' ? formData.scheduleDate : null,
                    location: formData.location,
                    skills: Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills
                };

                let response;
                if (viewMode === 'edit') {
                    response = await api.put(`/vacancies/${formData._id || formData.id}`, payload);
                } else {
                    response = await api.post('/vacancies', payload);
                }

                if (response.status === 200 || response.status === 201) {
                    toast.success(`Vacancy ${viewMode === 'edit' ? 'updated' : 'created'} successfully!`);

                    // Trigger a background refresh (WITHOUT full loading screen)
                    loadMasterData(false);

                    setViewMode('list');
                    setSelectedVacancy(null);
                } else {
                    toast.error("Process failed. Please check backend.");
                }
            } catch (error) {
                console.error("Error submitting vacancy:", error);
                const msg = error.response?.data?.message || "Error occurred while saving vacancy.";
                toast.error(msg);
            } finally {
                setSubmitting(false);
            }
        } else {
            const firstError = Object.values(formErrors)[0] || "Please fill all required fields.";
            toast.error(firstError);
        }
    };

    const handleDeleteClick = (v) => {
        setVacancyToDelete(v);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!vacancyToDelete) return;
        setSubmitting(true);
        try {
            await api.delete(`/vacancies/${vacancyToDelete._id || vacancyToDelete.id}`);
            toast.success("Vacancy deleted successfully!");

            // Background refresh
            loadMasterData(false);

            setShowDeleteModal(false);
            setVacancyToDelete(null);
        } catch (error) {
            console.error("Delete failed:", error);
            const msg = error.response?.data?.message || "Failed to delete vacancy.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprovalClick = (v) => {
        setVacancyForApproval(v);
        setNewApprovalStatus(v.approvalStatus || 'Pending');
        setShowApprovalModal(true);
    };

    const handleApprovalConfirm = async () => {
        if (!vacancyForApproval) return;
        setSubmitting(true);
        try {
            const vacId = vacancyForApproval._id || vacancyForApproval.id;
            await api.patch(`/vacancies/${vacId}/approval`, {
                approvalStatus: newApprovalStatus
            });
            toast.success(`Approval status updated to ${newApprovalStatus}!`);

            // Background refresh
            loadMasterData(false);

            setShowApprovalModal(false);
            setVacancyForApproval(null);
        } catch (error) {
            console.error("Approval update failed:", error);
            const msg = error.response?.data?.message || "Failed to update approval status.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusClick = (v) => {
        setVacancyForStatus(v);
        setNewStatus(v.status || 'Draft');
        setShowStatusModal(true);
    };

    const handleStatusConfirm = async () => {
        if (!vacancyForStatus) return;
        setSubmitting(true);
        try {
            const vacId = vacancyForStatus._id || vacancyForStatus.id;
            await api.patch(`/vacancies/${vacId}/status`, {
                status: newStatus
            });
            toast.success(`Vacancy status updated to ${newStatus}!`);

            // Background refresh
            loadMasterData(false);

            setShowStatusModal(false);
            setVacancyForStatus(null);
        } catch (error) {
            console.error("Status update failed:", error);
            const msg = error.response?.data?.message || "Failed to update vacancy status.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStatusModal = () => (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="delete-header-premium">
                    <button className="icon-btn" onClick={() => setShowStatusModal(false)}>
                        <X size={18} />
                    </button>
                </div>

                <div className="delete-body-premium" style={{ paddingTop: '0rem' }}>
                    <h2 className="delete-title-premium" style={{ fontSize: '1.25rem' }}>Update Status</h2>
                    <p className="delete-message-premium" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                        Updating status for: <br/>
                        <span className="delete-item-badge" style={{ marginTop: '0.5rem', background: '#f8fafc' }}>
                           {vacancyForStatus?.requestNumber || vacancyForStatus?.id}
                        </span>
                    </p>

                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Vacancy Status</label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                marginTop: '0.4rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                background: '#fcfcfd'
                            }}
                        >
                            <option value="Draft">Draft</option>
                            <option value="Open">Open</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Closed">Closed</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Publish">Publish</option>
                        </select>
                    </div>
                </div>

                <div className="delete-footer-premium" style={{ borderTop: 'none', paddingBottom: '2.5rem' }}>
                    <button
                        className="btn-cancel-premium"
                        onClick={() => setShowStatusModal(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleStatusConfirm}
                        disabled={submitting}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '12px',
                            justifyContent: 'center',
                            background: '#0d5f68',
                            boxShadow: '0 4px 12px rgba(13, 95, 104, 0.2)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {submitting ? 'Updating...' : 'Save Change'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderApprovalModal = () => (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
            <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="delete-header-premium">
                    <button className="icon-btn" onClick={() => setShowApprovalModal(false)}>
                        <X size={18} />
                    </button>
                </div>

                <div className="delete-body-premium" style={{ paddingTop: '0rem' }}>
                    <h2 className="delete-title-premium" style={{ fontSize: '1.25rem' }}>Update Status</h2>
                    <p className="delete-message-premium" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                        Updating approval for: <br/>
                        <span className="delete-item-badge" style={{ marginTop: '0.5rem', background: '#f8fafc' }}>
                           {vacancyForApproval?.requestNumber || vacancyForApproval?.id}
                        </span>
                    </p>

                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Approval Status</label>
                        <select
                            value={newApprovalStatus}
                            onChange={(e) => setNewApprovalStatus(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                marginTop: '0.4rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                background: '#fcfcfd'
                            }}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="delete-footer-premium" style={{ borderTop: 'none', paddingBottom: '2rem' }}>
                    <button
                        className="btn-cancel-premium"
                        onClick={() => setShowApprovalModal(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleApprovalConfirm}
                        disabled={submitting}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '12px',
                            justifyContent: 'center',
                            background: '#0d5f68',
                            boxShadow: '0 4px 12px rgba(13, 95, 104, 0.2)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {submitting ? 'Updating...' : 'Save Change'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDeleteModal = () => (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()}>
                <div className="delete-header-premium">
                    <button className="icon-btn" onClick={() => setShowDeleteModal(false)}>
                        <X size={18} />
                    </button>
                </div>
                
                <div className="delete-body-premium">
                    <div className="delete-icon-container">
                        <Trash2 size={36} />
                    </div>
                    <h2 className="delete-title-premium">Confirm Delete</h2>
                    <p className="delete-message-premium">
                        Are you sure you want to permanently delete this vacancy? This action cannot be undone.
                    </p>
                    <div className="delete-item-badge">
                        Code: {vacancyToDelete?.requestNumber || vacancyToDelete?.id || 'N/A'}
                    </div>
                </div>

                <div className="delete-footer-premium">
                    <button 
                        className="btn-cancel-premium" 
                        onClick={() => setShowDeleteModal(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn-delete-premium" 
                        onClick={handleDeleteConfirm} 
                        disabled={submitting}
                    >
                        {submitting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderVacancyForm = () => {
        const isEdit = viewMode === 'edit';
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
                                        value={formData.requestNumber || formData.id || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Requisition</label>
                                    <input
                                        type="date"
                                        value={formData.requisitionDate || ''}
                                        onChange={(e) => handleInputChange('requisitionDate', e.target.value)}
                                        className={formErrors.requisitionDate ? 'input-error' : ''}
                                    />
                                    {formErrors.requisitionDate && <span className="error-text">{formErrors.requisitionDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <SearchableSelect
                                        options={departments}
                                        value={formData.departmentId}
                                        onChange={(val) => handleInputChange('departmentId', val)}
                                        placeholder="Select Department"
                                        error={formErrors.departmentId}
                                    />
                                    {formErrors.departmentId && <span className="error-text">{formErrors.departmentId}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Position</label>
                                    <SearchableSelect
                                        options={positions}
                                        value={formData.positionId}
                                        onChange={(val) => handleInputChange('positionId', val)}
                                        placeholder="Select Position"
                                        error={formErrors.positionId}
                                    />
                                    {formErrors.positionId && <span className="error-text">{formErrors.positionId}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Reporting to Name</label>
                                    <SearchableSelect
                                        options={employees.map(e => ({ label: e.label, value: e.value }))}
                                        value={formData.reportingToId}
                                        onChange={handleReportingManagerChange}
                                        placeholder="Select Manager"
                                        error={formErrors.reportingToId}
                                    />
                                    {formErrors.reportingToId && <span className="error-text">{formErrors.reportingToId}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Reporting Code</label>
                                    <input
                                        type="text"
                                        placeholder="Auto-filled"
                                        value={formData.reportingToId || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Employee Type</label>
                                    <SearchableSelect
                                        options={employmentTypes}
                                        value={formData.employeeTypeId}
                                        onChange={(val) => handleInputChange('employeeTypeId', val)}
                                        placeholder="Select Type"
                                        error={formErrors.employeeTypeId}
                                    />
                                    {formErrors.employeeTypeId && <span className="error-text">{formErrors.employeeTypeId}</span>}
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
                            <div className="form-card-title">Vacancy Requirements</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Number of Vacancy</label>
                                    <input
                                        type="number"
                                        value={formData.numberOfVacancy || 1}
                                        onChange={(e) => handleInputChange('numberOfVacancy', parseInt(e.target.value))}
                                        min="1"
                                        className={formErrors.numberOfVacancy ? 'input-error' : ''}
                                    />
                                    {formErrors.numberOfVacancy && <span className="error-text">{formErrors.numberOfVacancy}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Required Date</label>
                                    <input
                                        type="date"
                                        value={formData.requiredDate || ''}
                                        onChange={(e) => handleInputChange('requiredDate', e.target.value)}
                                        className={formErrors.requiredDate ? 'input-error' : ''}
                                    />
                                    {formErrors.requiredDate && <span className="error-text">{formErrors.requiredDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Preferred Education</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MBA HR, BE"
                                        value={formData.preferredEducation || ''}
                                        onChange={(e) => handleInputChange('preferredEducation', e.target.value)}
                                        className={formErrors.preferredEducation ? 'input-error' : ''}
                                    />
                                    {formErrors.preferredEducation && <span className="error-text">{formErrors.preferredEducation}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Qualification / Experience</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 5+ Years, Freshers"
                                        value={formData.qualification || ''}
                                        onChange={(e) => handleInputChange('qualification', e.target.value)}
                                        className={formErrors.qualification ? 'input-error' : ''}
                                    />
                                    {formErrors.qualification && <span className="error-text">{formErrors.qualification}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Reason for Requisition</label>
                                    <SearchableSelect
                                        options={reasons}
                                        value={formData.reasonForRequisition}
                                        onChange={(val) => handleInputChange('reasonForRequisition', val)}
                                        placeholder="Select Reason"
                                        error={formErrors.reasonForRequisition}
                                    />
                                    {formErrors.reasonForRequisition && <span className="error-text">{formErrors.reasonForRequisition}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Salary Range (From)</label>
                                    <input
                                        type="number"
                                        placeholder="Min Amount"
                                        value={formData.salaryRangeFrom || ''}
                                        onChange={(e) => handleInputChange('salaryRangeFrom', e.target.value)}
                                        className={formErrors.salaryRangeFrom ? 'input-error' : ''}
                                    />
                                    {formErrors.salaryRangeFrom && <span className="error-text">{formErrors.salaryRangeFrom}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Salary Range (To)</label>
                                    <input
                                        type="number"
                                        placeholder="Max Amount"
                                        value={formData.salaryRangeTo || ''}
                                        onChange={(e) => handleInputChange('salaryRangeTo', e.target.value)}
                                        className={formErrors.salaryRangeTo ? 'input-error' : ''}
                                    />
                                    {formErrors.salaryRangeTo && <span className="error-text">{formErrors.salaryRangeTo}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status || 'Draft'}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Open">Open</option>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Closed">Closed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>
                                {formData.status === 'Scheduled' && (
                                    <div className="form-group">
                                        <label>Schedule Date</label>
                                        <input
                                            type="date"
                                            value={formData.scheduleDate || ''}
                                            onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                                            className={formErrors.scheduleDate ? 'input-error' : ''}
                                        />
                                        {formErrors.scheduleDate && <span className="error-text">{formErrors.scheduleDate}</span>}
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Approval Status</label>
                                    <select
                                        value={formData.approvalStatus || 'Pending'}
                                        onChange={(e) => handleInputChange('approvalStatus', e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Required Skills</label>
                                    <MultiSelect
                                        options={allSkills.length > 0 ? allSkills : [
                                            { value: 'React', label: 'React' },
                                            { value: 'Node.js', label: 'Node.js' },
                                            { value: 'Javascript', label: 'Javascript' }
                                        ]}
                                        value={Array.isArray(formData.skills) ? formData.skills : []}
                                        onChange={(val) => handleInputChange('skills', val)}
                                        placeholder="Select Required Skills"
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Job Location</label>
                                    <SearchableSelect
                                        options={allLocations.length > 0 ? allLocations : [
                                            { value: 'Chennai', label: 'Chennai' },
                                            { value: 'Bangalore', label: 'Bangalore' },
                                            { value: 'Remote', label: 'Remote' }
                                        ]}
                                        value={formData.location}
                                        onChange={(val) => handleInputChange('location', val)}
                                        placeholder="Select Job Location"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Project & Job Description</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Project Code</label>
                                    <SearchableSelect
                                        options={projects}
                                        value={formData.projectCode}
                                        onChange={handleProjectChange}
                                        placeholder="Select Project Code"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Project Name</label>
                                    <input
                                        type="text"
                                        placeholder="Auto-filled"
                                        value={formData.project || ''}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Job Description</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Detailed job description..."
                                        value={formData.jobDescription || ''}
                                        onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-primary" onClick={handleFormSubmit} disabled={submitting}>
                            {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Vacancy')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleViewClick = async (vacancy) => {
        const vacId = vacancy._id || vacancy.id;
        setLoading(true);
        try {
            const response = await api.get(`/vacancies/${vacId}`);
            setSelectedVacancy(response.data?.data || response.data);
            setViewMode('view');
        } catch (error) {
            console.error("Error fetching vacancy details:", error);
            // Fallback to existing data if needed
            setSelectedVacancy(vacancy);
            setViewMode('view');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = async (vacancy) => {
        const vacId = vacancy._id || vacancy.id;
        setLoading(true);
        try {
            const response = await api.get(`/vacancies/${vacId}`);
            setSelectedVacancy(response.data?.data || response.data);
            setViewMode('edit');
        } catch (error) {
            console.error("Error fetching vacancy for edit:", error);
            setSelectedVacancy(vacancy);
            setViewMode('edit');
        } finally {
            setLoading(false);
        }
    };

    const renderVacancyDetail = () => {
        if (!selectedVacancy) return null;
        const v = selectedVacancy;

        // Resolve names for IDs
        const deptName = v.department?.name || departments.find(d => d.id === v.departmentId || d.value === v.departmentId)?.label || v.departmentId || 'N/A';
        const posName = v.position?.name || positions.find(p => p.id === v.positionId || p.value === v.positionId)?.label || v.positionId || 'N/A';
        const empTypeName = v.employeeType?.name || employmentTypes.find(et => et.id === v.employeeTypeId || et.value === v.employeeTypeId)?.label || v.employeeTypeId || 'N/A';
        const reportingName = v.reportingManager || employees.find(e => e.id === v.reportingToId || e.value === v.reportingToId)?.label || v.reportingToId || 'N/A';
        const reasonName = v.reason?.name || v.reasonForRequisition || '-';
        const skillList = Array.isArray(v.skills) ? v.skills.join(', ') : (typeof v.skills === 'string' ? v.skills : '-');
        const locName = v.location || '-';

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
                                <div className="info-item"><label>Request Number</label><div>{v.requestNumber || v.id || 'N/A'}</div></div>
                                <div className="info-item"><label>Date of Requisition</label><div>{v.requisitionDate ? String(v.requisitionDate).split('T')[0].substring(0, 10) : 'N/A'}</div></div>
                                <div className="info-item"><label>Department</label><div>{deptName}</div></div>
                                <div className="info-item"><label>Position</label><div>{posName}</div></div>

                                <div className="info-item"><label>Reporting to</label><div>{reportingName}</div></div>
                                <div className="info-item"><label>Reporting ID</label><div>{v.reportingToId || '-'}</div></div>
                                <div className="info-item"><label>Employee Type</label><div>{empTypeName}</div></div>
                                <div className="info-item"><label>Gender</label><div>{v.gender || '-'}</div></div>
                            </div>
                        </div>

                        <div className="form-card" style={{ marginTop: '1.5rem' }}>
                            <div className="form-card-title">Vacancy Requirements</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Number of Vacancy</label><div>{v.numberOfVacancy || 1}</div></div>
                                <div className="info-item"><label>Required Date</label><div>{v.requiredDate ? String(v.requiredDate).split('T')[0].substring(0, 10) : '-'}</div></div>
                                <div className="info-item"><label>Preferred Qualification</label><div>{v.qualification || '-'}</div></div>
                                <div className="info-item"><label>Reason for Req.</label><div>{reasonName}</div></div>

                                <div className="info-item"><label>Salary Range (From)</label><div>{v.salaryRangeFrom ? `₹${v.salaryRangeFrom}` : '-'}</div></div>
                                <div className="info-item"><label>Salary Range (To)</label><div>{v.salaryRangeTo ? `₹${v.salaryRangeTo}` : '-'}</div></div>
                                <div className="info-item"><label>Preferred Education</label><div>{v.preferredEducation || '-'}</div></div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Required Skills</label>
                                    <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{skillList}</div>
                                </div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Job Location</label>
                                    <div>{locName}</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-card" style={{ marginTop: '1.5rem' }}>
                            <div className="form-card-title">Project & Job Description</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Project Code</label><div>{v.projectCode || '-'}</div></div>
                                <div className="info-item"><label>Project Name</label><div>{v.project || '-'}</div></div>
                                <div className="info-item" style={{ gridColumn: 'span 4' }}>
                                    <label>Job Description</label>
                                    <div className="jd-content bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2" style={{ whiteSpace: 'pre-wrap', minHeight: '100px', fontSize: '0.9rem', color: '#334155' }}>
                                        {v.jobDescription || "No job description provided."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Close</button>
                        <button className="btn-primary" onClick={() => { setSelectedVacancy(v); setViewMode('edit'); }}>Edit Vacancy</button>
                    </div>
                </div>

                <style>{`
                    .modal-info-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.5rem;
                        padding: 0.5rem;
                    }
                    .info-item label {
                        display: block;
                        font-size: 0.75rem;
                        color: #64748b;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        margin-bottom: 0.25rem;
                        font-weight: 600;
                    }
                    .info-item div {
                        font-size: 0.95rem;
                        color: #1e293b;
                        font-weight: 500;
                    }
                `}</style>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="employees-page" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                background: 'transparent'
            }}>
                <style>
                    {`
                    .spinner-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 1.5rem;
                    }
                    .premium-spinner {
                        position: relative;
                        width: 64px;
                        height: 64px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .premium-spinner::before,
                    .premium-spinner::after {
                        content: '';
                        position: absolute;
                        border-radius: 50%;
                    }
                    .premium-spinner::before {
                        width: 100%;
                        height: 100%;
                        border: 3px solid transparent;
                        border-top-color: #2dd4bf;
                        border-bottom-color: #0d9488;
                        animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
                        box-shadow: 0 0 15px rgba(45, 212, 191, 0.2);
                    }
                    .premium-spinner::after {
                        width: 70%;
                        height: 70%;
                        border: 3px solid transparent;
                        border-left-color: #0d9488;
                        border-right-color: #2dd4bf;
                        animation: spin-reverse 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
                    }
                    .premium-core {
                        width: 30%;
                        height: 30%;
                        background: radial-gradient(circle, #2dd4bf 0%, #0d9488 100%);
                        border-radius: 50%;
                        box-shadow: 0 0 20px #2dd4bf;
                        animation: pulse-core 2s ease-in-out infinite;
                    }
                    .premium-text {
                        color: #f8fafc;
                        font-size: 1.05rem;
                        font-weight: 600;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        opacity: 0;
                        animation: fade-up 0.5s ease-out 0.2s forwards, soft-pulse 2s ease-in-out infinite alternate 0.7s;
                        text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes spin-reverse {
                        0% { transform: rotate(360deg); }
                        100% { transform: rotate(0deg); }
                    }
                    @keyframes pulse-core {
                        0%, 100% { transform: scale(0.8); opacity: 0.8; }
                        50% { transform: scale(1.2); opacity: 1; }
                    }
                    @keyframes fade-up {
                        from { transform: translateY(10px); opacity: 0; }
                        to { transform: translateY(0); opacity: 0.9; }
                    }
                    @keyframes soft-pulse {
                        from { opacity: 0.7; }
                        to { opacity: 1; }
                    }
                    `}
                </style>
                <div className="spinner-container">
                    <div className="premium-spinner">
                        <div className="premium-core"></div>
                    </div>
                    <p className="premium-text">Loading Vacancy Data</p>
                </div>
            </div>
        );
    }

    const handleResetFilters = () => {
        setFilterCode('');
        setFilterPosition('');
        setFilterDepartment('');
        setFilterProject('');
        setFilterVacancies('');
        setFilterFilled('');
        setFilterRemaining('');
        setFilterHiringType('');
        setFilterTargetDate('');
        setFilterStatus('');
        setFilterApproval('');
    };

    const filteredVacancies = (vacancies || []).filter(v => {
        const deptName = departments.find(d => d.id === v.departmentId || d.value === v.departmentId)?.label || v.departmentId || 'N/A';
        const posName = positions.find(p => p.id === v.positionId || p.value === v.positionId)?.label || v.positionId || 'N/A';
        const remaining = (v.numberOfVacancy || 0) - (v.filledPositions || 0);

        if (filterCode && !String(v.requestNumber || v.id || '').toLowerCase().includes(filterCode.toLowerCase())) return false;
        if (filterPosition && !posName.toLowerCase().includes(filterPosition.toLowerCase())) return false;
        if (filterDepartment && !deptName.toLowerCase().includes(filterDepartment.toLowerCase())) return false;
        if (filterProject && !String(v.project || '-').toLowerCase().includes(filterProject.toLowerCase())) return false;
        if (filterVacancies && !String(v.numberOfVacancy || 0).includes(filterVacancies)) return false;
        if (filterFilled && !String(v.filledPositions || 0).includes(filterFilled)) return false;
        if (filterRemaining && !String(remaining).includes(filterRemaining)) return false;
        if (filterHiringType && !String(v.employeeType?.name || 'N/A').toLowerCase().includes(filterHiringType.toLowerCase())) return false;

        const dateStr = (v.requiredDate || v.requisitionDate) ? new Date(v.requiredDate || v.requisitionDate).toISOString().split('T')[0] : '';
        if (filterTargetDate && !dateStr.startsWith(filterTargetDate)) return false;

        if (filterStatus && !String(v.status || 'Draft').toLowerCase().includes(filterStatus.toLowerCase())) return false;
        if (filterApproval && !String(v.approvalStatus || 'Pending').toLowerCase().includes(filterApproval.toLowerCase())) return false;

        return true;
    });

    return (
        <div className="employees-page">
            {showDeleteModal && renderDeleteModal()}
            {showApprovalModal && renderApprovalModal()}
            {showStatusModal && renderStatusModal()}
            {(viewMode === 'create' || viewMode === 'edit') && renderVacancyForm()}
            {viewMode === 'view' && renderVacancyDetail()}
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
                                <th><input type="text" className="inline-filter" placeholder="Code" value={filterCode} onChange={e => setFilterCode(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Position" value={filterPosition} onChange={e => setFilterPosition(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Department" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Project" value={filterProject} onChange={e => setFilterProject(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Vac" value={filterVacancies} onChange={e => setFilterVacancies(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Fill" value={filterFilled} onChange={e => setFilterFilled(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter text-center" placeholder="Rem" value={filterRemaining} onChange={e => setFilterRemaining(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Type" value={filterHiringType} onChange={e => setFilterHiringType(e.target.value)} /></th>
                                <th><input type="date" className="inline-filter" value={filterTargetDate} onChange={e => setFilterTargetDate(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Approval" value={filterApproval} onChange={e => setFilterApproval(e.target.value)} /></th>
                                <th className="text-center">
                                    <button className="btn-reset-filters-roles" title="Reset Filters" onClick={handleResetFilters}><RotateCcw size={16} /></button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVacancies.map((v) => {
                                const deptName = departments.find(d => d.id === v.departmentId || d.value === v.departmentId)?.label || v.departmentId || 'N/A';
                                const posName = positions.find(p => p.id === v.positionId || p.value === v.positionId)?.label || v.positionId || 'N/A';
                                return (
                                    <tr key={v._id || v.id}>
                                        <td className="font-mono text-blue-600 font-medium text-xs" title={v.requestNumber || v.id}>{v.requestNumber || v.id || 'N/A'}</td>
                                        <td className="font-semibold text-gray-800 text-sm overflow-hidden text-ellipsis">{posName}</td>
                                        <td className="text-sm overflow-hidden text-ellipsis">{deptName}</td>
                                        <td className="text-sm overflow-hidden text-ellipsis">{v.project || '-'}</td>
                                        <td className="text-center font-mono">{v.numberOfVacancy || 0}</td>
                                        <td className="text-center font-mono">{v.filledPositions || 0}</td>
                                        <td className="text-center font-mono">{(v.numberOfVacancy || 0) - (v.filledPositions || 0)}</td>
                                        <td className="text-sm">{v.employeeType?.name || 'N/A'}</td>
                                        <td className="font-mono text-xs">{(v.requiredDate || v.requisitionDate) ? new Date(v.requiredDate || v.requisitionDate).toISOString().split('T')[0] : 'N/A'}</td>
                                        <td className="text-center">
                                            <span 
                                                className={`status-badge ${v.status === 'Open' ? 'status-open' :
                                                    v.status === 'On Hold' ? 'status-on-hold' : 'status-closed'}`}
                                                onClick={() => handleStatusClick(v)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to update vacancy status"
                                            >
                                                {v.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span 
                                                className={`status-badge ${v.approvalStatus === 'Approved' ? 'status-approved' :
                                                    v.approvalStatus === 'Pending' ? 'status-pending' : 'status-rejected'}`}
                                                onClick={() => handleApprovalClick(v)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to update approval status"
                                            >
                                                {v.approvalStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-wrapper" style={{ justifyContent: 'center' }}>
                                                <button className="action-btn view" title="View" onClick={() => handleViewClick(v)}><Eye size={18} /></button>
                                                <button className="action-btn edit" title="Edit" onClick={() => handleEditClick(v)}><Edit size={18} /></button>
                                                <button
                                                    className="action-btn delete"
                                                    title="Delete"
                                                    onClick={() => handleDeleteClick(v)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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

                .error-text {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin-top: 0.25rem;
                    font-weight: 500;
                    display: block;
                }
                .input-error {
                    border-color: #ef4444 !important;
                }
                .input-error:focus {
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default Vacancy;
