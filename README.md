# Expinse — Expense Tracker

Simple React + Express expense tracker with MongoDB.

## Local setup

- Backend (in `backend/`):

```bash
cd backend
npm install
# set .env with MONGODB_URI and MONGODB_DB
npm run dev
```

- Frontend (in `frontend/`):

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

## Upload to GitHub (commands)

Initialize and push local repo:

```bash
# at project root
git init
git add .
git commit -m "Initial commit"
# create remote repo on GitHub (option A uses GitHub CLI)
gh repo create <USERNAME>/expinse --public --source=. --remote=origin --push
# or (option B) create repo on github.com, then:
# git remote add origin https://github.com/<USERNAME>/expinse.git
# git branch -M main
# git push -u origin main
```

Replace `<USERNAME>` with your GitHub username. If you prefer a private repo, change the `--public` flag to `--private` or set privacy on GitHub UI.

## Notes
- Keep `.env` out of the repo (already in `.gitignore`).
- Consider using GitHub Actions for CI and a production MongoDB atlas for deployment.
