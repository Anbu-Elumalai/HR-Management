import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Sun', project: 80, bench: 50 },
    { name: 'Mon', project: 90, bench: 60 },
    { name: 'Tue', project: 150, bench: 120 },
    { name: 'Wed', project: 200, bench: 180 },
    { name: 'Thu', project: 140, bench: 90 },
    { name: 'Fri', project: 220, bench: 180 },
    { name: 'Sat', project: 300, bench: 250 },
];

const ProjectEmploymentChart = () => {
    return (
        <div className="chart-card">
            <h3 className="chart-title">Project employment</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        barSize={12}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                        <Bar dataKey="project" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="bench" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="custom-legend">
                <div className="item">
                    <span className="dot bg-blue-500"></span>
                    <span>Project</span>
                </div>
                <div className="item">
                    <span className="dot bg-blue-200"></span>
                    <span>Bench</span>
                </div>
            </div>

            <style>{`
                .chart-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .chart-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: #1f2937;
                }
                .chart-container {
                    flex: 1;
                    min-height: 250px;
                }
                .custom-legend {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.5rem;
                    margin-top: 1rem;
                    font-size: 0.85rem;
                    color: #4b5563;
                }
                .item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .bg-blue-500 { background-color: #3b82f6; }
                .bg-blue-200 { background-color: #bfdbfe; }
            `}</style>
        </div>
    );
};

export default ProjectEmploymentChart;
