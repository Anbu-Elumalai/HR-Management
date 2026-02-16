import React, { useState, useRef } from 'react';
import {
    User, Mail, Phone, MapPin, Camera, Lock,
    Edit2, Save, X, Key, Shield, CheckCircle
} from 'lucide-react';

const ProfilePage = () => {
    // Mode: 'view' or 'edit'
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);

    // Profile Data
    const [profile, setProfile] = useState({
        name: 'Admin User',
        email: 'admin@hrsystem.com',
        phone: '+91 98765 43210',
        designation: 'Super Admin',
        department: 'Operations',
        location: 'Tamil Nadu, India',
        joinDate: 'Jan 15, 2024'
    });

    // PIN State (4 digits)
    const [currentPin, setCurrentPin] = useState(['', '', '', '']);
    const [newPin, setNewPin] = useState(['', '', '', '']);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePinChange = (index, value, type) => {
        if (value.length > 1) return; // Only 1 digit per box
        if (!/^\d*$/.test(value)) return; // Only numbers

        const setPin = type === 'current' ? setCurrentPin : setNewPin;
        setPin(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });

        // Auto focus next input
        if (value !== '' && index < 3) {
            const nextInput = document.getElementById(`${type}-pin-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProfile = () => {
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setIsEditing(false);
    };

    return (
        <div className="profile-page">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            <div className="profile-header-alt">
                <div className="profile-title-section">
                    <h1>
                        <User size={28} />
                        My Profile
                    </h1>
                    <p>Manage your account settings and personal information</p>
                </div>
                {!isEditing && (
                    <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-container">
                <div className="profile-grid">
                    {/* Left Column - User Info Card */}
                    <div className="profile-card user-main-card">
                        <div className="avatar-section">
                            <div
                                className={`profile-avatar-large ${isEditing ? 'editable' : ''}`}
                                onClick={handleAvatarClick}
                            >
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="avatar-img-preview" />
                                ) : (
                                    <div className="avatar-initials">{profile.name.charAt(0)}</div>
                                )}
                                {isEditing && (
                                    <div className="avatar-overlay" title="Upload New Image">
                                        <Camera size={24} />
                                    </div>
                                )}
                            </div>
                            <h2>{profile.name}</h2>
                            <span className="designation-badge">{profile.designation}</span>
                        </div>

                        <div className="quick-info">
                            <div className="info-item">
                                <Mail size={16} />
                                <span>{profile.email}</span>
                            </div>
                            <div className="info-item">
                                <MapPin size={16} />
                                <span>{profile.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Detail Tabs and Forms */}
                    <div className="profile-details-column">
                        <div className="profile-card">
                            <div className="card-header-flex">
                                <h3 className="card-title">Personal Information</h3>
                                {isEditing && (
                                    <div className="form-actions-inline">
                                        <button className="btn-save-mini" onClick={saveProfile}><Save size={16} /> Save</button>
                                        <button className="btn-cancel-mini" onClick={cancelEdit}><X size={16} /></button>
                                    </div>
                                )}
                            </div>

                            <div className="personal-info-grid">
                                <div className="detail-group">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <input type="text" name="name" value={profile.name} onChange={handleInputChange} />
                                    ) : (
                                        <p>{profile.name}</p>
                                    )}
                                </div>
                                <div className="detail-group">
                                    <label>Email Address</label>
                                    {isEditing ? (
                                        <input type="email" name="email" value={profile.email} onChange={handleInputChange} />
                                    ) : (
                                        <p>{profile.email}</p>
                                    )}
                                </div>
                                <div className="detail-group">
                                    <label>Phone Number</label>
                                    {isEditing ? (
                                        <input type="text" name="phone" value={profile.phone} onChange={handleInputChange} />
                                    ) : (
                                        <p>{profile.phone}</p>
                                    )}
                                </div>
                                <div className="detail-group">
                                    <label>Designation</label>
                                    <p>{profile.designation}</p>
                                </div>
                                <div className="detail-group">
                                    <label>Department</label>
                                    <p>{profile.department}</p>
                                </div>
                                <div className="detail-group">
                                    <label>Join Date</label>
                                    <p>{profile.joinDate}</p>
                                </div>
                            </div>
                        </div>

                        <div className="profile-card">
                            <div className="card-header-flex">
                                <h3 className="card-title">Security & PIN</h3>
                            </div>
                            <div className="password-section">
                                <div className="pin-update-container">
                                    <div className="pin-box-section">
                                        <label>Current 4-Digit PIN</label>
                                        <div className="pin-input-group">
                                            {currentPin.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    id={`current-pin-${idx}`}
                                                    type="password"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handlePinChange(idx, e.target.value, 'current')}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !digit && idx > 0) {
                                                            const prevInput = document.getElementById(`current-pin-${idx - 1}`);
                                                            if (prevInput) prevInput.focus();
                                                        }
                                                    }}
                                                    className="pin-digit-box"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pin-box-section">
                                        <label>New 4-Digit PIN</label>
                                        <div className="pin-input-group">
                                            {newPin.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    id={`new-pin-${idx}`}
                                                    type="password"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handlePinChange(idx, e.target.value, 'new')}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !digit && idx > 0) {
                                                            const prevInput = document.getElementById(`new-pin-${idx - 1}`);
                                                            if (prevInput) prevInput.focus();
                                                        }
                                                    }}
                                                    className="pin-digit-box"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pin-actions">
                                        <button className="btn-update-password">
                                            <Shield size={16} />
                                            Update Secure PIN
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-page {
                    height: calc(100vh - 64px);
                    background-color: #084a52;
                    padding: 2rem;
                    color: white;
                    width: 100%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .profile-header-alt {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .profile-title-section h1 {
                    font-size: 1.6rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .profile-title-section p {
                    color: rgba(255, 255, 255, 0.7);
                    margin-top: 0.25rem;
                    font-size: 0.9rem;
                    margin-left: 2.75rem;
                }

                .btn-edit-profile {
                    background: #0d5f68;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    transition: all 0.2s;
                }

                .btn-edit-profile:hover {
                    background: #0b4f57;
                    transform: translateY(-1px);
                }

                .profile-container {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }

                .profile-container::-webkit-scrollbar {
                    width: 6px;
                }

                .profile-container::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }

                .profile-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 2rem;
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                }

                .profile-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    color: #1f2937;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }

                .user-main-card {
                    padding: 2rem;
                    text-align: center;
                    height: fit-content;
                }

                .avatar-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .profile-avatar-large {
                    width: 120px;
                    height: 120px;
                    background: #f0fdfa;
                    color: #0d5f68;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: 800;
                    margin-bottom: 1.25rem;
                    position: relative;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                    overflow: hidden;
                    transition: all 0.2s;
                    border: 2px solid transparent;
                }

                .profile-avatar-large.editable {
                    cursor: pointer;
                }

                .profile-avatar-large.editable:hover {
                    border-color: #0d5f68;
                }

                .avatar-img-preview {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .profile-avatar-large:hover .avatar-overlay {
                    opacity: 1;
                }

                .user-main-card h2 {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 0.5rem;
                }

                .designation-badge {
                    background: #e0f2f1;
                    color: #00796b;
                    padding: 0.25rem 1rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .quick-info {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #f3f4f6;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    text-align: left;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #4b5563;
                    font-size: 0.9rem;
                }

                .info-item span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .profile-card .card-header-flex {
                    padding: 1.25rem 1.75rem;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #111827;
                }

                .personal-info-grid {
                    padding: 2rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .detail-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .detail-group label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }

                .detail-group p {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #111827;
                }

                .detail-group input {
                    padding: 0.6rem 0.75rem;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .detail-group input:focus {
                    border-color: #0d5f68;
                }

                .password-section {
                    padding: 2rem;
                }

                .pin-update-container {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .pin-box-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .pin-box-section label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #4b5563;
                }

                .pin-input-group {
                    display: flex;
                    gap: 1rem;
                }

                .pin-digit-box {
                    width: 60px;
                    height: 60px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #111827;
                    outline: none;
                    transition: all 0.2s;
                    background: #f9fafb;
                }

                .pin-digit-box:focus {
                    border-color: #0d5f68;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(13, 95, 104, 0.1);
                }

                .pin-actions {
                    margin-top: 1rem;
                    display: flex;
                    justify-content: flex-end;
                }

                .btn-update-password {
                    background: #111827;
                    color: white;
                    border: none;
                    padding: 0.8rem 2rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .btn-update-password:hover {
                    background: #1f2937;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .form-actions-inline {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-save-mini {
                    background: #0d5f68;
                    color: white;
                    border: none;
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    cursor: pointer;
                }

                .btn-cancel-mini {
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;
