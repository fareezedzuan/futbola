// view-teams.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  'https://kdbqroxhypnadolcxxxc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYnFyb3hoeXBuYWRvbGN4eHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjkwNzYsImV4cCI6MjA1NzMwNTA3Nn0.c7_RVxoFdJNqQ62R3t1emH2Wf4dSsQaunHsHmbQxOBA'
);

document.addEventListener("DOMContentLoaded", async () => {
  const teamList = document.getElementById("teamList");

  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, logo_url, location, match_day, level")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading teams:", error.message);
    teamList.innerHTML = "<p>Failed to load teams.</p>";
    return;
  }

  if (teams.length === 0) {
    teamList.innerHTML = "<p>No public teams available yet.</p>";
    return;
  }

teamList.innerHTML = teams.map(team => `
  <div class="flex bg-white rounded-lg shadow-md border-t-4 border-red-500 p-4 items-center space-x-4">
    <img src="${team.logo_url || './images/default-team.png'}" alt="logo" class="w-16 h-16 rounded-full object-cover border" />
    <div class="flex-1">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-black">${team.name}</h3>
        <a href="/team-dashboard.html?id=${team.id}" class="text-sm text-blue-600 font-semibold hover:underline">View Profile</a>
      </div>
      <p class="text-sm text-gray-600">Level: ${team.level || "Social"}</p>
      <p class="text-sm text-gray-600">Location: ${team.location || "Unknown"}</p>
      <p class="text-sm text-gray-600">Match Days: ${(team.match_day || []).join(', ') || "Not set"}</p>
    </div>
  </div>
`).join("");

});
