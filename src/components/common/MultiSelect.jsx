import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

const MultiSelect = ({ options, value = [], onChange, placeholder = "Select...", error }) => {
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

    const filteredOptions = (options || []).filter(option =>
        String(option?.label || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );

    const toggleOption = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const removeOption = (e, optionValue) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    // Styles
    const containerStyle = {
        position: 'relative',
        width: '100%',
        fontFamily: 'inherit'
    };

    const selectBoxStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
        width: '100%',
        padding: '0.4rem 0.6rem',
        backgroundColor: error ? '#fef2f2' : '#fff',
        border: `1px solid ${error ? '#f87171' : '#e2e8f0'}`,
        borderRadius: '6px',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minHeight: '42px',
        outline: 'none'
    };

    const tagStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#f1f5f9',
        color: '#334155',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600'
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
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        maxHeight: '240px',
        overflowY: 'auto',
        zIndex: 100
    };

    return (
        <div style={containerStyle} ref={wrapperRef}>
            <div
                style={selectBoxStyle}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOptions.length > 0 ? (
                    selectedOptions.map(opt => (
                        <div key={opt.value} style={tagStyle}>
                            {opt.label}
                            <X size={12} onClick={(e) => removeOption(e, opt.value)} style={{ cursor: 'pointer' }} />
                        </div>
                    ))
                ) : (
                    <span style={{ color: '#9ca3af' }}>{placeholder}</span>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                     <ChevronDown size={16} color="#9ca3af" />
                </div>
            </div>

            {isOpen && (
                <div style={dropdownStyle}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem 0.5rem 2rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                }}
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
                                    padding: '0.6rem 1rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: value.includes(option.value) ? '#f0fdfa' : 'transparent',
                                    color: value.includes(option.value) ? '#0f766e' : '#334155',
                                    transition: 'background-color 0.2s'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(option.value);
                                }}
                                onMouseEnter={(e) => {
                                    if (!value.includes(option.value)) e.currentTarget.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    if (!value.includes(option.value)) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {option.label}
                                {value.includes(option.value) && <Check size={14} color="#0d9488" />}
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

export default MultiSelect;
