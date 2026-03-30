function loginController(req, res, next) {
  try {
    const { role, name, email } = req.body || {};
    const safeRole = String(role || "").trim().toLowerCase();
    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim().toLowerCase();

    if (!["client", "admin"].includes(safeRole)) {
      const error = new Error("role must be either client or admin");
      error.statusCode = 400;
      throw error;
    }

    if (!safeName) {
      const error = new Error("name is required");
      error.statusCode = 400;
      throw error;
    }

    if (safeRole === "client" && !safeEmail) {
      const error = new Error("email is required for client login");
      error.statusCode = 400;
      throw error;
    }

    if (safeEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(safeEmail)) {
        const error = new Error("email must be valid");
        error.statusCode = 400;
        throw error;
      }
    }

    res.json({
      session: {
        role: safeRole,
        name: safeName,
        email: safeEmail,
        loggedInAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  loginController
};
