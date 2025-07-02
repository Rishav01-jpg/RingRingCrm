const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from headers or query (for CSV export etc.)
  const authHeader = req.headers.authorization || req.query.token;

  if (authHeader) {
    // Handle both "Bearer token" and raw token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Decoded JWT:", decoded);

      // Support both formats: { user: { id } } or just { id }
      req.user = decoded.user || decoded;

      console.log("✅ authMiddleware req.user:", req.user);
      next();
    } catch (err) {
      console.error("❌ Token verification failed:", err.message);
      return res.status(401).json({ message: "Invalid Token" });
    }
  } else {
    return res.status(401).json({ message: "No Token Found" });
  }
};

module.exports = authMiddleware;
