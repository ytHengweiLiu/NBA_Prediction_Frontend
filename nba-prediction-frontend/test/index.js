const axios = require('axios');

async function testLambdaApi(team1, team2) {
    const url = "https://wgy9k8xhz5.execute-api.us-east-1.amazonaws.com/NBAPrediction/nba-data-retrieval";
    const payload = {
        team1Name: team1,
        team2Name: team2
    };
    const headers = { "Content-Type": "application/json" };

    try {
        const response = await axios.post(url, payload, { headers: headers });
        console.log("Response:", JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error("Error:", error);
    }
}

const team1 = "Boston";  // Replace with actual team name
const team2 = "New York";  // Replace with actual team name
testLambdaApi(team1, team2);

