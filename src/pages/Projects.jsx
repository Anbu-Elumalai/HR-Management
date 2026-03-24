import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { employeeService } from '../services/employeeService';
import SearchableSelect from '../components/common/SearchableSelect';
import {
    Briefcase,
    Plus,
    Eye,
    Pencil,
    Trash2,
    Calendar,
    MapPin,
    User,
    Search,
    X,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const Projects = () => {
    // Mock Data based on User's DTO
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pagination, setPagination] = useState({ total: 0, from: 0, to: 0, totalPages: 0 });
    const limit = 5;
    
    const [listFilters, setListFilters] = useState({
        name: '',
        manager: '',
        location: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Active',
        manager: '',
        location: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProjects(0, listFilters);
        }, 500);
        return () => clearTimeout(timer);
    }, [listFilters]);

    const fetchEmployees = async () => {
        try {
            const data = await employeeService.getAllEmployees();
            setEmployees(data || []);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    const fetchProjects = async (page = currentPage, filters = listFilters) => {
        try {
            setLoading(true);
            const res = await projectService.getAllProjects(page, limit, filters);
            const data = res.data || res; // Handle both wrapped and unwrapped APIs

            if (Array.isArray(data)) {
                setProjects(data);
                setPagination({
                    total: res.total || 0,
                    from: res.from || 0,
                    to: res.to || 0,
                    totalPages: res.totalPages || 0
                });
                // Ensure state is perfectly matched with backend
                setCurrentPage(page);
                setError(null);
            } else {
                console.error("API returned non-array data:", res);
                setProjects([]);
                setError('Unexpected data format received from server.');
            }
        } catch (err) {
            setError('Failed to fetch projects. Please try again later.');
            console.error(err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchProjects(newPage);
        }
    };

    // Reset Form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            status: 'Active',
            manager: '',
            location: ''
        });
        setSelectedProject(null);
        setFormErrors({});
    };

    // Handlers
    const handleAddNew = () => {
        resetForm();
        setViewMode('create');
    };

    const handleEdit = (project) => {
        setSelectedProject(project);
        setFormData({ 
            ...project,
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
            endDate: project.endDate ? project.endDate.split('T')[0] : ''
        });
        setViewMode('edit');
    };

    const handleView = (project) => {
        setSelectedProject(project);
        setViewMode('view');
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Project Name is required';
        if (!formData.location.trim()) errors.location = 'Location is required';
        if (!formData.startDate) errors.startDate = 'Start Date is required';
        if (!formData.endDate) errors.endDate = 'End Date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            errors.startDate = 'Start Date cannot be after End Date';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await projectService.deleteProject(projectToDelete.id);
            setProjects(projects.filter(p => p.id !== projectToDelete.id));
            toast.success('Project deleted successfully');
            setProjectToDelete(null);
        } catch (err) {
            console.error('Failed to delete project:', err);
            toast.error('Failed to delete project');
            setProjectToDelete(null);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            if (viewMode === 'create') {
                await projectService.createProject(formData);
                toast.success('Project created successfully');
            } else if (viewMode === 'edit') {
                await projectService.updateProject(selectedProject.id, formData);
                toast.success('Project updated successfully');
            }
            fetchProjects();
            setViewMode('list');
            resetForm();
        } catch (err) {
            console.error('Failed to save project:', err);
            toast.error(err.response?.data?.message || 'Failed to save project. Ensure API is running.');
        }
    };

    // Render Components
    const renderList = () => (
        <>
            <div className="page-header">
                <h1 className="page-title">Project Management</h1>
                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={20} />
                    <span>Add Project</span>
                </button>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    <table className="project-table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Manager</th>
                                <th>Location</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                            {/* Inline Filter Row */}
                            <tr className="filter-row">
                                <th>
                                    <input type="text" className="inline-filter" placeholder="Filter Name" 
                                        value={listFilters.name} onChange={e => setListFilters(f => ({...f, name: e.target.value}))} />
                                </th>
                                <th>
                                    <input type="text" className="inline-filter" placeholder="Filter Manager" 
                                        value={listFilters.manager} onChange={e => setListFilters(f => ({...f, manager: e.target.value}))} />
                                </th>
                                <th>
                                    <input type="text" className="inline-filter" placeholder="Filter Location" 
                                        value={listFilters.location} onChange={e => setListFilters(f => ({...f, location: e.target.value}))} />
                                </th>
                                <th>
                                    <input type="date" className="inline-filter" 
                                        value={listFilters.startDate} onChange={e => setListFilters(f => ({...f, startDate: e.target.value}))} />
                                </th>
                                <th>
                                    <input type="date" className="inline-filter" 
                                        value={listFilters.endDate} onChange={e => setListFilters(f => ({...f, endDate: e.target.value}))} />
                                </th>
                                <th>
                                    <select className="inline-filter" value={listFilters.status} onChange={e => setListFilters(f => ({...f, status: e.target.value}))}>
                                        <option value="">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-secondary">Loading projects...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-red-500">{error}</td>
                                </tr>
                            ) : (projects || []).length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-secondary">No projects found.</td>
                                </tr>
                            ) : (
                                (projects || []).map((project) => (
                                    <tr key={project.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="project-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', color: '#6366f1', flexShrink: 0 }}>
                                                    <Briefcase size={16} />
                                                </div>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>{project.name || '-'}</div>
                                            </div>
                                        </td>
                                        <td style={{ color: project.manager ? 'inherit' : '#9ca3af' }}>{project.manager || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' }}>
                                                <MapPin size={14} style={{ flexShrink: 0, color: '#9ca3af' }} />
                                                <span style={{ whiteSpace: 'nowrap' }}>{project.location || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="font-mono text-xs">{project.startDate ? project.startDate.split('T')[0] : '-'}</td>
                                        <td className="font-mono text-xs">{project.endDate ? project.endDate.split('T')[0] : '-'}</td>
                                        <td>
                                            <span className={`status-badge ${project.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                                                {project.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-wrapper">
                                                <button className="action-btn view" title="View" onClick={() => handleView(project)}><Eye size={18} /></button>
                                                <button className="action-btn edit" title="Edit" onClick={() => handleEdit(project)}><Pencil size={18} /></button>
                                                <button className="action-btn delete" title="Delete" onClick={() => handleDeleteClick(project)}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="pagination-info">
                        Showing {pagination.total === 0 ? 0 : pagination.from} to {Math.min(pagination.to, pagination.total)} of {pagination.total} entries
                    </span>
                    <div className="pagination-controls">
                        <button 
                            className={`page-btn ${currentPage <= 0 ? 'disabled' : ''}`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 0}
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: Math.max(1, pagination.totalPages) }).map((_, idx) => (
                            <button 
                                key={idx} 
                                className={`page-btn ${currentPage === idx ? 'active' : ''}`}
                                onClick={() => handlePageChange(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}

                        <button 
                            className={`page-btn ${currentPage >= (pagination.totalPages - 1) ? 'disabled' : ''}`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= (pagination.totalPages - 1) || pagination.totalPages === 0}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderForm = () => (
        <div className="modal-overlay" onClick={() => setViewMode('list')}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="form-header">
                    <h2 className="text-xl font-bold text-white">{viewMode === 'create' ? 'Create New Project' : 'Edit Project'}</h2>
                    <button className="icon-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                </div>

                <div className="form-body">
                    <div className="form-card">
                        <div className="form-card-title">Project Information</div>
                        <div className="modal-info-grid">
                            <div className="form-group span-1">
                                <label>Project Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={formErrors.name ? 'input-error' : ''}
                                    placeholder="Enter project name"
                                />
                                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                            </div>
                            <div className="form-group" style={{ position: 'relative', zIndex: 10 }}>
                                <label>Manager</label>
                                <SearchableSelect
                                    options={employees.map(emp => ({ value: emp.name, label: emp.name }))}
                                    value={formData.manager}
                                    onChange={(val) => setFormData({ ...formData, manager: val })}
                                    placeholder="Select Manager"
                                    error={!!formErrors.manager}
                                />
                                {formErrors.manager && <span className="error-text">{formErrors.manager}</span>}
                            </div>
                            <div className="form-group">
                                <label>Location <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className={formErrors.location ? 'input-error' : ''}
                                    placeholder="Location"
                                />
                                {formErrors.location && <span className="error-text">{formErrors.location}</span>}
                            </div>
                            <div className="form-group span-3">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Project details..."
                                    rows="3"
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-card">
                        <div className="form-card-title">Planning & Status</div>
                        <div className="modal-info-grid">
                            <div className="form-group">
                                <label>Start Date <span className="required">*</span></label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className={formErrors.startDate ? 'input-error' : ''}
                                />
                                {formErrors.startDate && <span className="error-text">{formErrors.startDate}</span>}
                            </div>

                            <div className="form-group">
                                <label>End Date <span className="required">*</span></label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className={formErrors.endDate ? 'input-error' : ''}
                                />
                                {formErrors.endDate && <span className="error-text">{formErrors.endDate}</span>}
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-footer">
                    <button type="button" className="btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                    <button type="button" className="btn-primary" onClick={handleSave}>
                        {viewMode === 'create' ? 'Create Project' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDetail = () => (
        <div className="modal-overlay" onClick={() => setViewMode('list')}>
            <div className="detail-card glass-panel" onClick={e => e.stopPropagation()}>
                <div className="detail-header-premium">
                    <div className="premium-title-wrapper">
                        <div className="premium-icon-box">
                            <Briefcase size={28} />
                        </div>
                        <div className="title-text-group">
                            <h2 className="premium-title">{selectedProject.name || '-'}</h2>
                            <div className="premium-code-badge">
                                Code: {selectedProject.code || '-'}
                            </div>
                        </div>
                    </div>
                    <div className="detail-actions-top" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className={`premium-status-badge ${selectedProject.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                            {selectedProject.status || 'Active'}
                        </div>
                        <button className="premium-close-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
                    </div>
                </div>

                <div className="detail-body-premium">
                    <div className="premium-section">
                        <div className="premium-section-header">
                            <h3 className="section-title-premium">Project Overview</h3>
                        </div>
                        <div className="premium-grid">
                            <div className="premium-info-box">
                                <label>Project Manager</label>
                                <div className="info-value">
                                    <User size={16} className="info-icon" />
                                    <span>{selectedProject.manager || '-'}</span>
                                </div>
                            </div>
                            <div className="premium-info-box">
                                <label>Location</label>
                                <div className="info-value">
                                    <MapPin size={16} className="info-icon" />
                                    <span>{selectedProject.location || '-'}</span>
                                </div>
                            </div>
                            <div className="premium-info-box">
                                <label>Start Date</label>
                                <div className="info-value">
                                    <Calendar size={16} className="info-icon" />
                                    <span className="font-mono">{selectedProject.startDate ? selectedProject.startDate.split('T')[0] : '-'}</span>
                                </div>
                            </div>
                            <div className="premium-info-box">
                                <label>End Date</label>
                                <div className="info-value">
                                    <Calendar size={16} className="info-icon" />
                                    <span className="font-mono">{selectedProject.endDate ? selectedProject.endDate.split('T')[0] : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-section" style={{ marginTop: '1.5rem' }}>
                        <div className="premium-section-header">
                            <h3 className="section-title-premium">Description</h3>
                        </div>
                        <div className="premium-description-box">
                            <p>{selectedProject.description || '-'}</p>
                        </div>
                    </div>
                </div>

                <div className="detail-footer-premium">
                    <button className="btn-secondary-premium" onClick={() => setViewMode('list')}>Close</button>
                    <button className="btn-primary-premium" onClick={() => setViewMode('edit')}>
                        <Pencil size={16} /> Edit Details
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="projects-page">
            {viewMode === 'list' && renderList()}
            {(viewMode === 'create' || viewMode === 'edit') && renderForm()}
            {viewMode === 'view' && renderDetail()}
            
            {projectToDelete && (
                <div className="modal-overlay" onClick={() => setProjectToDelete(null)}>
                    <div className="delete-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="delete-modal-icon">
                            <Trash2 size={32} />
                        </div>
                        <h3>Delete Project</h3>
                        <p>Are you sure you want to delete <strong>{projectToDelete.name || 'this project'}</strong>? This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="btn-secondary" onClick={() => setProjectToDelete(null)}>Cancel</button>
                            <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .projects-page {
                    padding: 1.5rem;
                    padding-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    height: calc(100vh - 60px);
                    overflow: hidden;
                    /* background-color: #f0f2f5; Removed to match Employees */
                }
                
                /* List View Styles - Reused & Adapted */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white; /* Match Employees */
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
                .btn-secondary {
                    background: white;
                    color: #374151;
                    border: 1px solid #d1d5db;
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                }

                .table-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-height: 0;
                }
                .table-wrapper {
                    overflow: auto;
                    flex: 1;
                    width: 100%;
                }
                .project-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .project-table th {
                    padding: 1rem 1.5rem;
                    background: #f8f9fb;
                    color: #4b5563;
                    font-weight: 600;
                    font-size: 0.85rem;
                    white-space: nowrap; /* Match Employees */
                }
                
                .project-table thead {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background-color: #f8f9fb;
                }

                .project-table th {
                    padding: 0.75rem 1.25rem; /* Compact padding match */
                    color: #374151;
                    font-weight: 700;
                    font-size: 0.8rem;
                    border-bottom: 1px solid #e5e7eb;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    vertical-align: middle;
                }

                .project-table td {
                    padding: 0.85rem 1.25rem; /* Compact padding match */
                    border-bottom: 1px solid #f3f4f6;
                    color: #1f2937;
                    font-size: 0.95rem;
                    vertical-align: middle;
                }
                .project-table tr:hover td {
                    background-color: #f9fafb;
                }

                /* Filter Row Styling */
                .filter-row th {
                    padding: 0.5rem 1.25rem 1rem 1.25rem;
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
                .inline-filter::placeholder {
                    color: #9ca3af;
                    font-weight: 400;
                }

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
                
                .project-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .project-icon {
                    width: 36px;
                    height: 36px;
                    background: #e0e7ff; /* Match Employee avatar bg */
                    color: #4f46e5; /* Match Employee avatar color */
                    border-radius: 8px; /* Maintain square for project but similar style */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px; /* Match Employees rounded pill */
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 70px;
                }
                .status-badge.active { background-color: #ecfdf5; color: #059669; }
                .status-badge.completed { background-color: #eff6ff; color: #3b82f6; }
                .status-badge.on-hold { background-color: #fffbeb; color: #d97706; }
                .status-badge.cancelled { background-color: #fef2f2; color: #dc2626; }
                
                .status-badge.large {
                    padding: 0.4rem 1rem;
                    font-size: 0.85rem;
                }

                .actions-wrapper {
                    display: flex;
                    justify-content: center; /* Employees uses flex-start usually but center for actions column */
                    gap: 0.5rem;
                }
                .action-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:hover { background-color: #f3f4f6; }
                .action-btn.view { color: #3b82f6; }
                .action-btn.edit { color: #10b981; }
                .action-btn.delete { color: #ef4444; }

                /* Scrollbars */
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

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6); /* Darker backdrop */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem;
                    z-index: 1000;
                    backdrop-filter: blur(2px);
                }
                .modal-content {
                    background: #f8fafc; /* Light grey bg for form body area */
                    width: 70%;
                    max-width: 900px;
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    display: flex;
                    flex-direction: column;
                    max-height: 90vh;
                    overflow: hidden;
                    animation: slideUp 0.3s ease-out;
                }
                .form-header {
                    padding: 1rem 1.75rem;
                    background: #0d4d4d;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .form-header h2 {
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0;
                }
                .icon-btn {
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    padding: 0.25rem;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                    width: 28px;
                    height: 28px;
                }
                .icon-btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                }
                
                .form-body {
                    padding: 1.5rem 2rem;
                    overflow-y: auto;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .form-card {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem 2rem;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }
                
                .form-card-title {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                    border: none;
                    padding: 0;
                    display: block;
                }
                
                .modal-info-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr); /* 3 columns based on reference */
                    gap: 1.5rem;
                }
                .span-2 { grid-column: span 1; } /* Resetting strictly for 3-col layout if needed, but let's stick to flex/grid */
                .span-3 { grid-column: span 3; } /* Full width in 3-col grid */

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group label {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #64748b;
                    margin-bottom: 0.4rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .required { color: #ef4444; margin-left: 2px; }
                
                .error-text {
                    color: #ef4444;
                    font-size: 0.65rem;
                    margin-top: 0.25rem;
                    font-weight: 500;
                }
                
                input.input-error, select.input-error, textarea.input-error {
                    border-color: #ef4444;
                }
                
                .input-error-wrapper > div > div { /* Target SearchableSelect inner div */
                    border-color: #ef4444 !important;
                }
                
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 0.6rem 0.8rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    outline: none;
                    transition: all 0.2s;
                    color: #334155;
                    background: #fff;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    border-color: #94a3b8;
                    box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
                }
                .form-group input::placeholder, .form-group textarea::placeholder {
                    color: #cbd5e1;
                }

                .form-footer {
                    padding: 1rem 2rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    background: white;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Detail View Premium Styles */
                .glass-panel {
                    background: #ffffff;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 520px;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: slideUp 0.3s ease-out;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                .detail-body-premium::-webkit-scrollbar {
                    width: 6px;
                }
                .detail-body-premium::-webkit-scrollbar-track {
                    background: transparent;
                }
                .detail-body-premium::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .detail-header-premium {
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .premium-title-wrapper {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }
                .premium-icon-box {
                    width: 50px;
                    height: 50px;
                    background: #eef2ff;
                    color: #4f46e5;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);
                }
                .title-text-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .premium-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    line-height: 1.2;
                }
                .premium-code-badge {
                    font-family: monospace;
                    background: #e2e8f0;
                    color: #475569;
                    font-size: 0.85rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    display: inline-block;
                    width: max-content;
                    font-weight: 600;
                }
                .detail-actions-top {
                    display: flex;
                    align-items: flex-start;
                }
                .premium-close-btn {
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .premium-close-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                    transform: rotate(90deg);
                }
                .premium-status-badge {
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-transform: capitalize;
                }
                .premium-status-badge.active { background: #dcfce7; color: #166534; }
                .premium-status-badge.completed { background: #e0e7ff; color: #3730a3; }
                .premium-status-badge.on-hold { background: #fef9c3; color: #854d0e; }
                .premium-status-badge.cancelled { background: #fee2e2; color: #991b1b; }

                .detail-body-premium {
                    padding: 1.5rem;
                    overflow-y: auto;
                    flex: 1;
                }
                .premium-section-header {
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                }
                .section-title-premium {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }
                .premium-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.25rem 1rem;
                }
                .premium-info-box {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .premium-info-box label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .info-value {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    color: #0f172a;
                    font-weight: 500;
                }
                .info-icon {
                    color: #94a3b8;
                    flex-shrink: 0;
                }
                .premium-description-box {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    padding: 1rem;
                    border-radius: 8px;
                    color: #334155;
                    line-height: 1.5;
                    font-size: 0.9rem;
                    max-height: 150px;
                    overflow-y: auto;
                }
                
                .detail-footer-premium {
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }
                .btn-secondary-premium {
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary-premium:hover { background: #f1f5f9; }
                .btn-primary-premium {
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    background: #0d5f68;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(13, 95, 104, 0.2);
                }
                .btn-primary-premium:hover {
                    background: #0b4e56;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(13, 95, 104, 0.3);
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .text-center { text-align: center; }
                .text-xs { font-size: 0.75rem; }
                .font-mono { font-family: monospace; }
                .text-secondary { color: #6b7280; }
                .font-semibold { font-weight: 600; }
                
                /* Delete Modal Styles */
                .delete-modal-card {
                    background: white;
                    border-radius: 16px;
                    padding: 2.5rem;
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: slideUp 0.3s ease-out;
                }
                .delete-modal-icon {
                    width: 64px;
                    height: 64px;
                    background: #fee2e2;
                    color: #ef4444;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .delete-modal-card h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 0.75rem;
                    margin-top: 0;
                }
                .delete-modal-card p {
                    color: #4b5563;
                    font-size: 0.95rem;
                    margin-bottom: 2rem;
                    line-height: 1.5;
                }
                .delete-modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }
                .btn-danger {
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 0.6rem 2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-danger:hover {
                    background: #dc2626;
                }
            `}</style>
        </div>
    );
};

export default Projects;
