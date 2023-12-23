const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

cachedResolves = { 'example.com': '127.0.0.1' }

app.use(bodyParser.json());

app.put('/register/:host', (req, res) => {
    const { ip } = req.body;
    cachedResolves[req.params.host] = ip
    console.log(`postavljen ${rq.params.host} -> ${ip}`);
    res.status(200).json({ message: 'registrovanje uspesno' });
});

app.get('/resolve/:host', (req, res) => {
    const responseData = { ip: cachedResolves[req.params.host] };
    res.status(200).json(responseData);
});

app.listen(PORT, () => {
    console.log(`dns server trci na http://localhost:${PORT}`);
});

