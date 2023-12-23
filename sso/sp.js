const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const port = 3000;
const idpUrl = 'http://localhost:3001';
const fixedCallback = `http://localhost:${port}/callback`;

const usersMap = {};
const awaitingResponse = new Set();

app.get('/get-token', async (req, res) => {
    try {
        console.log('/get-token');
        console.log(req.query);
        const username = req.query.username;
        const password = req.query.password;
        if (username) {
            if (!usersMap[username]) {
                if (!password) {
                    res.status(403).json({ error: 'Fali lozinka.' });
                } else {
                    const userId = uuidv4().replace(/-/g, '');
                    awaitingResponse.add(userId);
                    const response = await axios.post(`${idpUrl}/sso`, {
                        username: username,
                        password: password,
                        userId: userId,
                        callback: fixedCallback
                    });
                    console.log('/get-token/response.data');
                    console.log(response.data);
                    res.status(200).json({ userId: userId, token: response.data.token });
                }
            } else {
                res.json({ message: 'Already logged in' });
            }
        } else {
            res.status(403).json({ error: 'Fali korisnicko ime.' });
        }
    } catch (error) {
        console.error('Error fetching token from IDP:', error.message);
        res.status(403).json({ error: 'Invalid login' });
    }
});


app.post('/callback', (req, res) => {
    console.log('/callback');
    console.log(req.body);
    const userId = req.body.userId;
    const token = req.body.token;
    const role = req.body.role;
    if (userId) {
        if (usersMap[userId]) {
            res.json({ token: usersMap[userId].token });
        } else if (awaitingResponse.has(userId)) {
            if (token && role) {
                usersMap[userId] = { token: token, role: role };
                awaitingResponse.add(userId);
                res.json({ token: token });
            } else {
                res.status(400).json({ error: 'Invalid parameters.' });
            }
        } else {
            res.status(404).json({ error: 'User not found.' });
        }
    } else {
        res.status(404).json({ error: 'User not found.' });
    }
});

app.post('/admin-resource', (req, res) => {
    const token = req.body.token;
    const userId = req.body.userId;
    if (usersMap[userId] && usersMap[userId].token == token && usersMap[userId].role == 'admin') {
        res.json({ message: 'Successful' });
    } else {
        res.status(403).json({ message: 'Failed' });
    }
});

app.post('/user-resource', (req, res) => {
    const token = req.body.token;
    const userId = req.body.userId;
    if (usersMap[userId] && usersMap[userId].token == token) {
        res.json({ message: 'Successful' });
    } else {
        res.status(403).json({ message: 'Failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// curl "http://localhost:3000/get-token?username=user&password=userpass"
// curl -X POST -H "Content-Type: application/json" -d '{"userId": "326364238eda4685b0b9051e6b574265", "role": "admin", "token": "7d95f01c7a3a4485ae51ead0f00be81b"}' http://localhost:3000/callback
// curl -X POST -H "Content-Type: application/json" -d '{"userId": "326364238eda4685b0b9051e6b574265", "token": "7d95f01c7a3a4485ae51ead0f00be81b"}' http://localhost:3000/user-resource
// curl -X POST -H "Content-Type: application/json" -d '{"userId": "326364238eda4685b0b9051e6b574265", "token": "7d95f01c7a3a4485ae51ead0f00be81b"}' http://localhost:3000/admin-resource