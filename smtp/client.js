const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    tls: { rejectUnauthorized: false },
    auth: {
        user: 'user',
        pass: 'userpass',
    }
});

const mailOptions = {
    from: 'admin@example.com',
    to: 'recipient@example.com',
    subject: 'Test Email',
    text: 'Zdravo svete!',
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error(error);
    } else {
        console.log('mail poslat: ' + info.response);
    }
});