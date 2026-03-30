import React, { useState, useEffect } from 'react';
import {
    Plus, Eye, Edit, Trash2, X, RotateCcw,
    ChevronLeft, ChevronRight, Loader2, Search,
    FileText, User, Briefcase, IndianRupee, MapPin, 
    Send, Save, Info, CheckCircle, XCircle, Users,
    Calendar, Clock, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Recruitment.css';
import api from '../../api/api';
import { candidateService } from '../../services/candidateService';
import { departmentService } from '../../services/departmentService';
import { employeeService } from '../../services/employeeService';

const Offer = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [offers, setOffers] = useState([]);

    // Lookup data
    const [candidates, setCandidates] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [errors, setErrors] = useState({});

    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState({
        offerCode: '',
        candidateName: '',
        vacancyTitle: '',
        departmentName: '',
        status: '',
        joiningDate: ''
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    // Form Data
    const [formData, setFormData] = useState({
        offerCode: '',
        candidateId: '',
        candidateName: '',
        vacancyId: '',
        appliedFor: '', 
        department: '',
        departmentId: '',
        reportingManager: '',
        reportingManagerName: '',
        workLocation: '',
        workLocationId: '',
        workMode: 'On-site',
        joiningDate: '',
        offerExpiryDate: '',
        ctc: 0,
        status: 'Draft',
        termsAndConditions: '',
        notes: '',
        salaryBreakdown: {
            basic: 0, hra: 0, specialAllowance: 0, pf: 0, gratuity: 0, medicalInsurance: 0
        }
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);
        return () => clearTimeout(handler);
    }, [filters]);

    useEffect(() => {
        setPage(0);
    }, [debouncedFilters]);

    useEffect(() => {
        if (viewMode === 'list') {
            fetchOffers(page);
        }
    }, [viewMode, page, debouncedFilters]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [candRes, vacRes, empRes, deptRes, locRes] = await Promise.all([
                candidateService.getAllCandidates(0, 1000).catch(() => ({ data: [] })),
                api.get('/vacancies?limit=1000').catch(() => ({ data: { data: [] } })),
                employeeService.getAllEmployees().catch(() => []),
                departmentService.getAllDepartments().catch(() => []),
                api.get('/locations?limit=100').catch(() => ({ data: { data: [] } }))
            ]);

            setCandidates(candRes.data || []);
            setVacancies(vacRes.data?.data || []);
            setEmployees(empRes || []);
            setDepartments(deptRes || []);
            setLocations(locRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async (pageNum = 0) => {
        setLoading(true);
        try {
            const response = await api.get('/offers', {
                params: { 
                    page: pageNum, 
                    limit: 10,
                    offerCode: debouncedFilters.offerCode,
                    candidateName: debouncedFilters.candidateName,
                    vacancyTitle: debouncedFilters.vacancyTitle,
                    departmentName: debouncedFilters.departmentName,
                    status: debouncedFilters.status,
                    joiningDate: debouncedFilters.joiningDate
                }
            }).catch(() => null);

            if (response && response.data) {
                const result = response.data;
                // Based on the user's provided structure:
                setOffers(result.data || []);
                setTotalPages(result.totalPages || 1);
                setTotalItems(result.total || 0);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const fetchOfferById = async (id) => {
        try {
            const response = await api.get(`/offers/${id}`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching offer detail:', error);
            return null;
        }
    };

    const handleCandidateChange = async (candidateId) => {
        const candidate = candidates.find(c => String(c._id || c.id) === String(candidateId));
        if (!candidate) return;

        setLoadingDetails(true);
        try {
            const activeOfferRes = await api.get(`/offers/check/${candidateId}`).catch(() => null);
            if (activeOfferRes?.data?.exists) {
                toast.error(`A valid offer already exists for ${candidate.name}.`, { duration: 5000 });
                setFormData(prev => ({ ...prev, candidateId: '' }));
                return;
            }

            const candVacId = candidate.vacancyId?._id || candidate.vacancyId || candidate.positionId?._id || candidate.positionId;
            const vacancy = vacancies.find(v => String(v._id || v.id) === String(candVacId));

            if (vacancy) {
                const deptObj = vacancy.departmentId || vacancy.department || candidate.departmentId || candidate.department;
                let deptName = typeof deptObj === 'object' ? deptObj.name || deptObj.title || '' : String(deptObj || '');
                
                if (/^[0-9a-fA-F]{24}$/.test(deptName) || !deptName) {
                    const deptId = String(deptObj?._id || deptObj?.id || deptObj || '');
                    const found = departments.find(d => String(d._id || d.id) === deptId);
                    if (found) deptName = found.name;
                }

                setFormData(prev => ({
                    ...prev,
                    candidateId: candidateId,
                    candidateName: candidate.name,
                    vacancyId: String(vacancy._id || vacancy.id),
                    appliedFor: vacancy.jobTitle || vacancy.role || candidate.appliedFor || '',
                    departmentId: vacancy.departmentId?._id || vacancy.departmentId || candidate.departmentId || '',
                    department: deptName,
                    workLocation: vacancy.locationId?.name || vacancy.location || '',
                    workLocationId: vacancy.locationId?._id || vacancy.locationId || '',
                    workMode: 'On-site'
                }));
            } else {
                const deptObj = candidate.departmentId || candidate.department;
                let deptName = typeof deptObj === 'object' ? deptObj.name || deptObj.title || '' : String(deptObj || '');

                if (/^[0-9a-fA-F]{24}$/.test(deptName) || !deptName) {
                    const deptId = String(deptObj?._id || deptObj?.id || deptObj || '');
                    const found = departments.find(d => String(d._id || d.id) === deptId);
                    if (found) deptName = found.name;
                }

                setFormData(prev => ({
                    ...prev,
                    candidateId: candidateId,
                    candidateName: candidate.name,
                    vacancyId: candVacId || '',
                    appliedFor: candidate.appliedFor || candidate.role || '',
                    department: deptName
                }));
            }
        } catch (error) {
            console.error('Error processing candidate selection:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSalaryCalculation = (totalCtc) => {
        const ctc = parseFloat(totalCtc) || 0;
        const basic = Math.round((ctc * 0.45) / 12);
        const hra = Math.round(basic * 0.4);
        const pf = Math.round(Math.min(basic * 0.12, 1800));
        const insurance = 1500;
        const gratuity = Math.round((basic * 4.81) / 100);
        const special = Math.round((ctc / 12) - (basic + hra + pf + gratuity + insurance));

        setFormData(prev => ({
            ...prev,
            ctc: totalCtc,
            salaryBreakdown: {
                basic, hra, pf, gratuity, medicalInsurance: insurance,
                specialAllowance: Math.max(0, special)
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.candidateId) newErrors.candidateId = "Required";
        if (!formData.vacancyId) newErrors.vacancyId = "Required";
        if (!formData.joiningDate) newErrors.joiningDate = "Required";
        if (!formData.ctc || formData.ctc <= 0) newErrors.ctc = "Valid CTC required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (isDraft = true) => {
        if (!validateForm()) {
            toast.error("Please fill mandatory fields.");
            return;
        }

        setSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                status: isDraft ? 'Draft' : 'Pending Approval'
            };

            if (viewMode === 'edit' && selectedOffer) {
                await api.put(`/offers/${selectedOffer._id || selectedOffer.id}`, dataToSubmit);
                toast.success('Offer updated successfully');
            } else {
                await api.post('/offers', dataToSubmit);
                toast.success(isDraft ? 'Draft saved successfully' : 'Offer submitted for approval');
            }
            setViewMode('list');
            fetchOffers(page);
        } catch (error) {
            console.error('Error saving offer:', error);
            toast.error(error.response?.data?.message || 'Failed to save offer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this offer? This will delete the record.')) return;
        setSubmitting(true);
        try {
            await api.delete(`/offers/${id}`);
            toast.success('Offer cancelled successfully');
            fetchOffers(page);
        } catch (error) {
            console.error('Error deleting offer:', error);
            toast.error('Failed to cancel offer');
        } finally {
            setSubmitting(false);
        }
    };

    const renderPrice = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const generateOfferCode = async () => {
        try {
            const resp = await api.get('/offers/code/generate').catch(() => null);
            return resp?.data?.data || `OFF-${new Date().getFullYear()}-000`;
        } catch (e) { return `OFF-${new Date().getFullYear()}-000`; }
    };

    useEffect(() => {
        const prepare = async () => {
            if (viewMode === 'create') {
                const code = await generateOfferCode();
                setFormData({
                    offerCode: code,
                    candidateId: '',
                    candidateName: '',
                    vacancyId: '',
                    appliedFor: '', 
                    department: '',
                    departmentId: '',
                    reportingManager: '',
                    reportingManagerName: '',
                    workLocation: '',
                    workLocationId: '',
                    workMode: 'On-site',
                    joiningDate: '',
                    offerExpiryDate: '',
                    ctc: 0,
                    status: 'Draft',
                    termsAndConditions: '',
                    notes: '',
                    salaryBreakdown: { 
                        basic: 0, hra: 0, specialAllowance: 0, pf: 0, gratuity: 0, medicalInsurance: 0 
                    }
                });
            } else if ((viewMode === 'edit' || viewMode === 'view') && selectedOffer) {
                setLoadingDetails(true);
                try {
                    const detailed = await fetchOfferById(selectedOffer._id || selectedOffer.id);
                    if (detailed) setFormData(detailed);
                } finally { setLoadingDetails(false); }
            }
        };
        if (viewMode === 'create' || viewMode === 'edit' || viewMode === 'view') prepare();
    }, [viewMode, selectedOffer]);

    const renderOfferForm = () => {
        const isEdit = viewMode === 'edit';
        const inputErrorStyle = (field) => errors[field] ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {};

        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', height: '90vh' }}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white">
                            {isEdit ? 'Edit Offer Letter' : 'Generate New Offer Letter'}
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
                                        {submitting ? 'Generating Offer...' : 'Preparing Candidate Profile...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="form-card">
                            <div className="form-card-title">Basic Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Offer ID</label>
                                    <input type="text" placeholder="Auto-generated" value={formData.offerCode || ''} readOnly className="font-mono bg-gray-50" />
                                </div>
                                <div className="form-group">
                                    <label>Candidate Name <span className="text-red-500">*</span></label>
                                    <select
                                        style={inputErrorStyle('candidateId')}
                                        value={formData.candidateId} 
                                        onChange={e => handleCandidateChange(e.target.value)}
                                    >
                                        <option value="" disabled>Select Candidate</option>
                                        {candidates.filter(c => c.status === 'Move to Offer').map(c => (
                                            <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
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
                                            const v = vacancies.find(v => String(v._id || v.id) === String(e.target.value));
                                            setFormData({ ...formData, vacancyId: e.target.value, appliedFor: v?.positionId?.name || v?.jobTitle || v?.role || '' });
                                        }}
                                    >
                                        <option value="" disabled>Select Vacancy</option>
                                        {vacancies.map(v => (
                                            <option key={v._id || v.id} value={v._id || v.id}>
                                                {v.requestNumber ? v.requestNumber + ' - ' : ''}
                                                {v.positionId?.name || v.position?.name || v.positionName || v.jobTitle || v.role || v.designation || 'Position'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.vacancyId && <span className="error-text">{errors.vacancyId}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        placeholder="Auto-fetched" 
                                        value={formData.department || ''} 
                                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Reporting Manager</label>
                                    <select 
                                        value={formData.reportingManager} 
                                        onChange={e => setFormData({ ...formData, reportingManager: e.target.value, reportingManagerName: employees.find(emp => (emp._id || emp.id) === e.target.value)?.name || '' })}
                                    >
                                        <option value="">Select Manager</option>
                                        {employees.map(emp => (
                                            <option key={emp._id || emp.id} value={emp._id || emp.id}>
                                                {emp.employeeId ? emp.employeeId + ' - ' : ''}{emp.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Offer Conditions & Work Arrangement</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Expected Joining Date <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        style={inputErrorStyle('joiningDate')}
                                        value={formData.joiningDate} 
                                        onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} 
                                    />
                                    {errors.joiningDate && <span className="error-text">{errors.joiningDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Offer Expiry Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.offerExpiryDate} 
                                        onChange={e => setFormData({ ...formData, offerExpiryDate: e.target.value })} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Work Mode</label>
                                    <select value={formData.workMode} onChange={e => setFormData({ ...formData, workMode: e.target.value })}>
                                        <option value="On-site">On-site (Work from Office)</option>
                                        <option value="Remote">Remote (Work from Home)</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Work Location</label>
                                    <select 
                                        value={formData.workLocationId} 
                                        onChange={e => {
                                            const loc = locations.find(l => (l._id || l.id) === e.target.value);
                                            setFormData({ ...formData, workLocationId: e.target.value, workLocation: loc?.name || '' });
                                        }}
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map(loc => (
                                            <option key={loc._id || loc.id} value={loc._id || loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Compensation (Gross CTC)</div>
                            <div className="modal-info-grid">
                                <div className="form-group col-span-2">
                                    <label>Annual CTC (INR) <span className="text-red-500">*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <IndianRupee size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input 
                                            type="number" 
                                            style={{ ...inputErrorStyle('ctc'), paddingLeft: '35px' }}
                                            value={formData.ctc} 
                                            onChange={e => handleSalaryCalculation(e.target.value)} 
                                            placeholder="e.g. 1200000"
                                        />
                                    </div>
                                    {errors.ctc && <span className="error-text">{errors.ctc}</span>}
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <div className="reason-label" style={{ fontSize: '10px', color: '#0d5f68', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>Monthly Earnings</div>
                                            <div className="flex flex-col gap-2.5">
                                                <div className="flex justify-between text-sm"><span>Basic Pay:</span> <b>{renderPrice(formData.salaryBreakdown.basic)}</b></div>
                                                <div className="flex justify-between text-sm"><span>HRA:</span> <b>{renderPrice(formData.salaryBreakdown.hra)}</b></div>
                                                <div className="flex justify-between text-sm"><span>Special:</span> <b>{renderPrice(formData.salaryBreakdown.specialAllowance)}</b></div>
                                            </div>
                                        </div>
                                        <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
                                            <div className="reason-label" style={{ fontSize: '10px', color: '#0d5f68', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>Monthly Benefits</div>
                                            <div className="flex flex-col gap-2.5">
                                                <div className="flex justify-between text-sm"><span>PF:</span> <b>{renderPrice(formData.salaryBreakdown.pf)}</b></div>
                                                <div className="flex justify-between text-sm"><span>Gratuity:</span> <b>{renderPrice(formData.salaryBreakdown.gratuity)}</b></div>
                                                <div className="flex justify-between text-sm"><span>Insurance:</span> <b>{renderPrice(formData.salaryBreakdown.medicalInsurance)}</b></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="form-card-title">Letter Terms & Notes</div>
                            <div className="form-group">
                                <label>Specific Terms & Conditions</label>
                                <textarea rows="3" value={formData.termsAndConditions} onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-cancel-premium" style={{ width: '150px' }} onClick={() => setViewMode('list')} disabled={submitting}>Cancel</button>
                        <div className="flex gap-3">
                            <button className="btn-cancel-premium" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} onClick={() => handleSave(true)} disabled={submitting}>
                                <Save size={16} /> <span>Save Draft</span>
                            </button>
                            <button className="btn-primary" onClick={() => handleSave(false)} disabled={submitting}>
                                {submitting ? 'Processing...' : (isEdit ? 'Save Changes' : 'Generate & Issue Offer')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderOfferDetail = () => {
        const o = selectedOffer || {};
        return (
            <div className="modal-overlay" onClick={() => { setViewMode('list'); setSelectedOffer(null); }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', height: '90vh' }}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText size={20} /> Offer Details</h2>
                        <button className="icon-btn" onClick={() => { setViewMode('list'); setSelectedOffer(null); }}><X size={20} /></button>
                    </div>
                    <div className="form-body">
                        <div className="form-card">
                            <div className="modal-info-grid">
                                <div><label className="reason-label">Candidate</label><div className="font-bold">{o.candidateName}</div></div>
                                <div><label className="reason-label">Position</label><div className="font-bold">{o.appliedFor}</div></div>
                                <div><label className="reason-label">Department</label><div className="font-bold">{o.department}</div></div>
                                <div><label className="reason-label">CTC</label><div className="font-bold">{renderPrice(o.ctc)}</div></div>
                                <div><label className="reason-label">Status</label><div className="font-bold uppercase text-teal-600">{o.status}</div></div>
                            </div>
                        </div>
                    </div>
                    <div className="form-footer">
                        <button className="btn-cancel-premium" style={{ flex: 1 }} onClick={() => { setViewMode('list'); setSelectedOffer(null); }}>Close</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="employees-page">
            {viewMode === 'create' || viewMode === 'edit' ? renderOfferForm() : null}
            {viewMode === 'view' ? renderOfferDetail() : null}

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div className="flex flex-col">
                    <h1 className="page-title">Offer Letter Management</h1>
                    <p className="page-description">Track, manage and schedule candidate offer letters across recruitment lifecycle</p>
                </div>
                <button className="btn-primary" onClick={() => setViewMode('create')}>
                    <Plus size={20} />
                    <span>Create Offer</span>
                </button>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr className="header-titles-row">
                                <th>OFFER CODE</th>
                                <th>CANDIDATE NAME</th>
                                <th>APPLIED FOR / VACANCY</th>
                                <th>DEPARTMENT</th>
                                <th className="text-center">ANNUAL CTC</th>
                                <th className="text-center">OFFER DATE</th>
                                <th className="text-center">JOINING DATE</th>
                                <th className="text-center">OFFER EXPIRY</th>
                                <th className="text-center">CANDIDATE RESPONSE</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-center">ACTIONS</th>
                            </tr>
                            <tr className="filter-row">
                                <th><input type="text" className="inline-filter" placeholder="Code" value={filters.offerCode} onChange={e => setFilters({...filters, offerCode: e.target.value})} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Name" value={filters.candidateName} onChange={e => setFilters({...filters, candidateName: e.target.value})} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Vacancy" value={filters.vacancyTitle} onChange={e => setFilters({...filters, vacancyTitle: e.target.value})} /></th>
                                <th><input type="text" className="inline-filter" placeholder="Dept" value={filters.departmentName} onChange={e => setFilters({...filters, departmentName: e.target.value})} /></th>
                                <th><input type="text" className="inline-filter text-center" /></th>
                                <th><input type="text" className="inline-filter text-center" /></th>
                                <th><input type="date" className="inline-filter text-center" value={filters.joiningDate} onChange={e => setFilters({...filters, joiningDate: e.target.value})} /></th>
                                <th><input type="text" className="inline-filter text-center" /></th>
                                <th><input type="text" className="inline-filter text-center" /></th>
                                <th>
                                    <select className="inline-filter text-center" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                                        <option value="">All Status</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Pending Approval">Pending Approval</option>
                                        <option value="Issued">Issued</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </th>
                                <th className="text-center">
                                    <button className="btn-reset-filters-roles" onClick={() => { setFilters({offerCode:'', candidateName:'', vacancyTitle:'', departmentName:'', status:'', joiningDate:''}); setPage(0); }}>
                                        <RotateCcw size={16} />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="11" style={{ height: '320px' }}>
                                        <div className="flex flex-col items-center justify-center gap-4 h-full">
                                            <div className="premium-spinner">
                                                <div className="premium-core"></div>
                                            </div>
                                            <p className="premium-text" style={{ color: '#0d5f68', fontSize: '0.9rem', fontWeight: 600 }}>Syncing recruitment data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                (offers || []).map(offer => {
                                const parseDate = (d) => d ? (String(d).includes('T') ? String(d).split('T')[0] : d) : 'N/A';
                                const offerDate = parseDate(offer.createdAt || offer.offerDate);
                                const joiningDate = parseDate(offer.joiningDate);
                                const expiryDate = parseDate(offer.offerExpiryDate);
                                
                                const getResponseClass = (resp) => {
                                    if (!resp || resp === 'Pending') return 'status-rescheduled'; // Orange
                                    if (resp === 'Accepted') return 'status-scheduled'; // Green
                                    if (resp === 'Expired') return 'status-expired'; // Gray
                                    if (resp === 'Rejected' || resp === 'Declined') return 'status-cancelled'; // Red
                                    return 'status-rescheduled';
                                };

                                return (
                                    <tr key={offer._id || offer.id}>
                                        <td>
                                            <span 
                                                className="offer-code-badge" 
                                                style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #ccfbf1', cursor: 'pointer' }}
                                                onClick={() => { setSelectedOffer(offer); setViewMode('view'); }}
                                            >
                                                {offer.offerCode || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="emp-profile">
                                                <div className="emp-avatar">{(offer.candidateName || 'C').charAt(0)}</div>
                                                <span className="emp-name">{offer.candidateName || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-teal-700 font-bold" style={{ fontSize: '0.85rem' }}>
                                                {offer.vacancyTitle || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-blue-700 font-semibold" style={{ fontSize: '0.85rem' }}>
                                                {offer.departmentName || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="text-center font-bold text-teal-800">{renderPrice(offer.ctc)}</td>
                                        <td className="text-center text-slate-600">{offerDate}</td>
                                        <td className="text-center text-slate-600">{joiningDate}</td>
                                        <td className="text-center text-slate-600">{expiryDate}</td>
                                        <td className="text-center">
                                            <span className={`status-badge ${getResponseClass(offer.candidateResponse)}`}>
                                                {offer.candidateResponse || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`status-badge ${offer.status === 'Draft' ? 'status-rescheduled' : 'status-scheduled'}`}>{offer.status}</span>
                                        </td>
                                        <td className="text-center">
                                            <div className="actions-wrapper">
                                                <button className="action-btn view" onClick={() => { setSelectedOffer(offer); setViewMode('view'); }}><Eye size={18} /></button>
                                                <button className="action-btn edit" onClick={() => { setSelectedOffer(offer); setViewMode('edit'); }}><Edit size={18} /></button>
                                                <button className="action-btn delete" onClick={() => handleDelete(offer._id || offer.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="pagination-info">Showing {page * 10 + 1} to {Math.min((page + 1) * 10, totalItems)} of {totalItems} Schedule(s)</span>
                    <div className="pagination-controls">
                        <button className={`page-btn ${page === 0 ? 'disabled' : ''}`} onClick={() => page > 0 && setPage(page - 1)} disabled={page === 0}>Previous</button>
                        <button className="page-btn active">{page + 1}</button>
                        <button className={`page-btn ${page >= totalPages - 1 ? 'disabled' : ''}`} onClick={() => page < totalPages - 1 && setPage(page + 1)} disabled={page >= totalPages - 1}>Next</button>
                    </div>
                </div>
            </div>

            <style>{`
                .employees-page { padding: 1.5rem; display: flex; flex-direction: column; gap: 0rem; height: calc(100vh - 60px); overflow: hidden; }
                .page-title { font-size: 1.5rem; font-weight: 700; color: white; letter-spacing: -0.02em; margin: 0; }
                .page-description { font-size: 0.75rem; color: rgba(255,255,255,0.6); font-weight: 500; margin: 0; margin-top: 2px; }
                
                .table-card { background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-radius: 16px; display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
                .table-wrapper { overflow-x: auto; overflow-y: auto; flex: 1; width: 100%; }
                
                .employee-table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
                .employee-table thead { position: sticky; top: 0; z-index: 20; background-color: #f8f9fb; }
                .employee-table th { padding: 0.75rem 1.25rem; color: #374151; font-weight: 700; font-size: 0.8rem; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: middle; }
                .filter-row th { padding: 0.5rem 1.25rem 1rem 1.25rem; background-color: #f8f9fb; border-bottom: 1px solid #e5e7eb; }
                
                .inline-filter { width: 100%; padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.85rem; outline: none; background: white; color: #4b5563; transition: border-color 0.2s; }
                .inline-filter:focus { border-color: #0d5f68; box-shadow: 0 0 0 2px rgba(13,95,104,0.1); }
                
                .employee-table td { padding: 0.85rem 1.25rem; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-size: 0.95rem; vertical-align: middle; }
                .employee-table tr:hover td { background-color: #f9fafb; }
                
                .emp-profile { display: flex; align-items: center; gap: 0.75rem; }
                .emp-avatar { width: 36px; height: 36px; background-color: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; border: 2px solid white; box-shadow: 0 0 0 1.5px #eef2ff; }
                .emp-name { font-weight: 600; color: #111827; }
                
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; justify-content: center; min-width: 100px; transition: transform 0.2s; text-transform: uppercase; }
                .status-scheduled { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
                .status-rescheduled { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
                .status-cancelled { background: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6; }
                .status-expired { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
                
                .actions-wrapper { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
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
                
                .offer-code-badge { padding: 0.4rem 0.8rem; border-radius: 6px; font-family: monospace; font-weight: 700; font-size: 0.75rem; }
                .btn-primary { background: #0d5f68; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-size: 13px; }
                .reason-label { font-size: 0.8rem; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 0.4rem; display: block; }
                .error-text { color: #ef4444; font-size: 11px; margin-top: 4px; font-weight: 600; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 50; backdrop-filter: blur(4px); }
                .modal-content { background: white; width: 95%; max-width: 1000px; height: 85vh; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; }
                .form-header { background: #0d4d4d; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; color: white; }
                .form-body { flex: 1; padding: 1.5rem; overflow-y: auto; background-color: #f8fafc; display: flex; flex-direction: column; gap: 1.5rem; }
                .form-card { background: white; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; }
                .form-card-title { font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.03em; }
                .modal-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
                .form-group label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 0.25rem; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; color: #1e293b; background: #fff; }
                .form-footer { padding: 1rem 1.5rem; background: white; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 0.75rem; }
                .btn-cancel-premium { padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; color: #64748b; background: white; border: 1px solid #e2e8f0; cursor: pointer; }
                .premium-spinner { position: relative; width: 60px; height: 60px; }
                .premium-core { width: 100%; height: 100%; border: 4px solid #f1f5f9; border-top: 4px solid #0d5f68; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .col-span-2 { grid-column: span 2 / span 2; }
            `}</style>
        </div>
    );
};

export default Offer;
