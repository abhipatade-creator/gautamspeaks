# Gautam Speaks — Landing Page

Single-file, multilingual landing page for **Gautam Speaks** — Vedic astrology, Vastu Shastra and numerology consultations, Mumbai.

No build step, no dependencies, no backend. Open `index.html` in a browser and it works.

**Live demo:** _enable GitHub Pages (Settings → Pages → Deploy from branch → `main` / root)_

---

## Contents

| File | Purpose |
|---|---|
| `index.html` | Landing page markup and page-specific behaviour |
| `gautam-namaste.webp` | Hero portrait, 900px, transparent alpha |
| `gautam-namaste-sm.webp` | Hero portrait, 450px, served via `srcset` |
| `shop.html` | Product listing page with category filters |
| `style.css` | Shared stylesheet |
| `i18n.js` | Shared language packs and switcher engine |
| `search.js` | Site search index and autosuggest |
| `shorts.js` | YouTube Shorts strip — thumbnails + in-page player |
| `shorts-setup.html` | Paste Shorts links, get the `SHORTS` array. noindex, for you only |
| `products.js` `cart.js` | Catalogue and localStorage cart |
| `product/*.html` | 16 product detail pages |
| `booking.js` | Booking modal — service dropdown, email, consent, Rahu-Kaal-aware slots |
| `rashi.js` | Rashi detail modal + this month's computed events |
| `img/*.webp` | 16 illustrated product tiles |
| `panchang.js` | Shared astronomy engine (used by index and all 12 rashi pages) |
| `rashi/*.html` | 12 per-sign pages with live Chandra Bala |
| `privacy.html` `terms.html` `refund.html` | Policy pages |
| `sitemap.xml` `robots.txt` | Crawl directives, 17 URLs x 11 hreflang alternates |
| `.nojekyll` | Stops GitHub Pages running Jekyll over the files |

---

## Features

### Colour palette — "Kesari Dawn"

Grounded in traditional Hindu pigments. Every pair below clears WCAG AA.

| Token | Hex | Role | Contrast on cream |
|---|---|---|---|
| `--void` | `#FBF5E9` | Chandan — page surface | — |
| `--void2` | `#FFFCF4` | Raised panels, menus | — |
| `--chalk` | `#3D1F14` | Rakta chandan — body text | 13.77:1 (AAA) |
| `--dim` | `#7D5F4B` | Secondary text | 5.36:1 (AA) |
| `--faint` | `#E4D6BC` | Hairlines | — |
| `--amber` | `#B85321` | Kesari — accent, prices, CTAs | 4.50:1 (AA) |
| `--amber-dim` | `#95431B` | Borders, hover | 6.25:1 (AA) |
| `--haldi` | `#E8B33C` | Turmeric — decorative fills only | — |
| `--tulsi` | `#1E6B45` | Favourable / success | 5.96:1 (AA) |
| `--alert` | `#A83A1E` | Caution | 5.88:1 (AA) |

Kesari was darkened from the source `#D9642A` to `#B85321` — the lightest shade that
clears 4.5:1 both as text on cream *and* as a button fill behind cream text.

Black is deliberately absent: it is Shani's colour and is avoided at auspicious
occasions, which is the wrong signal for a site selling wedding muhurats.

### Multilingual — 10 languages
English, हिंदी, मराठी, ગુજરાતી, বাংলা, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ.

- Auto-detects the visitor's browser language, falls back to English
- Remembers the choice in `localStorage`
- **Every WhatsApp link is rewritten with a greeting in the selected language**, so incoming enquiries arrive in the language the visitor reads

Adding an 11th language means appending one object to `T` in `index.html`. The switcher builds itself from the `LANGS` array — no other change needed.

### Panchang engine (calculated, not hardcoded)
Real astronomy implemented in vanilla JS:

- **Sun** — Meeus low-precision solar position
- **Moon** — truncated ELP series, 40 terms, ~0.1° accuracy
- **Sidereal conversion** — Lahiri ayanamsa (returns 24.228° for 2026 vs ~24.22° reference)
- **Sunrise / sunset** — NOAA sunrise equation, validated within 1–4 minutes of published times for Mumbai, Delhi and Chennai

Outputs Tithi with paksha, Nakshatra with pada, Yoga, Karana, Vara, Moon and Sun rashi, sunrise, sunset, Rahu Kaal, Abhijit Muhurat and the ayanamsa value — for 10 selectable cities.

> Tithi spans 12° and nakshatra 13.33°, so ~0.1° lunar accuracy is comfortable. Within a few minutes of a boundary transition the adjacent value may show. Fine for a free tool; not a substitute for professional muhurat calculation.

### Chandra Bala (not a fabricated horoscope)
Computes today's Moon position counted from each of the 12 janma rashis and applies the classical rule — 1, 3, 6, 7, 10, 11 favourable; 4, 8, 12 difficult (8th being Chandrashtama); the rest neutral. Recalculated live, every day.

### Birth details tool
Date and time of birth in; janma rashi with its lord, nakshatra with pada and
lord, tithi with paksha, vara, sun sign, yoga, karana, plus Moolank and
Bhagyank with ruling planets. Uses `Panchang.atMoment()`, which evaluates the
chart at the exact birth instant rather than at sunrise.

Lagna is deliberately absent — it needs the birth *place*, and the copy says so
rather than pretending otherwise. Runs entirely client-side; nothing is stored
or transmitted.

### Other
- Mega-menu navigation, 43 destinations, hover-intent on desktop and accordion on mobile
- Sticky header that condenses on scroll
- Canvas starfield and a rotating chart wheel, both honouring `prefers-reduced-motion`
- Every CTA opens a booking modal first; WhatsApp receives a complete enquiry
- Consultation slots are checked live against Rahu Kaal and Abhijit Muhurat
- No backend, no database, no PII stored

---

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works.

---

## Editing

Everything lives in `index.html`.

| To change | Look for |
|---|---|
| Phone number | `const PHONE` in the script, plus `wa.me/` and `tel:` links in the markup |
| Prices | Hardcoded in the markup (`&#8377;9,500` etc.) — they are deliberately not translated |
| Translations | The `T` object — `T.en`, `T.hi`, `T.mr`, … |
| Language list | The `LANGS` array |
| Colours / type | CSS custom properties in `:root` |
| Panchang cities | The `<select id="panPlace">` options — `"lat,lon,Name"` |
| Service prices | `PRICE` map in `booking.js` (rupees; `0` = quote on request) |
| Payment gateway | `PAY.key` in `booking.js` — set a Razorpay `key_id` to switch it on |
| YouTube Shorts | `SHORTS` array in `shorts.js` — `{ id:'VIDEO_ID', title:'...' }` per Short |

---

## Before going live

- [x] Removed the placeholder testimonials and the invented consultation count
- [x] `LocalBusiness`, `Person`, `WebSite`, `FAQPage`, `OfferCatalog` and per-page `Article` schema
- [x] `sitemap.xml`, `robots.txt`, `hreflang` for all 10 languages
- [x] Policy pages: privacy, terms, refund and shipping
- [ ] Add real testimonials once you have permission to publish them
- [ ] Replace the illustrated product tiles in `img/` with photographs
- [ ] Point every `wa.me` link at the correct business number
- [ ] Split `i18n.js` per language to cut ~200 KB from first load
- [ ] Add a Razorpay `key_id` to `PAY.key` and a server route to create orders
- [x] Shorts wired in — 5 videos, horizontal rail with arrows and an in-page player
- [ ] Reconcile "25+ years" on the site with "20+ years" on the YouTube channel
- [ ] Reconcile the spelling: site says Naik, YouTube says Nayak

---

## Licence

All rights reserved. Portrait photography and brand assets are the property of Gautam Speaks (Gautam Prabhakar Naik HUF).
