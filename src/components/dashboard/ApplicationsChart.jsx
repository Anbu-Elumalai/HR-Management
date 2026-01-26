import React from 'react';

const ApplicationsChart = () => {
    const data = [
        { label: 'Applications', value: 58, color: '#3b82f6' },
        { label: 'Shortlisted', value: 22, color: '#10b981' },
        { label: 'On-Hold', value: 12, color: '#f59e0b' },
        { label: 'Rejected', value: 8, color: '#ef4444' }, // calculated to sum to near 100 for visual
    ];

    return (
        <div className="chart-card">
            <h3 className="chart-title">Total Applications</h3>

            <div className="combined-progress">
                {data.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color
                        }}
                        className="progress-segment"
                        title={`${item.label}: ${item.value}%`}
                    ></div>
                ))}
            </div>

            <div className="stats-list">
                {data.map((item, index) => (
                    <div key={index} className="stat-row">
                        <div className="label-col">
                            <span className="dot" style={{ backgroundColor: item.color }}></span>
                            <span className="label-text">{item.label}</span>
                        </div>
                        <span className="percentage-pill" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                            {item.value}%
                        </span>
                    </div>
                ))}
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
                .combined-progress {
                    display: flex;
                    height: 10px;
                    border-radius: 5px;
                    overflow: hidden;
                    width: 100%;
                    margin-bottom: 2rem;
                }
                .progress-segment {
                    height: 100%;
                }
                .stats-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .label-col {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .label-text {
                    font-size: 0.9rem;
                    color: #4b5563;
                    font-weight: 500;
                }
                .percentage-pill {
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default ApplicationsChart;
