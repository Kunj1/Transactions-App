const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const transactionRouter = require('./routes/transactions.js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/transactions', transactionRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});