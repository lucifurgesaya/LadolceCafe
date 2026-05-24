/* =========================================
   LaDolce Cafe - SUPABASE CMS CONNECTOR
========================================= */

const SUPABASE_URL = "https://fflnpsiutikdywibbltj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WLoDWwjyE2FctbWEoYYSng_qOjZn4hX";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* =========================================
   FILE UPLOAD (SAFE + REUSABLE)
========================================= */
async function uploadFile(file, folder = "kuya-dan-media") {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabaseClient.storage
    .from(folder)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    console.error("Upload Error:", error.message);
    alert("Upload failed!");
    return null;
  }

  const { data } = supabaseClient.storage
    .from(folder)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =========================================
   WEBSITE SETTINGS (CORE CMS)
========================================= */

// GET SETTINGS
async function getSettings() {
  const { data, error } = await supabaseClient
    .from("website_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Settings error:", error.message);
    return null;
  }

  return data;
}

// UPDATE SETTINGS (GENERIC)
async function updateSettings(payload) {
  const { error } = await supabaseClient
    .from("website_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    console.error("Update error:", error.message);
    alert("Update failed!");
    return false;
  }

  return true;
}

/* =========================================
   HERO SECTION
========================================= */
async function updateHero(title, desc, imageUrl = null) {
  const payload = {
    hero_title: title || "",
    hero_description: desc || ""
  };

  if (imageUrl) {
    payload.hero_image = imageUrl;
  }

  return await updateSettings(payload);
}

/* =========================================
   CONTACT SECTION
========================================= */
async function updateContact(phone, address, facebook) {
  return await updateSettings({
    phone,
    address,
    facebook
  });
}

/* =========================================
   ABOUT SECTION
========================================= */
async function updateAbout(text) {
  return await updateSettings({
    about_text: text
  });
}

/* =========================================
   MENU SYSTEM
========================================= */

// ADD MENU ITEM
async function addMenuItem(item) {
  const { error } = await supabaseClient
    .from("menu_items")
    .insert([item]);

  if (error) {
    console.error("Menu error:", error.message);
    alert("Failed to add menu item");
    return false;
  }

  return true;
}

// GET MENU ITEMS
async function getMenuItems() {
  const { data, error } = await supabaseClient
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Menu fetch error:", error.message);
    return [];
  }

  return data;
}

// DELETE MENU ITEM (IMPORTANT)
async function deleteMenuItem(id) {
  const { error } = await supabaseClient
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed");
    return false;
  }

  return true;
}

/* =========================================
   GALLERY SYSTEM
========================================= */

// ADD IMAGE
async function addGalleryImage(url) {
  const { error } = await supabaseClient
    .from("gallery")
    .insert([{ image_url: url }]);

  if (error) {
    console.error("Gallery error:", error.message);
    alert("Failed to upload image");
    return false;
  }

  return true;
}

// GET IMAGES
async function getGallery() {
  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gallery fetch error:", error.message);
    return [];
  }

  return data;
}

// DELETE IMAGE (IMPORTANT)
async function deleteGalleryImage(id) {
  const { error } = await supabaseClient
    .from("gallery")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed");
    return false;
  }

  return true;
}

/* =========================================
   QUICK HELPERS (OPTIONAL USE)
========================================= */

// HERO UPDATE WRAPPER
async function saveHeroFromUI() {
  const title = document.getElementById("heroTitle")?.value;
  const desc = document.getElementById("heroDesc")?.value;
  const file = document.getElementById("heroImage")?.files?.[0];

  let img = null;
  if (file) img = await uploadFile(file);

  await updateHero(title, desc, img);
}

// CONTACT WRAPPER
async function saveContactFromUI() {
  await updateContact(
    phone.value,
    address.value,
    facebook.value
  );
}
