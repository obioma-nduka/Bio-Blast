const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = process.env.PORT || 3002;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html as the default route
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Database setup with a relative path for Heroku
const dbPath = path.join(__dirname, 'taitodb.db');
const db = new sqlite3.Database(dbPath, function(err) {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables if they don't exist
db.serialize(function() {
    // Users table (for authentication and roles)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('freelancer', 'customer')) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, function(err) {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table created or already exists');
        }
    });

    // Freelancer profiles table
    db.run(`
        CREATE TABLE IF NOT EXISTS freelancer_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT,
            rate_per_hour REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, function(err) {
        if (err) {
            console.error('Error creating freelancer_profiles table:', err.message);
        } else {
            console.log('Freelancer_profiles table created or already exists');
        }
    });

    // Services table (services offered by freelancers)
    db.run(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            freelancer_id INTEGER,
            service_name TEXT NOT NULL,
            description TEXT,
            FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(id)
        )
    `, function(err) {
        if (err) {
            console.error('Error creating services table:', err.message);
        } else {
            console.log('Services table created or already exists');
        }
    });

    // Insert a default freelancer user if not already present
    const defaultUsername = 'Freelancer.User';
    const defaultEmail = 'freelancer@example.com';
    const defaultPassword = 'password123';

    bcrypt.hash(defaultPassword, 10, function(err, hashedPassword) {
        if (err) {
            console.error('Error hashing default password:', err.message);
            return;
        }

        db.get('SELECT * FROM users WHERE username = ?', [defaultUsername], function(err, row) {
            if (err) {
                console.error('Error checking for default user:', err.message);
                return;
            }
            if (!row) {
                db.run(
                    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                    [defaultUsername, defaultEmail, hashedPassword, 'freelancer'],
                    function(err) {
                        if (err) {
                            console.error('Error inserting default user:', err.message);
                            return;
                        }
                        console.log(`Default user '${defaultUsername}' created with email '${defaultEmail}' and password '${defaultPassword}'`);

                        // Insert a default freelancer profile for the default user
                        db.get('SELECT id FROM users WHERE username = ?', [defaultUsername], function(err, user) {
                            if (err) {
                                console.error('Error fetching default user ID:', err.message);
                                return;
                            }
                            db.run(
                                'INSERT INTO freelancer_profiles (user_id, name, location, description, rate_per_hour) VALUES (?, ?, ?, ?, ?)',
                                [user.id, 'Jane Doe', 'New York', 'Experienced graphic designer', 50.00],
                                function(err) {
                                    if (err) {
                                        console.error('Error inserting default freelancer profile:', err.message);
                                    } else {
                                        console.log('Default freelancer profile created');
                                    }
                                }
                            );
                        });
                    }
                );
            }
        });
    });
});

// API to get all freelancer profiles (for customers to browse)
app.get('/api/freelancers', function(req, res) {
    db.all(`
        SELECT fp.*, u.username 
        FROM freelancer_profiles fp 
        JOIN users u ON fp.user_id = u.id
    `, function(err, rows) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API to get services for a freelancer
app.get('/api/services/:freelancerId', function(req, res) {
    const freelancerId = req.params.freelancerId;
    db.all('SELECT * FROM services WHERE freelancer_id = ?', [freelancerId], function(err, rows) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API to add a new freelancer profile
app.post('/api/freelancer_profiles', function(req, res) {
    const user_id = req.body.user_id;
    const name = req.body.name;
    const location = req.body.location;
    const description = req.body.description;
    const rate_per_hour = req.body.rate_per_hour;

    if (!user_id || !name || !location) {
        res.status(400).json({ error: 'User ID, name, and location are required' });
        return;
    }

    db.run(
        'INSERT INTO freelancer_profiles (user_id, name, location, description, rate_per_hour) VALUES (?, ?, ?, ?, ?)',
        [user_id, name, location, description || null, rate_per_hour || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// API to update a freelancer profile
app.put('/api/freelancer_profiles/:id', function(req, res) {
    const name = req.body.name;
    const location = req.body.location;
    const description = req.body.description;
    const rate_per_hour = req.body.rate_per_hour;
    const id = req.params.id;

    if (!name || !location) {
        res.status(400).json({ error: 'Name and location are required' });
        return;
    }

    db.run(
        'UPDATE freelancer_profiles SET name = ?, location = ?, description = ?, rate_per_hour = ? WHERE id = ?',
        [name, location, description || null, rate_per_hour || null, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ updated: this.changes });
        }
    );
});

// API to delete a freelancer profile
app.delete('/api/freelancer_profiles/:id', function(req, res) {
    const id = req.params.id;

    // First, delete related services
    db.run('DELETE FROM services WHERE freelancer_id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Then, delete the freelancer profile
        db.run('DELETE FROM freelancer_profiles WHERE id = ?', [id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ deleted: this.changes });
        });
    });
});

// API to add a service
app.post('/api/services', function(req, res) {
    const freelancer_id = req.body.freelancer_id;
    const service_name = req.body.service_name;
    const description = req.body.description;

    if (!freelancer_id || !service_name) {
        res.status(400).json({ error: 'Freelancer ID and service name are required' });
        return;
    }

    db.run(
        'INSERT INTO services (freelancer_id, service_name, description) VALUES (?, ?, ?)',
        [freelancer_id, service_name, description || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// API to delete a service
app.delete('/api/services/:id', function(req, res) {
    const id = req.params.id;
    db.run('DELETE FROM services WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// API to get user ID and role by username
app.get('/api/user/:username', function(req, res) {
    const username = req.params.username;
    db.get('SELECT id, role FROM users WHERE username = ?', [username], function(err, row) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ id: row.id, role: row.role });
    });
});

// API to register a new user
app.post('/api/register', function(req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    // Validate inputs
    if (!username || !email || !password || !role) {
        res.status(400).json({ error: 'Username, email, password, and role are required' });
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

    // Validate role
    if (!['freelancer', 'customer'].includes(role)) {
        res.status(400).json({ error: 'Role must be either freelancer or customer' });
        return;
    }

    // Check if username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], function(err, row) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        // Check if email already exists
        db.get('SELECT * FROM users WHERE email = ?', [email], function(err, row) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (row) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }

            // Hash the password
            bcrypt.hash(password, 10, function(err, hashedPassword) {
                if (err) {
                    res.status(500).json({ error: 'Error hashing password' });
                    return;
                }

                // Insert the new user
                db.run(
                    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                    [username, email, hashedPassword, role],
                    function(err) {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ message: 'User registered successfully' });
                    }
                );
            });
        });
    });
});

// API to log in a user
app.post('/api/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    // Validate inputs
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    // Find the user by username
    db.get('SELECT * FROM users WHERE username = ?', [username], function(err, row) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // Compare the password with the hashed password
        bcrypt.compare(password, row.password, function(err, match) {
            if (err) {
                res.status(500).json({ error: 'Error comparing passwords' });
                return;
            }
            if (!match) {
                res.status(401).json({ error: 'Invalid username or password' });
                return;
            }

            res.json({ message: 'Login successful', username: row.username, role: row.role });
        });
    });
});

// Start the server
app.listen(port, function() {
    console.log(`Server running on port ${port}`);
});