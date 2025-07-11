const ReferralEarning = require('../../models/ReferralEarning');
const ReferralWithdrawal = require('../../models/ReferralWithdrawal');
const User = require("../../models/User");

const getReferralSummary = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Validate User
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // 2. Total referral earnings (credited)
        const totalEarningsAgg = await ReferralEarning.aggregate([
            { $match: { referrerId: user._id, status: 'credited' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalReferralEarnings = totalEarningsAgg[0]?.total || 0;

        // 3. Total withdrawn amount
        const totalWithdrawnAgg = await ReferralWithdrawal.aggregate([
            { $match: { userId: user._id, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawn = totalWithdrawnAgg[0]?.total || 0;

        // 4. Available balance (wallet)
        const availableToWithdraw = user.wallet;

        // 5. Withdrawal history (optional: sort by date)
        const withdrawalHistory = await ReferralWithdrawal.find({ userId: user._id })
            .sort({ requestedAt: -1 })
            .limit(10);

        // 6. Total referred users (who signed up using this user's referral)
        // 6. Total referred users (who signed up using this user's referral code)
        let totalReferrals = 0;
        if (user.referralCode) {
            totalReferrals = await User.countDocuments({ referredBy: user.referralCode });
        }

        // ✅ Send summary
        res.status(200).json({
            totalReferralEarnings,
            totalWithdrawn,
            availableToWithdraw,
            withdrawalHistory,
            totalReferrals,
            msg: "Referral summary fetched successfully"
        });

    } catch (err) {
        console.error("Referral summary error:", err.message);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

module.exports = { getReferralSummary }
