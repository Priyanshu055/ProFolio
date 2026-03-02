const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');
const NodeCache = require('node-cache');

// Cache contest data for 15 minutes globally (since contests are same for all users)
const contestCache = new NodeCache({ stdTTL: 900 });

// @desc    Get upcoming contests from various platforms
// @route   GET /api/contests
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const cacheKey = 'global_contests';
        const cachedContests = contestCache.get(cacheKey);

        if (cachedContests) {
            console.log('Serving upcoming contests from cache...');
            return res.json(cachedContests);
        }

        console.log('Fetching fresh contest data globally...');

        // Layer 1: Try the community Kontests API (Supports all platforms)
        try {
            const kontestsUrl = process.env.KONTESTS_API_URL || 'https://kontests.net/api/v1/all';
            const kontestsRes = await axios.get(kontestsUrl, { timeout: 4000 });
            if (kontestsRes.data && kontestsRes.data.length > 0) {
                const upcoming = kontestsRes.data
                    .filter(c => {
                        const d = new Date(c.start_time);
                        return !isNaN(d.getTime()) && d > new Date();
                    })
                    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
                if (upcoming.length > 0) {
                    contestCache.set(cacheKey, upcoming);
                    return res.json(upcoming); // Exit early if successful
                }
            }
        } catch (kontestsError) {
            console.log('Kontests API failed, falling back to manual aggregation...');
        }
        const codeforcesUrl = process.env.CODEFORCES_API_URL || 'https://codeforces.com/api';
        const leetcodeUrl = process.env.LEETCODE_API_URL || 'https://leetcode.com/graphql';

        const [cfRes, lcRes, ccRes, heRes] = await Promise.allSettled([
            axios.get(`${codeforcesUrl}/contest.list`, { timeout: 5000 }),
            axios.post(leetcodeUrl, {
                query: `
                    {
                        allContests {
                            title
                            titleSlug
                            startTime
                            duration
                        }
                    }
                `
            }, { timeout: 5000 }),
            axios.get('https://www.codechef.com/api/list/contests/all', { timeout: 5000 }),
            axios.get('https://www.hackerearth.com/chrome-extension/events/', { timeout: 5000 })
        ]);

        let aggregatedContests = [];

        // Parse Codeforces
        if (cfRes.status === 'fulfilled' && cfRes.value.data.status === 'OK') {
            const cfUpcoming = cfRes.value.data.result
                .filter(c => c.phase === 'BEFORE')
                .map(c => {
                    const startTimeMs = c.startTimeSeconds * 1000;
                    return {
                        name: c.name,
                        url: `https://codeforces.com/contests/${c.id}`,
                        start_time: new Date(startTimeMs).toISOString(),
                        end_time: new Date(startTimeMs + (c.durationSeconds * 1000)).toISOString(),
                        site: 'CodeForces',
                        in_24_hours: (startTimeMs - Date.now()) < (24 * 60 * 60 * 1000) ? 'Yes' : 'No',
                        status: 'BEFORE'
                    };
                });
            aggregatedContests = [...aggregatedContests, ...cfUpcoming];
        }

        // Parse LeetCode
        if (lcRes.status === 'fulfilled' && lcRes.value.data.data && lcRes.value.data.data.allContests) {
            const lcUpcoming = lcRes.value.data.data.allContests
                .filter(c => (c.startTime * 1000) > Date.now())
                .map(c => {
                    const startTimeMs = c.startTime * 1000;
                    return {
                        name: c.title,
                        url: `https://leetcode.com/contest/${c.titleSlug}`,
                        start_time: new Date(startTimeMs).toISOString(),
                        end_time: new Date(startTimeMs + (c.duration * 1000)).toISOString(),
                        site: 'LeetCode',
                        in_24_hours: (startTimeMs - Date.now()) < (24 * 60 * 60 * 1000) ? 'Yes' : 'No',
                        status: 'BEFORE'
                    };
                });
            aggregatedContests = [...aggregatedContests, ...lcUpcoming];
        }

        // Parse CodeChef
        if (ccRes && ccRes.status === 'fulfilled' && ccRes.value.data && ccRes.value.data.future_contests) {
            const ccUpcoming = ccRes.value.data.future_contests.map(c => {
                const startTimeMs = new Date(c.contest_start_date_iso).getTime();
                return {
                    name: c.contest_name,
                    url: `https://www.codechef.com/${c.contest_code}`,
                    start_time: c.contest_start_date_iso,
                    end_time: c.contest_end_date_iso,
                    site: 'CodeChef',
                    in_24_hours: (startTimeMs - Date.now()) < (24 * 60 * 60 * 1000) ? 'Yes' : 'No',
                    status: 'BEFORE'
                };
            });
            aggregatedContests = [...aggregatedContests, ...ccUpcoming];
        }

        // Parse HackerEarth
        // NOTE: HackerEarth uses a non-standard date string format that can fail to parse.
        // We validate each entry individually and skip any with an invalid date.
        if (heRes && heRes.status === 'fulfilled' && heRes.value.data && heRes.value.data.response) {
            const heUpcoming = heRes.value.data.response
                .reduce((acc, c) => {
                    try {
                        const startTimeMs = new Date(c.start_timestamp).getTime();
                        if (isNaN(startTimeMs) || startTimeMs <= Date.now()) return acc;
                        acc.push({
                            name: c.title,
                            url: c.url,
                            start_time: new Date(startTimeMs).toISOString(),
                            end_time: c.end_timestamp,
                            site: 'HackerEarth',
                            in_24_hours: (startTimeMs - Date.now()) < (24 * 60 * 60 * 1000) ? 'Yes' : 'No',
                            status: 'BEFORE'
                        });
                    } catch (_) { /* skip malformed entry */ }
                    return acc;
                }, []);
            aggregatedContests = [...aggregatedContests, ...heUpcoming];
        }

        // Sort combined fallback results
        const sortedContests = aggregatedContests.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        // Save successfully parsed contests to memory cache
        contestCache.set(cacheKey, sortedContests);

        res.json(sortedContests);

    } catch (error) {
        console.error('Fatal Error fetching contests:', error.message);
        res.status(500).json({ message: 'Failed to fetch global upcoming contests' });
    }
});

module.exports = router;
