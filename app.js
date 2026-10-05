const BAG_KEY = "fumesociety-bag";

const state = {
  products: [],
  byId: {},
  brands: [],
  ready: false,
  error: false,
  bag: loadBag(),
  searchOpen: false,
  bagOpen: false,
  menuOpen: false,
  query: "",
  qty: 1,
  pick: {},
  contact: { name: "", email: "", message: "", done: false, errors: {} },
  order: {
    name: "",
    phone: "",
    city: "",
    address: "",
    pay: "Cash on delivery",
    done: false,
    placedName: "",
    placedCity: "",
    errors: {},
  },
};

let lastKey = "";

const icons = {
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L13.2 10.2 L22 12 L13.2 13.8 L12 22 L10.8 13.8 L2 12 L10.8 10.2 Z"/></svg>',
  plane: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 L21 4 L14 21 L11 13 Z"/></svg>',
  card: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7 H21 V17 H3 Z M3 11 H21"/></svg>',
  gem: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 L20 10 L12 21 L4 10 Z"/></svg>',
};

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
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function money(amount) {
  return `$${Math.round(Number(amount))}`;
}

function parseRoute() {
  const parts = (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean).map(decodeURIComponent);
  if (!parts.length) return { name: "home" };
  if (parts[0] === "collection") return parts[1] ? { name: "house", brand: parts[1] } : { name: "collection" };
  if (parts[0] === "product") return { name: "product", id: parts[1] || "" };
  if (parts[0] === "about" || parts[0] === "contact" || parts[0] === "order") return { name: parts[0] };
  return { name: "home" };
}

function routeKey(route) {
  return `${route.name}|${route.id || ""}|${route.brand || ""}`;
}

function featuredList() {
  return state.products.filter((product) => product.featured).sort((a, b) => a.featuredOrder - b.featuredOrder);
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
  return `<a class="pcard" href="#/product/${encodeURIComponent(product.id)}">
    <div class="pack"><img src="${esc(product.image)}" alt="${esc(product.brand)} ${esc(product.label)}" ${onlySize ? "" : 'loading="lazy"'}></div>
    <p class="house">${esc(product.brand)}</p>
    <h3>${esc(product.label)}</h3>
    <p class="var">${priceLines(product, onlySize)}</p>
  </a>`;
}

function frame(src, alt, kind) {
  return `<div class="frame ${kind}"><div class="clip"><img src="${esc(src)}" alt="${esc(alt)}"></div></div>`;
}

function notesBlock(product) {
  const order = ["top", "middle", "base", "main"];
  const labels = { top: "Top", middle: "Middle", base: "Base", main: "Main" };
  if (!product.notes) return "";
  return order.filter((key) => product.notes[key]).map((key) => `
    <div class="note"><span class="rule"></span><h3>${labels[key]}</h3><p>${esc(product.notes[key])}</p></div>
  `).join("");
}

function metaLine(product) {
  const bits = [product.family, product.audience ? `For ${product.audience}` : ""].filter(Boolean);
  return bits.length ? `<p class="kicker">${esc(bits.join("  ·  "))}</p>` : "";
}

function field(form, name, label, value, error, extra = "") {
  const control = extra === "area"
    ? `<textarea class="field" name="${name}" data-form="${form}">${esc(value)}</textarea>`
    : `<input class="field" name="${name}" data-form="${form}" value="${esc(value)}" ${extra}>`;
  return `<label class="lbl">${label}${control}${error ? `<span class="err">${esc(error)}</span>` : ""}</label>`;
}

function homePage() {
  const featured = state.ready ? featuredList().map((product) => card(product, product.featuredSize)).join("") : `<p class="center">The collection is being set.</p>`;
  return `<section class="veil">
    <div class="hero-grid">
      <div class="hero-copy">
        <h1>Scent,<br>redefined.</h1>
        <p class="lede">Discover your signature scent.</p>
        <a class="btn" href="#/collection">Explore collection</a>
      </div>
      ${frame("reference/hero.jpg", "Creed Aventus bottle on a marble tray beside a red rose", "portrait")}
    </div>
  </section>
  <section class="promises veil" aria-label="Promises">
    ${promise("I", icons.spark, "Authentic scents", "Original perfume only")}
    ${promise("II", icons.plane, "Fast delivery", "4-5 days")}
    ${promise("III", icons.card, "Easy payments", "Cash on delivery or FIB")}
    ${promise("IV", icons.gem, "Curated luxury", "Chosen for character")}
  </section>
  <section class="salon section">
    <div class="wrap">
      <div class="ruled"><span></span><h2>The featured collection</h2><span></span></div>
      <div class="row">${state.error ? `<p class="center">The collection could not be opened.</p>` : featured}</div>
    </div>
  </section>
  ${philosophy()}`;
}

function promise(numeral, icon, title, text) {
  return `<article><div class="num">${numeral}</div><div class="diamond">${icon}</div><h3>${title}</h3><p>${text}</p></article>`;
}

function philosophy() {
  return `<section class="veil section">
    <div class="split">
      ${frame("reference/desk.jpg", "A letter, a pen, and an Amouage bottle on a dark wood desk", "wide")}
      <div class="prose">
        <p class="eyebrow">Our philosophy</p>
        <h2>A scent worth remembering</h2>
        <p>At FumeSociety, we curate original fragrances with character, quality and presence. Each bottle is chosen to become part of your signature—quietly confident, beautifully made and remembered long after you leave.</p>
        <a class="btn" href="#/about">Discover more</a>
      </div>
    </div>
  </section>`;
}

function collectionPage() {
  const cards = state.brands.map((brand) => `
    <a class="hcard" href="#/collection/${encodeURIComponent(brand.name)}">
      <h3>${esc(brand.name)}</h3>
      <p>${brand.count} ${brand.count === 1 ? "bottle" : "bottles"}</p>
    </a>`).join("");
  return `<section class="veil section"><div class="wrap">
    <div class="ruled"><span></span><h2>The collection</h2><span></span></div>
    <p class="sub">Original bottles, chosen for character.</p>
    <div class="houses">${cards}</div>
  </div></section>`;
}

function housePage(name) {
  const products = state.products.filter((product) => product.brand === name);
  if (!products.length) {
    return `<section class="veil section"><div class="wrap center"><h2>This house is not in the collection.</h2><p><a class="link" href="#/collection">All houses</a></p></div></section>`;
  }
  return `<section class="veil section"><div class="wrap">
    <p><a class="link" href="#/collection">All houses</a></p>
    <div class="ruled"><span></span><h2>${esc(name)}</h2><span></span></div>
    <div class="grid">${products.map((product) => card(product)).join("")}</div>
  </div></section>`;
}

function productPage(id) {
  const product = state.byId[id];
  if (!product) {
    return `<section class="veil section"><div class="wrap center"><h2>This bottle is not in the collection.</h2><p><a class="link" href="#/collection">Back to the collection</a></p></div></section>`;
  }
  const size = selectedSize(product);
  const variant = variantOf(product, size);
  const held = inBag(product.id, size);
  return `<section class="veil section"><div class="wrap product">
    <div class="stage"><div class="pack"><img src="${esc(product.image)}" alt="${esc(product.brand)} ${esc(product.label)}"></div></div>
    <div>
      <p class="kicker">${esc(product.brand)}</p>
      <h1>${esc(product.label)}</h1>
      ${metaLine(product)}
      <p class="price">${variant ? money(variant.price) : ""}</p>
      ${notesBlock(product)}
      <div class="choices">${product.variants.map((item) => `<button type="button" class="choice ${item.size === size ? "on" : ""}" data-act="size" data-id="${esc(product.id)}" data-size="${esc(item.size)}">${esc(item.size)}</button>`).join("")}</div>
      <div class="actions">
        <div class="qty">
          <button type="button" data-act="qty" data-delta="-1" aria-label="Fewer">−</button>
          <span>${state.qty}</span>
          <button type="button" data-act="qty" data-delta="1" aria-label="More">+</button>
        </div>
        <button class="btn" type="button" data-act="add" data-id="${esc(product.id)}">${held ? "In your bag" : "Add to bag"}</button>
      </div>
      <a class="link back" href="#/collection/${encodeURIComponent(product.brand)}">Back to the collection</a>
    </div>
  </div></section>`;
}

function aboutPage() {
  const tenets = [
    ["I", "Original bottles", "Every bottle is an original perfume, bought and shipped as the house made it. FumeSociety does not decant, rebottle, or rename."],
    ["II", "Chosen for character", "The edit stays small on the homepage and complete in the collection. A fragrance is here because it is on the price list."],
    ["III", "Four to five days", "Orders leave quickly and arrive in four to five days. You pay by cash on delivery or FIB."],
  ];
  return `${philosophy()}
  <section class="veil"><div class="wrap section" style="padding-top:0">
    <div class="tenets">${tenets.map(([numeral, title, text]) => `<article class="tenet"><div class="num">${numeral}</div><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>
  </div></section>`;
}

function contactPage() {
  const form = state.contact;
  const body = form.done
    ? `<h2>Received. We will write back shortly.</h2>`
    : `<form data-form-submit="contact">
        <h2>Write to the house</h2>
        ${field("contact", "name", "Name", form.name, form.errors.name, "autocomplete='name'")}
        ${field("contact", "email", "Email", form.email, form.errors.email, "type='email' autocomplete='email'")}
        ${field("contact", "message", "Message", form.message, form.errors.message, "area")}
        <p><button class="btn" type="submit">Send</button></p>
      </form>`;
  return `<section class="veil section"><div class="split">
    ${frame("reference/desk.jpg", "A letter, a pen, and an Amouage bottle on a dark wood desk", "wide")}
    <div>
      <p class="eyebrow">Contact</p>
      ${body}
      <p class="kicker">Delivery in 4-5 days</p>
      <p class="kicker">Cash on delivery or FIB</p>
      <p class="kicker">Original perfume only</p>
    </div>
  </div></section>`;
}

function orderPage() {
  if (state.order.done) {
    return `<section class="veil section"><div class="narrow center">
      <h2>Your order is placed. Delivery in 4-5 days.</h2>
      <p>${esc(state.order.placedName)}, ${esc(state.order.placedCity)}</p>
      <p><a class="btn" href="#/">Explore collection</a></p>
    </div></section>`;
  }
  if (!state.bag.length) {
    return `<section class="veil section"><div class="narrow center">
      <h2>Your bag is empty.</h2>
      <p><a class="btn" href="#/collection">Explore collection</a></p>
    </div></section>`;
  }
  const form = state.order;
  const lines = state.bag.map((line) => {
    const product = state.byId[line.id];
    return `<li><span>${esc(product ? product.label : line.id)} · ${esc(line.size)} × ${line.qty}</span><span>${money(lineTotal(line))}</span></li>`;
  }).join("");
  return `<section class="veil section"><div class="narrow">
    <h2>Your order</h2>
    <ul class="lines">${lines}</ul>
    <p class="price">Subtotal ${money(state.bag.reduce((sum, line) => sum + lineTotal(line), 0))}</p>
    <form data-form-submit="order">
      ${field("order", "name", "Name", form.name, form.errors.name, "autocomplete='name'")}
      ${field("order", "phone", "Phone", form.phone, form.errors.phone, "type='tel' autocomplete='tel'")}
      ${field("order", "city", "City", form.city, form.errors.city, "autocomplete='address-level2'")}
      ${field("order", "address", "Address", form.address, form.errors.address, "autocomplete='street-address'")}
      <p class="lbl">Payment</p>
      <div class="pay">
        ${["Cash on delivery", "FIB"].map((pay) => `<button type="button" class="choice ${form.pay === pay ? "on" : ""}" data-act="pay" data-pay="${esc(pay)}">${esc(pay)}</button>`).join("")}
      </div>
      <p><button class="btn" type="submit">Confirm order</button></p>
    </form>
  </div></section>`;
}

function renderPage(route) {
  if (!state.ready && route.name !== "home" && route.name !== "about" && route.name !== "contact") {
    return `<section class="veil section"><div class="wrap center"><h2>${state.error ? "The collection could not be opened." : "The collection is being set."}</h2></div></section>`;
  }
  if (route.name === "home") return homePage();
  if (route.name === "collection") return collectionPage();
  if (route.name === "house") return housePage(route.brand);
  if (route.name === "product") return productPage(route.id);
  if (route.name === "about") return aboutPage();
  if (route.name === "contact") return contactPage();
  if (route.name === "order") return orderPage();
  return homePage();
}

function renderBag() {
  const body = document.getElementById("bag-body");
  const lines = state.bag.map((line) => {
    const product = state.byId[line.id];
    if (!product) return "";
    return `<article class="line">
      <img src="${esc(product.image)}" alt="">
      <div>
        <p class="house">${esc(product.brand)}</p>
        <h3>${esc(product.label)}</h3>
        <p class="meta">${esc(line.size)} · ${money(lineTotal(line))}</p>
        <div class="qty">
          <button type="button" data-act="line" data-id="${esc(line.id)}" data-size="${esc(line.size)}" data-delta="-1" aria-label="Fewer">−</button>
          <span>${line.qty}</span>
          <button type="button" data-act="line" data-id="${esc(line.id)}" data-size="${esc(line.size)}" data-delta="1" aria-label="More">+</button>
        </div>
        <button class="text-btn" type="button" data-act="remove" data-id="${esc(line.id)}" data-size="${esc(line.size)}">Remove</button>
      </div>
    </article>`;
  }).join("");
  const subtotal = state.bag.reduce((sum, line) => sum + lineTotal(line), 0);
  body.innerHTML = state.bag.length
    ? `${lines}<div class="bag-foot"><p class="price">Subtotal ${money(subtotal)}</p><a class="btn block" href="#/order">Place order</a></div>`
    : `<p class="quiet">Your bag is empty.</p>`;
}

function renderSearch() {
  const panel = document.getElementById("search");
  const input = document.getElementById("search-input");
  const hits = document.getElementById("hits");
  panel.hidden = !state.searchOpen;
  if (document.activeElement !== input) input.value = state.query;
  const query = state.query.trim().toLowerCase();
  if (!query) {
    hits.innerHTML = `<p class="quiet">Search the collection.</p>`;
    return;
  }
  const found = state.products.filter((product) => {
    const notes = product.notes ? Object.values(product.notes).join(" ") : "";
    return [product.brand, product.label, product.name, product.family, product.details, notes].join(" ").toLowerCase().includes(query);
  }).slice(0, 8);
  hits.innerHTML = found.length
    ? found.map((product) => `<a class="hit" href="#/product/${encodeURIComponent(product.id)}"><img src="${esc(product.image)}" alt=""><span><em>${esc(product.brand)}</em><strong>${esc(product.label)}</strong></span><span class="price">${money(product.variants[0].price)}</span></a>`).join("")
    : `<p class="quiet">Nothing matches that name.</p>`;
}

function updateChrome(route) {
  document.getElementById("header").classList.toggle("solid", route.name !== "home" || window.scrollY > 24);
  document.getElementById("header").classList.toggle("menu-open", state.menuOpen);
  document.querySelector('[data-act="menu"]').setAttribute("aria-expanded", String(state.menuOpen));
  document.querySelector('[data-act="search"]').setAttribute("aria-expanded", String(state.searchOpen));
  const bagButton = document.querySelector('[data-act="bag"]');
  const count = bottleCount();
  bagButton.setAttribute("aria-expanded", String(state.bagOpen));
  bagButton.setAttribute("aria-label", count ? `Bag, ${count} bottles` : "Bag");
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
  const titles = { home: "FumeSociety", collection: "The Collection", house: route.brand, product: state.byId[route.id]?.label || "Bottle", about: "Our Philosophy", contact: "Contact", order: "Your Order" };
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
    if (!String(state[kind][key] || "").trim()) errors[key] = "This field is needed.";
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
});

document.body.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form-submit]");
  if (!form) return;
  event.preventDefault();
  const kind = readForm(form);
  if (kind === "contact" && validate("contact", ["name", "email", "message"])) state.contact.done = true;
  if (kind === "order" && state.bag.length && validate("order", ["name", "phone", "city", "address"])) {
    state.order.done = true;
    state.order.placedName = state.order.name.trim();
    state.order.placedCity = state.order.city.trim();
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

render();

fetch("catalog/products.json")
  .then((response) => {
    if (!response.ok) throw new Error("catalog");
    return response.json();
  })
  .then((data) => {
    state.products = data.products;
    state.byId = Object.fromEntries(state.products.map((product) => [product.id, product]));
    const counts = new Map();
    state.products.forEach((product) => counts.set(product.brand, (counts.get(product.brand) || 0) + 1));
    state.brands = [...counts.entries()].map(([name, count]) => ({ name, count }));
    state.ready = true;
  })
  .catch(() => {
    state.error = true;
  })
  .finally(render);
