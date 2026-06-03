# Uploading TableFlow to GitHub

## The problem

If you drag the whole project folder into GitHub’s website, it often **fails** because:

1. **`node_modules/`** — tens of thousands of files (must not upload)
2. **`.next/`** — build cache (must not upload)
3. **`.env`** — secrets (must not upload)
4. **`.DS_Store`** in `src/` — invisible macOS files (now removed & ignored)

The **`src/` folder itself is fine** — it’s normal Next.js code. The issue is usually uploading the **parent folder** with heavy directories included.

## Recommended: Git (command line)

### 1. Install Git on Mac (if `git` doesn’t work)

Open Terminal and run:

```bash
xcode-select --install
```

Accept the popup to install **Command Line Tools**. Then `git` will work.

### 2. Push the project

```bash
cd /Users/med/Desktop/Waiter

git init
git add .
git status   # should NOT list node_modules, .next, or .env
git commit -m "Initial commit: TableFlow"
```

Create an empty repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Alternative: GitHub Desktop

1. Install [GitHub Desktop](https://desktop.github.com/)
2. **File → Add Local Repository** → choose `Waiter`
3. It respects `.gitignore` automatically
4. Publish repository

## What gets committed (safe)

- `src/` — all app code
- `prisma/` — schema & migrations
- `package.json`, `package-lock.json`
- Config files (`next.config.mjs`, `tsconfig.json`, etc.)
- `.env.example` — template only (no secrets)

## What stays local (ignored)

- `node_modules/`
- `.next/`
- `.env`

After cloning on another machine: `npm install`, copy `.env.local.example` to `.env`, then `npx prisma migrate deploy`.
