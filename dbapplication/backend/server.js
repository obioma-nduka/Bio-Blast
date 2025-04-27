const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3002;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Database setup
const db = new sqlite3.Database('./bio.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create users table
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT,
        quote TEXT
    )
`, (err) => {
    if (err) {
        console.error('Error creating users table:', err.message);
    } else {
        console.log('User table created or already exists');
    }
});

// Create study_groups table
db.run(`
    CREATE TABLE IF NOT EXISTS study_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`, (err) => {
    if (err) {
        console.error('Error creating study_groups table:', err.message);
    } else {
        console.log('Study_groups table created or already exists');
    }
});

// Create hobbies table
db.run(`
    CREATE TABLE IF NOT EXISTS hobbies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`, (err) => {
    if (err) {
        console.error('Error creating hobbies table:', err.message);
    } else {
        console.log('Hobbies table created or already exists');
    }
});

// Create users_credentials table
db.run(`
    CREATE TABLE IF NOT EXISTS users_credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, async (err) => {
    if (err) {
        console.error('Error creating users_credentials table:', err.message);
    } else {
        console.log('Users_credentials table created or already exists');

        // Insert a default user if not already present
        const defaultUsername = 'Admin.User';
        const defaultEmail = 'admin@example.com';
        const defaultPassword = 'password123';

        // Hash the default password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        db.get('SELECT * FROM users_credentials WHERE username = ?', [defaultUsername], (err, row) => {
            if (err) {
                console.error('Error checking for default user:', err.message);
            } else if (!row) {
                db.run(
                    'INSERT INTO users_credentials (username, email, password) VALUES (?, ?, ?)',
                    [defaultUsername, defaultEmail, hashedPassword],
                    (err) => {
                        if (err) {
                            console.error('Error inserting default user:', err.message);
                        } else {
                            console.log(`Default user '${defaultUsername}' created with email '${defaultEmail}' and password '${defaultPassword}'`);
                        }
                    }
                );
            }
        });
    }
});

// API to get all users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API to add a new user
app.post('/api/users', (req, res) => {
    const { name, bio, quote } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    db.run(
        'INSERT INTO users (name, bio, quote) VALUES (?, ?, ?)',
        [name, bio || null, quote || null],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// API to update a user
app.put('/api/users/:id', (req, res) => {
    const { name, bio, quote } = req.body;
    const { id } = req.params;

    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    db.run(
        'UPDATE users SET name = ?, bio = ?, quote = ? WHERE id = ?',
        [name, bio || null, quote || null, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ updated: this.changes });
        }
    );
});

// API to delete a user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    // First, delete related study groups
    db.run('DELETE FROM study_groups WHERE user_id = ?', [id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Then, delete related hobbies
        db.run('DELETE FROM hobbies WHERE user_id = ?', [id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // Finally, delete the user
            db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ deleted: this.changes });
            });
        });
    });
});

// API to get study groups for a user
app.get('/api/study-groups/:userId', (req, res) => {
    const { userId } = req.params;
    db.all('SELECT * FROM study_groups WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API to add a study group
app.post('/api/study-groups', (req, res) => {
    const { user_id, name } = req.body;
    if (!user_id || !name) {
        res.status(400).json({ error: 'User ID and name are required' });
        return;
    }

    db.run(
        'INSERT INTO study_groups (user_id, name) VALUES (?, ?)',
        [user_id, name],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// API to delete a study group
app.delete('/api/study-groups/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM study_groups WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// API to get hobbies for a user
app.get('/api/hobbies/:userId', (req, res) => {
    const { userId } = req.params;
    db.all('SELECT * FROM hobbies WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API to add a hobby
app.post('/api/hobbies', (req, res) => {
    const { user_id, name } = req.body;
    if (!user_id || !name) {
        res.status(400).json({ error: 'User ID and name are required' });
        return;
    }

    db.run(
        'INSERT INTO hobbies (user_id, name) VALUES (?, ?)',
        [user_id, name],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// API to update a hobby
app.put('/api/hobbies/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    db.run(
        'UPDATE hobbies SET name = ? WHERE id = ?',
        [name, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ updated: this.changes });
        }
    );
});

// API to delete a hobby
app.delete('/api/hobbies/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM hobbies WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// API to register a new user
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
    }

    // Validate username format (e.g., Jane.Doe)
    const usernameRegex = /^[A-Z][a-z]+\.[A-Z][a-z]+$/;
    if (!usernameRegex.test(username)) {
        res.status(400).json({ error: 'Username must be in the format Jane.Doe (e.g., First.Last)' });
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }

    try {
        // Check if username already exists
        db.get('SELECT * FROM users_credentials WHERE username = ?', [username], async (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (row) {
                res.status(400).json({ error: 'Username already exists' });
                return;
            }

            // Check if email already exists
            db.get('SELECT * FROM users_credentials WHERE email = ?', [email], async (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (row) {
                    res.status(400).json({ error: 'Email already exists' });
                    return;
                }

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert the new user
                db.run(
                    'INSERT INTO users_credentials (username, email, password) VALUES (?, ?, ?)',
                    [username, email, hashedPassword],
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ message: 'User registered successfully' });
                    }
                );
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

// API to log in a user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    // Find the user by username
    db.get('SELECT * FROM users_credentials WHERE username = ?', [username], async (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // Compare the password with the hashed password
        const match = await bcrypt.compare(password, row.password);
        if (!match) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        res.json({ message: 'Login successful', username: row.username });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});