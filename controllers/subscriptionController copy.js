// ✅ UPDATED BACKEND CODE FOR CASHFREE CONFIRMATION AND SUBSCRIPTION ENTRY
const Payment = require('../models/Payment');
const UserSubscription = require('../models/UserSubscription');
const User = require('../models/User');
const { handleReferralCommission } = require('../controllers/referral/referralController');

const handleSubscription = async (req, res) => {
  const {
    userId,
    planCode,
    billingCycle,
    transactionId,
    basePrice,
    discounts,
    payAmount,
    paymentMethod,
    paymentStatus // 'success', 'failed', 'pending'
  } = req.body;

  try {
    const existUser = await User.findById(userId);
    if (!existUser) return res.status(404).json({ msg: 'User not found' });

    // Check for duplicate transaction
    const existingTransaction = await Payment.findOne({ transactionId });
    if (existingTransaction) {
      return res.status(400).json({ msg: 'Duplicate transaction.', status: 0 });
    }

    // Save payment
    const payment = new Payment({
      userId,
      transactionId,
      basePrice,
      discounts,
      payAmount,
      paymentMethod,
      paymentStatus
    });
    await payment.save();

    // Handle failed or pending
    if (paymentStatus === 'failed') {
      return res.status(400).json({success: true,status:1, msg: 'Payment failed.', payment });
    }
    if (paymentStatus === 'pending') {
      return res.status(202).json({ msg: 'Payment pending. Will update after confirmation.', payment });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (billingCycle === 'Monthly') endDate.setMonth(endDate.getMonth() + 1);
    else if (billingCycle === 'Half-Yearly') endDate.setMonth(endDate.getMonth() + 6);
    else if (billingCycle === 'Yearly') endDate.setFullYear(endDate.getFullYear() + 1);
    else return res.status(400).json({ error: 'Invalid billing cycle' });

    // Update user
    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumExpiry: endDate
    });

  if (!existUser.hasPurchased) {
  await handleReferralCommission(existUser._id, payAmount);
  existUser.hasPurchased = true;
  await existUser.save(); // ✅ Now it will persist
}

    // Deactivate previous subscription
    const current = await UserSubscription.findOne({ userId, isActive: true });
    if (current) {
      current.isActive = false;
      await current.save();
    }

    // Save new subscription
    const subscription = new UserSubscription({
      userId,
      planCode,
      billingCycle,
      startDate,
      endDate,
      transactionId,
      basePrice,
      discounts,
      payAmount,
      isActive: true
    });
    await subscription.save();

    // Send success response
    res.status(201).json({
      msg: 'Subscription successful',
      payment,
      subscription,
      existUser
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error', msg: err.message });
  }
};

module.exports = { handleSubscription };
