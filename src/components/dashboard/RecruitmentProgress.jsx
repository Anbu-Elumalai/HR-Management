import React from 'react';

const candidates = [
    { name: 'Dom Sibley', role: 'Devops', type: 'Tech interview', typeColor: '#3b82f6' },
    { name: 'Joe Root', role: 'UX/UI Designer', type: 'Resume review', typeColor: '#ef4444' },
    { name: 'Zak Crawley', role: '.Net developer', type: 'Final interview', typeColor: '#f59e0b' },
];

const RecruitmentProgress = () => {
    return (
        <div className="chart-card">
            <h3 className="chart-title">Recruitment progress</h3>

            <div className="table-container">
                <table className="recruitment-table">
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Department</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map((candidate, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="candidate-name">
                                        <div className="avatar-placeholder">{candidate.name.charAt(0)}</div>
                                        <span>{candidate.name}</span>
                                    </div>
                                </td>
                                <td>{candidate.role}</td>
                                <td>
                                    <div className="type-cell">
                                        <span className="dot" style={{ backgroundColor: candidate.typeColor }}></span>
                                        <span>{candidate.type}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .chart-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    height: 100%;
                }
                .chart-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: #1f2937;
                }
                .table-container {
                    overflow-x: auto;
                }
                .recruitment-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .recruitment-table th {
                    text-align: left;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #1f2937;
                    padding-bottom: 1rem;
                }
                .recruitment-table td {
                    padding: 1rem 0;
                    color: #4b5563;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .candidate-name {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .avatar-placeholder {
                    width: 32px;
                    height: 32px;
                    background: #e5e7eb;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.85rem;
                }
                .type-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

export default RecruitmentProgress;
