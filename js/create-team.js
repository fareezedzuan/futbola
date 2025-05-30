// create-team.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  'https://kdbqroxhypnadolcxxxc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYnFyb3hoeXBuYWRvbGN4eHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjkwNzYsImV4cCI6MjA1NzMwNTA3Nn0.c7_RVxoFdJNqQ62R3t1emH2Wf4dSsQaunHsHmbQxOBA'
);

const form = document.getElementById("createTeamForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const teamName = document.getElementById("teamName").value.trim();
  const logoUrl = document.getElementById("logoUrl").value.trim();
  const bio = document.getElementById("bio").value.trim();
  const level = document.getElementById("level").value;

  const user = await supabase.auth.getUser();
  const userId = user?.data?.user?.id;
  if (!userId) {
    message.textContent = "You must be logged in to create a team.";
    return;
  }

  const { data: team, error: teamError } = await supabase.from("teams").insert([
    {
      name: teamName,
      logo_url: logoUrl || null,
      bio,
      level,
      created_by: userId
    }
  ]).select().single();

  if (teamError) {
    console.error(teamError);
    message.textContent = "Error creating team: " + teamError.message;
    return;
  }

  const { error: memberError } = await supabase.from("team_members").insert([
    {
      team_id: team.id,
      user_id: userId,
      role: "captain",
      status: "active"
    }
  ]);

  if (memberError) {
    console.error(memberError);
    message.textContent = "Team created, but failed to assign captain.";
  } else {
    message.textContent = "Team successfully created! Redirecting...";
    setTimeout(() => window.location.href = `team-dashboard.html?id=${team.id}`, 1500);
  }
});
