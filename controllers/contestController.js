// routes/Contest.js
const Contest = require('../models/ContestModel');
const ContestSubmission = require('../models/ContestSubmission');
const ContestQuestion = require('../models/ContestQuestionSchema');
const Booking = require('../models/ContestBooking');


const createContest = async (req, res) => {
    try {
        // Destructure safely from req.body
        // const { title,subtitle,entryFee, prizeAmount, duration, startDate, startClock, language} = req.body;
        const {
            title,
            subtitle,
            entryFee,
            prizeAmount,
            duration,
            startDate,     // '2025-06-30'
            startClock,    // '10:30'
            ampm,          // 'AM' or 'PM'
            language
        } = req.body;

        // Convert to 24-hour time format
        let [hours, minutes] = startClock.split(':').map(Number);
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        const startTime = new Date(`${startDate}T${formattedTime}:00`);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        // Create new exam group
        const newContest = new Contest({
            title,
            subtitle,
            entryFee,
            prizeAmount,
            duration,
            startTime,
            endTime,
            language
         
        });

        await newContest.save();

        res.status(201).json({ status: 1, msg: "Exam Group Create Successfull", Data: newContest });
    } catch (err) {
        console.error('Exam group creation failed:', err);
        res.status(500).json({ msg: 'Failed to create exam group', status: 0, error: err });
    }
};

const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ createdAt: -1 });

    // Loop through contests and count questions for each
    const results = await Promise.all(
      contests.map(async (contest) => {
        const questionCount = await ContestQuestion.countDocuments({ contestId: contest._id });
        return {
          ...contest._doc,
          totalQuestions: questionCount,
        };
      })
    );

    res.status(200).json({ status: 1, msg: "All Contest ", data: results });
  } catch (err) {
    console.error("Failed to fetch contests:", err);
    res.status(500).json({ error: "Failed to fetch exam groups" });
  }
};

// Update contest
const singleContest = async (req, res) => {
  const { id } = req.params;

  try {
    const singleContest = await Contest.findByIdAndUpdate(id);

    if (!singleContest) {
      return res.status(404).json({ success: false, msg: 'Contest not found' });
    }

    res.status(200).json({
      success: true,
      msg: 'Contest updated successfully',
      data: singleContest,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};
// Update contest
const updateContest = async (req, res) => {
  const { id } = req.params;
  const {
    title,
            subtitle,
            entryFee,
            prizeAmount,
            duration,
            startDate,     // '2025-06-30'
            startClock,    // '10:30'
            ampm,          // 'AM' or 'PM'
            language
  } = req.body;

  try {
    // Validate time parts
   let [hours, minutes] = startClock.split(':').map(Number);
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        const startTime = new Date(`${startDate}T${formattedTime}:00`);
        const endTime = new Date(startTime.getTime() + duration * 60000);


    // Update contest
    const updatedContest = await Contest.findByIdAndUpdate(id, {
        title,
            subtitle,
            entryFee,
            prizeAmount,
            duration,
            startTime,
            endTime,
            language
    }, { new: true });

    if (!updatedContest) {
      return res.status(404).json({ success: false, msg: 'Contest not found' });
    }

    res.status(200).json({
      success: true,
      msg: 'Contest updated successfully',
      data: updatedContest,
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

const deleteContest= async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }
    res.json({ success: true, message: 'Contest deleted successfully' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const submitContest = async (req, res) => {
  try {
    const {
      userId,
      contestId,
      totalAnswer,
      correct,
      wrong,
      skipped,
      score,
      answers
    } = req.body;

    const existing = await ContestSubmission.findOne({ userId, contestId });
    if (existing) {
      return res.status(400).json({ msg: 'You have already submitted this contest.' });
    }

    const submission = new ContestSubmission({
     userId,
      contestId,
      totalAnswer,
      correct,
      wrong,
      skipped,
      score,
      answers,
      isSubmit:true
    });

    await submission.save();

    res.json({ status: 1, msg: 'Submission saved successfully.', data: submission });
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).json({ status: 0, msg: 'Server error.' });
  }
};





const getSubmitAnswer = async (req, res) => {
const { contestId, userId } = req.query;

  if (!contestId || !userId) {
    return res.status(400).json({ success: false, message: 'contestId and userId are required' });
  }

  try {
    const submission = await ContestSubmission.findOne({ contestId, userId });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, data: submission });

  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get scoreboard by contestId
const getScoreboardByContestId = async (req, res) => {
  const { contestId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!contestId) {
    return res.status(400).json({ success: false, message: 'contestId is required' });
  }

  try {
    // Total submissions (for pagination)
    const total = await ContestSubmission.countDocuments({ contestId, isSubmit: true });

    // Paginated scoreboard
    const scoreboard = await ContestSubmission.find({ contestId, isSubmit: true })
      .populate('userId', 'first_name middle_name last_name phone_number email')
      .sort({ score: -1 })
      .skip(skip)
      .limit(limit);

    // Build result with full name and rank
    const result = scoreboard.map((entry, index) => {
      const user = entry.userId;
      const fullName = `${user?.first_name || ''} ${user?.middle_name || ''} ${user?.last_name || ''}`
        .replace(/\s+/g, ' ')
        .trim();

      return {
        rank: skip + index + 1, // Rank should be global, not page-local
        name: fullName,
        phone: user?.phone_number || '',
        email: user?.email || '',
        score: entry.score,
        correct: entry.correct,
        wrong: entry.wrong,
        skipped: entry.skipped,
        totalAnswered: entry.totalAnswer,
        userId: user?._id || null,
      };
    });

    res.status(200).json({ success: true, data: result, total });

  } catch (error) {
    console.error('Scoreboard fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



// for admin dashbord
const getUpcomingContestsSummary = async (req, res) => {
  try {
    const now = new Date();

    // Fetch next 5 contests sorted by startTime
    const contests = await Contest.find({ status: 'active' }) // only active contests
      .sort({ startTime: 1 })
      .limit(10)
      .select('title startTime endTime duration');

    // Filter out invalid contests with missing/invalid dates
    const validContests = contests.filter(contest => {
      return contest.startTime && contest.endTime && !isNaN(new Date(contest.startTime)) && !isNaN(new Date(contest.endTime));
    });

    // Get bookings for these contests
    const contestIds = validContests.map(c => c._id);
    const bookings = await Booking.aggregate([
      { $match: { contestId: { $in: contestIds } } },
      { $group: { _id: "$contestId", totalBookings: { $sum: 1 } } }
    ]);

    const bookingsMap = {};
    bookings.forEach(b => {
      bookingsMap[b._id.toString()] = b.totalBookings;
    });

    // Final response formatting
    const data = validContests.map(contest => {
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      let status = "Upcoming";
      if (now >= start && now <= end) status = "Running";
      else if (now > end) status = "Completed";

      return {
        id: contest._id,
        title: contest.title,
        startTime: contest.startTime,
        duration:contest.duration,
        totalBookings: bookingsMap[contest._id.toString()] || 0,
        status,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error fetching upcoming contests:", err.message);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};


module.exports = { 
  createContest,
  singleContest,
  updateContest, 
  deleteContest, 
  getAllContests, 
  submitContest, 
  getSubmitAnswer, 
  getScoreboardByContestId,
  getUpcomingContestsSummary
}
