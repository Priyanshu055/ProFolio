require('dotenv').config();
const axios = require('axios');

async function testContests() {
    // Read all URLs from .env (with safe fallbacks)
    const kontestsUrl = process.env.KONTESTS_API_URL || 'https://kontests.net/api/v1/all';
    const codeforcesUrl = process.env.CODEFORCES_API_URL || 'https://codeforces.com/api';
    const leetcodeUrl = process.env.LEETCODE_API_URL || 'https://leetcode.com/graphql';
    const codechefUrl = 'https://www.codechef.com/api/list/contests/all';
    const hackerEarthUrl = 'https://www.hackerearth.com/chrome-extension/events/';

    console.log('\n--- Testing kontests.net (Primary Source) ---');
    try {
        const kontestsRes = await axios.get(kontestsUrl, { timeout: 4000 });
        if (kontestsRes.data && kontestsRes.data.length > 0) {
            const upcoming = kontestsRes.data
                .filter(c => new Date(c.start_time) > new Date())
                .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            console.log(`Kontests OK: ${upcoming.length} upcoming contests found.`);
            if (upcoming.length > 0) {
                console.log('Next contest:', upcoming[0].name, '|', upcoming[0].site);
            }
        } else {
            console.log('Kontests returned empty data.');
        }
    } catch (e) {
        console.error('Kontests FAILED:', e.message);
    }

    console.log('\n--- Testing Fallback Sources ---');
    const [cfRes, lcRes, ccRes, heRes] = await Promise.allSettled([
        axios.get(`${codeforcesUrl}/contest.list`, { timeout: 5000 }),
        axios.post(leetcodeUrl, {
            query: `{ allContests { title titleSlug startTime duration } }`
        }, { timeout: 5000 }),
        axios.get(codechefUrl, { timeout: 5000 }),
        axios.get(hackerEarthUrl, { timeout: 5000 })
    ]);

    // Codeforces
    if (cfRes.status === 'fulfilled' && cfRes.value.data.status === 'OK') {
        const count = cfRes.value.data.result.filter(c => c.phase === 'BEFORE').length;
        console.log(`Codeforces OK: ${count} upcoming contests.`);
    } else {
        console.error('Codeforces FAILED:', cfRes.reason?.message);
    }

    // LeetCode
    if (lcRes.status === 'fulfilled' && lcRes.value.data?.data?.allContests) {
        const count = lcRes.value.data.data.allContests.filter(c => (c.startTime * 1000) > Date.now()).length;
        console.log(`LeetCode OK: ${count} upcoming contests.`);
    } else {
        console.error('LeetCode FAILED:', lcRes.reason?.message);
    }

    // CodeChef
    if (ccRes.status === 'fulfilled' && ccRes.value.data?.future_contests) {
        console.log(`CodeChef OK: ${ccRes.value.data.future_contests.length} upcoming contests.`);
    } else {
        console.error('CodeChef FAILED:', ccRes.reason?.message);
    }

    // HackerEarth
    if (heRes.status === 'fulfilled' && heRes.value.data?.response) {
        const parsed = heRes.value.data.response.filter(c => {
            const d = new Date(c.start_timestamp);
            return !isNaN(d.getTime()) && d.getTime() > Date.now();
        });
        console.log(`HackerEarth OK: ${parsed.length} parseable upcoming contests (out of ${heRes.value.data.response.length} total).`);
    } else {
        console.error('HackerEarth FAILED:', heRes.reason?.message);
    }
}

testContests();
