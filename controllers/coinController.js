const UserCoins = require('../models/UserCoins');
const PremiumCoins = require('../models/userPremiumCoin');

const getUserTotalCoins = async (req, res) => {
  const { userId } = req.params;
  try {
    // Get totalCoins from usercoins table
    const userCoin = await UserCoins.findOne({ userId });

    // Get totalPremiumCoins from premuimcoins table
    const premiumCoin = await PremiumCoins.findOne({ userId }).select('totalPremiumCoins');

    const totalUserCoins = (userCoin?.totalcoins || 0) + (premiumCoin?.totalPremiumCoins || 0);

    res.status(200).json({
      userId,
      quizCoins: userCoin?.totalcoins || 0,
      premiumCoins: premiumCoin?.totalPremiumCoins || 0,
      totalCoins: totalUserCoins
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { getUserTotalCoins };
