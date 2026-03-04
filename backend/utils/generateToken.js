const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'profolio_fallback_secret_123';
    return jwt.sign({ id }, secret, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
