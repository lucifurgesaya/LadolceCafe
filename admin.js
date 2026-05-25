/* =====================================================
   LADOLCE CAFE CMS - FINAL FIXED ADMIN.JS
   FULL SAFE VERSION
===================================================== */

/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
"https://fflnpsiutikdywibbltj.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_WLoDWwjyE2FctbWEoYYSng_qOjZn4hX";

const supabaseClient =
supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* =====================================================
   HELPERS
===================================================== */

function $(id){

  return document.getElementById(id);

}

function setValue(id,value){

  const el = $(id);

  if(el){

    el.value = value || "";

  }

}

/* =====================================================
   REFRESH PREVIEW
===================================================== */

function refreshPreview(){

  const frame =
  $("previewFrame");

  if(frame){

    frame.src =
    "index.html?v=" + Date.now();

  }

}

/* =====================================================
   IMAGE PREVIEW
===================================================== */

function previewImage(inputId, previewId){

  const input =
  $(inputId);

  const preview =
  $(previewId);

  const file =
  input?.files[0];

  if(!file || !preview) return;

  preview.src =
  URL.createObjectURL(file);

}

/* =====================================================
   UPLOAD FILE
===================================================== */

async function uploadFile(file){

  if(!file) return null;

  const fileName =
  `${Date.now()}-${file.name}`;

  const { error } =
  await supabaseClient.storage
  .from("cafe")
  .upload(fileName,file);

  if(error){

    console.error("UPLOAD ERROR:",error);

    alert(error.message);

    return null;

  }

  const { data } =
  supabaseClient.storage
  .from("cafe")
  .getPublicUrl(fileName);

  console.log("PUBLIC URL:",data.publicUrl);

  return data.publicUrl;

}

/* =====================================================
   LOAD WEBSITE SETTINGS
===================================================== */

async function loadWebsiteSettings(){

  const { data, error } =
  await supabaseClient
  .from("website_settings")
  .select("*")
  .eq("id",1)
  .single();

  if(error){

    console.error(error);

    return;

  }

  /* HERO */
  setValue(
    "heroTitle",
    data.hero_title
  );

  setValue(
    "heroDesc",
    data.hero_description
  );

  /* ABOUT */
  setValue(
    "aboutText",
    data.about_text
  );

  /* CONTACT */
  setValue(
    "phone",
    data.phone
  );

  setValue(
    "address",
    data.address
  );

  setValue(
    "facebook",
    data.facebook
  );

  setValue(
    "openingHours",
    data.opening_hours
  );

  /* LOGO PREVIEW */
  if(data.logo_url){

    const logoPreview =
    $("logoPreview");

    if(logoPreview){

      logoPreview.src =
      data.logo_url;

    }

  }

  /* HERO PREVIEW */
  if(data.hero_image){

    const heroPreview =
    $("heroPreview");

    if(heroPreview){

      heroPreview.src =
      data.hero_image;

    }

  }

}

/* =====================================================
   UPDATE WEBSITE SETTINGS
===================================================== */

async function updateWebsiteSettings(){

  /* HERO IMAGE */
  const heroFile =
  $("heroImage")?.files[0];

  let heroImageUrl = null;

  if(heroFile){

    heroImageUrl =
    await uploadFile(heroFile);

  }

  /* LOGO IMAGE */
  const logoFile =
  $("logoImage")?.files[0];

  let logoUrl = null;

  if(logoFile){

    logoUrl =
    await uploadFile(logoFile);

  }

  const updateData = {

    hero_title:
    $("heroTitle")?.value || "",

    hero_description:
    $("heroDesc")?.value || "",

    about_text:
    $("aboutText")?.value || "",

    phone:
    $("phone")?.value || "",

    address:
    $("address")?.value || "",

    facebook:
    $("facebook")?.value || "",

    opening_hours:
    $("openingHours")?.value || ""

  };

  /* SAVE HERO IMAGE */
  if(heroImageUrl){

    updateData.hero_image =
    heroImageUrl;

  }

  /* SAVE LOGO */
  if(logoUrl){

    updateData.logo_url =
    logoUrl;

  }

  const { error } =
  await supabaseClient
  .from("website_settings")
  .update(updateData)
  .eq("id",1);

  if(error){

    console.error(error);

    alert(error.message);

    return;

  }

  alert("Website updated successfully!");

  loadWebsiteSettings();

  refreshPreview();

}

/* =====================================================
   ADD MENU ITEM
===================================================== */

async function addMenu(){

  const imageFile =
  $("menuImage")?.files[0];

  let imageUrl = null;

  if(imageFile){

    imageUrl =
    await uploadFile(imageFile);

  }

  const menuData = {

    name:
    $("menuName")?.value || "",

    description:
    $("menuDescription")?.value || "",

    price:
    parseFloat(
      $("menuPrice")?.value || 0
    ),

    category:
    $("menuCategory")?.value || "",

    image_url:
    imageUrl

  };

  const { error } =
  await supabaseClient
  .from("menu_items")
  .insert([menuData]);

  if(error){

    console.error(error);

    alert(error.message);

    return;

  }

  alert("Menu item added!");

  $("menuName").value = "";
  $("menuDescription").value = "";
  $("menuPrice").value = "";
  $("menuCategory").value = "";
  $("menuImage").value = "";

  loadMenuItems();

  refreshPreview();

}

/* =====================================================
   LOAD MENU ITEMS
===================================================== */

async function loadMenuItems(){

  const { data, error } =
  await supabaseClient
  .from("menu_items")
  .select("*")
  .order("created_at",{
    ascending:false
  });

  if(error){

    console.error(error);

    return;

  }

  const container =
  $("menuList");

  if(!container) return;

  container.innerHTML = "";

  data.forEach(item=>{

    container.innerHTML += `

    <div class="bg-white rounded-2xl shadow p-4 flex gap-4 items-center">

      <img
      src="${item.image_url || 'https://placehold.co/100'}"
      class="w-20 h-20 rounded-xl object-cover"
      />

      <div class="flex-1">

        <h3 class="font-black text-lg">
          ${item.name}
        </h3>

        <p class="text-gray-500 text-sm">
          ${item.description || ""}
        </p>

        <p class="font-bold text-[#800000] mt-2">
          ₱${item.price}
        </p>

      </div>

      <button
      onclick="deleteMenuItem(${item.id})"
      class="bg-red-500 text-white px-4 py-2 rounded-xl"
      >
      Delete
      </button>

    </div>

    `;

  });

}

/* =====================================================
   DELETE MENU ITEM
===================================================== */

async function deleteMenuItem(id){

  if(!confirm("Delete menu item?"))
  return;

  await supabaseClient
  .from("menu_items")
  .delete()
  .eq("id",id);

  loadMenuItems();

  refreshPreview();

}

/* =====================================================
   UPLOAD GALLERY IMAGE
===================================================== */

async function uploadGallery(){

  const file =
  $("galleryImage")?.files[0];

  if(!file){

    alert("Select image first");

    return;

  }

  const imageUrl =
  await uploadFile(file);

  if(!imageUrl) return;

  const { error } =
  await supabaseClient
  .from("gallery")
  .insert([{
    image_url:imageUrl
  }]);

  if(error){

    console.error(error);

    alert(error.message);

    return;

  }

  alert("Gallery image uploaded!");

  loadGallery();

  refreshPreview();

}

/* =====================================================
   LOAD GALLERY
===================================================== */

async function loadGallery(){

  const { data } =
  await supabaseClient
  .from("gallery")
  .select("*")
  .order("created_at",{
    ascending:false
  });

  const container =
  $("galleryList");

  if(!container) return;

  container.innerHTML = "";

  data.forEach(img=>{

    container.innerHTML += `

    <div class="relative">

      <img
      src="${img.image_url}"
      class="w-full h-32 rounded-2xl object-cover"
      />

      <button
      onclick="deleteGalleryImage(${img.id})"
      class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg"
      >
      X
      </button>

    </div>

    `;

  });

}

/* =====================================================
   DELETE GALLERY IMAGE
===================================================== */

async function deleteGalleryImage(id){

  if(!confirm("Delete image?"))
  return;

  await supabaseClient
  .from("gallery")
  .delete()
  .eq("id",id);

  loadGallery();

  refreshPreview();

}

/* =====================================================
   INIT
===================================================== */

loadWebsiteSettings();

loadMenuItems();

loadGallery();
