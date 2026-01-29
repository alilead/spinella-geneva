# Deploy to https://spinella-geneva.netlify.app/

## Auto-update: Link Git repo to Netlify (recommended)

Once the repo is connected to Netlify, **every push to the main branch** will trigger a new deploy. No manual deploy needed.

### Steps for **aliattia10** (or repo owner)

1. **Open Netlify**
   - Go to [app.netlify.com](https://app.netlify.com) and sign in.

2. **Open the Spinella site**
   - Click the site that has URL **spinella-geneva.netlify.app** (or create a new site and name it **spinella-geneva**).

3. **Connect the Git repo**
   - Go to **Site configuration** → **Build & deploy** → **Continuous deployment**.
   - Click **Link repository** (or **Set up build**).
   - Choose **GitHub** (or GitLab/Bitbucket) and authorize Netlify if asked.
   - Select the **spinella-geneva** repository (and the correct org if applicable).
   - Pick the branch to deploy (e.g. **main** or **master**).

4. **Build settings** (usually from `netlify.toml`)
   - Netlify will read `netlify.toml` in the repo. You should see:
     - **Build command:** `pnpm install && pnpm run build:client`
     - **Publish directory:** `dist/public`
     - **Environment:** `NODE_VERSION=22`, `PNPM_VERSION=10`
   - If not, set them manually in **Build & deploy** → **Build settings** → **Edit settings**.

5. **Save and deploy**
   - Click **Save** or **Deploy site**. The first deploy will run. After that, every push to the linked branch will auto-deploy.

### After it’s linked

- Push to **main** (or the branch you chose) → Netlify builds and updates **https://spinella-geneva.netlify.app/**.
- Deploy history: **Site** → **Deploys**.
- Build logs: click a deploy to see logs and fix any build errors.

---

## One-off deploy via CLI

If the site is not yet connected to Git, or you want to deploy from your machine:

1. **Log in and link**
   ```bash
   npx netlify login
   npx netlify link
   ```
   Select the site **spinella-geneva** (URL: spinella-geneva.netlify.app).

2. **Build and deploy**
   ```bash
   pnpm run build:client
   npx netlify deploy --dir=dist/public --prod
   ```

---

## Config summary (from `netlify.toml`)

| Setting            | Value                                      |
|--------------------|--------------------------------------------|
| Build command      | `pnpm install && pnpm run build:client`   |
| Publish directory  | `dist/public`                             |
| Node version       | `22`                                      |
| PNPM version       | `10`                                      |
| Redirects          | `/*` → `/index.html` (SPA)                |

Your site will be live at **https://spinella-geneva.netlify.app/**.
