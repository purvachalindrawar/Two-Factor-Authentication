require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 
let generated2FACode = ""; 
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to send 2FA code
app.post('/send2FA', async (req, res) => {
    const { email } = req.body; 
    // Generating new random code
    generated2FACode = Math.floor(100000 + Math.random() * 900000).toString(); 
    try {
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: email, 
          subject:'Your 2FA Code',
          text:`Your 2FA code is ${generated2FACode}`,
      });

      console.log(`Message sent to ${email}`);
      res.json({ message:'2FA code sent successfully!', code : generated2FACode }); // Send back confirmation with generated code
   } catch (error) {
       console.error('Error sending email:', error);
       res.status(500).json({ error:`Failed to send email due to ${error.message}` });
   }
});

// verify the entered code
app.post('/verify2FA', (req, res) => {
   const { code } = req.body; 

   if (code === generated2FACode) { 
       generated2FACode = ""; 
       return res.json({ success:true });
   } else {
       return res.status(400).json({ success:false, message:'Invalid or expired code' });
   }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));