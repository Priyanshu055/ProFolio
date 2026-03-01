const axios = require('axios');

const getGithubData = async (username) => {
    try {
        const baseUrl = process.env.GITHUB_API_URL;
        const response = await axios.get(`${baseUrl}/users/${username}`);

        // We can also fetch repositories to get languages and stars
        // const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);

        return {
            username: response.data.login,
            name: response.data.name,
            avatar_url: response.data.avatar_url,
            public_repos: response.data.public_repos,
            followers: response.data.followers,
            following: response.data.following,
        };
    } catch (error) {
        console.error('Error fetching GitHub data:', error.message);
        return { error: 'Failed to fetch GitHub data' };
    }
};

module.exports = { getGithubData };
