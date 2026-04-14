import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({
    cardTitle,
    totalCount = 0,
    icon: Icon,
    title = 'No Data Found',
    description = '',
    buttonLabel = 'Create New',
    onCreate
}) => {
    return (
        <div className="table-container-premium shadow-premium" style={{ flex: 1, minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
            {/* Standard Card Header */}
            {cardTitle && (
                <div className="table-header-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#ffffff', flexShrink: 0 }}>
                    <div className="header-info-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{cardTitle}</h3>
                        <span className="count-chip" style={{ background: '#f1f5f9', color: '#334155', padding: '2px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #e2e8f0', textTransform: 'uppercase' }}>
                            {totalCount} TOTAL
                        </span>
                    </div>
                </div>
            )}

            {/* Empty State Content */}
            <div className="empty-state-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 60px 20px', background: '#ffffff' }}>
                <div className="empty-state-card" style={{ background: 'transparent', boxShadow: 'none', padding: 0, marginTop: '-80px', textAlign: 'center' }}>
                    <div className="empty-icon-container" style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                        {Icon && <Icon size={40} />}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>{title}</h3>
                    <p style={{ margin: '0.5rem 0 1.5rem', color: '#475569', fontSize: '0.9rem', maxWidth: '300px' }}>{description}</p>
                    {onCreate && (
                        <button className="btn-primary" onClick={onCreate} style={{ height: '44px', padding: '0 20px', borderRadius: '10px' }}>
                            <Plus size={18} />
                            {buttonLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
