# Job Application & Analytics Portal

A mobile-friendly **Job Application Tracker** prototype with a dark mode / neon green theme. Built for **IMS566 Advanced Web Design Development and Content Management** (Individual Project, 20%).

It is a front-end only prototype: authentication and data are simulated with the browser's `localStorage` (no database or server).

- **Live website (GitHub Pages):** `https://<your-username>.github.io/<repository-name>/`
- **GitHub repository:** `https://github.com/<your-username>/<repository-name>`

## Features Included

1. **Authentication (index.html)**
   - Toggleable Login and Register forms with Bootstrap alerts for errors and success.
   - Registration checks matching passwords (min. 6 characters) and blocks duplicate e-mails/usernames.
   - "Remember Me" saves and auto-fills the e-mail; session guard redirects visitors who are not logged in; Logout clears the session.
2. **Consistent, responsive navigation and footer** on every page: clickable logo (back to Dashboard), links to all pages, collapsing mobile menu, and a footer with owner contact details, quick links and copyright.
3. **Dashboard (dashboard.html)**
   - KPI cards: Total Companies, Total Applications, Pending, Accepted, Rejected.
   - 3 Chart.js charts built from the stored data:
     - Bar chart: simulated Google ratings of the companies.
     - Pie chart: application status distribution with percentages.
     - Line chart: monthly application submissions for 2026.
   - Editable profile (photo upload preview, resume upload/download, name, skills, education, address, about me) saved in `localStorage`.
4. **Applications (applications.html) - Data View 1: table**
   - Add, Edit and Delete (with confirmation) via a modal form.
   - Search, filter by company and status, and click-to-sort columns.
5. **Companies (companies.html) - Data View 2: grid cards**
   - 8 Malaysian companies (Maybank, PETRONAS, CIMB Group, Telekom Malaysia, Tenaga Nasional Berhad, AirAsia, Shopee, Grab) with logo, industry, location, description, simulated Google rating, review count and open positions.
   - Search, filter by industry and location, sort by rating or name.
   - View Details modal, Add/Edit/Delete with logo upload preview, and "Mohon Sekarang" which opens the Applications form pre-filled with the company.
6. **Content management:** every page has a `<title>`, `<meta name="description">`, `<meta name="viewport">`, semantic HTML5 sections and commented code.

> Google ratings, review counts and open positions are **simulated demo data**, not real figures.

## How to Test Login

| Account | E-mail / Username | Password |
|---|---|---|
| Default (hardcoded) | `admin@jobanalytics.com` or `admin` | `admin123` |
| Your own | Click **Register new Account**, register, then log in | the password you chose |

Test the error feedback by entering a wrong password: a red alert explains what went wrong.
To reset all demo data, clear the site's data in Chrome (DevTools > Application > Local Storage > Clear).

## Frameworks / Libraries Used

- **Bootstrap 5.3** (CSS + JS bundle via CDN): grid, navbar, modals, forms, tables
- **Chart.js 4** (CDN): interactive charts
- **Font Awesome 6** (CDN): icons
- **Google Fonts (Inter)**
- Custom CSS (`css/style.css`) and vanilla JavaScript

## Folder Structure

```
job-application-website/
├── index.html          Login & Register
├── dashboard.html      Dashboard, charts, profile
├── applications.html   Data view 1: applications table
├── companies.html      Data view 2: company grid cards
├── css/
│   └── style.css       Dark neon theme overriding Bootstrap
├── image/
│   └── logo_website.png  Website logo
├── js/
│   ├── auth.js         Login, register, remember me, session guard, logout
│   ├── dashboard.js    KPIs, 3 charts, profile management
│   ├── application.js  Table CRUD, search, filter, sort
│   └── companies.js    Grid CRUD, search, filter, sort
└── README.md
```

## Run Locally

Open the folder in Visual Studio Code and run `index.html` with the **Live Server** extension (or open it directly in Google Chrome).

## Deploy on GitHub Pages

1. Create a new **public** repository on GitHub (e.g. `job-application-website`).
2. Upload all files keeping the folder structure (`index.html` must be in the repository root), or use:
   ```bash
   git init
   git add .
   git commit -m "IMS566 job application portal"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repository-name>.git
   git push -u origin main
   ```
3. In the repository go to **Settings > Pages**.
4. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose branch `main` and folder `/ (root)`, then **Save**.
5. Wait 1-2 minutes. Your site is live at `https://<your-username>.github.io/<repository-name>/`.
6. Submit the live link and the repository link, and test the live site in Google Chrome.

## Author

Fakhrul Hadi - IMS566 Individual Project. Replace the placeholder owner details in the footer and this README with your own.