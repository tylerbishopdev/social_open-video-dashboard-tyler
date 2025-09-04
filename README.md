# Open Video Dashboard - Daily Discussion Tracker

A Next.js application that automatically searches for and tracks online discussions relevant to Open Video's business and target audience using Perplexity's API.

## Features

- 🔍 Daily automated searches for relevant discussions across forums, Reddit, Twitter/X, Discord, etc.
- 📊 Clean dashboard interface showing discussions with links and descriptions
- 🏷️ Automatic categorization and platform detection
- 💾 Local storage persistence for historical data
- 🔄 Manual refresh capability
- 📥 Export reports as JSON

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create or update `.env.local` with your API keys:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key_here
CRON_SECRET=your_secure_cron_secret_here
```

### 3. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Scheduling Daily Searches

### Option 1: Vercel Cron Jobs (Recommended for Production)

If deploying on Vercel, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 9 * * *"
  }]
}
```

This runs daily at 9 AM UTC.

### Option 2: External Cron Service

Use services like:
- **Uptime Robot**: Set up HTTP monitor to ping `https://your-domain.com/api/cron`
- **Cron-job.org**: Free cron job service
- **EasyCron**: Simple web-based cron

Configure them to make a GET request to:
```
https://your-domain.com/api/cron
```

With header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

### Option 3: GitHub Actions

Create `.github/workflows/daily-search.yml`:

```yaml
name: Daily Search
on:
  schedule:
    - cron: '0 9 * * *'
  workflow_dispatch:

jobs:
  search:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily Search
        run: |
          curl -X GET https://your-domain.com/api/cron \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option 4: Local Development (Manual)

Click the "Refresh" button in the dashboard to manually trigger searches.

## Search Topics

The app searches for discussions about:

- Open Video platform mentions
- Creator-owned video platforms
- YouTube alternatives for creators
- Video monetization (100% revenue retention)
- Content creator business models
- Platform independence and control
- Custom domain video hosting
- Creator economy discussions

## Data Structure

Each discussion includes:
- **Link**: Direct URL to the discussion
- **Description**: Brief summary of the conversation
- **Platform**: Where the discussion is happening (Reddit, Twitter/X, etc.)
- **Category**: Topic categorization (Monetization, Platform Alternatives, etc.)

## API Endpoints

- `GET /api/cron` - Scheduled endpoint for daily searches
- `POST /api/perplexity` - Manual search trigger
- Data stored in browser's localStorage

## Deployment

### Deploy to Vercel

```bash
vercel
```

Remember to add environment variables in Vercel dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add `PERPLEXITY_API_KEY` and `CRON_SECRET`

## License

MIT