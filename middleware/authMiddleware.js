const jwt = require('jsonwebtoken');

const verifyAuth = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ msg: 'Unauthorized: No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Pass user info to next handler
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.clearCookie('authToken', { path: '/' });
    return res.status(403).json({ msg: 'Invalid or tampered token' });
  }
};

module.exports = verifyAuth;
