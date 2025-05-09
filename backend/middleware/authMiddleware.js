const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Or directly query db if preferred

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object
      // We only need userId and isAdmin for most authorization checks from the token.
      // For full user details, the specific route handler can fetch if needed.
      req.user = { userId: decoded.userId, isAdmin: decoded.isAdmin }; 
      
      // Optional: Fetch full user from DB to ensure they still exist and are approved
      // This adds a DB query to every protected route request.
      // const currentUser = await User.findById(decoded.userId);
      // if (!currentUser || !currentUser.is_approved) {
      //   return res.status(401).json({ message: 'Not authorized, user not found or not approved' });
      // }
      // req.user = currentUser; // If fetching full user

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
