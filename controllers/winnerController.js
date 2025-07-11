const Winner = require('../models/winnerSchema');
const User = require('../models/User');
// Add a winner
const addWinner = async (req, res) => {
try {
    const { contestId, userId, score, rank, prizeAmount } = req.body;

    const exists = await Winner.findOne({ contestId, userId });
    if (exists) return res.status(400).json({ status: 0, msg: 'Winner already added' });

    // 1. Save winner
    const winner = new Winner({ contestId, userId, score, rank, prizeAmount });
    await winner.save();

    // 2. Add prize to user's wallet
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: 0, msg: 'User not found' });

    user.wallet = Number(user.wallet || 0) + Number(prizeAmount);
    await user.save();
    

    res.json({ status: 1, msg: 'Winner added and wallet updated', winner, newWalletBalance: user.wallet });

  } catch (err) {
    console.error('Add winner error:', err);
    res.status(500).json({ status: 0, msg: 'Server error' });
  }
};

// Get winners of a specific contest
const getWinnersByContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const winners = await Winner.find({ contestId }).populate('userId', 'name email').sort({ rank: 1 });
    res.json(winners);
  } catch (err) {
    console.error('Get winners error:', err);
    res.status(500).json({status:0, msg:'Server error' });
  }
};

// Get all winners
const getAllWinners = async (req, res) => {
  try {
    const winners = await Winner.find().populate('userId', 'name').populate('contestId', 'title').sort({ createdAt: -1 });
    res.json(winners);
  } catch (err) {
    console.error('All winners error:', err);
    res.status(500).json({ status:0, msg: 'Server error' });
  }
};

// Delete a winner
const deleteWinner = async (req, res) => {
  try {
    const { id } = req.params;
    await Winner.findByIdAndDelete(id);
    res.json({ status:1, msg: 'Winner deleted successfully' });
  } catch (err) {
    console.error('Delete winner error:', err);
    res.status(500).json({ status:0, msg: 'Server error' });
  }
};

module.exports={
addWinner,
getWinnersByContest,
getAllWinners,
deleteWinner
}