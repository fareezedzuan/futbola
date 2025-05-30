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
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center space-x-4">
        <img src="${team.logo_url || './images/default-team.png'}" alt="logo" class="w-14 h-14 rounded-full object-cover border">
        <div>
          <h3 class="text-xl font-bold text-black">${team.name}</h3>
          <p class="text-sm text-gray-600">${team.location || "Location unknown"} — ${team.level || "Social"}</p>
          <p class="text-sm text-gray-500 mt-1">${team.match_day?.join(", ") || "No preferred days set"}</p>
        </div>
      </div>
      <a href="/team-dashboard.html?id=${team.id}" class="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View</a>
    </div>
  `).join("");
});
