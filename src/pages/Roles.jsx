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
        <div className="roles-page-stabilized">
            <div className="page-header-premium">
                <div className="page-title-section-alt">
                    <h1 className="page-title-alt">
                        <Shield size={28} />
                        Roles & Permissions
                    </h1>
                </div>
                <div className="page-header-actions">
                    <button className="icon-btn-refresh-white" title="Refresh" onClick={() => {
                        setSearchRoles('');
                        setSearchAdmin('');
                        setSearchMobile('');
                        setSearchStatus('');
                        setSearchQuery('');
                        fetchRoles(0);
                    }}>
                        <RotateCcw size={18} />
                    </button>
                    <button className="btn-primary-white" onClick={handleCreateNewRole}>
                        <Plus size={18} /> Create New Role
                    </button>
                </div>
            </div>

            <div className="table-container-premium">

                <div className="table-wrapper-alt">
                    <table className="employee-table-alt">
                        <thead>
                            <tr className="header-titles-row">
                                <th style={{ width: '80px' }}>Sl No.</th>
                                <th>Role Name</th>
                                <th style={{ width: '130px' }}>Admin Only</th>
                                <th style={{ width: '150px' }}>Mobile Access</th>
                                <th style={{ width: '120px' }}>Status</th>
                                <th className="text-right" style={{ width: '140px' }}>Actions</th>
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
                                <td></td>
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
                                    <td className="text-right">
                                        <div className="actions-flex-alt">
                                            <button className="action-icon-btn-premium view" title="View" onClick={() => handleViewRole(role)}><Eye size={18} /></button>
                                            <button className="action-icon-btn-premium edit" title="Edit" onClick={() => handleEditRole(role)}><Edit size={18} /></button>
                                            <button className="action-icon-btn-premium delete" title="Delete" onClick={() => handleDeleteRole(role)}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-premium">
                    <span className="pagination-info">Showing {roles.length} of {rolesTotal} entries</span>
                    <div className="pagination-controls-premium">
                        <button
                            className={`page-btn-premium ${rolesPage === 0 ? 'disabled' : ''}`}
                            onClick={() => rolesPage > 0 && fetchRoles(rolesPage - 1)}
                            disabled={rolesPage === 0 || loadingRoles}
                        ><ChevronLeft size={18} /></button>
                        <button className="page-btn-premium active">{rolesPage + 1}</button>
                        <button
                            className={`page-btn-premium ${rolesPage + 1 >= rolesTotalPages ? 'disabled' : ''}`}
                            onClick={() => rolesPage + 1 < rolesTotalPages && fetchRoles(rolesPage + 1)}
                            disabled={rolesPage + 1 >= rolesTotalPages || loadingRoles}
                        ><ChevronRight size={18} /></button>
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

                .roles-page-stabilized {
                    height: calc(100vh - 64px);
                    background-color: #084a52;
                    padding: 2rem;
                    color: #1f2937;
                    width: 100%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .page-header-premium {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .page-title-alt {
                    font-size: 1.6rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #ffffff;
                    margin: 0;
                }
                .page-header-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .btn-primary-white {
                    background: white;
                    color: #0d5f68;
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
                }
                .btn-primary-white:hover {
                    background: rgba(255, 255, 255, 0.9);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .icon-btn-refresh-white {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    width: 38px;
                    height: 38px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .icon-btn-refresh-white:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.4);
                }

                .table-container-premium {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }

                .table-wrapper-alt {
                    flex: 1;
                    overflow: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 transparent;
                }
                .table-wrapper-alt::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .table-wrapper-alt::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .employee-table-alt {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }
                .employee-table-alt th {
                    background: #f8fafc;
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #f1f5f9;
                    position: sticky;
                    top: 0;
                    z-index: 20;
                }
                .header-filters-row td {
                    padding: 0.5rem 1.5rem;
                    background: #fcfcfc;
                    border-bottom: 2px solid #f1f5f9;
                    position: sticky;
                    top: 36px;
                    z-index: 10;
                }
                .col-filter-alt {
                    width: 100%;
                    padding: 0.35rem 0.6rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    outline: none;
                    background: white;
                    color: #475569;
                    transition: border-color 0.2s;
                }
                .col-filter-alt:focus {
                    border-color: #0d5f68;
                }
                .employee-table-alt td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.85rem;
                    color: #334155;
                    vertical-align: middle;
                }
                .candidate-info-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .candidate-avatar {
                    width: 32px;
                    height: 32px;
                    background: #f1f5f9;
                    color: #0d5f68;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.8rem;
                    border: 1px solid #e2e8f0;
                }
                .user-name-text {
                    font-weight: 600;
                    color: #1a2e35;
                }
                .status-pill-premium {
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                    display: inline-block;
                }
                .status-pill-premium.active {
                    background: #d1fae5;
                    color: #065f46;
                }
                .status-pill-premium.inactive {
                    background: #fee2e2;
                    color: #991b1b;
                }
                .actions-flex-alt {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.4rem;
                }
                .action-icon-btn-premium {
                    width: 38px;
                    height: 38px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-icon-btn-premium:hover {
                    background: #f8fafc;
                    transform: translateY(-1px);
                    border-color: #0d5f68;
                    color: #0d5f68;
                }
                .action-icon-btn-premium.delete:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .pagination-premium {
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                }
                .pagination-info {
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .pagination-controls-premium {
                    display: flex;
                    gap: 0.4rem;
                }
                .page-btn-premium {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #475569;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .page-btn-premium:hover:not(.disabled) {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }
                .page-btn-premium.active {
                    background: #0d5f68;
                    color: white;
                    border-color: #0d5f68;
                }
                .page-btn-premium.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f8fafc;
                }

                .text-right { text-align: right; }
                .text-secondary { color: #64748b; }
                .table-loading-fade {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Form Styles */
                .role-form-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 1px solid #e2e8f0;
                    width: 100%;
                    max-width: 950px;
                    margin: 2rem auto;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    max-height: calc(100vh - 140px);
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
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 0.4rem;
                    color: #374151;
                }
                .req { color: #dc2626; }
                .input-group input {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    outline: none;
                    font-size: 0.85rem;
                }
                .check-group {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    cursor: pointer;
                    margin-bottom: 0.65rem;
                }
                .check-group input {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: #0d5f68;
                }
                .check-group label {
                    font-size: 0.85rem;
                    color: #475569;
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
                    background-color: #0d5f68;
                    color: white;
                    padding: 0.75rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    position: sticky;
                    top: -1.5rem;
                    z-index: 10;
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
                    padding: 0.75rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.85rem;
                    color: #475569;
                }
                .module-name {
                    font-weight: 600;
                    color: #1e293b;
                }
                .check-cell {
                    text-align: center;
                }
                .check-cell input {
                    width: 1.1rem;
                    height: 1.1rem;
                    cursor: pointer;
                }

                .form-footer {
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    background: #fcfcfc;
                }
                .btn-save {
                    background-color: #0d5f68;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-cancel {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #64748b;
                }
                .btn-save:disabled {
                    background-color: #4a7c82;
                    cursor: not-allowed;
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
                .skeleton-text {
                    height: 12px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .skeleton-avatar {
                    width: 32px;
                    height: 32px;
                    background: #e2e8f0;
                    border-radius: 8px;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .skeleton-badge {
                    width: 60px;
                    height: 24px;
                    background: #e2e8f0;
                    border-radius: 20px;
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
