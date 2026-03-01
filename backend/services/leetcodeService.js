const axios = require('axios');

const getLeetcodeData = async (username) => {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            reputation
            starRating
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          topPercentage
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          contest {
            title
            startTime
          }
        }
      }
    `;

    const baseUrl = process.env.LEETCODE_API_URL;
    const response = await axios.post(baseUrl, {
      query,
      variables: { username }
    });

    if (response.data.errors) {
      return { error: 'User not found or LeetCode API error' };
    }

    const userData = response.data.data.matchedUser;
    const contestData = response.data.data.userContestRanking;
    const historyData = response.data.data.userContestRankingHistory;

    // Calculate total solved
    const solvedStats = userData.submitStats.acSubmissionNum;
    const totalSolved = solvedStats.find(s => s.difficulty === 'All')?.count || 0;

    // Parse Rating History
    let ratingHistory = [];
    if (historyData && historyData.length > 0) {
      // filter out unattended contests
      const attended = historyData.filter(h => h.attended);
      // get the last 10 contests for the trajectory
      ratingHistory = attended.slice(-10).map((h, i, arr) => {
        const prevRating = i > 0 ? arr[i - 1].rating : 1500; // 1500 is LC base
        return {
          contestName: h.contest.title,
          rating: Math.round(h.rating),
          change: Math.round(h.rating - prevRating),
          date: new Date(h.contest.startTime * 1000).toLocaleDateString()
        };
      });
    }

    return {
      username: userData.username,
      totalSolved: totalSolved,
      easySolved: solvedStats.find(s => s.difficulty === 'Easy')?.count || 0,
      mediumSolved: solvedStats.find(s => s.difficulty === 'Medium')?.count || 0,
      hardSolved: solvedStats.find(s => s.difficulty === 'Hard')?.count || 0,
      ranking: userData.profile.ranking,
      contestRating: contestData ? Math.round(contestData.rating) : null,
      attendedContests: contestData ? contestData.attendedContestsCount : 0,
      ratingHistory: ratingHistory
    };

  } catch (error) {
    console.error('Error fetching LeetCode data:', error.message);
    return { error: 'Failed to fetch LeetCode data' };
  }
};

module.exports = { getLeetcodeData };
