# Uma Churrasqueira — Setup Guide

## What's in this folder

```
uma-churrasqueira/
├── index.html              ← Main website (open this in browser)
├── menu.html               ← Full menu page
├── admin.html              ← Restaurant admin dashboard
├── css/
│   ├── style.css
│   └── menu.css
├── js/
│   ├── main.js             ← 3D hero animation (Three.js)
│   ├── menu.js             ← Menu tabs
│   ├── reservation.js      ← Reservation form
│   └── admin.js            ← Admin dashboard
├── google-apps-script.js   ← Paste into Google Apps Script
└── SETUP.md                ← This file
```

---

## Step 1 — Open the site locally

Double-click `index.html` to open it in your browser. Everything works offline except the reservation form (which needs the Google Sheet setup below).

---

## Step 2 — Set up Google Sheets for reservations

**Takes about 10 minutes. Only needs to be done once.**

### 2a. Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Rename the first sheet tab (bottom) to: **Reservations**

### 2b. Create the Apps Script
1. In the spreadsheet, click **Extensions → Apps Script**
2. Delete all the default code in the editor
3. Open `google-apps-script.js` from this folder and paste its contents
4. Click **Save** (floppy disk icon)
5. Name the project: `Uma Churrasqueira`

### 2c. Deploy as Web App
1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type" → choose **Web app**
3. Fill in:
   - Description: `Uma Churrasqueira Reservations`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** → choose your Google account → Allow
6. Copy the **Web app URL** — it looks like: `https://script.google.com/macros/s/ABC.../exec`

### 2d. Add the URL to the website files

Open `js/reservation.js` and replace this line:
```js
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```
With your actual URL:
```js
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

Do the same in `js/admin.js` — find the same line and replace it.

---

## Step 3 — Change the admin password

Open `js/admin.js` and find:
```js
const ADMIN_PASSWORD = 'uma2026';
```
Change `uma2026` to whatever password you want.

---

## Step 4 — Deploy to Netlify (free hosting)

1. Go to [netlify.com](https://netlify.com) and create a free account
2. Click **Add new site → Deploy manually**
3. Drag and drop the entire `uma-churrasqueira/` folder onto the page
4. Your site is live at: `https://something-random.netlify.app`
5. In Netlify settings, click **Site configuration → Change site name** to customize the URL

### Add a custom domain (optional, ~€10/year)
1. Buy a domain from [namecheap.com](https://namecheap.com) e.g. `umachurrasqueira.pt`
2. In Netlify: **Domain management → Add a domain**
3. Follow their 3-step DNS instructions — takes 10 minutes

---

## Step 5 — How reservations work day-to-day

1. Customer fills the form on the website
2. It appears instantly in your Google Sheet
3. Open **admin.html** (bookmark it), enter password
4. See all bookings — approve or reject with an optional comment
5. Customer does NOT get an automatic email yet (that requires email setup — ask if you want it added)

---

## Customizing the site

| What to change | Where to change it |
|---|---|
| Restaurant name/phone | `index.html` and `menu.html` |
| Colors | `css/style.css` — the `:root` variables at the top |
| Menu items/prices | `menu.html` |
| Admin password | `js/admin.js` — `ADMIN_PASSWORD` |
| Opening hours | `index.html` footer section |

---

## Need help?

Call the developer or open `index.html` and everything is self-contained — no accounts needed to run it locally.
