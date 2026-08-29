export function requireUser(req, res, next) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    req.userId = "dev-user";
    return next();
  }

  req.userId = userId;
  next();
}
