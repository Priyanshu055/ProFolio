import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------- validation helpers ----------
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// Block obviously fake/test domains
const BLOCKED_DOMAINS = ['test.com', 'example.com', 'fake.com', 'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'yopmail.com', 'trashmail.com'];

const validateEmail = (email) => {
    if (!EMAIL_REGEX.test(email)) return 'Enter a valid email address (e.g. you@gmail.com)';
    const domain = email.split('@')[1]?.toLowerCase();
    if (BLOCKED_DOMAINS.includes(domain)) return `"${domain}" is not allowed. Use a real email.`;
    return null;
};

const PASSWORD_RULES = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
    { label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const getStrength = (results) => {
    const passed = results.filter(Boolean).length;
    if (passed <= 1) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400', width: '20%' };
    if (passed === 2) return { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-400', width: '40%' };
    if (passed === 3) return { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-400', width: '60%' };
    if (passed === 4) return { label: 'Strong', color: 'bg-blue-500', textColor: 'text-blue-400', width: '80%' };
    return { label: 'Very Strong', color: 'bg-green-500', textColor: 'text-green-400', width: '100%' };
};
// ----------------------------------------

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Real-time password rule checks
    const ruleResults = useMemo(() => PASSWORD_RULES.map(r => r.test(password)), [password]);
    const allRulesPassed = ruleResults.every(Boolean);
    const strength = useMemo(() => getStrength(ruleResults), [ruleResults]);
    const emailError = useMemo(() => emailTouched ? validateEmail(email) : null, [email, emailTouched]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailTouched(true);
        setPasswordTouched(true);

        const emailErr = validateEmail(email);
        if (emailErr) return setError(emailErr);
        if (!allRulesPassed) return setError('Please create a stronger password that meets all requirements.');
        if (password !== confirmPassword) return setError('Passwords do not match.');

        setIsLoading(true);
        setError('');

        const result = await register(name, email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Failed to register');
        }
        setIsLoading(false);
    };

    const inputBase = "block w-full pl-10 pr-10 py-2.5 border rounded-xl bg-surface/50 text-text placeholder-muted focus:outline-none focus:ring-2 transition-all duration-300";
    const inputClass = (hasError) =>
        `${inputBase} ${hasError ? 'border-red-500/60 focus:ring-red-500/40' : 'border-white/10 focus:ring-accent focus:border-accent'}`;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-2xl p-8 relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent inline-flex items-center gap-2">
                            <UserPlus className="w-8 h-8 text-accent" /> Create Account
                        </h1>
                        <p className="text-muted">Start tracking your coding journey today</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-5 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start gap-3 text-red-400 text-sm"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputClass(false)}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-muted" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => setEmailTouched(true)}
                                    className={inputClass(!!emailError)}
                                    placeholder="you@gmail.com"
                                />
                                {emailTouched && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        {emailError
                                            ? <XCircle className="h-4 w-4 text-red-400" />
                                            : email && <CheckCircle2 className="h-4 w-4 text-green-400" />
                                        }
                                    </div>
                                )}
                            </div>
                            {emailError && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {emailError}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                                    className={inputClass(!allRulesPassed && passwordTouched && password.length > 0)}
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-text transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {password.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-muted">Password strength</span>
                                        <span className={`text-xs font-semibold ${strength.textColor}`}>{strength.label}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${strength.color}`}
                                            animate={{ width: strength.width }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Rule checklist — show when user starts typing */}
                            {passwordTouched && password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 space-y-1"
                                >
                                    {PASSWORD_RULES.map((rule, i) => (
                                        <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${ruleResults[i] ? 'text-green-400' : 'text-muted'}`}>
                                            {ruleResults[i]
                                                ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                : <XCircle className="w-3.5 h-3.5 shrink-0 opacity-50" />
                                            }
                                            {rule.label}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted" />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputClass(confirmPassword.length > 0 && confirmPassword !== password)}
                                    placeholder="Repeat your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-text transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && confirmPassword !== password && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Passwords do not match
                                </p>
                            )}
                            {confirmPassword.length > 0 && confirmPassword === password && (
                                <p className="mt-1.5 text-xs text-green-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-background transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent/25 mt-2"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-accent hover:text-accent/80 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
