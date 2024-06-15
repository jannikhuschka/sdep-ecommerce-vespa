const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const port = 5001;
const bcrypt = require('bcryptjs');

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Middleware setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM scooters');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/products', async (req, res) => {
    console.log('Adding scooter');
    try {
        const { name, description, year, model, power, price, owner } = req.body;
        await pool.query(
            'INSERT INTO scooters (name, description, year, model, power, price, owner) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, description, year, model, power, price, owner]
        );
        res.status(201).send('Scooter added');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(404).send('User not found');
        } else {
            const user = result.rows[0];
            console.log('User: ', user.name);
            console.log('Password: ', user.password_hash);
            if (bcrypt.compareSync(password, user.password_hash)) {
                res.cookie('authToken', user.id, { maxAge: 24 * 60 * 60, httpOnly: true });
                res.status(200).send(user);
            } else {
                res.status(401).send('Wrong password');
            }
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            res.status(409).send('User already exists');
        } else {
            const passwordHash = bcrypt.hashSync(password, 10);
            await pool.query(
                'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
                [name, email, passwordHash]
            );
            const query = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = query.rows[0];
            res.cookie('authToken', user.id, { maxAge: 24 * 60 * 60, httpOnly: true });
            res.status(201).send(user);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/logout', (req, res) => {
    res.clearCookie('authToken');
    res.status(200).send('Logged out');
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// The "catchall" handler: for any request that doesn't match "/api", send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
