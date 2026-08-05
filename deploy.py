import os
import sys
import subprocess
import urllib.request
import json

TOKEN = "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"
REPO_NAME = "radslice"
USER_NAME = "medicoforever"
REPO_URL = f"https://{TOKEN}@github.com/{USER_NAME}/{REPO_NAME}.git"
LIVE_URL = f"https://{USER_NAME}.github.io/{REPO_NAME}/"

def run_cmd(cmd, cwd=None):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Notice from '{cmd}': {res.stderr}")
    else:
        print(res.stdout)
    return res.returncode == 0

def create_github_repo():
    print("Checking if GitHub repository exists...")
    req = urllib.request.Request(
        f"https://api.github.com/repos/{USER_NAME}/{REPO_NAME}",
        headers={
            "Authorization": f"token {TOKEN}",
            "User-Agent": "AntigravityDeployScript"
        }
    )
    try:
        urllib.request.urlopen(req)
        print("Repository already exists on GitHub!")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("Repository does not exist. Creating new repository on GitHub...")
            data = json.dumps({
                "name": REPO_NAME,
                "description": "RadSlice AI - Radiology Film Sheet Stack Splitter & DICOM Vision Viewer",
                "private": False,
                "auto_init": False
            }).encode('utf-8')
            create_req = urllib.request.Request(
                "https://api.github.com/user/repos",
                data=data,
                headers={
                    "Authorization": f"token {TOKEN}",
                    "Content-Type": "application/json",
                    "User-Agent": "AntigravityDeployScript"
                }
            )
            try:
                urllib.request.urlopen(create_req)
                print("Repository created successfully!")
            except Exception as create_err:
                print(f"Failed to create repository: {create_err}")
                return False
        else:
            print(f"GitHub API Error: {e}")
            return False
    return True

def enable_github_pages():
    print("Enabling GitHub Pages on repo...")
    data = json.dumps({
        "source": {
            "branch": "gh-pages",
            "path": "/"
        }
    }).encode('utf-8')
    req = urllib.request.Request(
        f"https://api.github.com/repos/{USER_NAME}/{REPO_NAME}/pages",
        data=data,
        headers={
            "Authorization": f"token {TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "AntigravityDeployScript"
        }
    )
    try:
        urllib.request.urlopen(req)
        print("GitHub Pages enabled successfully!")
    except urllib.error.HTTPError as e:
        if e.code == 409:
            print("GitHub Pages already enabled.")
        else:
            print(f"GitHub Pages API Notice ({e.code})")

def main():
    if not create_github_repo():
        sys.exit(1)

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
    run_cmd('git commit -m "Initial commit - RadSlice AI web application"')

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
        run_cmd('git commit -m "Deploy to GitHub Pages"', cwd=dist_dir)
        run_cmd(f"git remote add origin {REPO_URL}", cwd=dist_dir)
        run_cmd("git push -u origin gh-pages --force", cwd=dist_dir)
        print("gh-pages branch pushed successfully!")

    enable_github_pages()

    print("\n" + "="*60)
    print("SUCCESS! RadSlice AI is deployed live!")
    print(f"Repository: https://github.com/{USER_NAME}/{REPO_NAME}")
    print(f"Live App URL: {LIVE_URL}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
