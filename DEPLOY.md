# Deploy Diabetes Care Ecosystem

## Overview
Your app has 3 parts:
1. **Frontend** (HTML/CSS/JS) → Deploy on **Vercel** (free, easy)
2. **Backend** (Node.js/Express) → Deploy on **Render** (free, 24/7 running)
3. **Database** (MongoDB) → Use **MongoDB Atlas** (free 512MB)

---

## Step 1: Setup MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/atlas/register
2. Sign up with Google (fastest)
3. Create a **Shared** cluster (FREE)
4. Choose region: **Mumbai (ap-south-1)** (closest for Pakistan)
5. Click **Create Cluster**
6. In Security → Database Access:
   - Click **Add New Database User**
   - Username: `diabetes_admin`
   - Password: Generate a strong password, copy it!
7. In Network Access → IP Access List:
   - Click **Add IP Address**
   - Choose **Allow Access from Anywhere** (0.0.0.0/0)
8. Go to Clusters → Click **Connect** → **Drivers** → **Node.js**
9. Copy the connection string:
   ```
   mongodb+srv://diabetes_admin:<password>@cluster0.xxxxx.mongodb.net/diabetes_care?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

---

## Step 2: Deploy Backend on Render (Free, Always On)

### 2a: Push Code to GitHub

1. Go to https://github.com/new
2. Repository name: `diabetes-care-backend`
3. Make it **Public**
4. Click **Create repository**

In VSCode Terminal:
```bash
cd "c:/Users/ATECH-LAB/Desktop/first web/webfordiabeticdoctor/backend"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/diabetes-care-backend.git
git push -u origin main
```

### 2b: Deploy on Render

1. Go to https://render.com (sign up with GitHub)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo: `diabetes-care-backend`
4. Fill the form:
   - **Name**: `diabetes-care-api`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Click **Advanced** → Add Environment Variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = any long random string (e.g., `my-super-secret-key-2026-diabetes`)
   - `JWT_EXPIRE` = `7d`
   - `PORT` = `10000`
6. Click **Create Web Service**

Wait 2-3 minutes. Copy your Render URL: `https://diabetes-care-api.onrender.com`

### 2c: Seed Database

In your Render dashboard, go to **Shell** tab, run:
```bash
node config/seed.js
```

Your backend is now live!

---

## Step 3: Deploy Frontend on Vercel

### 3a: Update API URL

Open `js/api.js` and change this line:
```javascript
return 'https://diabetes-care-api.vercel.app/api';
```
To your Render URL:
```javascript
return 'https://diabetes-care-api.onrender.com/api';
```

### 3b: Push Frontend Code

Create new GitHub repo `diabetes-care-frontend`.

In Terminal (from the `webfordiabeticdoctor` folder, NOT backend):
```bash
cd "c:/Users/ATECH-LAB/Desktop/first web/webfordiabeticdoctor"
# Create a copy without backend for cleaner deploy
copy vercel.json vercel.json
copy index.html index.html
# (all your HTML, CSS, JS files should be in this folder)
```

```bash
git init
git add index.html login.html patient-portal.html doctor-dashboard.html lab-dashboard.html admin-dashboard.html appointment.html shop.html video-call.html vercel.json css/ js/ assets/ README.md
git commit -m "Frontend ready for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/diabetes-care-frontend.git
git push -u origin main
```

### 3c: Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your `diabetes-care-frontend` repo
3. Framework Preset: **Other** (static HTML)
4. Click **Deploy**

Done! Your site will be live at `https://diabetes-care-frontend.vercel.app`

---

## Step 4: Connect Frontend + Backend (CORS)

Your backend `server.js` already has CORS enabled with:
```javascript
app.use(cors({ origin: true, credentials: true }));
```
This allows any domain. If you want to restrict it, change to:
```javascript
app.use(cors({ origin: 'https://diabetes-care-frontend.vercel.app', credentials: true }));
```

Commit and push this change to Render (it auto-redeploys).

---

## Troubleshooting

### 404 on page refresh (e.g., /login)
→ The `vercel.json` file fixes this. Make sure it's in your repo.

### API calls failing
→ Check the API_BASE url in `js/api.js` matches your Render URL.

### MongoDB connection error
→ Check your MongoDB Atlas IP whitelist includes `0.0.0.0/0`.

### "Cannot GET /api/..."
→ Your backend is not running. Check Render logs.

---

## URLs After Deployment

| Service | URL Example |
|---------|-------------|
| Frontend | `https://diabetes-care-frontend.vercel.app` |
| Backend API | `https://diabetes-care-api.onrender.com/api` |
| Admin Dashboard | `https://diabetes-care-frontend.vercel.app/admin-dashboard.html` |
| Patient Portal | `https://diabetes-care-frontend.vercel.app/patient-portal.html` |

## Login Credentials (After Seeding)

| Role | Phone | Password |
|------|-------|----------|
| Admin | 00000000000 | admin123 |
| Doctor | 11111111111 | doctor123 |
| Patient | 22222222222 | patient123 |
| Lab Tech | 33333333333 | lab123 |

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| MongoDB Atlas | 512MB storage |
| Render | Sleeps after 15 min idle (wakes up in 30 sec) |
| Vercel | 100GB bandwidth/month |

For a real clinic, upgrade to paid tiers.

