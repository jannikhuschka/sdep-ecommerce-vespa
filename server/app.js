const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5001;
const bcrypt = require('bcryptjs');
const jimp = require('jimp');
const multer = require('multer');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Middleware setup
// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 24 * 60 * 60 * 1000 }
// }));

app.use(
    session({
      store: new PgSession({
        pool: pool, // Connection pool
        tableName: "session", // Use the session table we created
      }),
      secret: "your_secret_key", // Replace with your own secret
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, //cookies last 30 days
        sameSite: "none", // Allows the cookie to be sent in all contexts
      }, // 30 days
    })
  );

var profilePicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './images/profile')
    },
    filename: function (req, file, cb) {
      console.log(req.session);
      cb(null, String(req.session.userID) + path.extname(file.originalname))
    }
})
var profilePicUpload = multer({ storage: profilePicStorage });

app.use(express.static(__dirname + '/public'));
app.use('/images', express.static('images'))

app.post('/api/profile-picture', profilePicUpload.single('profile-pic'), function async (req, res, next) {
//   console.log(req.session.userID);
  console.log(req.session);
//   console.log(JSON.stringify(req.file))
  res.status(201).send('Profile picture uploaded');
})

app.get('/api/products', async (req, res) => {
    try {
        var result = await pool.query('SELECT * FROM scooters');
        for (let i = 0; i < result.rows.length; i++) {
            const id = result.rows[i].id;
            const dir = `./images/scooters/${id}`;
            const files = fs.readdirSync(dir);
            result.rows[i].images = [];
            for (let j = 0; j < files.length; j++) {
                result.rows[i].images.push(`http://localhost:5001/images/scooters/${id}/${files[j]}`);
            }
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/products/filtered', async (req, res) => {
    try {
        const search = req.query.search;
        const priceRange = req.query.priceRange;
        const yearRange = req.query.yearRange;
        const powerRange = req.query.powerRange;
        var result = await pool.query(`
            SELECT *
            FROM scooters
            WHERE (LOWER(name) ILIKE LOWER($1)
            OR LOWER(description) ILIKE LOWER($1)
            OR LOWER(model) ILIKE LOWER($1))
            AND price >= $2 AND price <= $3
            AND year >= $4 AND year <= $5
            AND power >= $6 AND power <= $7
            `, ['%' + search + '%', priceRange[0], priceRange[1], yearRange[0], yearRange[1], powerRange[0], powerRange[1]]);
        for (let i = 0; i < result.rows.length; i++) {
            const id = result.rows[i].id;
            const dir = `./images/scooters/${id}`;
            const files = fs.readdirSync(dir);
            result.rows[i].images = [];
            for (let j = 0; j < files.length; j++) {
                result.rows[i].images.push(`http://localhost:5001/images/scooters/${id}/${files[j]}`);
            }
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/api/products/extremeValues', async (req, res) => {
    try {
        const attribute = req.query.attribute;
        var low = await pool.query(`SELECT ${attribute} FROM scooters ORDER BY ${attribute} ASC LIMIT 1`);
        var high = await pool.query(`SELECT ${attribute} FROM scooters ORDER BY ${attribute} DESC LIMIT 1`);
        low = Math.floor(parseFloat(low.rows[0][attribute]));
        high = Math.ceil(parseFloat(high.rows[0][attribute]));
        res.json([low, high]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/products', async (req, res) => {
    console.log('Adding scooter');
    try {
        console.log(req.body);
        // const { name, description, year, model, power, price } = req.body
        // const owner = req.session.userID;
        const result = await pool.query(
            'INSERT INTO scooters (name, description, year, model, power, price, owner) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [req.body.name, req.body.description, req.body.year, req.body.model, req.body.power, req.body.price, req.session.userID]
        );
        const id = result.rows[0].id;
        res.status(201).json({ 'id': id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/products/:id/images', async (req, res) => {
        const id = req.params.id;
        console.log('Adding images for scooter with id: ', id);

        // create folder for scooter images with respective id
        const dir = `./images/scooters/${id}`;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        // upload images sent via the request
        var scooterPicsStorage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, dir)
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname)
            }
        })
        var scooterPicsUpload = multer({ storage: scooterPicsStorage });

        scooterPicsUpload.array('scooter-pictures', 10)(req, res, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error');
            }
        });

        res.status(201).send('Scooter added');
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(404).send('User not found');
        } else {
            const user = result.rows[0];
            // console.log('User: ', user.name);
            // console.log('Password: ', user.password_hash);
            if (bcrypt.compareSync(password, user.password_hash)) {
                // res.cookie('authToken', user.id, { maxAge: 24 * 60 * 60, httpOnly: true });
                req.session.userID = user.id;
                req.session.authenticated = true;
                req.session.save((err) => {
                    if (err) {
                        return res.status(500).send('Failed to save session');
                    }
                    // console.log(req.session); // Should print the session with user_id
                    // res.redirect('/');
                });
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

app.get('/api/user', async (req, res) => {
    try {
        // console.log(req.session);
        return res.json({'authenticated': req.session.authenticated});
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
            // res.cookie('authToken', user.id, { maxAge: 24 * 60 * 60, httpOnly: true });
            req.session.user = user;
            req.session.authenticated = true;
            res.status(201).send(user);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/logout', async (req, res) => {
    req.session = null;
    res.clearCookie("connect.sid", {
        path: "/",
        sameSite: "none",
    }); // This line ensures the cookie is cleared
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
