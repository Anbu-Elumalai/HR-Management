import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue }) => {
    const isPositive = trend === 'up';
    const trendColor = isPositive ? 'text-green-500' : 'text-red-500';

    return (
        <div className="stat-card">
            <div className="stat-header">
                <div className="icon-wrapper">
                    {Icon && <Icon size={24} className="text-gray-600" />}
                </div>
                <span className="stat-title">{title}</span>
            </div>

            <div className="stat-body">
                <h2 className="stat-value">{value}</h2>
                <div className={`stat-trend ${trendColor}`}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{trendValue}</span>
                </div>
            </div>

            <style>{`
                .stat-card {
                    background: white;
                    padding: 1.5rem; /* Increased padding */
                    border-radius: 16px; /* consistent border radius */
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06); /* Softer shadow */
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem; /* Reduced inner gap */
                    height: 100%;
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    transfrom: translateY(-4px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
                }
                .stat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between; /* Icon on right? No, keep left */
                    gap: 0.75rem;
                }
                .icon-wrapper {
                    padding: 10px;
                    background: #f3f4f6;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4b5563;
                }
                .stat-title {
                    color: #6b7280;
                    font-weight: 500;
                    font-size: 0.95rem;
                }
                .stat-body {
                    display: flex;
                    align-items: baseline; /* Align text baseline */
                    gap: 0.75rem; /* Closer to metric */
                }
                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111827;
                    line-height: 1;
                    letter-spacing: -0.02em;
                }
                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 6px;
                    background: rgba(0,0,0,0.03); /* Subtle background for trend */
                }
                .text-green-500 { color: #059669; background-color: #ecfdf5; } /* Emerald 600 + 50 bg */
                .text-red-500 { color: #dc2626; background-color: #fef2f2; } /* Red 600 + 50 bg */
            `}</style>
        </div>
    );
};

export default StatsCard;
