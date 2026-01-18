@echo off
git init
git add .
git commit -m "Initial commit"
git remote remove origin
git remote add origin "https://github.com/klickclick/showcase2026.git"
git branch -M main
git push -u origin main
pause
