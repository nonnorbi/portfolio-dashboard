# Portfolio Dashboard

Automated portfolio dashboard that fetches data from Google Sheets and displays it with a clean, minimalist interface.

## Features

- **Real-time Data Sync**: Automatically fetches portfolio data from Google Sheets every 30 minutes
- **Manual Refresh**: Click the refresh button to update data on demand
- **Two-Level Navigation**: 
  - Overview: Key metrics and portfolio composition
  - Reports: Detailed milestones and breakdowns
- **Privacy Mode**: Hide/show values with a toggle button
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Hosting**: Automatically deployed to GitHub Pages

## Setup

### 1. Google Sheets API Configuration

1. Create a Google Cloud Project
2. Enable Google Sheets API and Google Drive API
3. Create a Service Account and download the JSON key
4. Share your Google Sheet with the Service Account email
5. Note the Sheet ID from the URL

### 2. GitHub Secrets

Add the following secrets to your GitHub repository:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: The full content of the Service Account JSON file
- `GOOGLE_SHEET_ID`: Your Google Sheet ID

### 3. GitHub Pages

1. Go to Settings → Pages
2. Select "Deploy from a branch"
3. Choose "gh-pages" branch and "/ (root)" folder
4. Your dashboard will be available at `https://YOUR_USERNAME.github.io/portfolio-dashboard`

## Data Structure

The dashboard expects the following cell references in your Google Sheet:

- `'ETF'!B13`: Total ETF portfolio value (EUR)
- `'KT'!A2`: Total bonds value (EUR)
- `'Fula'!A2`: Total Fundamenta value (EUR)
- `'M'!AF33`: Total portfolio value (EUR)

## Development

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

## Automation

The GitHub Actions workflow runs:
- **Automatically**: Every 30 minutes (cron: `*/30 * * * *`)
- **Manually**: Via the Actions tab with "Run workflow"

## File Structure

```
.
├── .github/workflows/
│   └── update-dashboard.yml      # GitHub Actions workflow
├── scripts/
│   └── update_portfolio_data.py  # Data fetching script
├── client/                        # React application
├── public/                        # Static files
└── package.json
```

## License

MIT
