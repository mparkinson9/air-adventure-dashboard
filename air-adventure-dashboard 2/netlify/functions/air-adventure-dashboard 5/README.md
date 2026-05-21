# Air Adventure Availability Dashboard

A private web dashboard that pulls live availability across all tours from Rezdy, hosted free on Netlify.

## Deploy in 5 Steps

### Step 1 — Get a free GitHub account
Go to https://github.com and sign up if you don't have one.

### Step 2 — Upload this folder to GitHub
1. Go to https://github.com/new
2. Name the repository: `air-adventure-dashboard`
3. Set it to **Private**
4. Click **Create repository**
5. Click **uploading an existing file**
6. Drag the entire contents of this folder into the upload area
7. Click **Commit changes**

### Step 3 — Get a free Netlify account
Go to https://netlify.com and sign up using your GitHub account.

### Step 4 — Deploy from GitHub
1. In Netlify, click **Add new site → Import an existing project**
2. Choose **GitHub** and select your `air-adventure-dashboard` repo
3. Leave build settings as default (Netlify auto-detects them)
4. Click **Deploy site**

### Step 5 — Add your Rezdy API key (keeps it secret)
1. In Netlify, go to **Site settings → Environment variables**
2. Click **Add a variable**
3. Key: `REZDY_API_KEY`
4. Value: `3932647bf46b450490acff54ab13068a`
5. Click **Save**
6. Go to **Deploys** and click **Trigger deploy → Deploy site**

That's it. Netlify gives you a URL like `https://your-site-name.netlify.app`.
Bookmark it. Share it with your team. It refreshes automatically every 3 hours.

## To update the dashboard in future
Edit any file in your GitHub repo and Netlify redeploys automatically within 1-2 minutes.
