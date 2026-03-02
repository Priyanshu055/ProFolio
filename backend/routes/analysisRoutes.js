const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getLeetcodeData } = require('../services/leetcodeService');
const { getCodeforcesData } = require('../services/codeforcesService');
const NodeCache = require('node-cache');

// Cache analysis data for 30 minutes (heavy computation)
const analysisCache = new NodeCache({ stdTTL: 1800 });

// A normalization map: raw tag (lowercase) → clean display name
// Sources: LeetCode tag names + Codeforces tag names → common CS topics
const TAG_NORMALIZE_MAP = {
    // Arrays / Strings
    'array': 'Arrays',
    'string': 'Strings',
    'strings': 'Strings',
    'matrix': 'Arrays',
    'two pointers': 'Two Pointers',
    'sliding window': 'Sliding Window',
    'prefix sum': 'Prefix Sum',

    // Searching / Sorting
    'binary search': 'Binary Search',
    'sorting': 'Sorting',
    'divide and conquer': 'Divide & Conquer',

    // Data Structures
    'hash table': 'Hash Tables',
    'hash set': 'Hash Tables',
    'hash map': 'Hash Tables',
    'stack': 'Stack / Queue',
    'queue': 'Stack / Queue',
    'monotonic stack': 'Stack / Queue',
    'linked list': 'Linked Lists',
    'heap (priority queue)': 'Heaps',
    'priority queue': 'Heaps',
    'heaps': 'Heaps',

    // Trees
    'tree': 'Trees',
    'trees': 'Trees',
    'binary tree': 'Trees',
    'binary search tree': 'Trees',
    'segment tree': 'Segment Trees',
    'fenwick tree': 'Segment Trees',
    'trie': 'Tries',

    // Graphs
    'graph': 'Graphs',
    'graphs': 'Graphs',
    'dfs and similar': 'Graphs',
    'bfs': 'Graphs',
    'depth-first search': 'Graphs',
    'breadth-first search': 'Graphs',
    'shortest paths': 'Graphs',
    'union find': 'Graphs',
    'disjoint set': 'Graphs',
    'topological sort': 'Graphs',

    // Algorithms
    'dynamic programming': 'Dynamic Programming',
    'dp': 'Dynamic Programming',
    'greedy': 'Greedy',
    'backtracking': 'Backtracking',
    'recursion': 'Recursion',
    'bit manipulation': 'Bit Manipulation',
    'math': 'Math',
    'maths': 'Math',
    'number theory': 'Math',
    'combinatorics': 'Math',
    'geometry': 'Math',
    'games': 'Game Theory',
    'game theory': 'Game Theory',

    // Advanced
    'implementation': 'Implementation',
    'constructive algorithms': 'Implementation',
    'brute force': 'Brute Force',
    'two-sat': 'Advanced',
    'flows': 'Advanced',
    'fft': 'Advanced',
};

// Extract username from stored URL or plain text
const extractUsername = (urlOrHandle) => {
    if (!urlOrHandle) return '';
    try {
        if (!urlOrHandle.includes('/')) return urlOrHandle;
        const urlObj = new URL(urlOrHandle.startsWith('http') ? urlOrHandle : `https://${urlOrHandle}`);
        const segments = urlObj.pathname.split('/').filter(Boolean);
        return segments[segments.length - 1] || '';
    } catch {
        return urlOrHandle;
    }
};

// Merge and normalize tags from multiple platform tag arrays
const mergeAndNormalize = (tagArrays) => {
    const merged = {};
    tagArrays.forEach(({ tags, platform }) => {
        (tags || []).forEach(({ tag, solved }) => {
            const normalKey = TAG_NORMALIZE_MAP[tag.toLowerCase()];
            if (!normalKey) return; // Skip unknown tags
            if (!merged[normalKey]) {
                merged[normalKey] = { subject: normalKey, solved: 0, platforms: [] };
            }
            merged[normalKey].solved += solved;
            if (!merged[normalKey].platforms.includes(platform)) {
                merged[normalKey].platforms.push(platform);
            }
        });
    });
    return Object.values(merged).sort((a, b) => b.solved - a.solved);
};

// @desc    Get aggregated topic analysis for the logged-in user
// @route   GET /api/analysis/topics
// @access  Private
router.get('/topics', protect, async (req, res) => {
    try {
        const userId = req.user._id;           // Mongoose uses _id
        const platforms = req.user.platforms;   // access directly, not via destructure

        console.log('[Analysis] platforms:', JSON.stringify(platforms));

        const cacheKey = `analysis_topics_${userId}`;
        const cached = analysisCache.get(cacheKey);
        if (cached) {
            console.log('[Analysis] Serving from cache');
            return res.json(cached);
        }

        const promises = [];
        const tagSources = [];
        const sources = [];

        const lcRaw = platforms?.leetcode;
        const cfRaw = platforms?.codeforces;
        const lcHandle = extractUsername(lcRaw);
        const cfHandle = extractUsername(cfRaw);

        console.log('[Analysis] LC raw:', lcRaw, '→ handle:', lcHandle);
        console.log('[Analysis] CF raw:', cfRaw, '→ handle:', cfHandle);

        if (lcHandle) {
            promises.push(
                getLeetcodeData(lcHandle).then(data => {
                    console.log('[Analysis] LC tags count:', data.topicTags?.length, 'error:', data.error);
                    if (!data.error && data.topicTags?.length > 0) {
                        tagSources.push({ tags: data.topicTags, platform: 'LeetCode' });
                        sources.push('LeetCode');
                    }
                }).catch(e => console.error('[Analysis] LC fetch error:', e.message))
            );
        }

        if (cfHandle) {
            promises.push(
                getCodeforcesData(cfHandle).then(data => {
                    console.log('[Analysis] CF tags count:', data.topicTags?.length, 'error:', data.error);
                    if (!data.error && data.topicTags?.length > 0) {
                        tagSources.push({ tags: data.topicTags, platform: 'Codeforces' });
                        sources.push('Codeforces');
                    }
                }).catch(e => console.error('[Analysis] CF fetch error:', e.message))
            );
        }

        await Promise.all(promises);

        if (tagSources.length === 0) {
            return res.json({ topics: [], sources: [], message: 'Connect LeetCode or Codeforces to see topic analysis.' });
        }

        const topics = mergeAndNormalize(tagSources);
        const result = { topics, sources };

        analysisCache.set(cacheKey, result);
        res.json(result);

    } catch (error) {
        console.error('Error in topic analysis:', error.message);
        res.status(500).json({ message: 'Failed to generate topic analysis' });
    }
});

module.exports = router;
