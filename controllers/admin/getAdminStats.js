const User = require('../../models/User');
const Question = require('../../models/Question');
const Contest = require('../../models/ContestModel');
const Booking = require('../../models/ContestBooking');
const Contact = require('../../models/contactModel');
const Payment = require('../../models/Payment');

const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      premiumUsers,
      last7DaysUsers,
      todayUsers,
      totalQuestions,
      totalContests,
      totalBookings,
      totalContacts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPremium: true }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: today } }),
      Question.countDocuments(),
      Contest.countDocuments(),
      Booking.countDocuments(),
      Contact.countDocuments()
    ]);

    let totalRevenue = 0;
    try {
      const payments = await Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      totalRevenue = payments[0]?.total || 0;
    } catch (err) {
      console.error('Payment aggregation failed:', err.message);
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        premiumUsers,
        last7DaysUsers,
        todayUsers, // 🔥 New today user count
        totalQuestions,
        totalContests,
        totalBookings,
        totalContacts,
        totalRevenue
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = { getAdminStats };
