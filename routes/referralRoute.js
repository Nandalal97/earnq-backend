// routes/referral.js
const express = require('express');
const { validateUserWithdrawal } = require('../middleware/withdrawalValidation');
const { requestWithdrawal, updateWithdrawalStatus } = require('../controllers/referral/withdrawalController');
const { getReferralSummary } = require('../controllers/referral/getReferralSummary');

const router = express.Router();


router.post('/withdraw', validateUserWithdrawal, requestWithdrawal );
router.put('/appove', updateWithdrawalStatus );
router.get('/summary/:userId', getReferralSummary );

module.exports = router;
