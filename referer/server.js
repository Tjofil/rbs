const express = require('express');
const app = express();
const port = 5000;


allowedReferes = ['definetlyYourReferer.com', 'freeReferer100percentLegit.rs']

const authenticateRequest = (req, res, next) => {
    const refererHeader = req.get('Referer');

    if (!refererHeader || !allowedReferes.includes(refererHeader)) {
        return res.status(403).send(`zabranjeno: Nepoznat Referer ${refererHeader}`);
    }

    next();
};

app.use(authenticateRequest);

app.get('/', (req, res) => {
    res.send('dobar dan, autentikovani korisnice!');

});

app.listen(port, () => {
    console.log(`server trci na http://localhost:${port}`);
});

// curl -H "Referer: example.com" localhost:5000
// curl -H "Referer: definetlyYourReferer.com" localhost:5000