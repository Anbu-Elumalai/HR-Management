import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { name: 'Hybrid', value: 50, color: '#3b82f6' },
    { name: 'Onsite', value: 20, color: '#ef4444' },
    { name: 'Remote', value: 30, color: '#f59e0b' },
];

const WorkingFormatChart = () => {
    return (
        <div className="chart-card">
            <h3 className="chart-title">Working Format</h3>

            <div className="content-wrapper">
                <div className="chart-section">
                    <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="center-text">
                        <span className="text-xs text-gray-400">Total</span>
                        <span className="text-lg font-bold text-gray-700">100</span>
                    </div>
                </div>

                <div className="legend">
                    {data.map((item) => (
                        <div key={item.name} className="legend-item">
                            <span className="dot" style={{ backgroundColor: item.color }}></span>
                            <span className="label text-sm text-gray-600">{item.value} Employee {item.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .chart-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px; /* Consistent radius */
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06); /* Softer shadow */
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .chart-card:hover { 
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
                }
                .chart-title {
                    font-size: 1rem;
                    font-weight: 600; /* Medium weight */
                    margin-bottom: 1.5rem; /* Consistent spacing */
                    color: #1f2937;
                }
                .content-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center; /* Center content */
                    gap: 2rem;
                    flex: 1;
                }
                .chart-section {
                    width: 50%;
                    height: 200px; /* Slightly taller */
                    position: relative;
                }
                .center-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    pointer-events: none;
                }
                .center-text span {
                    display: block;
                    line-height: 1.2;
                }
                .legend {
                    width: 50%;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    padding-left: 0; /* Remove left padding if aligned differently */
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .label {
                    font-weight: 500; /* Softer weight */
                    color: #4b5563;
                }
            `}</style>
        </div>
    );
};

export default WorkingFormatChart;
