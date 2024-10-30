const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const secret = process.env.JWT_SECRET || 'secret';

router.post('/test', async (req, res) => {
    console.log("Hello")
});

// Register user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // User exists ?
        const existingUser = await req.pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).send('User already exists');
        }

        // Hash and save
        const hashedPassword = await bcrypt.hash(password, 10);
        await req.pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );

        res.status(201).send('User registered successfully');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userResult = await req.pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = userResult.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '2h' });
            res.json({ token });
        } else {
            res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;