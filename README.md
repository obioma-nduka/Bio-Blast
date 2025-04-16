# Bio Blast

A full-stack web app to manage user profiles with CRUD, using SQLite.

## Description

Bio Blast is a web application that allows users to create, read, update, and delete (CRUD) profiles, including their name, bio, quote, study groups, and hobbies. It features a colorful, card-based UI and a back-end powered by Node.js, Express, and SQLite.

## Features

- Card-based layout displaying users with name, bio, quote, study groups, and hobbies.
- Add/edit/delete users, study groups, and hobbies via the UI.
- Add records via HTTP (e.g., `curl`).
- Colorful, mobile-friendly UI based on a Figma prototype.

## Project Structure

- `frontend/`: HTML, CSS, JavaScript for the UI.
- `backend/`: Node.js, Express, SQLite for the server and database.

## Setup and Run

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (v20.x.x or later recommended)
- [Git](https://git-scm.com/downloads)

### Clone the Repository

1. Clone the repository to your local machine:
git clone https://github.com/YourGitHubUsername/Bio-Blast.git
cd Bio-Blast/dbapplication

### Install Dependencies

2. Navigate to the `backend/` directory and install dependencies:
cd backend
npm install


### Run the Application

3. Start the server:
node server.js

**OR** if you have a root-level `package.json` with a `start` script:
cd ..
npm start



4. Open `http://localhost:3000` in your browser to view the app.

## Usage

### Via the UI

- **Add a User**: Use the "Add New User" form at the top to add a new user with a name, bio, and quote.
- **Edit a User**: Click the "Edit User" button on a user card to update their details.
- **Delete a User**: Click the "Delete User" button to remove a user and their associated study groups and hobbies.
- **Manage Study Groups**: Add or delete study groups for a user using the input and buttons in the "Study Groups" section of each card.
- **Manage Hobbies**: Add, edit, or delete hobbies for a user using the inputs and buttons in the "Hobbies" section of each card.

### Via `curl`

You can also interact with the app using HTTP requests:

- **Add a User**:
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Nia Smith","bio":"Web Developer","quote":"Keep learning!"}'

- **Add a Study Group for a User** (e.g., user_id 4):
curl -X POST http://localhost:3000/api/study-groups -H "Content-Type: application/json" -d '{"user_id":4,"name":"Code Club"}'

- **Add a Hobby for a User** (e.g., user_id 4):
curl -X POST http://localhost:3000/api/hobbies -H "Content-Type: application/json" -d '{"user_id":4,"name":"Reading"}'



## API Endpoints

The back-end provides the following API endpoints for CRUD operations:

- **Users**:
- `GET /api/users`: Retrieve all users.
- `POST /api/users`: Create a new user (body: `{ "name": "string", "bio": "string", "quote": "string" }`).
- `PUT /api/users/:id`: Update a user (body: `{ "name": "string", "bio": "string", "quote": "string" }`).
- `DELETE /api/users/:id`: Delete a user and their associated study groups and hobbies.

- **Study Groups**:
- `GET /api/study-groups/:userId`: Retrieve study groups for a specific user.
- `POST /api/study-groups`: Create a new study group (body: `{ "user_id": number, "name": "string" }`).
- `DELETE /api/study-groups/:id`: Delete a study group.

- **Hobbies**:
- `GET /api/hobbies/:user ONLINE**: Retrieve hobbies for a specific user.
- `POST /api/hobbies`: Create a new hobby (body: `{ "user_id": number, "name": "string" }`).
- `PUT /api/hobbies/:id`: Update a hobby (body: `{ "name": "string" }`).
- `DELETE /api/hobbies/:id`: Delete a hobby.

## Tech Stack

- **Front-end**: HTML, CSS, JavaScript
- Uses a card-based layout with Font Awesome icons for buttons.
- **Back-end**: Node.js, Express, SQLite
- Node.js and Express for the server and API routes.
- SQLite for persistent data storage.
- **Dependencies**:
- `express`: For the server and API routes.
- `sqlite3`: For the SQLite database.

## Deployment (Optional)

You can deploy Bio Blast to a hosting service like Render to make it accessible online:

1. Push your repository to GitHub (already done).
2. Create a new **Web Service** and connect your GitHub repository.
3. Configure the service:
 - **Build Command**: `npm install`
 - **Start Command**: `node dbapplication/backend/server.js`
4. Deploy the app and access it at the provided URL (e.g., `https://bio-blast.onrender.com`).

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request on GitHub.

Please ensure your code follows the existing style and includes appropriate documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, feel free to reach out:
- **GitHub**: [obioma-nduka] (https://https://github.com/obioma-nduka)
- **Email**: obiomanduka1@.com










