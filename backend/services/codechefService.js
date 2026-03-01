const axios = require('axios');

const getCodechefData = async (handle) => {
    try {
        // Note: CodeChef doesn't have a reliable public open API, often relying on unofficial scrapers.
        // We will use a known public wrapper for demonstration. 
        // Replace with your own logic or scraping if this API goes down.
        const baseUrl = process.env.CODECHEF_API_URL;
        const response = await axios.get(`${baseUrl}/${handle}`);

        if (!response.data.success) {
            return { error: 'Codechef user not found or API error' };
        }

        return {
            handle: response.data.profile,
            rating: response.data.currentRating,
            highestRating: response.data.highestRating,
            stars: response.data.stars,
            globalRank: response.data.globalRank,
            countryRank: response.data.countryRank
        };

    } catch (error) {
        console.error('Error fetching CodeChef data:', error.message);
        return { error: 'Failed to fetch CodeChef data' };
    }
};

module.exports = { getCodechefData };
