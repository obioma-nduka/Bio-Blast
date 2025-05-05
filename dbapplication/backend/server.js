const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'taitodb.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('SQLite database initialized');
        // Create users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        `);
        // Create freelancer_profiles table
        db.run(`
            CREATE TABLE IF NOT EXISTS freelancer_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT,
                rate_per_hour REAL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        // Create services table
        db.run(`
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                freelancer_id INTEGER NOT NULL,
                service_name TEXT NOT NULL,
                description TEXT,
                FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(id)
            )
        `);
        // Insert default freelancer user
        db.get('SELECT * FROM users WHERE username = ?', ['Freelancer.User'], (err, row) => {
            if (!row) {
                db.run(
                    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                    ['Freelancer.User', 'freelancer@example.com', 'password123', 'freelancer']
                );
            }
        });
    }
});

// API Routes

// Register a new user
app.post('/api/register', (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (!username.match(/^[A-Z][a-z]+\.[A-Z][a-z]+$/)) {
        return res.status(400).json({ error: 'Username must be in the format First.Last (e.g., Jane.Doe)' });
    }
    if (role !== 'freelancer' && role !== 'customer') {
        return res.status(400).json({ error: 'Role must be "freelancer" or "customer"' });
    }

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        db.run(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, role],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error registering user' });
                }
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    });
});

// Login a user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        res.json({ message: 'Login successful', username: row.username, role: row.role });
    });
});

// Get user by username
app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(row);
    });
});

// Get all freelancers
app.get('/api/freelancers', (req, res) => {
    db.all(`
        SELECT fp.*, u.username
        FROM freelancer_profiles fp
        JOIN users u ON fp.user_id = u.id
    `, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Create or update a freelancer profile
app.post('/api/freelancer_profiles', (req, res) => {
    const { user_id, name, location, description, rate_per_hour } = req.body;
    if (!user_id || !name || !location) {
        return res.status(400).json({ error: 'User ID, name, and location are required' });
    }

    db.run(
        'INSERT INTO freelancer_profiles (user_id, name, location, description, rate_per_hour) VALUES (?, ?, ?, ?, ?)',
        [user_id, name, location, description, rate_per_hour],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error creating profile' });
            }
            res.status(201).json({ id: this.lastID, user_id, name, location, description, rate_per_hour });
        }
    );
});

app.put('/api/freelancer_profiles/:id', (req, res) => {
    const { id } = req.params;
    const { user_id, name, location, description, rate_per_hour } = req.body;
    if (!user_id || !name || !location) {
        return res.status(400).json({ error: 'User ID, name, and location are required' });
    }

    db.run(
        'UPDATE freelancer_profiles SET name = ?, location = ?, description = ?, rate_per_hour = ? WHERE id = ? AND user_id = ?',
        [name, location, description, rate_per_hour, id, user_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error updating profile' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Profile not found or unauthorized' });
            }
            res.json({ id, user_id, name, location, description, rate_per_hour });
        }
    );
});

// Create a service
app.post('/api/services', (req, res) => {
    const { freelancer_id, service_name, description } = req.body;
    if (!freelancer_id || !service_name) {
        return res.status(400).json({ error: 'Freelancer ID and service name are required' });
    }

    db.run(
        'INSERT INTO services (freelancer_id, service_name, description) VALUES (?, ?, ?)',
        [freelancer_id, service_name, description],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error adding service' });
            }
            res.status(201).json({ id: this.lastID, freelancer_id, service_name, description });
        }
    );
});

// Get services for a freelancer
app.get('/api/services/:freelancerId', (req, res) => {
    const { freelancerId } = req.params;
    db.all('SELECT * FROM services WHERE freelancer_id = ?', [freelancerId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Delete a service
app.delete('/api/services/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM services WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error deleting service' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});