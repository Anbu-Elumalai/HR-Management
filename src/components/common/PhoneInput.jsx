import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import './PhoneInput.css';

const countries = [
    { code: '+91', name: 'India', short: 'in' },
    { code: '+1', name: 'USA', short: 'us' },
    { code: '+44', name: 'UK', short: 'gb' },
    { code: '+61', name: 'Australia', short: 'au' },
    { code: '+971', name: 'UAE', short: 'ae' },
    { code: '+65', name: 'Singapore', short: 'sg' },
    { code: '+49', name: 'Germany', short: 'de' },
    { code: '+33', name: 'France', short: 'fr' },
    { code: '+81', name: 'Japan', short: 'jp' },
    { code: '+86', name: 'China', short: 'cn' },
    { code: '+1', name: 'Canada', short: 'ca' },
    { code: '+7', name: 'Russia', short: 'ru' },
    { code: '+55', name: 'Brazil', short: 'br' },
    { code: '+27', name: 'South Africa', short: 'za' },
    { code: '+82', name: 'South Korea', short: 'kr' },
    { code: '+34', name: 'Spain', short: 'es' },
    { code: '+39', name: 'Italy', short: 'it' },
    { code: '+31', name: 'Netherlands', short: 'nl' },
    { code: '+41', name: 'Switzerland', short: 'ch' },
    { code: '+46', name: 'Sweden', short: 'se' },
    { code: '+64', name: 'New Zealand', short: 'nz' },
    { code: '+60', name: 'Malaysia', short: 'my' },
    { code: '+66', name: 'Thailand', short: 'th' },
    { code: '+62', name: 'Indonesia', short: 'id' },
    { code: '+84', name: 'Vietnam', short: 'vn' },
    { code: '+92', name: 'Pakistan', short: 'pk' },
    { code: '+880', name: 'Bangladesh', short: 'bd' },
    { code: '+94', name: 'Sri Lanka', short: 'lk' }
];

const PhoneInput = ({ value = '', onChange, placeholder = 'Phone Number', error = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const dropdownRef = useRef(null);

    const getFlagUrl = (short) => `https://flagcdn.com/w40/${short.toLowerCase()}.png`;

    // Parse initial value if exists
    useEffect(() => {
        if (value) {
            // Find matched country based on common codes
            const matchedCountry = countries
                .sort((a, b) => b.code.length - a.code.length) // Match longest code first (+880 before +8)
                .find(c => value.startsWith(c.code));
            
            if (matchedCountry) {
                setSelectedCountry(matchedCountry);
                setPhoneNumber(value.slice(matchedCountry.code.length).trim());
            } else {
                setPhoneNumber(value);
            }
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        // Reuse dropdownRef since it's the wrapper for the component
    }, []);

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearchTerm('');
        const fullNumber = `${country.code} ${phoneNumber}`.trim();
        onChange(fullNumber);
    };

    const handleNumberChange = (e) => {
        const val = e.target.value.replace(/[^0-9\s-]/g, '');
        const digits = val.replace(/\D/g, '');
        if (digits.length > 15) return;
        
        setPhoneNumber(val);
        const fullNumber = `${selectedCountry.code} ${val}`.trim();
        onChange(fullNumber);
    };

    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.code.includes(searchTerm) ||
        c.short.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const wrapperRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`phone-input-container ${error ? 'phone-input-error' : ''}`} ref={wrapperRef}>
            <div className="country-selector">
                <button 
                    type="button"
                    className="country-display" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <img 
                        src={getFlagUrl(selectedCountry.short)} 
                        alt={selectedCountry.name} 
                        className="flag-img"
                    />
                    <span className="country-code-val">{selectedCountry.code}</span>
                    <ChevronDown size={14} className={`chevron ${isOpen ? 'open' : ''}`} />
                </button>

                {isOpen && (
                    <div className="country-dropdown">
                        <div className="country-search-container">
                            <Search size={14} className="search-icon" />
                            <input 
                                type="text" 
                                className="country-search-input"
                                placeholder="Search country or code..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                        <div className="country-list">
                            {filteredCountries.map((country, idx) => (
                                <div 
                                    key={`${country.short}-${idx}`} 
                                    className={`country-item ${selectedCountry.short === country.short ? 'selected' : ''}`}
                                    onClick={() => handleCountrySelect(country)}
                                >
                                    <div className="country-item-info">
                                        <img 
                                            src={getFlagUrl(country.short)} 
                                            alt={country.name} 
                                            className="country-flag-img" 
                                        />
                                        <span className="country-name">{country.name}</span>
                                    </div>
                                    <span className="country-dial-code">{country.code}</span>
                                </div>
                            ))}
                            {filteredCountries.length === 0 && (
                                <div className="no-results">No matches found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <input 
                type="tel" 
                className="number-input" 
                placeholder={placeholder}
                value={phoneNumber}
                onChange={handleNumberChange}
                onFocus={(e) => e.target.parentElement.classList.add('focused')}
                onBlur={(e) => e.target.parentElement.classList.remove('focused')}
            />
        </div>
    );
};

export default PhoneInput;
