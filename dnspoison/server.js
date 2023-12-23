const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;

const dnsUri = 'http://localhost:5001'

const resolveHost = async (hostname) => {
    const response = await axios.get(`${dnsUri}/resolve/${hostname}`);
    const { ip } = response.data;
    return ip
}

const authenticateRequest = async (req, res, next) => {
    const hostHeader = req.get('Host');

    const forwardedFor = req.headers['x-forwarded-for'];

    const clientIP = forwardedFor ? forwardedFor.split(',')[0].replace('::ffff:', '') : req.connection.remoteAddress.replace('::ffff:', '');

    const resolvedHost = await resolveHost(hostHeader);

    if (resolvedHost !== clientIP) {
        return res.status(403).send(`zabranjeno: Host ${hostHeader} se ne razresava u ${clientIP}`);
    }

    next();
};


app.get('/', authenticateRequest, (req, res) => {
    res.send('dobar dan, autentikovani korisnice!');
});

app.listen(port, () => {
    console.log(`server trci na http://localhost:${port}`);
});

// curl - H "Host: example.com" localhost: 5000