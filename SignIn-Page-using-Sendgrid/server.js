require('dotenv').config();
const express = require('express');
const sgMail = require('@sendgrid/mail');
const app = express();
const port = 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let generated2FACode = ""; 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/send2FA', (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Generating a random code
    generated2FACode = Math.floor(100000 + Math.random() * 900000).toString();

    const msg = {
        to: email,
        from: process.env.FROM_EMAIL,
        subject: 'Your 2FA Code',
        text: `Your 2FA code is: ${generated2FACode}`,
        html: `<strong>Your 2FA code is:</strong> ${generated2FACode}`,
    };

    sgMail.send(msg)
      .then(() => {
          console.log('2FA Code sent successfully!');
          res.json({ message: '2FA code sent successfully', code: generated2FACode });
      })
      .catch((error) => {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Error sending 2FA code' });
      });
});

app.post('/verify2FA', (req, res) => {
    const { enteredCode } = req.body;

    if (!enteredCode) {
        return res.status(400).json({ message: '2FA code is required.' });
    }

    if (enteredCode === generated2FACode) {
        
        generated2FACode = ""; 
        return res.json({ message: '2FA verified successfully.' });
    } else {
        return res.status(400).json({ message: 'Invalid 2FA code. Please try again.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});