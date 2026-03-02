const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        course: {
            type: String,
            default: '',
        },
        branch: {
            type: String,
            default: '',
        },
        college: {
            type: String,
            default: '',
        },
        graduationYear: {
            type: String,
            default: '',
        },
        linkedin: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        platforms: {
            leetcode: { type: String, default: '' },
            codeforces: { type: String, default: '' },
            github: { type: String, default: '' },
            codechef: { type: String, default: '' },
            geeksforgeeks: { type: String, default: '' },
            hackerrank: { type: String, default: '' },
            hackerearth: { type: String, default: '' },
            atcoder: { type: String, default: '' },
        },
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
