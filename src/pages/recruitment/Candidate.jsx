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
    Upload,
    FileText,
    Copy,
    Loader2
} from 'lucide-react';
import './Recruitment.css';
import api from '../../api/api';
import SearchableSelect from '../../components/common/SearchableSelect';
import MultiSelect from '../../components/common/MultiSelect';
import PhoneInput from '../../components/common/PhoneInput';
import { departmentService } from '../../services/departmentService';
import { positionService } from '../../services/positionService';
import { locationService } from '../../services/locationService';
import { candidateService } from '../../services/candidateService';

const Candidate = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
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
        availableToJoin: '',
        dob: '',
        gender: '',
        address: '',
        resumeFile: null,
        preferredLocation: []
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Filtering & Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [filters, setFilters] = useState({ 
        candidateId: '',
        name: '', 
        email: '',
        experience: '',
        role: '',
        status: '',
        noticePeriod: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [candRes, vacRes, posRes, deptRes, skillRes, locRes] = await Promise.all([
                candidateService.getAllCandidates(currentPage, itemsPerPage, filters),
                api.get('/vacancies?approval=Approved&limit=1000').catch(() => ({ data: [] })),
                positionService.getAllPositions().catch(() => []),
                departmentService.getAllDepartments().catch(() => []),
                api.get('/skills').catch(() => ({ data: { data: [] } })),
                locationService.getAllLocations().catch(() => [])
            ]);
            
            // Adjust based on typical REST pagination response { data: [], total: 100 }
            const candidatesData = candRes.data?.data || candRes.data || candRes || [];
            setCandidates(candidatesData);
            setTotalEntries(candRes.data?.total || candidatesData.length);
            
            // Better unwrapping for all dropdowns
            const rawVacs = (vacRes.data?.data) || (vacRes.data) || [];
            const rawSkills = (skillRes.data?.data) || (skillRes.data) || [];
            const rawDepts = (deptRes.data?.data) || (deptRes.data) || Array.isArray(deptRes) ? deptRes : [];
            const rawPositions = (posRes.data?.data) || (posRes.data) || Array.isArray(posRes) ? posRes : [];

            setVacancies(Array.isArray(rawVacs) ? rawVacs : []);
            setPositions(Array.isArray(rawPositions) ? rawPositions : []);
            setDepartments(Array.isArray(rawDepts) ? rawDepts : []);
            setAllSkills(Array.isArray(rawSkills) ? rawSkills.map(s => ({ 
                value: s._id || s.id || s, 
                label: s.name || s 
            })) : []);
            setAllLocations(Array.isArray(locRes) ? locRes : []);

            console.log('Fetched Candidates:', candRes.data?.length || candRes?.length);
            console.log('Fetched Vacancies:', rawVacs.length);
        } catch (error) {
            console.error("Critical error in fetchData:", error);
            toast.error("Some data failed to load. Please refresh.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // Debounce
        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(0); // Reset to first page on filter
    };

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
        } else if (formData.phone.replace(/\D/g, '').length < 5) {
            errors.phone = "Invalid phone number";
        }
        if (!formData.role?.trim()) errors.role = "Applied for (Role) is required";
        if (!formData.resumeFile) errors.resumeFile = "Resume upload is mandatory";

        // URL Validation
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
        if (formData.linkedinUrl && !urlPattern.test(formData.linkedinUrl)) {
            errors.linkedinUrl = "Invalid LinkedIn URL";
        }
        if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
            errors.githubUrl = "Invalid GitHub URL";
        }
        if (formData.portfolioUrl && !urlPattern.test(formData.portfolioUrl)) {
            errors.portfolioUrl = "Invalid Portfolio URL";
        }
        
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

    const locationOptions = Array.isArray(allLocations) ? allLocations : [];

    const commonSkills = Array.isArray(allSkills) ? allSkills : [];

    const handleViewDetails = async (c) => {
        setLoadingDetails(true);
        try {
            const res = await candidateService.getCandidateById(c._id || c.id);
            const fullData = res.data?.data || res.data;
            if (fullData) {
                setSelectedCandidate(fullData);
            } else {
                setSelectedCandidate(c); // Fallback
            }
            setViewMode('view');
        } catch (error) {
            console.error("Error fetching candidate details:", error);
            toast.error("Failed to load details. Showing basic info.");
            setSelectedCandidate(c);
            setViewMode('view');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleEditClick = (c) => {
        // Helper to format date strings for HTML5 date input (YYYY-MM-DD)
        const formatForDateInput = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            return d.toISOString().split('T')[0];
        };

        // Ensure skills is an array for MultiSelect
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
            skills: skillsArr,
            dob: formatForDateInput(c.dob),
            availableToJoin: formatForDateInput(c.availableToJoin)
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

    const handleDelete = (candidate) => {
        setSelectedCandidate(candidate);
        setViewMode('delete');
    };

    const handleConfirmDelete = async () => {
        if (!selectedCandidate) return;
        setSubmitting(true);
        try {
            await candidateService.deleteCandidate(selectedCandidate._id || selectedCandidate.id);
            toast.success('Candidate deleted successfully');
            fetchData();
            setViewMode('list');
        } catch (error) {
            console.error("Error deleting candidate:", error);
            toast.error('Failed to delete candidate');
        } finally {
            setSubmitting(false);
            setSelectedCandidate(null);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        const submissionData = {
            ...formData,
            skills: Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills,
            preferredLocation: Array.isArray(formData.preferredLocation) ? formData.preferredLocation.join(', ') : formData.preferredLocation,
            resumeUrl: formData.resumeFile?.url || ''
        };

        try {
            if (viewMode === 'edit' && selectedCandidate) { // Changed currentCandidate to selectedCandidate
                await candidateService.updateCandidate(selectedCandidate._id || selectedCandidate.id, submissionData); // Updated to use candidateService
                toast.success('Candidate updated successfully'); // Changed message
            } else {
                await candidateService.createCandidate(submissionData); // Updated to use candidateService
                toast.success('Candidate added successfully'); // Changed message
            }
            setViewMode('list'); // Changed setShowModal(false) to setViewMode('list')
            fetchData();
        } catch (error) {
            console.error("Submit error:", error);
            const msg = error.response?.data?.message || "Operation failed.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation: Extension
        const allowedExtensions = ['pdf', 'doc', 'docx'];
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            toast.error("Only PDF, DOC, and DOCX files are allowed.");
            return;
        }

        // Validation: Size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should not exceed 5MB.");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await api.post('/common/upload?folder=resumes', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // Assuming response format from user screenshot: data[0] contains the info
            const fileInfo = response.data?.data?.[0];
            if (fileInfo) {
                setFormData(prev => ({ ...prev, resumeFile: fileInfo }));
                setFormErrors(prev => ({ ...prev, resumeFile: null }));
                toast.success("Resume uploaded successfully!");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload resume.");
        } finally {
            setUploading(false);
        }
    };

    const renderCandidateForm = () => {
        const isEdit = viewMode === 'edit';
        
        const vacancyOptions = (Array.isArray(vacancies) ? vacancies : []).map(v => ({
            value: v._id || v.id,
            label: `${v.requestNumber} - ${v.position?.name || 'Unknown Position'}`
        }));

        const departmentOptions = (Array.isArray(departments) ? departments : []).map(d => ({
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
                                    <PhoneInput 
                                        value={formData.phone ?? ''} 
                                        onChange={val => handleInputChange('phone', val)}
                                        placeholder="9876543210" 
                                        error={!!formErrors.phone}
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
                                        <input 
                                            type="text" 
                                            className={`pl-8 ${formErrors.linkedinUrl ? 'input-error' : ''}`} 
                                            value={formData.linkedinUrl} 
                                            onChange={e => handleInputChange('linkedinUrl', e.target.value)} 
                                            placeholder="https://linkedin.com/in/..." 
                                        />
                                    </div>
                                    {formErrors.linkedinUrl && <span className="error-text">{formErrors.linkedinUrl}</span>}
                                </div>
                                <div className="form-group">
                                    <label>GitHub URL</label>
                                    <div className="relative">
                                        <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            className={`pl-8 ${formErrors.githubUrl ? 'input-error' : ''}`} 
                                            value={formData.githubUrl} 
                                            onChange={e => handleInputChange('githubUrl', e.target.value)} 
                                            placeholder="https://github.com/..." 
                                        />
                                    </div>
                                    {formErrors.githubUrl && <span className="error-text">{formErrors.githubUrl}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Portfolio URL</label>
                                    <div className="relative">
                                        <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            className={`pl-8 ${formErrors.portfolioUrl ? 'input-error' : ''}`} 
                                            value={formData.portfolioUrl} 
                                            onChange={e => handleInputChange('portfolioUrl', e.target.value)} 
                                            placeholder="https://yourportfolio.com" 
                                        />
                                    </div>
                                    {formErrors.portfolioUrl && <span className="error-text">{formErrors.portfolioUrl}</span>}
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
                                    <MultiSelect 
                                        options={allLocations} 
                                        value={formData.preferredLocation} 
                                        onChange={(val) => handleInputChange('preferredLocation', val)} 
                                        placeholder="Select Preferred Locations" 
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
                                    <label>Resume Upload <span className="text-red-500">*</span></label>
                                    <div 
                                        className={`file-upload-zone ${uploading ? 'uploading' : ''} ${formData.resumeFile ? 'has-file' : ''} ${formErrors.resumeFile ? 'error-border' : ''}`} 
                                        onClick={() => !uploading && document.getElementById('resume-file').click()}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', width: '100%' }}
                                    >
                                        <div className="upload-content" style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                            {uploading ? (
                                                <div className="upload-loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="loader-spinner"></div>
                                                    <p className="text-sm font-semibold">Uploading... {uploadProgress}%</p>
                                                    <div className="progress-bar-bg" style={{ width: '200px' }}>
                                                        <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                                                    </div>
                                                </div>
                                             ) : formData.resumeFile ? (
                                                 <div className="uploaded-file-card flex items-center gap-4 p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl w-full max-w-[450px] mx-auto shadow-sm animate-fadeIn">
                                                     <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-xl">
                                                         <CheckCircle size={24} />
                                                     </div>
                                                     <div className="flex-1 min-w-0 text-left">
                                                         <p className="text-sm font-black text-slate-800 tracking-tight leading-tight">Resume Attached</p>
                                                         <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{formData.resumeFile.originalName}</p>
                                                     </div>
                                                     <button 
                                                         type="button"
                                                         className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                                                         onClick={(e) => {
                                                             e.stopPropagation();
                                                             setFormData(p => ({ ...p, resumeFile: null }));
                                                         }}
                                                         title="Remove file"
                                                     >
                                                         <Trash2 size={18} />
                                                     </button>
                                                 </div>
                                            ) : (
                                                <>
                                                    <Upload size={24} className="text-slate-400 mb-2" />
                                                    <span>Click to upload resume (PDF, DOC, DOCX)</span>
                                                </>
                                            )}
                                        </div>
                                        <input 
                                            type="file" 
                                            id="resume-file" 
                                            style={{ display: 'none' }} 
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {formErrors.resumeFile && <span className="error-text">{formErrors.resumeFile}</span>}
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
        
        // Helper to format date
        const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString();
        };

        return (
            <div className="modal-overlay" onClick={() => { setViewMode('list'); setSelectedCandidate(null); }}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="form-header">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                             Candidate Profile: {c.name}
                        </h2>
                        <button className="icon-btn" onClick={() => { setViewMode('list'); setSelectedCandidate(null); }}><X size={20} /></button>
                    </div>

                    <div className="form-body">
                        {/* Summary Info */}
                        <div className="form-card">
                            <div className="form-card-title">Personal Information</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Full Name</label><div>{c.name || 'N/A'}</div></div>
                                <div className="info-item"><label>Email Address</label><div className="text-blue-600">{c.email || 'N/A'}</div></div>
                                <div className="info-item"><label>Phone Number</label><div>{c.phone || 'N/A'}</div></div>
                                <div className="info-item"><label>Gender / Age</label><div>{c.gender || 'Not specified'} / {c.dob ? `${new Date().getFullYear() - new Date(c.dob).getFullYear()} Years` : 'N/A'}</div></div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}><label>Permanent Address</label><div>{c.address || 'N/A'}</div></div>
                            </div>
                        </div>

                        <div className="form-card" style={{ marginTop: '1.5rem' }}>
                            <div className="form-card-title">Recruitment & Status</div>
                            <div className="modal-info-grid">
                                <div className="info-item">
                                    <label>Candidate Code</label>
                                    <div className="bg-blue-50/50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 font-bold text-sm w-fit mt-1 uppercase tracking-tight">
                                        {c.candidateCode || c.candidateId || 'N/A'}
                                    </div>
                                </div>
                                <div className="info-item"><label>Applied For Role</label><div className="font-bold text-slate-800 mt-1">{c.role || 'N/A'}</div></div>
                                <div className="info-item"><label>Vacancy / REQ</label><div className="font-medium text-slate-600 mt-1">{c.vacancy?.requestNumber || 'N/A'}</div></div>
                                <div className="info-item"><label>Notice Period</label><div className="text-orange-600 font-bold mt-1">{c.noticePeriod || 'N/A'}</div></div>
                                <div className="info-item"><label>Experience</label><div className="font-semibold text-slate-700 mt-1">{c.experience || '0'} Years</div></div>
                                <div className="info-item">
                                    <label>Candidate Status</label>
                                    <div className="flex items-center mt-1">
                                        <span className={`status-badge ${
                                            c.status === 'New' ? 'status-new' :
                                            c.status === 'Interview' ? 'status-interview' :
                                            c.status === 'Rejected' ? 'status-rejected' : 'status-passed'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-item"><label>Available to Join</label><div>{formatDate(c.availableToJoin)}</div></div>
                                <div className="info-item"><label>Current Location</label><div>{c.currentLocationData?.name || 'N/A'}</div></div>
                            </div>
                        </div>

                        <div className="form-card" style={{ marginTop: '1.5rem' }}>
                            <div className="form-card-title">Financials & Expertise</div>
                            <div className="modal-info-grid">
                                <div className="info-item"><label>Current CTC (LPA)</label><div>₹{c.currentCTC || '0.00'}</div></div>
                                <div className="info-item"><label>Expected CTC (LPA)</label><div>₹{c.expectedCTC || '0.00'}</div></div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Key Skills Identified</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(c.skillsData && c.skillsData.length > 0) ? c.skillsData.map((skill, idx) => (
                                            <span key={idx} className="bg-teal-50 text-teal-700 px-3 py-1 rounded text-xs font-bold border border-teal-100">
                                                {skill.name || skill}
                                            </span>
                                        )) : <span className="text-slate-400 italic">No skills listed</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-card" style={{ marginTop: '1.5rem' }}>
                            <div className="form-card-title">Documents & Remarks</div>
                            <div className="modal-info-grid">
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Resume Document</label>
                                    {c.resumeFile ? (
                                        <a 
                                            href={`http://localhost:5002/api/candidates/resume/${c.resumeFile.fileName}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all w-fit"
                                        >
                                            <FileText size={16} /> View Attached Resume ({c.resumeFile.originalName})
                                        </a>
                                    ) : <span className="text-slate-400 italic">No resume uploaded</span>}
                                </div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Remarks / Internal Notes</label>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm italic">
                                        {c.remarks || 'No additional notes provided.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button className="btn-secondary" onClick={() => { setViewMode('list'); setSelectedCandidate(null); }}>Close Profile</button>
                        <button className="btn-primary" onClick={() => setViewMode('edit')} style={{ background: '#0d5f68' }}>
                            <Edit size={16} /> Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDeleteModal = () => {
        const c = selectedCandidate || {};
        return (
            <div className="modal-overlay" onClick={() => { setViewMode('list'); setSelectedCandidate(null); }}>
                <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="delete-header-premium">
                        <button className="icon-btn shadow-sm" onClick={() => { setViewMode('list'); setSelectedCandidate(null); }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="delete-body-premium text-center">
                        <div className="delete-icon-container">
                            <Trash2 size={40} strokeWidth={1.5} />
                        </div>
                        <h2 className="delete-title-premium text-2xl font-black tracking-tight mb-2">Delete Candidate?</h2>
                        <p className="delete-message-premium text-slate-500 leading-relaxed mb-6">
                            Are you sure you want to permanently delete this candidate? This action cannot be reversed.
                        </p>
                        <div className="delete-item-badge bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold mb-8 mx-auto w-fit">
                            {c.name || 'Unknown Candidate'}
                        </div>
                    </div>
                    <div className="delete-footer-premium flex gap-3 px-8 pb-8">
                        <button className="btn-cancel-premium flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer" onClick={() => { setViewMode('list'); setSelectedCandidate(null); }}>
                            Keep Candidate
                        </button>
                        <button className="btn-delete-premium flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100 transition-all cursor-pointer" onClick={handleConfirmDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    if (loading && candidates.length === 0) { // Only show page-level spinner if first load
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
                    <p className="premium-text">Loading Candidate Data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="employees-page">
            {viewMode === 'create' || viewMode === 'edit' ? renderCandidateForm() : null}
            {viewMode === 'view' ? renderCandidateDetail() : null}
            {viewMode === 'delete' ? renderDeleteModal() : null}

            <div className="page-header">
                <h1 className="page-title">Candidate Management</h1>
                <button className="btn-primary" onClick={handleAddClick} style={{ background: '#f8fafc', color: '#0d5f68', border: '1px solid #0d5f68', boxShadow: 'none' }}>
                    <Plus size={20} />
                    <span>Add Candidate</span>
                </button>
            </div>

            <div className="table-card" style={{ position: 'relative' }}>
                {loading && candidates.length > 0 && (
                    <div className="loading-overlay" style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.7)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(2px)',
                        transition: 'all 0.3s'
                    }}>
                        <div className="premium-spinner" style={{ width: '40px', height: '40px' }}>
                            <div className="premium-core"></div>
                        </div>
                    </div>
                )}
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th style={{ width: '150px' }} className="text-center">Candidate ID</th>
                                <th style={{ width: '220px' }}>Candidate Name</th>
                                <th style={{ width: '250px' }}>Email</th>
                                <th style={{ width: '130px' }} className="text-center">Experience</th>
                                <th style={{ width: '180px' }}>Applied For</th>
                                <th style={{ width: '150px' }} className="text-center">Status</th>
                                <th style={{ width: '160px' }}>Notice Period</th>
                                <th className="text-center" style={{ width: '150px' }}>Actions</th>
                            </tr>
                            <tr className="filter-row bg-slate-50/50">
                                <th className="text-center">
                                    <input 
                                        type="text" 
                                        className="inline-filter text-center" 
                                        placeholder="ID" 
                                        value={filters.candidateId}
                                        onChange={(e) => handleFilterChange('candidateId', e.target.value)}
                                    />
                                </th>
                                <th>
                                    <input 
                                        type="text" 
                                        className="inline-filter" 
                                        placeholder="Name" 
                                        value={filters.name}
                                        onChange={(e) => handleFilterChange('name', e.target.value)}
                                    />
                                </th>
                                <th>
                                    <input 
                                        type="text" 
                                        className="inline-filter" 
                                        placeholder="Email" 
                                        value={filters.email}
                                        onChange={(e) => handleFilterChange('email', e.target.value)}
                                    />
                                </th>
                                <th className="text-center">
                                    <input 
                                        type="text" 
                                        className="inline-filter text-center" 
                                        placeholder="Exp" 
                                        value={filters.experience}
                                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                                    />
                                </th>
                                <th>
                                    <input 
                                        type="text" 
                                        className="inline-filter" 
                                        placeholder="Role" 
                                        value={filters.role}
                                        onChange={(e) => handleFilterChange('role', e.target.value)}
                                    />
                                </th>
                                <th className="text-center">
                                    <input 
                                        type="text" 
                                        className="inline-filter text-center" 
                                        placeholder="Status" 
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    />
                                </th>
                                <th>
                                    <input 
                                        type="text" 
                                        className="inline-filter" 
                                        placeholder="Notice" 
                                        value={filters.noticePeriod}
                                        onChange={(e) => handleFilterChange('noticePeriod', e.target.value)}
                                    />
                                </th>
                                <th className="text-center">
                                    <button 
                                        className="btn-reset-filters-roles" 
                                        title="Reset Filters"
                                        onClick={() => setFilters({ candidateId: '', name: '', email: '', experience: '', role: '', status: '', noticePeriod: '' })}
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-400">No candidates found.</td>
                                </tr>
                            ) : candidates.map(candidate => (
                                 <tr key={candidate._id || candidate.id}>
                                     <td className="text-center">
                                         <span className="candidate-code-badge">
                                            {candidate.candidateCode || candidate.candidateId || (candidate._id || candidate.id).substring(0, 8).toUpperCase()}
                                         </span>
                                     </td>
                                     <td>
                                         <div className="emp-profile">
                                             <div className="emp-avatar">
                                                 {candidate.name?.charAt(0)}
                                             </div>
                                             <span className="candidate-name-premium">{candidate.name}</span>
                                         </div>
                                     </td>
                                     <td className="text-sm font-medium text-slate-500">{candidate.email}</td>
                                     <td className="text-center">
                                         <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold text-xs">
                                             {candidate.experience || '0'} Yrs
                                         </span>
                                     </td>
                                     <td className="text-sm font-semibold text-slate-600 truncate max-w-[150px]">{candidate.role}</td>
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
                                            <button className="action-btn view" title="View" onClick={() => handleViewDetails(candidate)} disabled={loadingDetails}>
                                                <Eye size={18} />
                                            </button>
                                            <button className="action-btn edit" title="Edit" onClick={() => handleEditClick(candidate)}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="action-btn delete" title="Delete" onClick={() => handleDelete(candidate)}>
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
                    <span className="pagination-info">
                        Showing {candidates.length > 0 ? currentPage * itemsPerPage + 1 : 0} to {Math.min((currentPage + 1) * itemsPerPage, totalEntries)} of {totalEntries} entries
                    </span>
                    <div className="pagination-controls">
                        <button 
                            className={`page-btn ${currentPage === 0 ? 'disabled' : ''}`}
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                        >
                            Previous
                        </button>
                        {[...Array(Math.ceil(totalEntries / itemsPerPage))].map((_, i) => (
                            <button 
                                key={i}
                                className={`page-btn ${currentPage === i ? 'active' : ''}`}
                                onClick={() => setCurrentPage(i)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            className={`page-btn ${currentPage >= Math.ceil(totalEntries / itemsPerPage) - 1 ? 'disabled' : ''}`}
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={totalEntries === 0 || currentPage >= Math.ceil(totalEntries / itemsPerPage) - 1}
                        >
                            Next
                        </button>
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
                    background-color: #0d5f68;
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
                    padding: 0.75rem 1.25rem;
                    color: #475569;
                    font-weight: 700;
                    font-size: 0.75rem;
                    border-bottom: 1px solid #f1f5f9;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    vertical-align: middle;
                    background: #f8fafc;
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

                .form-group input, 
                .form-group select, 
                .form-group .multi-select-container,
                .form-group .searchable-select-container,
                .form-group .relative {
                    height: 44px !important;
                    min-height: 44px !important;
                    display: flex;
                    align-items: center;
                }
                
                .form-group .relative input {
                    height: 100% !important;
                    background: transparent;
                }
                
                .form-group .multi-select-container > div {
                    height: 100%;
                    border-radius: 6px;
                }

                .form-group .multi-select-container > div {
                    height: 100%;
                    border-radius: 6px;
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
                 .candidate-code-badge {
                    display: inline-block;
                    background-color: #f0f9ff;
                    color: #0369a1;
                    padding: 0.35rem 0.6rem;
                    border-radius: 8px;
                    font-family: 'JetBrains Mono', 'Monaco', monospace;
                    font-size: 0.75rem;
                    font-weight: 700;
                    border: 1px solid #e0f2fe;
                    letter-spacing: 0.02em;
                 }
                .candidate-name-premium {
                    color: #0f172a;
                    font-weight: 700;
                    font-size: 0.95rem;
                }
                .candidate-role-premium {
                    color: #0d5f68;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
            `}</style>
        </div>
    );
};

export default Candidate;
