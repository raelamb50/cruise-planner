# WEBSITE-BUILD.md — Mobile HTML Site Build Instructions

> **This file is ONLY for building the mobile website.**
> The source of truth for all trip data is `trip_data.json` (v8) and `CLAUDE.md`.
> Do NOT duplicate or override data from those files — read from them dynamically or embed their data at build time.

---

## What to Build

A single-file mobile HTML site (`mediterranean-cruise-dashboard.html`) that renders the full March 17–30 trip as a chronological travel journal, viewable on iPhone Safari. Raelan and Robert will use this on their phones during the trip.

---

## Design System

### Aesthetic
Luxury editorial — Four Seasons meets a beautifully typeset travel journal. Elegant but functional.

### Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#0B1D3A` | Headers, tab bar, hotel cards |
| Navy-mid | `#132B52` | Progress bar, secondary navy |
| Sand | `#F5E6D3` | Backgrounds, layover cards |
| Sand-light | `#FBF5EE` | Page background |
| Gold | `#C9A96E` | Accents, map route, day badges, section labels |
| Coral | `#E07A5F` | High-priority gaps, embark/disembark markers |
| Green | `#2D6A4F` | Booked status badges, costs |
| White | `#FAFAFA` | Card backgrounds |

### Typography
- **Google Fonts**: `Cormorant Garamond` (display/headings), `Source Sans 3` (body)
- Day badge: Cormorant, 12px, gold, uppercase, letter-spacing 2px
- Port/location name: Cormorant, 26–28px, navy
- Date/times: Source Sans, 12–13px, muted
- Section labels: Source Sans, 10px, uppercase, letter-spacing 2px, gold
- Body text: Source Sans, 13px
- Include fallbacks: `Georgia, serif` and `-apple-system, sans-serif`

### Dark Mode
Support `prefers-color-scheme: dark` via CSS variables. In dark mode, swap sand/white backgrounds to navy tones and text to light sand.

---

## Technical Requirements

1. **Single HTML file** — all CSS and JS inline (no external files except fonts and Leaflet)
2. **Mobile-first**: iPhone 14/15/16 viewport (390px), Safari iOS optimized
3. **Touch-optimized**: Min 44px tap targets, no hover-dependent interactions
4. **Safe area insets**: `env(safe-area-inset-bottom)` for iPhone home indicator
5. **Offline-friendly**: Embed all trip data inline in the HTML. External deps (Google Fonts, Leaflet) should have graceful fallbacks
6. **No localStorage** except for packing checklist state

---

## Site Architecture

### Bottom Tab Bar (fixed, 5 tabs)
| Tab | Icon | Content |
|-----|------|---------|
| 🗺 Trip | Default/active | Map + chronological story |
| ✈️ Flights | | Flight timeline |
| 💰 Budget | | Expense summary |
| 🧳 Pack | | Interactive packing checklist |
| ℹ️ Info | | Ship FAQ + action items |

> **No separate Dining tab.** Dining is embedded within each day's story (onboard reservations, shore bookings, and recommendations all appear in the day they occur).

---

## Tab 1: Trip (Map + Story)

This is the core experience. Two parts:

### Interactive Route Map (collapsible)
- **Leaflet.js** with light CartoDB tiles (`light_all`)
- Gold dashed polyline connecting ports in order
- Port markers: gold circles (12px), coral for embark/disembark (16px)
- **Clicking a marker** → zooms map to that port AND scrolls to that day's chapter below
- **Port strip** below the map: horizontal scrollable pill buttons for each port — same click behavior
- **"All" button** resets zoom to full route view
- **Collapsible**: Toggle bar above the map ("▲ Route Map ▲") lets user collapse/expand. Tapping a port marker or strip button auto-expands if collapsed
- **Map hides entirely** on non-Trip tabs to free up viewport
- Map coordinates are in `trip_data.json` — use these port lat/lngs:

| Port | Lat | Lng |
|------|-----|-----|
| Málaga | 36.7213 | -4.4214 |
| Menorca (Mahón) | 39.8885 | 4.2658 |
| Marseille | 43.2965 | 5.3698 |
| Saint-Tropez | 43.2727 | 6.6406 |
| Ponza | 40.8954 | 12.9631 |
| Trapani | 38.0174 | 12.5114 |
| Gozo | 36.0444 | 14.2514 |
| Valletta | 35.8989 | 14.5146 |

### Chronological Story Timeline

Render **every day from March 17–30** as a continuous chapter, in order. This includes pre-cruise days, sea days, port days, and post-cruise return. Pull all data from `trip_data.json` `days[]` array.

Each chapter contains (in order, skip sections if empty):

1. **Day badge**: "PRE-CRUISE", "DAY 1", "DAY 2", … "DAY 10", "POST-CRUISE"
2. **Location headline**: Flag emoji + port name + country (e.g., "🇪🇸 Málaga, Spain")
3. **Date**: Formatted date string
4. **Times**: Arrive/depart/all-aboard times from the JSON
5. **Status badge**: Color-coded
   - Green (`b-booked`): Has booked excursions
   - Coral (`b-action`): Has HIGH gaps — needs planning
   - Gold (`b-sea`): Sea day
   - Navy (`b-travel`): Transit/travel day
   - Amber (`b-open`): Open but no urgent gaps
6. **Transit block** (if applicable): Flight details embedded in the day — airline, flight #, aircraft, times, class. Flights are connective tissue, not a separate section.
7. **Hotel block** (if applicable): Hotel name, status, confirmation, check-in time
8. **Booked excursions**: Name, time, cost, status, confirmation if available. Pending items get a gold left-border accent.
9. **Dining reservations**: Restaurant name, time, status, notes (e.g., allergy info for De Silveren Spiegel)
10. **Gap alerts**: Coral for HIGH, amber for MODERATE, gray for LOW
11. **Recommendations accordion**: Expandable section with name + description for each recommendation. Default collapsed.

#### Sea day styling
Sea days get a subtle tinted background (light navy wash) and smaller heading. Show onboard dining and recommendations (spa, pool, etc.).

#### Active chapter
When user navigates via map marker or port strip, the target chapter's port name turns gold briefly and the page scrolls to it.

---

## Tab 2: Flights

Timeline view of **all 6 flight legs** (3 outbound + 3 return) from `trip_data.json`.

Each flight card shows:
- Route (city → city)
- Flight number, airline, aircraft
- Departure/arrival airport codes, times, dates, terminals
- Seat assignments (Robert 3C, Raelan 3D for outbound)
- Class
- Confirmation code

Between legs, show layover cards:
- Duration, location
- If overnight: note hotel (e.g., "The Dylan Amsterdam")

Include the cruise block between outbound and return: "🚢 CRUISE: March 20–29"

**Data source**: `trip_data.json` → `flights.outbound[]`, `flights.connecting[]`, `flights.return[]`

---

## Tab 3: Budget

- **Summary card** (navy background): Grand total from `expenses.totalExcursions` ($4,994.50), note about EUR estimates, per-person split
- **Itemized rows**: Each excursion from `expenses.excursions[]` with day, name, per-person cost, total
- **Flights row**: Vueling $385.20
- **Note**: Delta flights ticketed separately, cruise fare not included
- Read-only — no expense tracker

**Data source**: `trip_data.json` → `expenses`

---

## Tab 4: Pack

Interactive packing checklist with tap-to-check circles. Categories:

- 👜 Essentials (passport, cruise docs, credit cards, charger, adapter, meds, sunscreen, sunglasses)
- 👗 Clothing (layers, swimwear ×2, walking shoes, evening outfits, rain jacket, hat, sandals, linen)
- 📱 Tech (iPhone, camera, power bank, AirPods, e-reader)
- 🧴 Toiletries (toothbrush, deodorant, shampoo, moisturizer, lip balm SPF, seasickness remedy)
- 🤿 Dive Day — Gozo (dive cert, rash guard, reef-safe sunscreen, waterproof phone case)

**localStorage only** — per-device, does not sync. This is the ONLY use of localStorage in the site.

---

## Tab 5: Info

### Ship Quick Reference
Render `trip_data.json` → `shipInfo[]` as accordion FAQ. Each item has question + answer. Default collapsed, tap to expand.

Key facts to highlight at the top (not accordion — always visible):
- Confirmation: **GEVMLH** (Delta) / **K60WW** (Vueling)
- Wi-Fi: Complimentary
- Outlets: US + EU + USB (no adapter needed)
- Breakfast: Terrasse, 7:30–11 AM (complimentary — the only included meal)

### Action Items
Render `trip_data.json` → `actionItems[]` grouped by priority, filtered to show only `status: "open"` items. Color-code by priority (HIGH = coral, MODERATE = amber, LOW = gray, OPTIONAL = muted).

---

## Interaction Patterns

- **Map ↔ Story**: Tapping a port marker or strip pill zooms map + scrolls to chapter. This is the primary navigation.
- **Collapse map**: Toggle bar above map lets user hide it for full-screen reading. Auto-expands on port tap.
- **Accordions**: Recommendations and FAQ sections — tap to expand/collapse, 250ms transition.
- **Tab switching**: Bottom bar switches content. Map only visible on Trip tab.
- **Tap-to-call**: Phone numbers wrapped in `tel:` links (Le Café, Acqua Pazza, Hauser & Wirth, hotels)
- **Tap-to-map**: Addresses wrapped in `maps://` for iOS

### Animations
- Tab switch: 250ms fade-up
- Accordion: 250–350ms max-height transition
- Map fly-to: 0.8s duration
- Map toggle: 0.4s max-height transition

---

## Data Mapping

The HTML should read ALL content from `trip_data.json`. Here's how to map it:

```
trip_data.json structure:
├── trip (title, travelers, dates)
├── confirmations (GEVMLH, K60WW)
├── flights
│   ├── outbound[] (legs 1-2)
│   ├── connecting[] (leg 3)
│   └── return[] (legs 4-6)
├── days[] ← PRIMARY ITINERARY SOURCE
│   ├── Each day has: date, port, country, type, arrive, depart, board
│   ├── hotel {} (name, status, confirmation, address, phone)
│   ├── excursions[] (name, time, cost, status, confirmation, notes)
│   ├── dining[] (name, time, status, notes)
│   ├── recommendations[] (name, description)
│   └── gaps[] (severity, description)
├── expenses
│   ├── excursions[] (item, perPerson, quantity, total)
│   └── totalExcursions
├── actionItems[] (priority, action, status)
└── shipInfo[] (question, answer)
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `mediterranean-cruise-dashboard.html` | The site (single file, all inline) |
| `manifest.json` | PWA manifest — "Med Cruise 2026", navy theme |
| `sw.js` | Service worker — cache HTML + Leaflet for offline |

---

## Files NOT to Modify

| File | Why |
|------|-----|
| `CLAUDE.md` | Master trip logistics — source of truth for human-readable details |
| `trip_data.json` | Master structured data — source of truth for all content |
| `MEMORY.md` | Session state file managed by Claude Code |

---

## Build Command

```bash
# In the cruise-planner directory:
claude "Read WEBSITE-BUILD.md, then build the HTML site by pulling all data from trip_data.json. Follow the design system and architecture exactly."
```

## Test Command

```bash
npx http-server . -p 8080
# On iPhone: http://<your-pc-ip>:8080/mediterranean-cruise-dashboard.html
```
