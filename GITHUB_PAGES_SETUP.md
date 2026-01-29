# GitHub Pages Deployment Setup

This repository includes a GitHub Actions workflow that automatically deploys the NCB Snake game to GitHub Pages.

## Enabling GitHub Pages

To enable automatic deployment, you need to configure GitHub Pages in your repository settings:

1. Go to your repository on GitHub: `https://github.com/dataGriff/Ncb.snake`
2. Click on **Settings** (top navigation)
3. In the left sidebar, click on **Pages**
4. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
5. Save the settings

## How it Works

The workflow (`.github/workflows/deploy-pages.yml`) will:

- **Trigger automatically** when you push to the `main` branch
- Can also be **manually triggered** from the Actions tab
- Upload the entire repository content as an artifact (including index.html, game.js, style.css, and documentation)
- Deploy the artifact to GitHub Pages

## First Deployment

After enabling GitHub Pages with the "GitHub Actions" source:

1. Push any change to the `main` branch, or
2. Go to the **Actions** tab and manually trigger the "Deploy to GitHub Pages" workflow

The game will be available at: `https://dataGriff.github.io/Ncb.snake/`

## Monitoring Deployments

- View deployment status in the **Actions** tab
- Each deployment creates an environment called `github-pages`
- You can view deployment history in the **Environments** section

## Permissions

The workflow uses the following permissions:
- `contents: read` - To checkout the repository
- `pages: write` - To deploy to GitHub Pages
- `id-token: write` - For secure deployment authentication
