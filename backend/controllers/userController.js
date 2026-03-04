const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        if (email) email = email.toLowerCase();

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                course: user.course,
                branch: user.branch,
                college: user.college,
                graduationYear: user.graduationYear,
                linkedin: user.linkedin,
                skills: user.skills,
                platforms: user.platforms,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            next(new Error('Invalid email or password'));
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
};


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        let { name, email, password } = req.body;
        if (email) email = email.toLowerCase();

        // --- Server-side email validation ---
        const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        const BLOCKED_DOMAINS = ['test.com', 'example.com', 'fake.com', 'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'yopmail.com', 'trashmail.com'];
        if (!email || !EMAIL_REGEX.test(email)) {
            res.status(400);
            return next(new Error('Please enter a valid email address.'));
        }
        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (BLOCKED_DOMAINS.includes(emailDomain)) {
            res.status(400);
            return next(new Error(`"${emailDomain}" is not allowed. Please use a real email address.`));
        }

        // --- Server-side password strength validation ---
        if (!password || password.length < 8) {
            res.status(400);
            return next(new Error('Password must be at least 8 characters long.'));
        }
        if (!/[A-Z]/.test(password)) {
            res.status(400);
            return next(new Error('Password must contain at least one uppercase letter.'));
        }
        if (!/[a-z]/.test(password)) {
            res.status(400);
            return next(new Error('Password must contain at least one lowercase letter.'));
        }
        if (!/[0-9]/.test(password)) {
            res.status(400);
            return next(new Error('Password must contain at least one number.'));
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            res.status(400);
            return next(new Error('Password must contain at least one special character (e.g. !@#$%).'));
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            return next(new Error('User already exists'));
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                platforms: user.platforms,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            next(new Error('Invalid user data'));
        }
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            return next(new Error('User with this email already exists'));
        }
        if (error.name === 'ValidationError') {
            res.status(400);
            return next(new Error(Object.values(error.errors).map(val => val.message).join(', ')));
        }
        res.status(500);
        next(error);
    }
};


// @desc    Get user profile (including platforms)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                course: user.course,
                branch: user.branch,
                college: user.college,
                graduationYear: user.graduationYear,
                linkedin: user.linkedin,
                skills: user.skills,
                platforms: user.platforms,
            });
        } else {
            res.status(404);
            next(new Error('User not found'));
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
};

// @desc    Update user profile (specifically platforms)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = (req.body.email || user.email).toLowerCase();

            // Handle file upload from Multer
            if (req.file) {
                // Construct accessible URL path. Replace backslashes for cross-platform
                user.profilePicture = `/uploads/${req.file.filename}`;
            }

            if (req.body.bio !== undefined) user.bio = req.body.bio;
            if (req.body.course !== undefined) user.course = req.body.course;
            if (req.body.branch !== undefined) user.branch = req.body.branch;
            if (req.body.college !== undefined) user.college = req.body.college;
            if (req.body.graduationYear !== undefined) user.graduationYear = req.body.graduationYear;
            if (req.body.linkedin !== undefined) user.linkedin = req.body.linkedin;

            // Skills can arrive as JSON string (multipart/form-data) or array (JSON body)
            if (req.body.skills !== undefined) {
                let skills = req.body.skills;
                if (typeof skills === 'string') {
                    try { skills = JSON.parse(skills); } catch (_) { skills = skills.split(',').map(s => s.trim()).filter(Boolean); }
                }
                if (Array.isArray(skills)) user.skills = skills;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.body.platforms) {
                // When sent as multipart/form-data, nested objects arrive as a JSON string.
                // We safely parse it here to avoid sending a corrupt type to Mongoose.
                let incomingPlatforms = req.body.platforms;
                if (typeof incomingPlatforms === 'string') {
                    try {
                        incomingPlatforms = JSON.parse(incomingPlatforms);
                    } catch (_) {
                        incomingPlatforms = null; // ignore if unparseable
                    }
                }
                if (incomingPlatforms && typeof incomingPlatforms === 'object') {
                    user.platforms = { ...(user.platforms?.toObject ? user.platforms.toObject() : user.platforms || {}), ...incomingPlatforms };
                }
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                bio: updatedUser.bio,
                course: updatedUser.course,
                branch: updatedUser.branch,
                college: updatedUser.college,
                graduationYear: updatedUser.graduationYear,
                linkedin: updatedUser.linkedin,
                skills: updatedUser.skills,
                platforms: updatedUser.platforms,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404);
            next(new Error('User not found'));
        }
    } catch (error) {
        console.error('Error updating user profile:', error.message, error.stack);
        res.status(500);
        next(error);
    }
};

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
};
