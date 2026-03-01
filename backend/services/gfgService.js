const axios = require('axios');

const getGeeksForGeeksData = async (handle) => {
    try {
        // GfG also lacks an official open API. Using a public scraper wrapper.
        const baseUrl = process.env.GEEKSFORGEEKS_API_URL;
        const response = await axios.get(`${baseUrl}/${handle}`);

        // The structure depends heavily on the scraper wrapper used.
        // Assuming this common scraper structure
        return {
            handle: response.data.info.userName || handle,
            totalSolved: response.data.info.totalProblemsSolved || 0,
            codingScore: response.data.info.codingScore || 0,
            institutionRank: response.data.info.institutionRank || 'N/A'
        };

    } catch (error) {
        console.error('Error fetching GeeksForGeeks data:', error.message);
        return { error: 'Failed to fetch GeeksForGeeks data' };
    }
};

module.exports = { getGeeksForGeeksData };
