// ============================================================
// script.js - Instagram-style login client-side
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // DOM elements
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const loginBtn = document.getElementById('loginBtn');
  const togglePassword = document.querySelector('.toggle-password');

  // Real-time validation
  emailInput.addEventListener('input', () => {
    validateEmail(emailInput.value);
    checkFormValidity();
  });

  passwordInput.addEventListener('input', () => {
    validatePassword(passwordInput.value);
    checkFormValidity();
  });

  emailInput.addEventListener('focus', () => {
    emailInput.classList.remove('error', 'success');
    emailError.textContent = '';
  });

  passwordInput.addEventListener('focus', () => {
    passwordInput.classList.remove('error', 'success');
    passwordError.textContent = '';
  });

  // Validation: email/username
  function validateEmail(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      emailInput.classList.add('error');
      emailInput.classList.remove('success');
      emailError.textContent = 'Veuillez entrer un email ou nom d\'utilisateur';
      return false;
    }

    if (trimmed.length < 3) {
      emailInput.classList.add('error');
      emailInput.classList.remove('success');
      emailError.textContent = 'Minimum 3 caractères';
      return false;
    }

    emailInput.classList.remove('error');
    emailInput.classList.add('success');
    emailError.textContent = '';
    return true;
  }

  // Validate: password
  function validatePassword(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      passwordInput.classList.add('error');
      passwordInput.classList.remove('success');
      passwordError.textContent = 'Veuillez entrer un mot de passe';
      return false;
    }

    if (trimmed.length < 4) {
      passwordInput.classList.add('error');
      passwordInput.classList.remove('success');
      passwordError.textContent = 'Minimum 4 caractères';
      return false;
    }

    passwordInput.classList.remove('error');
    passwordInput.classList.add('success');
    passwordError.textContent = '';
    return true;
  }

  // Enable/disable submit button
  function checkFormValidity() {
    const emailOk = emailInput.value.trim().length >= 3;
    const passOk = passwordInput.value.trim().length >= 4;
    loginBtn.disabled = !(emailOk && passOk);
  }

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.innerHTML = isPassword
      ? '<i class="fa-regular fa-eye-slash" aria-hidden="true"></i>'
      : '<i class="fa-regular fa-eye" aria-hidden="true"></i>';
    togglePassword.setAttribute('aria-label',
      isPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
    );
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(emailInput.value);
    const isPasswordValid = validatePassword(passwordInput.value);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    loginBtn.disabled = true;
    loginBtn.classList.add('loading');

    try {
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: emailInput.value.trim(),
          password: passwordInput.value.trim()
        })
      });

      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
    } catch (error) {
      console.error('Erreur:', error);
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
    } finally {
      setTimeout(() => {
        loginBtn.disabled = false;
        loginBtn.classList.remove('loading');
        loginBtn.textContent = 'Se connecter';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
        emailInput.value = '';
        passwordInput.value = '';
      }, 5000);
    }
  });
});