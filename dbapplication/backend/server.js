const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./bio.db", (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create user table
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
            }
        });
    }
});

// API to get all users (READ)
app.get("/api/users", (req, res) => {
    db.all("SELECT * FROM user", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// API to create a new user (CREATE)
app.post("/api/users", (req, res) => {
    const { name, bio, quote } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    db.run("INSERT INTO user (name, bio, quote) VALUES (?, ?, ?)", [name, bio || "", quote || ""], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, name, bio, quote });
    });
});

// API to update a user (UPDATE)
app.put("/api/users/:id", (req, res) => {
    const id = req.params.id;
    const { name, bio, quote } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    db.run("UPDATE user SET name = ?, bio = ?, quote = ? WHERE id = ?", [name, bio || "", quote || "", id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User updated" });
    });
});

// API to delete a user (DELETE)
app.delete("/api/users/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM user WHERE id = ?", id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        // Also delete associated study groups and hobbies
        db.run("DELETE FROM study_groups WHERE user_id = ?", id);
        db.run("DELETE FROM hobbies WHERE user_id = ?", id);
        res.json({ message: "User deleted" });
    });
});

// API to get study groups for a user (READ)
app.get("/api/study-groups/:userId", (req, res) => {
    const userId = req.params.userId;
    db.all("SELECT * FROM study_groups WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// API to create a new study group for a user (CREATE)
app.post("/api/study-groups", (req, res) => {
    const { user_id, name } = req.body;
    if (!user_id || !name) {
        return res.status(400).json({ error: "User ID and study group name are required" });
    }
    db.run("INSERT INTO study_groups (user_id, name) VALUES (?, ?)", [user_id, name], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, user_id, name });
    });
});

// API to delete a study group (DELETE)
app.delete("/api/study-groups/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM study_groups WHERE id = ?", id, function (err) {
        if (err) {
            return res.status(500).json({ error: "Study group not found" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Study group not found" });
        }
        res.json({ message: "Study group deleted" });
    });
});

// API to get hobbies for a user (READ)
app.get("/api/hobbies/:userId", (req, res) => {
    const userId = req.params.userId;
    db.all("SELECT * FROM hobbies WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// API to create a new hobby for a user (CREATE)
app.post("/api/hobbies", (req, res) => {
    const { user_id, name } = req.body;
    if (!user_id || !name) {
        return res.status(400).json({ error: "User ID and hobby name are required" });
    }
    db.run("INSERT INTO hobbies (user_id, name) VALUES (?, ?)", [user_id, name], function (err) {
        if (err) {
            return res.status(500).json({ error: "Hobby not found" });
        }
        res.json({ id: this.lastID, user_id, name });
    });
});

// API to update a hobby (UPDATE)
app.put("/api/hobbies/:id", (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Hobby name is required" });
    }
    db.run("UPDATE hobbies SET name = ? WHERE id = ?", [name, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Hobby not found" });
        }
        res.json({ message: "Hobby updated" });
    });
});

// API to delete a hobby (DELETE)
app.delete("/api/hobbies/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM hobbies WHERE id = ?", id, function (err) {
        if (err) {
            return res.status(500).json({ error: "Hobby not found" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Hobby not found" });
        }
        res.json({ message: "Hobby deleted" });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

