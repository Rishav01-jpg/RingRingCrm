const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decoded); // <== Add this line
      req.user = decoded.user;
      console.log("authMiddleware req.user:", req.user);
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }
  } else {
    return res.status(401).json({ message: "No Token Found" });
  }
};

module.exports = authMiddleware;
