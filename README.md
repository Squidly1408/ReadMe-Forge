<p align="center">
  <img src="docs/social-preview.png" alt="Readme Forge: hammer out a polished GitHub README in minutes" width="100%" />
</p>

<p align="center">
  Build a polished GitHub README in your browser: pick a template, edit sections with a live preview, design a logo and banner, then export.
</p>

<p align="center">
  <a href="https://squidly1408.github.io/ReadMe-Forge/"><b>Open the app →</b></a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-ff6a2b?style=flat-square&labelColor=201c18" alt="MIT license"></a>
  <img src="https://img.shields.io/badge/tracking-none-ff6a2b?style=flat-square&labelColor=201c18" alt="No tracking">
  <a href="https://github.com/Squidly1408/ReadMe-Forge/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/Squidly1408/ReadMe-Forge/deploy.yml?branch=main&label=deploy&style=flat-square&labelColor=201c18" alt="Deploy status"></a>
</p>

![Readme Forge screenshot](docs/screenshot.png)

## Features

- **Templates**: 8 built-in starting points (Minimal, Standard, Open Source Pro, Library, CLI, Web App, API, GitHub Profile). Save your own layouts as reusable templates, and import or export them as JSON.
- **45+ ready-made sections**: badges, install steps, API reference, environment variables, roadmap, FAQ, contributors, star history and more.
- **Fill in once**: project name, tagline, repo and license are set in one place and dropped into every section through placeholders like `{{name}}`.
- **Live GitHub-style preview** in light and dark themes. Click any part of the preview to jump straight to its markdown.
- **Auto table of contents** built from your `##` headings.
- **Logo & Banner Studio**: generate a logo or upload your own, then make a matching README banner or a 1280×640 social preview image.
- **Export**: download `README.md`, or a `.zip` with your images in `assets/`.
- **Private**: no account and no server. Your work is saved in your browser's local storage.

## Getting started

Requires Node.js 18 or later.

```bash
git clone https://github.com/Squidly1408/ReadMe-Forge.git
cd ReadMe-Forge
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

| Command           | What it does                              |
| :---------------- | :---------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload      |
| `npm run build`   | Build a static site into `dist/`          |
| `npm run preview` | Serve the production build locally        |

## Keyboard shortcuts

| Keys                          | Action                    |
| :---------------------------- | :------------------------ |
| <kbd>Ctrl</kbd> <kbd>S</kbd>  | Download                  |
| <kbd>Ctrl</kbd> <kbd>B</kbd> / <kbd>I</kbd> / <kbd>K</kbd> | Bold / italic / link |
| <kbd>Alt</kbd> <kbd>↑</kbd> / <kbd>↓</kbd> | Move the selected section |
| <kbd>Esc</kbd>                | Close dialogs             |

## Deployment

The app builds to plain static files, so any static host works.

This repo deploys to **GitHub Pages** automatically on every push to `main` (see [.github/workflows/deploy.yml](.github/workflows/deploy.yml)). To use it on a fork, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## Project structure

```text
├── index.html          # App shell and dialogs
├── privacy.html        # Privacy Policy
├── terms.html          # Terms and Conditions
├── docs/               # Screenshot and social preview image
├── public/
│   └── favicon.svg     # Logo
├── src/
│   ├── main.js         # App state, sections, editor, preview, templates, export
│   ├── studio.js       # Logo & Banner Studio (canvas)
│   ├── library.js      # Section library and built-in templates
│   ├── shields.js      # Offline shields.io badge fallback
│   ├── util.js         # Shared helpers (storage, toasts, dialogs, downloads)
│   ├── legal.css       # Styles for the policy pages
│   └── styles.css
└── vite.config.js
```

To add a new section, add an entry to `LIB` in [src/library.js](src/library.js). To add a built-in template, add an entry to `BUILTINS` in the same file.

## Built with

- [Vite](https://vitejs.dev/), with no UI framework
- [marked](https://marked.js.org/) for markdown rendering
- [DOMPurify](https://github.com/cure53/DOMPurify) to sanitise the preview
- [JSZip](https://stuk.github.io/jszip/) for the .zip export

## Brand

<img src="public/favicon.svg" alt="Readme Forge logo" width="64" align="right" />

The logo is a markdown `#` drawn as an anvil: the top bar is the anvil face and horn, the strokes are the waist, and the tips glow like hot metal. The source is [public/favicon.svg](public/favicon.svg), and it switches colours for light and dark backgrounds.

| Role | Colour | Token |
| :-- | :-- | :-- |
| Ember (brand, primary actions) | `#ff6a2b` | `--accent` |
| Ember text (small orange text on dark) | `#ff8c5a` | `--accent-text` |
| Ink (logo, main text) | `#ece7dc` | `--text` |
| Background | `#100e0c` | `--bg` |
| Panel | `#181512` | `--panel` |

Every colour in the app is a CSS custom property in [src/styles.css](src/styles.css). Text and accent pairs meet WCAG AA contrast (4.5:1 or better). The README preview keeps GitHub's own colours so it matches what you'll see on GitHub. [docs/social-preview.png](docs/social-preview.png) is sized for **Settings → Social preview**.

## Privacy

Readme Forge has no server, accounts or analytics. Your work stays in your browser. See the [Privacy Policy](https://squidly1408.github.io/ReadMe-Forge/privacy.html) and [Terms and Conditions](https://squidly1408.github.io/ReadMe-Forge/terms.html), which are also linked inside the app.

## License

[MIT](LICENSE) © 2026 Lucas Newman
