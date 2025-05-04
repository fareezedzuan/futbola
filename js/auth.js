import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://kdbqroxhypnadolcxxxc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYnFyb3hoeXBuYWRvbGN4eHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjkwNzYsImV4cCI6MjA1NzMwNTA3Nn0.c7_RVxoFdJNqQ62R3t1emH2Wf4dSsQaunHsHmbQxOBA',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);

// 🔐 Google login
document.getElementById("google-login").addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://www.futbola.my/profile-setup.html' // ✅ Updated to custom domain
    }
  });
  if (error) {
    alert("Google login failed: " + error.message);
  }
});

// 📧 Email login
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

// 🆕 Inline sign-up
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

// 🛡️ Session check (runs on page load)
supabase.auth.getUser().then(async ({ data: { user }, error }) => {
  if (error) {
    console.error("Auth check error:", error.message);
    return;
  }

  if (user) {
    console.log("✅ Logged in as:", user.email);

    // Avoid redirect loop if already on profile page
    if (!window.location.pathname.includes("profile-setup.html")) {
      window.location.href = "/profile-setup.html";
    }
  } else {
    console.log("❌ Not logged in");
  }
});
