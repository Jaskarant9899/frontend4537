const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3019;

app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'termproject_4537'
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Secret key for JWT
const JWT_SECRET_KEY = 'this_is_a_good_key';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).send('Access Denied: Token is not provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access Denied: Token is not provided');
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).send('Invalid Token');
        }
        req.user = decoded;
        next();
    });
};

// Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            res.status(500).send('Error finding user');
            return;
        }

        if (results.length > 0) {
            const hashedPassword = results[0].password;

            // Compare the hashed password with the input password
            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    res.status(500).send('Error comparing passwords');
                    return;
                }

                if (isMatch) {
                    const user = { email: email };
                    const accessToken = jwt.sign(user, JWT_SECRET_KEY);
                    res.json({ accessToken: accessToken }); // Send token as response
                    console.log('User token created: ' + accessToken);
                } else {
                    res.status(401).send('Incorrect password');
                }
            });
        } else {
            res.status(404).send('Email not registered');
        }
    });
});

// Routes
app.get('/protected', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'protected.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
