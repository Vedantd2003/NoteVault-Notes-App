import jwt from 'jsonwebtoken';

/**
 * Express middleware — verifies the JWT Bearer token in the Authorization header.
 * On success, attaches decoded payload { userId, email } to req.user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { userId, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired — please log in again' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}
