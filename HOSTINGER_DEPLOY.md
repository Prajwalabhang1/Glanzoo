# 🚀 Glanzoo — Hostinger Business Deployment Guide

## Prerequisites Checklist (Complete these first)

- [ ] Signed in to Hostinger hPanel at [hpanel.hostinger.com](https://hpanel.hostinger.com)
- [ ] Created accounts on: [neon.tech](https://neon.tech), [cloudinary.com](https://cloudinary.com), [resend.com](https://resend.com)
- [ ] Have your Razorpay Live API keys ready
- [ ] Domain pointed to Hostinger name servers (or using Hostinger's free domain)

---

## STEP 1 — Set Up Neon PostgreSQL Database (Free)

1. Go to [https://neon.tech](https://neon.tech) → **Sign Up** → Create a project named `glanzoo`
2. Select **region: ap-southeast-1** (closest to India)
3. After project is created: Go to **Dashboard → Connection Details**
4. Copy the **Connection String** (it looks like `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb`)
5. Add these params to the end: `?sslmode=require&connection_limit=10&pool_timeout=20`
6. Save this as your `DATABASE_URL` — you'll need it in Step 3

---

## STEP 2 — Set Up Cloudinary (Free Image Storage)

1. Go to [https://cloudinary.com](https://cloudinary.com) → **Sign Up Free**
2. On your **Dashboard**, copy:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

## STEP 3 — Set Up Email (Brevo SMTP)

You are already using Brevo for SMTP. Make sure you have these details ready:
- **SMTP Host**: `smtp-relay.brevo.com`
- **SMTP Port**: `587`
- **SMTP Username**: `a5757a001@smtp-brevo.com`
- **SMTP Password**: Your Brevo SMTP password

---

## STEP 4 — Get Razorpay Live Keys

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys → Generate Live Mode Key**
3. Copy **Key ID** → `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. Copy **Key Secret** → `RAZORPAY_KEY_SECRET`
5. Generate webhook secret: run `openssl rand -hex 32` or use any random hex generator
6. In Razorpay: **Settings → Webhooks → Add Webhook**:
   - URL: `https://glanzoo.com/api/webhooks/razorpay`
   - Secret: the hex value you generated
   - Events: `payment.captured`, `payment.failed`

---

## STEP 5 — Build the App Locally

Open PowerShell and run:

```powershell
cd "C:\Users\prajw\OneDrive\Desktop\glanzoo"

# Install dependencies
npm install

# Build production bundle
npm run build
```

✅ You should see: `Route (app)` table printed + ` Creating an optimized production build...`  
✅ A `.next/standalone` folder will be created — this is what Hostinger runs

---

## STEP 6 — Create a Node.js App on Hostinger

1. Login to **hPanel** → **Websites** → **Add Web App**
2. Choose **Node.js** (NOT WordPress)
3. Settings:
   - **App name**: `glanzoo`
   - **Node.js version**: `20.x` (LTS)
   - **Startup command**: `node server.js`
   - **App root**: `/public_html` (or the folder Hostinger creates)

---

## STEP 7 — Upload Your Code

**Option A — Git (Recommended)**

1. Push your code to GitHub:
   ```powershell
   cd "C:\Users\prajw\OneDrive\Desktop\glanzoo"
   git add .
   git commit -m "Production ready build"
   git push origin main
   ```
2. In Hostinger **Git** section → Connect your GitHub repo
3. Set the deploy branch to `main`

**Option B — File Manager (Manual)**

1. In hPanel → **File Manager** → navigate to your app folder
2. Upload the following folders/files:
   - `.next/` (entire folder)
   - `prisma/` (entire folder)
   - `public/` (entire folder)
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`

---

## STEP 8 — Configure Environment Variables on Hostinger

1. In hPanel → **Node.js Apps** → click your app → **Environment Variables**
2. Add ALL of the following (use the values you collected in Steps 1–4):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon PostgreSQL URL |
| `NEXT_PUBLIC_APP_URL` | `https://glanzoo.com` |
| `NEXT_PUBLIC_APP_NAME` | `Glanzoo` |
| `NODE_ENV` | `production` |
| `NEXTAUTH_SECRET` | `(generate: openssl rand -base64 32)` |
| `AUTH_SECRET` | `(same as NEXTAUTH_SECRET)` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXTAUTH_URL` | `https://glanzoo.com` |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `a5757a001@smtp-brevo.com` |
| `SMTP_PASS` | Your Brevo SMTP password |
| `EMAIL_FROM` | `glanzoo8872@gmail.com` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Your webhook secret |
| `ADMIN_EMAIL` | `admin@glanzoo.com` |
| `ADMIN_PASSWORD` | A strong password |

---

## STEP 9 — Run Database Migrations

In the **Hostinger SSH Terminal** (hPanel → Advanced → SSH):

```bash
# Navigate to your app folder
cd ~/public_html

# Run Prisma migrations (creates all tables in Neon)
npx prisma migrate deploy

# Create admin user + seed initial data
npx tsx prisma/seed.ts
```

---

## STEP 10 — Start the App

1. In hPanel → **Node.js Apps** → click **Restart**
2. The app runs on port 3000, Hostinger proxies it to your domain automatically
3. Visit `https://glanzoo.com` — you should see the Glanzoo homepage!

---

## Post-Launch Checklist

- [ ] Homepage loads with hero banners
- [ ] Login works at `/login`
- [ ] Admin panel accessible at `/admin` (after login)
- [ ] Product image upload works (test in admin)
- [ ] Checkout flow works (place a test order)
- [ ] Order confirmation email received
- [ ] Razorpay payment processes correctly
- [ ] SSL certificate shows green padlock 🔒
- [ ] Sitemap: `https://glanzoo.com/sitemap.xml`
- [ ] Robots: `https://glanzoo.com/robots.txt`

---

## Troubleshooting

| Problem | Solution |
|---|---|
| App won't start | Check env vars in hPanel — `DATABASE_URL` is most common missing var |
| Login broken | Ensure `AUTH_TRUST_HOST=true` and `NEXTAUTH_URL` match your domain |
| Images not uploading | Check Cloudinary credentials in env vars |
| Emails not sending | Verify your domain in Brevo first, check `EMAIL_FROM` matches verified domain |
| Database errors | Run `npx prisma migrate deploy` in SSH terminal |
| 500 errors | Check Hostinger Node.js logs in hPanel → Logs |
