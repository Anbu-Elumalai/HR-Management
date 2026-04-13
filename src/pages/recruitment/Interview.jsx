import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    Plus, Search, Eye, Edit, Trash2, X, RotateCcw,
    Briefcase, Users, CheckCircle, AlertCircle,
    Calendar, MapPin, ChevronDown, MoreVertical,
    Filter, Download, Clock, Monitor, XCircle, 
    CheckCircle2, AlertTriangle, PlayCircle, BarChart2,
    TrendingUp, TrendingDown, ChevronLeft, ChevronRight, User
} from 'lucide-react';
import './Recruitment.css';
import api from '../../api/api';

const StatCard = ({ label, count, icon, color, bg, trend, active, onClick }) => (
    <div 
        className={`stat-card-premium ${active ? 'active' : ''}`} 
        onClick={onClick}
        style={{ '--accent': color, '--accent-bg': bg }}
    >
        <div className="stat-main">
            <div className="stat-icon-v6">{icon}</div>
            <div className="stat-content-v6">
                <span className="stat-label-v6">{label}</span>
                <div className="stat-value-group">
                    <span className="stat-count-v6">{count}</span>
                    {trend && (
                        <div className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>
                            {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            <span>{Math.abs(trend)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="stat-indicator"><ChevronRight size={14} /></div>
    </div>
);

const Badge = ({ variant, children, onUpdate }) => {
    const variants = {
        scheduled: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Scheduled' },
        completed: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Completed' },
        cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Cancelled' },
        rescheduled: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Rescheduled' },
        pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Pending' },
        passed: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Passed' },
        failed: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Failed' },
        'on hold': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'On Hold' },
        'move to offer': { bg: 'rgba(13, 95, 104, 0.1)', color: '#0d5f68', label: 'Move to Offer' },
    };
    const style = variants[variant?.toLowerCase()] || variants.pending;

    return (
        <span
            className={`badge-pill ${onUpdate ? 'badge-clickable' : ''}`}
            style={{ backgroundColor: style.bg, color: style.color }}
            onClick={onUpdate}
        >
            <span className="badge-dot" style={{ backgroundColor: style.color }}></span>
            {style.label || children}
        </span>
    );
};

const EmptyState = ({ onCreate }) => (
    <div className="empty-state-card">
        <div className="empty-icon-container">
            <Calendar size={48} />
        </div>
        <h3>No interviews scheduled</h3>
        <p>Try adjusting your search or schedule a new interview to get started.</p>
        <button className="btn-primary" onClick={onCreate}>
            <Plus size={18} />
            Schedule New Interview
        </button>
    </div>
);

const getAvatarColor = (name) => {
    const colors = [
        { bg: '#eff6ff', text: '#2563eb' },
        { bg: '#f0fdf4', text: '#16a34a' },
        { bg: '#fff7ed', text: '#ea580c' },
        { bg: '#fdf4ff', text: '#a21caf' },
        { bg: '#fff1f2', text: '#e11d48' },
        { bg: '#f1f5f9', text: '#475569' },
    ];
    const charCode = (String(name) || 'A').charCodeAt(0);
    return colors[charCode % colors.length];
};

const getInitials = (name) => {
    if (!name) return '??';
    return String(name).split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};
import { candidateService } from '../../services/candidateService';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';
import { useActionLoader } from '../../hooks';

// ─────────────────────────────────────────────────────────────────────────────
// PanelMemberCard — self-contained card for a single panel member
// ─────────────────────────────────────────────────────────────────────────────
const INTERVIEWER_TYPES = ["Employee", "Admins Users"];

const PanelMemberCard = ({ index, member, employees, roles, departments, onChange, onRemove, showRemove, errors }) => {
    const [positions, setPositions] = useState([]);
    const [loadingPositions, setLoadingPositions] = useState(false);

    // Fetch positions when interviewer is selected and role is Employee
    const fetchInterviewerPositions = async (interviewerId) => {
        if (!interviewerId) return;
        setLoadingPositions(true);
        try {
            // Fetch positions based on selected interviewer (User)
            const response = await api.get(`/positions/?interviewerId=${interviewerId}`);
            setPositions(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching interviewer positions:", error);
            setPositions([]);
        } finally {
            setLoadingPositions(false);
        }
    };

    const handleField = (field, value) => {
        let updated = { ...member, [field]: value };

        // Reset fields when interviewer type changes
        if (field === 'interviewerType') {
            updated = {
                ...updated,
                employeeId: '',
                interviewerName: '',
                interviewerEmail: '',
                panelRole: '',
                positionId: '',
                interviewerDesignation: ''
            };
        }

        // Auto-fill logic when an employee is selected
        if (field === 'employeeId') {
            const emp = employees.find(e => String(e._id || e.id) === String(value));
            if (emp) {
                updated.interviewerName = emp.name || '';
                updated.interviewerEmail = emp.email || '';

                // Resolve designation
                let desig = '';
                if (updated.interviewerType === "Employee") {
                    desig = emp.position?.name || emp.positionName || emp.designation || emp.role?.name || '';
                } else if (updated.interviewerType === "Admins Users") {
                    desig = emp.role?.name || emp.roleName || emp.role || emp.position?.name || '';
                }
                updated.interviewerDesignation = desig;

                // 1. Auto-fetch and pre-fill the Panel Role based on that interviewer's roleId
                const empRoleId = emp.roleId || (emp.role && typeof emp.role === 'object' ? emp.role._id : emp.role);
                const foundRole = roles.find(r => String(r._id) === String(empRoleId));

                if (foundRole) {
                    updated.panelRole = foundRole.name;

                    // 2. Conditional logic: If role is "Employee", fetch and set position
                    if (foundRole.name === "Employee") {
                        fetchInterviewerPositions(value);
                        // Auto-populate based on emp's positionId
                        if (emp.positionId) {
                            updated.positionId = emp.positionId;
                        }
                    } else {
                        updated.positionId = '';
                    }
                }
            }
        }

        // Handle manual manual selection of the role
        if (field === 'panelRole') {
            if (value === 'Employee' && updated.employeeId) {
                fetchInterviewerPositions(updated.employeeId);
            } else {
                updated.positionId = '';
            }
        }

        onChange(index, updated);
    };

    // Keep positions synced in EDIT mode
    React.useEffect(() => {
        if (member.employeeId && member.panelRole === 'Employee') {
            fetchInterviewerPositions(member.employeeId);
        }
    }, [member.employeeId, member.panelRole]);

    // Auto-populate human-readable data if only IDs are present (critical for EDIT mode)
    React.useEffect(() => {
        if (member.employeeId && !member.interviewerEmail && employees.length > 0) {
            const emp = employees.find(e => String(e._id || e.id) === String(member.employeeId));
            if (emp) {
                const updated = { ...member };
                updated.interviewerName = emp.name || '';
                updated.interviewerEmail = emp.email || '';

                let desig = '';
                if (member.interviewerType === "Employee") {
                    desig = emp.position?.name || emp.positionName || emp.designation || emp.role?.name || '';
                } else if (member.interviewerType === "Admins Users") {
                    desig = emp.role?.name || emp.roleName || emp.role || emp.position?.name || '';
                }
                updated.interviewerDesignation = desig;

                // Auto-sync panelRole on load if not set
                if (!updated.panelRole && roles.length > 0) {
                    const empRoleId = emp.roleId || (emp.role && typeof emp.role === 'object' ? emp.role._id : emp.role);
                    const foundRole = roles.find(r => String(r._id) === String(empRoleId));
                    if (foundRole) updated.panelRole = foundRole.name;
                }

                onChange(index, updated);
            }
        }
    }, [member.employeeId, employees, roles]);

    // Filter employees based on interviewerType
    const filteredEmployees = employees.filter(emp => {
        if (!member.interviewerType) return true;
        const sysRole = (emp.systemRole || emp.role?.name || '').toLowerCase();
        if (member.interviewerType === "Employee") {
            return sysRole.includes('employee') || (!sysRole.includes('admin') && !sysRole.includes('hr'));
        }
        if (member.interviewerType === "Admins Users") {
            return sysRole.includes('admin') || sysRole.includes('hr') || sysRole.includes('manager');
        }
        return true;
    });

    return (
        <div style={{
            border: errors ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb', borderRadius: '12px',
            padding: '20px', marginBottom: '16px', backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s'
        }}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: errors ? '#ef4444' : '#2563eb' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: errors ? '#ef4444' : '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Panel Member {index + 1}
                    </span>
                </div>
                {showRemove && (
                    <button
                        onClick={() => onRemove(index)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px' }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Trash2 size={14} /> Remove
                    </button>
                )}
            </div>

            {/* Row 1: Interviewer Type | Interviewer | Panel Role */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                    <label>Interviewer Type <span className="text-red-500">*</span></label>
                    <select
                        style={errors?.interviewerType ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                        value={member.interviewerType || ''} onChange={e => handleField('interviewerType', e.target.value)}>
                        <option value="" disabled>Select Type</option>
                        {INTERVIEWER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors?.interviewerType && <span className="error-text">{errors.interviewerType}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                    <label>Interviewer <span className="text-red-500">*</span></label>
                    <select
                        value={member.employeeId || ''}
                        onChange={e => handleField('employeeId', e.target.value)}
                        disabled={!member.interviewerType}
                        style={{
                            opacity: member.interviewerType ? 1 : 0.6,
                            ...(errors?.employeeId ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {})
                        }}
                    >
                        <option value="">{member.interviewerType ? 'Select Interviewer' : 'Choose type first'}</option>
                        {filteredEmployees.map(emp => (
                            <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.name}</option>
                        ))}
                    </select>
                    {errors?.employeeId && <span className="error-text">{errors.employeeId}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                    <label>Panel Role <span className="text-red-500">*</span></label>
                    <select
                        style={errors?.panelRole ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                        value={member.panelRole || ''} onChange={e => handleField('panelRole', e.target.value)}>
                        <option value="" disabled>Select Role</option>
                        {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                    </select>
                    {errors?.panelRole && <span className="error-text">{errors.panelRole}</span>}
                </div>
            </div>

            {/* Conditional Row: Position (if Employee) */}
            {member.panelRole === "Employee" && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Position <span className="text-red-500">*</span></label>
                        <select
                            style={errors?.positionId ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                            value={member.positionId || ''}
                            onChange={e => handleField('positionId', e.target.value)}
                            disabled={loadingPositions}
                        >
                            <option value="">{loadingPositions ? 'Loading positions...' : 'Select Position'}</option>
                            {positions.map(p => (
                                <option key={p._id || p.id} value={p._id || p.id}>{p.name || p.jobTitle}</option>
                            ))}
                        </select>
                        {errors?.positionId && <span className="error-text">{errors.positionId}</span>}
                    </div>
                </div>
            )}

            {/* Row 2: Designation (auto-fill) | Email (auto-fill) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                    <label>Designation <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'normal' }}>(auto-fill)</span></label>
                    <input type="text" readOnly placeholder="Automatic" value={member.interviewerDesignation || ''}
                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontStyle: 'italic' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label>Email <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'normal' }}>(auto-fill)</span></label>
                    <input type="text" readOnly placeholder="Automatic" value={member.interviewerEmail || ''}
                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontStyle: 'italic' }} />
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Interview Component
// ─────────────────────────────────────────────────────────────────────────────
const Interview = () => {
    const [viewMode, setViewMode] = useState('list');
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [interviewRounds, setInterviewRounds] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState({
        interviewId: '',
        candidate: '',
        position: '',
        round: '',
        interviewer: '',
        date: '',
        type: '',
        status: '',
        feedback: ''
    });
    const [limit] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);

    // Status Modal State
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusInterview, setStatusInterview] = useState(null);
    const [newStatus, setNewStatus] = useState('Scheduled');
    const [statusReason, setStatusReason] = useState('');
    const [statusDate, setStatusDate] = useState('');
    const [statusTime, setStatusTime] = useState('');
    const [statusModalErrors, setStatusModalErrors] = useState({});
    const [submittingStatus, setSubmittingStatus] = useState(false);

    // Feedback Modal State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackInterview, setFeedbackInterview] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [interviewResult, setInterviewResult] = useState('');
    const [feedbackErrors, setFeedbackErrors] = useState({});
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    // ── Panel Members State ──────────────────────────────────────────────────
    const [panelMembers, setPanelMembers] = useState([{ id: Date.now() }]);

    const addPanelMember = () => setPanelMembers(prev => [...prev, { id: Date.now() }]);
    const removePanelMember = (idx) => setPanelMembers(prev => prev.filter((_, i) => i !== idx));
    const updatePanelMember = (idx, updated) => {
        setPanelMembers(prev => prev.map((m, i) => i === idx ? updated : m));
        // Clear panelist-specific error when they make a change
        if (errors.panelMembers?.[idx]) {
            setErrors(prev => {
                const newPanelErrors = [...(prev.panelMembers || [])];
                newPanelErrors[idx] = null;
                return { ...prev, panelMembers: newPanelErrors };
            });
        }
    };

    // Reset errors when view mode changes
    React.useEffect(() => {
        setErrors({});
    }, [viewMode]);
    const filterEffectFirstRender = useRef(true);
    // ── Filtering Effect ─────────────────────────────────────────────────────
    React.useEffect(() => {
        if (filterEffectFirstRender.current) {
            filterEffectFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            fetchInterviews(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);
    // ────────────────────────────────────────────────────────────────────────

    const fetchInterviews = async (pageNum = 0) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: String(pageNum),
                limit: String(limit),
                ...filters
            });
            const response = await api.get(`/interviews/?${queryParams.toString()}`);
            const result = response.data;
            if (result.status === 200 || result.statusCode === 200) {
                setInterviews(result.data || []);
                setTotalItems(result.total || result.data.length);
                setTotalPages(result.totalPages || 1);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching interviews:', error);
            toast.error('Failed to load interviews');
        } finally {
            setLoading(false);
        }
    };

    const toggleRowSelection = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const selectAllRows = (e) => {
        if (e.target.checked) setSelectedRows(interviews.map(i => i._id || i.id));
        else setSelectedRows([]);
    };

    const handleStatusClick = (interview) => {
        setStatusInterview(interview);
        setNewStatus(interview.status || 'Scheduled');
        setStatusReason(''); // Reset reason
        setStatusDate(''); // Resets New Date - FORCE them to pick a new one
        setStatusTime(''); // Resets New Time - FORCE them to pick a new one
        setStatusModalErrors({});
        setShowStatusModal(true);
    };

    const handleStatusConfirm = async () => {
        if (!statusInterview) return;

        // Final Validation
        const newErrors = {};
        if (newStatus === 'Rescheduled' || newStatus === 'Cancelled') {
            if (!statusReason.trim()) newErrors.reason = true;
        }
        if (newStatus === 'Rescheduled') {
            if (!statusDate) newErrors.date = true;
            if (!statusTime) newErrors.time = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setStatusModalErrors(newErrors);
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmittingStatus(true);
        try {
            const id = statusInterview._id || statusInterview.id;
            const payload = {
                status: newStatus,
                reason: statusReason
            };

            // If rescheduling, include new date/time
            if (newStatus === 'Rescheduled') {
                payload.scheduleDate = statusDate;
                payload.time = statusTime;
            }

            await api.patch(`/interviews/${id}/status`, payload);
            toast.success(`Status updated to ${newStatus}`);
            fetchInterviews(page);
            setShowStatusModal(false);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setSubmittingStatus(false);
        }
    };

    const handleFeedbackClick = (interview) => {
        setFeedbackInterview(interview);
        setFeedbackText(interview.feedback || '');
        setInterviewResult(interview.interviewResult || 'Pending');
        setFeedbackErrors({});
        setShowFeedbackModal(true);
    };

    const handleFeedbackConfirm = async () => {
        if (!feedbackInterview) return;

        // Validation
        const newErrors = {};
        if (!interviewResult) newErrors.interviewResult = true;
        if (!feedbackText.trim()) newErrors.feedback = true;

        if (Object.keys(newErrors).length > 0) {
            setFeedbackErrors(newErrors);
            toast.error('Please fill in all mandatory fields');
            return;
        }

        setSubmittingFeedback(true);
        try {
            const id = feedbackInterview._id || feedbackInterview.id;
            await api.patch(`/interviews/${id}/feedback`, {
                feedback: feedbackText,
                interviewResult: interviewResult
            });
            toast.success(`Feedback updated successfully!`);
            fetchInterviews(page);
            setShowFeedbackModal(false);
        } catch (error) {
            console.error('Error updating feedback:', error);
            toast.error(error.response?.data?.message || 'Failed to update feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const fetchInitialData = async () => {
        setIsInitialLoading(true);
        try {
            const [candRes, vacRes, empRes, deptRes, rolesRes, roundRes] = await Promise.all([
                candidateService.getAllCandidates(0, 1000).catch(() => ({ data: [] })),
                api.get('/vacancies?approval=Approved&limit=1000').catch(() => ({ data: [] })),
                employeeService.getAllEmployees().catch(() => []),
                departmentService.getAllDepartments().catch(() => []),
                api.get('/roles/?page=0&limit=10').catch(() => ({ data: { data: [] } })),
                api.get('/interview-rounds').catch(() => ({ data: [] }))
            ]);
            setCandidates(candRes.data || []);
            setVacancies(vacRes.data?.data || []);
            setEmployees(empRes || []);
            setDepartments(deptRes || []);
            setRoles(rolesRes.data?.data || []);
            setInterviewRounds(roundRes.data?.data || []);

            // Fetch first page of interviews
            await fetchInterviews(0);
        } catch (error) {
            console.error('Error fetching background data:', error);
        } finally {
            setIsInitialLoading(false);
            setLoading(false);
        }
    };

    const initialLoadDone = useRef(false);
    React.useEffect(() => {
        if (initialLoadDone.current) return;
        initialLoadDone.current = true;
        fetchInitialData();
    }, []);

    const [formData, setFormData] = useState({
        candidateId: '', candidateName: '', vacancyId: '', vacancyName: '',
        scheduleDate: '', time: '', round: '', roundNumber: 1, level: 'Level 1 (Screening)',
        type: 'Online / Remote', mode: 'Video Call (Google Meet)', duration: 60,
        status: 'Scheduled', email: '', phone: '', timezone: '(GMT+05:30) India Standard Time',
        platform: 'Google Meet', location: '', notes: '', candidateInstructions: ''
    });

    const generateInterviewCode = async () => {
        try {
            const response = await api.get('/interviews/code/generate');
            // Backend returns { status: 200, data: "INT-2024-001" } or similar
            if (response.data && response.data.data) {
                return response.data.data;
            }
        } catch (error) {
            console.error('Error generating interview code:', error);
        }
        // Fallback with current year
        return `INT-${new Date().getFullYear()}-000`;
    };

    const fetchInterviewById = async (id) => {
        try {
            const response = await api.get(`/interviews/${id}`);
            if (response.data.status === 200 || response.data.statusCode === 200) {
                return response.data.data;
            }
        } catch (error) {
            console.error('Error fetching single interview:', error);
        }
        return null;
    };

    React.useEffect(() => {
        const prepareForm = async () => {
            setLoadingDetails(true);
            if (viewMode === 'edit' && selectedInterview) {
                const detailed = await fetchInterviewById(selectedInterview._id || selectedInterview.id);
                const dataToUse = detailed || selectedInterview;

                setFormData({
                    ...dataToUse,
                    candidateId: dataToUse.candidateId?._id || dataToUse.candidateId || '',
                    candidateName: dataToUse.candidateName || dataToUse.candidate?.name || '',
                    vacancyId: dataToUse.vacancyId?._id || dataToUse.vacancyId || '',
                    vacancyName: dataToUse.vacancyName || dataToUse.vacancy?.positionId?.name || dataToUse.appliedFor || '',
                    scheduleDate: dataToUse.scheduleDate ? (String(dataToUse.scheduleDate).includes('T') ? String(dataToUse.scheduleDate).split('T')[0] : dataToUse.scheduleDate) : '',
                    time: dataToUse.time || '',
                    round: dataToUse.roundId || dataToUse.round || ''
                });
                setPanelMembers(
                    dataToUse.panelMembers?.length
                        ? dataToUse.panelMembers.map(m => ({
                            ...m,
                            id: m.id || m._id || Date.now()
                        }))
                        : [{ id: Date.now() }]
                );
            } else if (viewMode === 'create') {
                const nextCode = await generateInterviewCode();
                setFormData({
                    candidateId: '', candidateName: '', vacancyId: '', vacancyName: '',
                    scheduleDate: '', time: '', round: '', roundNumber: 1, level: 'Level 1 (Screening)',
                    type: 'Online / Remote', mode: 'Video Call (Google Meet)', duration: 60,
                    status: 'Scheduled', email: '', phone: '', timezone: '(GMT+05:30) India Standard Time',
                    platform: 'Google Meet', location: '', notes: '', candidateInstructions: '',
                    interviewCode: nextCode // Store the generated code
                });
                setPanelMembers([{ id: Date.now() }]);
            }
            setLoadingDetails(false);
        };
        if (viewMode === 'edit' || viewMode === 'create') prepareForm();
    }, [viewMode, selectedInterview]);

    const handleCandidateChange = (e) => {
        const candidateIdSelection = e.target.value;
        const candidate = candidates.find(c => String(c._id || c.id) === String(candidateIdSelection));
        if (candidate) {
            setFormData(prev => ({
                ...prev,
                candidateId: candidate._id || candidate.id,
                candidateName: candidate.name,
                vacancyId: candidate.vacancyId || '',
                vacancyName: candidate.role || '',
                email: candidate.email || '',
                phone: candidate.phone || '',
                departmentId: candidate.departmentId || ''
            }));
            if (errors.candidateId) setErrors(prev => ({ ...prev, candidateId: null }));
        } else {
            setFormData(prev => ({ ...prev, candidateId: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.candidateId) newErrors.candidateId = "Required";
        if (!formData.vacancyId) newErrors.vacancyId = "Required";
        if (!formData.scheduleDate) {
            newErrors.scheduleDate = "Required";
        } else {
            const selectedDate = new Date(formData.scheduleDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.scheduleDate = "Cannot be in past";
            }
        }
        if (!formData.time) newErrors.time = "Required";

        // Panel members validation
        const panelErrors = [];
        panelMembers.forEach((member, index) => {
            const memberErrors = {};
            if (!member.interviewerType) memberErrors.interviewerType = "Selection required";
            if (!member.employeeId) memberErrors.employeeId = "Selection required";
            if (!member.panelRole) memberErrors.panelRole = "Selection required";
            if (member.panelRole === "Employee" && !member.positionId) memberErrors.positionId = "Selection required";

            if (Object.keys(memberErrors).length > 0) {
                panelErrors[index] = memberErrors;
            }
        });

        if (panelErrors.length > 0) {
            newErrors.panelMembers = panelErrors;
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fill all mandatory fields.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            // Transform payload to exactly match requested structure
            const {
                candidateName, vacancyName, interviewerId, interviewerName, departmentId,
                ...cleanData
            } = formData;

            const finalPanel = panelMembers.filter(m => !!m).map(m => ({
                interviewerType: m.interviewerType,
                employeeId: m.employeeId,
                panelRole: m.panelRole,
                positionId: m.panelRole === "Employee" ? m.positionId : undefined
            }));

            const payload = {
                ...cleanData,
                panelMembers: finalPanel
            };
            if (viewMode === 'create') {
                await api.post('/interviews', payload);
                toast.success('Interview scheduled successfully!');
            } else {
                const id = selectedInterview._id || selectedInterview.id;
                await api.put(`/interviews/${id}`, payload);
                toast.success('Interview schedule updated!');
            }
            setViewMode('list');
            fetchInterviews(page);
        } catch (error) {
            console.error('Error saving interview:', error);
            toast.error(error.response?.data?.message || 'Failed to save interview schedule.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedInterview) return;
        setSubmitting(true);
        try {
            const id = selectedInterview._id || selectedInterview.id;
            await api.delete(`/interviews/${id}`);
            toast.success('Interview cancelled successfully!');
            setViewMode('list');
            fetchInterviews(page);
        } catch (error) {
            console.error('Error deleting interview:', error);
            toast.error('Failed to cancel interview.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── renderInterviewForm ────────────────────────────────────────────────
    const renderInterviewForm = () => {
        const isEdit = viewMode === 'edit';
        const i = selectedInterview || {};

        const inputErrorStyle = (field) => errors[field] ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {};

        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', height: '90vh' }}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">
                            {isEdit ? 'Edit Interview Schedule' : 'Schedule New Interview'}
                        </h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body" style={{ position: 'relative' }}>
                        {(loadingDetails || submitting) && (
                            <div className="loading-overlay" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(3px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 1000, borderRadius: '12px'
                            }}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="premium-spinner" style={{ width: '60px', height: '60px' }}>
                                        <div className="premium-core"></div>
                                    </div>
                                    <p className="premium-text" style={{ color: '#0d5f68', fontSize: '0.9rem' }}>
                                        {submitting ? 'Processing Request...' : 'Preparing Interview Profile...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Section 1: Basic Information ───────────────────────────── */}
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Interview ID</label>
                                    <input type="text" placeholder="Auto-generated" value={formData.interviewCode || ''} readOnly className="bg-gray-50 font-mono" />
                                </div>
                                <div className="form-group">
                                    <label>Candidate <span className="text-red-500">*</span></label>
                                    <select
                                        style={inputErrorStyle('candidateId')}
                                        value={formData.candidateId} onChange={handleCandidateChange}>
                                        <option value="" disabled>Select Candidate</option>
                                        {Array.isArray(candidates) && candidates
                                            .filter(c => c.status !== 'Move to Offer')
                                            .map(c => (
                                            <option key={c._id || c.id} value={c._id || c.id}>
                                                {c.candidateId ? `${c.candidateId} - ` : ''}{c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.candidateId && <span className="error-text">{errors.candidateId}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Vacancy / Role <span className="text-red-500">*</span></label>
                                    <select
                                        style={inputErrorStyle('vacancyId')}
                                        value={formData.vacancyId}
                                        onChange={e => {
                                            const vId = e.target.value;
                                            const vac = vacancies.find(v => String(v._id || v.id) === String(vId));
                                            setFormData({ ...formData, vacancyId: vId, vacancyName: vac?.role || vac?.jobTitle || '' });
                                            if (errors.vacancyId) setErrors(prev => ({ ...prev, vacancyId: null }));
                                        }}
                                    >
                                        <option value="" disabled>Select Vacancy</option>
                                        {Array.isArray(vacancies) && vacancies.map(v => (
                                            <option key={v._id || v.id} value={v._id || v.id}>
                                                {v.requestNumber} - {v.position?.name || v.jobTitle || v.role}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.vacancyId && <span className="error-text">{errors.vacancyId}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Interview Round</label>
                                    <select value={formData.round} onChange={e => setFormData({ ...formData, round: e.target.value })}>
                                        <option value="" disabled>Select Round</option>
                                        {interviewRounds.length > 0 ? (
                                            interviewRounds.map(r => <option key={r._id || r.id} value={r._id || r.id}>{r.name}</option>)
                                        ) : (
                                            <>
                                                <option value="HR Round">HR Round</option>
                                                <option value="Technical Round 1">Technical Round 1</option>
                                                <option value="Technical Round 2">Technical Round 2</option>
                                                <option value="Managerial Round">Managerial Round</option>
                                                <option value="Final Interview">Final Interview</option>
                                                <option value="Client Interview">Client Interview</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Round Number</label>
                                    <input type="number" value={formData.roundNumber || 1} onChange={e => setFormData({ ...formData, roundNumber: e.target.value })} min={1} />
                                </div>
                                <div className="form-group">
                                    <label>Interview Level</label>
                                    <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                                        <option>Level 1 (Screening)</option>
                                        <option>Level 2 (Deep Dive)</option>
                                        <option>Level 3 (Architecture)</option>
                                        <option>Behavioral</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Round Number</label>
                                    <input type="number" min="1" value={formData.roundNumber || 1} onChange={e => setFormData({ ...formData, roundNumber: parseInt(e.target.value) || 1 })} />
                                </div>
                                <div className="form-group">
                                    <label>Interview Type</label>
                                    <select value={formData.type || 'Online / Remote'} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Online / Remote</option>
                                        <option>Offline / In-Person</option>
                                        <option>Telephonic</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Interview Mode</label>
                                    <select value={formData.mode || 'Video Call (Google Meet)'} onChange={e => setFormData({ ...formData, mode: e.target.value })}>
                                        <option>Video Call (Google Meet)</option>
                                        <option>Video Call (Zoom)</option>
                                        <option>In-Person Meeting</option>
                                        <option>Phone Call</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Candidate Email</label>
                                    <input type="text" placeholder="Auto-fill email" readOnly value={formData.email || ''} className="bg-gray-50" />
                                </div>
                                <div className="form-group">
                                    <label>Candidate Phone</label>
                                    <input type="text" placeholder="Auto-fill phone" readOnly value={formData.phone || ''} className="bg-gray-50" />
                                </div>
                            </div>
                        </div>

                        {/* ── Section 2: Logistics & Schedule ────────────────────────── */}
                        <div className="form-card">
                            <div className="form-card-title">Logistics & Schedule</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Scheduled Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        style={inputErrorStyle('scheduleDate')}
                                        value={formData.scheduleDate || ''}
                                        onChange={e => {
                                            setFormData({ ...formData, scheduleDate: e.target.value });
                                            if (errors.scheduleDate) setErrors(prev => ({ ...prev, scheduleDate: null }));
                                        }}
                                    />
                                    {errors.scheduleDate && <span className="error-text">{errors.scheduleDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Scheduled Time <span className="text-red-500">*</span></label>
                                    <input
                                        type="time"
                                        style={inputErrorStyle('time')}
                                        value={formData.time || ''}
                                        onChange={e => {
                                            setFormData({ ...formData, time: e.target.value });
                                            if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                                        }}
                                    />
                                    {errors.time && <span className="error-text">{errors.time}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Duration (Minutes)</label>
                                    <select value={formData.duration || 60} onChange={e => setFormData({ ...formData, duration: e.target.value })}>
                                        <option value={30}>30 Minutes</option>
                                        <option value={45}>45 Minutes</option>
                                        <option value={60}>60 Minutes</option>
                                        <option value={90}>90 Minutes</option>
                                        <option value={120}>120 Minutes</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Interview Status</label>
                                    <select value={formData.status || 'Scheduled'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option>Scheduled</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                        <option>Rescheduled</option>
                                        <option>Move to Offer</option>
                                    </select>
                                </div>
                                {(formData.mode !== 'In-Person Meeting' && formData.type !== 'Offline / In-Person') && (
                                    <>
                                        <div className="form-group">
                                            <label>Time Zone</label>
                                            <select value={formData.timezone || '(GMT+05:30) India Standard Time'} onChange={e => setFormData({ ...formData, timezone: e.target.value })}>
                                                <option>(GMT+05:30) India Standard Time</option>
                                                <option>(GMT+00:00) UTC</option>
                                                <option>(GMT-05:00) Eastern Time</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Interview Platform</label>
                                            <select value={formData.platform || 'Google Meet'} onChange={e => setFormData({ ...formData, platform: e.target.value })}>
                                                <option>Google Meet</option>
                                                <option>Zoom</option>
                                                <option>Microsoft Teams</option>
                                                <option>WhatsApp Video</option>
                                                <option>Skype</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Location / Meeting Link</label>
                                    <textarea rows="2" placeholder="Google Meet / Zoom URL or Office Room Address"
                                        value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* ── Section 3: Panel Members ────────────────────────────────
                             Replaces the old "Panel & Assessment" card.
                             panelMembers state is managed at the Interview level so
                             all cards share employees data and can be saved in one go.
                        ────────────────────────────────────────────────────────────── */}
                        <div className="form-card">
                            {/* Section header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Users size={16} color="#2563eb" />
                                    </div>
                                    <div>
                                        <div className="form-card-title" style={{ margin: 0, padding: 0, border: 'none' }}>Panel Members</div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>Add interviewers to the assessment panel</div>
                                    </div>
                                </div>

                                <button
                                    onClick={addPanelMember}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: '#ffffff', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                    <Plus size={14} /> Add Panel Member
                                </button>
                            </div>

                            {/* Dynamic panel member cards */}
                            {panelMembers.map((member, index) => (
                                <PanelMemberCard
                                    key={member.id || index}
                                    index={index}
                                    member={member}
                                    employees={employees}
                                    roles={roles}
                                    departments={departments}
                                    onChange={updatePanelMember}
                                    onRemove={removePanelMember}
                                    showRemove={panelMembers.length > 1}
                                    errors={errors.panelMembers?.[index]}
                                />
                            ))}

                            {/* Panel Instructions */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Panel Instructions / Notes</label>
                                <textarea rows="2" placeholder="Add any specific focus areas or instructions for the panel members..."
                                    value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>

                            {/* Candidate Instructions */}
                            <div className="form-group" style={{ marginBottom: 0, marginTop: '12px' }}>
                                <label>Candidate Instructions</label>
                                <textarea rows="2" placeholder="Add instructions for the candidate (e.g. preparation, dress code, docs to bring)"
                                    value={formData.candidateInstructions || ''} onChange={e => setFormData({ ...formData, candidateInstructions: e.target.value })} />
                            </div>
                        </div>

                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Confirm Schedule')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── renderInterviewDetail ──────────────────────────────────────────────
    const renderInterviewDetail = () => {
        const i = selectedInterview || {};
        return (
            <div className="modal-overlay" onClick={() => { setViewMode('list'); setSelectedInterview(null); }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', height: '90vh' }}>
                    <div className="form-header">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar size={20} /> Interview Schedule Details
                            </h2>
                            <p className="text-xs text-white/70">Review round information, panelists and meeting logistics</p>
                        </div>
                        <button className="icon-btn" onClick={() => { setViewMode('list'); setSelectedInterview(null); }}><X size={20} /></button>
                    </div>

                    <div className="form-body" style={{ position: 'relative', overflowY: 'auto' }}>
                        {loadingDetails && (
                            <div className="loading-overlay" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(3px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 1000, borderRadius: '12px'
                            }}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="premium-spinner" style={{ width: '60px', height: '60px' }}>
                                        <div className="premium-core"></div>
                                    </div>
                                    <p className="premium-text" style={{ color: '#0d5f68', fontSize: '0.9rem' }}>Retrieving Round Data...</p>
                                </div>
                            </div>
                        )}
                        {/* Candidate & Round Overview */}
                        <div className="form-card">
                            <div className="form-card-title flex items-center gap-2">
                                <User size={16} className="text-teal-600" /> Candidate & Round Overview
                            </div>
                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <label>Interview Reference</label>
                                    <div className="bg-blue-50/50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 font-bold text-sm w-fit mt-1 uppercase tracking-tight">
                                        {i.id ? `INT-2024-00${i.id}` : 'N/A'}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <label>Candidate Name</label>
                                    <div className="font-bold text-slate-800 mt-1">{i.candidate || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Applied Position</label>
                                    <div className="font-medium text-slate-600 mt-1">{i.role || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Current Status</label>
                                    <div className="flex items-center mt-1">
                                        <span className={`status-badge-premium ${i.status === 'Scheduled' ? 'status-scheduled' : i.status === 'Completed' ? 'status-completed' : i.status === 'Cancelled' ? 'status-cancelled' : 'status-rescheduled'}`}>
                                            {i.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <label>Interview Round</label>
                                    <div className="text-teal-700 font-bold mt-1 uppercase text-xs tracking-wider">{i.round || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Assessment Level</label>
                                    <div className="text-slate-700 font-semibold mt-1">{i.level || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Date, Time & Logistics */}
                        <div className="form-card" style={{ marginTop: '1.5rem' }}>
                            <div className="form-card-title flex items-center gap-2">
                                <Clock size={16} className="text-teal-600" /> Date, Time & Logistics
                            </div>
                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <label>Scheduled Date</label>
                                    <div className="mt-1 font-semibold text-slate-800 tracking-tight">{i.date || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Scheduled Time</label>
                                    <div className="mt-1 font-semibold text-slate-800 tracking-tight">{i.time || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Duration / Period</label>
                                    <div className="mt-1 font-medium text-slate-700">{i.duration} Minutes (Approx)</div>
                                </div>
                                <div className="info-item">
                                    <label>Time Zone</label>
                                    <div className="mt-1 text-[11px] text-slate-500 font-mono">{i.timezone || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Interview Mode</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {i.type === 'Video' ? <Monitor size={14} className="text-blue-500" /> : <MapPin size={14} className="text-slate-500" />}
                                        <span className="font-medium text-slate-700">{i.type} ({i.mode})</span>
                                    </div>
                                </div>
                                <div className="info-item" style={{ gridColumn: 'span 3' }}>
                                    <label>Meeting Link / Venue address</label>
                                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                                        <span className="text-blue-600 text-sm break-all font-mono select-all">{i.location || 'N/A'}</span>
                                        {i.location && (
                                            <a href={i.location} target="_blank" rel="noopener noreferrer"
                                                className="text-[10px] uppercase font-bold bg-blue-100 text-blue-600 px-2 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap">
                                                Launch Meet
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Members — view mode */}
                        <div className="form-card" style={{ marginTop: '1.5rem' }}>
                            <div className="form-card-title flex items-center gap-2">
                                <Users size={16} className="text-teal-600" /> Panel Members
                            </div>

                            {(i.panelMembers?.filter(m => !!m) || []).map((m, idx) => (
                                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', marginBottom: '10px', backgroundColor: '#fafafa', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                                    <div className="info-item">
                                        <label>Name</label>
                                        <div className="font-bold text-slate-800 mt-1">{m.interviewerName || 'N/A'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Type</label>
                                        <div className="font-medium text-slate-600 mt-1">{m.interviewerType || 'N/A'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Role</label>
                                        <div className="font-medium text-teal-700 mt-1">{m.panelRole || 'N/A'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Department</label>
                                        <div className="font-medium text-slate-600 mt-1">{m.department || 'N/A'}</div>
                                    </div>
                                </div>
                            ))}

                            {(!i.panelMembers || i.panelMembers.length === 0) && (
                                <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>No panel members assigned.</p>
                            )}

                            <div className="info-item" style={{ marginTop: '12px' }}>
                                <label>Special Instructions for Panel</label>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm italic mt-1 leading-relaxed text-slate-500 relative">
                                    <AlertCircle size={14} className="absolute top-4 right-4 text-slate-300" />
                                    {i.notes || 'No specific instructions found.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => { setViewMode('list'); setSelectedInterview(null); }}>Close Profile</button>
                        <button className="btn-primary" onClick={() => setViewMode('edit')} style={{ background: '#0d5f68' }}>
                            <Edit size={16} /> Edit Schedule
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── renderDeleteModal ──────────────────────────────────────────────────
    const renderDeleteModal = () => {
        const i = selectedInterview || {};
        return (
            <div className="modal-overlay" onClick={() => { setViewMode('list'); setSelectedInterview(null); }}>
                <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="delete-header-premium">
                        <button className="icon-btn" onClick={() => { setViewMode('list'); setSelectedInterview(null); }} disabled={submitting}><X size={18} /></button>
                    </div>
                    <div className="delete-body-premium" style={{ position: 'relative' }}>
                        {submitting && (
                            <div className="loading-overlay" style={{
                                position: 'absolute', top: -50, left: -40, right: -40, bottom: -40,
                                backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(3px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 1000, borderRadius: '12px'
                            }}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="premium-spinner" style={{ width: '50px', height: '50px' }}>
                                        <div className="premium-core"></div>
                                    </div>
                                    <p className="premium-text" style={{ color: '#0d5f68', fontSize: '0.85rem' }}>Processing Cancellation...</p>
                                </div>
                            </div>
                        )}
                        <div className="delete-icon-container"><Trash2 size={36} /></div>
                        <h2 className="delete-title-premium">Cancel Interview?</h2>
                        <p className="delete-message-premium">
                            Are you sure you want to permanently cancel and remove this interview schedule for <span className="font-bold text-slate-800">{i.candidate}</span>?
                        </p>
                        <div className="delete-item-badge">Ref: {i.interviewCode || 'PENDING'}</div>
                    </div>
                    <div className="delete-footer-premium">
                        <button className="btn-cancel-premium" onClick={() => { setViewMode('list'); setSelectedInterview(null); }} disabled={submitting}>Keep Schedule</button>
                        <button className="btn-delete-premium" onClick={handleDelete} disabled={submitting} style={{ background: '#ef4444' }}>
                            {submitting ? 'Cancelling...' : 'Confirm Cancel'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────
    if (isInitialLoading) { // Use specific initial loading state to prevent blinking
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
                        gap: 2rem;
                    }
                    .premium-spinner {
                        position: relative;
                        width: 80px;
                        height: 80px;
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
                    <p className="premium-text" style={{ color: '#0d5f68' }}>Loading Interview Data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="employees-page">
            {(viewMode === 'create' || viewMode === 'edit') && renderInterviewForm()}
            {viewMode === 'view' && renderInterviewDetail()}
            {viewMode === 'delete' && renderDeleteModal()}

            {/* Header Section */}
            <div className="dashboard-header animate-entry" style={{ padding: '0 0.5rem' }}>
                <div className="header-left">
                    <h1 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar size={24} className="text-slate-700 opacity-80" />
                        Interview Management
                    </h1>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => { setSelectedInterview(null); setViewMode('create'); }}>
                        <Plus size={18} strokeWidth={2.5} />
                        <span>Schedule New Interview</span>
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-scroller-v6" style={{ marginBottom: '1.25rem' }}>
                <div className="stats-container-v6">
                    {[
                        { label: 'Total Interviews', status: '', icon: <Calendar size={18} />, color: '#0d5f68', bg: 'rgba(13, 95, 104, 0.1)', trend: 12 },
                        { label: 'Scheduled', status: 'Scheduled', icon: <Clock size={18} />, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', trend: 5 },
                        { label: 'Completed', status: 'Completed', icon: <CheckCircle2 size={18} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', trend: 8 },
                        { label: 'Rescheduled', status: 'Rescheduled', icon: <RotateCcw size={18} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', trend: -2 },
                        { label: 'Cancelled', status: 'Cancelled', icon: <XCircle size={18} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', trend: -1 },
                        { label: 'Pending Feedback', status: 'PendingFeedback', icon: <AlertTriangle size={18} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', trend: 3 },
                    ].map((s, i) => (
                        <StatCard 
                            key={i} 
                            {...s} 
                            count={
                                s.status === '' ? totalItems : 
                                s.status === 'PendingFeedback' ? interviews.filter(inv => inv.status === 'Completed' && !inv.feedback).length :
                                interviews.filter(inv => inv.status === s.status).length
                            }
                            active={s.status === 'PendingFeedback' ? (filters.status === 'Completed' && filters.feedback === 'Pending') : filters.status === s.status}
                            onClick={() => {
                                if (s.status === 'PendingFeedback') {
                                    setFilters(prev => ({ ...prev, status: 'Completed', feedback: 'Pending' }));
                                } else {
                                    setFilters(prev => ({ ...prev, status: s.status, feedback: '' }));
                                }
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="filter-search-container" style={{ marginBottom: '1rem' }}>
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search by candidate, position or interviewer..."
                        value={filters.candidate}
                        onChange={e => setFilters(prev => ({ ...prev, candidate: e.target.value }))}
                    />
                </div>
                <div className="filter-actions">
                    <div className="filter-dropdown-group">
                        <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                            <option value="">Status</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Rescheduled">Rescheduled</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select value={filters.type} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}>
                            <option value="">Mode</option>
                            <option value="Video">Video Call</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Telephone">Telephone</option>
                        </select>
                        <input
                            type="date"
                            className="date-picker-input"
                            value={filters.date}
                            onChange={e => setFilters(prev => ({ ...prev, date: e.target.value }))}
                        />
                    </div>
                    <button className="btn-icon-alt" onClick={() => setFilters({
                        interviewId: '', candidate: '', position: '', round: '', interviewer: '', date: '', type: '', status: '', feedback: ''
                    })} title="Clear Filters">
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            <div className="table-container-premium shadow-premium" style={{ flex: 1, minHeight: '600px' }}>
                {loading && (
                    <div className="loading-overlay" style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.7)', zIndex: 100, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)',
                        borderRadius: '0 0 12px 12px'
                    }}>
                        <div className="premium-spinner" style={{ width: '40px', height: '40px' }}>
                            <div className="premium-core"></div>
                        </div>
                    </div>
                )}
                
                <div className="table-header-info">
                    <div className="header-info-left">
                        <h3>Interview Schedules List</h3>
                        <span className="count-chip">{totalItems} TOTAL</span>
                    </div>
                    <div className="header-info-right text-xs text-slate-500 font-medium">
                        Showing {interviews.length} entries on page {page + 1}
                    </div>
                </div>

                {interviews.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
                        <EmptyState onCreate={() => { setSelectedInterview(null); setViewMode('create'); }} />
                    </div>
                ) : (
                    <>
                        <div className="table-responsive" style={{ flex: 1 }}>
                            <table className="ats-table">
                                <thead>
                                    <tr>
                                        <th onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedRows.length === interviews.length && interviews.length > 0} 
                                                onChange={selectAllRows}
                                                style={{ cursor: 'pointer', scale: '1.2' }}
                                            />
                                        </th>
                                        <th>Code</th>
                                        <th>Candidate & Position</th>
                                        <th>Round</th>
                                        <th>Panel Members</th>
                                        <th>Scheduled</th>
                                        <th className="text-center">Mode</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-center">Feedback</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {interviews.map(interview => (
                                        <tr key={interview._id || interview.id} className={selectedRows.includes(interview._id || interview.id) ? 'row-selected' : ''}>
                                            <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedRows.includes(interview._id || interview.id)} 
                                                    onChange={() => toggleRowSelection(interview._id || interview.id)}
                                                    style={{ cursor: 'pointer', scale: '1.2' }}
                                                />
                                            </td>
                                            <td>
                                                <span className="code-badge">
                                                    {interview.interviewCode || 'PENDING'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="job-info">
                                                    <span className="job-title">
                                                        {interview.candidateName || (typeof interview.candidate === 'object' ? interview.candidate?.name : interview.candidate) || 'Unknown'}
                                                    </span>
                                                    <div className="job-sub-info">
                                                        {interview.appliedFor || interview.vacancyName || (typeof interview.vacancyId === 'object' ? interview.vacancyId?.positionName : interview.vacancyId) || 'Position N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="job-info">
                                                    <span style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem' }}>
                                                        {typeof interview.round === 'object' ? interview.round?.roundName : interview.round}
                                                    </span>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                                                        {interview.level || 'Final'} Level
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="panel-avatars">
                                                    {(() => {
                                                        const list = interview.interviewers || [];
                                                        if (list.length === 0) {
                                                            const name = interview.interviewerName || (typeof interview.interviewer === 'object' ? interview.interviewer?.name : interview.interviewer) || 'N/A';
                                                            const col = getAvatarColor(name);
                                                            return (
                                                                <div className="panel-avatar" style={{ backgroundColor: col.bg, color: col.text }} title={name}>
                                                                    {getInitials(name)}
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <>
                                                                {list.slice(0, 3).map((i, idx) => {
                                                                    const name = (i && typeof i === 'object') ? i.interviewerName || i.name : (i || 'Pending');
                                                                    const col = getAvatarColor(name);
                                                                    return (
                                                                        <div key={idx} className="panel-avatar" style={{ backgroundColor: col.bg, color: col.text, zIndex: 3 - idx }} title={name}>
                                                                            {getInitials(name)}
                                                                        </div>
                                                                    );
                                                                })}
                                                                {list.length > 3 && (
                                                                    <div className="panel-avatar" style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '9px', zIndex: 0 }}>
                                                                        +{list.length - 3}
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="date-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: '600', fontSize: '0.85rem' }}>
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <span>{interview.scheduleDate ? (typeof interview.scheduleDate === 'string' && interview.scheduleDate.includes('T') ? interview.scheduleDate.split('T')[0] : interview.scheduleDate) : interview.date || 'TBA'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', marginLeft: '1px' }}>
                                                        <Clock size={13} /> {interview.time || '00:00'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="mode-badge" title={interview.mode || 'Online'}>
                                                    {interview.mode?.toLowerCase().includes('video') ? <Monitor size={14} /> : <MapPin size={14} />}
                                                    {interview.mode || 'Online'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <Badge variant={interview.status} onUpdate={() => handleStatusClick(interview)} />
                                            </td>
                                            <td className="text-center">
                                                <Badge variant={interview.interviewResult || 'pending'} onUpdate={() => handleFeedbackClick(interview)}>
                                                    {interview.interviewResult || 'Pending'}
                                                </Badge>
                                            </td>
                                            <td className="text-right">
                                                <div className="action-button-group">
                                                    <button className="row-action view" onClick={() => { setSelectedInterview(interview); setViewMode('view'); }} title="View Details"><Eye size={18} /></button>
                                                    <button className="row-action edit" onClick={() => { setSelectedInterview(interview); setViewMode('edit'); }} title="Edit"><Edit size={18} /></button>
                                                    <button className="row-action delete" onClick={() => { setSelectedInterview(interview); setViewMode('delete'); }} title="Delete"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Footer */}
                        <div className="table-footer-ats">
                            <div className="footer-left">
                                Showing <b>{interviews.length}</b> of <b>{totalItems}</b> Schedule(s)
                            </div>
                            <div className="footer-right">
                                <button 
                                    className={`page-btn ${page === 0 ? 'disabled' : ''}`} 
                                    onClick={() => page > 0 && fetchInterviews(page - 1)} 
                                    disabled={page === 0}
                                >
                                    Previous
                                </button>
                                <div className="page-numbers">
                                    {Array.from({ length: totalPages }, (_, idx) => (
                                        <button 
                                            key={idx} 
                                            className={`page-num ${page === idx ? 'active' : ''}`}
                                            onClick={() => fetchInterviews(idx)}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    className={`page-btn ${page >= totalPages - 1 ? 'disabled' : ''}`} 
                                    onClick={() => page < totalPages - 1 && fetchInterviews(page + 1)} 
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showStatusModal && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal-content status-modal-premium" onClick={e => e.stopPropagation()}>
                        <div className="status-header-premium">
                            <h2 className="status-header-title-premium">Update Status</h2>
                            <button className="icon-btn-close" onClick={() => setShowStatusModal(false)}><X size={20} /></button>
                        </div>
                        <div className="status-body-premium">
                            {submittingStatus && (
                                <div className="loading-overlay-premium">
                                    <div className="premium-spinner-container">
                                        <div className="premium-spinner-v2"></div>
                                        <p>Saving Status...</p>
                                    </div>
                                </div>
                            )}

                            <div className="status-target-info-premium">
                                <span>Updating interview:</span>
                                <span className="status-target-badge-premium">
                                    {statusInterview?.interviewCode || statusInterview?.id}
                                </span>
                            </div>

                            <div className="status-form-group-premium">
                                <label className="status-label-premium">Interview Status</label>
                                <div className="verdict-select-wrapper">
                                    <select
                                        value={newStatus}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNewStatus(val);
                                            setStatusModalErrors({});
                                            if (val !== 'Rescheduled' && val !== 'Cancelled') setStatusReason('');
                                        }}
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Rescheduled">Rescheduled</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Move to Offer">Move to Offer</option>
                                    </select>
                                    <ChevronDown className="select-icon-premium" size={16} />
                                </div>
                            </div>


                            {(newStatus === 'Rescheduled' || newStatus === 'Cancelled') && (
                                <div className="status-form-group-premium">
                                    <label className="status-label-premium">
                                        {newStatus === 'Rescheduled' ? 'Reason for Reschedule' : 'Reason for Cancellation'}
                                    </label>
                                    <textarea
                                        className={`status-textarea-premium ${statusModalErrors.reason ? 'error' : ''}`}
                                        placeholder={`Enter details for ${newStatus.toLowerCase()} status...`}
                                        value={statusReason}
                                        onChange={(e) => {
                                            setStatusReason(e.target.value);
                                            if (e.target.value.trim()) setStatusModalErrors(prev => ({ ...prev, reason: false }));
                                        }}
                                    />
                                    {statusModalErrors.reason && <p className="status-error-msg-premium">Reason is required</p>}
                                </div>
                            )}

                            {newStatus === 'Rescheduled' && (
                                <div className="status-form-row-premium">
                                    <div className="status-form-group-premium">
                                        <label className={`status-label-premium ${statusModalErrors.date ? 'error' : ''}`}>New Date</label>
                                        <input
                                            type="date"
                                            value={statusDate}
                                            onChange={(e) => {
                                                setStatusDate(e.target.value);
                                                if (e.target.value) setStatusModalErrors(prev => ({ ...prev, date: false }));
                                            }}
                                            className={statusModalErrors.date ? 'error' : ''}
                                        />
                                        {statusModalErrors.date && <p className="status-error-msg-premium">Required</p>}
                                    </div>
                                    <div className="status-form-group-premium">
                                        <label className={`status-label-premium ${statusModalErrors.time ? 'error' : ''}`}>New Time</label>
                                        <input
                                            type="time"
                                            value={statusTime}
                                            onChange={(e) => {
                                                setStatusTime(e.target.value);
                                                if (e.target.value) setStatusModalErrors(prev => ({ ...prev, time: false }));
                                            }}
                                            className={statusModalErrors.time ? 'error' : ''}
                                        />
                                        {statusModalErrors.time && <p className="status-error-msg-premium">Required</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="status-footer-premium">
                            <button className="btn-secondary-premium" onClick={() => setShowStatusModal(false)} disabled={submittingStatus}>Cancel</button>
                            <button
                                className="btn-submit-premium"
                                onClick={handleStatusConfirm}
                                disabled={submittingStatus}
                            >
                                {submittingStatus ? 'Wait...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFeedbackModal && (
                <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
                    <div className="modal-content feedback-modal-premium" onClick={e => e.stopPropagation()}>
                        <div className="feedback-header-premium">
                            <h2 className="feedback-title-premium">Interview Evaluation</h2>
                            <button className="icon-btn-close" onClick={() => setShowFeedbackModal(false)}><X size={20} /></button>
                        </div>
                        
                        <div className="feedback-body-premium">
                            {submittingFeedback && (
                                <div className="loading-overlay-premium">
                                    <div className="premium-spinner-container">
                                        <div className="premium-spinner-v2"></div>
                                        <p>Processing Evaluation...</p>
                                    </div>
                                </div>
                            )}

                            {/* Candidate Info Card */}
                            <div className="candidate-info-card-premium">
                                <div className="candidate-avatar-large">
                                    {getInitials(feedbackInterview?.candidateName)}
                                </div>
                                <div className="candidate-details-stack">
                                    <h3>{feedbackInterview?.candidateName}</h3>
                                    <div className="round-badge-premium">
                                        <Clock size={12} />
                                        <span>{typeof feedbackInterview?.round === 'object' ? feedbackInterview.round?.roundName : feedbackInterview?.round}</span>
                                    </div>
                                    <p className="position-text-small">{feedbackInterview?.appliedFor || feedbackInterview?.vacancyName || 'Software Engineer'}</p>
                                </div>
                            </div>

                            <div className="feedback-form-grid-premium">
                                <div className="form-group-premium">
                                    <label>Overall Verdict <span className="required-star">*</span></label>
                                    <div className="verdict-select-wrapper">
                                        <select
                                            value={interviewResult}
                                            onChange={(e) => {
                                                setInterviewResult(e.target.value);
                                                if (e.target.value) setFeedbackErrors(prev => ({ ...prev, interviewResult: false }));
                                            }}
                                            className={feedbackErrors.interviewResult ? 'error' : ''}
                                        >
                                            <option value="" disabled>Choose final result</option>
                                            <option value="Passed">Passed</option>
                                            <option value="Failed">Failed</option>
                                            <option value="On Hold">On Hold</option>
                                            <option value="Move to Offer">Move to Offer</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                        <ChevronDown className="select-icon-premium" size={16} />
                                    </div>
                                    {feedbackErrors.interviewResult && <span className="error-message-alt">Please select a result</span>}
                                </div>

                                <div className="form-group-premium full-width">
                                    <label>Detailed Evaluation Notes <span className="required-star">*</span></label>
                                    <textarea
                                        placeholder="Type your assessment notes, technical strengths, and areas for improvement..."
                                        value={feedbackText}
                                        onChange={(e) => {
                                            setFeedbackText(e.target.value);
                                            if (e.target.value.trim()) setFeedbackErrors(prev => ({ ...prev, feedback: false }));
                                        }}
                                        className={feedbackErrors.feedback ? 'error' : ''}
                                    />
                                    {feedbackErrors.feedback && <span className="error-message-alt">Evaluation notes are required</span>}
                                </div>
                            </div>
                            
                            <p className="feedback-footer-note">
                                <AlertTriangle size={14} />
                                This evaluation is final and will influence the recruitment decision.
                            </p>
                        </div>

                        <div className="feedback-footer-premium">
                            <button className="btn-secondary-premium" onClick={() => setShowFeedbackModal(false)} disabled={submittingFeedback}>
                                Discard
                            </button>
                            <button
                                className="btn-submit-premium"
                                onClick={handleFeedbackConfirm}
                                disabled={submittingFeedback}
                            >
                                {submittingFeedback ? 'Submitting...' : 'Save Evaluation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .employees-page { padding: 1.5rem; padding-top: 1rem; display: flex; flex-direction: column; gap: 1rem; height: calc(100vh - 64px); background: #f8fafc; overflow: hidden; }
                
                /* Layout */
                .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; min-height: 48px; flex-shrink: 0; }
                .dashboard-header h1 { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
                
                /* Stats Cards */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
                .stat-card { background: white; padding: 1rem 1.15rem; border-radius: 12px; display: flex; align-items: center; gap: 0.85rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.03); transition: all 0.25s ease; }
                .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(0,0,0,0.08); border-color: var(--accent-color); }
                .stat-icon-wrapper { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-bg); color: var(--accent-color); display: flex; align-items: center; justify-content: center; }
                .stat-info { display: flex; flex-direction: column; gap: 1px; }
                .stat-count { font-size: 1.35rem; font-weight: 800; color: #1e293b; line-height: 1; letter-spacing: -0.01em; }
                .stat-label { font-size: 0.725rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

                /* New Premium Stats */
                .stats-scroller-v6 { overflow-x: auto; padding: 0.5rem 0.5rem 1.25rem 0.5rem; margin: 0 -0.5rem; flex-shrink: 0; }
                .stats-scroller-v6::-webkit-scrollbar { height: 4px; }
                .stats-scroller-v6::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                
                .stats-container-v6 { display: flex; gap: 1rem; min-width: max-content; }
                
                .stat-card-premium { background: white; padding: 0.85rem 1.15rem; border-radius: 14px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; min-width: 210px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
                .stat-card-premium:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .stat-card-premium.active { border-color: var(--accent); background: linear-gradient(to bottom right, white, var(--accent-bg)); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform: translateY(-2px); }
                .stat-card-premium.active::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); }
                
                .stat-main { display: flex; align-items: center; gap: 0.75rem; }
                .stat-icon-v6 { width: 38px; height: 38px; border-radius: 10px; background: var(--accent-bg); color: var(--accent); display: flex; align-items: center; justify-content: center; }
                .stat-icon-v6 svg { width: 18px; height: 18px; }
                .stat-content-v6 { display: flex; flex-direction: column; gap: 1px; }
                .stat-label-v6 { font-size: 0.625rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-value-group { display: flex; align-items: baseline; gap: 0.5rem; }
                .stat-count-v6 { font-size: 1.35rem; font-weight: 800; color: #1e293b; line-height: 1; }
                
                .stat-trend { display: flex; align-items: center; gap: 2px; font-size: 0.6rem; font-weight: 700; padding: 1px 5px; border-radius: 20px; }
                .stat-trend.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                .stat-trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                
                .stat-indicator { color: #cbd5e1; transition: transform 0.2s; }
                .stat-card-premium:hover .stat-indicator { transform: translateX(3px); color: var(--accent); }

                /* Filter Bar */
                .filter-search-container { background: white; padding: 0.65rem 1.25rem; border-radius: 12px; display: flex; gap: 1rem; align-items: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.03); flex-wrap: wrap; flex-shrink: 0; }
                .search-wrapper { flex: 1; position: relative; display: flex; align-items: center; min-width: 280px; }
                .search-icon { position: absolute; left: 0.85rem; color: #94a3b8; z-index: 10; }
                .search-wrapper input { width: 100%; height: 38px; padding: 0 1rem 0 2.5rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; font-size: 0.85rem; color: #1e293b; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
                .search-wrapper input:focus { border-color: #0d5f68; background: white; box-shadow: 0 0 0 3px rgba(13, 95, 104, 0.08); }
                .filter-actions { display: flex; gap: 0.75rem; align-items: center; flex-shrink: 0; }
                .filter-dropdown-group { display: flex; gap: 0.5rem; align-items: center; }
                .filter-dropdown-group select, .date-picker-input { height: 38px; padding: 0 1rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.825rem; color: #475569; font-weight: 600; outline: none; cursor: pointer; min-width: 130px; }
                .filter-dropdown-group select:focus, .date-picker-input:focus { border-color: #0d5f68; background: white; }
                .btn-icon-alt { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
                .btn-icon-alt:hover { background: #f1f5f9; color: #0d5f68; border-color: #cbd5e1; }

                /* Table Premium */
                /* Table Premium - Fully Redesigned */
                .table-container-premium { background: white; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; flex: 1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); width: 100%; position: relative; margin-top: 0.5rem; }
                .table-header-info { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: white; flex-wrap: wrap; gap: 0.75rem; }
                .header-info-left { display: flex; align-items: center; gap: 0.75rem; }
                .header-info-left h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #1e293b; letter-spacing: -0.0125em; }
                .count-chip { background: #f1f5f9; color: #64748b; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; border: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.025em; }
                
                .table-responsive { overflow-x: auto; overflow-y: auto; flex: 1; position: relative; scrollbar-gutter: stable; }
                .table-responsive::-webkit-scrollbar { height: 6px; width: 6px; }
                .table-responsive::-webkit-scrollbar-track { background: #f8fafc; }
                .table-responsive::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #f8fafc; }
                .table-responsive::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                .ats-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 1300px; table-layout: fixed; }
                .ats-table th { background: #f8fafc; padding: 1rem 1.25rem; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; text-align: left; border-bottom: 2px solid #f1f5f9; position: sticky; top: 0; z-index: 20; white-space: nowrap; }
                .ats-table td { padding: 0.75rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: background-color 0.15s ease; color: #334155; height: 82px; overflow: hidden; }
                .ats-table tr:hover td { background: #f8fafc; }
                .ats-table tr.row-selected td { background-color: rgba(13, 95, 104, 0.04) !important; }
                
                /* Column Widths & Alignments */
                .ats-table th:nth-child(1), .ats-table td:nth-child(1) { width: 60px; text-align: center; }
                .ats-table th:nth-child(2), .ats-table td:nth-child(2) { width: 130px; }
                .ats-table th:nth-child(3), .ats-table td:nth-child(3) { width: 280px; }
                .ats-table th:nth-child(4), .ats-table td:nth-child(4) { width: 160px; }
                .ats-table th:nth-child(5), .ats-table td:nth-child(5) { width: 160px; }
                .ats-table th:nth-child(6), .ats-table td:nth-child(6) { width: 180px; }
                .ats-table th:nth-child(7), .ats-table td:nth-child(7) { width: 170px; text-align: center; }
                .ats-table th:nth-child(8), .ats-table td:nth-child(8) { width: 150px; text-align: center; }
                .ats-table th:nth-child(9), .ats-table td:nth-child(9) { width: 150px; text-align: center; }
                .ats-table th:nth-child(10), .ats-table td:nth-child(10) { width: 150px; text-align: right; }

                .code-badge { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; color: #0d5f68; background: rgba(13, 95, 104, 0.06); padding: 0.25rem 0.6rem; border-radius: 6px; border: 1px solid rgba(13, 95, 104, 0.1); letter-spacing: -0.01em; }

                /* Cell Layouts */
                .job-info { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
                .job-title { font-weight: 700; color: #1e293b; font-size: 0.88rem; line-height: 1.2; }
                .job-sub-info { font-size: 0.75rem; color: #64748b; font-weight: 500; }
                
                .panel-avatars { display: flex; align-items: center; justify-content: flex-start; padding-left: 8px; }
                .panel-avatar { width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; margin-left: -10px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: help; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .panel-avatar:first-child { margin-left: 0; }
                .panel-avatar:hover { transform: translateY(-4px) scale(1.1); z-index: 100 !important; box-shadow: 0 4px 6px rgba(0,0,0,0.15); }

                .date-info { display: flex; flex-direction: column; justify-content: center; gap: 4px; }
                .mode-badge { display: inline-flex; padding: 0.35rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.725rem; font-weight: 700; color: #475569; gap: 6px; align-items: center; white-space: nowrap; max-width: 125px; overflow: hidden; text-overflow: ellipsis; }

                /* Components */
                .badge-pill { padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.725rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem; text-transform: uppercase; letter-spacing: 0.04em; }
                .badge-dot { width: 6px; height: 6px; border-radius: 50%; }
                
                .action-button-group { display: flex; justify-content: flex-end; gap: 0.35rem; }
                .row-action { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; transition: all 0.2s; cursor: pointer; background: #f8fafc; border: 1px solid #f1f5f9; }
                .row-action:hover { border-color: #e2e8f0; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .row-action.view:hover { color: #3b82f6; background: #eff6ff; border-color: #dbeafe; }
                .row-action.edit:hover { color: #10b981; background: #f0fdf4; border-color: #dcfce7; }
                .row-action.delete:hover { color: #ef4444; background: #fef2f2; border-color: #fee2e2; }

                /* Pagination Footer - Fixed Alignment */
                .table-footer-ats { padding: 1rem 1.25rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: white; min-height: 64px; }
                .footer-left { font-size: 0.85rem; color: #64748b; font-weight: 500; display: flex; align-items: center; }
                .footer-left b { color: #1e293b; margin: 0 4px; }
                .footer-right { display: flex; align-items: center; gap: 1rem; }
                .page-numbers { display: flex; align-items: center; gap: 0.35rem; }
                .page-btn { height: 36px; padding: 0 1rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-size: 0.8rem; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .page-btn:not(.disabled):hover { border-color: #0d5f68; color: #0d5f68; background: #f0f9f9; }
                .page-btn.disabled { opacity: 0.5; cursor: not-allowed; background: #f8fafc; }
                .page-num { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-size: 0.8rem; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s; }
                .page-num.active { background: #0d5f68; color: white; border-color: #0d5f68; box-shadow: 0 2px 4px rgba(13, 95, 104, 0.2); }
                .page-num:not(.active):hover { border-color: #0d5f68; color: #0d5f68; }

                .empty-state-card { padding: 5rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; color: #64748b; }
                .empty-icon-container { width: 88px; height: 88px; border-radius: 24px; background: #f8fafc; color: #cbd5e1; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; border: 1px solid #f1f5f9; }
                .empty-state-card h3 { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 700; }
                .empty-state-card p { max-width: 320px; margin: 0.75rem 0 1.5rem; font-size: 0.9rem; line-height: 1.5; }

                .btn-primary { background: #0d5f68; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 10px; font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(13, 95, 104, 0.1); }
                .btn-primary:hover { background: #0b4e56; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(13, 95, 104, 0.25); }
                
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-entry { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* Responsiveness Settings */
                @media (max-width: 1200px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 768px) {
                    .dashboard-header { flex-direction: column; align-items: stretch; gap: 1rem; }
                    .header-actions .btn-primary { width: 100%; justify-content: center; }
                    .filter-search-container { padding: 1.25rem; flex-direction: column; align-items: stretch; }
                    .filter-actions { width: 100%; flex-direction: column; }
                    .filter-dropdown-group { width: 100%; flex-direction: column; }
                    .filter-dropdown-group select, .date-picker-input { width: 100%; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .employees-page { padding: 1rem; }
                    .table-header-info { flex-direction: column; align-items: flex-start; }
                }
                @media (max-width: 480px) {
                    .dashboard-header h1 { font-size: 1.1rem; }
                    .stat-card { padding: 0.75rem; }
                    .stat-count { font-size: 1.15rem; }
                    .count-chip { display: none; }
                }

                /* Feedback Modal Premium Styles */
                .feedback-modal-premium {
                    max-width: 440px !important;
                    height: auto !important;
                    background: white !important;
                    border-radius: 16px !important;
                    box-shadow: 0 25px 50px -12px rgba(13, 95, 104, 0.25) !important;
                    border: 1px solid rgba(13, 95, 104, 0.1) !important;
                }
                .feedback-header-premium {
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }
                .feedback-title-premium {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #0d5f68;
                    margin: 0;
                    letter-spacing: -0.01em;
                }
                .icon-btn-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    background: #f8fafc;
                    border: none;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .icon-btn-close:hover {
                    background: #fee2e2;
                    color: #ef4444;
                    transform: rotate(90deg);
                }
                .feedback-body-premium {
                    padding: 1.25rem 1.5rem;
                    position: relative;
                }
                .candidate-info-card-premium {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #f0fdfa;
                    border-radius: 12px;
                    border: 1px solid #ccfbf1;
                    margin-bottom: 1.25rem;
                }
                .candidate-avatar-large {
                    width: 44px;
                    height: 44px;
                    background: #0d5f68;
                    color: white;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    font-weight: 800;
                    box-shadow: 0 4px 10px rgba(13, 95, 104, 0.2);
                }
                .candidate-details-stack h3 {
                    margin: 0 0 0.25rem 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                }
                .round-badge-premium {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.2rem 0.6rem;
                    background: white;
                    border: 1px solid #0d5f68;
                    color: #0d5f68;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .position-text-small {
                    margin: 0.4rem 0 0 0;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .feedback-form-grid-premium {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                .form-group-premium label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #334155;
                    margin-bottom: 0.6rem;
                }
                .required-star { color: #ef4444; }
                .verdict-select-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                .form-group-premium select, .form-group-premium textarea {
                    width: 100%;
                    padding: 0.75rem 0.9rem;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 0.9rem;
                    color: #1e293b;
                    background: white;
                    transition: all 0.2s;
                    appearance: none;
                }
                .form-group-premium select:focus, .form-group-premium textarea:focus {
                    outline: none;
                    border-color: #0d5f68;
                    box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.1);
                }
                .form-group-premium select.error, .form-group-premium textarea.error {
                    border-color: #ef4444;
                    background: #fef2f2;
                }
                .select-icon-premium {
                    position: absolute;
                    right: 1rem;
                    pointer-events: none;
                    color: #64748b;
                }
                .form-group-premium textarea {
                    min-height: 100px;
                    resize: vertical;
                    line-height: 1.5;
                }
                .error-message-alt {
                    font-size: 0.75rem;
                    color: #ef4444;
                    font-weight: 600;
                    margin-top: 0.5rem;
                    display: block;
                }
                .feedback-footer-note {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: #fffbeb;
                    border-radius: 12px;
                    border: 1px solid #fef3c7;
                    color: #92400e;
                    font-size: 0.8rem;
                    line-height: 1.4;
                    font-weight: 600;
                }
                .feedback-footer-premium {
                    padding: 0.75rem 1.5rem 1.75rem 1.5rem;
                    display: flex;
                    gap: 0.75rem;
                }
                .btn-secondary-premium {
                    flex: 1;
                    padding: 0.75rem;
                    border-radius: 12px;
                    background: #f1f5f9;
                    border: 1.5px solid #e2e8f0;
                    color: #475569;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }
                .btn-secondary-premium:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }
                .btn-submit-premium {
                    flex: 2;
                    padding: 0.75rem;
                    border-radius: 12px;
                    background: #0d5f68;
                    border: none;
                    color: white;
                    font-weight: 700;
                    font-size: 0.85rem;
                    box-shadow: 0 8px 16px -6px rgba(13, 95, 104, 0.4);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-submit-premium:hover {
                    background: #0b4e56;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 20px -8px rgba(13, 95, 104, 0.5);
                }
                .btn-submit-premium:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .loading-overlay-premium {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(4px);
                    z-index: 50;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 16px;
                }
                .premium-spinner-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                .premium-spinner-container p {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #0d5f68;
                    margin: 0;
                }
                .premium-spinner-v2 {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #f1f5f9;
                    border-top-color: #0d5f68;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                /* Status Modal Premium Styles */
                .status-modal-premium {
                    max-width: 440px !important;
                    height: auto !important;
                    background: white !important;
                    border-radius: 16px !important;
                    box-shadow: 0 25px 50px -12px rgba(13, 95, 104, 0.25) !important;
                }
                .status-header-premium {
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }
                .status-header-title-premium {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #0d5f68;
                    margin: 0;
                    letter-spacing: -0.0125em;
                }
                .status-body-premium {
                    padding: 1.5rem;
                    position: relative;
                }
                .status-target-info-premium {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .status-target-badge-premium {
                    padding: 0.4rem 1rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    color: #1e293b;
                    font-weight: 700;
                    font-family: 'JetBrains Mono', monospace;
                }
                .status-form-group-premium {
                    margin-bottom: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .status-form-row-premium {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }
                .status-label-premium {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #0d5f68;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .status-label-premium.error { color: #ef4444; }
                .status-textarea-premium {
                    width: 100%;
                    min-height: 80px;
                    padding: 0.75rem;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 0.9rem;
                    color: #1e293b;
                    resize: vertical;
                    outline: none;
                    transition: all 0.2s;
                }
                .status-textarea-premium:focus {
                    border-color: #0d5f68;
                    box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.1);
                }
                .status-textarea-premium.error {
                    border-color: #ef4444;
                    background: #fef2f2;
                }
                .status-form-group-premium input, .status-form-group-premium select {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 0.9rem;
                    outline: none;
                    transition: all 0.2s;
                    background: white;
                }
                .status-form-group-premium select {
                    appearance: none;
                    -webkit-appearance: none;
                    padding-right: 2.5rem;
                    cursor: pointer;
                    color: #1e293b;
                    font-weight: 600;
                }
                .status-form-group-premium input:focus, .status-form-group-premium select:focus {
                    border-color: #0d5f68;
                    box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.1);
                }
                .status-form-group-premium input.error, .status-form-group-premium select.error {
                    border-color: #ef4444;
                    background: #fef2f2;
                }
                .status-error-msg-premium {
                    font-size: 0.7rem;
                    color: #ef4444;
                    font-weight: 700;
                    margin-top: 0.25rem;
                }
                .status-footer-premium {
                    padding: 0 1.5rem 2.25rem 1.5rem;
                    display: flex;
                    gap: 1rem;
                }
            `}</style>
        </div>
    );
};

export default Interview;