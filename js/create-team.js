// create-team.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  'https://kdbqroxhypnadolcxxxc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYnFyb3hoeXBuYWRvbGN4eHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjkwNzYsImV4cCI6MjA1NzMwNTA3Nn0.c7_RVxoFdJNqQ62R3t1emH2Wf4dSsQaunHsHmbQxOBA'
);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createTeamForm");
  const logoInput = document.getElementById("logoUpload");
  const logoPreview = document.getElementById("logoPreview");

console.log("Logo upload listener active");

logoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  console.log("Selected file:", file);
  if (file) {
    logoPreview.src = URL.createObjectURL(file);
  }
});

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const teamName = document.getElementById("teamName").value.trim();
    const info = document.getElementById("info").value.trim();
    const level = document.getElementById("level").value;
    const file = logoInput.files[0];

    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) {
      alert("You must be logged in to create a team.");
      return;
    }

    let logoUrl = "";
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `team-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        alert("Failed to upload logo.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      logoUrl = publicUrlData?.publicUrl || "";
    }

    const { data: team, error: teamError } = await supabase.from("teams").insert([
      {
        name: teamName,
        logo_url: logoUrl || null,
        bio: info,
        level,
        created_by: userId
      }
    ]).select().single();

    if (teamError) {
      console.error(teamError);
      alert("Error creating team: " + teamError.message);
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
      alert("Team created, but failed to assign captain.");
    } else {
      alert("Team successfully created!");
      window.location.href = `team-dashboard.html?id=${team.id}`;
    }
  });
});
