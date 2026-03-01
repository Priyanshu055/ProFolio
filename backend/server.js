const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn("WARNING: MONGO_URI not found in .env, skipping database connection.");
}

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

const path = require('path');
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Default route
app.get('/', (req, res) => {
    res.send('Profile Checker API is running....');
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/contests', require('./routes/contestRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
