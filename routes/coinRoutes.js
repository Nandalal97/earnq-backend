// routes/coinRoutes.js (or include in existing routes)
const express = require('express');
const router = express.Router();
const { getUserTotalCoins } = require('../controllers/coinController');

router.get('/coins/:userId', getUserTotalCoins);

module.exports = router;
