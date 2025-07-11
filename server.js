require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const connectdb=require('./config/db')
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questionRoutes');
const cookieParser = require('cookie-parser');
const categoryRoutes = require('./routes/categoryRoutes');
const subject = require('./routes/subjectRoutes');
const videoRoute = require('./routes/getSignedVideo');
const userRoutes = require('./routes/userRoutes');
const subscription =require('./routes/subscriptionRoutes');
const payment =require('./routes/payment');
const referralWithdwal =require('./routes/referralRoute');
const contactRoutes = require('./routes/contactRoutes');
const contest=require('./routes/contestRoutes')
const quiz=require('./routes/quiz')
const userCoin=require('./routes/coinRoutes')

// admin route

const adminRoute=require('./routes/Admin/adminRoutes')

const app = express();
app.use(cookieParser());
connectdb();
// Basic security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://15.206.179.137/'],
  credentials: true
}));

app.use(express.json());
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: "Too many requests! Try again later.",
  },
});

app.use(limiter);

// Limit: Max 5 signup requests per 10 minutes per IP
const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit each IP to 5 requests per windowMs
  message: {
    msg: 'Too many signups. Try again later or switch to mobile data if on shared Wi-Fi.',
    status: 0,
  },
});

// Routes

app.get('/api/dashboard', (req, res) => {
  res.json({ msg: 'Welcome to your dashboard!', user: req.user });
});


app.use('/api/auth',signupLimiter, authRoutes);
app.use('/api/questions', questionRoutes)
app.use('/api', categoryRoutes);
app.use('/api/subjects', subject);
app.use('/api', videoRoute);
app.use('/api', userRoutes);
app.use('/api/payment', payment);
app.use('/api/subscription', subscription);
app.use('/api/referral', referralWithdwal);
app.use('/api/contacts', contactRoutes);
app.use('/api/contest', contest);
app.use('/api/quiz', quiz);
app.use('/api/user', userCoin);

// admin
app.use('/api/admin', adminRoute);


// Hide tech stack
app.disable('x-powered-by');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Secure API running on port ${PORT}`);
});