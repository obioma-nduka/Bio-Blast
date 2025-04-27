Of course! Here's your **README.md** based on the information you shared:

---

# Bio Blast

**Bio Blast** is a web application designed to manage user profiles, including their bios, quotes, study groups, and hobbies. Users can register, log in, and access a dashboard to add, edit, and delete profiles. The application features a dynamic navigation bar, secure access control, and a clean, responsive user interface.

---

## Features

### User Authentication
- Register with a username (format: `First.Last`, e.g., `Jane.Doe`), email, and password.
- Log in to access the dashboard.
- Log out functionality with a success message.
- Only authenticated users can access the dashboard (`index.html`).

### Dynamic Navigation
- Shows "Login" and "Register" for unauthenticated users.
- Shows "Dashboard" and "Logout" for authenticated users.

### Dashboard
- **Default entry point**: [http://localhost:3002/](http://localhost:3002/)
- Add new users with name, bio, and quote.
- View user profiles in card format.
- Edit or delete user profiles.
- Add, edit, or delete study groups and hobbies for each user.

### Styling
- Clean and responsive design.
- Styled with `style.css`.
- Includes Font Awesome icons for buttons (e.g., add, edit, delete, login, logout).

---

## Project Structure

```
dbapplication/
├── frontend/
│   ├── index.html     // Dashboard page
│   ├── login.html     // Login page
│   ├── register.html  // Registration page
│   ├── script.js      // Frontend JavaScript functionality
│   └── style.css      // Application styling
│
└── backend/
    ├── server.js      // Express server
    └── bio.db         // SQLite database
```

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Bio-Blast
```

### 2. Install Dependencies
Navigate to the backend directory and install necessary packages:
```bash
cd dbapplication/backend
npm install
```
> This installs `express`, `sqlite3`, and `bcrypt`.

### 3. Start the Server
```bash
node server.js
```
> The server will start on [http://localhost:3002](http://localhost:3002).

### 4. Access the Application
- Open your browser and visit [http://localhost:3002/](http://localhost:3002/).
- If not logged in, you’ll be redirected to the login page.
- Use the default credentials to log in:
  - **Username**: `Admin.User`
  - **Password**: `password123`
- After logging in, you will be redirected to the dashboard.

### 5. (Optional) Reset the Database
If you want to reset the database:
```bash
del "C:\Users\USER\Documents\Advanced Web Development\Bio Blast\dbapplication\backend\bio.db"
node server.js
```

---

## Recent Changes

- **Dynamic Navigation**: Added a navigation bar that changes based on user authentication.
- **Logout Functionality**: Implemented logout feature to clear user sessions.
- **Dashboard Access Control**: Restricted dashboard to logged-in users only.
- **Default Entry Point**: Set `index.html` as the default page for `http://localhost:3002/`.

---

## Future Improvements

- Add server-side session management for more secure authentication.
- Implement a welcome page before dashboard redirection.
- Enhance UI with additional styling or animations.
- Add user profile pictures and more interactive features.

---

## License

This project is for **educational purposes** and does not include a specific license.

---

Would you also like me to generate a quick badge set (like "Built With: Node.js, Express, SQLite") for the top of the README? 🚀  
It would make it even cleaner!
