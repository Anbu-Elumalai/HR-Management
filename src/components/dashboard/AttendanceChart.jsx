import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', online: 400, late: 240, absent: 240 },
    { name: 'Feb', online: 300, late: 139, absent: 221 },
    { name: 'Mar', online: 200, late: 980, absent: 229 },
    { name: 'Apr', online: 278, late: 390, absent: 200 },
    { name: 'May', online: 189, late: 480, absent: 218 },
    { name: 'Jun', online: 239, late: 380, absent: 250 },
    { name: 'Jul', online: 349, late: 430, absent: 210 },
    { name: 'Aug', online: 400, late: 240, absent: 240 },
    { name: 'Sep', online: 300, late: 139, absent: 221 },
];

const AttendanceChart = () => {
    return (
        <div className="chart-card">
            <div className="header-row">
                <h3 className="chart-title">Attendance Overview</h3>
                <select className="period-select">
                    <option>Week</option>
                    <option>Month</option>
                    <option>Year</option>
                </select>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        barSize={10}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <YAxis hide={true} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                        <Bar dataKey="online" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="custom-legend">
                <div className="item">
                    <span className="dot bg-blue"></span>
                    <span>Online</span>
                </div>
                <div className="item">
                    <span className="dot bg-orange"></span>
                    <span>Late Arrival</span>
                </div>
                <div className="item">
                    <span className="dot bg-red"></span>
                    <span>Absent</span>
                </div>
            </div>

            <style>{`
                .chart-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                }
                .chart-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
                }
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .chart-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                }
                .period-select {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    padding: 0.35rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    color: #4b5563;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.2s;
                }
                .period-select:hover {
                    border-color: #d1d5db;
                }
                .chart-container {
                    flex: 1;
                    min-height: 250px;
                }
                .custom-legend {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-top: 1.5rem;
                    font-size: 0.85rem;
                    color: #4b5563;
                    border-top: 1px solid #f3f4f6;
                    padding-top: 1rem;
                }
                .item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 2px;
                }
                .bg-blue { background-color: #3b82f6; }
                .bg-orange { background-color: #f59e0b; }
                .bg-red { background-color: #ef4444; }
            `}</style>
        </div>
    );
};

export default AttendanceChart;
