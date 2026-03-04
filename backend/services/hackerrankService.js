const axios = require('axios');

const getHackerrankData = async (username) => {
    try {
        // HackerRank allows fetching badges without authentication using this endpoint
        const response = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/badges`, {
            headers: {
                // Mimicking a browser to avoid simple scraper blocks
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000
        });

        if (!response.data || !response.data.models) {
            return { error: 'HackerRank user or badges not found' };
        }

        // Aggregate total stars across all badges
        let totalStars = 0;
        const badges = [];

        response.data.models.forEach(badge => {
            if (badge.stars > 0) {
                totalStars += badge.stars;
                badges.push({
                    name: badge.badge_name,
                    stars: badge.stars
                });
            }
        });

        return {
            handle: username,
            stars: totalStars,
            badges: badges,
            success: true
        };

    } catch (error) {
        console.error('Error fetching HackerRank data:', error.message);
        // Fallback to a success state without stars so the frontend still renders the basic link card
        return {
            handle: username,
            success: true,
            stars: 0,
            message: 'Could not load star stats at this time.'
        };
    }
};

module.exports = { getHackerrankData };
