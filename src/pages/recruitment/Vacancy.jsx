import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Search, Eye, Edit, Trash2, X, RotateCcw,
    Briefcase, Users, CheckCircle, AlertCircle,
    Calendar, MapPin, ChevronDown, MoreVertical,
    Filter, Download, Copy, Archive, Check,
    Info, ExternalLink, ArrowRight, TrendingUp, TrendingDown, ChevronRight, File, XCircle
} from 'lucide-react';
import './Recruitment.css';
import SearchableSelect from '../../components/common/SearchableSelect';
import { departmentService } from '../../services/departmentService';
import { positionService } from '../../services/positionService';
import { employeeService } from '../../services/employeeService';
import { projectService } from '../../services/projectService';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/api';
import toast from 'react-hot-toast';
import MultiSelect from '../../components/common/MultiSelect';

const StatCard = ({ label, count, icon, color, bg, trend, active, onClick }) => (
    <div
        className={`stat-card-premium ${active ? 'active' : ''}`}
        onClick={onClick}
        style={{ '--accent': color, '--accent-bg': bg }}
    >
        <div className="stat-top-v2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="stat-icon-v6">{icon}</div>
            <div className="stat-count-v6" style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>{count}</div>
        </div>
        <div className="stat-bottom-v2" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-label-v6" style={{ fontSize: '0.65rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>{label}</div>
            {trend && (
                <div className={`stat-trend ${trend > 0 ? 'up' : 'down'}`} style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.65rem', fontWeight: '800', padding: '2px 6px', borderRadius: '20px', backgroundColor: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: trend > 0 ? '#10b981' : '#ef4444' }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
            )}
        </div>
    </div>
);

const Badge = ({ variant, children, onUpdate }) => {
    const variants = {
        open: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Open' },
        draft: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', label: 'Draft' },
        closed: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Closed' },
        cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Cancelled' },
        filled: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Filled' },
        pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Pending' },
        approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Approved' },
        rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Rejected' },
        high: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'High' },
        medium: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Medium' },
        low: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Low' },
    };
    const style = variants[variant?.toLowerCase()] || variants.draft;

    return (
        <span
            className={`badge-pill ${onUpdate ? 'badge-clickable' : ''}`}
            style={{ backgroundColor: style.bg, color: style.color }}
            onClick={onUpdate}
        >
            <span className="badge-dot" style={{ backgroundColor: style.color }}></span>
            {style.label}
        </span>
    );
};



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
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [vacancies, setVacancies] = useState([]);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [totalVacancies, setTotalVacancies] = useState(0);
    const [dashboardStats, setDashboardStats] = useState({
        totalVacancies: { count: 0, trend: 0 },
        openPositions: { count: 0, trend: 0 },
        draftJobs: { count: 0, trend: 0 },
        pendingApproval: { count: 0, trend: 0 },
        filledJobs: { count: 0, trend: 0 },
        cancelled: { count: 0, trend: 0 }
    });
    const tableWrapperRef = useRef(null);
    const loadingRef = useRef(false);

    const [filterCode, setFilterCode] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
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
    const [selectedRows, setSelectedRows] = useState([]);

    // Integrated load function for master data
    const loadMasterData = useCallback(async (isInitial = true) => {
        if (isInitial) setLoading(true);
        try {
            console.log("Vacancy.jsx: Initializing master data fetch...");
            const [depsRes, posRes, empsRes, reasRes, projsRes, etypesRes, skillRes, locRes] = await Promise.all([
                departmentService.getAllDepartments().catch(e => { console.error("Dept error:", e); return []; }),
                positionService.getAllPositions().catch(e => { console.error("Pos error:", e); return []; }),
                employeeService.getAllEmployees().catch(e => { console.error("Emp error:", e); return []; }),
                api.get('/reason-requisition').catch(e => ({ data: [] })),
                projectService.getAllProjects(0, 100).catch(e => ({ data: [] })),
                api.get('/employment-types/').catch(e => ({ data: [] })),
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

            console.log("Vacancy.jsx: Master data fully loaded and mapped.");
        } catch (error) {
            console.error("Vacancy.jsx: Critical fetch failure:", error);
        } finally {
            setLoading(false);
        }
    }, [departments.length, positions.length]); // Added dependency to check for empty data

    // Bulk Handlers
    const toggleRowSelection = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const selectAllRows = (e) => {
        if (e.target.checked) {
            setSelectedRows(vacancies.map(v => v._id || v.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedRows.length === 0) return;
        setSubmitting(true);
        try {
            await Promise.all(selectedRows.map(id => api.patch(`/vacancies/${id}/approval`, { approvalStatus: 'approved' })));
            toast.success(`Approved ${selectedRows.length} vacancies!`);
            fetchVacancies();
            fetchDashboardStats();
            setSelectedRows([]);
        } catch (error) {
            toast.error("Failed to approve some vacancies");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} vacancies?`)) return;
        setSubmitting(true);
        try {
            await Promise.all(selectedRows.map(id => api.delete(`/vacancies/${id}`)));
            toast.success(`Deleted ${selectedRows.length} vacancies!`);
            fetchVacancies();
            fetchDashboardStats();
            setSelectedRows([]);
        } catch (error) {
            toast.error("Failed to delete some vacancies");
        } finally {
            setSubmitting(false);
        }
    };

    const handleExport = () => {
        const dataToExport = vacancies.length > 0 ? vacancies : [];
        if (dataToExport.length === 0) return toast.error("No data to export");

        const headers = ["Code", "Position", "Department", "Openings", "Hiring Type", "Target Date", "Status"];
        const rows = dataToExport.map(v => [
            v.requestNumber || v.id,
            v.position?.name || v.positionId,
            v.department?.name || v.departmentId,
            v.numberOfVacancy,
            v.employeeType?.name || 'N/A',
            v.requiredDate?.split('T')[0],
            v.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `vacancies_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchDashboardStats = useCallback(async () => {
        try {
            const res = await api.get('/vacancies/dashboard/stats');
            if (res.data?.data) {
                setDashboardStats(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    }, []);

    // Function to fetch initial vacancies or with filters
    const fetchVacancies = useCallback(async (isInitial = false, pageNum = 0) => {
        if (isInitial) setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNum,
                limit: limit,
                vacancyCode: filterCode,
                search: filterSearch,
                department: filterDepartment,
                project: filterProject,
                vacancies: filterVacancies,
                filled: filterFilled,
                remaining: filterRemaining,
                hiringType: filterHiringType,
                targetDate: filterTargetDate,
                status: filterStatus,
                approval: filterApproval
            });

            const res = await api.get(`/vacancies?${params.toString()}`);
            const resData = res.data || { data: [], total: 0 };

            setVacancies(resData.data || []);
            setTotalVacancies(resData.total || 0);
            setHasMore((resData.data || []).length === limit && (pageNum + 1) * limit < (resData.total || 0));
            setPage(pageNum);
        } catch (error) {
            console.error("Error fetching vacancies:", error);
            toast.error("Failed to fetch vacancies");
        } finally {
            setLoading(false);
            setHasLoaded(true);
            setIsInitialLoading(false);
            loadingRef.current = false;
        }
    }, [page, filterCode, filterSearch, filterDepartment, filterProject, filterVacancies, filterFilled, filterRemaining, filterHiringType, filterTargetDate, filterStatus, filterApproval]);

    // Removed infinite scroll listener in favor of traditional pagination
    useEffect(() => {
        // Master Data & Initial Load
        loadMasterData();
        fetchVacancies(true, 0);
        fetchDashboardStats();
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (!loading && viewMode === 'list') {
                fetchVacancies(false, 0);
            }
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [
        filterCode, filterSearch, filterDepartment, filterProject,
        filterVacancies, filterFilled, filterRemaining, filterHiringType,
        filterTargetDate, filterStatus, filterApproval
    ]);

    // Keep client-side sorting/filtering for immediate UI response if needed, 
    // but the main data is now server-controlled
    const filteredVacancies = vacancies;

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
                        status: 'draft',
                        approvalStatus: 'pending',
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
                    status: (formData.status || 'draft').toLowerCase(),
                    approvalStatus: (formData.approvalStatus || 'pending').toLowerCase(),
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

                    // Refresh vacancies list
                    fetchVacancies();
                    fetchDashboardStats();

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

            // Refresh vacancies list
            fetchVacancies();
            fetchDashboardStats();

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
        setNewApprovalStatus((v.approvalStatus || 'pending').toLowerCase());
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

            // Refresh vacancies list
            fetchVacancies();
            fetchDashboardStats();

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
        setNewStatus((v.status || 'draft').toLowerCase());
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

            // Refresh vacancies list
            fetchVacancies();
            fetchDashboardStats();

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
                        Updating status for: <br />
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
                            <option value="draft">Draft</option>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="filled">Filled</option>
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
                        Updating approval for: <br />
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
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
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
                                        value={formData.status || 'draft'}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                        <option value="filled">Filled</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Approval Status</label>
                                    <select
                                        value={formData.approvalStatus || 'pending'}
                                        onChange={(e) => handleInputChange('approvalStatus', e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="cancelled">Cancelled</option>
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
        setFilterSearch('');
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

    // Legacy client-side filtering is now handled by the server-side query.

    const statsConfig = [
        { label: 'Total Vacancies', key: 'totalVacancies', status: '', icon: <Briefcase size={20} />, color: '#0d5f68', bg: 'rgba(13, 95, 104, 0.1)' },
        { label: 'Open Positions', key: 'openPositions', status: 'open', icon: <Users size={20} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Draft Jobs', key: 'draftJobs', status: 'draft', icon: <File size={20} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
        { label: 'Pending Approval', key: 'pendingApproval', status: 'pending', filterType: 'approval', icon: <RotateCcw size={20} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        { label: 'Filled Jobs', key: 'filledJobs', status: 'filled', icon: <CheckCircle size={20} />, color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.1)' },
        { label: 'Cancelled', key: 'cancelled', status: 'cancelled', icon: <XCircle size={20} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
    ];

    return (
        <div className="vacancy-dashboard">
            {showDeleteModal && renderDeleteModal()}
            {showApprovalModal && renderApprovalModal()}
            {showStatusModal && renderStatusModal()}
            {(viewMode === 'create' || viewMode === 'edit') && renderVacancyForm()}
            {viewMode === 'view' && renderVacancyDetail()}

            {/* Header Section */}
            <div className="dashboard-header animate-entry">
                <div className="header-left">
                    <h1>
                        <Briefcase size={24} className="text-[#0d5f68]" />
                        Vacancy Management
                    </h1>
                </div>
                <div className="header-actions">
                    <button type="button" className="btn-secondary-outline" onClick={handleExport}>
                        <Download size={18} />
                        Export
                    </button>
                    <button type="button" className="btn-primary" onClick={() => { setSelectedVacancy(null); setViewMode('create'); }}>
                        <Plus size={20} />
                        Add Vacancy
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-scroller-v6" style={{ marginBottom: '1.25rem' }}>
                <div className="stats-container-v6">
                    {statsConfig.map((s, i) => {
                        const statData = dashboardStats[s.key] || { count: 0, trend: 0 };
                        return (
                            <StatCard
                                key={i}
                                {...s}
                                count={statData.count}
                                trend={statData.trend}
                                active={s.filterType === 'approval' ? filterApproval === s.status : filterStatus === s.status}
                                onClick={() => {
                                    if (s.filterType === 'approval') {
                                        setFilterApproval(s.status);
                                        setFilterStatus('');
                                    } else {
                                        setFilterStatus(s.status);
                                        setFilterApproval('');
                                    }
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="filter-search-container" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="search-wrapper" style={{ flex: 1 }}>
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search by code, position, department..."
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                    />
                </div>
                <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} style={{ height: '40px', padding: '0 2.5rem 0 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.825rem', fontWeight: '600', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}>
                    <option value="">Department</option>
                    {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ height: '40px', padding: '0 2.5rem 0 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.825rem', fontWeight: '600', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}>
                    <option value="">Status</option>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                </select>
                <input
                    type="date"
                    className="date-picker-input"
                    value={filterTargetDate}
                    onChange={e => setFilterTargetDate(e.target.value)}
                />
                <button type="button" className="btn-icon-alt" onClick={handleResetFilters} title="Clear Filters">
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Bulk Toolbar */}
            {selectedRows.length > 0 && (
                <div className="bulk-toolbar animate-toolbar-in">
                    <div className="selection-count">
                        <Check size={16} className="text-white" />
                        <span>{selectedRows.length} items selected</span>
                    </div>
                    <div className="bulk-actions">
                        <button onClick={handleBulkApprove} className="bulk-btn approve">Approve Selected</button>
                        <button onClick={handleBulkDelete} className="bulk-btn delete">Delete Selected</button>
                        <button onClick={() => setSelectedRows([])} className="bulk-btn cancel">Cancel</button>
                    </div>
                </div>
            )}

            {/* Table Section */}
            {isInitialLoading ? (
                <div className="table-container-premium shadow-premium" style={{ height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '16px' }}>
                    <div className="flex flex-col items-center gap-4">
                        <div className="premium-spinner" style={{ width: '48px', height: '48px' }}>
                            <div className="premium-core"></div>
                        </div>
                        <p style={{ color: '#0d5f68', fontWeight: '600', fontSize: '0.9rem' }}>Fetching vacancies list...</p>
                    </div>
                </div>
            ) : vacancies.length === 0 && hasLoaded && !loading ? (
                <EmptyState
                    cardTitle="Vacancies List"
                    totalCount={0}
                    icon={Briefcase}
                    title="No vacancies found"
                    buttonLabel="Post Vacancy"
                    onCreate={() => { setViewMode('create'); setSelectedVacancy(null); }}
                />
            ) : (
                <div className="table-container-premium shadow-premium">
                    <div className="table-header-info">
                        <div className="header-info-left">
                            <h3>Vacancies List</h3>
                            <span className="count-chip">{totalVacancies} Total</span>
                        </div>
                        <div className="header-info-right text-xs text-slate-500 font-medium">
                            Showing {vacancies.length} entries
                        </div>
                    </div>

                    <div className="table-responsive" ref={tableWrapperRef}>
                        <table className="ats-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            onChange={selectAllRows}
                                            checked={vacancies.length > 0 && selectedRows.length === vacancies.length}
                                        />
                                    </th>
                                    <th style={{ width: '120px' }}>CODE</th>
                                    <th style={{ width: '250px' }}>JOB TITLE & DEPT</th>
                                    <th style={{ width: '100px' }}>OPENINGS</th>
                                    <th style={{ width: '150px' }}>APPLICANTS</th>
                                    <th style={{ width: '140px' }}>TARGET DATE</th>
                                    <th style={{ width: '120px' }}>APPROVAL</th>
                                    <th style={{ width: '120px' }}>STATUS</th>
                                    <th style={{ width: '120px' }} className="text-right pr-6">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9">
                                            <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#64748b' }}>
                                                <div className="premium-loader-inline"></div>
                                                <span className="text-sm font-semibold">Loading vacancies...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    vacancies.map((v) => {
                                        const isSelected = selectedRows.includes(v._id || v.id);
                                        const deptName = departments.find(d => d.value === v.departmentId)?.label || v.departmentId || 'N/A';
                                        const posName = positions.find(p => p.value === v.positionId)?.label || v.positionId || 'N/A';

                                        // Internal Mock Data for Applicants (Redesign requirement)
                                        const applicants = v.appliedApplicants || 0;
                                        const shortlisted = Math.floor(applicants * 0.4);

                                        return (
                                            <tr key={v._id || v.id} className={isSelected ? 'selected' : ''}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleRowSelection(v._id || v.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="vacancy-code-v6" onClick={() => handleViewClick(v)}>
                                                        {v.requestNumber || 'VAC-000'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="vacancy-main-v6">
                                                        <span className="v-title" onClick={() => handleViewClick(v)}>{v.positionName}</span>
                                                        <span className="v-dept">{deptName} • {posName}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="opening-chip" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span className="num" style={{ fontWeight: '700', color: '#0d5f68' }}>{v.openings || '0 / 1'}</span>
                                                        <span className="lab" style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Available</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="applicant-stats">
                                                        <span className="total-app">{applicants} Applied</span>
                                                        <div className="pipeline-mini">
                                                            <div className="pipe-seg shortlisted" style={{ width: applicants > 0 ? `${(shortlisted / applicants) * 100}%` : '0%' }} title={`Shortlisted: ${shortlisted}`}></div>
                                                            <div className="pipe-seg interviewed" style={{ width: applicants > 0 ? '15%' : '0%' }} title="Interviewing"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="date-info">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <span>{(v.requiredDate || v.requisitionDate) ? new Date(v.requiredDate || v.requisitionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge variant={v.approvalStatus} onUpdate={() => handleApprovalClick(v)} />
                                                </td>
                                                <td>
                                                    <Badge variant={v.status} onUpdate={() => handleStatusClick(v)} />
                                                </td>
                                                <td className="text-right">
                                                    <div className="action-button-group">
                                                        <button type="button" className="row-action view" onClick={() => handleViewClick(v)} title="View Details">
                                                            <Eye size={18} />
                                                        </button>
                                                        <button type="button" className="row-action edit" onClick={() => handleEditClick(v)} title="Edit Vacancy">
                                                            <Edit size={18} />
                                                        </button>
                                                        <button type="button" className="row-action delete" onClick={() => handleDeleteClick(v)} title="Delete Vacancy">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                {fetchingMore && (
                                    <tr className="no-hover">
                                        <td colSpan="9" className="py-6 text-center">
                                            <div className="premium-loader-inline"></div>
                                            <span className="text-sm font-medium text-slate-500 ml-3">Fetching more postings...</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-footer-ats">
                        <div className="footer-left">
                            Showing <b>{totalVacancies > 0 ? page * limit + 1 : 0}</b> to <b>{Math.min((page + 1) * limit, totalVacancies)}</b> of <b>{totalVacancies}</b> entries
                        </div>
                        <div className="footer-right">
                            <button
                                className={`page-btn ${page === 0 ? 'disabled' : ''}`}
                                onClick={() => page > 0 && fetchVacancies(false, page - 1)}
                                disabled={page === 0}
                            >
                                Previous
                            </button>
                            <div className="page-numbers">
                                {[...Array(Math.min(5, Math.ceil(totalVacancies / limit)))].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`page-num ${page === i ? 'active' : ''}`}
                                        onClick={() => fetchVacancies(false, i)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                {Math.ceil(totalVacancies / limit) > 5 && <span className="px-2">...</span>}
                            </div>
                            <button
                                className={`page-btn ${(page + 1) * limit >= totalVacancies ? 'disabled' : ''}`}
                                onClick={() => (page + 1) * limit < totalVacancies && fetchVacancies(false, page + 1)}
                                disabled={(page + 1) * limit >= totalVacancies}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .vacancy-dashboard {
                    padding: 1.25rem 1.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    background: #f8fafc;
                    height: calc(100vh - 64px);
                    overflow: hidden;
                    /* Removed contain: content to allow fixed modals to reference viewport */
                }
                .animate-entry {
                    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Header */
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    flex-shrink: 0;
                }
                .header-left h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.01em;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .header-left p {
                    color: #64748b;
                    margin: 0.1rem 0 0;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .header-actions {
                    display: flex;
                    gap: 0.6rem;
                }

                /* Buttons */
                .btn-primary {
                    background: #0d5f68;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 4px rgba(13, 95, 104, 0.15);
                    cursor: pointer;
                }
                .btn-primary:hover {
                    background: #0b4e56;
                    transform: translateY(-1.5px);
                    box-shadow: 0 4px 12px rgba(13, 95, 104, 0.2);
                }
                .btn-secondary-outline {
                    background: white;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                    padding: 0.6rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .btn-secondary-outline:hover {
                    border-color: #0d5f68;
                    color: #0d5f68;
                    background: rgba(13, 95, 104, 0.02);
                }

                /* Stats Cards */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                }
                .stat-card {
                    background: white;
                    padding: 1rem 1.15rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                    transition: all 0.25s ease;
                }
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 15px -3px rgba(0,0,0,0.08);
                    border-color: var(--accent-color);
                }
                .stat-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: var(--accent-bg);
                    color: var(--accent-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-icon-wrapper svg {
                    width: 18px;
                    height: 18px;
                }
                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }
                .stat-count {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #1e293b;
                    line-height: 1;
                    letter-spacing: -0.01em;
                }
                .stat-label {
                    font-size: 0.725rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                /* New Premium Stats */
                .stats-scroller-v6 { overflow-x: auto; padding: 0.5rem 0.5rem 1.25rem 0.5rem; margin: 0 -0.5rem; flex-shrink: 0; }
                .stats-scroller-v6::-webkit-scrollbar { height: 4px; }
                .stats-scroller-v6::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                
                .stats-container-v6 { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.75rem; width: 100%; }
                
                .stat-card-premium { background: white; padding: 0.85rem 1rem; border-radius: 14px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-width: 0; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
                .stat-card-premium:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .stat-card-premium.active { border-color: var(--accent); background: linear-gradient(to bottom right, white, var(--accent-bg)); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform: translateY(-1px); }
                .stat-card-premium.active::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); }
                
                .stat-main { display: flex; align-items: center; gap: 0.75rem; }
                .stat-icon-v6 { width: 38px; height: 38px; border-radius: 10px; background: var(--accent-bg); color: var(--accent); display: flex; align-items: center; justify-content: center; }
                .stat-icon-v6 svg { width: 18px; height: 18px; }
                .stat-content-v6 { display: flex; flex-direction: column; gap: 1px; }
                .stat-label-v6 { font-size: 0.625rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-value-group { display: flex; align-items: baseline; gap: 0.5rem; }
                .stat-count-v6 { font-size: 1.5rem; font-weight: 900; color: #0f172a; line-height: 1; }
                
                .stat-trend { display: flex; align-items: center; gap: 2px; font-size: 0.6rem; font-weight: 700; padding: 1px 5px; border-radius: 20px; }
                .stat-trend.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                .stat-trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                
                .stat-indicator { color: #cbd5e1; transition: transform 0.2s; }
                .stat-card-premium:hover .stat-indicator { transform: translateX(3px); color: var(--accent); }

                /* Filter Bar */
                .filter-search-container { background: white; padding: 0.65rem 1rem; border-radius: 12px; display: flex; gap: 0.75rem; align-items: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.03); flex-shrink: 0; }
                .btn-icon-alt { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; border-radius: 8px; color: #94a3b8; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
                .btn-icon-alt:hover { color: #0d5f68; border-color: #0d5f68; background: #f8fafc; }

                .stat-count-v6 { font-size: 1.5rem; font-weight: 900; color: #0f172a; line-height: 1; }
                .stat-label-v6 { font-size: 0.65rem; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }

                .search-wrapper {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-icon {
                    position: absolute;
                    left: 0.85rem;
                    color: #94a3b8;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                }
                .search-wrapper input {
                    width: 100%;
                    height: 40px;
                    padding: 0 1rem 0 2.5rem;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    color: #1e293b;
                    outline: none;
                    transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
                }
                .search-wrapper input:focus {
                    border-color: #0d5f68;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(13, 95, 104, 0.08);
                }
                .filter-actions {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }
                .filter-dropdown-group {
                    display: flex;
                    gap: 0.5rem;
                }
                .filter-dropdown-group select, .date-picker-input {
                    height: 40px;
                    padding: 0 1rem;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    font-size: 0.825rem;
                    color: #475569;
                    font-weight: 600;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.2s, background-color 0.2s;
                    appearance: none;
                }
                .filter-dropdown-group select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    background-size: 1rem;
                    padding-right: 2.5rem;
                }
                .filter-dropdown-group select:hover, .date-picker-input:hover {
                    border-color: #cbd5e1;
                    background: #f1f5f9;
                }
                .filter-dropdown-group select:focus, .date-picker-input:focus {
                    border-color: #0d5f68;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(13, 95, 104, 0.08);
                }
                .btn-icon-alt {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-alt:hover {
                    background: #fee2e2;
                    color: #ef4444;
                    border-color: #fca5a5;
                }

                .table-container-premium {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    flex: 1;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                    width: 100%;
                }
                .table-responsive {
                    overflow-x: auto;
                    overflow-y: auto;
                    flex: 1;
                    position: relative;
                }
                /* Custom Scrollbar */
                .table-responsive::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .table-responsive::-webkit-scrollbar-track {
                    background: transparent;
                }
                .table-responsive::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .table-responsive::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .shadow-premium {
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
                }
                .table-header-info {
                    padding: 0.75rem 1.25rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                }
                .header-info-left {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .header-info-left h3 {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .count-chip {
                    background: #f1f5f9;
                    color: #64748b;
                    padding: 0.1rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    border: 1px solid #e2e8f0;
                    text-transform: uppercase;
                }

                /* Table Styling */
                .ats-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    table-layout: auto;
                }
                .ats-table th {
                    background: #f8fafc;
                    padding: 0.65rem 1.25rem;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #475569;
                    letter-spacing: 0.05em;
                    text-align: left;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    white-space: nowrap;
                }
                .ats-table td {
                    padding: 0.75rem 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                    transition: background-color 0.15s ease;
                    white-space: nowrap;
                }
                .ats-table tr:last-child td { border-bottom: none; }
                .ats-table tr:hover td {
                    background: #f8fafc;
                }
                .ats-table tr:hover {
                    background: #f8fafc;
                }
                .row-selected td {
                    background: rgba(13, 95, 104, 0.02) !important;
                }

                /* Row Elements */
                .code-badge {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #0d5f68;
                }
                .job-info {
                    display: flex;
                    flex-direction: column;
                }
                .job-title {
                    font-size: 0.925rem;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1.2;
                }
                .job-sub-info {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    margin-top: 0.25rem;
                }
                .dept-name {
                    font-size: 0.775rem;
                    color: #64748b;
                    font-weight: 600;
                }
                .dot-sep {
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    background: #cbd5e1;
                }
                .manager-name {
                    font-size: 0.775rem;
                    color: #94a3b8;
                    font-weight: 500;
                }

                .opening-counter {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    padding: 0.25rem 0.65rem;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    font-weight: 700;
                    font-size: 0.75rem;
                    min-width: 52px;
                }
                .filled { color: #0d5f68; }
                .sep { color: #94a3b8; margin: 0 0.2rem; font-weight: 400; opacity: 0.6; }
                .total { color: #64748b; }

                .applicant-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    width: 130px;
                }
                .total-app {
                    font-size: 0.775rem;
                    font-weight: 700;
                    color: #334155;
                    margin-bottom: 0.1rem;
                }
                .pipeline-mini {
                    height: 4px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    display: flex;
                    overflow: hidden;
                    width: 100%;
                }
                .pipe-seg { transition: width 0.3s; }
                .shortlisted { background: #10b981; }
                .interviewed { background: #6366f1; }

                .date-info {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.8rem;
                    color: #475569;
                    font-weight: 650;
                }

                /* Badges */
                .badge-pill {
                    padding: 0.3rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }
                .badge-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                }
                .badge-clickable {
                    cursor: pointer;
                    transition: transform 0.2s, filter 0.2s;
                }
                .badge-clickable:hover {
                    filter: contrast(1.1) brightness(0.98);
                    transform: translateY(-1px);
                }

                /* Actions */
                .action-button-group {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.25rem;
                    padding-right: 0.5rem;
                }
                .row-action {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    transition: color 0.2s, background-color 0.2s;
                    cursor: pointer;
                    background: transparent;
                    border: none;
                }
                .row-action:hover {
                    background: #f1f5f9;
                    color: #0d5f68;
                }
                .row-action svg {
                    width: 17px;
                    height: 17px;
                }
                .row-action.view:hover { color: #3b82f6; background: rgba(59, 130, 246, 0.08); }
                .row-action.edit:hover { color: #10b981; background: rgba(16, 185, 129, 0.08); }
                .row-action.delete:hover { color: #ef4444; background: rgba(239, 68, 68, 0.08); }
                .row-action.more:hover { color: #64748b; background: #f1f5f9; }

                /* Premium Hover Effect */
                .ats-table tr {
                    transition: background-color 0.1s ease;
                }
                .ats-table tr:hover {
                    background-color: #f8fafc !important;
                }
                .ats-table tr:hover td {
                    background-color: transparent !important;
                }

                /* Bulk Toolbar */
                .bulk-toolbar {
                    position: fixed;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1e293b;
                    padding: 1rem 1.5rem;
                    border-radius: 16px;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    z-index: 100;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .selection-count {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: white;
                    font-weight: 600;
                }
                .bulk-actions {
                    display: flex;
                    gap: 0.75rem;
                }
                .bulk-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .bulk-btn.approve { background: #10b981; color: white; }
                .bulk-btn.delete { background: #ef4444; color: white; }
                .bulk-btn.cancel { background: rgba(255,255,255,0.1); color: white; }
                              /* Footer */
                .table-footer-ats {
                    padding: 0.75rem 1.25rem;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                }
                .footer-left {
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .footer-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .page-numbers {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .page-btn {
                    padding: 0.4rem 0.75rem;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 80px;
                }
                .page-btn:hover:not(.disabled) {
                    border-color: #0d5f68;
                    color: #0d5f68;
                    background: #f0fdfa;
                }
                .page-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f8fafc;
                }
                .page-num {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .page-num:hover:not(.active) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
                .page-num.active {
                    background: #0d5f68;
                    color: white;
                    border-color: #0d5f68;
                    box-shadow: 0 1px 2px rgba(13, 95, 104, 0.2);
                }


                .animate-toolbar-in {
                    animation: toolbarIn 0.3s ease-out forwards;
                }
                @keyframes toolbarIn {
                    from { opacity: 0; transform: translate(-50%, 15px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }

                /* Ensure Modal Centering */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: rgba(0,0,0,0.65);
                    backdrop-filter: blur(4px);
                    z-index: 5000;
                }
                .modal-content {
                    margin: auto; /* Fallback centering */
                    position: relative;
                }

                /* Mobile View */
                @media (max-width: 768px) {
                    .ats-table thead { display: none; }
                    .ats-table, .ats-table tbody, .ats-table tr, .ats-table td { display: block; width: 100%; }
                    .ats-table tr { border-bottom: 1.5px solid #f1f5f9; padding: 1.25rem; }
                    .ats-table td { border-bottom: none; padding: 0.5rem 0; }
                    .stats-grid { grid-template-columns: 1fr 1fr; }
                    .filter-search-container { flex-direction: column; height: auto; }
                    .filter-dropdown-group { overflow-x: auto; width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Vacancy;
