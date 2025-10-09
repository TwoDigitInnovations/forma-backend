/* eslint-disable no-unused-vars */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('@config/db');

require('dotenv').config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));


const routes = require('./routes');
routes(app);


app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use((err, req, res, _next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

module.exports = app;
