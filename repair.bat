@echo off
echo Cleaning cleanup...
rmdir /s /q node_modules
del package-lock.json

echo Installing dependencies (this may take a minute)...
call npm install

echo Pushing fixes to GitHub...
git add package.json package-lock.json
git commit -m "Fix: Hard reset dependencies for Netlify"
git push

echo DONE! You can now deploy on Netlify.
pause
