import React, { useState } from 'react';
import {
    Plus, Search, Eye, Edit, Trash2, X, RotateCcw,
    Users, MapPin, Monitor, Video, Clock, Calendar,
    User, Briefcase, Award, Globe, MessageSquare, AlertCircle,
    UserCheck, Mail, Phone
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
                        {/* Section 1: Basic Information */}
                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Interview ID</label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated"
                                        value={i.id ? `INT-2024-00${i.id}` : 'INT-2024-004'}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Candidate <span className="text-red-500">*</span></label>
                                    <select defaultValue={i.candidate || ""}>
                                        <option value="" disabled>Select Candidate</option>
                                        {mockCandidates.map(c => <option key={c.id} value={c.name}>{c.candidateId} - {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vacancy / Role</label>
                                    <input type="text" placeholder="Auto-fill from candidate" readOnly defaultValue={i.role || ""} className="bg-gray-50" />
                                </div>
                                <div className="form-group">
                                    <label>Interview Round</label>
                                    <select defaultValue={i.round || "Technical"}>
                                        <option>HR Round</option>
                                        <option>Technical Round 1</option>
                                        <option>Technical Round 2</option>
                                        <option>Managerial Round</option>
                                        <option>Final Interview</option>
                                        <option>Client Interview</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Round Number</label>
                                    <input type="number" defaultValue={1} min={1} />
                                </div>
                                <div className="form-group">
                                    <label>Interview Level</label>
                                    <select defaultValue={i.level || "L1"}>
                                        <option>Level 1 (Screening)</option>
                                        <option>Level 2 (Deep Dive)</option>
                                        <option>Level 3 (Architecture)</option>
                                        <option>Behavioral</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Interview Type</label>
                                    <select defaultValue={i.type || "Online"}>
                                        <option>Online / Remote</option>
                                        <option>Offline / In-Person</option>
                                        <option>Telephonic</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Candidate Email</label>
                                    <input type="text" placeholder="Auto-fill email" readOnly className="bg-gray-50" />
                                </div>
                                <div className="form-group">
                                    <label>Candidate Phone</label>
                                    <input type="text" placeholder="Auto-fill phone" readOnly className="bg-gray-50" />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Scheduled By</label>
                                    <select defaultValue="HR Manager">
                                        <option>HR Manager</option>
                                        <option>Recruitment Lead</option>
                                        <option>Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Logistics & Schedule */}
                        <div className="form-card">
                            <div className="form-card-title">Logistics & Schedule</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Scheduled Date <span className="text-red-500">*</span></label>
                                    <input type="date" defaultValue={i.date || ""} />
                                </div>
                                <div className="form-group">
                                    <label>Scheduled Time <span className="text-red-500">*</span></label>
                                    <input type="time" defaultValue={i.time || ""} />
                                </div>
                                <div className="form-group">
                                    <label>Duration (Minutes)</label>
                                    <select defaultValue={i.duration || 60}>
                                        <option value={30}>30 Minutes</option>
                                        <option value={45}>45 Minutes</option>
                                        <option value={60}>60 Minutes</option>
                                        <option value={90}>90 Minutes</option>
                                        <option value={120}>120 Minutes</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Interview Mode</label>
                                    <select defaultValue={i.mode || "Video"}>
                                        <option>Video Call (Google Meet)</option>
                                        <option>Video Call (Zoom)</option>
                                        <option>In-Person Meeting</option>
                                        <option>Phone Call</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Interview Status</label>
                                    <select defaultValue={i.status || "Scheduled"}>
                                        <option>Scheduled</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                        <option>Rescheduled</option>
                                    </select>
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
                                    <label>Interview Platform</label>
                                    <select defaultValue="Google Meet">
                                        <option>Google Meet</option>
                                        <option>Zoom</option>
                                        <option>Microsoft Teams</option>
                                        <option>WhatsApp Video</option>
                                        <option>Skype</option>
                                    </select>
                                </div>
                                {i.status === 'Rescheduled' && (
                                    <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                        <label>Reschedule Reason</label>
                                        <textarea rows="2" placeholder="Explain why the interview was rescheduled"></textarea>
                                    </div>
                                )}
                                {i.status === 'Cancelled' && (
                                    <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                        <label>Cancellation Reason</label>
                                        <textarea rows="2" placeholder="Explain why the interview was cancelled"></textarea>
                                    </div>
                                )}
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Location / Meeting Link</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Google Meet / Zoom URL or Office Room Address"
                                        defaultValue={i.location || ""}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Panel & Assessment</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Primary Interviewer</label>
                                    <input type="text" placeholder="Search primary interviewer..." defaultValue={i.interviewer || ""} />
                                </div>
                                <div className="form-group">
                                    <label>Secondary Interviewer</label>
                                    <input type="text" placeholder="Search secondary interviewer..." />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Department</label>
                                    <select defaultValue={i.department || "Engineering"}>
                                        <option>Engineering</option>
                                        <option>Human Resources</option>
                                        <option>Sales & Marketing</option>
                                        <option>Finance</option>
                                        <option>Operations</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Panel Instructions / Notes</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Add any specific focus areas or special instructions for the panel members..."
                                    ></textarea>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Candidate Instructions</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Add instructions for the candidate (e.g. preparation, dress code, docs to bring)"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Notifications & Integration */}
                        <div className="form-card">
                            <div className="form-card-title">Notifications & Integration</div>
                            <div className="flex flex-wrap gap-8 py-2 px-1">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                    <span className="text-sm font-semibold text-slate-700">Send Email to Candidate</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                    <span className="text-sm font-semibold text-slate-700">Send Email to Panel</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                    <span className="text-sm font-semibold text-slate-700">Add to Calendar</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-primary" onClick={() => setViewMode('list')}>
                            {isEdit ? 'Save Changes' : 'Confirm Schedule'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };


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
                        {/* Section 1: Overview */}
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
                                        <span className={`status-badge-premium ${i.status === 'Scheduled' ? 'status-scheduled' :
                                            i.status === 'Completed' ? 'status-completed' :
                                                i.status === 'Cancelled' ? 'status-cancelled' : 'status-rescheduled'
                                            }`}>
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

                        {/* Section 2: Logistics */}
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
                                            <a
                                                href={i.location}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] uppercase font-bold bg-blue-100 text-blue-600 px-2 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                                            >
                                                Launch Meet
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Panelists */}
                        <div className="form-card" style={{ marginTop: '1.5rem' }}>
                            <div className="form-card-title flex items-center gap-2">
                                <Users size={16} className="text-teal-600" /> Panelist Details
                            </div>
                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <label>Primary Interviewer</label>
                                    <div className="mt-1 font-bold text-slate-800">{i.interviewer || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Interviewer Department</label>
                                    <div className="mt-1 font-medium text-slate-600">{i.department || 'Engineering'}</div>
                                </div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Special Instructions for Panel</label>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm italic mt-1 leading-relaxed text-slate-500 relative">
                                        <AlertCircle size={14} className="absolute top-4 right-4 text-slate-300" />
                                        {i.notes || "Panel members should focus on core technical competencies and alignment with engineering principles. No specific remarks found."}
                                    </div>
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

    const renderDeleteModal = () => {
        const i = selectedInterview || {};
        return (
            <div className="modal-overlay" onClick={() => { setViewMode('list'); setSelectedInterview(null); }}>
                <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="delete-header-premium">
                        <button className="icon-btn" onClick={() => { setViewMode('list'); setSelectedInterview(null); }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="delete-body-premium">
                        <div className="delete-icon-container">
                            <Trash2 size={36} />
                        </div>
                        <h2 className="delete-title-premium">Cancel Interview?</h2>
                        <p className="delete-message-premium">
                            Are you sure you want to permanently cancel and remove this interview schedule for <span className="font-bold text-slate-800">{i.candidate}</span>?
                        </p>
                        <div className="delete-item-badge">
                            Ref: {i.id ? `INT-2024-00${i.id}` : 'INT-PENDING'}
                        </div>
                    </div>

                    <div className="delete-footer-premium">
                        <button
                            className="btn-cancel-premium"
                            onClick={() => { setViewMode('list'); setSelectedInterview(null); }}
                        >
                            Keep Schedule
                        </button>
                        <button
                            className="btn-delete-premium"
                            onClick={() => setViewMode('list')}
                            style={{ background: '#ef4444' }}
                        >
                            Confirm Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="employees-page">
            {(viewMode === 'create' || viewMode === 'edit') && renderInterviewForm()}
            {viewMode === 'view' && renderInterviewDetail()}
            {viewMode === 'delete' && renderDeleteModal()}

            <div className="page-header">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-white mb-1">Interview Management</h1>
                    <p className="text-xs text-white/60 font-medium">Track, manage and schedule candidate assessment rounds</p>
                </div>
                <button
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#0d5f68] rounded-xl font-bold text-sm shadow-xl shadow-teal-900/20 hover:scale-105 active:scale-95 transition-all"
                    onClick={() => { setSelectedInterview(null); setViewMode('create'); }}
                >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Schedule New Interview</span>
                </button>
            </div>

            <div className="table-card bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden rounded-2xl flex-1 flex flex-col">
                <div className="table-wrapper flex-1 overflow-auto">
                    <table className="employee-table w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 header-row">
                                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Candidate</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Round & Level</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Interviewer</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date & Time</th>
                                <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                                <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                <th className="px-10 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
                            </tr>
                            <tr className="bg-slate-50/50 filter-row">
                                <th className="px-4 py-2 border-b border-slate-100"><input type="text" className="inline-filter-premium" placeholder="Filter Candidate" /></th>
                                <th className="px-4 py-2 border-b border-slate-100"><input type="text" className="inline-filter-premium" placeholder="Filter Round" /></th>
                                <th className="px-4 py-2 border-b border-slate-100"><input type="text" className="inline-filter-premium" placeholder="Filter Panelist" /></th>
                                <th className="px-4 py-2 border-b border-slate-100"><input type="text" className="inline-filter-premium" placeholder="Filter Date" /></th>
                                <th className="px-4 py-2 border-b border-slate-100 text-center"><input type="text" className="inline-filter-premium text-center" placeholder="Type" /></th>
                                <th className="px-4 py-2 border-b border-slate-100 text-center"><input type="text" className="inline-filter-premium text-center" placeholder="Status" /></th>
                                <th className="px-4 py-2 border-b border-slate-100 text-center">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#0d5f68] transition-colors" title="Clear Filters"><RotateCcw size={16} /></button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {interviews.map(interview => (
                                <tr key={interview.id} className="hover:bg-slate-50/80 transition-colors group border-b border-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="emp-profile flex items-center gap-3">
                                            <div className="emp-avatar w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-100">
                                                {interview.candidate.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="emp-name font-bold text-slate-800 text-sm">{interview.candidate}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: INT-2024-00{interview.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-sm leading-tight mb-0.5">{interview.round}</span>
                                            <span className="text-[10px] font-black text-[#0d5f68] uppercase bg-teal-50 px-1.5 py-0.5 rounded-md w-fit">Level: {interview.level}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#0d5f68]">
                                                {interview.interviewer.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium">{interview.interviewer}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-sm tracking-tight">{interview.date}</span>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                                <Clock size={10} /> {interview.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider mx-auto ${interview.type === 'Video'
                                            ? 'bg-blue-50 border-blue-100 text-blue-600'
                                            : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                            }`}>
                                            {interview.type === 'Video' ? <Monitor size={12} strokeWidth={2.5} /> : <MapPin size={12} strokeWidth={2.5} />}
                                            {interview.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`status-badge-premium ${interview.status === 'Scheduled' ? 'status-scheduled' :
                                            interview.status === 'Completed' ? 'status-completed' :
                                                interview.status === 'Cancelled' ? 'status-cancelled' : 'status-rescheduled'
                                            }`}>
                                            {interview.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center"
                                                title="View Details"
                                                onClick={() => { setSelectedInterview(interview); setViewMode('view'); }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-[#0d5f68] transition-all flex items-center justify-center"
                                                title="Edit Schedule"
                                                onClick={() => { setSelectedInterview(interview); setViewMode('edit'); }}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                                                title="Cancel Interview"
                                                onClick={() => { setSelectedInterview(interview); setViewMode('delete'); }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing 2 Schedules in Database</span>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed"><Clock size={14} /></button>
                        <button className="w-8 h-8 rounded-lg bg-[#0d5f68] text-white flex items-center justify-center font-bold text-xs ring-4 ring-teal-900/10">1</button>
                        <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed"><Plus size={14} /></button>
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
