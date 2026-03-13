import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder = "Select...", error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option.value);
        setSearchTerm("");
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    // Styles matching the main project inputs
    const containerStyle = {
        position: 'relative',
        width: '100%',
        fontFamily: 'inherit'
    };

    const selectBoxStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.6rem 0.8rem', // Matching .form-group input
        backgroundColor: '#fff',
        border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
        borderRadius: '6px',
        fontSize: '0.9rem',
        color: selectedOption || value ? '#1e293b' : '#9ca3af',
        cursor: 'pointer',
        transition: 'all 0.2s',
        outline: 'none',
        height: '42px', // Explicit height to match inputs usually
    };

    const dropdownStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100%',
        marginTop: '0.25rem',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        maxHeight: '240px',
        overflowY: 'auto',
        zIndex: 50
    };

    const searchInputStyle = {
        width: '100%',
        padding: '0.5rem 0.75rem 0.5rem 2rem',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        fontSize: '0.875rem',
        outline: 'none',
    };

    return (
        <div style={containerStyle} ref={wrapperRef}>
            <div
                style={selectBoxStyle}
                onClick={() => setIsOpen(!isOpen)}
                className="hover:border-gray-400"
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOption ? selectedOption.label : (value || placeholder)}
                </span>
                <ChevronDown size={16} color="#9ca3af" />
            </div>

            {isOpen && (
                <div style={dropdownStyle}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                style={searchInputStyle}
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: value === option.value ? '#f0fdfa' : 'transparent',
                                    color: value === option.value ? '#0f766e' : '#334155'
                                }}
                                onClick={() => handleSelect(option)}
                                onMouseEnter={(e) => {
                                    if (value !== option.value) e.currentTarget.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== option.value) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {option.label}
                                {value === option.value && <Check size={14} color="#0d9488" />}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#64748b', textAlign: 'center' }}>
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
