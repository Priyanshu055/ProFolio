const axios = require('axios');

const getGithubData = async (username) => {
    try {
        const baseUrl = process.env.GITHUB_API_URL;
        const response = await axios.get(`${baseUrl}/users/${username}`);

        // Fetch contribution calendar from unofficial API (no auth needed)
        let contributions = [];
        try {
            const contribRes = await axios.get(
                `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
                { timeout: 8000 }
            );
            // Returns { total: { year: count }, contributions: [{ date, count, level }] }
            if (contribRes.data && Array.isArray(contribRes.data.contributions)) {
                contributions = contribRes.data.contributions; // [{ date: "2024-01-01", count: 5, level: 2 }]
            }
        } catch (e) {
            console.log('Could not fetch GitHub contribution calendar:', e.message);
        }

        return {
            username: response.data.login,
            name: response.data.name,
            avatar_url: response.data.avatar_url,
            public_repos: response.data.public_repos,
            followers: response.data.followers,
            following: response.data.following,
            contributions,  // daily contribution data for heatmap
        };
    } catch (error) {
        console.error('Error fetching GitHub data:', error.message);
        return { error: 'Failed to fetch GitHub data' };
    }
};

module.exports = { getGithubData };

