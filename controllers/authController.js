const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require('../models/User')
const disposableDomains = require('disposable-email-domains');
const verifyRecaptcha = require('../utils/verifyRecaptcha');

const sendEmail = require('../utils/sendEmail');

const disableDomains = [
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'temp-mail.org',
  'tempmail.net',
  'maildrop.cc',
  'dispostable.com',
  'getnada.com',
  'mintemail.com',
  'mailnesia.com',
  'anonymbox.com',
  'moakt.com',
  'spamgourmet.com',
  'spam4.me',
  'throwawaymail.com',
  'tempinbox.com',
  'fakeinbox.com',
  'spamdecoy.net',
  'sharklasers.com',
  'mailcatch.com',
  'emailondeck.com',
  'fakemailgenerator.com',
  'mail-temp.com',
  'disposablemail.com',
  'mytemp.email',
  'tempail.com',
  'trashmail.net',
  'ihnpo.com',
  'spambox.us',
  'nespf.com',
  'wegwerfemail.de',
  'mail-temporaire.fr',
  'mailtothis.com',
  'tempmailaddress.com',
  'emailtemporanea.com',
  'mailexpire.com',
  'tempemail.co',
  'trashmail.me',
  'yepmail.net',
  'getairmail.com',
  'guerrillamailblock.com',
  'mailcatcher.me',
  'temp-mail.io',
  'meltmail.com',
  'tempmailbox.com',
  'mail-temporaire.com',
  'tempomail.fr',
  'tempinbox.xyz',
  'jetable.org',
  'spam4.me',
  'easytrashmail.com',
  'spamherelots.com',
  'incognitomail.org',
  'getmailspring.com',
  'trashmail.ws',
  'tempemail.net',
  'tempomail.net',
  'mail-temp.com',
  'throwawayemailaddress.com',
  'mytrashmail.com',
  'trash-mail.com',
  'tempmail.org',
  'mytempemail.com',
  'temp-mail.com',
  'fakeinbox.xyz',
  'spambog.com',
  'binkmail.com',
  'disposable-email.org',
  'mvrht.com',
  'tempail.net',
  'tempmailbox.xyz',
  'mailforspam.com',
  'tempemail.xyz',
  'mailtemp.net',
  'spamfree24.org',
  'temp-mail.de',
  'burnermail.io',
  'throwawayemail.net',
  'tempemailbox.com',
  'spamdecoy.com',
  'trashmail.me',
  'temp-mail.ru',
  'spambox.xyz',
  'guerrillamail.net',
  'temp-mail.io',
];

function getEmailDomain(email) {
  return email.split('@')[1].toLowerCase().trim();
}

const register = async (req, res) => {
  try {
    const { first_name, middle_name, last_name, phone_number, email, dob, gender, address, pin_code,
      state, language, password, deviceId, referredBy, referralCode} = req.body;

    const ip = req.ip;

    //  const isHuman = await verifyRecaptcha(recaptchaToken);
    //   if (!isHuman) {
    //     return res.status(400).json({ msg: 'reCAPTCHA failed. Please try again.', status: 0 });
    //   }
    // check email fake or right
    const domain = getEmailDomain(email);
    if (disposableDomains.includes(domain)) {
      return res.status(400).json({ msg: 'Email not allowed. Please use a valid email.', status: 0 });
    }

    // Check in custom disposable domain list
    if (disableDomains.includes(domain)) {
      return res.status(400).json({
        msg: 'Email not allowed. Please use a valid email.',
        status: 0,
      });
    }

    // Check device ID
    //   const existingDevice = await User.countDocuments({ deviceId });
    // if (existingDevice >=3) {
    //   return res.status(400).json({ msg: 'Too many suspicious attempts detected.', status: 0});
    // }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(409).json({ msg: "User already exists", status: 0 });
    }

    const existPhone = await User.findOne({ phone_number });
    if (existPhone) {
      return res.status(409).json({ msg: "User already exists", status: 0 });
    }

    // create refer code 
    function generateUniqueCode() {
      const randomPart = Math.random().toString(36).substring(2, 8); // 6 chars
      const timePart = Date.now().toString(36).slice(-6); // 6 chars
      return (randomPart + timePart).toLowerCase(); // total 12
    }

    const NeweferralCode = generateUniqueCode();
   console.log("Full req.body:", req.body);


    const referrer = await User.findOne({ referralCode: referredBy });
if (!referrer) {
  return res.status(400).json({ msg: "Invalid referral code" });
}

const signUpBonas=100

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      first_name,
      middle_name,
      last_name,
      phone_number,
      email,
      dob,
      gender,
      address,
      pin_code,
      state,
      language,
      password: hashPassword,
      deviceId,
      referredBy,
      referralCode: NeweferralCode,
      wallet:signUpBonas
    });
    await newUser.save();

    const verificationToken = JWT.sign(
      { userId: newUser._id, email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const link = `https://yourfrontend.com/verify-email?token=${verificationToken}`;
    const html = `<p>Click below to verify your email:</p><a href="${link}">Verify Email</a>`;

    await sendEmail(email, "Verify your Email", html);

    return res.status(201).json({
      msg: "Registration successful! Please check your email and verify your account.",
      status: 1,
      ip: ip,
      token: verificationToken
    });

  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ msg: "Signup failed", status: 0 });
  }
};


const resendVerificationEmail = async (req, res) => {

  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found', status: 0 });
    }
    if (user.verified) {
      return res.status(400).json({ msg: 'Email already verified', status: 0 });
    }

    // Generate email verification token
    const verificationToken = JWT.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const link = `https://yourfrontend.com/verify-email?token=${verificationToken}`;

    // Send verification email
    const html = `<p>Click below to verify your email:</p><a href="${link}">Verify Email</a>`;
    await sendEmail(email, "Verify your Email", html);

    return res.status(200).json({ msg: 'Verification email resent', status: 1, token: verificationToken });

  } catch (error) {
    console.error('Resend Email Error:', error.message);
    return res.status(500).json({ msg: 'Failed to resend email', status: 0 });
  }
};


const login = async (req, res) => {
  try {

    const { email, password } = req.body;
    const findUser = await User.findOne({ email });

    // Check if user exists
    if (!findUser) {
      return res.status(409).json({ msg: "Invalid credentials", status: 0 });
    }

    // Compare password
    const isMatchPassword = await bcrypt.compare(password, findUser.password);
    if (!isMatchPassword) {
      return res.status(401).json({ msg: "Invalid credentials", status: 0 });
    }

    // Check if already logged in
    if (findUser.isLogin) {
      return res.status(403).json({
        msg: 'You are already logged in on another device.',
        status: 2
      });
    }

    // Check if email is verified
    if (!findUser.verified) {
      return res.status(403).json({ msg: "Please verify your email before logging in.", status: 0 });
    }

    // Mark user as logged in
    findUser.isLogin = true;
    findUser.lastLogin = new Date();
    await findUser.save();

    // Generate JWT token
    const token = JWT.sign(
      {
        id: findUser._id,
        firstName: findUser.first_name,
        middleName: findUser.middle_name,
        lastName: findUser.last_name,
        gender: findUser.gender,
        email: findUser.email,
        phone: findUser.phone_number,
        lang: findUser.lang,
        state: findUser.state,
        isLogin: findUser.isLogin,
        isPremium: findUser.isPremium,
        premiumExpiry: findUser.premiumExpiry,
        referredBy: findUser.referredBy,
        referralCode: findUser.referralCode,
        wallet: findUser.wallet,
        lastLogin: findUser.lastLogin,
        gender: findUser.gender,
        dob: findUser.dob,
        address: findUser.address,
        pinCode: findUser.pin_code,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // for production
    //     res.cookie('authToken', token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'Lax',
    //   maxAge: 24 * 60 * 60 * 1000 ,// 24 hours
    //    path: '/', 
    // });

    // for testing
    res.cookie('authToken', token, {
      httpOnly: false,
      secure: false, // ✅ use true only with HTTPS in production
      sameSite: 'Lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    findUser.password = undefined;
    return res.status(200).json({
      msg: "Login successful",
      status: 1,
      access_token: token,
      user: findUser,
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ msg: "Login failed", status: 0 });
  }
}

// Logout Controller
// const logout = async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     await User.findByIdAndUpdate(userId, { deviceId: null });
//     return res.json({ msg: 'Logged out successfully', status: 1 });
//   } catch (error) {
//     console.error('Logout Error:', error);
//     return res.status(500).json({ msg: 'Server error', status: 0 });
//   }
// };

const logout = async (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(400).json({ msg: 'No token found' });
  }
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isLogin: false });
    res.clearCookie('authToken', { path: '/' });
    return res.json({ msg: 'Logout successful' });
  } catch (err) {
    return res.status(403).json({ msg: 'Invalid token' });
  }
};

const logoutAllDevices = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Email is required', status: 0 });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'User not found', status: 0 });
    }

    user.isLogin = false;
    await user.save();

    // Optional: clear sessions or tokens if stored separately
    return res.json({ msg: 'Logged out from all devices', status: 1 });

  } catch (err) {
    console.error('Logout all error:', err);
    return res.status(500).json({ msg: 'Server error', status: 0 });
  }
};

module.exports = {
  register,
  login,
  logout,
  resendVerificationEmail,
  logoutAllDevices
};
