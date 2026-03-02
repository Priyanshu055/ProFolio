import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    User as UserIcon, Save, GraduationCap, AlertCircle, CheckCircle2,
    Upload, Linkedin, Code2, BookOpen, Building2, Calendar, Tag, X, PenLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COURSES = [
    '', 'B.Tech', 'B.E.', 'B.Sc (CS)', 'BCA', 'MCA', 'M.Tech', 'M.Sc (CS)', 'MBA', 'Ph.D', 'Diploma', 'Other'
];

const BRANCHES = [
    '', 'Computer Science & Engineering', 'Information Technology', 'Electronics & Communication',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Data Science & AI',
    'Cyber Security', 'Software Engineering', 'Other'
];

const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = ['', ...Array.from({ length: 8 }, (_, i) => String(currentYear - 2 + i))];

const Profile = () => {
    const { user, setUser } = useAuth();

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [course, setCourse] = useState('');
    const [branch, setBranch] = useState('');
    const [college, setCollege] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setCourse(user.course || '');
            setBranch(user.branch || '');
            setCollege(user.college || '');
            setGraduationYear(user.graduationYear || '');
            setLinkedin(user.linkedin || '');
            setSkills(user.skills || []);
            if (user.profilePicture) {
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
            if (file.size > 5 * 1024 * 1024) {
                setStatus({ type: 'error', message: 'File size must be less than 5MB' });
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
            setSkills([...skills, trimmed]);
            setSkillInput('');
        }
    };

    const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkill();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('bio', bio);
            formData.append('course', course);
            formData.append('branch', branch);
            formData.append('college', college);
            formData.append('graduationYear', graduationYear);
            formData.append('linkedin', linkedin);
            // Serialize skills array as JSON string for multipart/form-data
            formData.append('skills', JSON.stringify(skills));
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
            setUser({ ...data, token: data.token || user.token });
            localStorage.setItem('userInfo', JSON.stringify({ ...data, token: data.token || user.token }));
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message;
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "block w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-surface/50 text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-sm";
    const selectClass = "block w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-surface/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-sm appearance-none";

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
                <p className="text-muted mt-2">Customize your public appearance and showcase your background.</p>
            </div>

            <AnimatePresence>
                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
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
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* === AVATAR & BASIC INFO === */}
                <div className="glass rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                    <h2 className="text-lg font-semibold mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-primary" /> Identity
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="relative w-36 h-36 rounded-full group cursor-pointer border-4 border-surface shadow-xl overflow-hidden bg-surface flex items-center justify-center transition-transform hover:scale-105"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-14 h-14 text-muted opacity-40" />
                                )}
                                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Upload className="w-7 h-7 text-white mb-1" />
                                    <span className="text-white text-xs font-semibold uppercase tracking-wider">Upload</span>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" className="hidden" />
                            <p className="text-xs text-muted text-center">Square image, max 5MB (JPEG or PNG)</p>
                        </div>

                        {/* Name + Bio */}
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Display Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                        <UserIcon className="w-4 h-4 text-muted" />
                                    </div>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="John Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Bio <span className="text-muted font-normal">(short intro)</span></label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none opacity-50">
                                        <PenLine className="w-4 h-4 text-muted" />
                                    </div>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={3}
                                        maxLength={200}
                                        placeholder="Competitive programmer | Open source enthusiast..."
                                        className="block w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-surface/50 text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-sm resize-none"
                                    />
                                    <span className="text-xs text-muted absolute bottom-2 right-3">{bio.length}/200</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === EDUCATION === */}
                <div className="glass rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-56 h-56 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
                    <h2 className="text-lg font-semibold mb-6 pb-3 border-b border-white/10 flex items-center gap-2 relative z-10">
                        <GraduationCap className="w-4 h-4 text-secondary" /> Education
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">

                        {/* Course */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">Course / Degree</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                    <BookOpen className="w-4 h-4 text-muted" />
                                </div>
                                <select value={course} onChange={(e) => setCourse(e.target.value)} className={selectClass}>
                                    {COURSES.map(c => <option key={c} value={c}>{c || '— Select Course —'}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Branch */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">Branch / Stream</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                    <Code2 className="w-4 h-4 text-muted" />
                                </div>
                                <select value={branch} onChange={(e) => setBranch(e.target.value)} className={selectClass}>
                                    {BRANCHES.map(b => <option key={b} value={b}>{b || '— Select Branch —'}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* College */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">College / Institute</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                    <Building2 className="w-4 h-4 text-muted" />
                                </div>
                                <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} className={inputClass} placeholder="e.g. IIT Delhi, NIT Trichy..." />
                            </div>
                        </div>

                        {/* Graduation Year */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">Graduation Year</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                    <Calendar className="w-4 h-4 text-muted" />
                                </div>
                                <select value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} className={selectClass}>
                                    {GRADUATION_YEARS.map(y => <option key={y} value={y}>{y || '— Select Year —'}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === SKILLS & SOCIAL === */}
                <div className="glass rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-56 h-56 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                    <h2 className="text-lg font-semibold mb-6 pb-3 border-b border-white/10 flex items-center gap-2 relative z-10">
                        <Tag className="w-4 h-4 text-primary" /> Skills & Social
                    </h2>
                    <div className="space-y-5 relative z-10">

                        {/* LinkedIn */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">LinkedIn Profile URL</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                    <Linkedin className="w-4 h-4 text-muted" />
                                </div>
                                <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/your-profile" />
                            </div>
                        </div>

                        {/* Skills tag input */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                Skills / Technologies <span className="text-muted font-normal">(press Enter or , to add)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                                    <Tag className="w-4 h-4 text-muted" />
                                </div>
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleSkillKeyDown}
                                    onBlur={addSkill}
                                    className={inputClass}
                                    placeholder="C++, Python, React, DSA..."
                                    disabled={skills.length >= 15}
                                />
                            </div>
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {skills.map(skill => (
                                        <motion.span
                                            key={skill}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-primary text-sm font-medium"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.span>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-muted mt-2">{skills.length}/15 skills added</p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pb-6">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 disabled:opacity-50 hover:shadow-primary/30 hover:shadow-xl cursor-pointer"
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            <><Save className="w-5 h-5" /> Save Profile</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
