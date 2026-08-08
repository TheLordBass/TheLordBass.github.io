# thelordbass.github.io

Personal portfolio site for Ibomeno Basiekanem — Business Analyst.
Live at **https://thelordbass.github.io/**

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies,
no tracking. Push to `main` and GitHub Pages serves it.

---

## Running it locally

You need a real `http://` origin — opening `index.html` with `file://` will
half-work and mislead you.

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open http://localhost:8123. No Node or Python required — `serve.ps1` is a
small PowerShell static file server. Pass `-Port 9000` to use a different port.

---

## Layout

```
index.html          all content — edit this for copy changes
css/style.css       design tokens at the top, then sections in order
js/app.js           theme, nav, terminal, sandbox, filters, modals, form
js/canvas-bg.js     ambient background animation
assets/shots/       Power BI dashboard screenshots
serve.ps1           local dev server
```

### Where things live

| To change… | Go to |
|---|---|
| Colours, spacing, fonts | `css/style.css` § 1 (Tokens) |
| Project write-ups (modal content) | `js/app.js` — the `PROJECTS` object |
| Project cards | `index.html` — `#projects` section |
| Hero terminal lines | `js/app.js` — the `script` array in § 3 |
| Query sandbox results | `js/app.js` — the `data` object in § 4 |

---

## Adding a project

Two steps, both mechanical:

1. **Card** — copy an `<article class="card project-card">` block in
   `index.html` and change the text. Set `data-category` to one of
   `sql`, `tableau`, `bi`, `python`, `excel` so the filter picks it up, and set
   `data-project` to a new unique key.

   Use `.project-repo` for a GitHub link or `.project-viz` for a live dashboard —
   the latter renders with a green "live" dot. For a Tableau project, also set
   `repoLabel` on the `PROJECTS` entry so the modal button reads *Open the live
   dashboard* rather than *View on GitHub*.
2. **Write-up** — add an entry to `PROJECTS` in `js/app.js` using the same key.
   Supported block types are `p` (array of paragraphs), `list` (array of bullet
   points, HTML allowed) and `code` (a preformatted snippet).

   Add a `gallery` array to the entry to show screenshots above the write-up —
   each item takes `src`, `alt` and `cap`. The two Power BI projects use this.

Screenshots live in `assets/shots/` as JPEGs, resized to 1200px wide and saved at
quality 82 — around 100KB each rather than the 450KB the raw PNGs were. Worth
doing the same to anything you add; `System.Drawing` in PowerShell will do it
without installing anything.

To add a new filter category, add a `<button class="filter-btn" data-filter="…">`
to the filter row and use that value as a card's `data-category`.

---

## Still to do

Small things left deliberately undone, because they need information only you have:

- [ ] **Add your CV.** Drop the PDF at `assets/ibomeno-basiekanem-cv.pdf`, then
      uncomment the download button in `index.html` (search for `Download CV`).
- [x] ~~Add your LinkedIn.~~ Done — `linkedin.com/in/ibomeno-basiekanem`, in the
      contact section and in the structured data.
- [x] ~~Confirm your job title.~~ Done — see the note below.
- [ ] **Consider adding real figures.** The project write-ups describe what you
      did and what you found, without invented precision. If you have defensible
      numbers for the British Airways work, the experience section is where
      they'd carry the most weight.

- [ ] **Two fixes on the Tableau dashboards themselves** (not on this site):
      - Several KPI tiles render as `###` and `##` in Tableau's own thumbnails —
        that's a column-too-narrow artifact. Check whether it also shows at full
        size; if so, widen those tiles and republish. Re-download the thumbnails
        afterwards from `https://public.tableau.com/thumb/views/{Workbook}/{Sheet}`.
      - The Churn Rate dashboard's annotation reads *"the less likey it is"* —
        should be *likely*. It's on the canvas, so a recruiter will see it.

- [ ] **Add a description to two of the vizzes.** Only *Contact Centre Data Agent
      View* has one on Tableau Public. The other two are blank, which is a free
      opportunity to frame the work.

### Optional: a contact form that sends

The form currently opens the visitor's email client with a pre-filled message.
That works everywhere and stores nothing, but it does depend on them having a
mail client configured.

If you'd rather receive submissions directly, [Formspree](https://formspree.io)
has a free tier and works on a static site — create a form, then point the
`<form>` at your endpoint and swap the `mailto:` handler in `js/app.js` § 7 for
a `fetch()` POST.

---

## Two job titles, on purpose

The site uses **Customer Service Analyst** wherever it states the actual role at
British Airways — the hero sentence, the experience timeline, "At a glance", the
meta description and the `jobTitle` in the structured data.

It uses **Business Analyst** as the headline identity — the browser tab, the
`og:title`, the header subtitle and the hero eyebrow — because that's the
direction being targeted, reinforced by the "open to Business Analyst and Data
Analyst roles" line in the About section.

This is a deliberate split, not an oversight. If you'd rather it read as one
title throughout, the headline set is those four places.

## Notes on the design

- **Dark by default**, with a light theme that follows the system preference on
  first visit and remembers an explicit choice after that.
- **Accessibility**: all text clears WCAG AA (4.5:1) in both themes, the modal
  traps focus and closes on <kbd>Esc</kbd>, everything is keyboard reachable,
  and there's a skip link.
- **Motion**: the background animation and the terminal typing both respect
  `prefers-reduced-motion`, and the canvas pauses when the tab is hidden.
- **Print**: `Ctrl+P` gives a clean document — navigation, forms and animation
  are dropped, and link targets are printed after the link text.
