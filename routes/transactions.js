const express = require('express');
const router = express.Router();
const pool = require('../db/config.js');

// Create a new user
router.post('/users', async (req, res) => {
    const { name, initialBalance } = req.body;

    // Input validation
    if (!name || typeof initialBalance !== 'number' || initialBalance < 0) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO users (name, balance) VALUES ($1, $2) RETURNING id, name, balance',
            [name, initialBalance]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'An error occurred while creating the user' });
    }
});

// Create a transaction
router.post('/', async (req, res) => {
    const { userId, amount, type } = req.body;

    // Input validation
    if (!userId || !amount || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }
    if (type !== 'credit' && type !== 'debit') {
        return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if user exists and get current balance
        const userResult = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const currentBalance = parseFloat(userResult.rows[0].balance);
        const numericAmount = parseFloat(amount);
        let newBalance;

        // Update balance based on transaction type
        if (type === 'credit') {
            newBalance = currentBalance + numericAmount;
        } else {
            if (currentBalance < amount) {
                throw new Error('Insufficient balance');
            }
            newBalance = currentBalance - numericAmount;
        }

        newBalance = Math.round(newBalance * 100) / 100;

        // Update user balance and insert transaction record
        await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);
        const transactionResult = await client.query(
            'INSERT INTO transactions (user_id, amount, type) VALUES ($1, $2, $3) RETURNING id, created_at',
            [userId, amount, type]
        );

        await client.query('COMMIT');
        res.status(200).json({
            message: 'Transaction successful',
            transactionId: transactionResult.rows[0].id,
            timestamp: transactionResult.rows[0].created_at,
            newBalance
        });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.message === 'User not found' || error.message === 'Insufficient balance') {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Transaction error:', error);
            res.status(500).json({ error: 'An error occurred while processing the transaction' });
        }
    } finally {
        client.release();
    }
});

// Get transaction history for a user
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ error: 'An error occurred while fetching transaction history' });
    }
});

module.exports = router;