# aalvi.com — Personal Portfolio

A minimalist personal portfolio website built with pure HTML, CSS, and vanilla JavaScript. All content is driven by a single `data/content.json` file, editable via the built-in admin panel.

## Quick Start

1. **Clone the repo**
2. **Serve locally:**
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

## Managing Content

1. Open `http://localhost:8000/admin.html`
2. Password: `aalvi2025`
3. Edit content in any tab
4. Click **Export JSON** to download the updated `content.json`
5. Replace `data/content.json` with the downloaded file
6. Commit and push — your site updates automatically

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Your site will be live at `https://yourusername.github.io/repo-name/`

For a custom domain (aalvi.com), add a `CNAME` file with `aalvi.com` and configure DNS.

## Structure

```
├── index.html          # Main website (SPA)
├── admin.html          # Admin panel (local use)
├── css/style.css       # All styles
├── js/
│   ├── app.js          # Main app logic & routing
│   ├── data.js         # Data loader
│   └── admin.js        # Admin panel logic
├── data/
│   └── content.json    # All content (edit via admin)
└── tools/              # Interactive tools (Span, Transformations)
```

## Adding Your Tools

Copy your existing Span and Transformations tool files into `tools/span/` and `tools/transformations/` respectively. The main site will link to them automatically.

## Tech

- Zero dependencies, zero build step
- Pure HTML + CSS + vanilla JS
- JSON-driven content
- Responsive design (mobile, tablet, desktop)
- Dark minimalist theme
