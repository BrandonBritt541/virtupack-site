# VirtuPack Landing Page

Static landing page for [VirtuPack](https://virtupack.co) — a CAD-driven virtual packaging engineering platform.

---

## File Structure

```
project-root/
├── index.html
├── style.css
├── script.js
├── netlify.toml
├── assets/
│   └── logo.png      ← place your logo here
└── README.md
```

---

## Setup Instructions

### 1. Add Your Logo

Place your `logo.png` file inside the `/assets/` directory:

```
assets/logo.png
```

The logo is referenced in two places in `index.html`:
- The sticky navbar (36px tall)
- The hero section (110px tall)

The logo will also receive a faint blue glow in the hero via CSS `drop-shadow`.

---

### 2. Deploy to Netlify via GitHub

1. Push this repository to GitHub (e.g. `github.com/yourorg/virtupack-site`).
2. Log in to [Netlify](https://app.netlify.com).
3. Click **"Add new site" → "Import an existing project"**.
4. Select **GitHub** and authorise Netlify.
5. Choose your `virtupack-site` repository.
6. Configure build settings:
   - **Build command:** *(leave blank — this is a static site)*
   - **Publish directory:** `.` (a single dot — the repo root)
7. Click **"Deploy site"**.

Netlify will automatically detect `netlify.toml` and apply the security headers.

---

### 3. Connect the `virtupack.co` Custom Domain in Netlify

1. In your Netlify site dashboard, go to **"Domain management"**.
2. Click **"Add a domain"** and enter `virtupack.co`.
3. Netlify will display DNS records to add. In your domain registrar's DNS panel, add:
   - **A record:** `@` → Netlify load balancer IP (shown in dashboard)
   - **CNAME record:** `www` → your Netlify subdomain (e.g. `your-site-name.netlify.app`)
4. Click **"Verify DNS configuration"** in Netlify.
5. Once DNS propagates (up to 48 hours), Netlify will automatically provision a free **Let's Encrypt TLS certificate**.
6. Enable **"Force HTTPS"** in the domain settings panel.

---

### 4. Replace Analytics Placeholder IDs

#### Google Analytics 4 (GA4)

1. Go to [Google Analytics](https://analytics.google.com) and create (or open) a GA4 property.
2. Navigate to **Admin → Data Streams → Web** and copy your **Measurement ID** (format: `G-XXXXXXXXXX`).
3. In `index.html`, replace **both** occurrences of `G-XXXXXXXXXX` with your real ID:

```html
<!-- Before -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
...
gtag('config', 'G-XXXXXXXXXX');

<!-- After -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-A1B2C3D4E5"></script>
...
gtag('config', 'G-A1B2C3D4E5');
```

#### Microsoft Clarity

1. Go to [Microsoft Clarity](https://clarity.microsoft.com) and create a new project for `virtupack.co`.
2. Copy the **Project ID** (format: a short alphanumeric string).
3. In `index.html`, replace `XXXXXXXXXX` in the Clarity snippet:

```html
<!-- Before -->
})(window, document, "clarity", "script", "XXXXXXXXXX");

<!-- After -->
})(window, document, "clarity", "script", "abc123xyz0");
```

---

## Netlify Form Setup

The contact form uses Netlify Forms — no backend required.

- Form submissions are captured automatically after deployment.
- View submissions at: **Netlify dashboard → Forms**.
- To set up email notifications: **Forms → yourform → Form notifications → Add notification → Email**.

The honeypot field (`bot-field`) is already wired in to reduce spam.

---

## Three.js Animation Placeholder

The div:

```html
<div id="unbox-reveal" style="width:100%; height:500px;"></div>
```

is reserved for a future Three.js unbox reveal animation. Drop your Three.js script into `script.js` or a separate file and target `#unbox-reveal` as the mount point.

---

## Security Headers

All headers are configured in `netlify.toml` and applied globally:

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, mic, geolocation blocked |
| `Content-Security-Policy` | self + GA4 + Clarity + Google Fonts |

---

## Local Development

No build tools required. Open `index.html` directly in a browser, or run a simple local server:

```bash
# Python
python3 -m http.server 3000

# Node (npx)
npx serve .
```

Then visit `http://localhost:3000`.
