const BAG_KEY = "fumesociety-bag";
const LANG_KEY = "fs-lang";
const WHATSAPP = "9647508937745";
const PAGE_SIZE = 48;

const L = {
  en: {
    home: "Home", collection: "Collection", perfumes: "Perfumes", men: "Men", women: "Women", unisex: "Unisex", bath: "Bath & Body",
    about: "About", contact: "Contact", search: "Search", bag: "Your bag", close: "Close", phone: "WhatsApp +964 750 893 7745",
    p1: "Original", p1s: "Perfume only", p2: "4-5 days", p2s: "Delivery time", p3: "COD or FIB", p3s: "Payment options", p4: "Curated", p4s: "Luxury scents",
    hero1: "Scent,", hero2: "redefined.", heroLead: "Original perfumes in Duhok, from the houses on the list.", explore: "Explore collection",
    featured: "The featured collection", philosophyK: "Our philosophy", philosophyT: "A scent worth remembering",
    philosophy: "At FumeSociety, we curate original fragrances with character, quality and presence. Each bottle is chosen to become part of your signature.",
    more: "Discover more", collectionT: "The collection", collectionS: "Original bottles, chosen for character.",
    bottles: "bottles", bottle: "bottle", missingHouse: "This house is not in the collection.", allHouses: "All houses",
    missingBottle: "This bottle is not in the collection.", back: "Back to the collection", add: "Add to bag", inBag: "In your bag",
    empty: "Your bag is empty.", order: "Your order", name: "Name", phoneF: "Phone", city: "City", address: "Address", payment: "Payment",
    confirm: "Send on WhatsApp", placed: "Your order is ready on WhatsApp.", cod: "Cash on delivery", fib: "FIB",
    needed: "This field is needed.", loading: "The collection is being set.", failed: "The collection could not be opened.",
    searchHint: "Search the collection.", none: "Nothing matches that name.", remove: "Remove", subtotal: "Subtotal",
    write: "Write to the house", send: "Send on WhatsApp", received: "WhatsApp is open. Send the message there.",
    contactK: "Contact", pages: "Pages",
  },
  ar: {
    home: "الرئيسية", collection: "المجموعة", perfumes: "العطور", men: "رجالي", women: "نسائي", unisex: "للجنسين", bath: "الاستحمام والجسم",
    about: "عن المتجر", contact: "تواصل", search: "بحث", bag: "حقيبتك", close: "إغلاق", phone: "واتساب +964 750 893 7745",
    p1: "أصلي", p1s: "عطر فقط", p2: "4-5 أيام", p2s: "مدة التوصيل", p3: "عند الاستلام أو FIB", p3s: "طرق الدفع", p4: "مختار", p4s: "عطور فاخرة",
    hero1: "عطر،", hero2: "بصياغة جديدة.", heroLead: "عطور أصلية في دهوك، من البيوت الموجودة في القائمة.", explore: "تصفح المجموعة",
    featured: "المجموعة المختارة", philosophyK: "فلسفتنا", philosophyT: "عطر يُذكر",
    philosophy: "في FumeSociety نختار عطوراً أصلية لها حضور. كل عبوة هنا لأنها على قائمة الأسعار.",
    more: "المزيد", collectionT: "المجموعة", collectionS: "عبوات أصلية، مختارة لشخصيتها.",
    bottles: "عبوات", bottle: "عبوة", missingHouse: "هذا البيت غير موجود في المجموعة.", allHouses: "كل البيوت",
    missingBottle: "هذه العبوة غير موجودة.", back: "العودة إلى المجموعة", add: "أضف إلى الحقيبة", inBag: "في الحقيبة",
    empty: "حقيبتك فارغة.", order: "طلبك", name: "الاسم", phoneF: "الهاتف", city: "المدينة", address: "العنوان", payment: "الدفع",
    confirm: "إرسال عبر واتساب", placed: "الطلب جاهز على واتساب.", cod: "الدفع عند الاستلام", fib: "FIB",
    needed: "هذا الحقل مطلوب.", loading: "يتم تجهيز المجموعة.", failed: "تعذر فتح المجموعة.",
    searchHint: "ابحث في المجموعة.", none: "لا توجد نتيجة.", remove: "إزالة", subtotal: "المجموع",
    write: "راسل المتجر", send: "إرسال عبر واتساب", received: "واتساب مفتوح. أرسل الرسالة من هناك.",
    contactK: "تواصل", pages: "الصفحات",
  },
};

const SLIDES = [
  ["stills/hero.jpg", "Dior Sauvage"],
  ["stills/hero-creed-aventus.jpg", "Creed Aventus"],
  ["stills/hero-club-de-nuit.jpg", "Armaf Club de Nuit"],
  ["stills/hero-ombre-leather.jpg", "Tom Ford Ombré Leather"],
  ["stills/hero-lost-cherry.jpg", "Tom Ford Lost Cherry"],
  ["stills/hero-bleu-de-chanel.jpg", "Bleu de Chanel"],
  ["stills/hero-velario.jpg", "Velario"],
];

const state = {
  products: [],
  houses: [],
  byId: {},
  ready: false,
  error: false,
  bag: loadBag(),
  searchOpen: false,
  bagOpen: false,
  menuOpen: false,
  query: "",
  qty: 1,
  page: 1,
  pick: {},
  lang: localStorage.getItem(LANG_KEY) === "ar" ? "ar" : "en",
  contact: { name: "", message: "", done: false, errors: {} },
  order: { name: "", phone: "", city: "", address: "", pay: "cod", done: false, errors: {}, link: "" },
};

let lastKey = "";
let slide = 0;

function t(key) {
  return (L[state.lang] && L[state.lang][key]) || L.en[key] || key;
}

function loadBag() {
  try {
    const saved = JSON.parse(localStorage.getItem(BAG_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveBag() {
  localStorage.setItem(BAG_KEY, JSON.stringify(state.bag));
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function money(amount) {
  return `$${Math.round(Number(amount))}`;
}

function notesOf(product) {
  if (!product) return null;
  return state.lang === "ar" && product.notesAr ? product.notesAr : product.notes;
}

function parseRoute() {
  const parts = (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean).map(decodeURIComponent);
  if (!parts.length) return { name: "home" };
  if (parts[0] === "collection") return parts[1] ? { name: "house", brand: parts[1] } : { name: "collection" };
  if (parts[0] === "product") return { name: "product", id: parts[1] || "" };
  if (["about", "contact", "order", "perfumes", "men", "women", "unisex", "bath"].includes(parts[0])) return { name: parts[0] };
  return { name: "home" };
}

function routeKey(route) {
  return `${route.name}|${route.id || ""}|${route.brand || ""}|${state.lang}`;
}

function featuredList() {
  return state.products.filter((product) => product.featured).sort((a, b) => a.featuredOrder - b.featuredOrder);
}

function houseRecord(key) {
  return state.houses.find((house) => house.slug === key || house.name === key);
}

function defaultSize(product) {
  if (product.featuredSize) {
    const match = product.variants.find((variant) => variant.size.toLowerCase() === product.featuredSize.toLowerCase());
    if (match) return match.size;
  }
  return product.variants[0]?.size || "";
}

function selectedSize(product) {
  return state.pick[product.id] || defaultSize(product);
}

function variantOf(product, size) {
  return product?.variants.find((variant) => variant.size === size);
}

function lineTotal(line) {
  const product = state.byId[line.id];
  const variant = variantOf(product, line.size);
  return variant ? variant.price * line.qty : 0;
}

function bottleCount() {
  return state.bag.reduce((sum, line) => sum + line.qty, 0);
}

function inBag(id, size) {
  return state.bag.some((line) => line.id === id && line.size === size);
}

function priceLines(product, onlySize) {
  const variants = onlySize ? product.variants.filter((variant) => variant.size.toLowerCase() === onlySize.toLowerCase()) : product.variants;
  return variants.map((variant) => `${esc(variant.size)} / ${money(variant.price)}`).join("<br>");
}

function card(product, onlySize) {
  const img = product.image ? `<img src="${esc(product.image)}" alt="${esc(product.brand)} ${esc(product.label)}" ${onlySize ? "" : 'loading="lazy"'}>` : "";
  return `<a class="pcard" href="#/product/${encodeURIComponent(product.id)}">
    <div class="pack">${img}</div>
    <p class="house">${esc(product.brand)}</p>
    <h3>${esc(product.label)}</h3>
    <p class="var">${priceLines(product, onlySize)}</p>
  </a>`;
}

function notesBlock(product) {
  const notes = notesOf(product);
  const order = ["top", "middle", "base", "main"];
  const labels = { top: state.lang === "ar" ? "القمة" : "Top", middle: state.lang === "ar" ? "القلب" : "Middle", base: state.lang === "ar" ? "القاعدة" : "Base", main: state.lang === "ar" ? "الأساس" : "Main" };
  if (!notes) return "";
  return order.filter((key) => notes[key]).map((key) => `<div class="note"><span class="rule"></span><h3>${labels[key]}</h3><p>${esc(notes[key])}</p></div>`).join("");
}

function field(form, name, label, value, error, extra = "") {
  const control = extra === "area"
    ? `<textarea class="field" name="${name}" data-form="${form}">${esc(value)}</textarea>`
    : `<input class="field" name="${name}" data-form="${form}" value="${esc(value)}" ${extra}>`;
  return `<label class="lbl">${label}${control}${error ? `<span class="err">${esc(error)}</span>` : ""}</label>`;
}

function slideshow() {
  const frames = SLIDES.map(([src, alt], index) => `<img src="${esc(src)}" alt="${esc(alt)}" class="${index === slide ? "on" : ""}">`).join("");
  return `<div class="slides" id="slides">${frames}</div>`;
}

function marquee() {
  const links = state.houses.map((house) => `<a href="#/collection/${encodeURIComponent(house.slug)}"><img src="${esc(house.logo)}" alt="">${esc(house.name)}</a>`).join("");
  return `<div class="marquee" dir="ltr"><div class="marquee-track">${links}${links}</div></div>`;
}

function homePage() {
  const featured = state.ready ? featuredList().map((product) => card(product, product.featuredSize)).join("") : `<p class="center">${esc(t("loading"))}</p>`;
  return `<section class="veil">
    <div class="hero-grid">
      <div class="hero-copy">
        <h1>${esc(t("hero1"))}<br>${esc(t("hero2"))}</h1>
        <p class="lede">${esc(t("heroLead"))}</p>
        <a class="btn" href="#/collection">${esc(t("explore"))}</a>
      </div>
      ${slideshow()}
    </div>
  </section>
  <section class="promises veil" aria-label="Promises">
    <article><div class="num">I</div><h3>${esc(t("p1"))}</h3><p>${esc(t("p1s"))}</p></article>
    <article><div class="num">II</div><h3>${esc(t("p2"))}</h3><p>${esc(t("p2s"))}</p></article>
    <article><div class="num">III</div><h3>${esc(t("p3"))}</h3><p>${esc(t("p3s"))}</p></article>
    <article><div class="num">IV</div><h3>${esc(t("p4"))}</h3><p>${esc(t("p4s"))}</p></article>
  </section>
  ${state.ready ? marquee() : ""}
  <section class="salon section">
    <div class="wrap">
      <div class="ruled"><span></span><h2>${esc(t("featured"))}</h2><span></span></div>
      <div class="row">${state.error ? `<p class="center">${esc(t("failed"))}</p>` : featured}</div>
    </div>
  </section>
  ${philosophy()}`;
}

function philosophy() {
  return `<section class="veil section">
    <div class="split">
      <div class="prose">
        <p class="eyebrow">${esc(t("philosophyK"))}</p>
        <h2>${esc(t("philosophyT"))}</h2>
        <p>${esc(t("philosophy"))}</p>
        <a class="btn" href="#/about">${esc(t("more"))}</a>
      </div>
    </div>
  </section>`;
}

function collectionPage() {
  const cards = state.houses.map((house) => `
    <a class="hcard" href="#/collection/${encodeURIComponent(house.slug)}">
      <img class="mark" src="${esc(house.logo)}" alt="">
      <h3>${esc(house.name)}</h3>
      <p>${house.count} ${house.count === 1 ? esc(t("bottle")) : esc(t("bottles"))}</p>
    </a>`).join("");
  return `<section class="veil section"><div class="wrap">
    <div class="ruled"><span></span><h2>${esc(t("collectionT"))}</h2><span></span></div>
    <p class="sub">${esc(t("collectionS"))}</p>
    <div class="houses">${cards}</div>
  </div></section>`;
}

function housePage(key) {
  const house = houseRecord(key);
  const products = state.products.filter((product) => (house ? product.house === house.slug : product.brand === key));
  if (!products.length) {
    return `<section class="veil section"><div class="wrap center"><h2>${esc(t("missingHouse"))}</h2><p><a class="link" href="#/collection">${esc(t("allHouses"))}</a></p></div></section>`;
  }
  const title = house ? house.name : key;
  return `<section class="veil section"><div class="wrap">
    <p><a class="link" href="#/collection">${esc(t("allHouses"))}</a></p>
    <div class="ruled"><span></span><h2>${esc(title)}</h2><span></span></div>
    <div class="grid">${products.map((product) => card(product)).join("")}</div>
  </div></section>`;
}

function listingPage(name) {
  let list = state.products.filter((product) => product.category !== "bath-body");
  if (name === "bath") list = state.products.filter((product) => product.category === "bath-body");
  if (name === "men" || name === "women" || name === "unisex") list = list.filter((product) => product.audience === name);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, state.page));
  const shown = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pager = pages > 1 ? `<div class="pager">${Array.from({ length: pages }, (_, i) => `<button type="button" class="choice ${i + 1 === page ? "on" : ""}" data-act="page" data-page="${i + 1}">${i + 1}</button>`).join("")}</div>` : "";
  return `<section class="veil section"><div class="wrap">
    <div class="ruled"><span></span><h2>${esc(t(name))}</h2><span></span></div>
    <div class="grid">${shown.map((product) => card(product)).join("")}</div>
    ${pager}
  </div></section>`;
}

function productPage(id) {
  const product = state.byId[id];
  if (!product) {
    return `<section class="veil section"><div class="wrap center"><h2>${esc(t("missingBottle"))}</h2><p><a class="link" href="#/collection">${esc(t("back"))}</a></p></div></section>`;
  }
  const size = selectedSize(product);
  const variant = variantOf(product, size);
  const held = inBag(product.id, size);
  const family = state.lang === "ar" && product.familyAr ? product.familyAr : product.family;
  const meta = [family, product.audience].filter(Boolean).join("  ·  ");
  return `<section class="veil section"><div class="wrap product">
    <div class="stage"><div class="pack">${product.image ? `<img src="${esc(product.image)}" alt="${esc(product.brand)} ${esc(product.label)}">` : ""}</div></div>
    <div>
      <p class="kicker">${esc(product.brand)}</p>
      <h1>${esc(product.label)}</h1>
      ${meta ? `<p class="kicker">${esc(meta)}</p>` : ""}
      <p class="price">${variant ? money(variant.price) : ""}</p>
      ${notesBlock(product)}
      <div class="choices">${product.variants.map((item) => `<button type="button" class="choice ${item.size === size ? "on" : ""}" data-act="size" data-id="${esc(product.id)}" data-size="${esc(item.size)}">${esc(item.size)}</button>`).join("")}</div>
      <div class="actions">
        <div class="qty">
          <button type="button" data-act="qty" data-delta="-1" aria-label="Fewer">−</button>
          <span>${state.qty}</span>
          <button type="button" data-act="qty" data-delta="1" aria-label="More">+</button>
        </div>
        <button class="btn" type="button" data-act="add" data-id="${esc(product.id)}">${held ? esc(t("inBag")) : esc(t("add"))}</button>
      </div>
      <a class="link back" href="#/collection/${encodeURIComponent(product.house)}">${esc(t("back"))}</a>
    </div>
  </div></section>`;
}

function aboutPage() {
  return philosophy();
}

function contactPage() {
  const form = state.contact;
  const body = form.done
    ? `<h2>${esc(t("received"))}</h2>`
    : `<form data-form-submit="contact">
        <h2>${esc(t("write"))}</h2>
        ${field("contact", "name", esc(t("name")), form.name, form.errors.name, "autocomplete='name'")}
        ${field("contact", "message", esc(t("search")), form.message, form.errors.message, "area")}
        <p><button class="btn" type="submit">${esc(t("send"))}</button></p>
      </form>`;
  return `<section class="veil section"><div class="narrow">
    <p class="eyebrow">${esc(t("contactK"))}</p>
    ${body}
    <p class="kicker"><a href="https://wa.me/${WHATSAPP}">${esc(t("phone"))}</a></p>
  </div></section>`;
}

function orderMessage() {
  const lines = state.bag.map((line) => {
    const product = state.byId[line.id];
    const name = product ? `${product.brand} ${product.label}` : line.id;
    return `- ${name}, ${line.size} x ${line.qty} — ${money(lineTotal(line))}`;
  });
  const subtotal = state.bag.reduce((sum, line) => sum + lineTotal(line), 0);
  return [
    "FumeSociety",
    `${t("name")}: ${state.order.name.trim()}`,
    `${t("phoneF")}: ${state.order.phone.trim()}`,
    `${t("city")}: ${state.order.city.trim()}`,
    `${t("address")}: ${state.order.address.trim()}`,
    `${t("payment")}: ${state.order.pay === "fib" ? "FIB" : "Cash on delivery"}`,
    ...lines,
    `${t("subtotal")}: ${money(subtotal)}`,
  ].join("\n");
}

function orderPage() {
  if (state.order.done) {
    return `<section class="veil section"><div class="narrow center">
      <h2>${esc(t("placed"))}</h2>
      <p><a class="btn" href="${esc(state.order.link)}" target="_blank" rel="noopener">${esc(t("confirm"))}</a></p>
    </div></section>`;
  }
  if (!state.bag.length) {
    return `<section class="veil section"><div class="narrow center"><h2>${esc(t("empty"))}</h2><p><a class="btn" href="#/collection">${esc(t("explore"))}</a></p></div></section>`;
  }
  const form = state.order;
  const lines = state.bag.map((line) => {
    const product = state.byId[line.id];
    return `<li><span>${esc(product ? product.label : line.id)} · ${esc(line.size)} × ${line.qty}</span><span>${money(lineTotal(line))}</span></li>`;
  }).join("");
  return `<section class="veil section"><div class="narrow">
    <h2>${esc(t("order"))}</h2>
    <ul class="lines">${lines}</ul>
    <p class="price">${esc(t("subtotal"))} ${money(state.bag.reduce((sum, line) => sum + lineTotal(line), 0))}</p>
    <form data-form-submit="order">
      ${field("order", "name", esc(t("name")), form.name, form.errors.name, "autocomplete='name'")}
      ${field("order", "phone", esc(t("phoneF")), form.phone, form.errors.phone, "type='tel' autocomplete='tel'")}
      ${field("order", "city", esc(t("city")), form.city, form.errors.city, "autocomplete='address-level2'")}
      ${field("order", "address", esc(t("address")), form.address, form.errors.address, "autocomplete='street-address'")}
      <p class="lbl">${esc(t("payment"))}</p>
      <div class="pay">
        <button type="button" class="choice ${form.pay === "cod" ? "on" : ""}" data-act="pay" data-pay="cod">${esc(t("cod"))}</button>
        <button type="button" class="choice ${form.pay === "fib" ? "on" : ""}" data-act="pay" data-pay="fib">${esc(t("fib"))}</button>
      </div>
      <p><button class="btn" type="submit">${esc(t("confirm"))}</button></p>
    </form>
  </div></section>`;
}

function renderPage(route) {
  if (!state.ready && !["home", "about", "contact"].includes(route.name)) {
    return `<section class="veil section"><div class="wrap center"><h2>${esc(state.error ? t("failed") : t("loading"))}</h2></div></section>`;
  }
  if (route.name === "home") return homePage();
  if (route.name === "collection") return collectionPage();
  if (route.name === "house") return housePage(route.brand);
  if (route.name === "product") return productPage(route.id);
  if (route.name === "about") return aboutPage();
  if (route.name === "contact") return contactPage();
  if (route.name === "order") return orderPage();
  if (["perfumes", "men", "women", "unisex", "bath"].includes(route.name)) return listingPage(route.name);
  return homePage();
}

function renderBag() {
  const body = document.getElementById("bag-body");
  const lines = state.bag.map((line) => {
    const product = state.byId[line.id];
    if (!product) return "";
    return `<article class="line">
      ${product.image ? `<img src="${esc(product.image)}" alt="">` : ""}
      <div>
        <p class="house">${esc(product.brand)}</p>
        <h3>${esc(product.label)}</h3>
        <p class="meta">${esc(line.size)} · ${money(lineTotal(line))}</p>
        <div class="qty">
          <button type="button" data-act="line" data-id="${esc(line.id)}" data-size="${esc(line.size)}" data-delta="-1">−</button>
          <span>${line.qty}</span>
          <button type="button" data-act="line" data-id="${esc(line.id)}" data-size="${esc(line.size)}" data-delta="1">+</button>
        </div>
        <button class="text-btn" type="button" data-act="remove" data-id="${esc(line.id)}" data-size="${esc(line.size)}">${esc(t("remove"))}</button>
      </div>
    </article>`;
  }).join("");
  const subtotal = state.bag.reduce((sum, line) => sum + lineTotal(line), 0);
  body.innerHTML = state.bag.length
    ? `${lines}<div class="bag-foot"><p class="price">${esc(t("subtotal"))} ${money(subtotal)}</p><a class="btn block" href="#/order">${esc(t("confirm"))}</a></div>`
    : `<p class="quiet">${esc(t("empty"))}</p>`;
}

function renderSearch() {
  const panel = document.getElementById("search");
  const input = document.getElementById("search-input");
  const hits = document.getElementById("hits");
  panel.hidden = !state.searchOpen;
  if (document.activeElement !== input) input.value = state.query;
  const query = state.query.trim().toLowerCase();
  if (!query) {
    hits.innerHTML = `<p class="quiet">${esc(t("searchHint"))}</p>`;
    return;
  }
  const found = state.products.filter((product) => {
    const notes = notesOf(product) ? Object.values(notesOf(product)).join(" ") : "";
    return [product.brand, product.label, product.name, product.family, product.familyAr, notes].join(" ").toLowerCase().includes(query);
  }).slice(0, 8);
  hits.innerHTML = found.length
    ? found.map((product) => `<a class="hit" href="#/product/${encodeURIComponent(product.id)}">${product.image ? `<img src="${esc(product.image)}" alt="">` : ""}<span><em>${esc(product.brand)}</em><strong>${esc(product.label)}</strong></span><span class="price">${money(product.variants[0].price)}</span></a>`).join("")
    : `<p class="quiet">${esc(t("none"))}</p>`;
}

function applyLang() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  const input = document.getElementById("search-input");
  if (input) input.placeholder = t("searchHint");
  const langButton = document.querySelector('[data-act="lang"]');
  if (langButton) langButton.textContent = state.lang === "ar" ? "English" : "العربية";
}

function updateChrome(route) {
  applyLang();
  document.getElementById("header").classList.toggle("solid", route.name !== "home" || window.scrollY > 24);
  document.getElementById("header").classList.toggle("menu-open", state.menuOpen);
  document.querySelector('[data-act="menu"]').setAttribute("aria-expanded", String(state.menuOpen));
  document.querySelector('[data-act="search"]').setAttribute("aria-expanded", String(state.searchOpen));
  const bagButton = document.querySelector('[data-act="bag"]');
  const count = bottleCount();
  bagButton.setAttribute("aria-expanded", String(state.bagOpen));
  const badge = document.getElementById("bag-count");
  badge.hidden = count === 0;
  badge.textContent = String(count);
  document.getElementById("bag").classList.toggle("open", state.bagOpen);
  document.getElementById("bag").setAttribute("aria-hidden", String(!state.bagOpen));
  document.getElementById("scrim").hidden = !(state.bagOpen || state.searchOpen);
  const current = route.name === "house" || route.name === "product" ? "collection" : route.name;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const house = route.name === "house" ? houseRecord(route.brand) : null;
  const titles = {
    home: "FumeSociety",
    collection: t("collection"),
    house: house ? house.name : route.brand,
    product: state.byId[route.id]?.label || "FumeSociety",
    about: t("about"),
    contact: t("contact"),
    order: t("order"),
    perfumes: t("perfumes"),
    men: t("men"),
    women: t("women"),
    unisex: t("unisex"),
    bath: t("bath"),
  };
  document.title = route.name === "home" ? "FumeSociety" : `${titles[route.name]} — FumeSociety`;
  renderSearch();
  renderBag();
}

function render() {
  const route = parseRoute();
  const key = routeKey(route);
  if (key !== lastKey) {
    lastKey = key;
    state.qty = 1;
    state.page = 1;
    state.menuOpen = false;
    window.scrollTo(0, 0);
  }
  document.getElementById("app").innerHTML = renderPage(route);
  updateChrome(route);
}

function readForm(form) {
  const kind = form.dataset.formSubmit;
  const data = new FormData(form);
  for (const [name, value] of data.entries()) state[kind][name] = String(value);
  return kind;
}

function validate(kind, keys) {
  const errors = {};
  keys.forEach((key) => {
    if (!String(state[kind][key] || "").trim()) errors[key] = t("needed");
  });
  state[kind].errors = errors;
  return Object.keys(errors).length === 0;
}

function addToBag(id) {
  const product = state.byId[id];
  if (!product) return;
  const size = selectedSize(product);
  if (inBag(id, size)) {
    state.bagOpen = true;
    state.searchOpen = false;
    updateChrome(parseRoute());
    return;
  }
  state.bag.push({ id, size, qty: state.qty });
  state.qty = 1;
  saveBag();
  state.bagOpen = true;
  state.searchOpen = false;
  render();
}

function changeLine(id, size, delta) {
  const line = state.bag.find((item) => item.id === id && item.size === size);
  if (!line) return;
  line.qty += delta;
  if (line.qty < 1) state.bag = state.bag.filter((item) => item !== line);
  saveBag();
  render();
}

document.body.addEventListener("click", (event) => {
  const act = event.target.closest("[data-act]");
  if (!act) return;
  const action = act.dataset.act;
  if (action === "menu") {
    state.menuOpen = !state.menuOpen;
    updateChrome(parseRoute());
  }
  if (action === "lang") {
    state.lang = state.lang === "ar" ? "en" : "ar";
    localStorage.setItem(LANG_KEY, state.lang);
    lastKey = "";
    render();
  }
  if (action === "search") {
    state.searchOpen = !state.searchOpen;
    state.bagOpen = false;
    updateChrome(parseRoute());
    if (state.searchOpen) document.getElementById("search-input").focus();
  }
  if (action === "bag") {
    state.bagOpen = !state.bagOpen;
    state.searchOpen = false;
    updateChrome(parseRoute());
  }
  if (action === "close") {
    state.bagOpen = false;
    state.searchOpen = false;
    state.menuOpen = false;
    updateChrome(parseRoute());
  }
  if (action === "size") {
    state.pick[act.dataset.id] = act.dataset.size;
    render();
  }
  if (action === "qty") {
    state.qty = Math.max(1, state.qty + Number(act.dataset.delta));
    render();
  }
  if (action === "add") addToBag(act.dataset.id);
  if (action === "line") changeLine(act.dataset.id, act.dataset.size, Number(act.dataset.delta));
  if (action === "remove") changeLine(act.dataset.id, act.dataset.size, -999);
  if (action === "pay") {
    state.order.pay = act.dataset.pay;
    render();
  }
  if (action === "page") {
    state.page = Number(act.dataset.page) || 1;
    render();
  }
});

document.body.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form-submit]");
  if (!form) return;
  event.preventDefault();
  const kind = readForm(form);
  if (kind === "contact" && validate("contact", ["name", "message"])) {
    const text = `${state.contact.name.trim()}\n${state.contact.message.trim()}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    state.contact.done = true;
  }
  if (kind === "order" && state.bag.length && validate("order", ["name", "phone", "city", "address"])) {
    const link = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(orderMessage())}`;
    state.order.link = link;
    state.order.done = true;
    window.open(link, "_blank", "noopener");
    state.bag = [];
    saveBag();
  }
  render();
});

document.body.addEventListener("click", (event) => {
  if (event.target.closest("a[href^='#/']")) {
    state.menuOpen = false;
    state.searchOpen = false;
    state.bagOpen = false;
  }
});

document.getElementById("search-input").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderSearch();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    state.bagOpen = false;
    state.searchOpen = false;
    state.menuOpen = false;
    updateChrome(parseRoute());
  }
});

window.addEventListener("hashchange", render);
window.addEventListener("scroll", () => updateChrome(parseRoute()), { passive: true });
setInterval(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = document.getElementById("slides");
  if (!box || box.matches(":hover")) return;
  slide = (slide + 1) % SLIDES.length;
  box.querySelectorAll("img").forEach((img, index) => img.classList.toggle("on", index === slide));
}, 5000);

render();

fetch("catalog/products.json")
  .then((response) => {
    if (!response.ok) throw new Error("catalog");
    return response.json();
  })
  .then((data) => {
    state.products = data.products;
    state.houses = data.houses;
    state.byId = Object.fromEntries(state.products.map((product) => [product.id, product]));
    state.ready = true;
  })
  .catch(() => {
    state.error = true;
  })
  .finally(render);
