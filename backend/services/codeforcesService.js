const axios = require('axios');

const getCodeforcesData = async (handle) => {
    try {
        const baseUrl = process.env.CODEFORCES_API_URL;
        const response = await axios.get(`${baseUrl}/user.info?handles=${handle}`);

        if (response.data.status !== 'OK') {
            return { error: 'Codeforces user not found' };
        }

        const userData = response.data.result[0];

        // Fetch Rating History for Trajectory & Past Contests
        let ratingHistory = [];
        try {
            const ratingRes = await axios.get(`${baseUrl}/user.rating?handle=${handle}`);
            if (ratingRes.data.status === 'OK' && ratingRes.data.result) {
                // The Dashboard graph expects `{ date, rating }` for Recharts AreaChart parsing
                ratingHistory = ratingRes.data.result.slice(-10).map(contest => ({
                    contestName: contest.contestName,
                    rating: contest.newRating,
                    change: contest.newRating - contest.oldRating,
                    date: new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString()
                }));
            }
        } catch (e) {
            console.log('Could not fetch CF rating history', e.message);
        }

        // Fetch Total Solved Problems (Unique)
        let totalSolved = 0;
        try {
            const statusRes = await axios.get(`${baseUrl}/user.status?handle=${handle}`);
            if (statusRes.data.status === 'OK' && statusRes.data.result) {
                const uniqueProblems = new Set();
                statusRes.data.result.forEach(sub => {
                    if (sub.verdict === 'OK' && sub.problem && sub.problem.name) {
                        uniqueProblems.add(sub.problem.name);
                    }
                });
                totalSolved = uniqueProblems.size;
            }
        } catch (e) {
            console.log('Could not fetch CF solved problems', e.message);
            totalSolved = 'N/A'; // Provide default if API fails
        }

        return {
            handle: userData.handle,
            rating: userData.rating || 0,
            maxRating: userData.maxRating || 0,
            rank: userData.rank || 'Unrated',
            maxRank: userData.maxRank || 'Unrated',
            contribution: userData.contribution || 0,
            totalSolved: totalSolved,
            ratingHistory: ratingHistory
        };

    } catch (error) {
        console.error('Error fetching Codeforces data:', error.message);
        return { error: 'Failed to fetch Codeforces data' };
    }
};

module.exports = { getCodeforcesData };
