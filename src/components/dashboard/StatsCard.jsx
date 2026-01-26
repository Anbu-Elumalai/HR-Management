import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, trendLabel }) => {
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
                    padding: 1.25rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .stat-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .icon-wrapper {
                    padding: 8px;
                    background: #f3f4f6;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-title {
                    color: #4b5563;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .stat-body {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                }
                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #111827;
                    line-height: 1;
                }
                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .text-green-500 { color: #10b981; }
                .text-red-500 { color: #ef4444; }
            `}</style>
        </div>
    );
};

export default StatsCard;
