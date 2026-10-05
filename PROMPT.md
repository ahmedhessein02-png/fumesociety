# FumeSociety — build prompt

Paste everything below the line into a coding agent opened on this project. Attach `reference/homepage.png` in the same message.

---

Build the FumeSociety storefront. It is a house of original perfume, dressed as an Art Deco interior: obsidian, metallic gold, sharp geometry, and ceremony. The Great Gatsby, applied to a fragrance salon. Not a soft luxury template, and not a generic Deco landing page with perfume dropped in.

## What wins when the two references disagree

`reference/homepage.png` is the content reference: section order, words, photographs, the five featured bottles, and the four promises.

The Art Deco system below is the visual architecture: color, type, ornament, components, and motion.

| Decision | Follow |
| --- | --- |
| Section order, copy, catalog, prices, `FIB` | The homepage and `catalog/products.json` |
| Palette, type, corners, borders, buttons, fields, motion | Art Deco tokens in this prompt |
| Bottle and still-life color | The photographs. Never grayscale a bottle. The juice is the product. |
| Featured band | One champagne salon between obsidian floors, as the screenshot alternates dark and light |
| Icons | Rotated gold diamonds, not circles |
| Numbering of the four promises and the three about tenets | Roman numerals |
| Primary buttons | Solid gold, black text, sharp corners. The screenshot's CTAs are solid, built as Deco instruments |
| Radius | `0`. No pills, no `rounded-lg`, no soft shadows |

If a choice is not in that table, choose the more architectural option.

## Stack

Next.js (App Router), TypeScript, Tailwind. Tokens live once, as CSS variables in the global stylesheet, and Tailwind reads them. Build a small set of components and use them everywhere: `Button`, `Frame`, `Diamond`, `Field`, `HouseCard`, `ProductCard`. Do not restyle a rounded component library halfway. Do not scatter one-off hex values through pages.

Load **Marcellus** for display and **Josefin Sans** for interface text.

## Catalog

Read `catalog/products.json` and the packshots in `catalog/images/`. That file is the only source of products, sizes, prices, families, audiences, and notes. It comes from the 28 Sep 2026 price list, `catalog/FumeSociety-Product.pdf`.

The cover says 1,408 products and 1,494 variants. The pages contain 1,387 photographed products, 1,473 prices, and 140 houses. Sell the JSON. Do not invent rows to close the gap, and do not add a note, a size, or a price that is not on the record.

Each record has `order`, `brand`, `name`, `label`, `variants` (`size`, `price`), optional `family` and `audience`, optional `notes` (`top`, `middle`, `base`, `main`), `details`, and `image`. A record may be an eau de parfum, an eau de toilette, a deodorant, a shower gel, a miniature, a gift set, or a bundle. Sell it as listed. Some sizes are the words `Size not specified` or `Size`, or a list of bottles in a bundle. Show that text. If family, audience, or notes are missing, leave them blank. Do not write a smell you were not given.

Prices are whole US dollars: `$314`, no cents.

The five homepage bottles carry `featured`, `featuredOrder`, and `featuredSize`.

## Voice

Quiet, confident, specific. The homepage copy is the voice. No lorem ipsum. No "welcome to our store." No exclamation marks. No discounts, no "shop now," no star ratings, no review widgets. The wordmark is `FumeSociety`, one word, in Marcellus.

## Tokens

```css
--obsidian: #0A0A0A;
--charcoal: #141414;
--champagne: #F2F0E4;
--gold: #D4AF37;
--gold-bright: #F2E8C4;
--ink: #0A0A0A;
--midnight: #1E3D59;
--pewter: #888888;
--gold-glow: 0 0 15px rgba(212, 175, 55, 0.2);
--gold-glow-strong: 0 0 20px rgba(212, 175, 55, 0.4);
```

- Page background: obsidian, with a diagonal crosshatch at about 4% opacity (`repeating-linear-gradient` at 45° and -45°, gold lines). Grain is acceptable. The pattern never competes with type.
- Text: champagne. Long paragraphs are champagne, not gold.
- Gold is for headings, borders, eyebrows, prices, and focus. Gold on obsidian is for short display text only.
- Cards and drawers: charcoal.
- Midnight blue is the quiet fill, used on outline-button hover and inactive choice, not as a second brand color.
- Pewter is secondary text.
- Borders are gold and meant to be seen. Hairlines are `1px` at 30% opacity, full gold on hover or when selected. Ceremonial frames are a double rule: `3px double` gold, or a 1px gold outer edge with an inset charcoal gap and a second gold edge.
- Radius is 0. Stepped corners are L-brackets, not curves: 2px gold borders on two sides, absolutely placed, 8px inset, opposite corners (top-left with bottom-right). Mark them `aria-hidden`.
- Shadows are gold glows. No gray drop shadows.

## Type

- Display, Marcellus: uppercase, `tracking-widest`. Hero is `text-6xl` on a phone and `text-7xl` on a desktop, tight leading.
- Section titles: uppercase, measured, with a gold rule on each side (`h-px w-24`), never a full-width line.
- Interface, Josefin Sans: navigation, labels, buttons, and meta are uppercase with wide tracking. Body is `text-lg`, `leading-relaxed`, sentence case.
- Prices are gold, Josefin Sans, tracked.

## Components

**Button.** Height at least 48px. Uppercase, `tracking-[0.2em]`, sharp, 300–500ms ease-out.

- Primary: gold fill, ink text. Hover shifts to `#F2E8C4` and strengthens the glow.
- Ghost: transparent, 2px gold border, gold text. Hover fills gold, text turns ink, glow strengthens.
- Quiet: 1px gold border, transparent. Hover fills midnight.

The hero, philosophy, bag, and order actions are primary. Text links are champagne and turn gold, with an underline that grows from the center.

Focus is a 2px gold ring, 2px offset, offset color obsidian. Every control is keyboard reachable.

**Frame.** Photographs are never bare.

- Lifestyle stills (hero, philosophy, about, contact): outer gold rule, inner inset of obsidian at least 8px, then the photograph. Color stays. Hover scales the image to about 1.05 inside the frame, clipped.
- Packshots: the file in `product.image`, on charcoal or champagne, inside a 1px gold frame and the opposite L-brackets. No generated bottle, no card shadow, no grayscale.

**Diamond.** Trust icons sit in a square rotated 45 degrees, gold 1px border. The icon inside counter-rotates and stays upright. On hover the diamond eases back toward 0 degrees over 500ms, then returns. Icons are a sparkle, a plane, a card, and a diamond, drawn as thin gold strokes.

**Field.** Transparent background. Only a 2px gold bottom border. Height 48px. Champagne text, pewter placeholder, Josefin Sans. Label above the field: uppercase, small, gold. Focus brightens the rule to `#F2E8C4` and adds a soft gold shadow under the line. No box, no browser ring. An empty required field keeps its value neighbors and shows `This field is needed.` beneath it in pewter.

**House card and product card.** Charcoal on obsidian pages, champagne-salon cards on the featured band. Gold border at 30%, full gold on hover. L-brackets at opposite corners, opacity 50% to 100%. Hover lifts `8px` over 500ms. Header type is Marcellus, gold, uppercase, tracked. Description is Josefin Sans, pewter.

## Motion

Mechanical, not bouncy. 300ms for controls, 500ms for reveals and lifts. Ease-out. Sections may rise 8px and fade in on first view, staggered by about 100ms. Gold rules may grow from the center to their fixed width. No spring, no elastic.

## Chrome

Sticky header. Over the hero it is transparent; after scroll it is obsidian with a 1px gold bottom rule.

- Left: `FumeSociety`
- Center: `HOME` `COLLECTION` `ABOUT` `CONTACT`
- Right: search, bag. The bag shows a small gold count only when it holds bottles. The count is bottles, not lines.

Routes: `/`, `/collection`, `/about`, `/contact`, `/order`, `/product/[id]`.

Search is a charcoal panel under the header, double gold frame. It filters house, label, name, family, and note text. An empty query shows the field and `Search the collection.` No hits shows `Nothing matches that name.` A hit shows the framed packshot, house, label, and the first variant's price, and opens the product.

The bag is a charcoal drawer with a gold hairline. Each line: framed packshot, house, label, chosen size, price, quantity, remove. Subtotal, then primary `PLACE ORDER`. Persist the bag in the browser.

Footer on every page, obsidian, four columns divided by full-height gold hairlines:

- `I` `ORIGINAL` / `PERFUME ONLY`
- `II` `4–5 DAYS` / `DELIVERY TIME`
- `III` `COD OR FIB` / `PAYMENT OPTIONS`
- `IV` `CURATED` / `LUXURY SCENTS`

Keep those words, including `FIB`. The Roman numerals are Marcellus. On a phone, two columns.

A skip link, visually hidden until focused, jumps to the main content.

## Homepage

Same sequence as the screenshot. A gold sunburst, radial, 10–20% opacity, sits behind the hero copy only.

1. Hero. Full viewport. Left, on obsidian over the crosshatch: `SCENT, REDEFINED.` then `Discover your signature scent.` then primary `EXPLORE COLLECTION` to `/collection`. Right: the Creed still life from `reference/homepage.png`, inside a Frame. The velvet, rose, marble, and bottle stay in that photograph. Do not redraw them, and do not slice the bottle in half. On a narrow screen, copy first, frame second.

2. Promise bar. Obsidian. Four equal columns, vertical gold hairlines. Each column is a Roman numeral, a Diamond, then the label.
   - `I` Authentic scents. `Original perfume only`
   - `II` Fast delivery. `4-5 days`
   - `III` Easy payments. `Cash on delivery or FIB`
   - `IV` Curated luxury. `Chosen for character`

   The labels are uppercase and tracked. On a phone, two by two.

3. The salon. Background champagne `#F2F0E4`, ink text, no crosshatch. This is the one light room. Title `THE FEATURED COLLECTION` in Marcellus, ink, with gold rules on either side. One row of the five records below, in this order. Each is a framed packshot, not a redraw of the screenshot bottles. The size is `featuredSize` and the price is that variant. Desktop is one row. A phone scrolls sideways.

   | Order | id | Shown as | Size | Price |
   | --- | --- | --- | --- | --- |
   | 1 | `creed-aventus` | `CREED / AVENTUS` | 100ML | $314 |
   | 2 | `dior-dior-homme-intense` | `DIOR / DIOR HOMME INTENSE` | 100ml | $144 |
   | 3 | `tom-ford-tobacco-vanille` | `TOM FORD / TOBACCO VANILLE` | 50ml | $204 |
   | 4 | `amouage-guidance-edp` | `AMOUAGE / GUIDANCE` | 100ml | $374 |
   | 5 | `xerjoff-xj-1861-naxos` | `XERJOFF / XJ 1861 NAXOS` | 100ml | $214 |

   Tobacco Vanille also has a 100ml at $274. This row shows the 50ml. The product page offers both.

4. Philosophy. Split, symmetrical. Left: the desk still life from the screenshot, in a Frame. Right, obsidian: eyebrow `OUR PHILOSOPHY`, headline `A Scent Worth Remembering`, then:

   At FumeSociety, we curate original fragrances with character, quality and presence. Each bottle is chosen to become part of your signature—quietly confident, beautifully made and remembered long after you leave.

   Primary `DISCOVER MORE` goes to `/about`. On a phone, the frame is first.

5. The four-column footer.

## Collection

Obsidian page. Title `THE COLLECTION`. Line: `Original bottles, chosen for character.`

1,387 products, so the page opens on the houses. List the 140 houses in the order they first appear in the JSON, in a three-column grid on a desktop, two on a tablet, one on a phone. A house card shows the name in Marcellus and the count in Josefin Sans (`16 bottles`). Hover lifts the card. Choosing a house replaces the grid with that house's products in `order`: framed packshot, house, label, one gold line per variant (`100ml / $314`). Four across, then three, then two. The title becomes the house name. `ALL HOUSES` returns to the index.

## Product

`/product/[id]`. Obsidian. Two columns, even, with a vertical gold hairline between them. Left: the packshot in a large Frame. Right:

- House, tracked
- `label` in Marcellus, uppercase
- Family and audience, only when present
- Notes, only the keys that exist, each introduced by a short gold rule and the word `Top`, `Middle`, `Base`, or `Main`
- Variants as a row of sharp choice buttons. The selected one is primary gold. `featuredSize` starts selected when present; otherwise the first variant. The gold price matches the selection.
- Quantity, starting at 1, as a sharp control
- Primary `ADD TO BAG`

Adding opens the drawer with that house, label, size, and price. The button then reads `IN YOUR BAG` for that size. Another size of the same perfume can still be added.

`Back to the collection` returns to that house. An unknown id shows `This bottle is not in the collection.` and the same way back.

## About

The philosophy split, same still life, same eyebrow, same headline, same paragraph. Beneath, on obsidian, three cards in a row. Each opens with a Roman numeral.

- `I` `Original bottles` — Every bottle is an original perfume, bought and shipped as the house made it. FumeSociety does not decant, rebottle, or rename.
- `II` `Chosen for character` — The edit stays small on the homepage and complete in the collection. A fragrance is here because it is on the price list.
- `III` `Four to five days` — Orders leave quickly and arrive in four to five days. You pay by cash on delivery or FIB.

No team, no timeline, no press logos. On a phone, the cards stack.

## Contact

The same split. Left, the desk still life in a Frame. Right, obsidian:

- Eyebrow `CONTACT`
- Headline `Write to the house`
- Fields: name, email, message. Primary `SEND`
- Three lines under the form: `Delivery in 4-5 days`, `Cash on delivery or FIB`, `Original perfume only`

A complete send replaces the form with `Received. We will write back shortly.` and keeps the three lines.

## Order

`/order`. Narrow obsidian column, centered, `max-w-xl`. Headline `YOUR ORDER`.

List the bag lines inside one double frame. Then fields: name, phone, city, address, and a pair of sharp choices, `Cash on delivery` and `FIB`. One is selected. Primary `CONFIRM ORDER`.

An empty bag shows `Your bag is empty.` and primary `EXPLORE COLLECTION`.

A complete confirm clears the bag and shows `Your order is placed. Delivery in 4-5 days.` plus the name and city. No account and no card payment.

## Measure

Content columns sit in `max-w-6xl`. The hero copy column is `max-w-5xl` inside the split. Section padding is `py-24` on a phone and `py-32` on a desktop. Card padding is `p-8`. Grid gaps are `gap-8`. Touch targets are at least 44px, buttons at least 48px. Decorative rules, brackets, diamonds, and the crosshatch are `aria-hidden`. Photographs have alt text: house and label for a packshot, and a plain description of the still life for the hero and the desk.

## Done when

- The homepage has the screenshot's order, words, Creed still life, desk still life, four promises, five featured bottles, and the footer words.
- The five prices come from the JSON. Tobacco Vanille on the homepage is the 50ml at $204.
- The chrome is Art Deco: Marcellus and Josefin Sans, obsidian and `#D4AF37`, sharp corners, L-brackets, diamonds, Roman numerals, gold glow, crosshatch, and a sunburst behind the hero.
- Bottles stay in color and use `catalog/images/`.
- Collection, product, about, contact, search, bag, and order all use the same components.
- Each size of a perfume can be bagged on its own.
- `FIB` and `COD OR FIB` appear where the homepage has them.
- Gold is not used for long paragraphs. Focus is visible. A keyboard user can reach every control.
