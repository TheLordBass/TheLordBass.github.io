# thelordbass.github.io

Personal portfolio site for Ibomeno Basiekanem, Data Analyst.
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
assets/shots/       dashboard screenshots used on cards and in write-ups
assets/og-image.png link preview image (1200x630) for LinkedIn, Slack etc.
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
   `sql`, `bi`, `python`, `excel` so the filter picks it up, and set
   `data-project` to a new unique key.

   **Card order matters.** Featured cards (`.is-featured`) span two of the three
   grid columns, so each one must be followed by an ordinary one-column card or
   the grid leaves a visible hole. Current pattern: featured, normal, repeated
   five times, then the rest. Only give a card `.is-featured` if it
   has a screenshot — a double-width card with no image reads as a gap.

   Use `.project-repo` for a GitHub link or `.project-viz` for something live
   people can open, like DataBites; the latter renders with a green "live" dot.
   Give that project's `PROJECTS` entry a `live` URL and a `liveLabel` as well,
   so the modal leads with it and keeps GitHub as the second button.
2. **Write-up** — add an entry to `PROJECTS` in `js/app.js` using the same key.
   Supported block types are `p` (array of paragraphs), `list` (array of bullet
   points, HTML allowed) and `code` (a preformatted snippet).

   Add a `gallery` array to the entry to show screenshots above the write-up —
   each item takes `src`, `alt` and `cap`. The dashboard projects use this.

Screenshots live in `assets/shots/` as JPEGs, resized to 1200–1400px wide at
quality 84, which lands around 50–150KB each. Worth doing the same to anything
you add; `System.Drawing` in PowerShell will do it without installing anything.

To add a new filter category, add a `<button class="filter-btn" data-filter="…">`
to the filter row and use that value as a card's `data-category`.

---

## Contact form

The form opens the visitor's email client with a pre-filled message. That works
everywhere and stores nothing, but it does depend on them having a mail client
configured.

If you'd rather receive submissions directly, [Formspree](https://formspree.io)
has a free tier and works on a static site: create a form, point the `<form>` at
your endpoint and swap the `mailto:` handler in `js/app.js` § 7 for a `fetch()`
POST.

---

## Job titles

**Data Analyst** is the headline identity: browser tab, `og:title`, the hero
eyebrow and the link preview image.

**Customer Service Analyst** is used wherever the site states the actual role at
British Airways: "At a glance", the experience entry, the hero terminal and the
`jobTitle` in the structured data.

## Keeping this in sync with the CV

The site is deliberately about me, and the job detail lives in
`assets/ibomeno-basiekanem-cv.pdf`. If you revise the CV, these are the places
that carry the same facts and can drift:

| CV content | Where it appears on the site |
|---|---|
| Headline title | `<title>`, `og:title`, `.hero .eyebrow`, `assets/og-image.png` |
| Core skills (6 groups) | the six `.skill-card` blocks |
| Role, dates, employer | experience section, "At a glance", JSON-LD `jobTitle` |
| Anything factual | the hero terminal script in `js/app.js` § 3 |

**Note on the published CV:** it includes a phone number. That was a deliberate
choice, since a downloadable CV on a public site will be scraped. To change it
later, replace the PDF at the same path and the download links keep working.

## Link preview image

`assets/og-image.png` is what LinkedIn, Slack, WhatsApp and the rest show when
someone shares the link. It was drawn with `System.Drawing` in PowerShell in the
site's colours, so if the name, title or tagline change, regenerate it too.
LinkedIn caches previews; after changing it, run the URL through
https://www.linkedin.com/post-inspector/ to refresh.

## The design

It's a TUI. Not a "cyber" theme. The references are tools people actually use:
tmux status lines, lazygit panes, vim gutters, `psql` output, k9s tables.

- **Palette** shares its ground and accent with
  [DataBites](https://thelordbass.github.io/databites/), so moving between the
  two feels like one place. Light-mode colours used as text are darkened to
  clear WCAG AA, noted in the token block in `style.css`.
- **Type** is IBM Plex Mono throughout. A terminal has one font; committing to
  that is the point.
- **Chrome**: numbered tab bar at the top, fixed status line at the bottom
  showing the current section and scroll position, `┌─ label ───` pane rules,
  `▸` markers instead of bullets, `├─ └─` tree glyphs on the timeline, and
  inverse-video for anything selected.
- **No background animation.** A faint character-cell grid in CSS instead.

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

## Other notes

- **Dark by default**, with a light theme that follows the system preference on
  first visit and remembers an explicit choice after that.
- **Accessibility**: all text clears WCAG AA (4.5:1) in both themes, the modal
  traps focus and closes on <kbd>Esc</kbd>, everything is keyboard reachable,
  and there's a skip link.
- **Motion**: the terminal typing respects `prefers-reduced-motion`.
- **Print**: `Ctrl+P` gives a clean document — navigation, forms and animation
  are dropped, and link targets are printed after the link text.
