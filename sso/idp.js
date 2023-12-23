const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const idpApp = express();
const idpPort = 3001;
const users = {
    'user': 'userpass',
    'admin': 'adminpass',
};

const roles = {
    'user': 'userRole',
    'admin': 'adminRole'
}

idpApp.use(express.json());

function sleep(ms) {
    var start = new Date().getTime(), expire = start + ms;
    while (new Date().getTime() < expire) { }
    return;
}

idpApp.post('/sso', async (req, res) => {
    console.log('/sso');
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    const userId = req.body.userId;
    const callback = req.body.callback;
    if (username && password && userId && callback) {
        const isValidUser = users[username] === password;
        if (isValidUser) {
            try {
                const token = uuidv4().replace(/-/g, '');
                sleep(20000);
                const response = await axios.post(callback, {
                    userId: userId,
                    token: token,
                    role: roles[username]
                })
                res.status(200).json({ token: response.data.token });
            } catch (error) {
                console.error('Error updating SP:', error.message);
                res.status(403).json({ error: 'Not valid user' });
            }
        } else {
            res.status(403).json({ error: 'Not valid user' });
        }
    }
});

idpApp.listen(idpPort, () => {
    console.log(`IDP Server is running on http://localhost:${idpPort}`);
});
