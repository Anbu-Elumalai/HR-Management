import React, { useState } from 'react';
import {
    Plus, Eye, Edit, Trash2, X, RotateCcw,
    Users, MapPin, Monitor, Clock, Calendar,
    User, AlertCircle
} from 'lucide-react';
import './Recruitment.css';
import api from '../../api/api';
import { candidateService } from '../../services/candidateService';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';

// ─────────────────────────────────────────────────────────────────────────────
// PanelMemberCard — self-contained card for a single panel member
// ─────────────────────────────────────────────────────────────────────────────
const PANEL_ROLES = ['Lead Interviewer', 'Technical Expert', 'Observer', 'HR Representative'];
const INTERVIEWER_TYPES = ["Employee", "Admins Users"];

const PanelMemberCard = ({ index, member, employees, onChange, onRemove, showRemove }) => {
    const handleField = (field, value) => {
        let updated = { ...member, [field]: value };

        // Reset fields when interviewer type changes
        if (field === 'interviewerType') {
            updated = {
                ...updated,
                employeeId: '',
                interviewerName: '',
                interviewerEmail: '',
                department: '',
                panelRole: ''
            };
        }

        // Auto-fill logic when an employee is selected
        if (field === 'employeeId') {
            const emp = employees.find(e => String(e._id || e.id) === String(value));
            if (emp) {
                updated.interviewerName = emp.name || '';
                updated.interviewerEmail = emp.email || '';
                updated.department = emp.department?.name || emp.departmentName || '';
                
                // Auto-fetch Panel Role based on company role
                const sysRole = (emp.systemRole || emp.role?.name || '').toLowerCase();
                if (sysRole.includes('hr')) updated.panelRole = 'HR Representative';
                else if (sysRole.includes('tech') || sysRole.includes('employee')) updated.panelRole = 'Technical Expert';
                else if (sysRole.includes('admin') || sysRole.includes('manager')) updated.panelRole = 'Lead Interviewer';
                else updated.panelRole = 'Observer';
            }
        }

        onChange(index, updated);
    };

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
            border: '1.5px solid #e5e7eb', borderRadius: '12px',
            padding: '20px', marginBottom: '16px', backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s'
        }}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
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
                    <select value={member.interviewerType || ''} onChange={e => handleField('interviewerType', e.target.value)}>
                        <option value="" disabled>Select Type</option>
                        {INTERVIEWER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                    <label>Interviewer <span className="text-red-500">*</span></label>
                    <select
                        value={member.employeeId || ''}
                        onChange={e => handleField('employeeId', e.target.value)}
                        disabled={!member.interviewerType}
                        style={{ opacity: member.interviewerType ? 1 : 0.6 }}
                    >
                        <option value="">{member.interviewerType ? 'Select Interviewer' : 'Choose type first'}</option>
                        {filteredEmployees.map(emp => (
                            <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                    <label>Panel Role <span className="text-red-500">*</span></label>
                    <select value={member.panelRole || ''} onChange={e => handleField('panelRole', e.target.value)}>
                        <option value="" disabled>Select Role</option>
                        {PANEL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            {/* Row 2: Department (auto-fill) | Email (auto-fill) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                    <label>Department <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'normal' }}>(auto-fill)</span></label>
                    <input type="text" readOnly placeholder="Automatic" value={member.department || ''}
                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontStyle: 'italic' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label>Interviewer Email <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'normal' }}>(auto-fill)</span></label>
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
    const [loading, setLoading] = useState(false);

    // ── Panel Members State ──────────────────────────────────────────────────
    const [panelMembers, setPanelMembers] = useState([{ id: Date.now() }]);

    const addPanelMember = () => setPanelMembers(prev => [...prev, { id: Date.now() }]);
    const removePanelMember = (idx) => setPanelMembers(prev => prev.filter((_, i) => i !== idx));
    const updatePanelMember = (idx, updated) => setPanelMembers(prev => prev.map((m, i) => i === idx ? updated : m));
    // ────────────────────────────────────────────────────────────────────────

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [intRes, candRes, vacRes, empRes, deptRes, roundRes] = await Promise.all([
                api.get('/interviews').catch(() => ({ data: [] })),
                candidateService.getAllCandidates(0, 1000).catch(() => ({ data: [] })),
                api.get('/vacancies?approval=Approved&limit=1000').catch(() => ({ data: [] })),
                employeeService.getAllEmployees().catch(() => []),
                departmentService.getAllDepartments().catch(() => []),
                api.get('/interview-rounds').catch(() => ({ data: [] }))
            ]);
            setInterviews(Array.isArray(intRes.data?.data) ? intRes.data.data : (Array.isArray(intRes.data) ? intRes.data : []));
            setCandidates(candRes.data || []);
            setVacancies(vacRes.data?.data || []);
            setEmployees(empRes || []);
            setDepartments(deptRes || []);
            setInterviewRounds(roundRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { fetchInitialData(); }, []);

    const [formData, setFormData] = useState({
        candidateId: '', candidateName: '', vacancyId: '', vacancyName: '',
        date: '', time: '', round: 'Technical Round 1', level: 'Level 1 (Screening)',
        type: 'Online / Remote', duration: 60, interviewerId: '', interviewerName: '',
        location: '', status: 'Scheduled', email: '', phone: '', departmentId: ''
    });

    React.useEffect(() => {
        if (viewMode === 'edit' && selectedInterview) {
            setFormData({
                ...selectedInterview,
                candidateId: selectedInterview.candidateId || '',
                candidateName: selectedInterview.candidate || '',
                vacancyId: selectedInterview.vacancyId || '',
                vacancyName: selectedInterview.role || '',
                interviewerId: selectedInterview.interviewerId || '',
                interviewerName: selectedInterview.interviewer || ''
            });
            // Restore saved panel members on edit, else start with one blank card
            setPanelMembers(
                selectedInterview.panelMembers?.length
                    ? selectedInterview.panelMembers
                    : [{ id: Date.now() }]
            );
        } else if (viewMode === 'create') {
            setFormData({
                candidateId: '', candidateName: '', vacancyId: '', vacancyName: '',
                date: '', time: '', round: 'Technical Round 1', level: 'Level 1 (Screening)',
                type: 'Online / Remote', duration: 60, interviewerId: '', interviewerName: '',
                location: '', status: 'Scheduled', email: '', phone: '', departmentId: ''
            });
            setPanelMembers([{ id: Date.now() }]);
        }
    }, [viewMode, selectedInterview]);

    const handleCandidateChange = (e) => {
        const candidateId = e.target.value;
        const candidate = candidates.find(c => String(c._id || c.id) === String(candidateId));
        if (candidate) {
            setFormData(prev => ({
                ...prev,
                candidateId: candidate.id,
                candidateName: candidate.name,
                vacancyId: candidate.vacancyId || '',
                vacancyName: candidate.role || '',
                email: candidate.email || '',
                phone: candidate.phone || '',
                departmentId: candidate.departmentId || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, candidateId: '' }));
        }
    };

    const handleSubmit = async () => {
        try {
            // panelMembers is included in the payload
            const payload = { ...formData, panelMembers };
            if (viewMode === 'create') {
                await api.post('/interviews', payload);
                toast.success('Interview scheduled successfully!');
            } else {
                await api.put(`/interviews/${selectedInterview.id}`, payload);
                toast.success('Interview schedule updated!');
            }
            setViewMode('list');
            fetchInitialData();
        } catch (error) {
            console.error('Error saving interview:', error);
            toast.error('Failed to save interview schedule.');
        }
    };

    // ── renderInterviewForm ────────────────────────────────────────────────
    const renderInterviewForm = () => {
        const isEdit = viewMode === 'edit';
        const i = selectedInterview || {};

        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', height: '90vh' }}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">
                            {isEdit ? 'Edit Interview Schedule' : 'Schedule New Interview'}
                        </h2>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body">

                        {/* ── Section 1: Basic Information ───────────────────────────── */}
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Interview ID</label>
                                    <input type="text" placeholder="Auto-generated" value={i.id ? `INT-2024-00${i.id}` : 'INT-2024-004'} readOnly className="bg-gray-50" />
                                </div>
                                <div className="form-group">
                                    <label>Candidate <span className="text-red-500">*</span></label>
                                    <select value={formData.candidateId} onChange={handleCandidateChange}>
                                        <option value="" disabled>Select Candidate</option>
                                        {Array.isArray(candidates) && candidates.map(c => (
                                            <option key={c._id || c.id} value={c._id || c.id}>
                                                {c.candidateId ? `${c.candidateId} - ` : ''}{c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vacancy / Role <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.vacancyId}
                                        onChange={e => {
                                            const vac = vacancies.find(v => String(v._id || v.id) === String(e.target.value));
                                            setFormData({ ...formData, vacancyId: e.target.value, vacancyName: vac?.role || vac?.jobTitle || '' });
                                        }}
                                    >
                                        <option value="" disabled>Select Vacancy</option>
                                        {Array.isArray(vacancies) && vacancies.map(v => (
                                            <option key={v._id || v.id} value={v._id || v.id}>
                                                {v.requestNumber} - {v.position?.name || v.jobTitle || v.role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Interview Round</label>
                                    <select value={formData.round} onChange={e => setFormData({ ...formData, round: e.target.value })}>
                                        <option value="" disabled>Select Round</option>
                                        {interviewRounds.length > 0 ? (
                                            interviewRounds.map(r => <option key={r.id || r._id} value={r.name}>{r.name}</option>)
                                        ) : (
                                            <>
                                                <option>HR Round</option>
                                                <option>Technical Round 1</option>
                                                <option>Technical Round 2</option>
                                                <option>Managerial Round</option>
                                                <option>Final Interview</option>
                                                <option>Client Interview</option>
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
                                    <label>Interview Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Online / Remote</option>
                                        <option>Offline / In-Person</option>
                                        <option>Telephonic</option>
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
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Scheduled By</label>
                                    <select value={formData.scheduledBy || ''} onChange={e => setFormData({ ...formData, scheduledBy: e.target.value })}>
                                        <option value="">Select Scheduler</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ── Section 2: Logistics & Schedule ────────────────────────── */}
                        <div className="form-card">
                            <div className="form-card-title">Logistics & Schedule</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Scheduled Date <span className="text-red-500">*</span></label>
                                    <input type="date" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Scheduled Time <span className="text-red-500">*</span></label>
                                    <input type="time" value={formData.time || ''} onChange={e => setFormData({ ...formData, time: e.target.value })} />
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
                                    <label>Interview Mode</label>
                                    <select value={formData.mode || 'Video Call (Google Meet)'} onChange={e => setFormData({ ...formData, mode: e.target.value })}>
                                        <option>Video Call (Google Meet)</option>
                                        <option>Video Call (Zoom)</option>
                                        <option>In-Person Meeting</option>
                                        <option>Phone Call</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Interview Status</label>
                                    <select value={formData.status || 'Scheduled'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option>Scheduled</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                        <option>Rescheduled</option>
                                    </select>
                                </div>
                                {formData.mode !== 'In-Person Meeting' && (
                                    <>
                                        <div className="form-group">
                                            <label>Time Zone</label>
                                            <select value={formData.timezone || '(GMT+05:30) India Standard Time'} onChange={e => setFormData({ ...formData, timezone: e.target.value })}>
                                                <option>(GMT+05:30) India Standard Time</option>
                                                <option>(GMT+00:00) UTC</option>
                                                <option>(GMT-05:00) Eastern Time</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
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
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
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
                                    onChange={updatePanelMember}
                                    onRemove={removePanelMember}
                                    showRemove={panelMembers.length > 1}
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
                        <button className="btn-primary" onClick={handleSubmit}>
                            {isEdit ? 'Save Changes' : 'Confirm Schedule'}
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

                    <div className="form-body" style={{ overflowY: 'auto' }}>
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

                            {(i.panelMembers?.length ? i.panelMembers : []).map((m, idx) => (
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
                        <button className="icon-btn" onClick={() => { setViewMode('list'); setSelectedInterview(null); }}><X size={18} /></button>
                    </div>
                    <div className="delete-body-premium">
                        <div className="delete-icon-container"><Trash2 size={36} /></div>
                        <h2 className="delete-title-premium">Cancel Interview?</h2>
                        <p className="delete-message-premium">
                            Are you sure you want to permanently cancel and remove this interview schedule for <span className="font-bold text-slate-800">{i.candidate}</span>?
                        </p>
                        <div className="delete-item-badge">Ref: {i.id ? `INT-2024-00${i.id}` : 'INT-PENDING'}</div>
                    </div>
                    <div className="delete-footer-premium">
                        <button className="btn-cancel-premium" onClick={() => { setViewMode('list'); setSelectedInterview(null); }}>Keep Schedule</button>
                        <button className="btn-delete-premium" onClick={() => setViewMode('list')} style={{ background: '#ef4444' }}>Confirm Cancel</button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────
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

            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr className="header-row">
                                <th>Candidate</th>
                                <th>Round & Level</th>
                                <th>Interviewer</th>
                                <th>Date & Time</th>
                                <th className="text-center">Type</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                            <tr className="filter-row">
                                <th><input type="text" className="inline-filter" placeholder="Filter Candidate" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Filter Round" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Filter Panelist" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Filter Date" /></th>
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="Type" /></th>
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="Status" /></th>
                                <th className="text-center">
                                    <button className="btn-reset-filters-roles" title="Clear Filters"><RotateCcw size={16} /></button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {interviews.map(interview => (
                                <tr key={interview.id}>
                                    <td>
                                        <div className="emp-profile">
                                            <div className="emp-avatar">
                                                {(interview.candidateName || interview.candidate || 'C').charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="emp-name">{interview.candidateName || interview.candidate || 'Unknown'}</span>
                                                <span className="emp-id">ID: {interview.id ? `INT-2024-00${interview.id}` : 'PENDING'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-sm leading-tight mb-0.5">{interview.round}</span>
                                            <span className="text-[10px] font-black text-[#0d5f68] uppercase bg-teal-50 px-1.5 py-0.5 rounded-md w-fit">
                                                Level: {interview.level || 'L1'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#0d5f68]">
                                                {(interview.interviewerName || interview.interviewer || 'I').charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium">{interview.interviewerName || interview.interviewer || 'Not Assigned'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-sm tracking-tight">{interview.date}</span>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                                <Clock size={10} /> {interview.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-badge ${interview.type?.toLowerCase().includes('video') ? 'status-video' : 'status-onsite'}`}>
                                            {interview.type?.toLowerCase().includes('video') ? <Monitor size={12} strokeWidth={2.5} /> : <MapPin size={12} strokeWidth={2.5} />}
                                            {interview.type || 'Online'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-badge ${interview.status === 'Scheduled' ? 'status-scheduled' : interview.status === 'Completed' ? 'status-completed' : interview.status === 'Cancelled' ? 'status-cancelled' : 'status-rescheduled'}`}>
                                            {interview.status}
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
                    <span className="pagination-info">Showing {interviews.length} Schedule(s)</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled"><Clock size={14} /></button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn disabled"><Plus size={14} /></button>
                    </div>
                </div>
            </div>

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
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; justify-content: center; min-width: 70px; }
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
            `}</style>
        </div>
    );
};

export default Interview;