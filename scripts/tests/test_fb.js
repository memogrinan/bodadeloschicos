const https = require('https');

const data = JSON.stringify({
    gamerTag: "Mermino",
    realName: "Memo Grinán",
    partyId: "chicos",
    scores: {
        dino: 100,
        maddie: 10,
        puebla: 100,
        chica: 200
    },
    chiCoins: {
        dino: 1000,
        maddie: 1000,
        puebla: 1000,
        chica: 1000
    },
    bonusCoins: 0,
    totalChiCoins: 4000,
    totalScore: 410,
    timePlayedSeconds: 0,
    lastUpdated: { ".sv": "timestamp" }
});

const options = {
    hostname: 'boda-los-chicos-default-rtdb.firebaseio.com',
    port: 443,
    path: '/players/Mermino.json',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
