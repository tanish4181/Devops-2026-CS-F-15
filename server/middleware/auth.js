export function requireUser(req, res, next) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  req.userId = userId;
  next();
}
