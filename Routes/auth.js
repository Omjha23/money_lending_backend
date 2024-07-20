const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware for JWT authentication
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route POST /signup
// @desc Register user
router.post('/signup', async (req, res) => {
    const { phone, email, name, dob, monthlySalary, password } = req.body;

    try {
        // Validate user age and salary
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        if (age < 20) return res.status(400).json({ msg: 'User must be above 20 years of age' });
        if (monthlySalary < 25000) return res.status(400).json({ msg: 'Monthly salary must be 25k or more' });

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            phone,
            email,
            name,
            dob,
            monthlySalary,
            password: hashedPassword,
            status: 'approved',
            purchasePower: monthlySalary * 2 // Example calculation
        });

        await user.save();
        res.json({ msg: 'User registered successfully'
         });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route POST /login
// @desc Authenticate user and get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route GET /user
// @desc Get user data
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route POST /borrow
// @desc Borrow money
router.post('/borrow', auth, async (req, res) => {
    const { amount } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Calculate new purchase power
        const newPurchasePower = user.purchasePower - amount;

        if (newPurchasePower < 0) return res.status(400).json({ msg: 'Insufficient purchase power' });

        user.purchasePower = newPurchasePower;

        // Calculate monthly repayment
        const interestRate = 0.08;
        const tenure = 12; // Example tenure
        const monthlyRepayment = (amount * (1 + interestRate)) / tenure;

        await user.save();
        res.json({ purchasePower: newPurchasePower, monthlyRepayment });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
