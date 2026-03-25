import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    Users, Plus, Search, Filter, RefreshCcw,
    MoreVertical, Edit, Trash2, Mail, Phone,
    MapPin, Calendar, Briefcase, DollarSign,
    Link, Globe, Github, Linkedin, Award,
    User, CheckCircle, Clock, X, Eye, RotateCcw,
    ChevronDown,
    ChevronRight,
    Upload
} from 'lucide-react';
import './Recruitment.css';
import api from '../../api/api';
import SearchableSelect from '../../components/common/SearchableSelect';
import MultiSelect from '../../components/common/MultiSelect';
import departmentService from '../../services/departmentService';
import positionService from '../../services/positionService';

const Candidate = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Master Data State
    const [departments, setDepartments] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [allLocations, setAllLocations] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        vacancyId: '',
        departmentId: '',
        experience: '',
        noticePeriod: 'Immediate',
        status: 'New',
        source: '',
        currentCompany: '',
        currentLocation: '',
        currentCTC: '',
        expectedCTC: '',
        skills: '',
        remarks: '',
        linkedinUrl: '',
        portfolioUrl: '',
        githubUrl: '',
        highestQualification: '',
        preferredLocation: '',
        availableToJoin: '',
        dob: '',
        gender: '',
        address: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [candRes, vacRes, posRes, deptRes, skillRes, locRes] = await Promise.all([
                api.get('/candidates').catch(() => ({ data: [] })),
                api.get('/vacancies?approval=Approved&limit=1000').catch(() => ({ data: [] })),
                positionService.getAllPositions().catch(() => []),
                departmentService.getAllDepartments().catch(() => []),
                api.get('/skills').catch(() => ({ data: { data: [] } })),
                api.get('/locations').catch(() => ({ data: { data: [] } }))
            ]);
            
            // Properly unwrap data from paginated responses
            const cands = (candRes.data && Array.isArray(candRes.data.data)) ? candRes.data.data : (Array.isArray(candRes.data) ? candRes.data : []);
            const vacs = (vacRes.data && Array.isArray(vacRes.data.data)) ? vacRes.data.data : (Array.isArray(vacRes.data) ? vacRes.data : []);
            const skillsData = (skillRes.data && Array.isArray(skillRes.data.data)) ? skillRes.data.data : (Array.isArray(skillRes.data) ? skillRes.data : []);
            const locationsData = (locRes.data && Array.isArray(locRes.data.data)) ? locRes.data.data : (Array.isArray(locRes.data) ? locRes.data : []);
            
            setCandidates(cands);
            setVacancies(vacs);
            setPositions(posRes);
            setDepartments(deptRes);
            setAllSkills(skillsData.map(s => ({ value: s.name || s, label: s.name || s })));
            setAllLocations(locationsData.map(l => ({ value: l.name || l, label: l.name || l })));
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load candidates and master data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const validateForm = () => {
        const errors = {};
        if (!formData.name?.trim()) errors.name = "Candidate name is required";
        if (!formData.email?.trim()) {
            errors.email = "Email address is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Invalid email format";
        }
        if (!formData.phone?.trim()) {
            errors.phone = "Phone number is required";
        } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
            errors.phone = "Invalid phone number (10-15 digits required)";
        }
        if (!formData.role?.trim()) errors.role = "Applied for (Role) is required";
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const up = { ...prev, [field]: value };
            
            // Auto-fill logic when vacancy is selected
            if (field === 'vacancyId' && value) {
                const selectedVac = vacancies.find(v => (v._id || v.id) === value);
                if (selectedVac) {
                    // Use nested position data if available
                    if (selectedVac.position?.name) {
                        up.role = selectedVac.position.name;
                    } else {
                        // Fallback to finding in positions master data
                        const pos = positions.find(p => p.id === selectedVac.positionId || p.value === selectedVac.positionId);
                        if (pos) up.role = pos.label || pos.name;
                    }

                    // Also auto-fill department if available
                    if (selectedVac.departmentId) {
                        up.departmentId = selectedVac.departmentId;
                    }
                }
            }
            
            return up;
        });
        // Clear error when user types
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const locationOptions = [
        ...allLocations,
        ...[
            "Chennai", "Bangalore", "Hyderabad", "Mumbai", "Pune", "Delhi", "Gurugram", "Noida", "Kochi", "Coimbatore",
            "Trichy", "Ahmedabad", "Kolkata", "Remote (India)", "Other"
        ].map(city => ({ value: city, label: city }))
    ].filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i);

    const commonSkills = [
        ...allSkills,
        ...[
            "React", "Node.js", "Express", "React Native", "Javascript", "TypeScript", "Python", "Java", "PHP", "Laravel",
            "NestJS", "Next.js", "Flutter", "TailwindCSS", "CSS3", "HTML5", "PostgreSQL", "MongoDB", "MySQL", "AWS",
            "Azure", "Git", "Docker", "Redux", "Context API", "Prisma", "Go", "DotNet", "QA testing", "Manual Testing"
        ].map(skill => ({ value: skill, label: skill }))
    ].filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i);

    const handleEditClick = (c) => {
        // Ensure skills is an array for MultiSelect if it came as a comma string
        let skillsArr = [];
        if (typeof c.skills === 'string') {
            skillsArr = c.skills.split(',').map(s => s.trim()).filter(s => s);
        } else if (Array.isArray(c.skills)) {
            skillsArr = c.skills;
        }

        setSelectedCandidate(c);
        setFormData({
            ...c,
            vacancyId: c.vacancyId || '',
            skills: skillsArr
        });
        setFormErrors({});
        setViewMode('edit');
    };

    const handleAddClick = () => {
        setSelectedCandidate(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: '',
            vacancyId: '',
            departmentId: '',
            experience: '',
            noticePeriod: 'Immediate',
            status: 'New',
            source: '',
            currentCompany: '',
            currentLocation: '',
            currentCTC: '',
            expectedCTC: '',
            skills: '',
            remarks: '',
            linkedinUrl: '',
            portfolioUrl: '',
            githubUrl: '',
            highestQualification: '',
            preferredLocation: '',
            availableToJoin: '',
            dob: '',
            gender: '',
            address: ''
        });
        setFormErrors({});
        setViewMode('create');
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        const submissionData = {
            ...formData,
            skills: Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills
        };

        try {
            if (viewMode === 'edit') {
                await api.put(`/candidates/${selectedCandidate._id || selectedCandidate.id}`, submissionData);
                toast.success("Candidate updated successfully!");
            } else {
                await api.post('/candidates', submissionData);
                toast.success("Candidate added successfully!");
            }
            setViewMode('list');
            fetchData();
        } catch (error) {
            console.error("Submit error:", error);
            const msg = error.response?.data?.message || "Operation failed.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const renderCandidateForm = () => {
        const isEdit = viewMode === 'edit';
        
        const vacancyOptions = vacancies.map(v => ({
            value: v._id || v.id,
            label: `${v.requestNumber} - ${v.position?.name || 'Unknown Position'}`
        }));

        const departmentOptions = departments.map(d => ({
            value: d.id || d.value,
            label: d.label || d.name
        }));

        return (
            <div className="modal-overlay" onClick={() => setViewMode('list')}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', height: '90vh' }}>
                    <div className="form-header">
                        <div>
                            <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Candidate' : 'Add New Candidate'}</h2>
                            <p className="text-xs text-white/70">Complete the candidate profile across all sections</p>
                        </div>
                        <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>

                    <div className="form-body" style={{ overflowY: 'auto' }}>
                        {/* Section 1: Basic & Contact */}
                        <div className="form-card">
                            <div className="form-card-title flex items-center gap-2"><User size={16} /> Basic & Contact Information</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Candidate Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => handleInputChange('name', e.target.value)}
                                        placeholder="Full Name" 
                                        className={formErrors.name ? 'input-error' : ''}
                                    />
                                    {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Email Address <span className="text-red-500">*</span></label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        placeholder="john@example.com" 
                                        className={formErrors.email ? 'input-error' : ''}
                                    />
                                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Phone Number <span className="text-red-500">*</span></label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone ?? ''} 
                                        onChange={e => handleInputChange('phone', e.target.value)}
                                        placeholder="+91 9876543210" 
                                        maxLength={16}
                                        className={formErrors.phone ? 'input-error' : ''}
                                    />
                                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Source</label>
                                    <select value={formData.source} onChange={e => handleInputChange('source', e.target.value)}>
                                        <option value="">Select Source</option>
                                        <option>LinkedIn</option>
                                        <option>Referral</option>
                                        <option>Naukri</option>
                                        <option>Indeed</option>
                                        <option>Career Page</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Application Details */}
                        <div className="form-card">
                            <div className="form-card-title flex items-center gap-2"><Briefcase size={16} /> Application Details</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Select Vacancy</label>
                                    <SearchableSelect
                                        options={vacancyOptions}
                                        value={formData.vacancyId}
                                        onChange={val => handleInputChange('vacancyId', val)}
                                        placeholder="Select Vacancy"
                                        error={!!formErrors.vacancyId}
                                    />
                                    {formErrors.vacancyId && <span className="error-text">{formErrors.vacancyId}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Applied For (Role) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.role ?? ''} 
                                        onChange={e => handleInputChange('role', e.target.value)}
                                        placeholder="e.g. Senior React Developer" 
                                        className={formErrors.role ? 'input-error' : ''}
                                    />
                                    {formErrors.role && <span className="error-text">{formErrors.role}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <SearchableSelect
                                        options={departmentOptions}
                                        value={formData.departmentId}
                                        onChange={val => handleInputChange('departmentId', val)}
                                        placeholder="Select Department"
                                        error={!!formErrors.departmentId}
                                    />
                                    {formErrors.departmentId && <span className="error-text">{formErrors.departmentId}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Current Status</label>
                                    <select 
                                        value={formData.status || 'New'}
                                        onChange={e => handleInputChange('status', e.target.value)}
                                    >
                                        <option>New</option>
                                        <option>Screening</option>
                                        <option>Interview</option>
                                        <option>Offer Sent</option>
                                        <option>Hired</option>
                                        <option>Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Professional Experience */}
                        <div className="form-card">
                            <div className="form-card-title flex items-center gap-2"><Award size={16} /> Professional Experience</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Total Experience (Years)</label>
                                    <input 
                                        type="text" 
                                        value={formData.experience} 
                                        onChange={e => handleInputChange('experience', e.target.value.replace(/[^0-9.]/g, ''))} 
                                        placeholder="e.g. 5.5" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Current Company</label>
                                    <input type="text" value={formData.currentCompany} onChange={e => handleInputChange('currentCompany', e.target.value)} placeholder="Company Name" />
                                </div>
                                <div className="form-group">
                                    <label>Current Location</label>
                                    <SearchableSelect
                                        options={locationOptions}
                                        value={formData.currentLocation}
                                        onChange={val => handleInputChange('currentLocation', val)}
                                        placeholder="Select City"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Notice Period</label>
                                    <select value={formData.noticePeriod} onChange={e => handleInputChange('noticePeriod', e.target.value)}>
                                        <option>Immediate</option>
                                        <option>15 Days</option>
                                        <option>30 Days</option>
                                        <option>60 Days</option>
                                        <option>90 Days</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Current CTC (LPA)</label>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            className="pl-8" 
                                            value={formData.currentCTC} 
                                            onChange={e => handleInputChange('currentCTC', e.target.value.replace(/[^0-9.]/g, ''))} 
                                            placeholder="0.00" 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Expected CTC (LPA)</label>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            className="pl-8" 
                                            value={formData.expectedCTC} 
                                            onChange={e => handleInputChange('expectedCTC', e.target.value.replace(/[^0-9.]/g, ''))} 
                                            placeholder="0.00" 
                                        />
                                    </div>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Skills <span className="text-secondary opacity-50 text-[10px] ml-1">(Multi-select)</span></label>
                                    <MultiSelect
                                        options={commonSkills}
                                        value={Array.isArray(formData.skills) ? formData.skills : []}
                                        onChange={val => handleInputChange('skills', val)}
                                        placeholder="Select Skills"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Social & Links */}
                        <div className="form-card">
                            <div className="form-card-title flex items-center gap-2"><Globe size={16} /> Profiles & Portfolio</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>LinkedIn URL</label>
                                    <div className="relative">
                                        <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" className="pl-8" value={formData.linkedinUrl} onChange={e => handleInputChange('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>GitHub URL</label>
                                    <div className="relative">
                                        <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" className="pl-8" value={formData.githubUrl} onChange={e => handleInputChange('githubUrl', e.target.value)} placeholder="https://github.com/..." />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Portfolio URL</label>
                                    <div className="relative">
                                        <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" className="pl-8" value={formData.portfolioUrl} onChange={e => handleInputChange('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.com" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Personal & Education */}
                        <div className="form-card">
                            <div className="form-card-title flex items-center gap-2"><Calendar size={16} /> Personal & Education</div>
                            <div className="modal-info-grid">
                                <div className="form-group">
                                    <label>Highest Qualification</label>
                                    <input type="text" value={formData.highestQualification} onChange={e => handleInputChange('highestQualification', e.target.value)} placeholder="e.g. B.Tech CS" />
                                </div>
                                <div className="form-group">
                                    <label>Preferred Location</label>
                                    <SearchableSelect
                                        options={locationOptions}
                                        value={formData.preferredLocation}
                                        onChange={val => handleInputChange('preferredLocation', val)}
                                        placeholder="Select Preferred City"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" value={formData.dob} onChange={e => handleInputChange('dob', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)}>
                                        <option value="">Select Gender</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Available to Join (Date)</label>
                                    <input type="date" value={formData.availableToJoin} onChange={e => handleInputChange('availableToJoin', e.target.value)} />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                    <label>Address</label>
                                    <textarea 
                                        rows="2" 
                                        value={formData.address} 
                                        onChange={e => handleInputChange('address', e.target.value)}
                                        placeholder="Full current address..."
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Resume & Remarks */}
                        <div className="form-card">
                            <div className="form-card-title flex items-center gap-2"><FileText size={16} /> Documents & Remarks</div>
                            <div className="modal-info-grid">
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Resume Upload</label>
                                    <div className="file-upload-zone" onClick={() => document.getElementById('resume-file').click()}>
                                        <Upload size={24} className="text-gray-400 mb-2" />
                                        <span>Click to upload resume</span>
                                        <input type="file" id="resume-file" style={{ display: 'none' }} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 4' }}>
                                    <label>Remarks</label>
                                    <textarea 
                                        rows="3" 
                                        value={formData.remarks} 
                                        onChange={e => handleInputChange('remarks', e.target.value)}
                                        placeholder="Interviewer notes, background check info, etc."
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => setViewMode('list')} disabled={submitting}>Cancel</button>
                        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Processing...' : (isEdit ? 'Save Changes' : 'Add Candidate')}
                        </button>
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
                        <h2 className="text-xl font-bold text-white">Candidate Details - {c.name}</h2>
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
                        <button className="btn-primary" onClick={() => setViewMode('edit')}>Edit Candidate</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="employees-page">
            {viewMode === 'create' || viewMode === 'edit' ? renderCandidateForm() : null}
            {viewMode === 'view' ? renderCandidateDetail() : null}

            <div className="page-header">
                <h1 className="page-title">Candidate Management</h1>
                <button className="btn-primary" onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Add Candidate</span>
                </button>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
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
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="ID" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Exp" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Name" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Email" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Role" /></th>
                                <th className="text-center"><input type="text" className="inline-filter text-center" placeholder="Status" /></th>
                                <th><input type="text" className="inline-filter" placeholder="Notice" /></th>
                                <th className="text-center">
                                    <button className="btn-reset-filters-roles" title="Reset Filters"><RotateCcw size={16} /></button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin text-teal-600"><RotateCcw size={24} /></div>
                                            <span className="text-gray-500 font-medium">Loading candidates...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-400">No candidates found.</td>
                                </tr>
                            ) : candidates.map(candidate => (
                                <tr key={candidate._id || candidate.id}>
                                    <td className="text-center font-mono text-blue-600 font-medium">{candidate.candidateId || (candidate._id || candidate.id).substring(0, 8).toUpperCase()}</td>
                                    <td className="font-mono text-sm">{candidate.experience}</td>
                                    <td>
                                        <div className="emp-profile">
                                            <div className="emp-avatar">
                                                {candidate.name?.charAt(0)}
                                            </div>
                                            <span className="emp-name">{candidate.name}</span>
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
                                    <td>
                                        <div className="actions-wrapper" style={{ justifyContent: 'center' }}>
                                            <button className="action-btn view" title="View" onClick={() => { setSelectedCandidate(candidate); setViewMode('view'); }}>
                                                <Eye size={18} />
                                            </button>
                                            <button className="action-btn edit" title="Edit" onClick={() => handleEditClick(candidate)}>
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
                <div className="pagination">
                    <span className="pagination-info">Showing 1 to 3 of 3 entries</span>
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
                .text-gray-700 { color: #374151; }
                .text-sm { font-size: 0.875rem; }
                
                .input-error {
                    border-color: #f87171 !important;
                    background-color: #fef2f2 !important;
                }
                .error-text {
                    color: #ef4444;
                    font-size: 0.7rem;
                    margin-top: 0.35rem;
                    display: block;
                    font-weight: 600;
                    letter-spacing: 0.01em;
                }
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    margin-bottom: 0.5rem;
                }
                .text-teal-600 { color: #0d5f68; }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .file-upload-zone {
                    border: 2px dashed #e2e8f0;
                    border-radius: 12px;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #64748b;
                    font-size: 0.9rem;
                }
                .file-upload-zone:hover {
                    border-color: #0d5f68;
                    background-color: #f8fafc;
                    color: #0d5f68;
                }
            `}</style>
        </div>
    );
};

export default Candidate;
