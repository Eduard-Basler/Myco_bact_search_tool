# 🔬 Mycobacterium Target Discovery & Literature Intelligence Atlas (Online Edition)

A 100% client-side, zero-backend web application for **mycobacterial CRISPRi knockdown target discovery and antibiotic resistance sensitization screens** (*Mycobacterium tuberculosis* H37Rv & *Mycobacterium smegmatis* MC2 155).

---

## 🚀 How to Host on GitHub (2 Minutes)

This folder contains the complete, self-contained web app:
- `index.html` — Application structure, filters, and literature viewer.
- `style.css` — Modern responsive theme.
- `app.js` — All 147 curated targets, landmark paper citations, PEBBLE phenotypes, auto-paired drugs, and Gemini 3.8 Flash evaluation logic.
- `.nojekyll` — Ensures GitHub Pages serves all assets directly without Jekyll processing.

### Option A: Upload via GitHub Website (No Command Line Needed)
1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `mycobacterium-target-atlas`). Set it to **Public**.
2. On the next screen, click **"uploading an existing file"**.
3. Drag and drop all files from this folder (`index.html`, `style.css`, `app.js`, `.nojekyll`, and `README.md`) into GitHub.
4. Click **Commit changes**.
5. In your repo, go to **Settings** ➔ **Pages** (in the left sidebar).
6. Under **Branch**, select `main` (or `master`) and folder `/(root)`, then click **Save**.
7. In ~1 minute, your app will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

### Option B: Upload via Git Command Line
```bash
cd Mycobacterium_Target_Atlas_Online
git init
git add .
git commit -m "Initial release of Mycobacterium Target Atlas"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```
Then enable GitHub Pages under **Settings** ➔ **Pages** as described above.

---

## 🔑 How the Google Gemini API Key Works

### ⚠️ Security Notice for Public GitHub Repositories
**Never commit your personal secret API key into a public GitHub repository!**
- GitHub runs automated Secret Scanning. If an active Google API key is detected in public code, Google and GitHub will automatically revoke it within minutes to protect your account.
- Additionally, malicious web scrapers could extract the key and exhaust your quota.

### 🛡️ How This Web App Handles Keys Safely:
1. **Zero Tokens / Zero Key Needed for Core Browsing**:
   - All 147 genes, their auto-paired synergistic antibiotics, PEBBLE transposon phenotypes, landmark paper citations, Uni Basel VPN DOI links, and pre-computed AI viability scores (1–10) are pre-bundled in `app.js`.
   - **Any visitor can use 100% of the target matrix and read the literature without entering any API key!**
2. **Client-Side "Bring Your Own Key" (BYOK) for Live AI**:
   - If a user wants to run live autonomous evaluations or ask follow-up questions to the papers using Gemini 3.8 Flash, they click **"🔑 Set Gemini Key"** in the top right.
   - The key is saved strictly in their own browser (`localStorage`). It is **never** transmitted to GitHub, any server, or anyone else.
   - Anyone can get a free personal Gemini API key in 30 seconds at [Google AI Studio](https://aistudio.google.com/).

### 🔒 Optional: Using a Shared Key in a Private Repository
If you are hosting this in a **private** repository or behind an institutional intranet and want to embed a pre-configured key so users don't need to enter one:
1. Open `app.js`.
2. Locate line `4758`:
   ```javascript
   geminiApiKey: localStorage.getItem("gemini_api_key") || "YOUR_GEMINI_API_KEY_HERE"
   ```
3. Replace `""` with your API key string and save.

---

## 🌟 App Features
- **147 Curated Mycobacterial Targets**: Pre-indexed with accurate Rv IDs, MSMEG IDs, and PEBBLE essentiality calls.
- **Auto-Paired Antibiotics**: Each target is matched with its validated synergistic antimicrobial (Meropenem, Isoniazid, Rifampicin, Bedaquiline, Moxifloxacin, Linezolid, Clofazimine, Telacebec, etc.).
- **Landmark Papers**: Citing high-impact literature (*Science*, *Nature*, *PLoS Pathog*, *AAC*, *J Bacteriol*) with direct DOI links formatted for University of Basel institutional access (`vpn.unibas.ch`).
- **AI Scorecards & sgRNA Advice**: Pre-computed viability score (1–10) and specific PAM design tips (e.g. mismatched PAM for hypomorphic titration of essentials).
- **1-Click CSV Export**: Export any filtered view to CSV for lab notebook or wet-lab experimental planning.
