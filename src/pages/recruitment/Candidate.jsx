import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
    Users, Plus, Search, Filter, RefreshCcw,
    MoreVertical, Edit, Trash2, Mail, Phone,
    MapPin, Calendar, Briefcase, DollarSign,
    Link, Globe, Github, Linkedin, Award,
    User, CheckCircle, Clock, X, Eye, RotateCcw,
    ChevronDown, ChevronRight, Upload, FileText,
    Copy, Loader2, Download, AlertCircle, TrendingUp, TrendingDown, Check, ExternalLink, XCircle
} from 'lucide-react';
import './Recruitment.css';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/api';
import SearchableSelect from '../../components/common/SearchableSelect';
import MultiSelect from '../../components/common/MultiSelect';
import PhoneInput from '../../components/common/PhoneInput';
import { departmentService } from '../../services/departmentService';
import { positionService } from '../../services/positionService';
import { locationService } from '../../services/locationService';
import { candidateService } from '../../services/candidateService';

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
            <div className="stat-label-v6" style={{ fontSize: '0.65rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            {trend && (
                <div className={`stat-trend ${trend > 0 ? 'up' : 'down'}`} style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.65rem', fontWeight: '800', padding: '2px 6px', borderRadius: '20px', backgroundColor: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: trend > 0 ? '#10b981' : '#ef4444' }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
            )}
        </div>
    </div>
);

const Candidate = () => {
    const [viewMode, setViewMode] = useState('list');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Master Data State
    const [departments, setDepartments] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [allLocations, setAllLocations] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: '', vacancyId: '',
        departmentId: '', experience: '', noticePeriod: 'Immediate',
        status: 'New', source: '', currentCompany: '', currentLocation: '',
        currentCTC: '', expectedCTC: '', skills: [], remarks: '',
        linkedinUrl: '', portfolioUrl: '', githubUrl: '',
        highestQualification: '', availableToJoin: '', dob: '',
        gender: '', address: '', resumeFile: null, coverLetterFile: null, preferredLocation: []
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [dashboardStats, setDashboardStats] = useState({
        totalCandidates: { count: 0, trend: 0 },
        newApplicants: { count: 0, trend: 0 },
        shortlisted: { count: 0, trend: 0 },
        interviewing: { count: 0, trend: 0 },
        offered: { count: 0, trend: 0 },
        hired: { count: 0, trend: 0 },
        rejected: { count: 0, trend: 0 }
    });

    // Filtering & Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        status: '',
        experience: '',
        departmentId: ''
    });

    // Bulk selection
    const [selectedRows, setSelectedRows] = useState([]);

    const fetchData = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const [candRes, vacRes, posRes, deptRes, skillRes, locRes] = await Promise.all([
                candidateService.getAllCandidates(currentPage, itemsPerPage, filters),
                api.get('/vacancies?approval=Approved&limit=1000').catch(() => ({ data: [] })),
                positionService.getAllPositions().catch(() => []),
                departmentService.getAllDepartments().catch(() => []),
                api.get('/skills').catch(() => ({ data: { data: [] } })),
                locationService.getAllLocations().catch(() => [])
            ]);

            const fetched = candRes.data?.data || candRes.data || candRes || [];
            const safeCandidates = Array.isArray(fetched) ? fetched : [];
            setCandidates(safeCandidates);
            setTotalEntries(candRes.data?.total || safeCandidates.length);

            const rawVacs = (vacRes.data?.data) || (vacRes.data) || [];
            const rawSkills = (skillRes.data?.data) || (skillRes.data) || [];
            const rawDepts = (deptRes.data?.data) || (deptRes.data) || (Array.isArray(deptRes) ? deptRes : []);
            const rawPositions = (posRes.data?.data) || (posRes.data) || (Array.isArray(posRes) ? posRes : []);

            setVacancies(Array.isArray(rawVacs) ? rawVacs : []);
            setPositions(Array.isArray(rawPositions) ? rawPositions : []);
            setDepartments(Array.isArray(rawDepts) ? rawDepts.map(d => ({
                value: d._id || d.id,
                label: d.name || d.departmentName
            })) : []);
            setAllSkills(Array.isArray(rawSkills) ? rawSkills.map(s => ({
                value: s._id || s.id || s,
                label: s.name || s
            })) : []);
            setAllLocations(Array.isArray(locRes) ? locRes : []);
        } catch (error) {
            console.error("Critical error in fetchData:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
            setHasLoaded(true);
            setIsInitialLoading(false);
        }
    }, [currentPage, itemsPerPage, filters]);

    const fetchDashboardStats = useCallback(async () => {
        try {
            const res = await api.get('/candidates/dashboard/stats');
            const statsData = res.data?.data;
            if (statsData) {
                setDashboardStats({
                    totalCandidates: statsData.totalCandidates || { count: 0, trend: 0 },
                    newApplicants: statsData.newApplicants || { count: 0, trend: 0 },
                    shortlisted: statsData.shortlisted || { count: 0, trend: 0 },
                    interviewing: statsData.interviewing || { count: 0, trend: 0 },
                    offered: statsData.offered || { count: 0, trend: 0 },
                    hired: statsData.hired || { count: 0, trend: 0 },
                    rejected: statsData.rejected || { count: 0, trend: 0 }
                });
            }
        } catch (error) {
            console.error('Error fetching candidate dashboard stats:', error);
        }
    }, []);

    useEffect(() => {
        if (viewMode !== 'list') {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [viewMode]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(currentPage === 0 && !candidates.length);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(0);
    };

    const handleResetFilters = () => {
        setFilters({ search: '', role: '', status: '', experience: '', departmentId: '' });
        setCurrentPage(0);
    };

    const handleAddClick = () => {
        setFormData({
            name: '', email: '', phone: '', role: '', vacancyId: '',
            departmentId: '', experience: '', noticePeriod: 'Immediate',
            status: 'New', source: '', currentCompany: '', currentLocation: '',
            currentCTC: '', expectedCTC: '', skills: [], remarks: '',
            linkedinUrl: '', portfolioUrl: '', githubUrl: '',
            highestQualification: '', availableToJoin: '', dob: '',
            gender: '', address: '', resumeFile: null, coverLetterFile: null, preferredLocation: []
        });
        setFormErrors({});
        setViewMode('create');
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const up = { ...prev, [field]: value };
            if (field === 'vacancyId' && value) {
                const selectedVac = vacancies.find(v => (v._id || v.id) === value);
                if (selectedVac) {
                    if (selectedVac.position?.name) up.role = selectedVac.position.name;
                    if (selectedVac.departmentId) up.departmentId = selectedVac.departmentId;
                }
            }
            return up;
        });
        if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleViewDetails = async (c) => {
        setLoadingDetails(true);
        setSelectedCandidate(c);
        setViewMode('view');
        try {
            const res = await candidateService.getCandidateById(c._id || c.id);
            if (res.data?.data) setSelectedCandidate(res.data.data);
        } catch (error) {
            console.error("Detail fetch failed", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleEditClick = (c) => {
        const formatForDateInput = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
        let skillsArr = Array.isArray(c.skills) ? c.skills : (typeof c.skills === 'string' ? c.skills.split(',').map(s => s.trim()) : []);

        setSelectedCandidate(c);
        setFormData({
            ...c,
            skills: skillsArr,
            dob: formatForDateInput(c.dob),
            availableToJoin: formatForDateInput(c.availableToJoin)
        });
        setFormErrors({});
        setViewMode('edit');
    };

    const handleDelete = (candidate) => {
        setSelectedCandidate(candidate);
        setViewMode('delete');
    };

    const handleConfirmDelete = async () => {
        setSubmitting(true);
        try {
            await candidateService.deleteCandidate(selectedCandidate._id || selectedCandidate.id);
            toast.success('Candidate removed');
            fetchData();
            fetchDashboardStats();
            setViewMode('list');
        } catch (error) {
            toast.error('Deletion failed');
        } finally {
            setSubmitting(false);
            setSelectedCandidate(null);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const data = {
            ...formData,
            // Convert arrays to comma-separated strings for backend multi-ObjectId parsing
            skills: Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills,
            preferredLocation: Array.isArray(formData.preferredLocation) ? formData.preferredLocation.join(', ') : formData.preferredLocation,

            // Critical: Backend uses new ObjectId(id) - empty strings will cause 400 Error
            vacancyId: formData.vacancyId || null,
            departmentId: formData.departmentId || null,
            currentLocation: formData.currentLocation || null,

            // Clean up files and dates
            resumeFile: formData.resumeFile || null,
            resumeUrl: formData.resumeFile?.url || '',
            availableToJoin: formData.availableToJoin || null,
            dob: formData.dob || null
        };
        try {
            if (viewMode === 'edit') {
                await candidateService.updateCandidate(selectedCandidate._id || selectedCandidate.id, data);
                toast.success('Candidate updated');
            } else {
                await candidateService.createCandidate(data);
                toast.success('Candidate added');
            }
            setViewMode('list');
            fetchData();
            fetchDashboardStats();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = async (e, field = 'resumeFile') => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
            const res = await api.post('/common/upload?folder=recruitment', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
            });
            if (res.data?.data?.[0]) {
                setFormData(prev => ({ ...prev, [field]: res.data.data[0] }));
                toast.success(`${field === 'resumeFile' ? 'Resume' : 'Cover Letter'} uploaded`);
            }
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const getAvatarColor = (name) => {
        const colors = [
            { bg: '#eff6ff', text: '#2563eb' },
            { bg: '#f0fdf4', text: '#16a34a' },
            { bg: '#fff7ed', text: '#ea580c' },
            { bg: '#fdf4ff', text: '#a21caf' },
            { bg: '#fff1f2', text: '#e11d48' },
        ];
        const charCode = (String(name) || 'A').charCodeAt(0);
        return colors[charCode % colors.length];
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return String(name).split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getBadgeStyle = (status) => {
        const s = String(status || 'New').toLowerCase();
        if (s.includes('hired') || s.includes('accept')) return { bg: '#ecfdf5', color: '#059669', border: '#d1fae5' };
        if (s.includes('reject')) return { bg: '#fef2f2', color: '#dc2626', border: '#fee2e2' };
        if (s.includes('short')) return { bg: '#f0fdf4', color: '#16a34a', border: '#dcfce7' };
        if (s.includes('interview')) return { bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' };
        return { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' };
    };

    const stats = useMemo(() => [
        { label: 'Total Candidates', status: '', icon: <Users size={20} />, color: '#0d5f68', bg: 'rgba(13, 95, 104, 0.1)', ...dashboardStats.totalCandidates },
        { label: 'New Applicants', status: 'new', icon: <Clock size={20} />, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', ...dashboardStats.newApplicants },
        { label: 'Shortlisted', status: 'shortlisted', icon: <CheckCircle size={20} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', ...dashboardStats.shortlisted },
        { label: 'Interviewing', status: 'interviewing', icon: <Calendar size={20} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', ...dashboardStats.interviewing },
        { label: 'Offered', status: 'offered', icon: <FileText size={20} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', ...dashboardStats.offered },
        { label: 'Hired', status: 'hired', icon: <TrendingUp size={20} />, color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', ...dashboardStats.hired },
        { label: 'Rejected', status: 'rejected', icon: <XCircle size={20} />, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', ...dashboardStats.rejected },
    ], [dashboardStats]);

    const selectAllRows = (e) => {
        if (e.target.checked) setSelectedRows(candidates.map(c => c._id || c.id));
        else setSelectedRows([]);
    };

    const toggleRowSelection = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="candidate-page-premium">
            {/* Header */}
            <header className="premium-header animate-entry">
                <h1><Users size={24} /> Candidate Management</h1>
                <div className="header-btns" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button className="btn-secondary-outline" onClick={() => toast.success('Export initiated...')}><Download size={18} /> Export List</button>
                    <button className="btn-primary" onClick={handleAddClick}><Plus size={18} /> Add Candidate</button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-scroller-v6" style={{ marginBottom: '1.25rem' }}>
                <div className="stats-container-v6">
                    {stats.map((s, i) => (
                        <StatCard
                            key={i}
                            {...s}
                            count={s.status === '' ? totalEntries : candidates.filter(c => String(c.status || '').toLowerCase().includes(s.status)).length}
                            active={filters.status?.toLowerCase() === s.status}
                            onClick={() => handleFilterChange('status', s.status === '' ? '' : s.status.charAt(0).toUpperCase() + s.status.slice(1))}
                        />
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-search-container">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search candidates by name, email, or role..."
                        value={filters.search}
                        onChange={e => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <select value={filters.departmentId} onChange={e => handleFilterChange('departmentId', e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <select value={filters.role} onChange={e => handleFilterChange('role', e.target.value)}>
                    <option value="">All Roles</option>
                    {positions.map(p => <option key={p.id || p.value} value={p.label || p.name}>{p.label || p.name}</option>)}
                </select>
                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                    <option value="">Status</option>
                    <option>New</option>
                    <option>Shortlisted</option>
                    <option>Interview Scheduled</option>
                    <option>Interviewed</option>
                    <option>Offered</option>
                    <option>Hired</option>
                    <option>Rejected</option>
                </select>
                <button className="btn-icon-alt" onClick={handleResetFilters} title="Reset Filters">
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Candidate List Table Section */}
            {isInitialLoading ? (
                <div className="table-container-premium shadow-premium" style={{ height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '16px' }}>
                    <div className="flex flex-col items-center gap-4">
                        <div className="premium-spinner" style={{ width: '48px', height: '48px' }}>
                            <div className="premium-core"></div>
                        </div>
                        <p style={{ color: '#0d5f68', fontWeight: '600', fontSize: '0.9rem' }}>Fetching candidates data...</p>
                    </div>
                </div>
            ) : candidates.length === 0 && hasLoaded && !loading ? (
                <EmptyState
                    cardTitle="Candidates List"
                    totalCount={0}
                    icon={Users}
                    title="No candidates found"
                    description=""
                    buttonLabel="Add Candidate"
                    onCreate={handleAddClick}
                />
            ) : (
                <div className="table-container-premium shadow-premium">
                    <div className="table-header-info">
                        <div className="header-info-left">
                            <h3>Candidates List</h3>
                            <span className="count-chip">{totalEntries} Total</span>
                        </div>
                        <div className="header-info-right text-xs text-slate-500 font-medium">
                            Showing {candidates.length} entries
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="ats-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px', paddingLeft: '1.5rem' }}><input type="checkbox" onChange={selectAllRows} checked={candidates.length > 0 && selectedRows.length === candidates.length} /></th>
                                    <th style={{ width: '140px' }}>CODE</th>
                                    <th style={{ width: '280px' }}>CANDIDATE NAME & ROLE</th>
                                    <th style={{ width: '220px' }}>EMAIL ADDRESS</th>
                                    <th style={{ width: '120px' }}>EXPERIENCE</th>
                                    <th style={{ width: '150px' }}>APPLIED DATE</th>
                                    <th style={{ width: '130px' }}>STATUS</th>
                                    <th style={{ width: '120px', textAlign: 'right', paddingRight: '1.5rem' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '100px 0' }}><div className="p-list-loader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#64748b' }}><Loader2 className="animate-spin text-[#0d5f68]" size={40} /><p className="font-semibold">Loading candidates...</p></div></td></tr>
                                ) : (
                                    (candidates || []).map(c => {
                                        const styles = getBadgeStyle(c.status);
                                        const avCol = getAvatarColor(c.name);
                                        return (
                                            <tr key={c._id || c.id}>
                                                <td style={{ textAlign: 'center' }}><input type="checkbox" checked={selectedRows.includes(c._id || c.id)} onChange={() => toggleRowSelection(c._id || c.id)} /></td>
                                                <td><span style={{ color: '#0d5f68', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.02em' }}>{c.candidateCode || (c._id || c.id || '').substring(0, 8).toUpperCase()}</span></td>
                                                <td>
                                                    <div className="user-info-flex">
                                                        <div className="avtr" style={{ background: avCol.bg, color: avCol.text, border: 'none', width: '34px', height: '34px', fontSize: '0.8rem' }}>{getInitials(c.name)}</div>
                                                        <div className="txt">
                                                            <span style={{ fontSize: '0.95rem', fontWeight: '750', color: '#1e293b' }}>{c.name}</span>
                                                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '500' }}>{c.role || 'Unassigned'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ color: '#475569', fontSize: '0.88rem' }}>{c.email || 'N/A'}</td>
                                                <td style={{ color: '#475569', fontSize: '0.88rem', fontWeight: '500' }}>{c.experience || 'Not specified'}</td>
                                                <td style={{ color: '#475569', fontSize: '0.88rem' }}>{c.appliedDate ? new Date(c.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                                                <td>
                                                    <span style={{
                                                        backgroundColor: styles.bg,
                                                        color: styles.text,
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        display: 'inline-block',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="act-group">
                                                        <button className="act-row-btn" onClick={() => handleViewDetails(c)}><Eye size={17} /></button>
                                                        <button className="act-row-btn" onClick={() => handleEditClick(c)}><Edit size={17} /></button>
                                                        <button className="act-row-btn" onClick={() => handleDelete(c)}><Trash2 size={17} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="footer-paging">
                        <span className="pg-count">Showing <b>{candidates.length}</b> of <b>{totalEntries}</b> results</span>
                        <div className="pg-btns">
                            <button className="pg-nav-btn" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                            <button className="pg-nav-btn active">1</button>
                            <button className="pg-nav-btn" disabled={currentPage >= Math.ceil(totalEntries / itemsPerPage) - 1} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {viewMode === 'delete' && (
                <div className="modal-overlay" onClick={() => setViewMode('list')}>
                    <div className="modal-content mini-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '30px', textAlign: 'center' }}>
                            <div style={{ color: '#ef4444', marginBottom: '20px' }}><Trash2 size={48} className="mx-auto" /></div>
                            <h3 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>Delete Candidate?</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>Are you sure you want to remove <b>{selectedCandidate?.name}</b> permanently? This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button className="btn-secondary" style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontWeight: '700', display: 'flex', justifyContent: 'center' }} onClick={() => setViewMode('list')}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontWeight: '700', backgroundColor: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'center' }} onClick={handleConfirmDelete} disabled={submitting}>Delete Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
                <div className="modal-overlay" onClick={() => setViewMode('list')}>
                    <div className="modal-content" style={{ maxWidth: '1000px', height: '90vh' }} onClick={e => e.stopPropagation()}>
                        <div className="form-header">
                            <h2 className="text-xl font-bold text-white">{viewMode === 'edit' ? 'Edit Candidate Profile' : 'Add New Candidate'}</h2>
                            <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                        </div>
                        <div className="form-body" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
                            {/* Section 1: Personal Information */}
                            <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                                <div className="form-card-title">Personal Information</div>
                                <div className="modal-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" placeholder="John Doe" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <PhoneInput value={formData.phone} onChange={v => handleInputChange('phone', v)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input type="date" value={formData.dob ? String(formData.dob).split('T')[0] : ''} onChange={e => handleInputChange('dob', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                        <label>Full Address</label>
                                        <input type="text" placeholder="Street, City, State, ZIP" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Professional & Career */}
                            <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                                <div className="form-card-title">Professional & Career Details</div>
                                <div className="modal-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                                    <div className="form-group">
                                        <label>Current Company</label>
                                        <input type="text" placeholder="Previous Corp" value={formData.currentCompany} onChange={e => handleInputChange('currentCompany', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Current CTC (LPA)</label>
                                        <input type="number" placeholder="0.00" value={formData.currentCTC} onChange={e => handleInputChange('currentCTC', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Expected CTC (LPA)</label>
                                        <input type="number" placeholder="0.00" value={formData.expectedCTC} onChange={e => handleInputChange('expectedCTC', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Notice Period</label>
                                        <select value={formData.noticePeriod} onChange={e => handleInputChange('noticePeriod', e.target.value)}>
                                            <option value="Immediate">Immediate</option>
                                            <option value="15 Days">15 Days</option>
                                            <option value="30 Days">30 Days</option>
                                            <option value="60 Days">60 Days</option>
                                            <option value="90 Days">90 Days</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Highest Qualification</label>
                                        <input type="text" placeholder="Masters in CS" value={formData.highestQualification} onChange={e => handleInputChange('highestQualification', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Available to Join</label>
                                        <input type="date" value={formData.availableToJoin ? String(formData.availableToJoin).split('T')[0] : ''} onChange={e => handleInputChange('availableToJoin', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Current Location</label>
                                        <SearchableSelect
                                            options={allLocations}
                                            value={formData.currentLocation}
                                            onChange={v => handleInputChange('currentLocation', v)}
                                            placeholder="Select current city"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Application Details */}
                            <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                                <div className="form-card-title">Application Details</div>
                                <div className="modal-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                                    <div className="form-group">
                                        <label>Applied Role</label>
                                        <input type="text" placeholder="Senior Developer" value={formData.role} onChange={e => handleInputChange('role', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Experience (Years)</label>
                                        <input type="number" value={formData.experience} onChange={e => handleInputChange('experience', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Vacancy Reference</label>
                                        <SearchableSelect
                                            options={vacancies.map(v => ({ value: v._id || v.id, label: v.requestNumber ? `${v.requestNumber} - ${v.positionName || v.position?.name || 'Vacancy'}` : (v.positionName || v.position?.name || 'Vacancy') }))}
                                            value={formData.vacancyId}
                                            onChange={v => handleInputChange('vacancyId', v)}
                                            placeholder="Select Vacancy"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <SearchableSelect
                                            options={departments}
                                            value={formData.departmentId}
                                            onChange={v => handleInputChange('departmentId', v)}
                                            placeholder="Select Dept"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Lead Source</label>
                                        <select value={formData.source} onChange={e => handleInputChange('source', e.target.value)}>
                                            <option value="">Select Source</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Portal">Job Portal</option>
                                            <option value="Referral">Referral</option>
                                            <option value="Website">Company Website</option>
                                            <option value="SocialMedia">Social Media</option>
                                            <option value="Consultant">Consultant</option>
                                            <option value="Direct">Direct / Walk-in</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Application Status</label>
                                        <select value={formData.status} onChange={e => handleInputChange('status', e.target.value)}>
                                            <option>New</option>
                                            <option>Shortlisted</option>
                                            <option>Interview Scheduled</option>
                                            <option>Interviewed</option>
                                            <option>Offered</option>
                                            <option>Hired</option>
                                            <option>Rejected</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Preferred Working Locations</label>
                                        <MultiSelect
                                            options={allLocations}
                                            value={formData.preferredLocation || []}
                                            onChange={v => handleInputChange('preferredLocation', v)}
                                            placeholder="Select Cities"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Skills & Social */}
                            <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                                <div className="form-card-title">Skills & Professional Links</div>
                                <div className="modal-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                                    <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                        <label>Core Skills</label>
                                        <MultiSelect
                                            options={allSkills}
                                            value={formData.skills || []}
                                            onChange={v => handleInputChange('skills', v)}
                                            placeholder="Select technical skills"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>LinkedIn URL</label>
                                        <input type="url" placeholder="https://linkedin.com/in/..." value={formData.linkedinUrl} onChange={e => handleInputChange('linkedinUrl', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>GitHub Profile</label>
                                        <input type="url" placeholder="https://github.com/..." value={formData.githubUrl} onChange={e => handleInputChange('githubUrl', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Portfolio Link</label>
                                        <input type="url" placeholder="https://portfolio.me" value={formData.portfolioUrl} onChange={e => handleInputChange('portfolioUrl', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        {/* Removed redundant Lead Source dropdown */}
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Documents & Attachments */}
                            <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                                <div className="form-card-title">Documents & Attachments</div>
                                <div className="modal-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Resume / CV</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1.5px dashed #e2e8f0' }}>
                                            <FileText size={24} style={{ color: '#0d5f68' }} />
                                            <div style={{ flex: 1 }}>
                                                <input type="file" id="resume" hidden onChange={(e) => handleFileChange(e, 'resumeFile')} />
                                                <label htmlFor="resume" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0d5f68', cursor: 'pointer', textTransform: 'uppercase' }}>
                                                    {uploading ? 'Processing File...' : (formData.resumeFile ? 'Change Resume' : 'Choose Resume')}
                                                </label>
                                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>PDF, DOCX accepted (Max 5MB)</span>
                                            </div>
                                            {formData.resumeFile && <CheckCircle size={20} style={{ color: '#10b981' }} />}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Cover Letter</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1.5px dashed #e2e8f0' }}>
                                            <FileText size={24} style={{ color: '#0d5f68' }} />
                                            <div style={{ flex: 1 }}>
                                                <input type="file" id="cover" hidden onChange={(e) => handleFileChange(e, 'coverLetterFile')} />
                                                <label htmlFor="cover" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0d5f68', cursor: 'pointer', textTransform: 'uppercase' }}>
                                                    {uploading ? 'Processing File...' : (formData.coverLetterFile ? 'Change Cover' : 'Choose Cover')}
                                                </label>
                                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>PDF, DOCX accepted (Max 5MB)</span>
                                            </div>
                                            {formData.coverLetterFile && <CheckCircle size={20} style={{ color: '#10b981' }} />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 6: Additional Remarks */}
                            <div className="form-card">
                                <div className="form-card-title">Internal Remarks & Notes</div>
                                <div className="form-group">
                                    <textarea rows="4" placeholder="Additional notes about the candidate, interview scheduling preferences, or initial evaluation feedback..." value={formData.remarks} onChange={e => handleInputChange('remarks', e.target.value)}></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="form-footer">
                            <button className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                            <button className="btn-primary" onClick={handleSubmit} disabled={submitting || uploading}>
                                {submitting ? 'Processing...' : (viewMode === 'edit' ? 'Update Profile' : 'Create Candidate')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'view' && selectedCandidate && (
                <div className="modal-overlay" onClick={() => setViewMode('list')}>
                    <div className="modal-content" style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
                        <div className="form-header">
                            <h2 className="text-xl font-bold text-white">Candidate Profile Details</h2>
                            <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                        </div>

                        <div className="form-body">
                            <div className="form-card">
                                <div className="form-card-title">Basic Information</div>
                                <div className="modal-info-grid">
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        <div>{selectedCandidate.name}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Email ID</label>
                                        <div>{selectedCandidate.email}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone Number</label>
                                        <div>{selectedCandidate.phone}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Applied Role</label>
                                        <div>{selectedCandidate.role}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Status</label>
                                        <div>
                                            <span className="st-badge" style={{
                                                backgroundColor: getBadgeStyle(selectedCandidate.status).bg,
                                                color: getBadgeStyle(selectedCandidate.status).text,
                                                borderColor: getBadgeStyle(selectedCandidate.status).border
                                            }}>
                                                {selectedCandidate.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Experience</label>
                                        <div>{selectedCandidate.experience} Years</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Candidate Code</label>
                                        <div style={{ fontFamily: 'monospace', color: '#0d5f68', fontWeight: 'bold' }}>{selectedCandidate.candidateCode || 'N/A'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Applied Date</label>
                                        <div>{new Date(selectedCandidate.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            {selectedCandidate.remarks && (
                                <div className="form-card">
                                    <div className="form-card-title">Additional Remarks</div>
                                    <div className="jd-content" style={{ whiteSpace: 'pre-wrap', minHeight: '60px', fontSize: '0.9rem', color: '#334155', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                        {selectedCandidate.remarks}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-footer">
                            <button className="btn-secondary" onClick={() => setViewMode('list')}>Close</button>
                            <button className="btn-primary" onClick={() => handleEditClick(selectedCandidate)}>Edit Profile</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .candidate-page-premium { padding: 1.5rem 2rem; background: #f8fafc; height: calc(100vh - 64px); overflow: hidden; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; gap: 0.5rem; }
                .premium-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-shrink: 0; }
                .premium-header h1 { font-size: 1.6rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 0.75rem; }
                
                .btn-primary { background: #0d5f68; color: white !important; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(13, 95, 104, 0.2); }
                .btn-primary:hover { background: #084d54; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(13, 95, 104, 0.3); }
                
                .btn-secondary-outline { background: white; color: #475569; border: 1px solid #e2e8f0; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .btn-secondary-outline:hover { border-color: #0d5f68; color: #0d5f68; background: #f8fafc; }
                
                .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card-mini { background: white; padding: 1.25rem; border-radius: 16px; display: flex; align-items: center; gap: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.25s ease; cursor: default; }
                .stat-card-mini:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #0d5f6833; }
                .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
                .stat-info { display: flex; flex-direction: column; }
                .sc-val { font-size: 1.4rem; font-weight: 800; color: #1e293b; }
                .sc-label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-top: 2px; }

                /* New Premium Stats */
                .stats-scroller-v6 { overflow-x: auto; padding: 0.5rem 0.5rem 1.25rem 0.5rem; margin: 0 -0.5rem; flex-shrink: 0; }
                .stats-scroller-v6::-webkit-scrollbar { height: 4px; }
                .stats-scroller-v6::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .stats-container-v6 { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.75rem; width: 100%; }
                
                .stat-card-premium { background: white; padding: 0.85rem 1rem; border-radius: 14px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-width: 0; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
                .stat-card-premium:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .stat-card-premium.active { border-color: var(--accent); background: linear-gradient(to bottom right, white, var(--accent-bg)); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform: translateY(-1px); }
                .stat-card-premium.active::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); }
                
                .stat-main { display: flex; align-items: center; gap: 0.75rem; }
                .stat-icon-v6 { width: 34px; height: 34px; border-radius: 8px; background: var(--accent-bg); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .stat-icon-v6 svg { width: 16px; height: 16px; }
                .stat-content-v6 { display: flex; flex-direction: column; gap: 1px; }
                .stat-label-v6 { font-size: 0.625rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-value-group { display: flex; align-items: baseline; gap: 0.5rem; }
                .stat-count-v6 { font-size: 1.5rem; font-weight: 900; color: #0f172a; line-height: 1; }
                
                .stat-trend { display: flex; align-items: center; gap: 2px; font-size: 0.6rem; font-weight: 700; padding: 1px 5px; border-radius: 20px; }
                .stat-trend.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                .stat-trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                
                .stat-indicator { color: #cbd5e1; transition: transform 0.2s; }
                .stat-card-premium:hover .stat-indicator { transform: translateX(3px); color: var(--accent); }

                /* Premium Filter Bar - Vacancy Style */
                .filter-search-container { background: white; padding: 0.65rem 1rem; border-radius: 12px; display: flex; gap: 0.75rem; align-items: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.03); flex-shrink: 0; margin-bottom: 1rem; }
                .search-wrapper { flex: 1; position: relative; display: flex; align-items: center; }
                .search-icon { position: absolute; left: 0.85rem; color: #94a3b8; top: 50%; transform: translateY(-50%); pointer-events: none; }
                .search-wrapper input { width: 100%; height: 40px; padding: 0 1rem 0 2.5rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; font-size: 0.875rem; outline: none; transition: all 0.2s; }
                .search-wrapper input:focus { border-color: #0d5f68; background: white; box-shadow: 0 0 0 3px rgba(13, 95, 104, 0.1); }
                
                .filter-search-container select { height: 40px; padding: 0 2.5rem 0 1rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.875rem; font-weight: 600; cursor: pointer; outline: none; transition: all 0.2s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; min-width: 140px; }
                .filter-search-container select:hover { border-color: #cbd5e1; }
                .filter-search-container select:focus { border-color: #0d5f68; background-color: white; box-shadow: 0 0 0 3px rgba(13, 95, 104, 0.1); }
                
                .btn-icon-alt { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
                .btn-icon-alt:hover { border-color: #0d5f68; color: #0d5f68; background: white; }

                .table-container-premium { background: white; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; flex: 1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); width: 100%; position: relative; margin-top: 0.5rem; }
                .table-header-info { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: white; flex-wrap: wrap; gap: 0.75rem; flex-shrink: 0; }
                .header-info-left { display: flex; align-items: center; gap: 0.75rem; }
                .header-info-left h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #1e293b; letter-spacing: -0.0125em; }
                .count-chip { background: #f1f5f9; color: #64748b; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; border: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.025em; }
                
                .table-responsive { overflow-x: auto; overflow-y: auto; flex: 1; position: relative; }
                .cand-table { width: 100%; border-collapse: collapse; min-width: 1000px; table-layout: auto; }
                .cand-table th, .ats-table th { background: #f8fafc; padding: 1.1rem 1.25rem; text-align: left; font-size: 0.72rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #f1f5f9; }
                .cand-table td, .ats-table td { padding: 1.1rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: all 0.2s; }
                .ats-table tr:hover { background-color: #f8fafc; }

                .user-info-flex { display: flex; align-items: center; gap: 1rem; }
                .avtr { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #0d5f68; border: 1px solid #e2e8f0; flex-shrink: 0; transition: all 0.2s; }
                .txt { display: flex; flex-direction: column; gap: 3px; }
                .st-badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; display: inline-flex; align-items: center; gap: 0.6rem; border: 1px solid transparent; }
                .dot { width: 6px; height: 6px; border-radius: 50%; }

                .act-group { display: flex; gap: 0.4rem; justify-content: flex-end; }
                .act-row-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .act-row-btn:hover { color: #0d5f68; background: #e2e8f066; }

                .footer-paging { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: white; }
                .pg-count { font-size: 0.85rem; color: #64748b; }
                .pg-btns { display: flex; gap: 0.5rem; }
                .pg-nav-btn { padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.85rem; font-weight: 600; background: white; cursor: pointer; }
                .pg-nav-btn.active { background: #0d5f68; color: white; border-color: #0d5f68; }
                .pg-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.3s ease; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .modal-content { background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .large-modal { width: 90%; max-width: 700px; }
                .mini-modal { width: 400px; }
                .modal-hd { background: #0d4d4d; padding: 1.25rem 1.5rem; color: white; display: flex; justify-content: space-between; align-items: center; }
                .modal-hd h2 { font-size: 1.2rem; margin: 0; font-weight: 700; }
                .cls-btn { background: transparent; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.7; transition: opacity 0.2s; }
                .cls-btn:hover { opacity: 1; }
                .modal-bd { padding: 1.5rem; background: #f8fafc; }
                .row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
                .f-grp { display: flex; flex-direction: column; gap: 0.5rem; }
                .f-grp label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.02em; }
                .f-grp input, .f-grp select { height: 42px; border-radius: 8px; border: 1px solid #e2e8f0; padding: 0 0.75rem; font-size: 0.95rem; }
                .modal-ft { padding: 1.25rem 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid #e2e8f0; }
                .view-item-premium label { display: flex; align-items: center; gap: 8px; font-size: 0.73rem; font-weight: 500; color: #57657d; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.04em; }
                .view-item-premium p { margin: 0; font-size: 0.95rem; font-weight: 400; color: #1e293b; line-height: 1.5; }
            `}</style>
        </div>
    );
};

export default Candidate;

