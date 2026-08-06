import os
import sys
import subprocess
import urllib.request
import json

# Note: Use `git config credential.helper store` or SSH to authenticate.
# Or provide TOKEN as an env var if running in CI.
import os
TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO_NAME = "radslice"
USER_NAME = "medicoforever"
REPO_URL = f"https://{TOKEN + '@' if TOKEN else ''}github.com/{USER_NAME}/{REPO_NAME}.git"
LIVE_URL = f"https://{USER_NAME}.github.io/{REPO_NAME}/"

def run_cmd(cmd, cwd=None):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Notice from '{cmd}': {res.stderr}")
    else:
        print(res.stdout)
    return res.returncode == 0

def main():
    print("Building production Vite web bundle...")
    if not run_cmd("npm run build"):
        print("Build failed!")
        sys.exit(1)

    print("Initializing Git repository locally...")
    run_cmd("git init")
    run_cmd("git config user.name 'medicoforever'")
    run_cmd("git config user.email 'medicoforever002@gmail.com'")

    run_cmd("git branch -M main")
    run_cmd("git rm -r --cached node_modules", cwd=os.getcwd())
    run_cmd("git add .")
    run_cmd('git commit -m "Update RadSlice AI - Multi-file upload, touch swipe, measurement & mobile ZIP export"')

    run_cmd("git remote remove origin")
    run_cmd(f"git remote add origin {REPO_URL}")

    print("Pushing main branch to GitHub...")
    run_cmd("git push -u origin main --force")

    # Deploy dist to gh-pages branch
    print("Deploying dist build to gh-pages branch...")
    dist_dir = os.path.join(os.getcwd(), "dist")
    if os.path.exists(dist_dir):
        run_cmd("git init", cwd=dist_dir)
        run_cmd("git config user.name 'medicoforever'", cwd=dist_dir)
        run_cmd("git config user.email 'medicoforever002@gmail.com'", cwd=dist_dir)
        run_cmd("git checkout -b gh-pages", cwd=dist_dir)
        run_cmd("git add -A", cwd=dist_dir)
        run_cmd('git commit -m "Deploy updated build to GitHub Pages"', cwd=dist_dir)
        run_cmd(f"git remote remove origin", cwd=dist_dir)
        run_cmd(f"git remote add origin {REPO_URL}", cwd=dist_dir)
        run_cmd("git push -u origin gh-pages --force", cwd=dist_dir)
        print("gh-pages branch pushed successfully!")

    print("\n" + "="*60)
    print("SUCCESS! RadSlice AI updated & deployed live!")
    print(f"Repository: https://github.com/{USER_NAME}/{REPO_NAME}")
    print(f"Live App URL: {LIVE_URL}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
