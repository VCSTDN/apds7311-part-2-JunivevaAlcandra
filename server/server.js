// Import required libraries
require('dotenv').config();
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const express = require('express');
const ExpressBrute = require('express-brute');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing and salting
const bodyParser = require('body-parser');  // Import body-parser to handle POST data
const mongoose = require('mongoose');
const User = require('./models/user.model')
var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store);
const Transaction = require('./models/transaction.model')
const app = express();
app.use(helmet());
// Connect to MongoDB using mongoose
mongoose.connect('mongodb+srv://timepiececoders:TimePiece2024@backenddb.grrqn.mongodb.net/APP-API?retryWrites=true&w=majority&appName=BackendDB')
  .then(() => console.log('Connected to database!'))
  .catch(() => console.log('Connection failed!'));

// Middleware to parse request body (important for handling POST data)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Authentication Middleware: Protect routes based on user roles (e.g., customer, employee)
const authMiddleware = (roles = []) => (req, res, next) => {
  const token = req.header('Authorization'); // Retrieve the token from Authorization header
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' }); // If no token is provided

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using secret key
    if (!roles.includes(decoded.role)) return res.status(403).json({ msg: 'Access denied' }); // Check if the role is authorized

    req.user = decoded; // Attach the user object to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ msg: 'Invalid token' }); // If the token is invalid
  }
};

// Read your SSL certificates
const options = {
  key: fs.readFileSync('keys/privatekey.pem'),
  cert: fs.readFileSync('keys/certificate.pem')
};

// Add middleware to redirect HTTP to HTTPS (Optional for better security)
app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Welcome to the IntlPaymentsApp server!');
});

// Define register route with RegEx-based whitelisting
app.post('/register',bruteforce.prevent, async (req, res) => {
  const {fullname, idNum, accountNum, username, email,password } = req.body;

  // Define RegEx patterns for whitelisting
  const idPattern = /^\d{6}\d{4}[0-1]\d{2}$/; // Valid South African ID number format
  const accountPattern = /^\d{6,11}$/; // Account number pattern between 6-11 digits
  const usernamePattern = /^[a-zA-Z0-9]+$/;  // Allow only alphanumeric characters
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  // Basic email format

  const bodyParser = require('body-parser');

// Middleware to parse request bodies (important for handling POST data)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

  //This is to check if the full name is provided
  if(!fullname){
    return res.status(400).send("Full Name is required.");
  }

  // Validate id number
  if (!idPattern.test(idNum)) {
    return res.status(400).send("Invalid ID number.");
  }

  // Validate account number
  if (!accountPattern.test(accountNum)) {
    return res.status(400).send("Invalid Account Number.");
  }

  // Validate username
  if (!usernamePattern.test(username)) {
    return res.status(400).send("Invalid username: Only alphanumeric characters are allowed.");
  }

  // Validate email
  if (!emailPattern.test(email)) {
    return res.status(400).send("Invalid email format.");
  }

  //This is to check if the password is provided
  if(!password){
    return res.status(400).send("Password is required.");
  }

  // If all validations pass, proceed to the password hashing and user creation process
  try {
    //Increased security by using 12 factors
    const saltFactors = 12;
    //Hash the plain text password with bcrypt
    const hashedPassword = await bcrypt.hash(password, saltFactors);

    // Create a new user object 
    const newUser = {
      fullname,
      idNum,
      accountNum,
      username,
      email,
      password: hashedPassword, // Store hashed password
      role: 'customer'
    };

    // Store the new user 
    await User.create(newUser);

    // Send a successful message to the client
    return res.status(201).send('The user registration was successful, and the password was securely hashed.');
  } catch (error) {
    // Catch any errors during the registration process
    console.error('Registration error encountered:', error.message);
    // Ensure that only one response is sent to the client
    return res.status(500).send('An error occurred during the registration process. Please try again later.');
  }
});

// Login user
app.post('/login',bruteforce.prevent, async (req, res) => {
  const {username, accountNumber, password } = req.body;

  if (!username || !accountNumber || !password) {
    return res.status(400).json({ message: "All fields must be filled" });
  }

  try {
    
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid username' });

     if (user.accountNum !== accountNumber) {
      return res.status(400).json({ msg: 'Invalid account number' });
    }
    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password); // Use hashedPassword here
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    //const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(process.env.JWT_SECRET); // Check if the secret is being loaded

    const accessToken = jwt.sign(
      { id: user._id, role: user.role }, // Include only necessary fields
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Optional: set token expiration
    );
    
    // Send the token as the response
    res.json({ accessToken: accessToken });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new payment (Customer only)
app.post('/create', authMiddleware(['customer']), async (req, res) => {
  const { amount, currency, destinationAccount, swiftCode } = req.body;
  try {
    const transaction = new Transaction({
      customerId: req.user.id,
      amount,
      currency,
      destinationAccount,
      swiftCode
    });

    await transaction.save();
    res.status(201).json({ msg: 'Transaction created' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/pending', authMiddleware(['employee']), async (req, res) => {
  try {
    // Fetch transactions where status is 'pending'
    const pendingTransactions = await Transaction.find({ status: 'pending' });

    if (pendingTransactions.length === 0) {
      return res.status(404).json({ msg: 'No pending transactions found' });
    }

    // Respond with the list of pending transactions
    res.status(200).json({ transactions: pendingTransactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Verify payment (Employee only)
app.post('/verify/:id', authMiddleware(['employee']), async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    transaction.status = 'verified';
    await transaction.save();

    res.json({ msg: 'Transaction verified' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

//Create HTTPS server
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

//HTTP server that redirects to HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80, () => {
  console.log('HTTP server listening on port 80, redirecting to HTTPS');
});