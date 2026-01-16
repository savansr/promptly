const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const promptRoutes = require('./routes/prompts');
const {connectRedis} = require('./redis/redis.client');
const {authMiddleWare}=require('./middleware/authenticate.js');


dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['chrome-extension://*',"*"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect( 'mongodb://localhost:27017/promptly')
  .then(() => {
    console.log('Connected to MongoDB');
    connectRedis();
    console.log('Connected to Redis');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use(authMiddleWare);
app.use('/auth', authRoutes);
app.use('/prompts', promptRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
}); 


