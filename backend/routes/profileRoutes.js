const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const NodeCache = require('node-cache');

// Cache data for 3 minutes (180 seconds) — balance between freshness and API load
const profileCache = new NodeCache({ stdTTL: 180 });

const { getLeetcodeData } = require('../services/leetcodeService');
const { getCodeforcesData } = require('../services/codeforcesService');
const { getGithubData } = require('../services/githubService');
const { getCodechefData } = require('../services/codechefService');
const { getGeeksForGeeksData } = require('../services/gfgService');
const { getHackerrankData } = require('../services/hackerrankService');

// Mock services for platforms without easy public APIs/scrapers
// We return a structured format so the frontend doesn't break
const getMockPlatformData = async (platform, username) => {
    return {
        handle: username,
        platform: platform,
        success: true,
        message: 'Profile connected successfully.'
    }
};

// Robust utility to extract username from a full profile URL
const extractUsername = (url) => {
    if (!url) return '';
    try {
        // If it's clearly not a URL, return as is (backwards compatibility)
        if (!url.includes('/')) return url;

        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const segments = urlObj.pathname.split('/').filter(Boolean);
        let username = segments[segments.length - 1];

        // Handle HackerEarth @ usernames
        if (username && username.startsWith('@')) {
            username = username.substring(1);
        }
        return username;
    } catch (e) {
        return url;
    }
};

// @desc    Get aggregated profile data for the logged-in user
// @route   GET /api/profiles
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { platforms } = req.user;

        // Check if we already have this user's profile aggregated in the cache
        const cacheKey = `user_profiles_${userId}`;
        const cachedProfiles = profileCache.get(cacheKey);

        if (cachedProfiles) {
            console.log('Serving profiles from cache...');
            return res.json(cachedProfiles);
        }

        console.log('Fetching profiles fresh from APIs...');

        // We will run the data fetching concurrently to save time.
        const promises = [];
        const results = {};

        if (platforms.leetcode) {
            promises.push(
                getLeetcodeData(extractUsername(platforms.leetcode)).then(data => { results.leetcode = data; })
            );
        }

        if (platforms.codeforces) {
            promises.push(
                getCodeforcesData(extractUsername(platforms.codeforces)).then(data => { results.codeforces = data; })
            );
        }

        if (platforms.github) {
            promises.push(
                getGithubData(extractUsername(platforms.github)).then(data => { results.github = data; })
            );
        }

        if (platforms.codechef) {
            promises.push(
                getCodechefData(extractUsername(platforms.codechef)).then(data => { results.codechef = data; })
            );
        }

        if (platforms.geeksforgeeks) {
            promises.push(
                getGeeksForGeeksData(extractUsername(platforms.geeksforgeeks)).then(data => { results.geeksforgeeks = data; })
            );
        }

        if (platforms.hackerrank) {
            promises.push(
                getHackerrankData(extractUsername(platforms.hackerrank)).then(data => { results.hackerrank = data; })
            );
        }

        if (platforms.hackerearth) {
            const heUsername = extractUsername(platforms.hackerearth);
            promises.push(
                getMockPlatformData('hackerearth', heUsername).then(data => { results.hackerearth = data; })
            );
        }

        if (platforms.atcoder) {
            const acUsername = extractUsername(platforms.atcoder);
            promises.push(
                getMockPlatformData('atcoder', acUsername).then(data => { results.atcoder = data; })
            );
        }

        await Promise.all(promises);

        // Save to cache before returning
        profileCache.set(cacheKey, results);

        res.json(results);

    } catch (error) {
        console.error('Error fetching aggregated profile data', error);
        res.status(500).json({ message: 'Server error fetching profile data' });
    }
});

// @desc    Force-clear this user's cached profile data (manual refresh)
// @route   POST /api/profiles/refresh
// @access  Private
router.post('/refresh', protect, (req, res) => {
    const userId = req.user._id;
    const profileKey = `user_profiles_${userId}`;
    profileCache.del(profileKey);
    console.log(`[Cache] Cleared profile cache for user ${userId}`);
    res.json({ message: 'Cache cleared. Dashboard will reload fresh data.' });
});

module.exports = router;
