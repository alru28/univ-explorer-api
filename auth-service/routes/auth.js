const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// DB Initialization
let db;

// Register user
router.post('/register', async (req, res) => {
    // ADD CONDITIONS TO CHECK IF IS REGISTERED
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = { username, password: hashedPassword };
    // INSERT USER INTO DB

    res.status(201).send('User registered successfully');
});

// Login user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = 0; // FIND USER IN DB

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username: user.username }, 'secret');
        res.json({ token });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

module.exports = router;