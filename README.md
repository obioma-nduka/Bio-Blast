# Taito - Connect Freelancers with Local Customers

**Taito** is a web application that connects freelancers with local customers. Freelancers can register, create profiles, and list their services, while customers can browse freelancers, view services, and contact them. The app features user authentication, role-based dashboards, notifications, and a clean, responsive user interface.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions (Local)](#setup-instructions-local)
- [Test Cases](#test-cases)
- [Deployment to Heroku](#deployment-to-heroku)
- [Notes on SQLite with Heroku](#notes-on-sqlite-with-heroku)
- [Recent Changes](#recent-changes)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

### User Authentication
- Register as a **freelancer** or **customer**.
- Secure login, logout, and role-specific dashboards.

### Dynamic Navigation
- Navigation links adjust based on authentication state.

### Freelancer Dashboard
- Manage profile and services.
- Notifications for profile and service actions.

### Customer Dashboard
- Browse freelancers and services.
- Placeholder contact functionality.

### Database
- Uses **SQLite** (note limitations on Heroku).

### Styling
- Clean responsive design with **Font Awesome** icons.

---

## Project Structure

```
dbapplication/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── script.js
│   └── style.css
│
└── backend/
    ├── server.js
    ├── taitodb.db
    ├── package.json
    └── Procfile
```

---

## Setup Instructions (Local)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Bio-Blast
```

### 2. Install Node.js v20

Use [NVM for Windows](https://github.com/coreybutler/nvm-windows/releases):
```bash
nvm install 20
nvm use 20
node --version  # Should output v20.x.x
```
Or download Node.js v20 directly from [nodejs.org](https://nodejs.org/en/download/).

### 3. Install Dependencies
```bash
cd dbapplication/backend
npm install
```

### 4. Start the Server
```bash
node server.js
```
- Server URL: [http://localhost:3002](http://localhost:3002)

### 5. Access the Application
- Default freelancer credentials:
  - **Username**: `Freelancer.User`
  - **Password**: `password123`

---

## Test Cases

### Register and Log In as a Freelancer
- Create a user: `John.Doe`, `john@example.com`, `password123`, role `freelancer`.
- Log in and access freelancer dashboard.

### Create a Freelancer Profile
- Add profile: `John Doe`, `Chicago`, `Web developer with 5 years of experience`, `Rate: 75`.

### Add a Service
- Service: `Web Development`, `Custom website development`.

### Register and Log In as a Customer
- Create a user: `Alice.Smith`, `alice@example.com`, `password123`, role `customer`.
- Browse freelancers.

### Browse Freelancers as a Customer
- View freelancer profile and services, click "Contact".

---

## Deployment to Heroku

### Prerequisites
- [Heroku Account](https://signup.heroku.com/)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- Git installed

### Deployment Steps

1. Ensure correct settings:
   - `server.js` uses `process.env.PORT`
   - `package.json` has:
     ```json
     "engines": {
       "node": "20.x"
     }
     ```
   - Create a `Procfile` with `web: node server.js`.

2. Navigate to project root:
   ```bash
   cd "path/to/Bio-Blast"
   ```

3. Log in to Heroku:
   ```bash
   heroku login
   ```

4. Create and configure app:
   ```bash
   heroku create taito-app
   heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack.git -a taito-app
   heroku buildpacks:set heroku/nodejs -a taito-app
   heroku config:set PROJECT_PATH=dbapplication/backend -a taito-app
   ```

5. Deploy:
   ```bash
   git push heroku main
   ```

6. Open the app:
   ```bash
   heroku open -a taito-app
   ```

---

## Notes on SQLite with Heroku

⚠️ **Important**:  
Heroku’s file system is **ephemeral**. SQLite database (`taitodb.db`) will reset on:

- App restarts
- Dyno changes
- Deployments

> For production, use **Heroku Postgres** or a similar managed database.

---

## Recent Changes

- Converted project from **Bio Blast** to **Taito**.
- Moved back to **SQLite** for simpler database setup.
- Fixed syntax issues by replacing arrow functions.
- Node.js version pinned to **v20**.
- Added **dynamic dashboards** and frontend improvements.
- Configured for **Heroku deployment** with subdirectory support.

---

## Future Improvements

- Switch to **Heroku Postgres** for production.
- Add a **real messaging system** for customer-freelancer interaction.
- Implement **search** and **filter** by service or location.
- Add **reviews and ratings** for freelancers.
- Strengthen security with **sessions** or **JWT**.
- Migrate frontend to **React** (with Vite or Create React App).
- Reintroduce **arrow functions** when compatible.



