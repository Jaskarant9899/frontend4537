const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3019;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'termproject_4537'
});

// Middleware to verify session cookie
const verifySession = (req, res, next) => {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
        return res.status(401).send('Access Denied: Session ID is not provided');
    }

    // Perform any necessary verification of the session ID
    // For example, you can query the database to validate the session

    // Assuming session validation is successful
    next();
};

// Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            res.status(500).send('Error hashing password');
            return;
        }

        const user = { email, password: hashedPassword };

        pool.query('INSERT INTO users SET ?', user, (err, result) => {
            if (err) {
                res.status(500).send('Error registering user');
                return;
            }
            console.log('User registered');
            res.redirect('/login');
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            res.status(500).send('Error finding user');
            return;
        }

        if (results.length > 0) {
            const user = results[0];
            const hashedPassword = user.password;

            // Compare the hashed password with the input password
            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    res.status(500).send('Error comparing passwords');
                    return;
                }

                if (isMatch) {
                    // Set session ID cookie upon successful login
                    res.cookie('sessionId', user.id, { httpOnly: true });
                    res.redirect('/protected');
                } else {
                    res.send('Incorrect password');
                }
            });
        } else {
            res.send('Email not registered');
        }
    });
});

app.get('/protected', verifySession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'protected.html'));
});

app.get('/quote_generator', verifySession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quote_generator.html'));
});

app.post('/generate-quote', async (req, res) => {
    if (!fetch) {
      console.error('Fetch is not yet defined.');
      return res.status(500).send('Server is not ready.');
    }

    try {
      const flaskResponse = await fetch('http://127.0.0.1:5000/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });

      if (!flaskResponse.ok) {
        throw new Error(`Flask server error: ${flaskResponse.statusText}`);
      }

      const data = await flaskResponse.json();
      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error fetching quote.');
    }
});



// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
