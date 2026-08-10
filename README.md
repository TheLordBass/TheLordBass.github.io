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

   **Card order matters.** Featured cards (`.is-featured`) span two of the three
   grid columns, so each one must be followed by an ordinary one-column card or
   the grid leaves a visible hole. Current pattern: featured, normal, featured,
   normal, featured, normal, then the rest. Only give a card `.is-featured` if it
   has a screenshot — a double-width card with no image reads as a gap.

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

- [x] ~~Add your CV.~~ Done — `assets/ibomeno-basiekanem-cv.pdf`, linked from the
      hero and the contact section.
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

This mirrors the CV, which does exactly the same thing.

**Data Analyst** is the headline identity — browser tab, `og:title`, header
subtitle, hero eyebrow. That's what the CV leads with and what's being targeted.

**Customer Service Analyst** is used wherever the site states the actual role at
British Airways — the hero sentence, the experience timeline, "At a glance", the
meta description and the `jobTitle` in the structured data.

Deliberate, not an oversight. If you ever want one title throughout, the headline
set is those four places.

## Keeping this in sync with the CV

The site is aligned to `assets/ibomeno-basiekanem-cv.pdf`. If you revise the CV,
these are the places that carry the same facts and will drift:

| CV content | Where it appears on the site |
|---|---|
| Headline title | `<title>`, `og:title`, `.brand-text span`, `.hero .eyebrow` |
| Professional summary | `.hero-lede`, the About `.prose` paragraphs |
| Core skills (6 groups) | the six `.skill-card` blocks |
| British Airways bullets | `.timeline-context` + `.timeline-points` |
| Role, dates, employer | timeline, "At a glance", JSON-LD `jobTitle` |
| Headline numbers | `.hero-facts` (100+ agents, 4 dashboards, ~1 day/week) |
| Anything factual | the hero terminal script in `js/app.js` § 3 |

**Note on the published CV:** it includes a phone number. That was a deliberate
choice — a downloadable CV on a public site will be scraped. To change it later,
replace the PDF at the same path and the two download links keep working.

## The design

It's a TUI. Not a "cyber" theme — the references are tools people actually use:
tmux status lines, lazygit panes, vim gutters, `psql` output, k9s tables.

- **Palette** is [gruvbox](https://github.com/morhetz/gruvbox) (Pavel Pertsev),
  picked because it's warm, specific and nothing like a framework default.
  Three of its light-mode colours were darkened to clear WCAG AA — noted in the
  token block in `style.css`.
- **Type** is IBM Plex Mono throughout. A terminal has one font; committing to
  that is the point.
- **Chrome**: numbered tab bar at the top, fixed status line at the bottom
  showing the current section and scroll position, `┌─ label ───` pane rules,
  `▸` markers instead of bullets, `├─ └─` tree glyphs on the timeline, and
  inverse-video for anything selected.
- **No background animation.** The floating-particle canvas that used to be
  here was replaced by a faint character-cell grid in CSS.

### Keyboard

The site is keyboard-driven, which is the part that makes it a tool rather than
a picture of one. `1`–`5` jump to sections, `j`/`k` step through them, `g`/`G`
go to top and bottom, `/` jumps to the project filter, `t` toggles the theme,
`?` shows the shortcut panel and `Esc` closes anything.

Every binding is a no-op while focus is in a text field, so typing a message in
the contact form never triggers a jump. `Esc` from a field blurs it rather than
trapping you. Bindings are defined in `js/app.js` § 2b.

### Terminal lines

`.t-line` uses `white-space: pre` — terminals don't reflow, and wrapping would
break the column alignment that makes the output read as a query result. Keep
new script lines to **about 40 characters** or they'll scroll sideways.

## Notes on the earlier design

- **Dark by default**, with a light theme that follows the system preference on
  first visit and remembers an explicit choice after that.
- **Accessibility**: all text clears WCAG AA (4.5:1) in both themes, the modal
  traps focus and closes on <kbd>Esc</kbd>, everything is keyboard reachable,
  and there's a skip link.
- **Motion**: the background animation and the terminal typing both respect
  `prefers-reduced-motion`, and the canvas pauses when the tab is hidden.
- **Print**: `Ctrl+P` gives a clean document — navigation, forms and animation
  are dropped, and link targets are printed after the link text.
