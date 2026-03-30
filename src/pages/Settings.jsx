import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Settings, Users, List, Plus, Search,
    MoreVertical, Edit, Trash2, X, ChevronLeft,
    ChevronRight, CheckCircle, RotateCcw, Eye,
    AlertTriangle, Bold, Italic, Underline, 
    Type, Palette, ListOrdered, AlignLeft, 
    AlignCenter, AlignRight, Link, Image, 
    Undo, Redo, Code, Send, Globe, Briefcase,
    Mail, Box, Container, UserPlus, ChevronDown, 
    Layout, Pencil, RefreshCw, Pencil as PencilIcon, Trash, FileText, Package, AlertCircle
} from 'lucide-react';
import api from '../api/api';
import PhoneInput from '../components/common/PhoneInput';
import EmailTemplateModal from '../components/EmailTemplate/EmailTemplateModal';
import PreviewModal from '../components/EmailTemplate/PreviewModal';

const SettingsPage = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab based on full path if tab is not in params
    const activeTab = location.pathname.includes('administration/users') ? 'users' :
        (location.pathname.includes('settings/master-data') ? 'drop-values' : (tab || 'users'));

    // View Modes: 'list', 'create', 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Form States
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formCompany, setFormCompany] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formRoleId, setFormRoleId] = useState('');
    const [formIsActive, setFormIsActive] = useState(1);
    const [pin, setPin] = useState(['', '', '', '']);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [rolesList, setRolesList] = useState([]);
    const [employeesList, setEmployeesList] = useState([]);
    const [toast, setToast] = useState(null);
    const [activeEditorTab, setActiveEditorTab] = useState('edit');
    const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [templateForm, setTemplateForm] = useState({
        name: '', companyId: '', type: '', language: 'English', subject: '', 
        body: '', status: 'Active', isDefault: false, modelName: 'candidates',
        headerBgColor: '#1e3a3a', footerBgColor: '#f5f7f7'
    });
    const [templateErrors, setTemplateErrors] = useState({});
    const [templateFilters, setTemplateFilters] = useState({
        code: '', name: '', company: '', type: '', subject: '', language: '', status: '', isDefault: ''
    });

    const TEMPLATE_DESIGNS = [
        { id: '1', name: 'Modern Business', category: 'BUSINESS', desc: 'Clean corporate layout with a bold header', color: '#1e3a3a' },
        { id: '2', name: 'Order Confirmation', category: 'E-COMMERCE', desc: 'E-commerce style order confirmation', color: '#8b5cf6' },
        { id: '3', name: 'Welcome Onboard', category: 'ONBOARDING', desc: 'Friendly welcome email for new users', color: '#10b981' },
        { id: '4', name: 'Invoice / Payment', category: 'FINANCE', desc: 'Professional invoice notification', color: '#3b82f6' },
        { id: '5', name: 'Newsletter', category: 'MARKETING', desc: 'Elegant newsletter with sections', color: '#f43f5e' },
        { id: '6', name: 'Approval Request', category: 'WORKFLOW', desc: 'Action-required workflow email', color: '#f59e0b' },
        { id: '7', name: 'Password Reset', category: 'SECURITY', desc: 'Security-focused password reset', color: '#ef4444' },
        { id: '8', name: 'Event Invitation', category: 'EVENTS', desc: 'Vibrant event invitation with RSVP', color: '#ec4899' },
        { id: '9', name: 'System Notification', category: 'SYSTEM', desc: 'Clean system alert or notification', color: '#64748b' },
        { id: '10', name: 'Promo / Offer', category: 'MARKETING', desc: 'Eye-catching promotional offer', color: '#f43f5e' },
        { id: '11', name: 'Subscription Renewal', category: 'FINANCE', desc: 'Renewal reminder with plan details', color: '#3b82f6' },
        { id: '12', name: 'Shipping Update', category: 'E-COMMERCE', desc: 'Live shipment tracking status', color: '#8b5cf6' },
        { id: '13', name: 'Feedback Request', category: 'ENGAGEMENT', desc: 'Customer satisfaction survey', color: '#06b6d4' },
        { id: '14', name: 'Account Suspended', category: 'SECURITY', desc: 'Account suspension notice', color: '#ef4444' },
        { id: '15', name: 'Job Application', category: 'HR', desc: 'Job application confirmation', color: '#14b8a6' },
        { id: '16', name: '2FA Verification', category: 'SECURITY', desc: 'Two-factor authentication OTP', color: '#ef4444' },
        { id: '17', name: 'Team Announcement', category: 'INTERNAL', desc: 'Internal team announcement', color: '#8b5cf6' },
        { id: '18', name: 'Referral Reward', category: 'ENGAGEMENT', desc: 'Referral program notification', color: '#06b6d4' },
        { id: '19', name: 'Interview Schedule', category: 'HR', desc: 'Candidate interview schedule', color: '#14b8a6' },
        { id: '20', name: 'Offer Letter', category: 'HR', desc: 'Formal offer letter with CTC', color: '#14b8a6' }
    ];

    const GALLERY_CATEGORIES = ['All', 'BUSINESS', 'E-COMMERCE', 'ONBOARDING', 'FINANCE', 'MARKETING', 'WORKFLOW', 'SECURITY', 'EVENTS', 'SYSTEM', 'ENGAGEMENT', 'HR', 'INTERNAL'];

    const [companiesList, setCompaniesList] = useState([
        { id: '1', name: 'Antigravity AI' },
        { id: '2', name: 'Mars Solutions' },
        { id: '3', name: 'Jupiter Corp' }
    ]);

    // Users List State (Matching Roles)
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [usersTotal, setUsersTotal] = useState(8); // Updated mock total
    const [usersPage, setUsersPage] = useState(0);
    const [usersTotalPages, setUsersTotalPages] = useState(2);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchUsersQuery, setSearchUsersQuery] = useState('');
    const [searchUserId, setSearchUserId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchCompany, setSearchCompany] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchRoleId, setSearchRoleId] = useState('');
    const [searchStatus, setSearchStatus] = useState('');

    const handlePinChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newPin = [...pin];
            newPin[index] = value;
            setPin(newPin);

            if (formErrors.pin) {
                setFormErrors(prev => ({ ...prev, pin: null }));
            }

            // Auto focus next input
            if (value && index < 3) {
                const nextInput = document.getElementById(`pin-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const fetchUsers = async (pageNum = 0) => {
        setLoadingUsers(true);
        try {
            let url = `/admin-users/?page=${pageNum}&limit=${rowsPerPage}`;
            if (searchUserId) url += `&userId=${encodeURIComponent(searchUserId)}`;
            if (searchName) url += `&name=${encodeURIComponent(searchName)}`;
            if (searchEmail) url += `&email=${encodeURIComponent(searchEmail)}`;
            if (searchCompany) url += `&company=${encodeURIComponent(searchCompany)}`;
            if (searchPhone) url += `&phone=${encodeURIComponent(searchPhone)}`;
            if (searchRoleId) url += `&roleId=${encodeURIComponent(searchRoleId)}`;
            if (searchStatus) url += `&status=${encodeURIComponent(searchStatus)}`;

            const response = await api.get(url);
            if (response.data.status === 200 || response.data.statusCode === 200) {
                setUsersListReal(response.data.data);
                setUsersTotal(response.data.total || response.data.data.length);
                setUsersTotalPages(response.data.totalPages || 1);
                setUsersPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Failed to load users', 'error');
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles/?limit=100');
            const result = response.data;
            if (result.status === 200 || result.statusCode === 200) {
                setRolesList(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchEmployeesList = async () => {
        try {
            const response = await api.get('/admin-users/?limit=1000');
            const result = response.data;
            if (result.status === 200 || result.statusCode === 200) {
                setEmployeesList(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching employees for select:', error);
        }
    };

    React.useEffect(() => {
        fetchRoles();
        fetchEmployeesList();
    }, []);

    const handleEmployeeSelect = (empId) => {
        const emp = employeesList.find(e => String(e._id || e.id) === String(empId));
        if (emp) {
            setFormName(emp.name || '');
            setFormEmail(emp.email || '');
            setFormPhone(emp.phoneNumber || emp.phone || '');
            setFormCompany(emp.companyName || '');
            setFormRoleId(emp.roleId?._id || emp.roleId || '');
            setFormErrors({});
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'users') fetchUsers(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchUserId, searchName, searchEmail, searchCompany, searchPhone, searchRoleId, searchStatus, activeTab]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const validateForm = () => {
        const errors = {};
        if (!formName.trim()) errors.name = 'Name is required';
        if (!formEmail.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
            errors.email = 'Invalid email format';
        }
        if (!formCompany.trim()) errors.companyName = 'Company name is required';
        if (!formPhone.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else if (formPhone.length < 5) {
            errors.phoneNumber = 'Invalid phone number';
        }
        if (viewMode === 'create' && pin.some(d => !d)) {
            errors.pin = '4-digit PIN is required';
        } else if (viewMode === 'edit' && pin.some(d => d !== '') && pin.some(d => !d)) {
            // If they started typing a PIN, they must finish it
            errors.pin = '4-digit PIN is required if changing';
        }
        if (!formRoleId) errors.roleId = 'Role is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveUser = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const payload = {
                name: formName,
                email: formEmail,
                companyName: formCompany,
                phoneNumber: formPhone,
                roleId: formRoleId,
                isActive: formIsActive
            };

            // Only include pin if it's completely filled
            if (pin.every(d => d !== '')) {
                payload.pin = pin.join('');
            }

            let response;
            if (viewMode === 'edit' && selectedUser) {
                const id = selectedUser._id || selectedUser.id;
                response = await api.patch(`/admin-users/${id}`, payload);
            } else {
                response = await api.post('/admin-users/', payload);
            }

            if (response.data.status === 200 || response.data.statusCode === 201 || response.data.status === 201 || response.data.statusCode === 200) {
                showToast(response.data.message || (viewMode === 'edit' ? 'User updated successfully' : 'User created successfully'));

                if (viewMode === 'create') {
                    // Reset search filters to ensure new user is visible
                    setSearchUserId('');
                    setSearchName('');
                    setSearchEmail('');
                    setSearchCompany('');
                    setSearchPhone('');
                    setSearchRoleId('');
                    setSearchStatus('');
                }

                setViewMode('list');
                fetchUsers(viewMode === 'edit' ? usersPage : 0);
            } else {
                showToast(response.data.message || 'Failed to save user', 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            showToast(error.response?.data?.message || 'Error processing request', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEditUser = async (user) => {
        const id = user._id || user.id;
        if (!id) return;

        setSaving(true);
        try {
            const response = await api.get(`/admin-users/${id}`);
            const data = response.data.data;
            if (data) {
                setFormName(data.name || '');
                setFormEmail(data.email || '');
                setFormCompany(data.companyName || '');
                setFormPhone(data.phoneNumber || '');
                setFormRoleId(data.roleId?._id || data.roleId || '');
                setFormIsActive(data.isActive);
                setPin(['', '', '', '']); // Don't pre-fill PIN for security
                setSelectedUser(data);
                setViewMode('edit');
            }
        } catch (error) {
            console.error('Error fetching user for edit:', error);
            showToast('Failed to fetch user details', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleViewUser = async (user) => {
        const id = user._id || user.id;
        if (!id) return;

        setLoadingUsers(true);
        try {
            const response = await api.get(`/admin-users/${id}`);
            const data = response.data.data;
            if (data) {
                setSelectedUser(data);
                setViewMode('view');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            showToast('Failed to fetch user details', 'error');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        const id = userToDelete._id || userToDelete.id;

        setLoadingUsers(true);
        setShowDeleteModal(false);
        try {
            const response = await api.delete(`/admin-users/${id}`);
            if (response.data.status === 200 || response.data.statusCode === 200) {
                showToast(response.data.message || 'User deleted successfully');
                fetchUsers(usersPage);
            } else {
                showToast(response.data.message || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast(error.response?.data?.message || 'Error deleting user', 'error');
        } finally {
            setLoadingUsers(false);
            setUserToDelete(null);
        }
    };

    const resetUserForm = () => {
        setFormName('');
        setFormEmail('');
        setFormCompany('');
        setFormPhone('');
        setFormRoleId('');
        setFormIsActive(1);
        setPin(['', '', '', '']);
        setFormErrors({});
    };

    const handleResetFilters = () => {
        setSearchUserId('');
        setSearchName('');
        setSearchEmail('');
        setSearchCompany('');
        setSearchPhone('');
        setSearchRoleId('');
        setSearchStatus('');
    };

    const handleCreateUser = () => {
        resetUserForm();
        setViewMode('create');
        fetchRoles(); // Ensure roles are fresh
    };

    // Local state for users fetched from API
    const [usersListReal, setUsersListReal] = useState([]);
    const usersToDisplay = usersListReal;

    // Master Data / Drop Values State
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddValueModal, setShowAddValueModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingValues, setLoadingValues] = useState(false);
    const [isEditingValue, setIsEditingValue] = useState(false);
    const [editingValueId, setEditingValueId] = useState(null);

    const fetchCategories = () => {
        const staticCategories = [
            { id: 'employment-type', name: 'Employment Type' },
            { id: 'position', name: 'Position' },
            { id: 'department', name: 'Department' },
            { id: 'reason-requisition', name: 'Reason Requisition' },
            { id: 'location', name: 'Location' },
            { id: 'skill', name: 'Skill' },
            { id: 'interview-round', name: 'Interview Round' },
            { id: 'email-template', name: 'Email Template' }
        ];
        setCategories(staticCategories);
        if (!selectedCategory) {
            setSelectedCategory(staticCategories[1]); // Default to Position
        }
    };

    // Fetch values for a specific category
    const fetchCategoryValues = async (categoryId) => {
        setLoadingValues(true);
        try {
            const isDepartment = selectedCategory?.name?.toLowerCase() === 'department' || selectedCategory?.name?.toLowerCase() === 'departments';
            const isEmploymentType = selectedCategory?.name?.toLowerCase() === 'employment type' || selectedCategory?.name?.toLowerCase() === 'employment types';
            const isPosition = selectedCategory?.name?.toLowerCase() === 'position' || selectedCategory?.name?.toLowerCase() === 'positions';
            const isReasonReq = selectedCategory?.name?.toLowerCase() === 'reason requisition' || selectedCategory?.id === 'reason-requisition';
            const isLocation = selectedCategory?.id === 'location' || selectedCategory?.name?.toLowerCase() === 'location';
            const isSkill = selectedCategory?.id === 'skill' || selectedCategory?.name?.toLowerCase() === 'skill';

            let response;
            if (isDepartment) {
                response = await api.get('/departments/');
            } else if (isEmploymentType) {
                response = await api.get('/employment-types/');
            } else if (isPosition) {
                response = await api.get('/positions/');
            } else if (isReasonReq) {
                response = await api.get('/reason-requisition');
            } else if (isLocation) {
                response = await api.get('/locations');
            } else if (isSkill) {
                response = await api.get('/skills');
            } else if (selectedCategory?.id === 'interview-round' || selectedCategory?.name?.toLowerCase() === 'interview round') {
                response = await api.get('/interview-rounds');
            } else if (selectedCategory?.id === 'email-template') {
                response = await api.get('/email-templates').catch(() => ({ data: { status: 200, data: [
                    { id: '1', name: 'Interview Confirmation', type: 'Recruitment', subject: 'Interview Scheduled with {{companyName}}', body: 'Hello {{candidateName}}, your interview is scheduled on {{interviewDate}}.', status: 'Active', isDefault: true },
                    { id: '2', name: 'Offer Letter', type: 'Recruitment', subject: 'Offer of Employment from {{companyName}}', body: 'Congratulations {{candidateName}}!', status: 'Active', isDefault: false }
                ] } }));
            } else {
                response = await api.get(`/master-data/categories/${categoryId}/values`);
            }

            if (response.data.status === 200 || response.data.statusCode === 200) {
                // Handle different response structures (simple array vs paginated object)
                let values = [];
                if (Array.isArray(response.data.data)) {
                    values = response.data.data;
                } else if (response.data.data && Array.isArray(response.data.data.data)) {
                    values = response.data.data.data;
                } else {
                    values = Array.isArray(response.data) ? response.data : [];
                }

                const updatedCategories = categories.map(cat =>
                    cat._id === categoryId || cat.id === categoryId
                        ? { ...cat, values: values }
                        : cat
                );
                setCategories(updatedCategories);
                const updated = updatedCategories.find(c => (c._id === categoryId || c.id === categoryId));
                setSelectedCategory(updated);
            }
        } catch (error) {
            console.error('Error fetching category values:', error);
            showToast('Failed to load values', 'error');
        } finally {
            setLoadingValues(false);
        }
    };

    // Load categories on mount
    React.useEffect(() => {
        if (activeTab === 'drop-values') {
            fetchCategories();
        }
    }, [activeTab]);

    // Fetch values whenever selected category changes
    React.useEffect(() => {
        if (selectedCategory) {
            fetchCategoryValues(selectedCategory._id || selectedCategory.id);
        }
    }, [selectedCategory?._id, selectedCategory?.id]);

    // Add new category
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            showToast('Please enter a category name', 'error');
            return;
        }

        setLoadingCategories(true);
        try {
            const response = await api.post('/master-data/categories', {
                name: newCategoryName.trim()
            });

            if (response.data.status === 200 || response.data.status === 201 || response.data.statusCode === 200 || response.data.statusCode === 201) {
                showToast(response.data.message || 'Category added successfully');
                setNewCategoryName('');
                setShowAddCategoryModal(false);
                fetchCategories();
            } else {
                showToast(response.data.message || 'Failed to add category', 'error');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            showToast(error.response?.data?.message || 'Error adding category', 'error');
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleAddValue = async (templateData = null) => {
        const isEmailTemplate = selectedCategory?.id === 'email-template';
        const finalTemplateForm = templateData || templateForm;
        
        if (!isEmailTemplate && !newValue.trim()) {
            showToast('Please enter a value', 'error');
            return;
        }
        if (isEmailTemplate && !finalTemplateForm.name?.trim()) {
            showToast('Please enter a template name', 'error');
            return;
        }

        setLoadingValues(true);
        try {
            const isDepartment = selectedCategory?.name?.toLowerCase() === 'department' || selectedCategory?.name?.toLowerCase() === 'departments';
            const isEmploymentType = selectedCategory?.name?.toLowerCase() === 'employment type' || selectedCategory?.name?.toLowerCase() === 'employment types';
            const isPosition = selectedCategory?.name?.toLowerCase() === 'position' || selectedCategory?.name?.toLowerCase() === 'positions';
            const isReasonReq = selectedCategory?.name?.toLowerCase() === 'reason requisition' || selectedCategory?.id === 'reason-requisition';
            const isLocation = selectedCategory?.id === 'location' || selectedCategory?.name?.toLowerCase() === 'location';
            const isSkill = selectedCategory?.id === 'skill' || selectedCategory?.name?.toLowerCase() === 'skill';
            const categoryId = selectedCategory._id || selectedCategory.id;

            let response;
            if (isEditingValue && editingValueId) {
                if (isDepartment) {
                    response = await api.patch(`/departments/${editingValueId}`, { name: newValue.trim() });
                } else if (isEmploymentType) {
                    response = await api.patch(`/employment-types/${editingValueId}`, { name: newValue.trim() });
                } else if (isPosition) {
                    response = await api.patch(`/positions/${editingValueId}`, { name: newValue.trim() });
                } else if (isReasonReq) {
                    response = await api.patch(`/reason-requisition/${editingValueId}`, { name: newValue.trim() });
                } else if (isLocation) {
                    response = await api.patch(`/locations/${editingValueId}`, { name: newValue.trim() });
                } else if (isSkill) {
                    response = await api.patch(`/skills/${editingValueId}`, { name: newValue.trim() });
                } else if (selectedCategory?.id === 'interview-round' || selectedCategory?.name?.toLowerCase() === 'interview round') {
                    response = await api.patch(`/interview-rounds/${editingValueId}`, { name: newValue.trim() });
                } else if (selectedCategory?.id === 'email-template') {
                    response = await api.patch(`/email-templates/${editingValueId}`, finalTemplateForm);
                } else {
                    response = await api.patch(`/master-data/categories/${categoryId}/values/${editingValueId}`, { value: newValue.trim() });
                }
            } else {
                if (isDepartment) {
                    response = await api.post('/departments/', {
                        name: newValue.trim()
                    });
                } else if (isEmploymentType) {
                    response = await api.post('/employment-types/', {
                        name: newValue.trim()
                    });
                } else if (isPosition) {
                    response = await api.post('/positions/', {
                        name: newValue.trim()
                    });
                } else if (isReasonReq) {
                    response = await api.post('/reason-requisition', {
                        name: newValue.trim()
                    });
                } else if (isLocation) {
                    response = await api.post('/locations', {
                        name: newValue.trim()
                    });
                } else if (isSkill) {
                    response = await api.post('/skills', {
                        name: newValue.trim()
                    });
                } else if (selectedCategory?.id === 'interview-round' || selectedCategory?.name?.toLowerCase() === 'interview round') {
                    response = await api.post('/interview-rounds', {
                        name: newValue.trim()
                    });
                } else if (selectedCategory?.id === 'email-template') {
                    response = await api.post('/email-templates', finalTemplateForm);
                } else {
                    response = await api.post(`/master-data/categories/${categoryId}/values`, {
                        value: newValue.trim()
                    });
                }
            }

            if (response.data.status === 200 || response.data.status === 201 || response.data.statusCode === 200 || response.data.statusCode === 201) {
                showToast(response.data.message || `${selectedCategory.name} value ${isEditingValue ? 'updated' : 'added'} successfully`);
                setNewValue('');
                setShowAddValueModal(false);
                setShowAddTemplateModal(false); // Ensure this closes too
                setIsEditingValue(false);
                setEditingValueId(null);
                setTemplateForm({ name: '', companyId: '', type: '', language: 'English', subject: '', body: '', status: 'Active', isDefault: false });
                setTemplateErrors({});
                // Refresh the values
                fetchCategoryValues(categoryId);
            } else {
                showToast(response.data.message || 'Failed to process request', 'error');
            }
        } catch (error) {
            console.error('Error adding value:', error);
            showToast(error.response?.data?.message || 'Error adding value', 'error');
        } finally {
            setLoadingValues(false);
        }
    };

    const handleEditValue = (val) => {
        const valueId = val._id || val.id || val;
        const valueName = val.name || val.value || val;
        
        if (selectedCategory?.id === 'email-template') {
            setTemplateForm({
                name: val.name || '',
                companyId: val.companyId || '',
                type: val.type || '',
                language: val.language || 'English',
                subject: val.subject || '',
                body: val.body || '',
                status: val.status || 'Active',
                isDefault: val.isDefault || false,
                modelName: val.modelName || 'candidates',
                headerBgColor: val.headerBgColor || '#1e3a3a',
                footerBgColor: val.footerBgColor || '#f1f5f9'
            });
            setEditingValueId(valueId);
            setIsEditingValue(true);
            setShowAddTemplateModal(true);
        } else {
            setNewValue(valueName);
            setEditingValueId(valueId);
            setIsEditingValue(true);
            setShowAddValueModal(true);
        }
    };

    const handleDeleteValue = async (valueToDelete) => {
        setLoadingValues(true);
        try {
            const isDepartment = selectedCategory?.name?.toLowerCase() === 'department' || selectedCategory?.name?.toLowerCase() === 'departments';
            const isEmploymentType = selectedCategory?.name?.toLowerCase() === 'employment type' || selectedCategory?.name?.toLowerCase() === 'employment types';
            const isPosition = selectedCategory?.name?.toLowerCase() === 'position' || selectedCategory?.name?.toLowerCase() === 'positions';
            const isReasonReq = selectedCategory?.name?.toLowerCase() === 'reason requisition' || selectedCategory?.id === 'reason-requisition';
            const isLocation = selectedCategory?.id === 'location' || selectedCategory?.name?.toLowerCase() === 'location';
            const isSkill = selectedCategory?.id === 'skill' || selectedCategory?.name?.toLowerCase() === 'skill';
            const categoryId = selectedCategory._id || selectedCategory.id;
            const valueId = typeof valueToDelete === 'object' ? (valueToDelete._id || valueToDelete.id) : valueToDelete;

            let response;
            if (isDepartment) {
                response = await api.delete(`/departments/${valueId}`);
            } else if (isEmploymentType) {
                response = await api.delete(`/employment-types/${valueId}`);
            } else if (isPosition) {
                response = await api.delete(`/positions/${valueId}`);
            } else if (isReasonReq) {
                response = await api.delete(`/reason-requisition/${valueId}`);
            } else if (isLocation) {
                response = await api.delete(`/locations/${valueId}`);
            } else if (isSkill) {
                response = await api.delete(`/skills/${valueId}`);
            } else if (selectedCategory?.id === 'interview-round' || selectedCategory?.name?.toLowerCase() === 'interview round') {
                response = await api.delete(`/interview-rounds/${valueId}`);
            } else if (selectedCategory?.id === 'email-template') {
                response = await api.delete(`/email-templates/${valueId}`);
            } else {
                response = await api.delete(`/master-data/categories/${categoryId}/values/${valueId}`);
            }

            if (response.data.status === 200 || response.data.statusCode === 200) {
                showToast(response.data.message || `${selectedCategory.name} value deleted`);
                // Refresh the values
                fetchCategoryValues(categoryId);
            } else {
                showToast(response.data.message || 'Failed to delete value', 'error');
            }
        } catch (error) {
            console.error('Error deleting value:', error);
            showToast(error.response?.data?.message || 'Error deleting value', 'error');
        } finally {
            setLoadingValues(false);
        }
    };

    const renderSkeletonRows = (count) => {
        return Array(count).fill(0).map((_, index) => (
            <tr key={`skeleton-${index}`}>
                <td><div className="skeleton-text" style={{ width: '60px' }}></div></td>
                <td>
                    <div className="candidate-info-cell">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-text" style={{ width: '100px' }}></div>
                    </div>
                </td>
                <td><div className="skeleton-text" style={{ width: '150px' }}></div></td>
                <td><div className="skeleton-text" style={{ width: '100px' }}></div></td>
                <td><div className="skeleton-text" style={{ width: '100px' }}></div></td>
                <td><div className="skeleton-badge"></div></td>
                <td><div className="skeleton-badge"></div></td>
                <td>
                    <div className="actions-flex-alt" style={{ justifyContent: 'flex-end' }}>
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-icon"></div>
                    </div>
                </td>
            </tr>
        ));
    };

    const renderUsersList = () => (
        <div className="roles-page-clone">
            {toast && (
                <div className={`custom-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <div className={`table-container-stabilized ${loadingUsers && usersToDisplay.length > 0 ? 'table-loading-fade' : ''}`}>
                <div className="table-wrapper-alt">
                    <table>
                        <thead>
                            <tr className="header-titles-row">
                                <th style={{ width: '90px' }}>User ID</th>
                                <th style={{ width: '180px' }}>Name</th>
                                <th style={{ width: '220px' }}>Email</th>
                                <th style={{ width: '140px' }}>Phone</th>
                                <th style={{ width: '180px' }}>Role</th>
                                <th style={{ width: '110px' }}>Status</th>
                                <th className="text-right" style={{ width: '110px' }}>Actions</th>
                            </tr>
                            <tr className="header-filters-row">
                                <th><input type="text" className="col-filter-alt" placeholder="Filter ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} /></th>
                                <th><input type="text" className="col-filter-alt" placeholder="Filter Name" value={searchName} onChange={e => setSearchName(e.target.value)} /></th>
                                <th><input type="text" className="col-filter-alt" placeholder="Filter Email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} /></th>
                                <th><input type="text" className="col-filter-alt" placeholder="Phone" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} /></th>
                                <th>
                                    <select
                                        className="col-filter-alt"
                                        value={searchRoleId}
                                        onChange={e => setSearchRoleId(e.target.value)}
                                    >
                                        <option value="">All Roles</option>
                                        {rolesList.map(role => (
                                            <option key={role._id} value={role._id}>{role.name}</option>
                                        ))}
                                    </select>
                                </th>
                                <th>
                                    <select className="col-filter-alt" value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
                                        <option value="">Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </th>
                                <th>
                                    <button
                                        className="reset-filter-btn"
                                        onClick={handleResetFilters}
                                        title="Reset All Filters"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersToDisplay.length === 0 && loadingUsers ? (
                                renderSkeletonRows(5)
                            ) : usersToDisplay.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: 0 }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '300px',
                                            color: '#94a3b8',
                                            width: '100%',
                                            margin: '0 auto'
                                        }}>
                                            <Search size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            <p style={{ margin: 0, fontWeight: 600 }}>No users found for these filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : usersToDisplay.slice(0, rowsPerPage).map(user => (
                                <tr key={user.id || user._id}>
                                    <td className="text-user-id">{user.userId || (user.id ? `U00${user.id}` : (user._id ? user._id.substring(user._id.length - 4) : 'NEW'))}</td>
                                    <td>
                                        <div className="candidate-info-cell">
                                            <div className="candidate-avatar">
                                                {(user.name || 'U').charAt(0)}
                                            </div>
                                            <div className="user-name-text">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="text-email">{user.email}</td>
                                    <td className="text-secondary">{user.phoneNumber || user.phone || '9876543210'}</td>
                                    <td>
                                        <span className="tag-premium">{user.role?.name || user.role}</span>
                                    </td>
                                    <td>
                                        <span className={`status-pill-premium ${String(user.status || (user.isActive ? 'Active' : 'Inactive')).toLowerCase()}`}>
                                            {user.status || (user.isActive ? 'Active' : 'Inactive')}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="actions-flex-alt">
                                            <button className="action-icon-btn-premium view" title="View" onClick={() => handleViewUser(user)}><Eye size={20} /></button>
                                            <button className="action-icon-btn-premium edit" title="Edit" onClick={() => handleEditUser(user)}><Edit size={20} /></button>
                                            <button className="action-icon-btn-premium delete" title="Delete" onClick={() => handleDeleteUser(user)}><Trash2 size={20} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-premium">
                    <span className="pagination-info">Showing {usersToDisplay.length} of {usersTotal} entries</span>
                    <div className="pagination-controls-premium">
                        <button className={`page-btn-premium ${usersPage === 0 ? 'disabled' : ''}`} onClick={() => { if (usersPage > 0) fetchUsers(usersPage - 1); }} disabled={usersPage === 0}>Previous</button>
                        {[...Array(usersTotalPages)].map((_, idx) => (
                            <button key={idx} className={`page-btn-premium ${usersPage === idx ? 'active' : ''}`} onClick={() => fetchUsers(idx)}>{idx + 1}</button>
                        ))}
                        <button className={`page-btn-premium ${usersPage >= usersTotalPages - 1 ? 'disabled' : ''}`} onClick={() => { if (usersPage < usersTotalPages - 1) fetchUsers(usersPage + 1); }} disabled={usersPage >= usersTotalPages - 1}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserForm = () => (
        <div className="settings-form-container">
            {toast && (
                <div className={`custom-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
            <div className="form-header-settings">
                <h2 className="card-title">{viewMode === 'create' ? 'Add New User' : 'Edit User'}</h2>
                <button className="close-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
            </div>

            <div className="form-body-settings">
                <div className="form-grid">
                    <div className="form-group-settings" style={{ gridColumn: '1 / span 2' }}>
                        <label>Select Employee (Auto-fill)</label>
                        <select
                            onChange={(e) => handleEmployeeSelect(e.target.value)}
                            className="employee-select-bind"
                        >
                            <option value="">Choose an employee to bind details...</option>
                            {employeesList.map(emp => (
                                <option key={emp._id || emp.id} value={emp._id || emp.id}>
                                    {emp.name} ({emp.email || 'No email'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-settings">
                        <label>Name <span className="required">*</span></label>
                        <input
                            type="text"
                            placeholder="Enter full name"
                            className={formErrors.name ? 'input-error' : ''}
                            value={formName}
                            onChange={(e) => {
                                setFormName(e.target.value);
                                if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
                            }}
                        />
                        {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
                    </div>
                    <div className="form-group-settings">
                        <label>Email <span className="required">*</span></label>
                        <input
                            type="email"
                            placeholder="Enter email address"
                            className={formErrors.email ? 'input-error' : ''}
                            value={formEmail}
                            onChange={(e) => {
                                setFormEmail(e.target.value);
                                if (formErrors.email) setFormErrors(prev => ({ ...prev, email: null }));
                            }}
                        />
                        {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
                    </div>

                    <div className="form-group-settings">
                        <label>Phone Number <span className="required">*</span></label>
                        <PhoneInput 
                            value={formPhone} 
                            onChange={val => {
                                setFormPhone(val);
                                if (formErrors.phoneNumber) setFormErrors(prev => ({ ...prev, phoneNumber: null }));
                            }}
                            placeholder="9876543210" 
                            error={!!formErrors.phoneNumber}
                        />
                        {formErrors.phoneNumber && <span className="error-msg">{formErrors.phoneNumber}</span>}
                    </div>

                    <div className="form-group-settings">
                        <label className="input-label">PIN - Enter 4-digit Pin code <span className="required">*</span></label>
                        <div className="pin-input-container">
                            {pin.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`pin-${idx}`}
                                    type="password"
                                    className={`pin-box ${formErrors.pin ? 'input-error' : ''}`}
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(idx, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !digit && idx > 0) {
                                            document.getElementById(`pin-${idx - 1}`).focus();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        {formErrors.pin && <span className="error-msg">{formErrors.pin}</span>}
                    </div>

                    <div className="form-group-settings">
                        <label>Role <span className="required">*</span></label>
                        <select
                            className={formErrors.roleId ? 'input-error' : ''}
                            value={formRoleId}
                            onChange={(e) => {
                                setFormRoleId(e.target.value);
                                if (formErrors.roleId) setFormErrors(prev => ({ ...prev, roleId: null }));
                            }}
                        >
                            <option value="">Select Role</option>
                            {rolesList.map(role => (
                                <option key={role._id} value={role._id}>{role.name}</option>
                            ))}
                        </select>
                        {formErrors.roleId && <span className="error-msg">{formErrors.roleId}</span>}
                    </div>

                    <div className="form-group-settings">
                        <label>Status</label>
                        <select
                            value={formIsActive}
                            onChange={(e) => setFormIsActive(parseInt(e.target.value))}
                        >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-footer-settings">
                <button className="btn-secondary-alt" onClick={() => setViewMode('list')} disabled={saving}>Cancel</button>
                <button className="btn-primary-alt" onClick={handleSaveUser} disabled={saving}>
                    {saving ? 'Processing...' : viewMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderUserDetail = () => (
        <div className="settings-form-container">
            <div className="form-header-settings">
                <h2 className="card-title">User Details</h2>
                <button className="close-btn" onClick={() => setViewMode('list')}><X size={20} /></button>
            </div>

            <div className="user-detail-premium">
                <div className="detail-header-card">
                    <div className="detail-avatar-large">
                        {(selectedUser?.name || 'U').charAt(0)}
                    </div>
                    <div className="detail-header-info">
                        <h3>{selectedUser?.name}</h3>
                        <p>{selectedUser?.userId || 'ID: ' + selectedUser?._id?.substring(0, 8)}</p>
                        <span className={`status-pill-premium ${selectedUser?.isActive ? 'active' : 'inactive'}`}>
                            {selectedUser?.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="detail-grid-premium">
                    <div className="detail-item-premium">
                        <label>Email Address</label>
                        <p>{selectedUser?.email}</p>
                    </div>
                    <div className="detail-item-premium">
                        <label>Company Name</label>
                        <p>{selectedUser?.companyName}</p>
                    </div>
                    <div className="detail-item-premium">
                        <label>Phone Number</label>
                        <p>{selectedUser?.phoneNumber}</p>
                    </div>
                    <div className="detail-item-premium">
                        <label>Assigned Role</label>
                        <p className="role-badge-detail">{selectedUser?.role?.name || 'N/A'}</p>
                    </div>
                    <div className="detail-item-premium">
                        <label>Created At</label>
                        <p>{selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="detail-item-premium">
                        <label>Last Updated</label>
                        <p>{selectedUser?.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>

                <div className="detail-actions-footer">
                    <button className="btn-secondary-alt" onClick={() => setViewMode('list')}>Back to List</button>
                    <button className="btn-primary-alt" onClick={() => handleEditUser(selectedUser)}>
                        <Edit size={16} /> Edit User
                    </button>
                </div>
            </div>

            <style>{`
                .user-detail-premium {
                    padding: 1rem;
                }
                .detail-header-card {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-radius: 16px;
                    margin-bottom: 2rem;
                }
                .detail-avatar-large {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: #0d5f68;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 700;
                    box-shadow: 0 10px 15px -3px rgba(13, 95, 104, 0.2);
                }
                .detail-header-info h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #1e293b;
                }
                .detail-header-info p {
                    margin: 0.25rem 0 0.5rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .detail-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }
                .detail-item-premium {
                    padding: 1rem;
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                }
                .detail-item-premium label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                .detail-item-premium p {
                    margin: 0;
                    font-weight: 600;
                    color: #1e293b;
                }
                .role-badge-detail {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    background: #f0fdfa;
                    color: #0d5f68;
                    border-radius: 20px;
                    font-size: 0.85rem !important;
                }
                .detail-actions-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 1.5rem;
                }
            `}</style>
        </div>
    );
    const renderAddValueModal = () => {
        if (!showAddValueModal || !selectedCategory) return null;
        return (
            <div className={`modal-overlay-premium ${showAddValueModal ? 'show' : ''}`}>
                <div className="modal-content-premium" style={{ textAlign: 'left', maxWidth: '450px' }}>
                    <div className="modal-header-premium" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', textAlign: 'center' }}>{isEditingValue ? 'Edit' : 'Add'} {selectedCategory.name}</h3>
                    </div>
                    <div className="modal-body-premium" style={{ marginBottom: '2rem' }}>
                        <div className="form-group-settings">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Value Name</label>
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder={`Enter ${selectedCategory.name.toLowerCase()} name`}
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && !loadingValues && handleAddValue()}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}
                            />
                        </div>
                    </div>
                    <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn-secondary-alt" onClick={() => { setShowAddValueModal(false); setIsEditingValue(false); setEditingValueId(null); }} disabled={loadingValues} style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button className="btn-primary-alt" onClick={handleAddValue} disabled={loadingValues} style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', background: '#0d5f68', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                            {loadingValues ? 'Processing...' : (isEditingValue ? 'Update Value' : 'Add Value')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDropValues = () => (
        <div className="drop-values-container">
            <div className="settings-sidebar">
                <div className="sidebar-header-flex">
                    <h3 className="settings-sidebar-title">Categories</h3>
                </div>
                <div className="category-list">
                    {loadingCategories ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                    ) : categories.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                            <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>No categories found</p>
                            <button className="btn-text-action" onClick={() => setShowAddCategoryModal(true)}>+ Create One</button>
                        </div>
                    ) : (
                        categories.map(cat => (
                            <div
                                key={cat._id || cat.id}
                                className={`category-item ${selectedCategory && (selectedCategory._id === cat._id || selectedCategory.id === cat.id) ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                <span>{cat.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="settings-main-content">
                {selectedCategory ? (
                    <>
                        <div className="card-header-flex hrm-list-header" style={{ padding: '1.25rem 1.5rem', background: '#1e3a3a', color: 'white' }}>
                            <div>
                                <h2 className="card-title" style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Email Template Management</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.8 }}>Create and manage email templates across companies</p>
                            </div>
                            <button className="btn-primary-alt" style={{ background: '#1d8c7c', border: 'none', color: 'white' }} onClick={() => { 
                                if (selectedCategory.id === 'email-template') {
                                    setTemplateForm({ 
                                        name: '', companyId: '', type: '', language: 'English', subject: '', 
                                        body: '', status: 'Active', isDefault: false, modelName: 'candidates',
                                        headerBgColor: '#1e3a3a', footerBgColor: '#f1f5f9'
                                    });
                                    setIsEditingValue(false);
                                    setEditingValueId(null);
                                    setShowAddTemplateModal(true);
                                    setTemplateErrors({});
                                } else {
                                    setNewValue(''); 
                                    setIsEditingValue(false); 
                                    setEditingValueId(null); 
                                    setShowAddValueModal(true); 
                                }
                            }} disabled={loadingValues}>
                                <Plus size={16} />
                                <span>{selectedCategory.id === 'email-template' ? 'Add New Template' : 'Add Value'}</span>
                            </button>
                        </div>

                        <div className="values-list-container hrm-table-wrapper">
                            {selectedCategory.id === 'email-template' ? (
                                <>
                                    <div className="values-list-header hrm-thead" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1.5fr minmax(140px, 1fr) 1fr 2fr 1fr 1fr 0.8fr 1fr 1fr', padding: '1rem 1.25rem', background: '#f8fafc', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        <div>TEMPLATE CODE</div>
                                        <div>TEMPLATE NAME</div>
                                        <div>COMPANY</div>
                                        <div>TYPE</div>
                                        <div>SUBJECT</div>
                                        <div>LANGUAGE</div>
                                        <div>STATUS</div>
                                        <div>DEFAULT</div>
                                        <div>CREATED BY</div>
                                        <div className="text-right">ACTIONS</div>
                                    </div>

                                    {/* Filter Row */}
                                    <div className="filter-row hrm-filters" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1.5fr minmax(140px, 1fr) 1fr 2fr 1fr 1fr 0.8fr 1fr 1fr', padding: '0.5rem 1.25rem', gap: '0.5rem', borderBottom: '1px solid #e0e0e0' }}>
                                        <input className="table-filter-input" placeholder="Search Code..." value={templateFilters.code} onChange={(e) => setTemplateFilters({ ...templateFilters, code: e.target.value })} />
                                        <input className="table-filter-input" placeholder="Search Name..." value={templateFilters.name} onChange={(e) => setTemplateFilters({ ...templateFilters, name: e.target.value })} />
                                        <input className="table-filter-input" placeholder="Search Company..." value={templateFilters.company} onChange={(e) => setTemplateFilters({ ...templateFilters, company: e.target.value })} />
                                        <input className="table-filter-input" placeholder="Search Type..." value={templateFilters.type} onChange={(e) => setTemplateFilters({ ...templateFilters, type: e.target.value })} />
                                        <input className="table-filter-input" placeholder="Search Subject..." value={templateFilters.subject} onChange={(e) => setTemplateFilters({ ...templateFilters, subject: e.target.value })} />
                                        <input className="table-filter-input" placeholder="Search Language..." value={templateFilters.language} onChange={(e) => setTemplateFilters({ ...templateFilters, language: e.target.value })} />
                                        <input className="table-filter-input" placeholder="Status..." value={templateFilters.status} onChange={(e) => setTemplateFilters({ ...templateFilters, status: e.target.value })} />
                                        <input className="table-filter-input" placeholder="Default..." value={templateFilters.isDefault} onChange={(e) => setTemplateFilters({ ...templateFilters, isDefault: e.target.value })} />
                                        <div></div>
                                        <div className="text-right">
                                            <button className="reset-filter-btn" onClick={() => setTemplateFilters({ code: '', name: '', company: '', type: '', subject: '', language: '', status: '', isDefault: '' })}>
                                                <RotateCcw size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="values-list-body">
                                        {loadingValues ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading templates...</div>
                                        ) : !selectedCategory.values || selectedCategory.values.length === 0 ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No templates found.</div>
                                        ) : (
                                            selectedCategory.values.map((tmpl, idx) => (
                                                <div key={tmpl._id || tmpl.id || idx} className="value-list-item hrm-row-hover" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1.5fr minmax(140px, 1fr) 1fr 2fr 1fr 1fr 0.8fr 1fr 1fr', padding: '0.85rem 1.25rem', gap: '1rem', alignItems: 'center', fontSize: '13px' }}>
                                                    <span className="code-badge-premium">TMP-{2026}-00{idx+1}</span>
                                                    <span className="value-text" style={{ fontWeight: 600 }}>{tmpl.name}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div className="avatar-initials-mini">{(tmpl.companyName || 'AS').substring(0,2).toUpperCase()}</div>
                                                        <span>{tmpl.companyName || 'Antigravity AI'}</span>
                                                    </div>
                                                    <span className={`tag-premium category-badge-${(tmpl.type || 'Custom').split(' ')[0].toLowerCase()}`} style={{ fontSize: '10px' }}>{tmpl.type || 'Custom'}</span>
                                                    <span className="truncate-text" title={tmpl.subject}>{tmpl.subject}</span>
                                                    <span>{tmpl.language || 'English'}</span>
                                                    <span className={`status-pill-premium ${tmpl.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`} style={{ height: '22px', fontSize: '11px' }}>
                                                        {tmpl.status}
                                                    </span>
                                                    <div className="text-center">
                                                        {tmpl.isDefault ? <span className="default-yes-badge">Yes</span> : ''}
                                                    </div>
                                                    <span style={{ color: '#64748b' }}>Anbu Elumalai</span>
                                                    <div className="value-actions">
                                                        <button className="action-icon-btn edit" title="Edit" onClick={() => handleEditValue(tmpl)}>
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button className="action-icon-btn preview" title="Preview" onClick={() => { setTemplateForm({...tmpl}); setShowPreviewModal(true); }}>
                                                            <Eye size={14} />
                                                        </button>
                                                        <button className="action-icon-btn delete" title="Delete" onClick={() => handleDeleteValue(tmpl)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {/* Table Footer */}
                                    <div className="hrm-table-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid #e0e0e0', color: '#64748b', fontSize: '0.8rem' }}>
                                        <div>Showing 1 to {selectedCategory.values?.length || 0} of {selectedCategory.values?.length || 0} Template(s)</div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="pg-btn">Previous</button>
                                            <button className="pg-btn active">1</button>
                                            <button className="pg-btn">Next</button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="values-list-header">
                                        <div className="header-col">Value Name</div>
                                        <div className="header-col actions">Actions</div>
                                    </div>
                                    <div className="values-list-body">
                                        {loadingValues ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                                Loading values...
                                            </div>
                                        ) : !selectedCategory.values || selectedCategory.values.length === 0 ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                                No values found. Click "Add Value" to create one.
                                            </div>
                                        ) : (
                                            selectedCategory.values.map((val, idx) => {
                                                const valueId = val._id || val.id || val;
                                                const valueName = val.name || val.value || val;
                                                return (
                                                    <div key={valueId || idx} className="value-list-item">
                                                        <span className="value-text">{valueName}</span>
                                                        <div className="value-actions">
                                                            <button className="action-icon-btn edit" title="Edit" onClick={() => handleEditValue(val)} disabled={loadingValues}>
                                                                <Edit size={14} />
                                                            </button>
                                                            <button className="action-icon-btn delete" title="Delete" onClick={() => handleDeleteValue(val)} disabled={loadingValues}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        Select a category to view and manage its values
                    </div>
                )}
            </div>
            {renderAddValueModal()}
            {renderAddCategoryModal()}
            <EmailTemplateModal
                open={showAddTemplateModal}
                onClose={() => setShowAddTemplateModal(false)}
                isEditing={isEditingValue}
                editData={isEditingValue ? templateForm : null}
                companiesList={companiesList}
                onSave={async (formData) => {
                    setTemplateForm(formData);
                    await handleAddValue(formData);
                }}
            />
            <PreviewModal
                open={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                subject={templateForm.subject}
                body={templateForm.body}
            />
        </div>
    );


    function renderAddCategoryModal() {
        if (!showAddCategoryModal) return null;
        return (
            <div className={`modal-overlay-premium show`}>
                <div className="modal-content-premium" style={{ textAlign: 'left', maxWidth: '450px' }}>
                    <div className="modal-header-premium" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', textAlign: 'center' }}>Add New Category</h3>
                    </div>
                    <div className="modal-body-premium" style={{ marginBottom: '2rem' }}>
                        <div className="form-group-settings">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Category Name</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g. Department, Employment Type"
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && !loadingCategories && handleAddCategory()}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}
                            />
                        </div>
                    </div>
                    <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn-secondary-alt" onClick={() => setShowAddCategoryModal(false)} disabled={loadingCategories} style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button className="btn-primary-alt" onClick={handleAddCategory} disabled={loadingCategories} style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', background: '#0d5f68', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                            {loadingCategories ? 'Adding...' : 'Add Category'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const renderDeleteModal = () => (
        <div className={`modal-overlay-premium ${showDeleteModal ? 'show' : ''}`}>
            <div className="modal-content-premium delete-modal">
                <div className="modal-header-premium">
                    <div className="warning-icon-wrapper">
                        <AlertTriangle size={32} />
                    </div>
                </div>
                <div className="modal-body-premium">
                    <h3>Confirm Deletion</h3>
                    <p>Are you sure you want to delete user <strong>{userToDelete?.name}</strong>? This action cannot be undone.</p>
                </div>
                <div className="modal-footer-premium">
                    <button className="btn-secondary-alt" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    <button className="btn-danger-premium" onClick={confirmDeleteUser}>Delete User</button>
                </div>
            </div>
            <style>{`
                .modal-overlay-premium {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                .modal-overlay-premium.show {
                    opacity: 1;
                    visibility: visible;
                }
                .modal-content-premium {
                    background: white;
                    border-radius: 24px;
                    width: 90%;
                    max-width: 400px;
                    padding: 2rem;
                    text-align: center;
                    transform: scale(0.9);
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }
                .modal-overlay-premium.show .modal-content-premium {
                    transform: scale(1);
                }
                .warning-icon-wrapper {
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
                .delete-modal h3 {
                    margin: 0 0 0.5rem;
                    font-size: 1.5rem;
                    color: #1e293b;
                }
                .delete-modal p {
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .modal-footer-premium {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }
                .btn-danger-premium {
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
                }
                .btn-danger-premium:hover {
                    background: #dc2626;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
                }
            `}</style>
        </div>
    );

    return (
        <div className="settings-page">
            <div className="page-header-settings">
                <div className="page-title-section">
                    <h1>
                        {activeTab === 'users' ? <Users size={28} /> : <List size={28} />}
                        {activeTab === 'users' ? 'Users' : 'Master Data'}
                    </h1>
                </div>
                {activeTab === 'users' && viewMode === 'list' && (
                    <div className="page-header-actions">
                        <button className="btn-primary-white" onClick={handleCreateUser}>
                            <Plus size={18} /> Add User
                        </button>
                    </div>
                )}
            </div>

            <div className="settings-container">
                <style>{`
                    .error-msg {
                        color: #ef4444;
                        font-size: 0.75rem;
                        margin-top: 0.25rem;
                        font-weight: 500;
                    }
                    .input-error {
                        border-color: #ef4444 !important;
                    }
                    .custom-toast {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        padding: 1rem 1.5rem;
                        border-radius: 12px;
                        background: white;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                        z-index: 1001;
                        font-weight: 600;
                        font-size: 0.9rem;
                        border-left: 4px solid #10b981;
                        animation: slideInToast 0.3s ease-out;
                    }
                    .custom-toast.error {
                        border-left-color: #ef4444;
                    }
                    @keyframes slideInToast {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}</style>
                <div className="settings-card">
                    <div className="settings-content">
                        {activeTab === 'users' ? (
                            viewMode === 'list' ? renderUsersList() :
                                viewMode === 'view' ? renderUserDetail() : renderUserForm()
                        ) : renderDropValues()}
                    </div>
                </div>
            </div>

            <style>{`
                .settings-page {
                    height: calc(100vh - 64px);
                    background-color: #084a52;
                    padding: 1.5rem;
                    padding-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    overflow: hidden;
                }
            .page-header-settings {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            .page-header-actions {
                display: flex;
            gap: 1rem;
            align-items: center;
                }
            .btn-primary-white {
                background: #0d5f68;
            color: white;
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
            .btn-primary-white:hover {
                background: #0b4e56;
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
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
            .page-title-section h1 {
                font-size: 1.5rem;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: -0.02em;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .settings-container {
                flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
                }

            .settings-card {
                background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            overflow: hidden;
                }

            .settings-content {
                flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
                }

            /* Reuse Styles from Roles.jsx */
            .card-header-flex {
                display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.25rem;
            border-bottom: 2px solid #f8fafc;
                }
            .card-title {
                font-size: 1.1rem;
                font-weight: 700;
                color: #1a2e35;
                }
            .card-actions {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                }
            .search-box-alt {
                position: relative;
            display: flex;
            align-items: center;
                }
            .search-box-alt input {
                padding: 0.45rem 1rem 0.45rem 2.2rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 0.85rem;
            width: 200px;
            background-color: #f8fafc;
            color: #475569;
            outline: none;
                }
            .search-icon-alt {
                position: absolute;
            left: 0.75rem;
            color: #cbd5e1;
                }
            .icon-btn-refresh {
                padding: 0.45rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
                }
            .btn-create-alt {
                background - color: #0d5f68;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            font-size: 0.85rem;
            border: none;
            cursor: pointer;
                }

            .roles-table-card {
                display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
                }
            .table-scroll-container {
                overflow - y: auto;
            flex: 1;
                }
            .roles-table {
                width: 100%;
            border-collapse: separate;
            border-spacing: 0;
                }
            .roles-table th {
                background - color: #f8fafc;
            padding: 0.75rem 1rem;
            text-align: left;
            font-size: 0.75rem;
            font-weight: 600;
            color: #64748b;
            text-transform: capitalize;
            border-bottom: 1px solid #f1f5f9;
            position: sticky;
            top: 0;
            z-index: 10;
                }
            .roles-table td {
                padding: 0.85rem 1rem;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            font-size: 0.85rem;
            vertical-align: middle;
                }
            .status-pill {
                padding: 0.2rem 0.6rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
                }
            .status-pill.active {
                background - color: #f0fdf4;
            color: #16a34a;
                }
            .tag {
                padding: 0.15rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 500;
                }
            .tag-indigo {background - color: #e0e7ff; color: #3730a3; }

            .role-cell {
                display: flex;
            align-items: center;
            gap: 0.6rem;
                }
            .role-icon {
                padding: 0.35rem;
            background-color: #eff6ff;
            color: #0d5f68;
            border-radius: 5px;
                }

            .actions-flex-alt {
                display: flex;
            justify-content: flex-end;
            gap: 0.4rem;
                }
            .action-icon-btn {
                padding: 0.35rem;
            background: #f1f5f9;
            border-radius: 4px;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
                }
            .action-icon-btn:hover {
                background: #e2e8f0;
            color: #334155;
                }
            .action-icon-btn.delete {color: #ef4444; }

            .table-footer {
                padding: 1rem 1.25rem;
            background-color: white;
            border-top: 2px solid #f8fafc;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            color: #64748b;
                }
            .pagination-controls {
                display: flex;
            align-items: center;
            gap: 0.25rem;
                }
            .page-btn-alt {
                width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            cursor: pointer;
            color: #cbd5e1;
                }
            .page-number-active {
                width: 32px;
            height: 32px;
            background-color: #0d5f68;
            color: white;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
                }

            /* Drop Values Styles */
            .drop-values-container {
                display: flex;
            flex: 1;
            min-height: 0;
                }
            .settings-sidebar {
                width: 240px;
            border-right: 1px solid #e2e8f0;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
                }
            @media (max-width: 768px) {
                    .drop - values - container {
                flex - direction: column;
                    }
            .settings-sidebar {
                width: 100%;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
                    }
                }
            .sidebar-header-flex {
                display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
                }
            .settings-sidebar-title {
                font - size: 0.9rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0;
                }
            .icon-btn-add-sm {
                width: 24px;
            height: 24px;
            border-radius: 6px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            color: #0d5f68;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
                }
            .icon-btn-add-sm:hover {
                background: #0d5f68;
            color: white;
            border-color: #0d5f68;
                }
            .btn-text-action {
                background: none;
            border: none;
            color: #0d5f68;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            padding: 0;
                }
            .btn-text-action:hover {
                text - decoration: underline;
                }
            .category-item {
                padding: 0.75rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            color: #475569;
            transition: all 0.2s;
                }
            .category-item:hover {
                background - color: #f1f5f9;
                }
            .category-item.active {
                background - color: #f0fdfa;
            color: #0d5f68;
                }
            .settings-main-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .values-grid {
                display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1.25rem;
                }
            .value-card {
                padding: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #f8fafc;
                }
            .value-actions {
                display: flex;
            gap: 0.5rem;
                }
            .icon-btn-tiny {
                padding: 0.25rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            color: #64748b;
            cursor: pointer;
                }
            .icon-btn-tiny.delete {color: #ef4444; }

            /* Refined Drop Values List Styles */
            .values-list-container {
                margin: 1.25rem;
                margin-top: 0;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
                background: white;
                display: flex;
                flex-direction: column;
                flex: 1;
                min-height: 0;
            }
            .values-list-header {
                display: flex;
                flex-shrink: 0;
                justify-content: space-between;
                padding: 1rem 1.5rem;
                background-color: #f8fafc;
                border-bottom: 2px solid #f1f5f9;
                font-size: 0.75rem;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                position: sticky;
                top: 0;
                z-index: 5;
            }
            .values-list-body {
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                flex: 1;
            }
            .value-list-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #f1f5f9;
                transition: all 0.2s;
            }
            .value-list-item:hover {
                background-color: #f8fafc;
            }
            .value-list-item:last-child {
                border-bottom: none;
            }
            .value-text {
                font-size: 0.95rem;
                font-weight: 500;
                color: #334155;
            }
            .value-actions {
                display: flex;
                gap: 0.75rem;
            }
            .action-icon-btn {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #e2e8f0;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            }
            .action-icon-btn.edit {
                color: #0d5f68;
            }
            .action-icon-btn.delete {
                color: #ef4444;
            }
            .action-icon-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .action-icon-btn.edit:hover {
                background: #f0fdfa;
                border-color: #0d5f68;
            }
            .action-icon-btn.delete:hover {
                background: #fef2f2;
                border-color: #ef4444;
            }

            /* Settings Form Styles */
            .settings-form-container {
                padding: 1.5rem;
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow-y: auto;
            background: white;
                }
            .form-header-settings {
                display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 1rem;
                }
            .close-btn {
                padding: 0.5rem;
            border-radius: 50%;
            border: none;
            background: #f1f5f9;
            color: #64748b;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
                }
            .close-btn:hover {
                background: #e2e8f0;
            color: #1a2e35;
                }
            .form-grid {
                display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem 2rem;
                }
            .form-group-settings {
                display: flex;
            flex-direction: column;
            gap: 0.5rem;
                }
            .form-group-settings label {
                font - size: 0.85rem;
            font-weight: 600;
            color: #475569;
                }
            .required {color: #ef4444; }
            .form-group-settings input, .form-group-settings select {
                padding: 0.75rem 1rem;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.2s;
                }
            .form-group-settings input:focus, .form-group-settings select:focus {
                border - color: #0d5f68;
                }

            .pin-input-container {
                display: flex;
            gap: 1rem;
                }
            .pin-box {
                width: 60px;
            height: 60px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 700;
            border: 1.5px solid #e2e8f0;
            border-radius: 12px;
            background-color: #f8fafc;
            outline: none;
            transition: all 0.2s;
                }
            .pin-box:focus {
                border - color: #0d5f68;
            background-color: white;
            box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.1);
                }

            .form-footer-settings {
                margin - top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid #f1f5f9;
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
                }
            .btn-secondary-alt {
                padding: 0.65rem 1.5rem;
            border-radius: 8px;
            border: 1.5px solid #e2e8f0;
            background: white;
            color: #64748b;
            font-weight: 600;
            cursor: pointer;
                }
            .btn-primary-alt {
                padding: 0.65rem 1.5rem;
            border-radius: 8px;
            border: none;
            background: #0d5f68;
            color: white;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
                }

            /* Refined Users Table UI - Premium Concept */
            .roles-page-clone {
                display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            background: white;
                }
            .card-header-actions-alt {
                padding: 1.25rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
                }
            .header-actions-right {
                display: flex;
            align-items: center;
            gap: 1rem;
            margin-left: auto;
                }
            .search-wrapper-alt {
                position: relative;
            display: flex;
            align-items: center;
                }
            .search-wrapper-alt input {
                padding: 0.6rem 1rem 0.6rem 2.6rem;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            font-size: 0.85rem;
            width: 280px;
            background: #f8fafc;
            transition: all 0.2s;
            outline: none;
                }
            .search-wrapper-alt input:focus {
                border-color: #0d5f68;
            background: white;
            box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.1);
                }
            .search-icon-alt {
                position: absolute;
            left: 1rem;
            color: #94a3b8;
                }

            .table-container-stabilized {
                background: white;
                border-radius: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                flex: 1;
                min-height: 0;
                position: relative;
            }
            .table-wrapper-alt {
                flex: 1;
            min-height: 0;
            overflow-x: auto;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
                }
            .table-wrapper-alt::-webkit-scrollbar {
                display: none;
                }
            .table-wrapper-alt table {
                width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed; /* Fix column widths to prevent jerking */
                }
            .table-wrapper-alt th {
                background: #f8f9fb;
                padding: 0.75rem 1.25rem;
                text-align: left;
                font-size: 13px;
                font-weight: 700;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border-bottom: 1px solid #e5e7eb;
                position: sticky;
                top: 0;
                z-index: 20;
                white-space: nowrap;
                vertical-align: middle;
            }

            .header-filters-row th {
                padding: 0.5rem 1.25rem 1rem 1.25rem;
                background: #f8f9fb;
                border-bottom: 1px solid #e5e7eb;
                position: sticky;
                top: 42px;
                z-index: 10;
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
            .col-filter-alt::placeholder {
                color: #9ca3af;
            font-weight: 400;
                }

            /* Skeleton Loader Styles */
            @keyframes skeleton-loading {
                0% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
                }
            .skeleton-text, .skeleton-avatar, .skeleton-badge, .skeleton-icon {
                background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
            border-radius: 4px;
                }
            .skeleton-text {
                height: 12px;
            margin: 4px 0;
                }
            .skeleton-avatar {
                width: 32px;
            height: 32px;
            border-radius: 8px;
                }
            .skeleton-badge {
                width: 70px;
            height: 20px;
            border-radius: 9999px;
                }
            .skeleton-icon {
                width: 28px;
            height: 28px;
            border-radius: 6px;
                }
            .table-wrapper-alt td {
                padding: 0.85rem 1.25rem;
                border-bottom: 1px solid #f1f5f9;
                color: #1f2937;
                font-size: 14px;
                vertical-align: middle;
                transition: background-color 0.15s ease;
            }
            .table-wrapper-alt tr:hover td {
                background-color: #f9fafb;
            }
            .text-user-id {
                font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            color: #0a4a52;
            font-size: 0.8rem;
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
            }
            .user-name-text {
                font-weight: 600;
                color: #111827;
                font-size: 14px;
            }
            .text-email {
                color: #64748b;
            font-size: 0.8rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
                }
            .reset-filter-btn {
                width: 32px;
            height: 32px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: white;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            margin: 0 auto;
                }
            .reset-filter-btn:hover {
                background: #f1f5f9;
            color: #0d5f68;
            border-color: #0d5f68;
                }
            .tag-premium {
                background: #f0fdfa;
            color: #0d5f68;
            padding: 0.2rem 0.65rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            border: 1px solid #ccfbf1;
            white-space: nowrap;
            display: inline-block;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
                }
            .status-pill-premium {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 70px;
                height: 28px;
            }
            .status-pill-premium.active { background-color: #DCFCE7; color: #059669; }
            .status-pill-premium.inactive { background-color: #FEE2E2; color: #dc2626; }
            .actions-flex-alt {
                display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
                }
            .action-icon-btn-premium {
                width: 30px;
                height: 30px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #6b7280;
            }
            .action-icon-btn-premium:hover { background-color: #f3f4f6; }
            .action-icon-btn-premium.view:hover { color: #3b82f6; }
            .action-icon-btn-premium.edit:hover { color: #10b981; }
            .action-icon-btn-premium.delete:hover { color: #ef4444; }

            .pagination-premium {
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
            .pagination-controls-premium {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
            .page-btn-premium {
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
            .page-btn-premium:hover:not(.disabled) {
                background-color: #f9fafb;
                border-color: #d1d5db;
            }
            .hrm-list-header { border-radius: 12px 12px 0 0; }
            .hrm-table-wrapper { border: 0.5px solid #e0e0e0; border-top: none; background: white; }
            .hrm-filters { background: #f8f8f8; }
            .table-filter-input { width: 100%; padding: 4px 8px; border: 0.5px solid #e0e0e0; border-radius: 4px; font-size: 11px; outline: none; }
            .reset-filter-btn { background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: flex-end; width: 100%; transition: color 0.2s; }
            .reset-filter-btn:hover { color: #1e3a3a; }
            
            .code-badge-premium { background: #f0fdfa; color: #1d8c7c; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; border: 1px solid #ccfbf1; }
            .avatar-initials-mini { width: 22px; height: 22px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #475569; }
            .default-yes-badge { background: #1d8c7c; color: white; padding: 1px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; }
            .hrm-row-hover:hover { background-color: #f1f5f9 !important; }
            .pg-btn { padding: 4px 10px; border: 1px solid #e2e8f0; background: white; border-radius: 4px; font-size: 12px; cursor: pointer; color: #64748b; }
            .pg-btn.active { background: #1e3a3a; color: white; border-color: #1e3a3a; }
            
            /* Floating Labels */
            .floating-input-group { position: relative; margin-bottom: 0rem; width: 100%; }
            .floating-input, .floating-select { width: 100%; padding: 1rem 0.75rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 8px; background: white; font-size: 14px; outline: none; transition: border-color 0.2s; -webkit-appearance: none; }
            .floating-input:focus, .floating-select:focus { border-color: #1e3a3a; }
            .floating-input.error, .floating-select.error { border-color: #ef4444 !important; }
            .floating-label { position: absolute; top: 0.8rem; left: 0.75rem; color: #94a3b8; font-size: 14px; pointer-events: none; transition: all 0.2s; background: white; padding: 0 4px; }
            .floating-input:focus ~ .floating-label, .floating-input:not(:placeholder-shown) ~ .floating-label, .floating-select:focus ~ .floating-label, .floating-select:not([value=""]) ~ .floating-label { top: -0.6rem; left: 0.5rem; font-size: 12px; color: #1e3a3a; font-weight: 600; }
            
            .inline-error { color: #ef4444; font-size: 11px; margin-top: 4px; display: block; position: absolute; bottom: -15px; }
            .color-swatch-wrapper { position: relative; width: 32px; height: 32px; cursor: pointer; }
            .color-swatch-wrapper input[type="color"] { opacity: 0; width: 100%; height: 100%; cursor: pointer; position: absolute; top: 0; left: 0; z-index: 2; }
            .swatch-preview { width: 100%; height: 100%; border-radius: 4px; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #e2e8f0; z-index: 1; position: relative; }
            
            /* Gallery */
            .gallery-modal .gallery-search-box { position: relative; margin-bottom: 1.5rem; }
            .gallery-search-box input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.5rem; border: 1.5px solid #e2e8f0; border-radius: 10px; outline: none; font-size: 14px; }
            .gallery-search-box .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
            .gallery-tabs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 1rem; scrollbar-width: none; }
            .gallery-tab-pill { padding: 0.5rem 1rem; border-radius: 100px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
            .gallery-tab-pill.active { background: #1e3a3a; color: white; border-color: #1e3a3a; }
            .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
            .gallery-card { border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.2s; }
            .gallery-card:hover { border-color: #3a3aad; box-shadow: 0 4px 12px rgba(58, 58, 173, 0.1); }
            .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
            .card-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
            .card-category { font-size: 9px; padding: 2px 6px; border-radius: 100px; color: white; font-weight: bold; text-transform: uppercase; }
            .card-desc { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.4; }
            .card-hover-overlay { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.9); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
            .gallery-card:hover .card-hover-overlay { opacity: 1; }
            .apply-btn { padding: 0.6rem 1.25rem; background: #3a3aad; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
            
            /* TinyMCE Custom */
            .editor-label { display: block; margin-bottom: 0.5rem; font-weight: 700; color: #475569; font-size: 0.85rem; }
            .tinymce-custom-toolbar { display: flex; gap: 0.5rem; padding: 0.5rem; background: #f8fafc; border: 1.5px solid #e2e8f0; border-bottom: none; border-radius: 10px 10px 0 0; }
            .tb-action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s; }
            .tb-action-btn:hover { background: #f1f5f9; color: #1e3a3a; border-color: #cbd5e1; }
            .tb-action-btn.crm-btn { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
            .crm-fields-dropdown-container { position: relative; }
            .crm-fields-popover { position: absolute; top: 100%; right: 0; width: 250px; background: white; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; display: none; padding: 1rem; max-height: 400px; overflow-y: auto; }
            .crm-fields-dropdown-container:hover .crm-fields-popover { display: block; }
            .crm-cat-title { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem; margin-top: 0.75rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px; }
            .crm-field-item { padding: 0.4rem 0.6rem; border-radius: 6px; font-size: 12px; color: #475569; cursor: pointer; transition: background 0.2s; }
            .crm-field-item:hover { background: #f1f5f9; color: #2563eb; font-weight: 600; }
            
            .hrm-checkbox-container { display: flex; align-items: center; cursor: pointer; user-select: none; }
            .hrm-warning-banner { display: flex; alignItems: center; gap: 0.75rem; background: #fff7ed; border: 1px solid #ffedd5; padding: 0.75rem 1rem; border-radius: 8px; color: #9a3412; font-size: 0.8rem; margin-top: 1rem; }
            
            .btn-primary-teal { background: #1d8c7c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
            .btn-outline-teal { border: 1.5px solid #1d8c7c; color: #1d8c7c; background: transparent; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
            .btn-outline-indigo { border: 1.5px solid #3a3aad; color: #3a3aad; background: white; padding: 0.6rem 1rem; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }
            .btn-outline-action { border: 1px solid #e2e8f0; color: #64748b; background: white; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
            `}</style>
            {renderDeleteModal()}
        </div >
    );
};

export default SettingsPage;
