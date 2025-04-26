const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// SQLite database setup
const db = new sqlite3.Database('bio.db', (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create user table (for profiles)
db.run(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT,
        quote TEXT
    )
`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
    } else {
        console.log("User table created or already exists");
        db.get("SELECT COUNT(*) as count FROM user", (err, row) => {
            if (row.count === 0) {
                db.run("INSERT INTO user (name, bio, quote) VALUES (?, ?, ?)", [
                    "Obioma Nduka",
                    "Data Engineer",
                    "I’ve started so I’ll finish"
                ]);
                db.run("INSERT INTO user (name, bio, quote) VALUES (?, ?, ?)", [
                    "Chika Eguzoro",
                    "Cloud Administrator",
                    "I love coding"
                ]);
                db.run("INSERT INTO user (name, bio, quote) VALUES (?, ?, ?)", [
                    "Joseph Onyeisi",
                    "Data Engineer",
                    "Code everyday"
                ]);
                db.run("INSERT INTO user (name, bio, quote) VALUES (?, ?, ?)", [
                    "Michael Shodamola",
                    "Software Engineer",
                    "...by the yard it's hard, but inch by inch anything is cinch"
                ]);
            }
        });
    }
});

// Create study_groups table with user_id
db.run(`
    CREATE TABLE IF NOT EXISTS study_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id)
    )
`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
    } else {
        console.log("Study_groups table created or already exists");
        db.get("SELECT COUNT(*) as count FROM study_groups", (err, row) => {
            if (row.count === 0) {
                db.run("INSERT INTO study_groups (user_id, name) VALUES (?, ?)", [1, "NITS23K"]);
                db.run("INSERT INTO study_groups (user_id, name) VALUES (?, ?)", [2, "NITS23K"]);
                db.run("INSERT INTO study_groups (user_id, name) VALUES (?, ?)", [3, "NITS23K"]);
                db.run("INSERT INTO study_groups (user_id, name) VALUES (?, ?)", [4, "NITS23K"]);
            }
        });
    }
});

// Create hobbies table with user_id
db.run(`
    CREATE TABLE IF NOT EXISTS hobbies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id)
    )
`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
    } else {
        console.log("Hobbies table created or already exists");
        db.get("SELECT COUNT(*) as count FROM hobbies", (err, row) => {
            if (row.count === 0) {
                db.run("INSERT INTO hobbies (user_id, name) VALUES (?, ?)", [1, "Watching Movies"]);
                db.run("INSERT INTO hobbies (user_id, name) VALUES (?, ?)", [2, "Taking Walks"]);
                db.run("INSERT INTO hobbies (user_id, name) VALUES (?, ?)", [3, "Football"]);
                db.run("INSERT INTO hobbies (user_id, name) VALUES (?, ?)", [3, "Cycling"]);
                db.run("INSERT INTO hobbies (user_id, name) VALUES (?, ?)", [4, "playing basketball"]);
            }
        });
    }
});

// Create users_credentials table for authentication
db.run(`
    CREATE TABLE IF NOT EXISTS users_credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error("Error creating users_credentials table:", err.message);
    } else {
        console.log("Users_credentials table created or already exists");
        db.get("SELECT COUNT(*) as count FROM users_credentials", async (err, row) => {
            if (row.count === 0) {
                const hashedPassword = await bcrypt.hash("password123", 10);
                db.run("INSERT INTO users_credentials (username, password) VALUES (?, ?)", [
                    "Admin.User", // Updated to match the required format
                    hashedPassword
                ], (err) => {
                    if (err) {
                        console.error("Error inserting default user:", err.message);
                    } else {
                        console.log("Default user 'Admin.User' created with password 'password123'");
                    }
                });
            }
        });
    }
});

// User routes (for profiles)
app.get("/api/users", (req, res) => {
    db.all("SELECT * FROM user", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post("/api/users", (req, res) => {
    const { name, bio, quote } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    db.run("INSERT INTO user (name, bio, quote) VALUES (?, ?, ?)", [name, bio, quote], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, name, bio, quote });
    });
});

app.put("/api/users/:id", (req, res) => {
    const id = req.params.id;
    const { name, bio, quote } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    db.run("UPDATE user SET name = ?, bio = ?, quote = ? WHERE id = ?", [name, bio, quote, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "User updated" });
    });
});

app.delete("/api/users/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM user WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.run("DELETE FROM study_groups WHERE user_id = ?", [id]);
        db.run("DELETE FROM hobbies WHERE user_id = ?", [id]);
        res.json({ message: "User deleted" });
    });
});

// Study Group routes
app.get("/api/study-groups/:userId", (req, res) => {
    const userId = req.params.userId;
    db.all("SELECT * FROM study_groups WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post("/api/study-groups", (req, res) => {
    const { user_id, name } = req.body;
    if (!user_id || !name) {
        return res.status(400).json({ error: "user_id and name are required" });
    }
    db.run("INSERT INTO study_groups (user_id, name) VALUES (?, ?)", [user_id, name], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, user_id, name });
    });
});

app.delete("/api/study-groups/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM study_groups WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Study group deleted" });
    });
});

// Hobbies routes
app.get("/api/hobbies/:userId", (req, res) => {
    const userId = req.params.userId;
    db.all("SELECT * FROM hobbies WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post("/api/hobbies", (req, res) => {
    const { user_id, name } = req.body;
    if (!user_id || !name) {
        return res.status(400).json({ error: "user_id and name are required" });
    }
    db.run("INSERT INTO hobbies (user_id, name) VALUES (?, ?)", [user_id, name], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, user_id, name });
    });
});

app.put("/api/hobbies/:id", (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Hobby name is required" });
    }
    db.run("UPDATE hobbies SET name = ? WHERE id = ?", [name, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Hobby updated" });
    });
});

app.delete("/api/hobbies/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM hobbies WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Hobby deleted" });
    });
});

// Login route
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    db.get("SELECT * FROM users_credentials WHERE username = ?", [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        res.json({ message: "Login successful", username: user.username });
    });
});

// Register route
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Validate username format (e.g., Jane.Doe or Jane.doe)
    const usernameRegex = /^[A-Z][a-z]+\.[A-Z][a-z]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: "Username must be in the format Jane.Doe or Jane.doe (e.g., First.Last)" });
    }

    // Check if username already exists
    db.get("SELECT * FROM users_credentials WHERE username = ?", [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (user) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Hash the password
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            // Insert the new user into the database
            db.run("INSERT INTO users_credentials (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: "Registration successful", username });
            });
        } catch (error) {
            res.status(500).json({ error: "Error hashing password" });
        }
    });
});

app.listen(3002, () => {
    console.log("Server running on http://localhost:3002");
});