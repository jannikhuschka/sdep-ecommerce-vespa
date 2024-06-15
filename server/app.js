const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
var passport = require('passport');
var bodyParser = require('body-parser');
var JsonStrategy = require('passport-json').Strategy;

const app = express();
const port = 5001;
const bcrypt = require('bcryptjs');

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

// Middleware setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

passport.use(new JsonStrategy( { usernameProp: 'email', passwordProp: 'password' }, function verify(email, password, cb) {
    console.log('Verifying user');
    try {
        const result = pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (bcrypt.compareSync(password, result.rows[0].password_hash)) {
            console.log('Login successful');
            return cb(null, result.rows[0]);
        } else {
            console.log('Login failed');
            return cb(null, false, { message: 'Incorrect password' });
        }
    } catch (err) {
        console.log('Login failed');
        console.error(err.message);
        return cb(err);
    }
  }));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
    const user = pool.query('SELECT * FROM users WHERE id = $1', [id]).rows[0];
    done(null, user);
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
        const { name, description, year, model, power, price } = req.body;
        await pool.query(
            'INSERT INTO scooters (name, description, year, model, power, price) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, description, year, model, power, price]
        );
        res.status(201).send('Scooter added');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// app.post('/api/login', async (req, res) => {
//     // try {
//     //     const { email, password } = req.body;
//     //     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     //     if (result.rows.length === 0) {
//     //         res.status(404).send('User not found');
//     //     } else {
//     //         const user = result.rows[0];
//     //         console.log('User: ', user.name);
//     //         console.log('Password: ', user.password);
//     //         if (bcrypt.compareSync(password, user.password_hash)) {
//     //             res.status(200).send('Login successful');
//     //         } else {
//     //             res.status(401).send('Wrong password');
//     //         }
//     //     }
//     // } catch (err) {
//     //     console.error(err.message);
//     //     res.status(500).send('Server error');
//     // }
//     passport.authenticate('local', { failureRedirect: '/search', failureMessage: true }),
//     function(req, res) {
//         res.redirect('/');
//     }
// });

app.post('/api/login', async (req, res) => {
    console.log('Logging in');
    passport.authenticate('json', { successRedirect: '/search', failureRedirect: '/login', failureMessage: true });
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, passwordHash } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            res.status(409).send('User already exists');
        } else {
            await pool.query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
                [name, email, passwordHash]
            );
            res.status(201).send('User added');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
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
