import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Save, Image as ImageIcon, GraduationCap, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [name, setName] = useState('');
    const [education, setEducation] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEducation(user.education || '');
            if (user.profilePicture) {
                // If it's a full URL (like from GitHub OAuth), use it directly
                // If it's a local Multer path, prepend the backend host
                const picUrl = user.profilePicture.startsWith('http')
                    ? user.profilePicture
                    : `http://localhost:5000${user.profilePicture}`;
                setPreviewUrl(picUrl);
            }
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setStatus({ type: 'error', message: 'File size must be less than 5MB' });
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('education', education);
            if (selectedFile) {
                formData.append('profilePicture', selectedFile);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put('/api/users/profile', formData, config);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message;
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pt-4">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/20">
                    <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
                    Personal Profile
                </h1>
                <p className="text-muted mt-2">
                    Customize your public appearance and avatar.
                </p>
            </div>

            {status.message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success'
                        ? 'bg-accent/10 border-accent/20 text-accent'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}
                >
                    {status.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium text-sm">{status.message}</p>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        {/* Avatar Upload Section */}
                        <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                            <div
                                onClick={triggerFileInput}
                                className="relative w-40 h-40 rounded-full group cursor-pointer border-4 border-surface shadow-xl overflow-hidden bg-surface flex items-center justify-center transition-transform hover:scale-105"
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="w-16 h-16 text-muted opacity-50" />
                                )}

                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Upload className="w-8 h-8 text-white mb-2" />
                                    <span className="text-white text-xs font-semibold uppercase tracking-wider">Upload Image</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/jpg"
                                className="hidden"
                            />
                            <p className="text-xs text-muted text-center">
                                Recommended: Square image, max 5MB<br />(JPEG or PNG)
                            </p>
                        </div>

                        {/* Form Fields Section */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="group">
                                <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                                    Display Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                        <UserIcon className="w-4 h-4 text-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-surface/50 text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label htmlFor="education" className="block text-sm font-medium text-text mb-2">
                                    Educational Background
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                        <GraduationCap className="w-4 h-4 text-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        id="education"
                                        value={education}
                                        onChange={(e) => setEducation(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-surface/50 text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-sm"
                                        placeholder="e.g. B.Tech in Computer Science, MIT"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-3 rounded-xl font-medium text-white shadow-sm flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-primary/25 cursor-pointer w-full md:w-auto justify-center"
                                >
                                    {isSaving ? (
                                        <>Updating...</>
                                    ) : (
                                        <><Save className="w-5 h-5" /> Save Profile</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Profile;
