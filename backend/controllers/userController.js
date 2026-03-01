const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
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
        const { name, email, password } = req.body;

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
            user.email = req.body.email || user.email;

            // Handle file upload from Multer
            if (req.file) {
                // Construct accessible URL path. Replace backslashes for cross-platform
                user.profilePicture = `/uploads/${req.file.filename}`;
            }

            if (req.body.education !== undefined) {
                user.education = req.body.education;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.body.platforms) {
                // Merge with existing platforms or an empty object if undefined
                user.platforms = { ...(user.platforms || {}), ...req.body.platforms };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                education: updatedUser.education,
                platforms: updatedUser.platforms,
                token: generateToken(updatedUser._id),
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

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
};
