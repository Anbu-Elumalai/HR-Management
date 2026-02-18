import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, X, Shield, Lock, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/api';

const Roles = () => {
    const [viewMode, setViewMode] = useState('list');
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRoles, setSearchRoles] = useState('');
    const [searchAdmin, setSearchAdmin] = useState('');
    const [searchMobile, setSearchMobile] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Form States
    const [formRoleName, setFormRoleName] = useState('');
    const [formShowForAdmin, setFormShowForAdmin] = useState(false);
    const [formMobileAdminAccess, setFormMobileAdminAccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Mock Data
    const [modules, setModules] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);

    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [rolesTotal, setRolesTotal] = useState(0);
    const [rolesPage, setRolesPage] = useState(0);
    const [rolesTotalPages, setRolesTotalPages] = useState(1);
    const [rolesLimit] = useState(10);

    const [permissionMatrix, setPermissionMatrix] = useState({});
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchRoles(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, searchRoles, searchAdmin, searchMobile, searchStatus]);

    const fetchRoles = async (pageNum = 0) => {
        setLoadingRoles(true);
        try {
            let url = `/roles/?page=${pageNum}&limit=${rolesLimit}`;
            if (searchRoles) url += `&searchRoles=${encodeURIComponent(searchRoles)}`;
            if (searchAdmin) url += `&searchAdmin=${encodeURIComponent(searchAdmin)}`;
            if (searchMobile) url += `&searchMobile=${encodeURIComponent(searchMobile)}`;
            if (searchStatus) url += `&searchStatus=${encodeURIComponent(searchStatus)}`;
            if (searchQuery) url += `&searchQuery=${encodeURIComponent(searchQuery)}`;

            const response = await api.get(url);
            const result = response.data;
            if (result.status === 200 || result.statusCode === 200) {
                setRoles(result.data);
                setRolesTotal(result.total);
                setRolesTotalPages(result.totalPages);
                setRolesPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            showToast('Failed to load roles', 'error');
        } finally {
            setLoadingRoles(false);
        }
    };

    const fetchModules = async (pageNum = 0, roleOverride = null) => {
        if (loadingModules || (!hasMore && pageNum !== 0)) return;
        const currentRole = roleOverride || selectedRole;

        setLoadingModules(true);
        try {
            const response = await api.get(`/modules/?page=${pageNum}&limit=10`);
            const result = response.data;
            if ((result.status === 200 || result.statusCode === 200) && result.data) {
                if (pageNum === 0) {
                    setModules(result.data);

                    // Initial matrix for all modules (default false)
                    const initialMatrix = result.data.reduce((acc, module) => ({
                        ...acc,
                        [module.key]: { view: false, add: false, edit: false, delete: false }
                    }), {});

                    // If we have a selected role, merge its permissions into the matrix
                    if (currentRole && currentRole.permissions) {
                        currentRole.permissions.forEach(p => {
                            // Find module key from the fetched modules
                            const moduleObj = result.data.find(m => m._id === p.moduleId);
                            if (moduleObj && moduleObj.key) {
                                initialMatrix[moduleObj.key] = {
                                    view: p.actions?.view || false,
                                    add: p.actions?.add || false,
                                    edit: p.actions?.edit || false,
                                    delete: p.actions?.delete || false
                                };
                            }
                        });
                    }

                    setPermissionMatrix(initialMatrix);
                    setHasMore((pageNum + 1) < result.totalPages);
                } else {
                    setModules(prev => [...prev, ...result.data]);
                    const newMatrixItems = result.data.reduce((acc, module) => ({
                        ...acc,
                        [module.key]: { view: false, add: false, edit: false, delete: false }
                    }), {});

                    // Merge selected role permissions for subsequent pages if applicable
                    if (currentRole && currentRole.permissions) {
                        currentRole.permissions.forEach(p => {
                            const moduleObj = result.data.find(m => m._id === p.moduleId);
                            if (moduleObj && moduleObj.key) {
                                newMatrixItems[moduleObj.key] = {
                                    view: p.actions?.view || false,
                                    add: p.actions?.add || false,
                                    edit: p.actions?.edit || false,
                                    delete: p.actions?.delete || false
                                };
                            }
                        });
                    }

                    setPermissionMatrix(prev => ({ ...prev, ...newMatrixItems }));
                    setHasMore((pageNum + 1) < result.totalPages);
                }
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        } finally {
            setLoadingModules(false);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasMore && !loadingModules) {
                fetchModules(page + 1);
            }
        }
    };

    const handleCreateNewRole = () => {
        setSelectedRole(null);
        setViewMode('create');
        setFormRoleName('');
        setFormShowForAdmin(false);
        setFormMobileAdminAccess(false);
        setFormErrors({});
        setModules([]);
        setPermissionMatrix({});
        setPage(0);
        setHasMore(true);
        fetchModules(0, null);
    };

    const handleViewRole = async (role) => {
        try {
            const response = await api.get(`/roles/${role._id}`);
            const detailedRole = response.data.data[0];
            setSelectedRole(detailedRole);
            setViewMode('view');
            setFormRoleName(detailedRole.name);
            setFormShowForAdmin(detailedRole.showForAdmin || false);
            setFormMobileAdminAccess(detailedRole.mobileAdminAccess || false);
            setFormErrors({});
            setModules([]);
            setPage(0);
            setHasMore(true);
            fetchModules(0, detailedRole);
        } catch (error) {
            console.error('Error fetching role details:', error);
            showToast('Failed to fetch role details', 'error');
        }
    };

    const handleEditRole = async (role) => {
        try {
            const response = await api.get(`/roles/${role._id}`);
            const detailedRole = response.data.data[0];
            setSelectedRole(detailedRole);
            setViewMode('edit');
            setFormRoleName(detailedRole.name);
            setFormShowForAdmin(detailedRole.showForAdmin || false);
            setFormMobileAdminAccess(detailedRole.mobileAdminAccess || false);
            setFormErrors({});
            setModules([]);
            setPage(0);
            setHasMore(true);
            fetchModules(0, detailedRole);
        } catch (error) {
            console.error('Error fetching role details:', error);
            showToast('Failed to fetch role details', 'error');
        }
    };

    const handleDeleteRole = (role) => {
        setDeleteConfirm(role);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const response = await api.delete(`/roles/${deleteConfirm._id}`);
            if (response.data.status === 200 || response.data.statusCode === 200) {
                showToast(response.data.message || 'Role deleted successfully');
                setDeleteConfirm(null);
                fetchRoles(rolesPage);
            } else {
                showToast(response.data.message || 'Failed to delete role', 'error');
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            showToast(error.response?.data?.message || 'Error deleting role', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveRole = async () => {
        if (!formRoleName.trim()) {
            setFormErrors(prev => ({ ...prev, roleName: 'Role name is required' }));
            return;
        }

        setSaving(true);
        try {
            // Transform permissions for API
            const permissions = modules.map(module => ({
                moduleId: module._id,
                actions: {
                    view: permissionMatrix[module.key]?.view || false,
                    add: permissionMatrix[module.key]?.add || false,
                    edit: permissionMatrix[module.key]?.edit || false,
                    delete: permissionMatrix[module.key]?.delete || false
                }
            }));

            const payload = {
                name: formRoleName,
                showForAdmin: formShowForAdmin,
                mobileAdminAccess: formMobileAdminAccess,
                permissions: permissions
            };

            const isEdit = viewMode === 'edit';
            const response = await (isEdit
                ? api.patch(`/roles/${selectedRole._id}`, payload)
                : api.post('/roles/', payload)
            );

            if (response.data.status === 200 || response.data.statusCode === 200 || response.data.status === 201 || response.data.statusCode === 201) {
                showToast(response.data.message || `Role ${isEdit ? 'updated' : 'created'} successfully`);
                setViewMode('list');
                fetchRoles(0); // Refresh the list
            } else {
                showToast(response.data.message || `Failed to ${isEdit ? 'update' : 'create'} role`, 'error');
            }
        } catch (error) {
            console.error('Error saving role:', error);
            showToast(error.response?.data?.message || 'Error saving role', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCheckboxChange = (module, action) => {
        setPermissionMatrix(prev => ({
            ...prev,
            [module]: { ...prev[module], [action]: !prev[module][action] }
        }));
    };

    const handleSelectAllColumn = (action) => {
        const allChecked = modules.every(m => permissionMatrix[m.key]?.[action]);
        const newState = { ...permissionMatrix };
        modules.forEach(m => {
            newState[m.key] = { ...newState[m.key], [action]: !allChecked };
        });
        setPermissionMatrix(newState);
    };

    const renderSkeletonRows = (count) => {
        return Array(count).fill(0).map((_, index) => (
            <tr key={`skeleton-${index}`}>
                <td><div className="skeleton-text" style={{ width: '30px' }}></div></td>
                <td>
                    <div className="candidate-info-cell">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-text" style={{ width: '120px' }}></div>
                    </div>
                </td>
                <td><div className="skeleton-text" style={{ width: '40px' }}></div></td>
                <td><div className="skeleton-text" style={{ width: '40px' }}></div></td>
                <td><div className="skeleton-badge"></div></td>
                <td className="text-right">
                    <div className="actions-flex-alt">
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-icon"></div>
                    </div>
                </td>
            </tr>
        ));
    };

    const renderRolesList = () => (
        <div className="roles-page">
            <div className="page-header-roles">
                <div className="page-title-section-alt">
                    <h1 className="page-title-alt">
                        <Shield size={28} />
                        Roles & Permissions
                    </h1>
                </div>
                <div className="page-header-actions">
                    <button className="btn-primary-roles" onClick={handleCreateNewRole}>
                        <Plus size={18} /> Create New Role
                    </button>
                </div>
            </div>

            <div className="table-container-stabilized">
                <div className="table-wrapper-alt">
                    <table className="employee-table-alt">
                        <thead>
                            <tr className="header-titles-row">
                                <th style={{ width: '100px' }}>Sl No.</th>
                                <th>Role Name</th>
                                <th style={{ width: '180px' }}>Admin Only</th>
                                <th style={{ width: '200px' }}>Mobile Access</th>
                                <th style={{ width: '150px' }}>Status</th>
                                <th className="text-center" style={{ width: '160px' }}>Actions</th>
                            </tr>
                            <tr className="header-filters-row">
                                <td></td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder="Filter Role"
                                        className="col-filter-alt"
                                        value={searchRoles}
                                        onChange={(e) => setSearchRoles(e.target.value)}
                                    />
                                </td>
                                <td>
                                    <select
                                        className="col-filter-alt"
                                        value={searchAdmin}
                                        onChange={(e) => setSearchAdmin(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </td>
                                <td>
                                    <select
                                        className="col-filter-alt"
                                        value={searchMobile}
                                        onChange={(e) => setSearchMobile(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </td>
                                <td>
                                    <select className="col-filter-alt" value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
                                        <option value="">Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </td>
                                <td className="text-center">
                                    <button
                                        className="btn-reset-filters-roles"
                                        title="Reset Filters"
                                        onClick={() => {
                                            setSearchRoles('');
                                            setSearchAdmin('');
                                            setSearchMobile('');
                                            setSearchStatus('');
                                            setSearchQuery('');
                                            fetchRoles(0);
                                        }}
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </td>
                            </tr>
                        </thead>
                        <tbody className={loadingRoles && roles.length > 0 ? 'table-loading-fade' : ''}>
                            {roles.length === 0 && loadingRoles ? (
                                renderSkeletonRows(5)
                            ) : roles.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No roles found.</td></tr>
                            ) : roles.map((role, index) => (
                                <tr key={role._id}>
                                    <td className="text-user-id">{index + 1 + (rolesPage * rolesLimit)}</td>
                                    <td>
                                        <div className="candidate-info-cell">
                                            <div className="candidate-avatar"><Shield size={16} /></div>
                                            <div className="user-name-text">{role.name}</div>
                                        </div>
                                    </td>
                                    <td className="text-secondary">{role.showForAdmin ? 'Yes' : 'No'}</td>
                                    <td className="text-secondary">{role.mobileAdminAccess ? 'Yes' : 'No'}</td>
                                    <td>
                                        <span className={`status-pill-premium ${role.isActive ? 'active' : 'inactive'}`}>
                                            {role.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="actions-flex-roles">
                                            <button className="action-btn-roles view" title="View" onClick={() => handleViewRole(role)}><Eye size={18} /></button>
                                            <button className="action-btn-roles edit" title="Edit" onClick={() => handleEditRole(role)}><Edit size={18} /></button>
                                            <button className="action-btn-roles delete" title="Delete" onClick={() => handleDeleteRole(role)}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-standard-roles">
                    <span className="pagination-info">Showing {roles.length} of {rolesTotal} entries</span>
                    <div className="pagination-controls-roles">
                        <button
                            className={`page-btn-roles ${rolesPage === 0 ? 'disabled' : ''}`}
                            onClick={() => rolesPage > 0 && fetchRoles(rolesPage - 1)}
                            disabled={rolesPage === 0 || loadingRoles}
                        >Previous</button>
                        {[...Array(rolesTotalPages)].map((_, idx) => (
                            <button key={idx} className={`page-btn-roles ${rolesPage === idx ? 'active' : ''}`} onClick={() => fetchRoles(idx)}>{idx + 1}</button>
                        ))}
                        <button
                            className={`page-btn-roles ${rolesPage + 1 >= rolesTotalPages ? 'disabled' : ''}`}
                            onClick={() => rolesPage + 1 < rolesTotalPages && fetchRoles(rolesPage + 1)}
                            disabled={rolesPage + 1 >= rolesTotalPages || loadingRoles}
                        >Next</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRoleForm = () => {
        const isEdit = viewMode === 'edit';
        const isView = viewMode === 'view';
        return (
            <div className={`role-form-card ${isView ? 'view-only' : ''}`}>
                <div className="form-header-main">
                    <div className="header-top">
                        <h2>{isView ? 'Role Details' : isEdit ? 'Edit Role' : 'Create Role'}</h2>
                        <button className="close-btn" onClick={() => setViewMode('list')}><X size={24} /></button>
                    </div>

                    <div className="header-form-row">
                        <div className="input-group">
                            <label>Role Name <span className="req">*</span></label>
                            <input
                                type="text"
                                placeholder="Enter Role Name"
                                className={formErrors.roleName ? 'input-error' : ''}
                                value={formRoleName}
                                disabled={isView}
                                onChange={(e) => {
                                    setFormRoleName(e.target.value);
                                    if (formErrors.roleName) {
                                        setFormErrors(prev => ({ ...prev, roleName: null }));
                                    }
                                }}
                            />
                            {formErrors.roleName && <span className="error-msg">{formErrors.roleName}</span>}
                        </div>
                        <div className="check-group-row">
                            <div className="check-group">
                                <input
                                    type="checkbox"
                                    id="adminOnly"
                                    checked={formShowForAdmin}
                                    disabled={isView}
                                    onChange={(e) => setFormShowForAdmin(e.target.checked)}
                                />
                                <label htmlFor="adminOnly">Show For Admin Only</label>
                            </div>
                            <div className="check-group">
                                <input
                                    type="checkbox"
                                    id="mobileAdmin"
                                    checked={formMobileAdminAccess}
                                    disabled={isView}
                                    onChange={(e) => setFormMobileAdminAccess(e.target.checked)}
                                />
                                <label htmlFor="mobileAdmin">Mobile Admin Access</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-scrollable-body" onScroll={handleScroll}>
                    <div className="permissions-body">
                        <h3 className="section-title">
                            <Lock size={18} />
                            Role Permissions
                        </h3>

                        <div className="matrix-table-container">
                            <table className="matrix-table">
                                <thead>
                                    <tr>
                                        <th className="module-col">Module's</th>
                                        <th>
                                            <div className="th-check">
                                                <input
                                                    type="checkbox"
                                                    disabled={isView}
                                                    onChange={() => handleSelectAllColumn('view')}
                                                    checked={modules.length > 0 && modules.every(m => permissionMatrix[m.key]?.view)}
                                                />
                                                <span>View</span>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-check">
                                                <input
                                                    type="checkbox"
                                                    disabled={isView}
                                                    onChange={() => handleSelectAllColumn('add')}
                                                    checked={modules.length > 0 && modules.every(m => permissionMatrix[m.key]?.add)}
                                                />
                                                <span>Add</span>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-check">
                                                <input
                                                    type="checkbox"
                                                    disabled={isView}
                                                    onChange={() => handleSelectAllColumn('edit')}
                                                    checked={modules.length > 0 && modules.every(m => permissionMatrix[m.key]?.edit)}
                                                />
                                                <span>Edit</span>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-check">
                                                <input
                                                    type="checkbox"
                                                    disabled={isView}
                                                    onChange={() => handleSelectAllColumn('delete')}
                                                    checked={modules.length > 0 && modules.every(m => permissionMatrix[m.key]?.delete)}
                                                />
                                                <span>Delete</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modules.map((module) => (
                                        <tr key={module._id}>
                                            <td className="module-name">{module.name} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>({module.group})</span></td>
                                            <td className="check-cell"><input type="checkbox" disabled={isView} checked={permissionMatrix[module.key]?.view || false} onChange={() => handleCheckboxChange(module.key, 'view')} /></td>
                                            <td className="check-cell"><input type="checkbox" disabled={isView} checked={permissionMatrix[module.key]?.add || false} onChange={() => handleCheckboxChange(module.key, 'add')} /></td>
                                            <td className="check-cell"><input type="checkbox" disabled={isView} checked={permissionMatrix[module.key]?.edit || false} onChange={() => handleCheckboxChange(module.key, 'edit')} /></td>
                                            <td className="check-cell"><input type="checkbox" disabled={isView} checked={permissionMatrix[module.key]?.delete || false} onChange={() => handleCheckboxChange(module.key, 'delete')} /></td>
                                        </tr>
                                    ))}
                                    {loadingModules && page >= 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#0d5f68', fontWeight: '600' }}>
                                                Loading more modules...
                                            </td>
                                        </tr>
                                    )}
                                    {!hasMore && modules.length > 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                                                All modules loaded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="form-footer">
                    <button className="btn-cancel" onClick={() => setViewMode('list')} disabled={saving}>
                        {isView ? 'Close' : 'Cancel'}
                    </button>
                    {!isView && (
                        <button className="btn-save" onClick={handleSaveRole} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Role'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderDeleteModal = () => {
        if (!deleteConfirm) return null;
        return (
            <div className="modal-overlay">
                <div className="delete-modal-card">
                    <div className="delete-modal-icon">
                        <Trash2 size={32} />
                    </div>
                    <h3>Delete Role</h3>
                    <p>Are you sure you want to delete the role <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.</p>
                    <div className="delete-modal-actions">
                        <button className="btn-modal-cancel" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                            Cancel
                        </button>
                        <button className="btn-modal-delete" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="roles-page-root">
            {toast && (
                <div className={`custom-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
            {viewMode === 'list' ? renderRolesList() : renderRoleForm()}
            {renderDeleteModal()}

            <style>{`

                .roles-page {
                    height: calc(100vh - 64px);
                    background-color: #084a52;
                    padding: 1.5rem;
                    padding-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    overflow: hidden;
                    width: 100%;
                }
                .page-header-roles {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .page-title-alt {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #ffffff;
                    letter-spacing: -0.02em;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin: 0;
                }
                .page-header-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .btn-primary-roles {
                    background: #0d5f68;
                    color: #ffffff;
                    border: none;
                    padding: 0.6rem 1.25rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .btn-primary-roles:hover {
                    background: #0b4e56;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
                }

                .table-container-stabilized {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-height: 400px; /* Prevent container collapse */
                    position: relative;
                }

                .table-wrapper-alt {
                    flex: 1;
                    overflow: auto;
                    scrollbar-width: none; /* Hide for Firefox */
                    -ms-overflow-style: none; /* Hide for IE/Edge */
                }
                .table-wrapper-alt::-webkit-scrollbar {
                    display: none; /* Hide for Chrome/Safari/Edge */
                }
                .employee-table-alt {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }
                .employee-table-alt th {
                    background: #f8fafc;
                    padding: 0; /* Remove padding for explicit height */
                    height: 44px; /* Explicit height for title row */
                    text-align: left;
                    font-size: 13px;
                    font-weight: 700;
                    color: #374151;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #e5e7eb;
                    position: sticky;
                    top: 0;
                    z-index: 30;
                    padding-left: 1.5rem;
                    padding-right: 1.5rem;
                    white-space: nowrap; /* Prevent wrapping */
                }
                .header-filters-row td {
                    height: 54px; /* Explicit height for search row */
                    padding: 0 1.5rem;
                    background: #f8fafc;
                    border-bottom: 1px solid #e5e7eb;
                    position: sticky;
                    top: 44px; /* Matches height of the first row */
                    z-index: 25;
                }
                .col-filter-alt {
                    width: 100%;
                    height: 38px;
                    padding: 0.4rem 0.8rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    outline: none;
                    background: white;
                    color: #4b5563;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .col-filter-alt:focus {
                    border-color: #0d5f68;
                    box-shadow: 0 0 0 2px rgba(13, 95, 104, 0.1);
                }
                .employee-table-alt td {
                    padding: 0.85rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                    color: #1f2937;
                    vertical-align: middle;
                    transition: background-color 0.15s ease;
                    height: 60px; /* Stabilize row height */
                    box-sizing: border-box;
                }
                .employee-table-alt tr:hover td {
                    background-color: #f9fafb;
                }
                .candidate-info-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .candidate-avatar {
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
                    flex-shrink: 0;
                }
                .user-name-text {
                    font-weight: 600;
                    color: #111827;
                    font-size: 14px;
                }
                .status-pill-premium {
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 80px;
                    height: 24px;
                }
                .status-pill-premium.active {
                    background-color: #dcfce7;
                    color: #15803d;
                }
                .status-pill-premium.inactive {
                    background-color: #fee2e2;
                    color: #dc2626;
                }
                .actions-flex-roles {
                    display: flex;
                    justify-content: center;
                    gap: 0.6rem;
                }
                .action-btn-roles {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn-roles.view {
                    background-color: #eff6ff;
                    color: #3b82f6;
                }
                .action-btn-roles.edit {
                    background-color: #ecfdf5;
                    color: #10b981;
                }
                .action-btn-roles.delete {
                    background-color: #fef2f2;
                    color: #ef4444;
                }
                .action-btn-roles:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .btn-reset-filters-roles {
                    width: 38px;
                    height: 38px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    background: #f9fafb;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin: 0 auto;
                }
                .btn-reset-filters-roles:hover {
                    background: #f3f4f6;
                    color: #111827;
                    border-color: #d1d5db;
                }
                .text-center { text-align: center; }

                .pagination-standard-roles {
                    padding: 0.75rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    border-top: 1px solid #f1f5f9;
                }
                .pagination-info {
                    font-size: 0.85rem;
                    color: #6b7280;
                    font-weight: 500;
                }
                .pagination-controls-roles {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .page-btn-roles {
                    min-width: 32px;
                    height: 32px;
                    padding: 0 0.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    color: #4b5563;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .page-btn-roles:hover:not(.disabled) {
                    background: #f9fafb;
                    border-color: #d1d5db;
                }
                .page-btn-roles.active {
                    background: #0d5f68;
                    color: white;
                    border-color: #0d5f68;
                    box-shadow: 0 2px 4px rgba(13, 95, 104, 0.2);
                }
                .page-btn-roles.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f9fafb;
                    color: #9ca3af;
                }

                .text-right { text-align: right; }
                .text-secondary { color: #64748b; }
                .table-loading-fade {
                    opacity: 0.5;
                    pointer-events: none;
                    transition: opacity 0.2s ease-in-out;
                }

                /* Form Styles */
                .role-form-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 1px solid #e5e7eb;
                    width: 100%;
                    max-width: 950px;
                    margin: 1.5rem auto;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    max-height: calc(100vh - 120px);
                    min-height: 450px;
                }
                .form-header-main {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }
                .close-btn {
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                }
                .header-form-row {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    align-items: stretch;
                }
                .check-group-row {
                    display: flex;
                    gap: 1.5rem;
                }
                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #374151;
                }
                .req { color: #dc2626; }
                .input-group input {
                    width: 100%;
                    height: 40px;
                    padding: 0.5rem 0.8rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    outline: none;
                    font-size: 14px;
                    color: #1f2937;
                    transition: border-color 0.2s;
                }
                .input-group input:focus {
                    border-color: #0d5f68;
                    box-shadow: 0 0 0 2px rgba(13, 95, 104, 0.1);
                }
                .check-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    margin-bottom: 0.5rem;
                }
                .check-group input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #0d5f68;
                }
                .check-group label {
                    font-size: 14px;
                    color: #4b5563;
                    cursor: pointer;
                    font-weight: 500;
                }
                .form-scrollable-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    background: #f8fafc;
                }
                .permissions-body {
                    background: white;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    padding: 1.25rem;
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1.25rem;
                }
                .matrix-table-container {
                    border: 1px solid #f1f5f9;
                    border-radius: 8px;
                }
                .matrix-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .matrix-table th {
                    background-color: #f8fafc;
                    color: #374151;
                    padding: 0.75rem;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    position: sticky;
                    top: -1.5rem;
                    z-index: 10;
                    border-bottom: 1px solid #e5e7eb;
                }
                .th-check {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                }
                .module-col {
                    text-align: left !important;
                    width: 40%;
                }
                .matrix-table td {
                    padding: 0.85rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                    color: #1f2937;
                    vertical-align: middle;
                }
                .module-name {
                    font-weight: 600;
                    color: #111827;
                }
                .check-cell {
                    text-align: center;
                }
                .check-cell input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #0d5f68;
                }

                .form-footer {
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    background: #ffffff;
                }
                .btn-save {
                    background-color: #0d5f68;
                    color: #ffffff;
                    border: none;
                    padding: 0.6rem 1.75rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .btn-save:hover:not(:disabled) {
                    background-color: #0b4e56;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(0,0,0,0.15);
                }
                .btn-cancel {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    padding: 0.6rem 1.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #4b5563;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .btn-cancel:hover {
                    background-color: #f9fafb;
                    border-color: #d1d5db;
                }
                .btn-save:disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .custom-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 9999;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slideIn 0.3s ease-out;
                }
                .custom-toast.success { background-color: #10b981; }
                .custom-toast.error { background-color: #ef4444; }

                .error-msg {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin-top: 0.25rem;
                    display: block;
                    font-weight: 500;
                }
                .input-error {
                    border-color: #ef4444 !important;
                }

                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                /* Skeleton Loader */
                .skeleton-row td {
                    height: 60px; /* Match real row height */
                    padding: 0.85rem 1.5rem;
                    vertical-align: middle;
                }
                .skeleton-text {
                    height: 14px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .skeleton-avatar {
                    width: 36px;
                    height: 36px;
                    background: #f1f5f9;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .skeleton-badge {
                    width: 80px;
                    height: 24px;
                    background: #f1f5f9;
                    border-radius: 999px;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .skeleton-icon {
                    width: 28px;
                    height: 28px;
                    background: #e2e8f0;
                    border-radius: 6px;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; background-color: #e2e8f0; }
                    50% { opacity: 1; background-color: #cbd5e1; }
                    100% { opacity: 0.6; background-color: #e2e8f0; }
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .delete-modal-card {
                    background: white;
                    padding: 2.5rem 2rem;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    animation: slideUp 0.3s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .delete-modal-icon {
                    width: 70px;
                    height: 70px;
                    background: #fef2f2;
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
                }
                .delete-modal-card p {
                    color: #6b7280;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 2rem;
                }
                .delete-modal-actions {
                    display: flex;
                    gap: 1rem;
                }
                .btn-modal-cancel {
                    flex: 1;
                    padding: 0.75rem;
                    background: #f3f4f6;
                    border: none;
                    border-radius: 10px;
                    color: #4b5563;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-modal-cancel:hover { background: #e5e7eb; }
                .btn-modal-delete {
                    flex: 1;
                    padding: 0.75rem;
                    background: #ef4444;
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-modal-delete:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
                .btn-modal-delete:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default Roles;
