import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const authMiddleware = (req, res, next) => {
  // Grab token from the authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is provided, return an error
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized. No token provided.",
    });
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Save user info in the request

    next(); // Continue to the next middleware or route
  } catch (error) {
    return res.status(403).json({
      message: "Forbidden - Invalid or expired token",
    });
  }
};

export default authMiddleware;
