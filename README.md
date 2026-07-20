# The Nutrition Initiative - Workflow Dashboard

Real-time, drag-and-drop task management dashboard for TNI's launch. Organized by domain, powered by Firebase.

## Features

- **Dual Launch Countdowns**: Soft (Sept 4) and Hard (Nov 8) launch timers
- **Two Views**:
  - **Today's Focus**: Shows today's CRITICAL + HIGH tasks from all domains in a Kanban board
  - **By Domain**: Organized by TNI's 10 departments with real-time status counts
- **Drag-and-Drop**: Move tasks between To-Do, In Progress, and Done columns
- **Firebase Real-Time Sync**: Changes appear instantly across all users/devices
- **ADD-Optimized**: Minimal UI, clear priorities, fast feedback

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "TNI Workflow Dashboard"
4. Enable Google Analytics (optional)

### 2. Set Up Realtime Database

1. In Firebase Console, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose region closest to you (e.g., `asia-south1` for Mumbai)
4. Start in **Test Mode** (for now; add security rules before production)

### 3. Get Your Config

1. In Firebase Console, click the gear icon → Project Settings
2. Scroll down to "Your apps"
3. Click the web icon `</>` if not already created
4. Copy the config object

### 4. Add Sample Data

In Firebase Realtime Database, add this structure:

```json
{
  "tasks": {
    "task_1": {
      "id": "task_1",
      "title": "FSSAI approval follow-up",
      "domain": "Compliance",
      "priority": "CRITICAL",
      "status": "to-do",
      "date": "2026-07-20",
      "owner": "Compliance Team"
    },
    "task_2": {
      "id": "task_2",
      "title": "Microgreens batch production",
      "domain": "Production",
      "priority": "CRITICAL",
      "status": "in-progress",
      "date": "2026-07-20",
      "owner": "Ops"
    }
  }
}
```

**Task Object Structure:**
```javascript
{
  id: "unique_id",
  title: "Task name",
  domain: "One of: Finance, Compliance, Social Welfare, Strategy & Growth, Production, HR PR CR, Purchasing & Sourcing, Sales, R&D & Product Development, Marketing",
  priority: "CRITICAL or HIGH",
  status: "to-do, in-progress, or done",
  date: "YYYY-MM-DD",
  owner: "Name or team"
}
```

## Local Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd tni-workflow-dashboard
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase config:

```
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://xxx.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx
```

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Netlify

### Option A: Via Git (Recommended)

1. Push your repo to GitHub
2. Go to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Connect GitHub, select your repo
5. **Build command**: `npm run build`
6. **Publish directory**: `dist`
7. Go to "Site settings" → "Environment" → add your `.env` variables
8. Deploy

### Option B: Via Netlify CLI

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## Usage

### Today's Focus View (Default)

Shows only today's CRITICAL + HIGH tasks from all domains, organized as:
- **To-Do** — drag here to start
- **In Progress** — actively working
- **Done** — completed

Great for low-distraction, high-focus work during the day.

### By Domain View

Flip to "By Domain" to see the full status across all 10 departments:
- Finance
- Compliance
- Social Welfare
- Strategy & Growth
- Production
- HR PR CR
- Purchasing & Sourcing
- Sales
- R&D & Product Development
- Marketing

Each domain shows task counts and a mini Kanban board.

## How to Add Tasks

Option 1: **Add directly in Firebase Console**
- Go to Realtime Database → `tasks`
- Click "+" to add a child
- Use the JSON structure above

Option 2: **Build an admin panel** (future enhancement)

## Data Format Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Unique identifier (use UUID or timestamp) |
| title | string | Yes | Task description |
| domain | string | Yes | Must match one of the 10 domains exactly |
| priority | string | Yes | CRITICAL or HIGH (only these show) |
| status | string | Yes | to-do, in-progress, or done |
| date | string | Yes | YYYY-MM-DD format |
| owner | string | No | Name or team responsible |

## Firebase Security Rules

For production, replace the default test rules with:

```json
{
  "rules": {
    "tasks": {
      ".read": true,
      ".write": "auth != null",
      "$taskId": {
        ".validate": "newData.hasChildren(['id', 'title', 'domain', 'priority', 'status', 'date'])"
      }
    }
  }
}
```

This allows anyone to read, but only authenticated users can write.

## Customization

### Change Launch Dates

Edit `App.jsx`:

```javascript
const softLaunch = new Date('2026-09-04');  // Soft launch date
const hardLaunch = new Date('2026-11-08');  // Hard launch date
```

### Change Domains

Edit the `DOMAINS` array in `App.jsx`:

```javascript
const DOMAINS = [
  'Your Domain 1',
  'Your Domain 2',
  // ...
];
```

### Change Colors

Edit `App.css` to adjust the emerald/gold theme.

## Connect with Claude

Once your Netlify site is live:

1. Share the deployed URL with Claude in chat
2. Claude can fetch live data via the public site
3. Update tasks in Firebase, and Claude sees them in real-time

Example: "Check my dashboard at [your-site].netlify.app"

## Troubleshooting

### Tasks not showing?
- Check Firebase Database URL in `.env.local`
- Verify task `date` field matches today's date (YYYY-MM-DD)
- Confirm priority is exactly "CRITICAL" or "HIGH"

### Drag-and-drop not working?
- Clear browser cache
- Check browser console for errors
- Ensure `react-beautiful-dnd` is installed

### Deploy fails?
- Run `npm run build` locally to catch build errors
- Check Netlify build logs
- Verify all env variables are set in Netlify Settings

## Support

For questions or issues:
1. Check Firebase console for data integrity
2. Review browser DevTools for JS errors
3. Verify network tab for Firebase API calls
