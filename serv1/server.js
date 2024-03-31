const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path'); // Require the 'path' module

const app = express();
const port = 3000;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'termproject_4537'
});

app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'serv1' directory
app.use(express.static(path.join(__dirname, './bac')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/login.html'));
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

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/login.html'));
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

app.get('/protected', (req, res) => {
    res.sendFile(path.join(__dirname, '/serv1/protected.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
