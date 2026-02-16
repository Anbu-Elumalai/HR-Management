import React, { useState } from 'react';
import {
    Search, Plus,
    Eye, Pencil, Trash2,
    Calendar
} from 'lucide-react';

const Employees = () => {
    // Mock Data
    const [employees] = useState([
        { id: 'EMP001', name: 'John Doe', dept: 'Engineering', designation: 'Senior Dev', status: 'Active', type: 'Full Time', doj: '2023-01-15' },
        { id: 'EMP002', name: 'Jane Smith', dept: 'HR', designation: 'Recruiter', status: 'Active', type: 'Full Time', doj: '2023-02-10' },
        { id: 'EMP003', name: 'Robert Johnson', dept: 'Design', designation: 'UI Designer', status: 'On Leave', type: 'Contract', doj: '2023-03-05' },
        { id: 'EMP004', name: 'Emily Davis', dept: 'Marketing', designation: 'Marketing Lead', status: 'Active', type: 'Full Time', doj: '2022-11-20' },
        { id: 'EMP005', name: 'Michael Wilson', dept: 'Engineering', designation: 'DevOps', status: 'Inactive', type: 'Full Time', doj: '2021-06-15' },
    ]);

    return (
        <div className="employees-page">
            <div className="page-header">
                <h1 className="page-title">Employees Management</h1>
                <button className="btn-primary">
                    <Plus size={20} />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Filters Section */}
            <div className="filters-card">
                <div className="search-wrapper">
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Search by name or ID..." className="search-input" />
                </div>

                <div className="filters-group">
                    <div className="filter-input-wrapper">
                        <select className="filter-select">
                            <option value="">Status: All</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="filter-input-wrapper">
                        <Calendar size={18} className="input-icon" />
                        <input type="date" className="filter-date" placeholder="From" />
                    </div>
                    <div className="filter-input-wrapper">
                        <Calendar size={18} className="input-icon" />
                        <input type="date" className="filter-date" placeholder="To" />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-card">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Employee ID</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Status</th>
                                <th>Type</th>
                                <th>Date of Joining</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td>
                                        <div className="emp-profile">
                                            <div className="emp-avatar">{emp.name.charAt(0)}</div>
                                            <span className="emp-name">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary">{emp.id}</td>
                                    <td>{emp.dept}</td>
                                    <td>{emp.designation}</td>
                                    <td>
                                        <span className={`status-badge ${emp.status.toLowerCase().replace(' ', '-')}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td>{emp.type}</td>
                                    <td className="text-secondary">{emp.doj}</td>
                                    <td>
                                        <div className="actions-wrapper">
                                            <button className="action-btn view" title="View"><Eye size={18} /></button>
                                            <button className="action-btn edit" title="Edit"><Pencil size={18} /></button>
                                            <button className="action-btn delete" title="Delete"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="text-sm text-gray-500">Showing 1 to 5 of 5 entries</span>
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
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    height: calc(100vh - 64px); /* Full height minus topbar */
                    overflow: hidden; /* Prevent outer scroll */
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white; /* Matching dark theme dashboard */
                }

                .btn-primary {
                    background: #0f4c54; /* Dark Teal */
                    color: white;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-primary:hover {
                    background: #0a383e;
                }

                .filters-card {
                    background: white;
                    padding: 1.25rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: center;
                    justify-content: space-between;
                }

                .search-wrapper {
                    position: relative;
                    flex: 1;
                    min-width: 250px;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                }
                .search-input {
                    width: 100%;
                    padding: 0.6rem 1rem 0.6rem 2.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .search-input:focus {
                    border-color: #0f4c54;
                }

                .filters-group {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .filter-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 10px;
                    color: #9ca3af;
                    pointer-events: none;
                }
                .filter-select, .filter-date {
                    padding: 0.6rem 1rem 0.6rem 2.2rem; /* Space for icon if any, date has native icon though */
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    outline: none;
                    color: #4b5563;
                    background: white;
                }
                .filter-select {
                    padding-left: 1rem;
                    min-width: 150px;
                    cursor: pointer;
                }
                /* Adjust padding for date inputs to accommodate icon */
                .filter-date {
                    padding-left: 2.2rem; 
                }

                .table-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    flex: 1; /* Take remaining vertical space */
                    min-height: 0; /* Allow shrinking */
                }
                .table-wrapper {
                    overflow-x: auto;
                    overflow-y: auto;
                    flex: 1; /* Scrollable area */
                }
                .employee-table {
                    width: 100%;
                    border-collapse: separate; /* Changed from collapse for sticky to work better with borders */
                    border-spacing: 0;
                    text-align: left;
                }
                .employee-table th {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    padding: 1rem 0.75rem;
                    background-color: #f9fafb;
                    color: #4b5563;
                    font-weight: 600;
                    font-size: 0.85rem;
                    border-bottom: 1px solid #e5e7eb;
                    white-space: nowrap;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .employee-table td {
                    padding: 1rem 0.75rem;
                    border-bottom: 1px solid #f3f4f6;
                    color: #1f2937;
                    font-size: 0.9rem;
                    vertical-align: middle;
                }
                .employee-table tr:hover {
                    background-color: #f9fafb;
                }

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
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .emp-name {
                    font-weight: 500;
                }
                .text-secondary {
                    color: #6b7280;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: inline-block;
                }
                .status-badge.active {
                    background-color: #d1fae5;
                    color: #059669;
                }
                .status-badge.inactive {
                    background-color: #fee2e2;
                    color: #dc2626;
                }
                .status-badge.on-leave {
                    background-color: #fef3c7;
                    color: #d97706;
                }

                .actions-wrapper {
                    display: flex;
                    gap: 0.5rem;
                }
                .action-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%; /* Circle shape */
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: transparent;
                }
                
                /* Specific styles for each button type */
                .action-btn.view { color: #3b82f6; background-color: #eff6ff; }
                .action-btn.view:hover { background-color: #dbeafe; }

                .action-btn.edit { color: #10b981; background-color: #d1fae5; } /* Green for edit */
                .action-btn.edit:hover { background-color: #a7f3d0; }

                .action-btn.delete { color: #ef4444; background-color: #fee2e2; }
                .action-btn.delete:hover { background-color: #fecaca; }

                .pagination {
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top: 1px solid #e5e7eb;
                }
                .pagination-controls {
                    display: flex;
                    gap: 0.5rem;
                }
                .page-btn {
                    padding: 0.4rem 0.8rem;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    color: #4b5563;
                }
                .page-btn.active {
                    background-color: #0f4c54;
                    color: white;
                    border-color: #0f4c54;
                }
                .page-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default Employees;
