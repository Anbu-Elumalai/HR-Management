import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Search, Edit, Trash2, X, RotateCcw,
    FileText, Send, CheckCircle, Clock, AlertCircle,
    Download, DollarSign, Building, Users,
    Calendar, Loader2, IndianRupee, FileCheck,
    TrendingUp, TrendingDown, XCircle, File, ChevronRight
} from 'lucide-react';
import './Recruitment.css';
import api from '../../api/api';
import { candidateService } from '../../services/candidateService';
import { departmentService } from '../../services/departmentService';
import { employeeService } from '../../services/employeeService';
import toast from 'react-hot-toast';
import EmptyState from '../../components/common/EmptyState';

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

const Badge = ({ variant }) => {
    const variants = {
        offered: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Offered' },
        draft: { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: 'Draft' },
        sent: { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', label: 'Sent' },
        accepted: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Accepted' },
        rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Rejected' },
        expired: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Expired' },
        pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Pending' },
        'Pending Approval': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Pending Approval' }
    };
    const style = variants[variant] || variants.draft;
    return (
        <span className="badge-pill" style={{ backgroundColor: style.bg, color: style.color }}>
            <span className="badge-dot" style={{ backgroundColor: style.color }}></span>
            {style.label}
        </span>
    );
};



const Offer = () => {
    const [viewMode, setViewMode] = useState('list');
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [offers, setOffers] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [formTab, setFormTab] = useState('basic');
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState({ candidateName: '', status: '', departmentName: '', joiningDate: '' });

    const [formData, setFormData] = useState({
        offerCode: '', candidateId: '', candidateName: '', vacancyId: '', departmentId: '', reportingManager: '', workLocationId: '', workMode: 'On-site', joiningDate: '', offerExpiryDate: '', ctc: 0, status: 'Draft', candidateResponse: 'Pending', termsAndConditions: '', notes: '', isActive: 1, isDelete: 0, salaryBreakdown: { basic: 0, hra: 0, specialAllowance: 0, pf_employer: 0, gratuity: 0, medicalInsurance: 0 }
    });

    const loadRefData = useCallback(async () => {
        try {
            const [c, v, e, d, l] = await Promise.all([
                candidateService.getAllCandidates(0, 500).catch(() => ({ data: [] })),
                api.get('/vacancies?limit=500').catch(() => ({ data: { data: [] } })),
                employeeService.getAllEmployees().catch(() => []),
                departmentService.getAllDepartments().catch(() => []),
                api.get('/locations?limit=100').catch(() => ({ data: { data: [] } }))
            ]);
            setCandidates(c.data || []);
            setVacancies(v.data?.data || []);
            setEmployees(e || []);
            setDepartments(d || []);
            setLocations(l.data?.data || []);
        } catch (err) { console.error(err); }
    }, []);

    const fetchOffers = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const q = new URLSearchParams({ page: String(p), limit: '10', ...filters });
            const res = await api.get(`/offers?${q.toString()}`);
            if (res.data) {
                setOffers(res.data.data || []);
                setTotalItems(res.data.total || 0);
                setPage(p);
            }
        } catch (err) {
            console.error('Error fetching offers:', err);
        } finally {
            setLoading(false);
            setHasLoaded(true);
        }
    }, [filters]);

    useEffect(() => { loadRefData(); }, [loadRefData]);

    const initialFetchDone = useRef(false);
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchOffers(0);
            initialFetchDone.current = true;
            return;
        }
        const t = setTimeout(() => { if (viewMode === 'list') fetchOffers(0); }, 500);
        return () => clearTimeout(t);
    }, [filters, viewMode, fetchOffers]);

    const handleCandidateChange = async (cid) => {
        const c = candidates.find(x => String(x._id || x.id) === String(cid));
        if (!c) return;
        setLoadingDetails(true);
        try {
            const vid = c.vacancyId?._id || c.vacancyId || c.positionId?._id || c.positionId;
            const v = vacancies.find(x => String(x._id || x.id) === String(vid));
            setFormData(p => ({
                ...p, candidateId: cid, candidateName: c.name, vacancyId: v ? String(v._id || v.id) : '',
                departmentId: (v?.departmentId?._id || v?.departmentId) || (c.departmentId?._id || c.departmentId) || '',
                workLocationId: (v?.locationId?._id || v?.locationId) || (c.locationId?._id || c.locationId) || '',
                reportingManager: (v?.hiringManagerId?._id || v?.hiringManagerId) || ''
            }));
        } finally { setLoadingDetails(false); }
    };

    const handleSalaryCalc = (ctc) => {
        const val = parseFloat(ctc) || 0;
        const b = Math.round((val * 0.4) / 12);
        const h = Math.round(b * 0.4);
        const p = Math.round(Math.min(b * 0.12, 1800));
        const i = 1500;
        const g = Math.round((b * 4.81) / 100);
        const s = Math.round((val / 12) - (b + h + p + g + i));
        setFormData(prev => ({ ...prev, ctc: val, salaryBreakdown: { ...prev.salaryBreakdown, basic: b, hra: h, pf_employer: p, gratuity: g, medicalInsurance: i, specialAllowance: Math.max(0, s) } }));
    };

    const onSave = async (isDraft) => {
        setSubmitting(true);
        try {
            const payload = { ...formData, status: isDraft ? 'Draft' : 'Pending Approval' };
            if (viewMode === 'edit') await api.put(`/offers/${selectedOffer._id}`, payload);
            else await api.post('/offers', payload);
            toast.success(isDraft ? 'Draft Saved' : 'Offer Issued');
            setViewMode('list'); fetchOffers(0);
        } catch (err) { toast.error('Check required fields'); } finally { setSubmitting(false); }
    };

    const renderPrice = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

    const Modal = () => (
        <div className="premium-modal-overlay" onClick={() => setViewMode('list')}>
            <div className="premium-modal-card animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="premium-modal-header">
                    <div className="mh-title-group">
                        <div className="mh-icon-v2"><FileText /></div>
                        <div>
                            <h3>{viewMode === 'edit' ? 'Update Offer Package' : 'Generate New Offer'}</h3>
                            <p>Complete the compensation and contract details</p>
                        </div>
                    </div>
                    <button className="mh-close-v2" onClick={() => setViewMode('list')}><X size={22} /></button>
                </div>

                <div className="premium-modal-tabs">
                    <button className={`p-tab ${formTab === 'basic' ? 'active' : ''}`} onClick={() => setFormTab('basic')}><Building size={16} /> Basic Details</button>
                    <button className={`p-tab ${formTab === 'salary' ? 'active' : ''}`} onClick={() => setFormTab('salary')}><DollarSign size={16} /> Salary & CTC</button>
                    <button className={`p-tab ${formTab === 'terms' ? 'active' : ''}`} onClick={() => setFormTab('terms')}><FileText size={16} /> Terms & Notes</button>
                </div>

                <div className="premium-modal-body">
                    {loadingDetails && <div className="p-loader-overlay"><Loader2 className="animate-spin" /><span>Fetching data...</span></div>}
                    <div className="p-form-grid">
                        {formTab === 'basic' && (
                            <>
                                <div className="p-form-card">
                                    <div className="p-card-header"><Users size={14} /> Candidate Selection</div>
                                    <div className="p-field-row">
                                        <div className="p-field"><label>Candidate</label><select value={formData.candidateId} onChange={e => handleCandidateChange(e.target.value)}><option value="">Select Candidate</option>{candidates.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                                        <div className="p-field"><label>Vacancy</label><select value={formData.vacancyId} onChange={e => setFormData({ ...formData, vacancyId: e.target.value })}><option value="">Select Vacancy</option>{vacancies.map(v => <option key={v._id} value={v._id}>{v.jobTitle}</option>)}</select></div>
                                    </div>
                                </div>
                                <div className="p-form-card">
                                    <div className="p-card-header"><Building size={14} /> Organization</div>
                                    <div className="p-field-row">
                                        <div className="p-field"><label>Department</label><select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}><option value="">Select Dept</option>{departments.map(d => <option key={d._id} value={d._id}>{d.label}</option>)}</select></div>
                                        <div className="p-field"><label>Manager</label><select value={formData.reportingManager} onChange={e => setFormData({ ...formData, reportingManager: e.target.value })}><option value="">Select Manager</option>{employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}</select></div>
                                    </div>
                                    <div className="p-field-row">
                                        <div className="p-field"><label>Location</label><select value={formData.workLocationId} onChange={e => setFormData({ ...formData, workLocationId: e.target.value })}><option value="">Select Location</option>{locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}</select></div>
                                        <div className="p-field"><label>Work Mode</label><select value={formData.workMode} onChange={e => setFormData({ ...formData, workMode: e.target.value })}><option value="On-site">On-site</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option></select></div>
                                    </div>
                                </div>
                                <div className="p-form-card">
                                    <div className="p-card-header"><Calendar size={14} /> Timeline</div>
                                    <div className="p-field-row">
                                        <div className="p-field"><label>Joining Date</label><input type="date" value={formData.joiningDate ? formData.joiningDate.split('T')[0] : ''} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} /></div>
                                        <div className="p-field"><label>Expiry Date</label><input type="date" value={formData.offerExpiryDate ? formData.offerExpiryDate.split('T')[0] : ''} onChange={e => setFormData({ ...formData, offerExpiryDate: e.target.value })} /></div>
                                    </div>
                                </div>
                            </>
                        )}
                        {formTab === 'salary' && (
                            <div className="p-salary-section">
                                <div className="p-field full-w"><label>Annual CTC Amount</label><div className="p-ctc-input"><IndianRupee size={20} /><input type="number" placeholder="0.00" value={formData.ctc} onChange={e => handleSalaryCalc(e.target.value)} /></div></div>
                                <div className="p-breakdown">
                                    <div className="pb-row"><span>Basic Pay (40%)</span><b>{renderPrice(formData.salaryBreakdown.basic)}</b></div>
                                    <div className="pb-row"><span>HRA</span><b>{renderPrice(formData.salaryBreakdown.hra)}</b></div>
                                    <div className="pb-row"><span>Employer PF</span><b>{renderPrice(formData.salaryBreakdown.pf_employer)}</b></div>
                                    <div className="pb-row total"><span>Monthly Net Take-home</span><b>{renderPrice(formData.salaryBreakdown.basic + formData.salaryBreakdown.hra + formData.salaryBreakdown.specialAllowance)}</b></div>
                                </div>
                            </div>
                        )}
                        {formTab === 'terms' && (
                            <div className="p-text-fields">
                                <div className="p-field"><label>Offer Terms & Conditions</label><textarea rows={6} value={formData.termsAndConditions} onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })} placeholder="Enter terms..."></textarea></div>
                                <div className="p-field"><label>Additional Internal Notes</label><textarea rows={4} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Add notes..."></textarea></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="premium-modal-footer">
                    <div className="pm-footer-info">{formData.candidateName && <span>Draft for: <b>{formData.candidateName}</b></span>}</div>
                    <div className="pm-footer-actions">
                        <button className="btn-cancel-v5" onClick={() => setViewMode('list')}>Cancel</button>
                        <button className="btn-draft" onClick={() => onSave(true)} disabled={submitting}>Save Draft</button>
                        <button className="btn-issue" onClick={() => onSave(false)} disabled={submitting}>{submitting ? 'Issuing...' : 'Issue Offer'}</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const statConfig = [
        { label: 'Total Offers', status: '', icon: <FileText size={20} />, color: '#0d5f68', bg: 'rgba(13, 95, 104, 0.1)', trend: 8 },
        { label: 'Draft', status: 'Draft', icon: <File size={20} />, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)', trend: 2 },
        { label: 'Pending Approval', status: 'Pending Approval', icon: <Clock size={20} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', trend: 12 },
        { label: 'Sent', status: 'Sent', icon: <Send size={20} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', trend: -4 },
        { label: 'Accepted', status: 'Accepted', icon: <CheckCircle size={20} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', trend: 15 },
        { label: 'Rejected', status: 'Rejected', icon: <XCircle size={20} />, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', trend: -2 },
        { label: 'Expired', status: 'Expired', icon: <AlertCircle size={20} />, color: '#b45309', bg: 'rgba(180, 83, 9, 0.1)', trend: 1 }
    ];

    return (
        <div className="vacancy-dashboard animate-entry" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', overflow: 'hidden', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            {(viewMode === 'create' || viewMode === 'edit') && <Modal />}

            <header className="dashboard-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="header-left"><h1><FileText size={24} className="text-[#0d5f68]" /> Offer Letters</h1></div>
                <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button className="btn-secondary-outline" onClick={() => toast.success('Export initiated...')}><Download size={18} /> Export</button>
                    <button className="btn-primary" onClick={() => { setFormData({ offerCode: '', candidateId: '', candidateName: '', vacancyId: '', departmentId: '', reportingManager: '', workLocationId: '', workMode: 'On-site', joiningDate: '', offerExpiryDate: '', ctc: 0, status: 'Draft', candidateResponse: 'Pending', termsAndConditions: '', notes: '', isActive: 1, isDelete: 0, salaryBreakdown: { basic: 0, hra: 0, specialAllowance: 0, pf_employer: 0, gratuity: 0, medicalInsurance: 0 } }); setViewMode('create'); }}><Plus size={20} /> Create Offer</button>
                </div>
            </header>

            <div className="stats-scroller-v6" style={{ marginBottom: '1.5rem' }}>
                <div className="stats-container-v6">
                    {statConfig.map((s, idx) => (
                        <StatCard
                            key={idx}
                            {...s}
                            count={s.status === '' ? totalItems : offers.filter(o => o.status === s.status).length}
                            active={filters.status === s.status}
                            onClick={() => setFilters({ ...filters, status: s.status })}
                        />
                    ))}
                </div>
            </div>

            <div className="filter-search-container" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="search-wrapper" style={{ flex: 1 }}><Search size={18} className="search-icon" /><input type="text" placeholder="Search by candidate name..." value={filters.candidateName} onChange={e => setFilters({ ...filters, candidateName: e.target.value })} /></div>
                <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={{ height: '40px', padding: '0 2.5rem 0 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}>
                    <option value="">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Sent">Sent</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Expired">Expired</option>
                </select>
                <button className="btn-icon-alt" onClick={() => setFilters({ candidateName: '', status: '', departmentName: '', joiningDate: '' })} title="Clear Filters"><RotateCcw size={18} /></button>
            </div>

            {loading ? (
                <div className="table-container-premium shadow-premium" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                    <div className="p-list-loader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Loader2 className="animate-spin text-[#0d5f68]" size={40} />
                        <span className="font-semibold text-slate-500">Loading offers...</span>
                    </div>
                </div>
            ) : (offers.length === 0 && hasLoaded) ? (
                <EmptyState
                    cardTitle="Offers List"
                    totalCount={0}
                    icon={FileCheck}
                    title="No offers found"
                    description=""
                    buttonLabel="Create Offer"
                    onCreate={() => setViewMode('create')}
                />
            ) : (
                <div className="table-container-premium shadow-premium">
                    <div className="table-header-info">
                        <div className="header-info-left"><h3>Offers List</h3><span className="count-chip">{totalItems} TOTAL</span></div>
                        <div className="header-info-right text-xs text-slate-500 font-medium">Showing {offers.length} entries</div>
                    </div>

                    <div className="table-responsive">
                        <table className="ats-table">
                            <thead><tr><th style={{ width: '40px' }}><input type="checkbox" /></th><th style={{ width: '120px' }}>CODE</th><th>CANDIDATE</th><th>ROLE / VACANCY</th><th style={{ width: '180px' }}>DEPARTMENT</th><th className="text-right" style={{ width: '140px' }}>CTC</th><th className="text-center" style={{ width: '150px' }}>STATUS</th><th className="text-right pr-6" style={{ width: '120px' }}>ACTIONS</th></tr></thead>
                            <tbody>
                                {offers.map(o => (
                                    <tr key={o._id}>
                                        <td><input type="checkbox" /></td>
                                        <td><span className="code-badge">{o.offerCode}</span></td>
                                        <td><div className="job-info"><span className="job-title">{o.candidateName}</span></div></td>
                                        <td><span className="dept-name">{o.appliedFor || o.vacancyTitle}</span></td>
                                        <td><span className="manager-name">{o.departmentName}</span></td>
                                        <td className="text-right font-bold text-[#0d5f68]">{renderPrice(o.ctc)}</td>
                                        <td className="text-center"><Badge variant={o.status} /></td>
                                        <td className="text-right pr-6"><button className="action-btn-premium" onClick={() => { setSelectedOffer(o); setViewMode('view'); }}><Eye size={16} /></button><button className="action-btn-premium" onClick={() => { setSelectedOffer(o); setViewMode('edit'); }} title="Edit"><Edit size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            <style>{`
                .vacancy-dashboard { height: calc(100vh - 64px); display: flex; flex-direction: column; overflow: hidden; }
                .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-shrink: 0; }
                .dashboard-header h1 { display: flex; align-items: center; gap: 0.75rem; margin: 0; font-size: 1.4rem; color: #1e293b; font-weight: 700; }
                
                .btn-primary { background: #0d5f68; color: white !important; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(13, 95, 104, 0.2); }
                .btn-primary:hover { background: #084d54; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(13, 95, 104, 0.3); }
                
                .btn-secondary-outline { background: white; color: #475569; border: 1px solid #e2e8f0; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .btn-secondary-outline:hover { border-color: #0d5f68; color: #0d5f68; background: #f8fafc; }
                
                .stats-scroller-v6 { overflow-x: auto; padding: 0.5rem 0.5rem 1.25rem 0.5rem; margin: 0 -0.5rem; flex-shrink: 0; }
                .stats-scroller-v6::-webkit-scrollbar { height: 4px; }
                .stats-scroller-v6::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                
                .stats-container-v6 { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.75rem; width: 100%; }
                
                .stat-card-premium { background: white; padding: 0.85rem 1rem; border-radius: 14px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-width: 0; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
                .stat-card-premium:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .stat-card-premium.active { border-color: var(--accent); background: linear-gradient(to bottom right, white, var(--accent-bg)); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform: translateY(-1px); }
                .stat-card-premium.active::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); }
                
                .stat-main { display: flex; align-items: center; gap: 0.85rem; }
                .stat-icon-v6 { width: 42px; height: 42px; border-radius: 12px; background: var(--accent-bg); color: var(--accent); display: flex; align-items: center; justify-content: center; }
                .stat-content-v6 { display: flex; flex-direction: column; gap: 2px; }
                .stat-label-v6 { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-value-group { display: flex; align-items: baseline; gap: 0.6rem; }
                .stat-count-v6 { font-size: 1.5rem; font-weight: 800; color: #1e293b; line-height: 1; }
                
                .stat-trend { display: flex; align-items: center; gap: 2px; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 20px; }
                .stat-trend.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                .stat-trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                
                .stat-indicator { color: #cbd5e1; transition: transform 0.2s; }
                .stat-card-premium:hover .stat-indicator { transform: translateX(3px); color: var(--accent); }

                .filter-search-container { background: white; padding: 0.65rem 1rem; border-radius: 12px; display: flex; gap: 0.75rem; align-items: center; border: 1px solid #e2e8f0; }
                .search-wrapper { flex: 1; position: relative; display: flex; align-items: center; }
                .search-icon { position: absolute; left: 0.85rem; color: #94a3b8; top: 50%; transform: translateY(-50%); pointer-events: none; }
                .search-wrapper input { width: 100%; height: 40px; padding: 0 1rem 0 2.5rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; font-size: 0.875rem; outline: none; transition: all 0.2s; }
                .search-wrapper input:focus { border-color: #0d5f68; background: white; box-shadow: 0 0 0 3px rgba(13, 95, 104, 0.1); }
                .filter-actions { display: flex; align-items: center; }
                .filter-dropdown-group { display: flex; gap: 0.75rem; align-items: center; }
                .filter-dropdown-group select { height: 40px; padding: 0 2.5rem 0 1rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.875rem; font-weight: 600; cursor: pointer; outline: none; transition: all 0.2s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; }
                .filter-dropdown-group select:hover { border-color: #cbd5e1; }
                .filter-dropdown-group select:focus { border-color: #0d5f68; background-color: white; box-shadow: 0 0 0 3px rgba(13, 95, 104, 0.1); }
                .btn-icon-alt { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; cursor: pointer; transition: all 0.2s; }
                .btn-icon-alt:hover { border-color: #0d5f68; color: #0d5f68; background: white; }

                .table-container-premium { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
                .table-header-info { padding: 0.85rem 1.25rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: white; }
                .header-info-left { display: flex; align-items: center; gap: 0.75rem; }
                .header-info-left h3 { margin: 0; font-size: 1rem; color: #1e293b; font-weight: 700; }
                .count-chip { background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.65rem; }

                .ats-table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .ats-table th { background: #f8fafc; padding: 0.65rem 1.25rem; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; text-align: left; }
                .ats-table td { padding: 0.75rem 1.25rem; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; }
                .code-badge { font-family: monospace; font-size: 0.8rem; font-weight: 700; color: #0d5f68; }
                .job-title { font-size: 0.925rem; font-weight: 700; color: #1e293b; }
                .dept-name { font-size: 0.775rem; color: #64748b; font-weight: 600; }
                .manager-name { font-size: 0.775rem; color: #94a3b8; font-weight: 500; }

                .table-footer-ats { padding: 0.75rem 1.25rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: white; }
                .page-btn { padding: 0.4rem 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; font-size: 0.8rem; font-weight: 700; color: #475569; cursor: pointer; min-width: 80px; }
                .page-btn.disabled { opacity: 0.5; cursor: not-allowed; background: #f8fafc; }

                .premium-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .premium-modal-card { background: white; width: 950px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
                .premium-modal-header { background: #0d4d4d; color: white; padding: 1.25rem 1.75rem; display: flex; justify-content: space-between; align-items: center; }
                .mh-title-group { display: flex; gap: 1rem; align-items: center; }
                .mh-icon-v2 { width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .mh-title-group h3 { margin: 0; font-size: 1.2rem; }
                .mh-title-group p { margin: 0; font-size: 0.8rem; opacity: 0.7; }
                .mh-close-v2 { background: none; border: none; color: white; cursor: pointer; }

                .premium-modal-tabs { background: white; border-bottom: 1px solid #f1f5f9; padding: 0 1.75rem; display: flex; gap: 1.75rem; }
                .p-tab { background: none; border: none; padding: 1rem 0; font-weight: 700; font-size: 0.8rem; color: #94a3b8; cursor: pointer; border-bottom: 3px solid transparent; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s; }
                .p-tab.active { color: #0d5f68; border-bottom-color: #0d5f68; }

                .premium-modal-body { padding: 1.5rem; background: #f8fafc; overflow-y: auto; flex: 1; }
                .p-form-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1.25rem; margin-bottom: 1rem; }
                .p-card-header { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
                .p-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
                .p-field label { display: block; font-size: 0.7rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 0.4rem; }
                .p-field select, .p-field input, .p-field textarea { width: 100%; height: 38px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 0.85rem; font-size: 0.85rem; background: white; outline: none; }
                .p-field textarea { height: auto; padding: 0.75rem 0.85rem; }

                .p-ctc-input { position: relative; display: flex; align-items: center; }
                .p-ctc-input svg { position: absolute; left: 1rem; color: #94a3b8; }
                .p-ctc-input input { padding-left: 2.75rem !important; height: 50px !important; font-size: 1.4rem !important; font-weight: 800 !important; color: #0d5f68 !important; }
                .p-breakdown { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem; }
                .pb-row { display: flex; justify-content: space-between; padding: 0.75rem 1.25rem; background: #f1f5f9; border-radius: 8px; font-weight: 600; font-size: 0.85rem; }
                .pb-row.total { background: #0d4d4d; color: white; }

                .premium-modal-footer { background: white; padding: 1rem 1.75rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                .pm-footer-actions { display: flex; gap: 0.75rem; }
                .btn-cancel-v5 { background: none; border: none; font-weight: 700; color: #64748b; cursor: pointer; }
                .btn-draft { background: #f1f5f9; color: #1e293b; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
                .btn-issue { background: #0d5f68; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(13, 95, 104, 0.2); }


            `}</style>
        </div>
    );
};

export default Offer;

