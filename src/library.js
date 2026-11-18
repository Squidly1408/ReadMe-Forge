// ---------- Section library ----------
// Every block a README can be built from, plus the built-in templates.
// Tokens: {{name}} {{tagline}} {{user}} {{repo}} {{author}} {{license}} {{year}} {{logo}} {{banner}}
export const LIB = {
  // ---- Basics
  "title": { cat: "Basics", title: "Title & Description", md:
`# {{name}}

{{tagline}}` },
  "header-logo": { cat: "Visuals", title: "Logo Header (centered)", md:
`<p align="center">
  <img src="{{logo}}" alt="{{name}} logo" width="120" />
</p>

<h1 align="center">{{name}}</h1>

<p align="center">
  {{tagline}}
</p>

<p align="center">
  <a href="#installation">Installation</a> ·
  <a href="#usage">Usage</a> ·
  <a href="https://github.com/{{user}}/{{repo}}/issues">Report a bug</a>
</p>` },
  "banner": { cat: "Visuals", title: "Banner", md:
`![{{name}} banner]({{banner}})` },
  "banner-title": { cat: "Visuals", title: "Banner + Title", md:
`![{{name}} banner]({{banner}})

# {{name}}

{{tagline}}` },
  "badges": { cat: "Visuals", title: "Badges", md:
`[![License](https://img.shields.io/badge/license-{{licenseBadge}}-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/{{user}}/{{repo}}?style=flat)](https://github.com/{{user}}/{{repo}}/stargazers)
[![Issues](https://img.shields.io/github/issues/{{user}}/{{repo}})](https://github.com/{{user}}/{{repo}}/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)` },
  "toc": { cat: "Basics", title: "Table of Contents", md:
`## Table of Contents

<!-- auto-toc: this list is generated from your other section headings -->` },
  "features": { cat: "Basics", title: "Features", md:
`## Features

- ⚡ **Fast** — describe what makes it quick
- 🧩 **Modular** — plug in only what you need
- 🌗 **Light / dark mode**
- 📱 **Fully responsive**
- 🔒 **Secure by default**` },
  "demo": { cat: "Visuals", title: "Demo", md:
`## Demo

![Demo](./assets/demo.gif)

Try it live: [{{repo}}.vercel.app](https://{{repo}}.vercel.app)` },
  "screenshots": { cat: "Visuals", title: "Screenshots", md:
`## Screenshots

| Light | Dark |
| :---: | :---: |
| ![Light mode](./assets/screenshot-light.png) | ![Dark mode](./assets/screenshot-dark.png) |` },
  "tech": { cat: "Basics", title: "Tech Stack", md:
`## Tech Stack

**Client:** React, TypeScript, TailwindCSS

**Server:** Node, Express, PostgreSQL

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)` },
  "prerequisites": { cat: "Docs", title: "Prerequisites", md:
`## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [pnpm](https://pnpm.io/) (or npm / yarn)
- A PostgreSQL database` },
  "installation": { cat: "Basics", title: "Installation", md:
`## Installation

Install {{name}} with npm:

~~~bash
npm install {{repo}}
~~~` },
  "run-locally": { cat: "Docs", title: "Run Locally", md:
`## Run Locally

Clone the project

~~~bash
git clone https://github.com/{{user}}/{{repo}}.git
~~~

Go to the project directory

~~~bash
cd {{repo}}
~~~

Install dependencies

~~~bash
npm install
~~~

Start the server

~~~bash
npm run dev
~~~` },
  "usage": { cat: "Basics", title: "Usage / Examples", md:
`## Usage

~~~javascript
import { create } from '{{repo}}'

const app = create({ debug: true })
app.start()
~~~` },
  "examples": { cat: "Docs", title: "More Examples", md:
`## Examples

<details>
<summary><b>Basic example</b></summary>

~~~javascript
// minimal setup
~~~

</details>

<details>
<summary><b>Advanced example</b></summary>

~~~javascript
// with plugins and custom config
~~~

</details>` },
  "api": { cat: "Docs", title: "API Reference", md:
`## API Reference

#### Get all items

~~~http
GET /api/items
~~~

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| \`api_key\` | \`string\` | **Required**. Your API key |

#### Get item

~~~http
GET /api/items/\${id}
~~~

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| \`id\`      | \`string\` | **Required**. Id of item to fetch |` },
  "env": { cat: "Docs", title: "Environment Variables", md:
`## Environment Variables

To run this project, add the following variables to your \`.env\` file:

| Variable | Description | Example |
| :-- | :-- | :-- |
| \`API_KEY\` | Key for the external API | \`sk_live_…\` |
| \`DATABASE_URL\` | Postgres connection string | \`postgres://…\` |` },
  "config": { cat: "Docs", title: "Configuration", md:
`## Configuration

Create a \`{{repo}}.config.json\` in your project root:

~~~json
{
  "theme": "dark",
  "output": "./dist",
  "plugins": []
}
~~~

| Option | Default | Description |
| :-- | :-- | :-- |
| \`theme\` | \`"light"\` | Color theme |
| \`output\` | \`"./build"\` | Output directory |` },
  "structure": { cat: "Docs", title: "Project Structure", md:
`## Project Structure

~~~text
{{repo}}/
├── src/
│   ├── components/
│   ├── lib/
│   └── index.ts
├── tests/
├── public/
├── package.json
└── README.md
~~~` },
  "docker": { cat: "Docs", title: "Docker", md:
`## Docker

~~~bash
docker build -t {{repo}} .
docker run -p 3000:3000 --env-file .env {{repo}}
~~~

Or with Compose:

~~~bash
docker compose up -d
~~~` },
  "deployment": { cat: "Docs", title: "Deployment", md:
`## Deployment

To deploy this project run

~~~bash
npm run deploy
~~~

[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/new)` },
  "tests": { cat: "Docs", title: "Running Tests", md:
`## Running Tests

To run tests, run the following command

~~~bash
npm run test
~~~` },
  "docs": { cat: "Docs", title: "Documentation", md:
`## Documentation

Full documentation lives at **[{{repo}}.dev/docs](https://{{repo}}.dev/docs)**.` },
  "benchmarks": { cat: "Project", title: "Benchmarks", md:
`## Benchmarks

| Library | ops/sec | Relative |
| :-- | --: | --: |
| **{{name}}** | **1,240,000** | **1.00×** |
| other-lib | 860,000 | 0.69× |
| legacy-lib | 310,000 | 0.25× |` },
  "optimizations": { cat: "Project", title: "Optimizations", md:
`## Optimizations

What did you optimize in your code? E.g. refactors, performance improvements, accessibility.` },
  "roadmap": { cat: "Project", title: "Roadmap", md:
`## Roadmap

- [x] Initial release
- [x] Dark mode
- [ ] Plugin system
- [ ] i18n support
- [ ] Mobile app` },
  "changelog": { cat: "Project", title: "Changelog", md:
`## Changelog

### v1.1.0 — {{year}}
- Added …
- Fixed …

### v1.0.0
- Initial release

See [CHANGELOG.md](CHANGELOG.md) for the full history.` },
  "lessons": { cat: "Project", title: "Lessons Learned", md:
`## Lessons Learned

What did you learn while building this project? What challenges did you face and how did you overcome them?` },
  "color-reference": { cat: "Project", title: "Color Reference", md:
`## Color Reference

| Color | Hex |
| :-- | :-- |
| Primary | ![#0a192f](https://img.shields.io/badge/-%230a192f-0a192f?style=flat-square) \`#0a192f\` |
| Accent | ![#64ffda](https://img.shields.io/badge/-%2364ffda-64ffda?style=flat-square) \`#64ffda\` |
| Text | ![#ccd6f6](https://img.shields.io/badge/-%23ccd6f6-ccd6f6?style=flat-square) \`#ccd6f6\` |` },
  "faq": { cat: "Community", title: "FAQ", md:
`## FAQ

<details>
<summary><b>Is it free?</b></summary>

Yes — {{name}} is open source under the {{license}} license.
</details>

<details>
<summary><b>Does it work with TypeScript?</b></summary>

Yes, types are included.
</details>` },
  "contributing": { cat: "Community", title: "Contributing", md:
`## Contributing

Contributions are always welcome!

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/amazing\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing\`)
5. Open a pull request

See \`CONTRIBUTING.md\` for ways to get started, and please follow the [code of conduct](CODE_OF_CONDUCT.md).` },
  "contributors": { cat: "Community", title: "Contributors", md:
`## Contributors

<a href="https://github.com/{{user}}/{{repo}}/graphs/contributors">
  <img src="https://contrib.rocks/image?repo={{user}}/{{repo}}" alt="Contributors" />
</a>` },
  "coc": { cat: "Community", title: "Code of Conduct", md:
`## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/). By participating you agree to uphold it.` },
  "security": { cat: "Community", title: "Security", md:
`## Security

If you discover a security vulnerability, please **do not** open a public issue. Email the maintainers instead and we'll respond within 48 hours. See [SECURITY.md](SECURITY.md).` },
  "support": { cat: "Community", title: "Support", md:
`## Support

For support, open a [discussion](https://github.com/{{user}}/{{repo}}/discussions) or join our Discord.

If this project helps you, consider giving it a ⭐!` },
  "feedback": { cat: "Community", title: "Feedback", md:
`## Feedback

If you have any feedback, please open an issue or reach out to {{author}}.` },
  "sponsors": { cat: "Community", title: "Sponsors", md:
`## Sponsors

Support this project by [becoming a sponsor](https://github.com/sponsors/{{user}}). Your logo will show up here.` },
  "star-history": { cat: "Community", title: "Star History", md:
`## Star History

[![Star History Chart](https://api.star-history.com/svg?repos={{user}}/{{repo}}&type=Date)](https://star-history.com/#{{user}}/{{repo}}&Date)` },
  "used-by": { cat: "Community", title: "Used By", md:
`## Used By

This project is used by the following companies:

- Company 1
- Company 2` },
  "related": { cat: "Community", title: "Related", md:
`## Related

Here are some related projects:

- [Awesome README](https://github.com/matiassingers/awesome-readme)` },
  "authors": { cat: "Community", title: "Authors", md:
`## Authors

- [@{{user}}](https://github.com/{{user}}) — {{author}}` },
  "acknowledgements": { cat: "Community", title: "Acknowledgements", md:
`## Acknowledgements

- [Awesome Readme Templates](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
- [Shields.io](https://shields.io)
- [readme.so](https://readme.so)` },
  "appendix": { cat: "Project", title: "Appendix", md:
`## Appendix

Any additional information goes here.` },
  "license": { cat: "Basics", title: "License", md:
`## License

Distributed under the [{{license}}](LICENSE) license. © {{year}} {{author}}` },
  // ---- Profile
  "profile-hi": { cat: "Profile", title: "Profile: Greeting", md:
`# Hi, I'm {{author}}! 👋

{{tagline}}` },
  "profile-about": { cat: "Profile", title: "Profile: About Me", md:
`## 🚀 About Me

- 🔭 I'm currently working on **{{name}}**
- 🌱 I'm learning Rust and distributed systems
- 👯 I'm looking to collaborate on open source
- 💬 Ask me about web performance
- ⚡ Fun fact: …` },
  "profile-skills": { cat: "Profile", title: "Profile: Skills", md:
`## 🛠 Skills

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)` },
  "profile-stats": { cat: "Profile", title: "Profile: GitHub Stats", md:
`## 📊 GitHub Stats

![Stats](https://github-readme-stats.vercel.app/api?username={{user}}&show_icons=true&theme=transparent)
![Top languages](https://github-readme-stats.vercel.app/api/top-langs/?username={{user}}&layout=compact&theme=transparent)` },
  "profile-links": { cat: "Profile", title: "Profile: Links", md:
`## 🔗 Links

[![Portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://example.com)
[![LinkedIn](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/{{user}})
[![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/{{user}})` },
  "custom": { cat: "Basics", title: "Custom Section", md:
`## New Section

Write anything here.` },
};

export const BUILTINS = [
  { id: "b-minimal", name: "Minimal", desc: "Just the essentials.", keys: ["title","installation","usage","license"] },
  { id: "b-standard", name: "Standard", desc: "The classic readme.so layout.", keys: ["title","badges","features","tech","installation","usage","contributing","license"] },
  { id: "b-oss", name: "Open Source Pro", desc: "Logo header, TOC, roadmap, contributors.", keys: ["header-logo","badges","toc","features","demo","tech","prerequisites","installation","usage","env","roadmap","contributing","contributors","license","acknowledgements"] },
  { id: "b-library", name: "Library / Package", desc: "API docs, examples, benchmarks.", keys: ["banner-title","badges","installation","usage","api","examples","benchmarks","contributing","changelog","license"] },
  { id: "b-cli", name: "CLI Tool", desc: "Demo GIF, install, flags, FAQ.", keys: ["title","badges","demo","installation","usage","config","faq","license"] },
  { id: "b-webapp", name: "Web App", desc: "Banner, screenshots, run locally, deploy.", keys: ["banner-title","screenshots","features","tech","run-locally","env","deployment","tests","roadmap","authors","license"] },
  { id: "b-api", name: "API Service", desc: "Endpoints, env, Docker, security.", keys: ["title","badges","docs","api","env","docker","tests","security","license"] },
  { id: "b-profile", name: "GitHub Profile", desc: "For your username/username repo.", keys: ["profile-hi","profile-about","profile-skills","profile-stats","profile-links"] },
].map(t => ({ ...t, builtin: true, sections: t.keys.map(k => ({ key: k, title: LIB[k].title, md: LIB[k].md })) }));
