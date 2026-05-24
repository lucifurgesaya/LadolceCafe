/* ================================
   LaDolce Cafe - SUPABASE CONNECTOR
================================== */

const SUPABASE_URL = "https://qvcipcwgzjttqvffdeye.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LoD9J_ZNZWw5nTMOCmExjw_NgfvOvo6";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* ================================
   FILE UPLOAD (GLOBAL FUNCTION)
================================== */
async function uploadFile(file, folder = "kuya-dan-media") {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabaseClient
    .storage
    .from(folder)
    .upload(fileName, file);

  if (error) {
    console.error("Upload Error:", error.message);
    alert("File upload failed!");
    return null;
  }

  const { data } = supabaseClient
    .storage
    .from(folder)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* ================================
   WEBSITE SETTINGS (GLOBAL LOAD)
================================== */
async function getSettings() {
  const { data, error } = await supabaseClient
    .from("website_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Settings Error:", error.message);
    return null;
  }

  return data;
}

/* ================================
   UPDATE SETTINGS (GENERIC)
================================== */
async function updateSettings(payload) {
  const { error } = await supabaseClient
    .from("website_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    console.error("Update Error:", error.message);
    alert("Update failed!");
    return false;
  }

  return true;
}

/* ================================
   MENU FUNCTIONS
================================== */
async function addMenuItem(item) {
  const { error } = await supabaseClient
    .from("menu_items")
    .insert([item]);

  if (error) {
    console.error(error.message);
    alert("Failed to add menu item");
    return false;
  }

  return true;
}

async function getMenuItems() {
  const { data, error } = await supabaseClient
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return data;
}

/* ================================
   GALLERY FUNCTIONS
================================== */
async function addGalleryImage(url) {
  const { error } = await supabaseClient
    .from("gallery")
    .insert([{ image_url: url }]);

  if (error) {
    console.error(error.message);
    alert("Failed to upload image");
    return false;
  }

  return true;
}

async function getGallery() {
  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return data;
}

/* ================================
   HERO UPDATE HELPERS
================================== */
async function updateHero(title, desc, imageUrl) {
  const payload = {
    hero_title: title,
    hero_description: desc
  };

  if (imageUrl) {
    payload.hero_image = imageUrl;
  }

  return await updateSettings(payload);
}

/* ================================
   CONTACT UPDATE HELPERS
================================== */
async function updateContact(phone, address, facebook) {
  return await updateSettings({
    phone,
    address,
    facebook
  });
}
