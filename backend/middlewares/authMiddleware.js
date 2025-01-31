import jwt from "jsonwebtoken";
import { dbConnection } from "../utils/index.js";

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const connection = await dbConnection();

      const [rows] = await connection.execute(
        "SELECT email, isAdmin FROM users WHERE id = ?",
        [decodedToken.userId]
      );

      if (rows.length === 0) {
        return res
          .status(401)
          .json({ status: false, message: "User not found. Try login again." });
      }

      req.user = {
        email: rows[0].email,
        isAdmin: rows[0].isAdmin,
        userId: decodedToken.userId,
      };

      next();
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Not authorized. Try login again." });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ status: false, message: "Not authorized. Try login again." });
  }
};

const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      status: false,
      message: "Not authorized as admin. Try login as admin.",
    });
  }
};

export { isAdminRoute, protectRoute };
