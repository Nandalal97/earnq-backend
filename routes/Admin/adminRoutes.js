const express = require('express');
const router = express.Router();

const { checkRole, verifyAdminToken } = require('../../middleware/verifyAdmin');
const { registerAdmin, loginAdmin } = require('../../controllers/admin/adminAuthController');
const {  getAdminStats } = require('../../controllers/admin/getAdminStats');
const { getLatestUsers, getUserGenderStats, getMonthlyUserStats, getStateWiseUserStats } = require('../../controllers/userController');
const { getLatestContactsForDashboard } = require('../../controllers/contactController');
const { getAllWithdrawals } = require('../../controllers/referral/withdrawalController');
const { userSummary } = require('../../controllers/admin/userSummary');


// Public
router.post('/login', loginAdmin);

// Protected (Only Superadmin can register new admins)
router.post('/register', verifyAdminToken, checkRole('superadmin'), registerAdmin);

router.get('/user-summary/:userId', userSummary);




router.get('/stats-overview', getAdminStats);
router.get('/latest-users', getLatestUsers);
router.get('/latest-contacts', getLatestContactsForDashboard);
router.get('/gender-stats', getUserGenderStats);
router.get('/monthly-user-stats', getMonthlyUserStats);
router.get('/user-state-stats', getStateWiseUserStats);

router.get('/withdrawals', getAllWithdrawals);




module.exports = router;
