import axios from 'axios';

async function testApi() {
    try {
        const responseList = await Promise.all([
            axios.get('http://localhost:5002/api/departments'),
            axios.get('http://localhost:5002/api/positions'),
            axios.get('http://localhost:5002/api/reason-requisition')
        ]);

        console.log("DEPARTMENTS:", JSON.stringify(responseList[0].data, null, 2));
        console.log("POSITIONS:", JSON.stringify(responseList[1].data, null, 2));
        console.log("REASONS:", JSON.stringify(responseList[2].data, null, 2));
    } catch (error) {
        console.error("API Call failed:", error.message);
    }
}

testApi();
