/* =====================================================
   LaDolce Cafe CMS - FINAL ADMIN CONNECTOR
   CLEAN + FULL CONTROL VERSION
===================================================== */

const SUPABASE_URL = "https://fflnpsiutikdywibbltj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WLoDWwjyE2FctbWEoYYSng_qOjZn4hX";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* =====================================================
   UPLOAD FILE (GLOBAL)
===================================================== */
async function uploadFile(file) {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabaseClient.storage
    .from("kuya-dan-media")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error.message);
    alert("Upload failed");
    return null;
  }

  const { data } = supabaseClient.storage
    .from("kuya-dan-media")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =====================================================
   WEBSITE SETTINGS (SINGLE ROW ID = 1)
===================================================== */
async function getSettings() {
  const { data } = await supabaseClient
    .from("website_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return data;
}

async function updateSettings(payload) {
  const { error } = await supabaseClient
    .from("website_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    console.error(error.message);
    alert("Settings update failed");
    return false;
  }

  return true;
}

/* =====================================================
   HERO
===================================================== */
async function updateHero(title, desc, imageFile) {
  let imageUrl = null;

  if (imageFile) {
    imageUrl = await uploadFile(imageFile);
  }

  return await updateSettings({
    hero_title: title,
    hero_description: desc,
    ...(imageUrl && { hero_image: imageUrl })
  });
}

/* =====================================================
   ABOUT
===================================================== */
async function updateAbout(text) {
  return await updateSettings({
    about_text: text
  });
}

/* =====================================================
   CONTACT
===================================================== */
async function updateContact(phone, address, facebook) {
  return await updateSettings({
    phone,
    address,
    facebook
  });
}

/* =====================================================
   MENU CRUD
===================================================== */
async function addMenu(item) {
  const { error } = await supabaseClient
    .from("menu_items")
    .insert([item]);

  if (error) {
    console.error(error.message);
    alert("Menu add failed");
    return false;
  }

  return true;
}

async function deleteMenu(id) {
  const { error } = await supabaseClient
    .from("menu_items")
    .delete()
    .eq("id", id);

  return !error;
}

async function getMenu() {
  const { data } = await supabaseClient
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

/* =====================================================
   GALLERY CRUD
===================================================== */
async function addGallery(url) {
  const { error } = await supabaseClient
    .from("gallery")
    .insert([{ image_url: url }]);

  return !error;
}

async function deleteGallery(id) {
  const { error } = await supabaseClient
    .from("gallery")
    .delete()
    .eq("id", id);

  return !error;
}

async function getGallery() {
  const { data } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}
