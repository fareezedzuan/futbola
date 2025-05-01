import { supabase } from './supabaseClient.js';

// Google login
document.getElementById("google-login").addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) {
    alert("Google login failed: " + error.message);
  }
});

// Email login
document.getElementById("email-login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Login failed: " + error.message);
  } else {
    window.location.href = "/profile-setup.html";
  }
});

// Inline sign-up
document.getElementById("signup-link")?.addEventListener("click", async () => {
  const email = prompt("Enter your email:");
  const password = prompt("Create a password (min 6 characters):");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("Signup failed: " + error.message);
  } else {
    alert("Check your email to confirm your account.");
  }
});
