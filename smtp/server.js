const SMTPServer = require('smtp-server').SMTPServer;

const users = {
    'user': 'userpass',
    'admin': 'adminpass',
};

const adminPool = new Set(['admin@example.com', 'admin2@example.com'])

const server = new SMTPServer({
    logger: false,
    onAuth(auth, session, callback) {
        const isValidUser = users[auth.username] === auth.password;
        if (isValidUser) {
            console.log(`korisnik ${auth.username} uspesno autentikovan.`);
            callback(null, { user: auth.username });
        } else {
            console.log(`autentikacija neuspesna za korisnika ${auth.username}.`);
            callback(new Error('neuspela autentikacija'));
        }
        console.log(session)
    },

    onData(stream, session, callback) {
        let message = '';
        stream.on('data', (chunk) => {
            message += chunk.toString();
        });

        stream.on('end', () => {
            // Ako je admin, broadcastuj obavestenje svim ne-adminima
            if (adminPool.has(session.envelope.mailFrom.address)) {
                console.log(`admin broadcast inicijalizovan ${session.envelope.mailFrom.address}:`);
                console.log(`poruka za sve @example.com korisnike:\n ${message}`);
            }
            callback();
        });
    },
});

server.listen(25, '0.0.0.0', () => {
    console.log('SMTP server listening on port 25');
});