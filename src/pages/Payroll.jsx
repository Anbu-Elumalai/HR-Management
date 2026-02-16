import React, { useState } from 'react';
import {
    CreditCard,
    Wallet,
    CheckCircle,
    FileText,
    Download,
    RefreshCw,
    Lock,
    Calendar,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    Eye
} from 'lucide-react';

const Payroll = () => {
    // State Management
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isProcessed, setIsProcessed] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(7); // default 7 as per previous preference

    // Mock Data
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [2024, 2025, 2026, 2027];

    const initialPayrollData = [
        {
            id: 'PAY-001',
            empId: 'EMP001',
            name: 'Arjun',
            avatar: null,
            dept: 'IT',
            designation: 'Senior Developer',
            basic: 50000,
            allowances: 20000,
            gross: 70000,
            deductions: 5000,
            net: 65000,
            status: 'Processed',
            paymentStatus: 'Paid',
            payableDays: 30,
            lopDays: 0
        },
        {
            id: 'PAY-002',
            empId: 'EMP002',
            name: 'Priya',
            avatar: null, // Placeholder for image URL
            dept: 'HR',
            designation: 'HR Manager',
            basic: 45000,
            allowances: 15000,
            gross: 60000,
            deductions: 4000,
            net: 56000,
            status: 'Processed',
            paymentStatus: 'Unpaid',
            payableDays: 28,
            lopDays: 2
        },
        {
            id: 'PAY-003',
            empId: 'EMP003',
            name: 'Rahul',
            avatar: null,
            dept: 'Finance',
            designation: 'Accountant',
            basic: 40000,
            allowances: 10000,
            gross: 50000,
            deductions: 3000,
            net: 47000,
            status: 'Pending',
            paymentStatus: 'Unpaid',
            payableDays: 0,
            lopDays: 0
        },
        {
            id: 'PAY-004',
            empId: 'EMP004',
            name: 'Suresh',
            avatar: null,
            dept: 'Operations',
            designation: 'Ops Manager',
            basic: 42000,
            allowances: 12000,
            gross: 54000,
            deductions: 3500,
            net: 50500,
            status: 'Processed',
            paymentStatus: 'Paid',
            payableDays: 30,
            lopDays: 0
        },
        {
            id: 'PAY-005',
            empId: 'EMP005',
            name: 'Kavya',
            avatar: null,
            dept: 'IT',
            designation: 'Developer',
            basic: 35000,
            allowances: 10000,
            gross: 45000,
            deductions: 2500,
            net: 42500,
            status: 'Processed',
            paymentStatus: 'Unpaid',
            payableDays: 29,
            lopDays: 1
        }
    ];

    const [payrollData, setPayrollData] = useState(initialPayrollData);

    // Filter Logic
    const filteredData = payrollData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.empId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Helpers
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleProcessPayroll = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsProcessed(true);
            setIsLoading(false);
            // Simulate processing logic
            setPayrollData(prev => prev.map(item => ({ ...item, status: 'Processed' })));
        }, 1500);
    };

    const handleLockPayroll = () => {
        setShowLockModal(true);
    };

    const confirmLock = () => {
        setIsLocked(true);
        setShowLockModal(false);
    };

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setShowDetailModal(true);
    };

    return (
        <div className="payroll-page">
            <style>{`
                .payroll-page {
                    padding: 0.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    height: calc(100vh - 64px);
                    background-color: transparent;
                    overflow: hidden;
                    margin-top: -10px;
                }
                 .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                .page-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.025em;
                }
                .page-subtitle {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.75rem;
                    margin-top: 0.1rem;
                }
                .header-actions {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .btn {
                    padding: 0.4rem 0.75rem;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.75rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    border: none;
                    transition: all 0.2s;
                    height: 28px;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #0f4c54 0%, #0a383e 100%);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(15, 76, 84, 0.2);
                }
                .btn-danger {
                    background: #fee2e2;
                    color: #991b1b;
                    border: 1px solid #fca5a5;
                }
                .btn-danger:hover { background: #fecaca; }
                
                .select-control {
                    padding: 0.35rem;
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 0.75rem;
                    outline: none;
                    height: 28px;
                }
                .select-control option {
                    background: #1f2937;
                    color: white;
                }

                /* Summary Cards - Grid */
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.5rem;
                }
                /* Summary Card - Compact */
                .summary-card {
                    background: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    flex-direction: row; /* Horizontal layout */
                    align-items: center;
                    gap: 0.75rem;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .summary-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .summary-info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .summary-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #111827;
                    line-height: 1.1;
                }
                .summary-label {
                    font-size: 0.65rem;
                    font-weight: 500;
                    color: #6b7280;
                    white-space: nowrap;
                }

                /* Filters */
                .filters-card {
                    background: white;
                    padding: 0.5rem;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 0px; /* Remove if any */
                }
                .search-group {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    padding: 0 0.5rem;
                    border-radius: 6px;
                    height: 28px;
                    flex: 1;
                    max-width: 200px;
                }
                .search-input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 0.75rem;
                    width: 100%;
                    color: #374151;
                }
                 .filter-select {
                    padding: 0 0.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    background: #f9fafb;
                    font-size: 0.75rem;
                    color: #374151;
                    outline: none;
                    height: 28px;
                }
                .range-input {
                    width: 50px;
                    background: transparent;
                    outline: none;
                    text-align: center;
                    font-size: 0.75rem;
                }

                /* Table */
                .table-card {
                    background: white;
                    border-radius: 10px;
                    border: 1px solid #e5e7eb;
                    flex: 1; /* Take remaining height */
                    display: flex;
                    flex-direction: column;
                    overflow: hidden; /* Hide overflow from rounded corners */
                    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
                }
                .table-wrapper {
                    overflow: auto;
                    flex: 1; /* Scrollable area */
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th {
                    background: #f3f4f6;
                    padding: 0.5rem 0.75rem;
                    text-align: left;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #4b5563;
                    text-transform: uppercase;
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border-bottom: 1px solid #e5e7eb;
                }
                td {
                    padding: 0.4rem 0.75rem;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 0.75rem;
                    color: #374151;
                    vertical-align: middle;
                    white-space: nowrap;
                }
                .emp-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #e0e7ff;
                    color: #4338ca;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.7rem;
                }
                .status-badge {
                    padding: 0.15rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 600;
                }
                .bg-green { background: #dcfce7; color: #166534; }
                .bg-yellow { background: #fef9c3; color: #854d0e; }
                .bg-red { background: #fee2e2; color: #991b1b; }
                .bg-blue { background: #e0f2fe; color: #075985; }
                
                .net-salary {
                    font-weight: 700;
                    color: #0f766e;
                }
                .action-btn {
                    padding: 0.2rem;
                    border-radius: 4px;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:hover { background: #f3f4f6; color: #111827; }

                /* Pagination */
                .pagination-footer {
                    padding: 0.4rem 0.75rem;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                }
                .footer-stats {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .rows-per-page-select {
                    padding: 0.1rem 0.2rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    margin-left: 0.2rem;
                    margin-right: 0.2rem;
                    outline: none;
                    cursor: pointer;
                    background: white;
                }
                .pagination-controls {
                    display: flex;
                    gap: 0.4rem;
                }
                .page-btn {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 4px;
                    color: #6b7280;
                    cursor: pointer;
                    font-size: 0.75rem;
                }
                .page-btn.active {
                    background: #0f4c54;
                    color: white;
                    border-color: #0f4c54;
                }

                /* Drawer/Modal */
                .overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 50;
                    display: flex;
                    justify-content: flex-end;
                }
                .drawer {
                    width: 100%;
                    max-width: 400px;
                    background: white;
                    height: 100vh;
                    box-shadow: -4px 0 15px rgba(0,0,0,0.1);
                    animation: slideLeft 0.3s ease-out;
                    display: flex;
                    flex-direction: column;
                }
                @keyframes slideLeft {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .drawer-header {
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .drawer-body {
                    padding: 1rem;
                    overflow-y: auto;
                    flex: 1;
                }
                .detail-section {
                    margin-bottom: 1.5rem;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.4rem 0;
                    border-bottom: 1px dashed #e5e7eb;
                    font-size: 0.8rem;
                }
                .detail-label { color: #6b7280; }
                .detail-val { font-weight: 500; color: #111827; }
                
                 @media (max-width: 1024px) {
                    .summary-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 768px) {
                    .summary-grid { grid-template-columns: 1fr; }
                    .filters-card { flex-direction: column; align-items: stretch; }
                    .search-group { max-width: none; }
                }
            `}</style>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payroll Management</h1>
                    <p className="page-subtitle">Process and manage employee salaries for {months[selectedMonth]} {selectedYear}</p>
                </div>
                <div className="header-actions">
                    <select
                        className="select-control"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select
                        className="select-control"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    {!isLocked ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleProcessPayroll}
                            disabled={isLoading || isProcessed}
                        >
                            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                            {isLoading ? 'Processing...' : isProcessed ? 'Reprocess' : 'Process Payroll'}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm">
                            <Lock size={16} /> Payroll Locked
                        </div>
                    )}

                    {isProcessed && !isLocked && (
                        <button className="btn btn-danger" onClick={handleLockPayroll}>
                            <Lock size={18} /> Lock Payroll
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon bg-blue-100 text-blue-700"><Users size={16} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{payrollData.length}</span>
                        <span className="summary-label">Total Employees</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon bg-green-100 text-green-700"><CheckCircle size={16} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{payrollData.filter(p => p.status === 'Processed').length}</span>
                        <span className="summary-label">Processed</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon bg-yellow-100 text-yellow-700"><Clock size={16} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{payrollData.filter(p => p.status === 'Pending').length}</span>
                        <span className="summary-label">Pending</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon bg-indigo-100 text-indigo-700"><CreditCard size={16} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{formatCurrency(payrollData.reduce((acc, curr) => acc + curr.gross, 0))}</span>
                        <span className="summary-label">Total Gross Salary</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon bg-teal-100 text-teal-700"><Wallet size={16} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{formatCurrency(payrollData.reduce((acc, curr) => acc + curr.net, 0))}</span>
                        <span className="summary-label">Total Net Payable</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-card">
                <div className="search-group">
                    <Search size={14} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select className="filter-select">
                    <option>Dept: All</option>
                    <option>IT</option>
                    <option>HR</option>
                    <option>Finance</option>
                </select>
                <select className="filter-select">
                    <option>Status: All</option>
                    <option>Processed</option>
                    <option>Pending</option>
                </select>
                <select className="filter-select">
                    <option>Pay: All</option>
                    <option>Paid</option>
                    <option>Unpaid</option>
                </select>
                <select className="filter-select">
                    <option>Type: All</option>
                    <option>Full-time</option>
                    <option>Contract</option>
                </select>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2 h-7">
                    <input type="number" placeholder="Min" className="range-input" />
                    <span className="text-gray-400">-</span>
                    <input type="number" placeholder="Max" className="range-input" />
                </div>
                <button className="btn btn-outline" style={{ border: '1px solid #d1d5db', padding: '0 0.6rem', borderRadius: '6px', height: '28px', marginLeft: 'auto', fontSize: '0.75rem', background: 'white' }}>Reset</button>
            </div>

            {/* Table */}
            <div className="table-card">
                {!isProcessed ? (
                    <div className="h-full flex items-center justify-center text-gray-500 font-medium">
                        No Payroll Processed
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Dept</th>
                                        <th>Basic Salary</th>
                                        <th>Allowances</th>
                                        <th>Gross</th>
                                        <th>Deductions</th>
                                        <th>Net Salary</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="emp-cell">
                                                        <div className="avatar">{item.name.charAt(0)}</div>
                                                        <div>
                                                            <div className="font-semibold">{item.name}</div>
                                                            <div className="text-xs text-gray-500">{item.empId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{item.dept}</td>
                                                <td>{formatCurrency(item.basic)}</td>
                                                <td>{formatCurrency(item.allowances)}</td>
                                                <td>{formatCurrency(item.gross)}</td>
                                                <td className="text-red-500">-{formatCurrency(item.deductions)}</td>
                                                <td className="net-salary">{formatCurrency(item.net)}</td>
                                                <td>
                                                    <span className={`status-badge ${item.status === 'Processed' ? 'bg-green' : 'bg-yellow'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <button className="action-btn" title="View Details" onClick={() => handleViewDetails(item)}>
                                                            <Eye size={18} />
                                                        </button>
                                                        <button className="action-btn" title="Download Slip">
                                                            <Download size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-8 text-gray-500">
                                                No employees found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="pagination-footer">
                            <div className="footer-stats">
                                <div className="flex items-center">
                                    Rows per page:
                                    <select
                                        className="rows-per-page-select"
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={7}>7</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                    </select>
                                </div>
                                <span className="text-gray-300">|</span>
                                <div>
                                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
                                </div>
                            </div>

                            <div className="pagination-controls">
                                <button
                                    className="page-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="page-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(curr => Math.min(totalPages, curr + 1))}
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Payroll Detail Drawer */}
            {showDetailModal && selectedEmployee && (
                <div className="overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="drawer" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h2 className="text-xl font-bold">Payroll Details</h2>
                            <button onClick={() => setShowDetailModal(false)}><X size={24} /></button>
                        </div>
                        <div className="drawer-body">
                            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                                <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                                    {selectedEmployee.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{selectedEmployee.name}</h3>
                                    <p className="text-gray-500">{selectedEmployee.designation} • {selectedEmployee.dept}</p>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="font-bold mb-3 text-gray-800 border-b pb-2">Earnings</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Basic Salary</span>
                                    <span className="detail-val">{formatCurrency(selectedEmployee.basic)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">HRA & Allowances</span>
                                    <span className="detail-val">{formatCurrency(selectedEmployee.allowances)}</span>
                                </div>
                                <div className="detail-row bg-gray-50 p-2 rounded">
                                    <span className="detail-label font-bold">Total Gross Salary</span>
                                    <span className="detail-val font-bold">{formatCurrency(selectedEmployee.gross)}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="font-bold mb-3 text-gray-800 border-b pb-2">Deductions</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Tax & PF</span>
                                    <span className="detail-val text-red-600">-{formatCurrency(selectedEmployee.deductions)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">LOP Days ({selectedEmployee.lopDays})</span>
                                    <span className="detail-val text-red-600">-₹0</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-teal-800">Net Payable Amount</span>
                                    <span className="text-2xl font-bold text-teal-700">{formatCurrency(selectedEmployee.net)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t flex gap-3">
                            <button className="btn btn-primary flex-1 justify-center">
                                <Download size={18} /> Download Payslip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lock Confirmation Modal */}
            {showLockModal && (
                <div className="overlay flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-2">Lock Payroll?</h3>
                        <p className="text-gray-600 mb-6 text-sm">Once locked, you cannot modify payroll records for this month. Are you sure?</p>
                        <div className="flex justify-end gap-3">
                            <button className="btn btn-outline border px-4 rounded-lg" onClick={() => setShowLockModal(false)}>Cancel</button>
                            <button className="btn btn-danger px-4 rounded-lg" onClick={confirmLock}>Yes, Lock it</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
