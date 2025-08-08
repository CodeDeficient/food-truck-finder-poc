@echo off
echo Running TruffleHog Secret Scanner...
echo =====================================

REM Run TruffleHog with exclusions to avoid scanning large directories
C:\Users\zabri\AppData\Roaming\Python\Python313\Scripts\trufflehog.exe . --repo_path . --exclude_paths trufflehog-exclude.txt --max_depth 3 --json

echo.
echo =====================================
echo TruffleHog scan completed!
echo Check the output above for any secrets found.
echo.
pause
