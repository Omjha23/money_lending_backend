const express = require('express');
const connectDB = require('./Config/database');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Init Middleware
app.use(bodyParser.json());

// Define routes
app.use('/api', require('./Routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
