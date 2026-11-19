<p align="center">
  <img src="public/favicon.svg" alt="Readme Forge logo" width="96" />
</p>

<h1 align="center">Readme Forge</h1>

<p align="center">
  Build a polished GitHub README in your browser: pick a template, edit sections with a live preview, design a logo and banner, then export.
</p>

<p align="center">
  <a href="https://squidly1408.github.io/ReadMe-Forge/"><b>Open the app →</b></a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
  <a href="https://github.com/Squidly1408/ReadMe-Forge/actions/workflows/deploy.yml"><img src="https://github.com/Squidly1408/ReadMe-Forge/actions/workflows/deploy.yml/badge.svg" alt="Deploy status"></a>
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

## Privacy

Readme Forge has no server, accounts or analytics. Your work stays in your browser. See the [Privacy Policy](https://squidly1408.github.io/ReadMe-Forge/privacy.html) and [Terms and Conditions](https://squidly1408.github.io/ReadMe-Forge/terms.html), which are also linked inside the app.

## License

[MIT](LICENSE) © 2026 Lucas Newman
