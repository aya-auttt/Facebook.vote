require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('Envoi email vers:', process.env.EMAIL_USER);

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Test connexion',
  text: 'Mot de passe: test1234'
}, (err, info) => {
  if (err) {
    console.log('ERREUR:', err.message);
  } else {
    console.log('SUCCES! Email envoye');
  }
  process.exit(0);
});