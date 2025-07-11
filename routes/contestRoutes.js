// routes/Contest.js
const express = require('express');
const router = express.Router();

const { createContestQuestion, getContestQuestions, editContestQuestion, deleteContestQuestion } = require('../controllers/contestQuestions');
const { createContest, getAllContests, submitContest, getSubmitAnswer, deleteContest, updateContest, singleContest, getScoreboardByContestId, getUpcomingContestsSummary } = require('../controllers/contestController');
const verifyToken = require('../middleware/verifyToken');
const { contestBookingOrder, bookingVerify,bookContest, getUserBookingStatus, markAttempted, getContestStats, getContestBookings } = require('../controllers/contestBooking');
const { addWinner, getAllWinners, getWinnersByContest, deleteWinner } = require('../controllers/winnerController');

//contest
router.post('/create', createContest);
router.get('/all', getAllContests);
router.delete('/delete/:id', deleteContest);
router.put('/edit/:id', updateContest);
router.get('/single/:id', singleContest);

// create questions
router.post('/questions/create', createContestQuestion);
router.get('/questions/:contestId', getContestQuestions);
router.put('/questions/edit/:questionid', editContestQuestion);
router.delete('/questions/delete/:id', deleteContestQuestion);


// contest submit
router.post('/submit', submitContest)
router.get('/userContestData', getSubmitAnswer);
router.get('/scoreboard/:contestId', getScoreboardByContestId);

// booking payment
router.post('/new-booking', contestBookingOrder )
router.post('/booking-verify', bookingVerify )
router.post('/booking', bookContest );
router.get('/user-booking-status', getUserBookingStatus)
router.post('/update-attempt', markAttempted);
router.get('/stats', getContestStats);
router.get('/:id/bookings', getContestBookings);



// contest winners
router.post('/winner/add', addWinner);
// Get all winners
router.get('/winner/all', getAllWinners);
// Get winners by contest
router.get('/winner/:contestId', getWinnersByContest);
// Delete winner
router.delete('/winner/:id',deleteWinner);



// for admin dashbord

router.get('/admin/contests-summary', getUpcomingContestsSummary);
module.exports = router;
