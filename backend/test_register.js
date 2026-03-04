const axios = require('axios');

async function testRegister() {
    try {
        console.log("Testing POST /api/users/");
        const res = await axios.post('http://localhost:5000/api/users/', {
            name: "Test User_" + Date.now(),
            email: `testuser_${Date.now()}@gmail.com`,
            password: "StrongPassword123!"
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.log("Error status:", e.response?.status);
        console.log("Error data:", e.response?.data);
        console.log("Error message:", e.message);
    }
}

testRegister();
