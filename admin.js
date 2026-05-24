const SUPABASE_URL = "https://fflnpsiutikdywibbltj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WLoDWwjyE2FctbWEoYYSng_qOjZn4hX";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);

/* =====================================================
   PREVIEW REFRESH
===================================================== */
function refreshPreview() {
  const frame = $("previewFrame");
  if (frame) frame.src = "index.html?v=" + Date.now();
}

/* =====================================================
   FILE UPLOAD (GLOBAL SAFE)
===================================================== */
async function uploadFile(file) {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabaseClient.storage
    .from("kuya-dan-media")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error.message);
    alert("File upload failed");
    return null;
  }

  const { data } = supabaseClient.storage
    .from("kuya-dan-media")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =====================================================
   SETTINGS (LOAD OPTIONAL)
===================================================== */
async function loadSettings() {
  const { data, error } = await supabaseClient
    .from("website_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Settings load error:", error.message);
    return;
  }

  if (!data) return;

  if ($("heroTitle")) $("heroTitle").value = data.hero_title || "";
  if ($("heroDesc")) $("heroDesc").value = data.hero_description || "";
  if ($("aboutText")) $("aboutText").value = data.about_text || "";
  if ($("phone")) $("phone").value = data.phone || "";
  if ($("address")) $("address").value = data.address || "";
  if ($("facebook")) $("facebook").value = data.facebook || "";
  if ($("hours")) $("hours").value = data.opening_hours || "";
}

/* =====================================================
   HERO UPDATE
===================================================== */
async function updateHero() {
  const file = $("heroImage")?.files?.[0];
  const imageUrl = await uploadFile(file);

  const { error } = await supabaseClient
    .from("website_settings")
    .update({
      hero_title: $("heroTitle").value,
      hero_description: $("heroDesc").value,
      ...(imageUrl && { hero_image: imageUrl })
    })
    .eq("id", 1);

  if (error) {
    console.error(error.message);
    alert("Hero update failed");
    return;
  }

  refreshPreview();
}

/* =====================================================
   ABOUT UPDATE
===================================================== */
async function updateAbout() {
  const { error } = await supabaseClient
    .from("website_settings")
    .update({
      about_text: $("aboutText").value
    })
    .eq("id", 1);

  if (error) {
    console.error(error.message);
    alert("About update failed");
    return;
  }

  refreshPreview();
}

/* =====================================================
   CONTACT UPDATE
===================================================== */
async function updateContact() {
  const { error } = await supabaseClient
    .from("website_settings")
    .update({
      phone: $("phone").value,
      address: $("address").value,
      facebook: $("facebook").value,
      opening_hours: $("hours").value
    })
    .eq("id", 1);

  if (error) {
    console.error(error.message);
    alert("Contact update failed");
    return;
  }

  refreshPreview();
}

/* =====================================================
   MENU - ADD
===================================================== */
async function addMenu() {
  const name = $("menuName").value;
  const price = parseFloat($("menuPrice").value);
  const desc = $("menuDesc").value;
  const file = $("menuImage")?.files?.[0];

  if (!name || !price) {
    alert("Name and price required");
    return;
  }

  const imageUrl = await uploadFile(file);

  const { error } = await supabaseClient
    .from("menu_items")
    .insert([{
      name,
      price,
      description: desc,
      image_url: imageUrl
    }]);

  if (error) {
    console.error(error.message);
    alert("Menu add failed");
    return;
  }

  loadMenu();
  refreshPreview();
}

/* =====================================================
   MENU - LOAD
===================================================== */
async function loadMenu() {
  const { data, error } = await supabaseClient
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return;
  }

  const list = $("menuList");
  if (!list) return;

  list.innerHTML = "";

  data?.forEach(item => {
    list.innerHTML += `
      <div class="flex justify-between items-center bg-gray-100 p-2 rounded">
        <div>
          <p class="font-bold">${item.name}</p>
          <p>₱${item.price}</p>
        </div>

        <button onclick="deleteMenu(${item.id})"
          class="text-red-600 font-bold">X</button>
      </div>
    `;
  });
}

/* =====================================================
   MENU - DELETE
===================================================== */
async function deleteMenu(id) {
  const { error } = await supabaseClient
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error.message);
    return;
  }

  loadMenu();
  refreshPreview();
}

/* =====================================================
   GALLERY - UPLOAD
===================================================== */
async function uploadGallery() {
  const file = $("galleryImage")?.files?.[0];
  const url = await uploadFile(file);

  if (!url) return;

  const { error } = await supabaseClient
    .from("gallery")
    .insert([{ image_url: url }]);

  if (error) {
    console.error(error.message);
    alert("Gallery upload failed");
    return;
  }

  loadGallery();
  refreshPreview();
}

/* =====================================================
   GALLERY - LOAD
===================================================== */
async function loadGallery() {
  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return;
  }

  const grid = $("galleryList");
  if (!grid) return;

  grid.innerHTML = "";

  data?.forEach(img => {
    grid.innerHTML += `
      <div class="relative">
        <img src="${img.image_url}" class="h-20 w-full object-cover rounded"/>

        <button onclick="deleteGallery(${img.id})"
          class="absolute top-1 right-1 bg-red-600 text-white px-2 rounded">
          X
        </button>
      </div>
    `;
  });
}

/* =====================================================
   GALLERY - DELETE
===================================================== */
async function deleteGallery(id) {
  const { error } = await supabaseClient
    .from("gallery")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error.message);
    return;
  }

  loadGallery();
  refreshPreview();
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadMenu();
  loadGallery();
});
