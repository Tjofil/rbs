const express = require('express');
const app = express();
const port = 5000;

const allowedDNS = ['domain1.com', 'subdomain.domain1.com'];
const allowedIP = ['127.0.0.2', '127.0.0.1']
const privilegedDNS = ['domain1.com']
// U pozadini bi se se domain1.com resolvovao u 127.0.0.2 a subdomain.domain1.com u 127.0.0.1

const authenticateRequest = (req, res, next) => {
    const hostHeader = req.get('Host');

    const forwardedFor = req.headers['x-forwarded-for'];

    const clientIP = forwardedFor ? forwardedFor.split(',')[0].replace('::ffff:', '') : req.connection.remoteAddress.replace('::ffff:', '');

    if (!hostHeader || !allowedDNS.includes(hostHeader)) {
        return res.status(403).send(`zabranjeno: Nepoznat DNS ${hostHeader}`);
    }

    if (!clientIP || !allowedIP.includes(clientIP)) {
        return res.status(403).send(`zabranjeno: Nepoznata IP adresa ${clientIP} `);
    }

    // Donesi odluku o daljoj autorizaciji zavisno od DNS-a, bez provere da li se dati DNS resolvuje bas u dati IP
    if (privilegedDNS.includes(hostHeader)) {
        req.privileged = true;
    } else {
        req.privileged = false;
    }

    next();
};

app.use(authenticateRequest);

app.get('/', (req, res) => {
    if (req.privileged) {
        res.send('dobar dan, privilegovani korisnice!');
    } else {
        res.send('dobar dan, NEprivilegovani korisnice!');
    }

});

app.listen(port, () => {
    console.log(`server trci na http://localhost:${port}`);
});

// curl -H "Host: domain1.com" localhost:5000
// curl -H "Host: subdomain.domain1.com" localhost:5000