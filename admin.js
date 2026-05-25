/* =====================================================
   LADOlCE CAFE CMS PRO MAX
   FINAL ADMIN CONNECTOR
   FULLY FIXED VERSION
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


function refreshPreview(){

  const frame =
    $("previewFrame");

  if(frame){

    frame.src =
      "index.html?v=" + Date.now();

  }

}


/* =====================================================
   FILE UPLOAD
   FINAL FIXED VERSION
===================================================== */

async function uploadFile(file){

  if(!file) return null;

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabaseClient.storage
      .from("cafe")
      .upload(fileName, file);

  if(error){

    console.error("UPLOAD ERROR:", error);

    alert(error.message);

    return null;

  }

  const { data } =
    supabaseClient.storage
      .from("cafe")
      .getPublicUrl(fileName);

  return data.publicUrl;

}


/* =====================================================
   LOAD WEBSITE SETTINGS
===================================================== */

async function loadSettings(){

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

  // HERO
  if($("heroTitle"))
    $("heroTitle").value =
      data.hero_title || "";

  if($("heroDesc"))
    $("heroDesc").value =
      data.hero_description || "";

  // ABOUT
  if($("aboutText"))
    $("aboutText").value =
      data.about_text || "";

  // CONTACT
  if($("phone"))
    $("phone").value =
      data.phone || "";

  if($("email"))
    $("email").value =
      data.email || "";

  if($("address"))
    $("address").value =
      data.address || "";

  if($("facebook"))
    $("facebook").value =
      data.facebook || "";

  if($("instagram"))
    $("instagram").value =
      data.instagram || "";

  if($("openingHours"))
    $("openingHours").value =
      data.opening_hours || "";

}


/* =====================================================
   UPDATE HERO
===================================================== */

async function updateHero(){

  const file =
    $("heroImage").files[0];

  let imageUrl = null;

  if(file){

    imageUrl =
      await uploadFile(file);

  }

  const updateData = {

    hero_title:
      $("heroTitle").value,

    hero_description:
      $("heroDesc").value

  };

  // ONLY UPDATE IMAGE IF EXISTS
  if(imageUrl){

    updateData.hero_image =
      imageUrl;

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

  alert("Hero updated!");

  refreshPreview();

}


/* =====================================================
   UPDATE ABOUT
===================================================== */

async function updateAbout(){

  const { error } =
    await supabaseClient
      .from("website_settings")
      .update({

        about_text:
          $("aboutText").value

      })
      .eq("id",1);

  if(error){

    console.error(error);

    alert(error.message);

    return;

  }

  alert("About updated!");

  refreshPreview();

}


/* =====================================================
   UPDATE CONTACT
===================================================== */

async function updateContact(){

  const { error } =
    await supabaseClient
      .from("website_settings")
      .update({

        phone:
          $("phone").value,

        email:
          $("email").value,

        address:
          $("address").value,

        facebook:
          $("facebook").value,

        instagram:
          $("instagram").value,

        opening_hours:
          $("openingHours").value

      })
      .eq("id",1);

  if(error){

    console.error(error);

    alert(error.message);

    return;

  }

  alert("Contact updated!");

  refreshPreview();

}


/* =====================================================
   ADD MENU ITEM
===================================================== */

async function addMenu(){

  const name =
    $("menuName").value;

  const description =
    $("menuDesc").value;

  const price =
    parseFloat($("menuPrice").value);

  const category =
    $("menuCategory")?.value || "Food";

  const featured =
    $("menuFeatured")?.checked || false;

  const file =
    $("menuImage").files[0];

  if(!name || !price){

    alert("Menu name and price required");

    return;

  }

  let imageUrl = null;

  if(file){

    imageUrl =
      await uploadFile(file);

  }

  const { error } =
    await supabaseClient
      .from("menu_items")
      .insert([{

        name,
        description,
        price,
        category,
        is_featured: featured,
        image_url: imageUrl

      }]);

  if(error){

    console.error(error);

    alert(error.message);

    return;

  }

  // RESET FORM
  $("menuName").value = "";
  $("menuDesc").value = "";
  $("menuPrice").value = "";
  $("menuImage").value = "";

  loadMenu();

  refreshPreview();

}


/* =====================================================
   LOAD MENU
===================================================== */

async function loadMenu(){

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

  $("menuList").innerHTML = "";

  data.forEach(item=>{

    $("menuList").innerHTML += `

      <div class="bg-white rounded-2xl p-4 shadow flex gap-4 items-center">

        <img
          src="${item.image_url || 'https://placehold.co/100x100'}"
          class="w-20 h-20 rounded-xl object-cover"
        />

        <div class="flex-1">

          <h3 class="font-black text-lg">
            ${item.name}
          </h3>

          <p class="text-sm text-gray-500">
            ${item.description || ''}
          </p>

          <p class="font-bold text-[#800000] mt-2">
            ₱${item.price}
          </p>

        </div>

        <button
          onclick="deleteMenu(${item.id})"
          class="bg-red-500 text-white px-4 py-2 rounded-xl"
        >
          Delete
        </button>

      </div>

    `;

  });

}


/* =====================================================
   DELETE MENU
===================================================== */

async function deleteMenu(id){

  const confirmDelete =
    confirm("Delete menu item?");

  if(!confirmDelete) return;

  await supabaseClient
    .from("menu_items")
    .delete()
    .eq("id",id);

  loadMenu();

  refreshPreview();

}


/* =====================================================
   UPLOAD GALLERY IMAGE
===================================================== */

async function uploadGallery(){

  const file =
    $("galleryImage").files[0];

  if(!file){

    alert("Choose image");

    return;

  }

  const imageUrl =
    await uploadFile(file);

  if(!imageUrl) return;

  const { error } =
    await supabaseClient
      .from("gallery")
      .insert([{

        image_url: imageUrl

      }]);

  if(error){

    console.error(error);

    alert(error.message);

    return;

  }

  $("galleryImage").value = "";

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

  $("galleryList").innerHTML = "";

  data.forEach(item=>{

    $("galleryList").innerHTML += `

      <div class="relative">

        <img
          src="${item.image_url}"
          class="h-24 w-full rounded-xl object-cover"
        />

        <button
          onclick="deleteGallery(${item.id})"
          class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7"
        >
          ×
        </button>

      </div>

    `;

  });

}


/* =====================================================
   DELETE GALLERY
===================================================== */

async function deleteGallery(id){

  await supabaseClient
    .from("gallery")
    .delete()
    .eq("id",id);

  loadGallery();

  refreshPreview();

}


/* =====================================================
   TESTIMONIALS
===================================================== */

async function addTestimonial(){

  const customer_name =
    $("testimonialName").value;

  const review =
    $("testimonialReview").value;

  const rating =
    parseInt($("testimonialRating").value);

  const { error } =
    await supabaseClient
      .from("testimonials")
      .insert([{

        customer_name,
        review,
        rating

      }]);

  if(error){

    console.error(error);

    alert(error.message);

    return;

  }

  loadTestimonials();

  refreshPreview();

}


/* =====================================================
   LOAD TESTIMONIALS
===================================================== */

async function loadTestimonials(){

  const { data } =
    await supabaseClient
      .from("testimonials")
      .select("*")
      .order("created_at",{
        ascending:false
      });

  if(!$("testimonialList")) return;

  $("testimonialList").innerHTML = "";

  data.forEach(item=>{

    $("testimonialList").innerHTML += `

      <div class="bg-white p-4 rounded-2xl shadow">

        <h3 class="font-black">
          ${item.customer_name}
        </h3>

        <p class="text-sm mt-2">
          ${item.review}
        </p>

        <p class="mt-2 text-yellow-500">
          ⭐ ${item.rating}/5
        </p>

        <button
          onclick="deleteTestimonial(${item.id})"
          class="mt-4 bg-red-500 text-white px-3 py-2 rounded-xl"
        >
          Delete
        </button>

      </div>

    `;

  });

}


/* =====================================================
   DELETE TESTIMONIAL
===================================================== */

async function deleteTestimonial(id){

  await supabaseClient
    .from("testimonials")
    .delete()
    .eq("id",id);

  loadTestimonials();

  refreshPreview();

}


/* =====================================================
   INITIALIZE CMS
===================================================== */

loadSettings();

loadMenu();

loadGallery();

loadTestimonials();
