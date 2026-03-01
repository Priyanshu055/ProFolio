const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const NodeCache = require('node-cache');

// Cache data for 10 minutes (600 seconds) to prevent slow Dashboard loads
const profileCache = new NodeCache({ stdTTL: 600 });

const { getLeetcodeData } = require('../services/leetcodeService');
const { getCodeforcesData } = require('../services/codeforcesService');
const { getGithubData } = require('../services/githubService');
const { getCodechefData } = require('../services/codechefService');
const { getGeeksForGeeksData } = require('../services/gfgService');

// Mock services for platforms without easy public APIs/scrapers
// We return a structured format so the frontend doesn't break
const getMockPlatformData = async (platform, username) => {
    return {
        handle: username,
        platform: platform,
        totalSolved: 0,
        rank: 'N/A',
        maxRating: 'N/A',
        message: 'Stats API currently unavailable for this platform'
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
        const { id } = req.user;
        const { platforms } = req.user;

        // Check if we already have this user's profile aggregated in the cache
        const cacheKey = `user_profiles_${id}`;
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
            const hrUsername = extractUsername(platforms.hackerrank);
            promises.push(
                getMockPlatformData('hackerrank', hrUsername).then(data => { results.hackerrank = data; })
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

module.exports = router;
