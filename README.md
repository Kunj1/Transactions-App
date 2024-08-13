# Transaction Management App

This is a basic transaction management application built using Node.js, Express.js, and PostgreSQL. The application allows users to create accounts, perform credit and debit transactions, and view their transaction history.

## Features
- Create a user with an initial balance.
- Perform credit or debit transactions.
- View transaction history for a specific user.

## Prerequisites
- Node.js installed on your machine.
- PostgreSQL installed and configured on your machine or an external PostgreSQL service.
- `curl` or Postman for testing API endpoints.

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/transaction-app.git
cd transaction-app
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Create a .env File
In the root of your project directory, create a .env file to store your environment variables. Here is the format you should follow:
```bash
DB_URL=<your_database_url>
PORT=3000
```
Replace <your_database_url> with the full external database URL provided by your PostgreSQL service.

### 4. Setup PostgreSQL
Make sure PostgreSQL is installed on your system or accessible as a cloud service. You should create the necessary tables for users and transactions in your database. Here is an example of what the SQL schema might look like:
```bash
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    balance NUMERIC(10, 2) NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
### 5. Start the Application
```bash
npm start
```
The server should now be running on http://localhost:3000.
