import React, { useState } from 'react';
import {
    Search, Plus, Filter, Download,
    CheckCircle, XCircle, Clock, AlertCircle,
    Calendar, User, Briefcase, MoreVertical,
    Edit, Trash2, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine, PieChart, Pie, Cell
} from 'recharts';

const Attendance = () => {
    const [showModal, setShowModal] = useState(false);

    // Mock Data for Performance Chart
    const performanceData = [
        { time: '9 AM', today: 20, yesterday: 15 },
        { time: '10 AM', today: 35, yesterday: 25 },
        { time: '11 AM', today: 80, yesterday: 60 },
        { time: '12 PM', today: 85, yesterday: 75 },
        { time: '1 PM', today: 90, yesterday: 70 },
        { time: '2 PM', today: 60, yesterday: 50 },
        { time: '3 PM', today: 55, yesterday: 45 },
        { time: '4 PM', today: 75, yesterday: 65 },
        { time: '5 PM', today: 45, yesterday: 35 },
    ];

    // Mock Data for Leave List
    const leaveData = [
        { name: 'Emily Johnson', type: 'Personal Leave', days: '1 Days left', avatarUrl: 'EJ' },
        { name: 'Wyatt Turner', type: 'Paid Leave', days: '3 Days left', avatarUrl: 'WT' },
        { name: 'Jackson Bennett', type: 'Personal Leave', days: '5 Days left', avatarUrl: 'JB' },
        { name: 'Olivia Carter', type: 'Casual Leave', days: '2 Days left', avatarUrl: 'OC' },
        { name: 'Ethan Miller', type: 'Personal Leave', days: '4 Days left', avatarUrl: 'EM' },
        { name: 'Henry Foster', type: 'Personal Leave', days: '6 Days left', avatarUrl: 'HF' },
    ];

    const trackerData = [
        { name: 'Present', value: 80 },
        { name: 'Remaining', value: 20 },
    ];
    const COLORS = ['#4f46e5', '#f1f5f9'];

    // Mock Data for Attendance Table
    const [attendanceData] = useState([
        {
            id: 'ATT001',
            date: '2026-02-12',
            empId: 'EMP001',
            name: 'Arjun',
            dept: 'IT',
            shift: 'General',
            checkIn: '09:05 AM',
            checkOut: '06:10 PM',
            workHours: '9h 05m',
            status: 'Present',
            late: 'Yes',
            overtime: '0h',
        },
        {
            id: 'ATT002',
            date: '2026-02-12',
            empId: 'EMP002',
            name: 'Priya',
            dept: 'HR',
            shift: 'Morning',
            checkIn: '08:55 AM',
            checkOut: '05:00 PM',
            workHours: '8h 05m',
            status: 'Present',
            late: 'No',
            overtime: '0h',
        },
        {
            id: 'ATT003',
            date: '2026-02-12',
            empId: 'EMP003',
            name: 'Rahul',
            dept: 'Finance',
            shift: 'General',
            checkIn: '-',
            checkOut: '-',
            workHours: '-',
            status: 'Absent',
            late: '-',
            overtime: '-',
        },
        {
            id: 'ATT004',
            date: '2026-02-12',
            empId: 'EMP004',
            name: 'Suresh',
            dept: 'Operations',
            shift: 'Night',
            checkIn: '08:00 PM',
            checkOut: '05:00 AM',
            workHours: '9h 00m',
            status: 'Present',
            late: 'No',
            overtime: '1h',
        },
        {
            id: 'ATT005',
            date: '2026-02-12',
            empId: 'EMP005',
            name: 'Kavya',
            dept: 'IT',
            shift: 'General',
            checkIn: '09:00 AM',
            checkOut: '06:00 PM',
            workHours: '9h 00m',
            status: 'Present',
            late: 'No',
            overtime: '0h',
        },
        {
            id: 'ATT006',
            date: '2026-02-12',
            empId: 'EMP006',
            name: 'Vikram',
            dept: 'Marketing',
            shift: 'Morning',
            checkIn: '08:30 AM',
            checkOut: '04:30 PM',
            workHours: '8h 00m',
            status: 'Leave',
            late: '-',
            overtime: '-',
        },
        {
            id: 'ATT007',
            date: '2026-02-12',
            empId: 'EMP007',
            name: 'Anjali',
            dept: 'HR',
            shift: 'General',
            checkIn: '09:15 AM',
            checkOut: '06:15 PM',
            workHours: '9h 00m',
            status: 'Present',
            late: 'Yes',
            overtime: '0h',
        },
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(7);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = attendanceData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(attendanceData.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="attendance-page">
            <div className="page-header">
                <h1 className="page-title">Attendance & Leave</h1>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        <span>Add Attendance</span>
                    </button>
                </div>
            </div>

            <div className="attendance-grid">
                {/* Left Column */}
                <div className="main-content-col">
                    <div className="top-stats-row">
                        <div className="stat-card">
                            <div className="stat-header">
                                <h3>Today's Attendances</h3>
                                <MoreVertical size={16} className="text-secondary" />
                            </div>
                            <div className="stat-body">
                                <div className="stat-value">980</div>
                                <div className="stat-label text-secondary">Employees in Building</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <h3>Today's Performance</h3>
                                <MoreVertical size={16} className="text-secondary" />
                            </div>
                            <div className="stat-body">
                                <div className="stat-value">91.5% <span className="text-green-500 text-sm">↑ 30%</span></div>
                                <div className="stat-label text-secondary">Vs. Yesterday</div>
                            </div>
                        </div>
                    </div>

                    <div className="performance-card">
                        <div className="card-header">
                            <h3>Employee Performance</h3>
                            <div className="card-header-right">
                                <div className="legend-item"><span className="dot today"></span> Today</div>
                                <div className="legend-item"><span className="dot yesterday"></span> Yesterday</div>
                                <MoreVertical size={16} className="text-secondary" />
                            </div>
                        </div>
                        <div className="chart-container" style={{ height: '200px', position: 'relative' }}>
                            <div className="avg-badge">Avg 6.8%</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorYesterday" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#c7d2fe" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <ReferenceLine y={35} stroke="#334155" strokeDasharray="3 3" />
                                    <Area type="monotone" dataKey="today" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorToday)" />
                                    <Area type="monotone" dataKey="yesterday" stroke="#c7d2fe" strokeWidth={2} fillOpacity={1} fill="url(#colorYesterday)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="table-card">
                        <div className="table-header">
                            <h3>Employees Attendances</h3>
                            <div className="table-actions">
                                <div className="tab-buttons">
                                    <button className="tab-btn">Tab CTA</button>
                                    <button className="tab-btn active">Present</button>
                                    <button className="tab-btn">On Leave</button>
                                </div>
                                <button className="filter-btn"><Filter size={16} /> Filter</button>
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}><input type="checkbox" className="custom-checkbox" /></th>
                                        <th>Full Name & Email</th>
                                        <th>Department</th>
                                        <th>Join Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((row) => (
                                        <tr key={row.id}>
                                            <td><input type="checkbox" className="custom-checkbox" /></td>
                                            <td>
                                                <div className="emp-cell">
                                                    <div className="emp-avatar small">{row.name.charAt(0)}</div>
                                                    <div>
                                                        <div className="font-medium text-sm text-gray-900">{row.name === 'Arjun' ? 'Floyd Miles' : row.name === 'Priya' ? 'Savannah Nguyen' : row.name}</div>
                                                        <div className="text-xs text-secondary">{row.name.toLowerCase()}@pagedone.io</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{row.dept === 'IT' ? 'Design' : row.dept === 'HR' ? 'Research' : row.dept}</td>
                                            <td>Jun. 24, 2023</td>
                                            <td>
                                                <span className={`status-pill ${row.status.toLowerCase()}`}>
                                                    <span className="dot"></span> {row.status}
                                                </span>
                                            </td>
                                            <td><MoreVertical size={16} className="text-secondary cursor-pointer" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Footer */}
                        <div className="pagination-footer">
                            <div className="pagination-info">
                                <span>Rows per page:</span>
                                <select className="pagination-select" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                                    <option value={5}>5</option>
                                    <option value={7}>7</option>
                                    <option value={10}>10</option>
                                </select>
                                <span className="divider">|</span>
                                <span>
                                    {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, attendanceData.length)} of {attendanceData.length}
                                </span>
                            </div>
                            <div className="pagination-controls">
                                <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><ChevronLeft size={16} /></button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i + 1} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                ))}
                                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="side-content-col">
                    <div className="tracker-card">
                        <div className="card-header">
                            <h3>Attendance Tracker</h3>
                            <button className="today-btn">Today <Calendar size={14} /></button>
                        </div>
                        <div className="tracker-body">
                            <div className="gauge-container" style={{ height: '180px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={trackerData}
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            {trackerData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="gauge-center">
                                    <div className="gauge-value">80%</div>
                                    <div className="gauge-label">Present Employees</div>
                                </div>
                            </div>
                            <div className="dept-switcher">
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Department of Employees</p>
                                <div className="switcher-control">
                                    <button className="switch-btn"><ChevronLeft size={16} /></button>
                                    <span className="dept-name">Product Design</span>
                                    <button className="switch-btn"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="leaves-card">
                        <div className="card-header">
                            <h3>Employee on leaves</h3>
                            <button className="see-all-btn">See all</button>
                        </div>
                        <div className="leaves-list">
                            {leaveData.map((leave, idx) => (
                                <div key={idx} className="leave-item">
                                    <div className="leave-user">
                                        <div className="emp-avatar small">{leave.avatarUrl}</div>
                                        <div className="leave-info">
                                            <div className="font-semibold text-sm text-gray-900">{leave.name}</div>
                                            <div className="text-xs text-gray-400">{leave.type}</div>
                                        </div>
                                    </div>
                                    <div className="leave-status">
                                        <span className={`leave-badge ${leave.days.includes('1') ? 'urgent' : leave.days.includes('2') || leave.days.includes('3') ? 'medium' : 'low'}`}>
                                            <Calendar size={12} /> {leave.days}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Attendance Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add Attendance</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Employee</label>
                                    <select className="form-control">
                                        <option>Select Employee</option>
                                        <option>Arjun (EMP001)</option>
                                        <option>Priya (EMP002)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Shift</label>
                                    <select className="form-control">
                                        <option>General</option>
                                        <option>Morning</option>
                                        <option>Night</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Check In</label>
                                    <input type="time" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Check Out</label>
                                    <input type="time" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Break (mins)</label>
                                    <input type="number" className="form-control" placeholder="60" />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="form-control">
                                        <option>Present</option>
                                        <option>Absent</option>
                                        <option>Half Day</option>
                                        <option>Leave</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Remarks</label>
                                    <textarea className="form-control" rows="2"></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .attendance-page {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    background-color: #f8fafc;
                    width: 100%;
                    box-sizing: border-box;
                    min-height: 100vh;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .page-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #111827;
                }

                .attendance-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }

                .main-content-col, .side-content-col {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                /* Cards */
                .stat-card, .performance-card, .table-card, .tracker-card, .leaves-card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
                    padding: 1.5rem;
                }

                .top-stats-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .stat-header, .card-header, .table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }

                .stat-header h3, .card-header h3, .table-header h3 {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }

                .stat-value {
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: #64748b;
                }

                /* Performance Chart */
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #64748b;
                }
                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .dot.today { background-color: #4f46e5; }
                .dot.yesterday { background-color: #c7d2fe; }

                .card-header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .avg-badge {
                    position: absolute;
                    left: 45px;
                    top: 65%;
                    background: #000;
                    color: #fff;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    z-index: 10;
                    font-weight: 600;
                }
                .avg-badge::after {
                    content: '';
                    position: absolute;
                    left: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border-width: 4px;
                    border-style: solid;
                    border-color: transparent transparent transparent #000;
                }

                /* Table */
                .table-card { padding: 0; overflow: hidden; }
                .table-header { padding: 1.5rem; margin-bottom: 0; border-bottom: 1px solid #f1f5f9; }
                .table-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .tab-buttons {
                    display: flex;
                    background: #f8fafc;
                    padding: 0.25rem;
                    border-radius: 10px;
                    border: 1px solid #f1f5f9;
                }
                .tab-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    background: transparent;
                    color: #64748b;
                    border: none;
                }
                .tab-btn.active {
                    background: white;
                    color: #111827;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    background: white;
                    color: #334155;
                }

                .attendance-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .attendance-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #64748b;
                    background: #f8fafc;
                    border-bottom: 1px solid #f1f5f9;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }
                .attendance-table td {
                    padding: 1.25rem 1.5rem;
                    font-size: 0.875rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                }
                .emp-cell {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .emp-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: #475569;
                    flex-shrink: 0;
                }
                .emp-avatar.small { width: 32px; height: 32px; font-size: 0.75rem; }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.375rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .status-pill.present { background: #f0fdf4; color: #16a34a; }
                .status-pill.present .dot { background: #16a34a; }
                .status-pill.on { background: #fef2f2; color: #dc2626; }
                .status-pill.on .dot { background: #dc2626; }
                .status-pill.intern { background: #fffcf0; color: #ca8a04; }
                .status-pill.intern .dot { background: #ca8a04; }

                .custom-checkbox {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    border: 1px solid #cbd5e1;
                    accent-color: #4f46e5;
                }

                /* Gauge */
                .gauge-center {
                    position: absolute;
                    top: 60%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }
                .gauge-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #111827;
                }
                .gauge-label {
                    font-size: 0.875rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .today-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.813rem;
                    font-weight: 600;
                    background: white;
                    color: #334155;
                }

                .dept-switcher {
                    margin-top: 1.5rem;
                    text-align: center;
                }
                .switcher-control {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    padding: 0.75rem;
                    margin-top: 0.5rem;
                }
                .switch-btn { background: transparent; color: #94a3b8; border: none; cursor: pointer; }
                .dept-name { font-size: 0.875rem; font-weight: 700; color: #4f46e5; }

                /* Leaves List */
                .see-all-btn {
                    background: transparent;
                    color: #334155;
                    font-size: 0.813rem;
                    font-weight: 600;
                    border: 1px solid #e2e8f0;
                    padding: 0.4rem 0.8rem;
                    border-radius: 10px;
                }
                .leaves-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .leave-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .leave-user {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .leave-info {
                    display: flex;
                    flex-direction: column;
                }
                .leave-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.6rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .leave-badge.urgent { background: #fff1f2; color: #be123c; }
                .leave-badge.medium { background: #fffcf0; color: #a16207; }
                .leave-badge.low { background: #f0fdf4; color: #15803d; }

                /* Pagination */
                .pagination-footer {
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f1f5f9;
                }
                .pagination-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .pagination-select {
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 0.25rem 0.5rem;
                    outline: none;
                }
                .pagination-controls {
                    display: flex;
                    gap: 0.5rem;
                }
                .page-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .page-btn.active {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                }
                .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Buttons */
                .btn-primary {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1.25rem;
                    background-color: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-primary:hover {
                    background-color: #4338ca;
                }

                .text-secondary { color: #64748b; }
                .cursor-pointer { cursor: pointer; }

                @media (max-width: 1024px) {
                    .attendance-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .top-stats-row { grid-template-columns: 1fr; }
                    .table-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .attendance-page { padding: 1rem; }
                }

                /* Modals */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                }
                .modal-header {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-body { padding: 1.5rem; }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }
                .form-group.full-width { grid-column: span 2; }
                .form-group label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }
                .form-control {
                    width: 100%;
                    padding: 0.625rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    outline: none;
                }
                .modal-footer {
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                .btn-outline {
                    padding: 0.625rem 1.25rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default Attendance;
