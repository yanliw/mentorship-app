# Mentorship Matching App

A simple web app for matching mentors with mentees with real-time capacity management.

## Features

- Mentees can sign up for mentors with real-time capacity tracking
- Mentors are marked as FULL when at capacity
- Admin dashboard to view all matches
- Download matches as CSV
- Data persists in browser (localStorage)

## Setup Instructions

### 1. Install Node.js
Download and install Node.js from https://nodejs.org (get the LTS version)

### 2. Set up the project
Open your terminal and run these commands:

```bash
# Navigate to the project folder
cd mentorship-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open in your browser at http://localhost:3000

### 3. Test it locally
- Fill in the mentee signup form
- Try signing up different mentees
- Watch capacity fill in real-time
- Click "Admin Dashboard" (password: admin123)

## Deploying to Vercel (Free hosting)

### Step 1: Create GitHub account
Go to https://github.com and sign up (free)

### Step 2: Create a new repository
- Click "+" in top right → "New repository"
- Name it "mentorship-app"
- Choose "Private" or "Public"
- Click "Create repository"

### Step 3: Push your code to GitHub
In your terminal (in the mentorship-app folder):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mentorship-app.git
git push -u origin main
```

(Replace YOUR-USERNAME with your actual GitHub username)

### Step 4: Deploy to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Click "Import Project"
4. Select "mentorship-app" repository
5. Click "Deploy"

That's it! You'll get a live URL like `mentorship-app.vercel.app`

## Customizing the mentors

Edit `src/App.jsx` and find the `useState` section with mentors. Update the list with your actual mentors:

```javascript
const [mentors, setMentors] = useState([
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    field: 'Machine Learning',
    availability: 'Monday & Wednesday, 1-5 PM',
    capacity: 2,
    bio: 'AI researcher with 10 years of industry experience'
  },
  // Add more mentors here
]);
```

Then push to GitHub:
```bash
git add .
git commit -m "Updated mentor list"
git push
```

Vercel will automatically redeploy!

## Admin password

Default: `admin123`

To change it, edit the line in `src/App.jsx`:
```javascript
if (adminPassword === 'admin123') {
```

## Need help?

- Issues running locally? Make sure Node.js is installed (`node --version`)
- Issues deploying? Check the Vercel dashboard for error logs
- Want to add features? I can help!
