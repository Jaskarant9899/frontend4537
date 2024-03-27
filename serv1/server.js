const express = require('express');
const mysql = require('mysql');

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

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

app.post('/register', (req, res) => {
    // Handle user registration
    const { email, password } = req.body;
    const user = { email, password };
    pool.query('INSERT INTO users SET ?', user, (err, result) => {
        if (err) throw err;
        console.log('User registered');
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
    // Handle user login
    const { email, password } = req.body;
    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            if (results[0].password === password) {
                res.redirect('/protected');
            } else {
                res.send('Incorrect password');
            }
        } else {
            res.send('Email not registered');
        }
    });
});

app.get('/protected', (req, res) => {
    res.sendFile(__dirname + '/protected.html');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
