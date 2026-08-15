import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) { // Middleware that protects routes so only logged-in users with a valid token can use them.
  const authHeader = req.headers.authorization; // Reads the Authorization header sent from the frontend request.

  if (!authHeader) { // If the frontend did not send an Authorization header, stop the request here.
    return res.status(401).json({
      message: "Authorization header missing."
    });
  }

  const token = authHeader.split(" ")[1]; // Takes "Bearer theTokenHere" and keeps only the actual token part.

  if (!token) { // If the header existed but did not contain a token, stop the request.
    return res.status(401).json({
      message: "Token missing."
    });
  }

  try { // Try to verify the token. If it fails, the catch block will run.
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Checks that the token is real, not changed, and not expired.

    req.userId = decoded.userId; // Saves the decoded logged-in user's ID onto req so the next route can use it.

    next(); // Allows the protected route to continue running.
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired login"
    });
  }
}
