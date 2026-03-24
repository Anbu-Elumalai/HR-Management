import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', value: 80 },
    { name: 'Feb', value: 95 },
    { name: 'Mar', value: 150 },
    { name: 'Apr', value: 210 },
    { name: 'May', value: 140 },
    { name: 'Jun', value: 230 },
    { name: 'Jul', value: 290 },
    { name: 'Aug', value: 280 },
    { name: 'Sep', value: 130 },
];

const StaffTurnoverChart = () => {
    return (
        <div className="chart-card">
            <h3 className="chart-title">Staff turnover</h3>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        barSize={20}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <YAxis hide={true} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
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
                    margin-bottom: 2rem;
                    color: #1f2937;
                }
                .chart-container {
                    flex: 1;
                    min-height: 250px;
                }
            `}</style>
        </div>
    );
};

export default StaffTurnoverChart;
