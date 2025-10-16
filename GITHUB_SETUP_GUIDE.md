# 🐙 GitHub Repository Setup Guide

**Complete guide to set up your affiliate bot on GitHub**

---

## 📋 Prerequisites

- GitHub account ([Create one here](https://github.com/signup))
- Git installed on your computer
- Your affiliate bot project ready

---

## 🚀 Step 1: Initialize Git Repository

### 1.1 Open Terminal/Command Prompt

Navigate to your project directory:

```bash
cd "c:\Users\aniru\OneDrive\Desktop\affilate bot"
```

### 1.2 Initialize Git

```bash
git init
```

This creates a `.git` folder to track changes.

### 1.3 Configure Git (First Time Only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 📝 Step 2: Create Initial Commit

### 2.1 Check Git Status

```bash
git status
```

You should see all your project files listed as "Untracked files".

### 2.2 Add All Files

```bash
git add .
```

This stages all files for commit.

### 2.3 Verify Staged Files

```bash
git status
```

All files should now show as "Changes to be committed" (green).

### 2.4 Create Initial Commit

```bash
git commit -m "Initial commit: Amazon Affiliate Telegram Bot

- Multi-platform product search (Amazon, eBay, Flipkart, Myntra)
- Telegram bot integration for deal posting
- Supabase database for duplicate prevention
- Scheduled product searches with cron jobs
- Admin panel for configuration management
- Comprehensive error handling and logging"
```

---

## 🌐 Step 3: Create GitHub Repository

### 3.1 Go to GitHub

Visit [GitHub.com](https://github.com/new)

### 3.2 Create New Repository

Fill in the form:

| Field | Value |
|-------|-------|
| Repository name | `amazon-affiliate-bot` |
| Description | `Automated Amazon affiliate deals bot that posts to Telegram` |
| Visibility | `Public` (or `Private` if you prefer) |
| Initialize with README | ❌ **Uncheck** (we have one) |
| Add .gitignore | ❌ **Uncheck** (we have one) |
| Add license | ✅ **Check** → Select `MIT` |

### 3.3 Create Repository

Click "Create repository" button.

---

## 🔗 Step 4: Connect Local Repository to GitHub

### 4.1 Copy Repository URL

On GitHub, click the green "Code" button and copy the HTTPS URL:

```
https://github.com/YOUR_USERNAME/amazon-affiliate-bot.git
```

### 4.2 Add Remote

In your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/amazon-affiliate-bot.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 4.3 Verify Remote

```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/amazon-affiliate-bot.git (fetch)
origin  https://github.com/YOUR_USERNAME/amazon-affiliate-bot.git (push)
```

---

## 📤 Step 5: Push to GitHub

### 5.1 Rename Branch to Main

```bash
git branch -M main
```

### 5.2 Push to GitHub

```bash
git push -u origin main
```

This will:
- Create `main` branch on GitHub
- Upload all your commits
- Set `main` as default branch

### 5.3 Verify on GitHub

Go to your repository on GitHub and refresh. You should see all your files!

---

## 🔄 Step 6: Ongoing Git Workflow

### Making Changes

```bash
# 1. Make changes to your files
# 2. Check status
git status

# 3. Stage changes
git add .

# 4. Commit changes
git commit -m "Description of changes"

# 5. Push to GitHub
git push
```

### Creating Branches

```bash
# Create new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch
git push -u origin feature/new-feature

# Create Pull Request on GitHub
# Then merge to main
```

---

## 📋 Repository Structure

Your GitHub repository should have:

```
amazon-affiliate-bot/
├── src/
│   ├── modules/
│   ├── utils/
│   ├── scheduler.js
│   └── index.js
├── admin-panel/
│   ├── app/
│   ├── lib/
│   └── package.json
├── docs/
├── .gitignore
├── .env.example
├── package.json
├── README.md
└── PRODUCTION_DEPLOYMENT_GUIDE.md
```

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No credentials in code
- [ ] No API keys in commits
- [ ] `.env.example` has placeholder values only
- [ ] `secrets.txt` is in `.gitignore`
- [ ] `node_modules/` is in `.gitignore`

---

## 🚀 Next Steps

After pushing to GitHub:

1. **Connect to Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables
   - Deploy!

2. **Enable Branch Protection** (Optional)
   - Go to Settings → Branches
   - Add rule for `main` branch
   - Require pull request reviews
   - Require status checks to pass

3. **Set Up GitHub Actions** (Optional)
   - Create `.github/workflows/` directory
   - Add CI/CD workflows
   - Auto-run tests on push

---

## 🆘 Troubleshooting

### "fatal: not a git repository"

```bash
# Make sure you're in the right directory
cd "c:\Users\aniru\OneDrive\Desktop\affilate bot"

# Initialize git
git init
```

### "Permission denied (publickey)"

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to GitHub:
# Settings → SSH and GPG keys → New SSH key
# Paste your public key
```

### "Updates were rejected"

```bash
# Pull latest changes first
git pull origin main

# Then push
git push origin main
```

### "Large files warning"

If you have large files (>100MB):
```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "*.zip"
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

---

## 📚 Useful Git Commands

```bash
# View commit history
git log

# View changes
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Create tag for release
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# View branches
git branch -a

# Delete branch
git branch -d branch-name
```

---

## ✅ Success Checklist

- [ ] Git initialized locally
- [ ] Initial commit created
- [ ] GitHub repository created
- [ ] Remote added
- [ ] Code pushed to GitHub
- [ ] All files visible on GitHub
- [ ] `.env` file not committed
- [ ] README visible on GitHub
- [ ] Ready for Vercel deployment


