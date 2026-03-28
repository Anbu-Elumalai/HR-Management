import React, { useState } from 'react';
import {
    Plus, Eye, Edit, Trash2, X, RotateCcw,
    Users, MapPin, Monitor, Clock, Calendar,
    User, AlertCircle, ChevronLeft, ChevronRight,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Recruitment.css';
import api from '../../api/api';
import { candidateService } from '../../services/candidateService';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';

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
    // ── Filtering Effect ─────────────────────────────────────────────────────
    React.useEffect(() => {
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
        setLoading(true);
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
            setLoading(false);
        }
    };

    React.useEffect(() => { fetchInitialData(); }, []);

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
                                        {Array.isArray(candidates) && candidates.map(c => (
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
    if (loading && interviews.length === 0) { // Only show page-level spinner if first load
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

            <div className="page-header">
                <div>
                    <h1 className="page-title">Interview Management</h1>
                    <p className="page-description">Track, manage and schedule candidate assessment rounds</p>
                </div>
                <button className="btn-primary" onClick={() => { setSelectedInterview(null); setViewMode('create'); }}>
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Schedule New Interview</span>
                </button>
            </div>

            <div className="table-card" style={{ position: 'relative' }}>
                {loading && interviews.length > 0 && (
                    <div className="loading-overlay" style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.7)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(2px)',
                        transition: 'all 0.3s',
                        borderRadius: '0 0 16px 16px'
                    }}>
                        <div className="premium-spinner" style={{ width: '40px', height: '40px' }}>
                            <div className="premium-core"></div>
                        </div>
                    </div>
                )}
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr className="header-row">
                                <th>Interview ID</th>
                                <th>Candidate</th>
                                <th>Applied For</th>
                                <th>Round</th>
                                <th>Interviewer</th>
                                <th>Date & Time</th>
                                <th className="text-center">Type</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Feedback</th>
                                <th className="text-center">Actions</th>
                            </tr>
                            <tr className="filter-row">
                                <th><input type="text" className="inline-filter" placeholder="Filter ID" value={filters.interviewId} onChange={e => setFilters(prev => ({ ...prev, interviewId: e.target.value }))} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Filter Candidate" value={filters.candidate} onChange={e => setFilters(prev => ({ ...prev, candidate: e.target.value }))} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Filter Position" value={filters.position} onChange={e => setFilters(prev => ({ ...prev, position: e.target.value }))} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Filter Round" value={filters.round} onChange={e => setFilters(prev => ({ ...prev, round: e.target.value }))} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Filter Panelist" value={filters.interviewer} onChange={e => setFilters(prev => ({ ...prev, interviewer: e.target.value }))} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Filter Date" value={filters.date} onChange={e => setFilters(prev => ({ ...prev, date: e.target.value }))} /></th>
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="Type" value={filters.type} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))} /></th>
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="Status" value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} /></th>
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="Feedback" value={filters.feedback} onChange={e => setFilters(prev => ({ ...prev, feedback: e.target.value }))} /></th>
                                <th className="text-center">
                                    <button
                                        className="btn-reset-filters-roles"
                                        title="Clear Filters"
                                        onClick={() => setFilters({
                                            interviewId: '',
                                            candidate: '',
                                            position: '',
                                            round: '',
                                            interviewer: '',
                                            date: '',
                                            type: '',
                                            status: '',
                                            feedback: ''
                                        })}
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {interviews.map(interview => (
                                <tr key={interview.id}>
                                    <td>
                                        <span className="emp-id font-mono font-bold text-[#0d5f68]">
                                            {interview.interviewCode || 'PENDING'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="emp-profile">
                                            <div className="emp-avatar">
                                                {String(interview.candidateName || (typeof interview.candidate === 'object' ? interview.candidate?.name : interview.candidate) || 'C').charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="emp-name">
                                                    {interview.candidateName ||
                                                        (typeof interview.candidate === 'object' ? interview.candidate?.name : interview.candidate) ||
                                                        'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem' }}>
                                                {interview.appliedFor ||
                                                    interview.vacancyName ||
                                                    (typeof interview.vacancyId === 'object' ? interview.vacancyId?.positionName : interview.vacancyId) ||
                                                    'Position N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem' }}>
                                                {typeof interview.round === 'object' ? interview.round?.roundName : interview.round}
                                            </span>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#0d5f68', background: '#f0fdfa', padding: '1px 6px', borderRadius: '4px', width: 'fit-content', marginTop: '4px', textTransform: 'uppercase' }}>
                                                Level: {interview.level || 'L1'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', color: '#475569' }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }} title={interview.interviewers?.join(', ')}>
                                                {(() => {
                                                    const list = interview.interviewers || [];
                                                    if (list.length === 0) {
                                                        return interview.interviewerName || (typeof interview.interviewer === 'object' ? interview.interviewer?.name : interview.interviewer) || 'Not Assigned';
                                                    }
                                                    const names = list.map(i => (i && typeof i === 'object') ? i.interviewerName || i.name : (i || 'Pending'));
                                                    if (names.length <= 2) return names.join(', ');
                                                    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
                                                })()}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '700', color: '#334155', fontSize: '0.85rem' }}>
                                                {interview.scheduleDate ?
                                                    (typeof interview.scheduleDate === 'string' && interview.scheduleDate.includes('T') ? interview.scheduleDate.split('T')[0] : interview.scheduleDate) :
                                                    interview.date || 'TBA'}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', fontWeight: '500', marginTop: '2px' }}>
                                                <Clock size={10} /> {interview.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-badge ${interview.mode?.toLowerCase().includes('video') || interview.mode?.toLowerCase().includes('online') ? 'status-video' : 'status-onsite'}`}>
                                            {interview.mode?.toLowerCase().includes('video') || interview.mode?.toLowerCase().includes('online') ? <Monitor size={12} strokeWidth={2.5} /> : <MapPin size={12} strokeWidth={2.5} />}
                                            {interview.mode || 'Online'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span
                                            className={`status-badge ${interview.status === 'Scheduled' ? 'status-scheduled' : interview.status === 'Completed' ? 'status-completed' : interview.status === 'Cancelled' ? 'status-cancelled' : 'status-rescheduled'}`}
                                            onClick={() => handleStatusClick(interview)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {interview.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span
                                            className={`status-badge ${interview.feedback ? 'status-completed' : 'status-pending'}`}
                                            onClick={() => handleFeedbackClick(interview)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {interview.feedback ? 'View' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="actions-wrapper">
                                            <button className="action-btn view" title="View Details"
                                                onClick={() => { setSelectedInterview(interview); setViewMode('view'); }}><Eye size={18} /></button>
                                            <button className="action-btn edit" title="Edit Schedule"
                                                onClick={() => { setSelectedInterview(interview); setViewMode('edit'); }}><Edit size={18} /></button>
                                            <button className="action-btn delete" title="Cancel Interview"
                                                onClick={() => { setSelectedInterview(interview); setViewMode('delete'); }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {interviews.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-slate-400 italic">
                                        No interview schedules found in the database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="pagination">
                    <span className="pagination-info">Showing {interviews.length} of {totalItems} Schedule(s)</span>
                    <div className="pagination-controls">
                        <button
                            className={`page-btn ${page === 0 ? 'disabled' : ''}`}
                            onClick={() => page > 0 && fetchInterviews(page - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: totalPages }, (_, idx) => (
                            <button
                                key={idx}
                                className={`page-btn ${page === idx ? 'active' : ''}`}
                                onClick={() => fetchInterviews(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            className={`page-btn ${page >= totalPages - 1 ? 'disabled' : ''}`}
                            onClick={() => page < totalPages - 1 && fetchInterviews(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {showStatusModal && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="delete-header-premium">
                            <button className="icon-btn" onClick={() => setShowStatusModal(false)}><X size={18} /></button>
                        </div>
                        <div className="delete-body-premium" style={{ paddingTop: '0rem', position: 'relative' }}>
                            {submittingStatus && (
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
                                        <p className="premium-text" style={{ color: '#0d5f68', fontSize: '0.85rem' }}>Updating Status...</p>
                                    </div>
                                </div>
                            )}
                            <h2 className="delete-title-premium" style={{ fontSize: '1.25rem' }}>Update Status</h2>
                            <p className="delete-message-premium" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                Updating status for: <br />
                                <span className="delete-item-badge" style={{ marginTop: '0.5rem', background: '#f8fafc' }}>
                                    {statusInterview?.interviewCode || statusInterview?.id}
                                </span>
                            </p>
                            <div className="form-group" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                                <label className="reason-label">Select Interview Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNewStatus(val);
                                        setStatusModalErrors({}); // Reset errors when switching status
                                        if (val !== 'Rescheduled' && val !== 'Cancelled') setStatusReason('');
                                    }}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '0.4rem', fontSize: '0.9rem', fontWeight: '600', background: '#fcfcfd' }}
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rescheduled">Rescheduled</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Move to Offer">Move to Offer</option>
                                </select>
                            </div>

                            {(newStatus === 'Rescheduled' || newStatus === 'Cancelled') && (
                                <div className="reason-field">
                                    <label className="reason-label">
                                        {newStatus === 'Rescheduled' ? 'Reason for Reschedule' : 'Reason for Cancellation'}
                                    </label>
                                    <textarea
                                        className="reason-textarea"
                                        placeholder={`Please enter why this interview is being ${newStatus.toLowerCase()}...`}
                                        value={statusReason}
                                        onChange={(e) => {
                                            setStatusReason(e.target.value);
                                            if (e.target.value.trim()) setStatusModalErrors(prev => ({ ...prev, reason: false }));
                                        }}
                                        style={{ borderColor: statusModalErrors.reason ? '#ef4444' : '#e2e8f0' }}
                                    />
                                    {statusModalErrors.reason && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>Reason is required</p>}
                                </div>
                            )}

                            {newStatus === 'Rescheduled' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '1rem', textAlign: 'left' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="reason-label" style={{ color: statusModalErrors.date ? '#ef4444' : '' }}>New Date</label>
                                        <input
                                            type="date"
                                            value={statusDate}
                                            onChange={(e) => {
                                                setStatusDate(e.target.value);
                                                if (e.target.value) setStatusModalErrors(prev => ({ ...prev, date: false }));
                                            }}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid', borderColor: statusModalErrors.date ? '#ef4444' : '#e2e8f0', fontSize: '0.85rem' }}
                                        />
                                        {statusModalErrors.date && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>Choose Date</p>}
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="reason-label" style={{ color: statusModalErrors.time ? '#ef4444' : '' }}>New Time</label>
                                        <input
                                            type="time"
                                            value={statusTime}
                                            onChange={(e) => {
                                                setStatusTime(e.target.value);
                                                if (e.target.value) setStatusModalErrors(prev => ({ ...prev, time: false }));
                                            }}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid', borderColor: statusModalErrors.time ? '#ef4444' : '#e2e8f0', fontSize: '0.85rem' }}
                                        />
                                        {statusModalErrors.time && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>Choose Time</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="delete-footer-premium" style={{ borderTop: 'none', paddingBottom: '2.5rem' }}>
                            <button className="btn-cancel-premium" onClick={() => setShowStatusModal(false)} disabled={submittingStatus}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleStatusConfirm}
                                disabled={submittingStatus}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', justifyContent: 'center', background: '#0d5f68', boxShadow: '0 4px 12px rgba(13, 95, 104, 0.2)', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer', opacity: submittingStatus ? 0.7 : 1 }}
                            >
                                {submittingStatus ? 'Updating...' : 'Save Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFeedbackModal && (
                <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
                    <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="delete-header-premium">
                            <button className="icon-btn" onClick={() => setShowFeedbackModal(false)}><X size={18} /></button>
                        </div>
                        <div className="delete-body-premium" style={{ paddingTop: '0rem', position: 'relative' }}>
                            {submittingFeedback && (
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
                                        <p className="premium-text" style={{ color: '#0d5f68', fontSize: '0.85rem' }}>Saving Feedback...</p>
                                    </div>
                                </div>
                            )}
                            <div className="delete-icon-container" style={{ background: '#f0f9ff', color: '#0ea5e9', width: '60px', height: '60px', marginBottom: '1rem' }}>
                                <AlertCircle size={32} />
                            </div>
                            <h2 className="delete-title-premium" style={{ fontSize: '1.25rem' }}>Interview Feedback</h2>
                            <p className="delete-message-premium" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Candidate: <strong>{feedbackInterview?.candidateName}</strong><br />
                                Round: <strong>{typeof feedbackInterview?.round === 'object' ? feedbackInterview.round?.roundName : feedbackInterview?.round}</strong>
                            </p>

                            <div className="reason-field" style={{ marginBottom: '1rem' }}>
                                <label className="reason-label" style={{ color: feedbackErrors.interviewResult ? '#ef4444' : '' }}>Interview Result *</label>
                                <select
                                    value={interviewResult}
                                    onChange={(e) => {
                                        setInterviewResult(e.target.value);
                                        if (e.target.value) setFeedbackErrors(prev => ({ ...prev, interviewResult: false }));
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '10px',
                                        border: '1px solid',
                                        borderColor: feedbackErrors.interviewResult ? '#ef4444' : '#e2e8f0',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="" disabled>Select Result</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Passed">Passed</option>
                                    <option value="Failed">Failed</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Move to Offer">Move to Offer</option>
                                </select>
                                {feedbackErrors.interviewResult && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px', textAlign: 'left', fontWeight: 'bold' }}>Please select a result</p>}
                            </div>

                            <div className="reason-field" style={{ marginTop: '0' }}>
                                <label className="reason-label" style={{ color: feedbackErrors.feedback ? '#ef4444' : '' }}>Evaluation Notes *</label>
                                <textarea
                                    className="reason-textarea"
                                    placeholder="Enter your detailed feedback here..."
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    style={{
                                        minHeight: '150px',
                                        borderColor: feedbackErrors.feedback ? '#ef4444' : '#e2e8f0'
                                    }}
                                />
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>
                                    This feedback will be stored and used for the final selection process.
                                </p>
                            </div>
                        </div>
                        <div className="delete-footer-premium" style={{ borderTop: 'none', paddingTop: '0.5rem' }}>
                            <button className="btn-cancel-premium" onClick={() => setShowFeedbackModal(false)} disabled={submittingFeedback}>Close</button>
                            <button
                                className="btn-primary"
                                onClick={handleFeedbackConfirm}
                                disabled={submittingFeedback}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', justifyContent: 'center', background: '#0d5f68', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                            >
                                {submittingFeedback ? 'Saving...' : 'Save Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .employees-page { padding: 1.5rem; padding-top: 1rem; display: flex; flex-direction: column; gap: 1rem; height: calc(100vh - 60px); overflow: hidden; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
                .page-title { font-size: 1.5rem; font-weight: 700; color: white; letter-spacing: -0.02em; }
                .page-description { font-size: 0.75rem; color: rgba(255,255,255,0.6); font-weight: 500; }
                .btn-primary { background: #0d5f68; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .btn-primary:hover { background: #0b4e56; transform: translateY(-1px); }
                .table-card { background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; border-radius: 16px; display: flex; flex-direction: column; flex: 1; min-height: 0; }
                .table-wrapper { overflow-x: auto; overflow-y: auto; flex: 1; width: 100%; }
                .employee-table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
                .employee-table thead { position: sticky; top: 0; z-index: 20; background-color: #f8f9fb; }
                .employee-table th { padding: 0.75rem 1.25rem; color: #374151; font-weight: 700; font-size: 0.8rem; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: middle; }
                .filter-row th { padding: 0.5rem 1.25rem 1rem 1.25rem; background-color: #f8f9fb; border-bottom: 1px solid #e5e7eb; }
                .inline-filter { width: 100%; padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.85rem; outline: none; background: white; color: #4b5563; transition: border-color 0.2s; }
                .inline-filter:focus { border-color: #0d5f68; box-shadow: 0 0 0 2px rgba(13,95,104,0.1); }
                .btn-reset-filters-roles { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #e5e7eb; border-radius: 6px; color: #64748b; cursor: pointer; transition: all 0.2s; margin: 0 auto; }
                .employee-table td { padding: 0.85rem 1.25rem; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-size: 0.95rem; vertical-align: middle; }
                .employee-table tr:hover td { background-color: #f9fafb; }
                .emp-profile { display: flex; align-items: center; gap: 0.75rem; }
                .emp-avatar { width: 36px; height: 36px; background-color: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
                .emp-name { font-weight: 600; color: #111827; }
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; justify-content: center; min-width: 70px; transition: transform 0.2s, background-color 0.2s; }
                .status-badge:hover { transform: translateY(-1px); }
                .status-badge:active { transform: translateY(0); }
                .status-video { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
                .status-onsite { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
                .status-scheduled { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
                .status-completed { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
                .status-cancelled { background: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6; }
                .status-rescheduled { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
                .actions-wrapper { display: flex; gap: 0.5rem; }
                .action-btn { width: 30px; height: 30px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; }
                .action-btn:hover { background-color: #f3f4f6; }
                .action-btn.view { color: #3b82f6; }
                .action-btn.edit { color: #10b981; }
                .action-btn.delete { color: #ef4444; }
                .pagination { padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f3f4f6; background: white; }
                .pagination-info { font-size: 0.85rem; color: #6b7280; font-weight: 500; }
                .pagination-controls { display: flex; gap: 0.5rem; align-items: center; }
                .page-btn { min-width: 32px; height: 32px; padding: 0 0.4rem; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 0.85rem; cursor: pointer; color: #4b5563; transition: all 0.2s; }
                .page-btn.active { background-color: #0d5f68; color: white; border-color: #0d5f68; font-weight: 500; }
                .page-btn.disabled { opacity: 0.5; cursor: not-allowed; background-color: #f9fafb; color: #9ca3af; }
                .table-wrapper::-webkit-scrollbar { width: 6px; height: 6px; }
                .table-wrapper::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
                .status-badge-premium { padding: 0.4rem 0.75rem; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; justify-content: center; min-width: 90px; border: 1px solid transparent; }
                .delete-modal-content { max-width: 440px !important; height: auto !important; padding: 0 !important; overflow: hidden !important; }
                .delete-header-premium { padding: 1.5rem 1.5rem 0.5rem 1.5rem !important; display: flex; justify-content: flex-end; }
                .delete-body-premium { padding: 0 2.5rem 2rem 2.5rem !important; text-align: center; }
                .delete-icon-container { width: 80px; height: 80px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; color: #ef4444; }
                .delete-title-premium { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; }
                .delete-message-premium { font-size: 1rem; color: #64748b; line-height: 1.5; margin-bottom: 1.5rem; }
                .delete-item-badge { display: inline-block; padding: 0.4rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #334155; font-weight: 600; font-size: 0.9rem; }
                .delete-footer-premium { padding: 1.5rem 2.5rem 2.5rem !important; display: flex !important; gap: 1rem; }
                .btn-cancel-premium { flex: 1; padding: 0.8rem !important; border-radius: 12px !important; font-weight: 600 !important; background: #f1f5f9 !important; color: #475569 !important; border: 1px solid transparent !important; cursor: pointer; }
                .btn-delete-premium { flex: 1; padding: 0.8rem !important; border-radius: 12px !important; font-weight: 600 !important; color: white !important; border: none !important; cursor: pointer; }
                .text-center { text-align: center; }
                .font-mono { font-family: monospace; }
                .reason-field { margin-top: 1rem; text-align: left; }
                .reason-label { font-size: 0.8rem; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 0.4rem; display: block; }
                .reason-textarea { width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; resize: vertical; min-height: 80px; outline: none; transition: border-color 0.2s; }
                .reason-textarea:focus { border-color: #0d5f68; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .flex-col { flex-direction: column; }
                .gap-4 { gap: 1rem; }
                .h-full { height: 100%; }
                .w-12 { width: 3rem; }
                .h-12 { height: 3rem; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Interview;