// player-profile.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://kdbqroxhypnadolcxxxc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYnFyb3hoeXBuYWRvbGN4eHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjkwNzYsImV4cCI6MjA1NzMwNTA3Nn0.c7_RVxoFdJNqQ62R3t1emH2Wf4dSsQaunHsHmbQxOBA'
);

(async () => {
  const user = await getUser();
  if (!user) {
    alert("Not logged in");
    window.location.href = "/login.html";
    return;
  }

  const profile = await loadProfile(user.id);
  if (!profile) return;

  populateFields(profile);
  setupEditToggle(profile);
  setupAvatarUpload(user.id);
})();

function getUser() {
  return supabase.auth.getUser().then(({ data }) => data?.user ?? null);
}

async function loadProfile(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) {
    alert("Failed to load profile");
    console.error(error);
    return null;
  }
  return data;
}

function populateFields(profile) {
  const vis = profile.privacy_settings || {};
  const isOwnProfile = window.location.pathname.includes("player-profile.html");

  const show = (field, value) => {
  const el = document.getElementById(field + "View");
  if (!el) return;

  const setting = vis[field];
  const icon = document.getElementById("icon_" + field);

  if (isOwnProfile || setting === "public" || !setting) {
    el.textContent = value ?? "-";
    if (icon) {
      if (setting === "private") {
        icon.textContent = "🔒";
        icon.title = "Private";
      } else {
        icon.textContent = "👁️";
        icon.title = "Public";
      }
    }

  } else if (field === "dob" && setting === "range") {
    const age = getAgeFromDOB(value);
    el.textContent = age ? getAgeRange(age) : "-";
    if (icon) {
      icon.textContent = "👁️";
      icon.title = "Age Range";
    }

  } else {
    el.textContent = "-";
    if (icon) {
      icon.textContent = "🔒";
      icon.title = "Private";
    }
  }
};


  show("fullName", profile.full_name);
  show("phone", profile.phone);
  show("dob", profile.date_of_birth);
  show("gender", profile.gender);
  show("location", profile.location_play?.join(', '));
  show("skill", profile.skill_level);
  show("team", profile.team_name);
  show("availability", profile.availability?.join(', '));

  document.getElementById("jerseyFull").textContent = `${profile.jersey_name ?? ''} ${profile.jersey_number ?? ''}`.trim();
  document.getElementById("bio").textContent = profile.bio ?? '-';

  if (profile.avatar_url) {
    document.getElementById("avatar").src = profile.avatar_url;
  }

  document.querySelectorAll('.field-view').forEach(el => el.style.display = 'block');

  for (const key in vis) {
    const select = document.getElementById("visibility_" + key);
    if (select) {
      select.value = vis[key];
    }
  }

}

function setupEditToggle(profile) {
  const toggleBtn = document.getElementById("toggleMode");
  let isEdit = false;

  toggleBtn.addEventListener("click", async () => {
    isEdit = !isEdit;
    toggleBtn.innerHTML = isEdit ? '<i class="fas fa-circle-check"></i>' : '<i class="fas fa-pen-to-square"></i>';
    toggleBtn.classList.toggle('save-mode', isEdit);

    const fields = ["fullName", "phone", "dob", "gender", "location", "skill", "team", "availability", "jerseyName", "jerseyNumber", "bio"];
    const updated = { ...profile };

    for (const id of fields) {
      const view = document.getElementById(id + "View");
      const edit = document.getElementById(id + "Edit");
      const vis = document.getElementById("visibility_" + id);
      if (isEdit) {
        if (edit) {
          const val = getProfileValue(profile, id);
          edit.value = Array.isArray(val) ? val.join(', ') : val ?? "";
          view?.style.setProperty("display", "none");
          edit.style.display = "block";
        }

      if (id === 'availability') {
        const container = document.getElementById("availabilityEditContainer");
        if (container) {
          container.style.display = "block";
          const checkboxes = container.querySelectorAll("input[type=checkbox]");
          checkboxes.forEach(cb => {
            cb.checked = (profile.availability || []).includes(cb.value);
          });
        }
      }

        if (vis) vis.style.display = "inline-block";
      } else {
        const value = edit?.value.trim() ?? "";
        if (edit) edit.style.display = "none";

        if (id === 'availability') {
          const container = document.getElementById("availabilityEditContainer");
          const checked = Array.from(container.querySelectorAll("input[type=checkbox]"))
            .filter(cb => cb.checked)
            .map(cb => cb.value);
          updated.availability = checked;
          container.style.display = "none";
        }

        if (vis) vis.style.display = "none";
        if (view) {
          view.textContent = value || "-";
          view.style.display = "block";
        }
        assignUpdate(updated, id, value);
      }
    }

    if (!isEdit && Object.keys(updated).length > 0) {
      updated.privacy_settings = {
        ...profile.privacy_settings,
        ...getVisibilitySettings()
      };
      const { error } = await supabase.from('profiles').update(updated).eq('id', profile.id);
      if (error) return alert("Save failed");
      Object.assign(profile, updated);
      document.getElementById("jerseyFull").textContent = `${profile.jersey_name ?? ''} ${profile.jersey_number ?? ''}`.trim();
      document.getElementById("bio").textContent = profile.bio ?? '-';
    }
  });
}

function getProfileValue(profile, id) {
  const map = {
    fullName: "full_name",
    phone: "phone",
    dob: "date_of_birth",
    gender: "gender",
    location: "location_play",
    skill: "skill_level",
    team: "team_name",
    availability: "availability",
    jerseyName: "jersey_name",
    jerseyNumber: "jersey_number",
    bio: "bio"
  };
  return profile[map[id]];
}

function assignUpdate(updated, id, value) {
  const map = {
    fullName: "full_name",
    phone: "phone",
    dob: "date_of_birth",
    gender: "gender",
    location: "location_play",
    skill: "skill_level",
    team: "team_name",
    availability: "availability",
    jerseyName: "jersey_name",
    jerseyNumber: "jersey_number",
    bio: "bio"
  };
    if (id === 'availability') {
      const container = document.getElementById("availabilityEditContainer");
      const checked = Array.from(container.querySelectorAll("input[type=checkbox]"))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      updated[map[id]] = checked;
    } else {
      updated[map[id]] = value || null;
    }

}

function getVisibilitySettings() {
  const keys = ["fullName", "phone", "dob", "gender", "location", "skill", "team", "availability"];
  const result = {};
  for (const key of keys) {
    const sel = document.getElementById("visibility_" + key);
    if (sel) result[key] = sel.value;
  }
  return result;
}

function getAgeFromDOB(dobStr) {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function getAgeRange(age) {
  if (age < 20) return "<20";
  const base = Math.floor(age / 5) * 5;
  return `${base}-${base + 4}`;
}

function setupAvatarUpload(userId) {
  const avatarInput = document.getElementById("avatarUpload");
  const avatarImg = document.getElementById("avatar");
  avatarInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop();
    const path = `${userId}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) return alert("Upload failed");
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl + '?t=' + Date.now();
    avatarImg.src = url;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  });
}
